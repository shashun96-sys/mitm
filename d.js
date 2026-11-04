
/*
Student Name: Rajeev M
Department: Information Science and Engineering
*/

// Create AngularJS module
var app = angular.module("studentApp", []);

// Parent Controller
app.controller("CollegeController", function($scope) {

    $scope.collegeName = "MAHARAJA INSTITUTE OF TECHNOLOGY MYSORE";

});

// Child Controller
app.controller("StudentController", function($scope) {

    // Sample student names
    $scope.students = [
        "Rajesh",
        "Rahul",
        "Arun"
    ];

    // Student details
    $scope.newStudent = {};

    // Hide details initially
    $scope.showDetails = false;

    // Add student function
    $scope.addStudent = function() {

        if ($scope.newStudent.name &&
            $scope.newStudent.name.trim() !== "") {

            $scope.students.push($scope.newStudent.name);

            // Clear name input
            $scope.newStudent.name = "";
        }
        else {
            alert("Please enter student name");
        }
    };

});
