
// ============================================
// MITM CLUB
// Doctor Appointment Booking & Slot Manager
// AngularJS + Supabase
// ============================================

var app = angular.module("doctorApp", []);

app.controller("MainController", function ($scope) {

    // SUPABASE CONFIGURATION
    var SUPABASE_URL = "https://wpnukcrlqcyikhririur.supabase.co";
    var SUPABASE_KEY = "sb_publishable_JGHdmK0ljnk72aRAzhxdrQ_TwlRLMzK";

    var supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    // APPLICATION VARIABLES
    $scope.page = "home";
    $scope.user = null;

    $scope.doctors = [];
    $scope.featuredDoctors = [];
    $scope.appointments = [];

    $scope.specialties = [];
    $scope.selectedDoctor = null;

    $scope.searchText = "";
    $scope.selectedSpecialty = "";

    $scope.message = "";
    $scope.messageType = "";

    $scope.saving = false;
    $scope.authLoading = false;
    $scope.loadingAppointments = false;

    $scope.authVisible = false;
    $scope.authMode = "login";

    $scope.auth = {
        email: "",
        password: ""
    };

    $scope.booking = {
        patientName: "",
        phone: "",
        date: null,
        time: "",
        reason: ""
    };

    // NAVIGATION
    $scope.goTo = function (page) {

        $scope.page = page;
        window.scrollTo(0, 0);

        if (page === "doctors") {
            $scope.loadDoctors();
        }

        if (page === "appointments" && $scope.user) {
            $scope.loadAppointments();
        }

    };

    // DATE
    function localDateString(date) {

        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }

    function formatDate(date) {

        if (!date) return "";

        return localDateString(new Date(date));
    }

    $scope.minDate = localDateString(new Date());

    // TIME SLOTS
    $scope.timeSlots = [
        "09:00", "09:30",
        "10:00", "10:30",
        "11:00", "11:30",
        "12:00", "12:30",
        "14:00", "14:30",
        "15:00", "15:30",
        "16:00", "16:30",
        "17:00"
    ];

    // NOTIFICATIONS
    function showMessage(message, type) {

        $scope.$applyAsync(function () {
            $scope.message = message;
            $scope.messageType = type;
        });

    }

    $scope.clearMessage = function () {
        $scope.message = "";
    };

    function errorText(error) {

        if (!error) return "Something went wrong.";

        if (error.code === "23505") {
            return "This appointment slot has already been booked.";
        }

        if (error.message &&
            error.message.toLowerCase().includes("daily limit")) {
            return "This doctor has reached the daily limit of 20 appointments.";
        }

        return error.message || "Please try again.";
    }

    // LOAD ALL DOCTORS
    $scope.loadDoctors = async function () {
    try {
        const { data, error } = await supabaseClient
            .from("doctors")
            .select("*")
            .eq("available", true)
            .order("id");

        if (error) {
            console.error("Supabase Error:", error);
            alert(error.message);
            return;
        }

        $scope.$applyAsync(function () {
            $scope.doctors = data || [];
        });

        console.log("Doctors loaded:", data);

    } catch (error) {
        console.error(error);
        alert("Unable to load doctors: " + error.message);
    }
};

    // LOAD ONLY FOUR FEATURED DOCTORS
    $scope.loadFeaturedDoctors = async function () {

        try {

            var result = await supabaseClient
                .from("doctors")
                .select("*")
                .eq("available", true)
                .order("name", { ascending: true })
                .limit(4);

            if (result.error) throw result.error;

            $scope.$applyAsync(function () {
                $scope.featuredDoctors = result.data || [];
            });

        } catch (error) {

            showMessage(errorText(error), "error");

        }

    };

    // DOCTOR SEARCH AND FILTER
    $scope.filteredDoctors = function () {

        var search = ($scope.searchText || "").toLowerCase();

        return $scope.doctors.filter(function (doctor) {

            var matchesSearch =
                !search ||
                (doctor.name || "").toLowerCase().includes(search) ||
                (doctor.specialty || "").toLowerCase().includes(search);

            var matchesSpecialty =
                !$scope.selectedSpecialty ||
                doctor.specialty === $scope.selectedSpecialty;

            return matchesSearch && matchesSpecialty;

        });

    };

    // SELECT DOCTOR
    $scope.chooseDoctor = function (doctor) {

        $scope.selectedDoctor = doctor;

        $scope.booking = {
            patientName: "",
            phone: "",
            date: null,
            time: "",
            reason: ""
        };

        $scope.goTo("booking");

    };

    // LOGIN MODAL
    $scope.openAuth = function (mode) {

        $scope.authMode = mode;
        $scope.authVisible = true;
        $scope.auth.password = "";

    };

    $scope.closeAuth = function () {
        $scope.authVisible = false;
    };

    $scope.switchAuth = function (mode) {

        $scope.authMode = mode;
        $scope.auth.password = "";

    };

    // REGISTER AND LOGIN
    $scope.authenticate = async function () {

        $scope.authLoading = true;

        try {

            var result;

            if ($scope.authMode === "register") {

                result = await supabaseClient.auth.signUp({
                    email: $scope.auth.email,
                    password: $scope.auth.password
                });

            } else {

                result = await supabaseClient.auth.signInWithPassword({
                    email: $scope.auth.email,
                    password: $scope.auth.password
                });

            }

            if (result.error) throw result.error;

            if ($scope.authMode === "register" &&
                !result.data.session) {

                showMessage(
                    "Registration successful. Verify your email, then log in.",
                    "success"
                );

                $scope.authMode = "login";

            } else {

                $scope.user = result.data.user;
                $scope.authVisible = false;
                $scope.auth.password = "";

                showMessage("Login successful!", "success");

                await $scope.loadAppointments();

            }

        } catch (error) {

            showMessage(errorText(error), "error");

        } finally {

            $scope.authLoading = false;
            $scope.$applyAsync();

        }

    };

    // CHECK EXISTING SESSION
    async function checkUser() {

        try {

            var result = await supabaseClient.auth.getUser();

            if (result.error) throw result.error;

            $scope.user = result.data.user || null;

            $scope.$applyAsync();

            if ($scope.user) {
                await $scope.loadAppointments();
            }

        } catch (error) {

            $scope.user = null;

        }

    }

    // LOGOUT
    $scope.logout = async function () {

        try {

            var result = await supabaseClient.auth.signOut();

            if (result.error) throw result.error;

            $scope.user = null;
            $scope.appointments = [];

            showMessage("Logged out successfully.", "success");

        } catch (error) {

            showMessage(errorText(error), "error");

        }

    };

    // BOOK APPOINTMENT
    $scope.bookAppointment = async function () {

        if (!$scope.user) {

            showMessage("Please login before booking.", "error");
            $scope.openAuth("login");
            return;

        }

        if (!$scope.selectedDoctor) {

            showMessage("Please select a doctor.", "error");
            $scope.goTo("doctors");
            return;

        }

        var appointmentDate = formatDate($scope.booking.date);

        if (!appointmentDate || appointmentDate < $scope.minDate) {

            showMessage("Please select a valid appointment date.", "error");
            return;

        }

        if (!/^[0-9]{10}$/.test($scope.booking.phone || "")) {

            showMessage("Enter a valid 10-digit phone number.", "error");
            return;

        }

        $scope.saving = true;

        try {

            var userResult = await supabaseClient.auth.getUser();

            if (userResult.error || !userResult.data.user) {
                throw new Error("Please log in again.");
            }

            var appointmentData = {

                patient_id: userResult.data.user.id,
                doctor_id: $scope.selectedDoctor.id,
                patient_name: $scope.booking.patientName.trim(),
                patient_phone: $scope.booking.phone,
                appointment_date: appointmentDate,
                appointment_time: $scope.booking.time,
                reason: $scope.booking.reason,
                status: "Confirmed"

            };

            var result = await supabaseClient
                .from("appointments")
                .insert(appointmentData)
                .select()
                .single();

            if (result.error) throw result.error;

            showMessage("Appointment booked successfully!", "success");

            $scope.booking = {
                patientName: "",
                phone: "",
                date: null,
                time: "",
                reason: ""
            };

            await $scope.loadAppointments();

            $scope.goTo("appointments");

        } catch (error) {

            showMessage(errorText(error), "error");

        } finally {

            $scope.saving = false;
            $scope.$applyAsync();

        }

    };

    // LOAD PATIENT APPOINTMENTS
    $scope.loadAppointments = async function () {

        if (!$scope.user) {
            $scope.appointments = [];
            return;
        }

        $scope.loadingAppointments = true;

        try {

            var result = await supabaseClient
                .from("appointments")
                .select(`
                    *,
                    doctors (
                        name,
                        specialty
                    )
                `)
                .eq("patient_id", $scope.user.id)
                .order("appointment_date", { ascending: true })
                .order("appointment_time", { ascending: true });

            if (result.error) throw result.error;

            $scope.appointments = result.data || [];

        } catch (error) {

            showMessage(errorText(error), "error");

        } finally {

            $scope.loadingAppointments = false;
            $scope.$applyAsync();

        }

    };

    // CANCEL APPOINTMENT
    $scope.cancelAppointment = async function (appointment) {

        if (!window.confirm("Are you sure you want to cancel this appointment?")) {
            return;
        }

        try {

            var result = await supabaseClient
                .from("appointments")
                .update({ status: "Cancelled" })
                .eq("id", appointment.id)
                .eq("patient_id", $scope.user.id)
                .eq("status", "Confirmed")
                .select()
                .single();

            if (result.error) throw result.error;

            showMessage("Appointment cancelled successfully.", "success");

            await $scope.loadAppointments();

        } catch (error) {

            showMessage(errorText(error), "error");

        }

    };

    // AUTH STATE CHANGES
    supabaseClient.auth.onAuthStateChange(function (event, session) {

        $scope.$applyAsync(function () {

            $scope.user = session ? session.user : null;

            if (!$scope.user) {
                $scope.appointments = [];
            }

        });

    });

    // INITIALIZE
    $scope.loadFeaturedDoctors();
    $scope.loadDoctors();
    checkUser();

});
