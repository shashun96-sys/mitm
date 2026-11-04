var app = angular.module("studentApp", []);

app.controller("CollegeController", function($scope) {

    $scope.collegeName = "MITM College";

});

app.controller("StudentController", function($scope) {

    $scope.students = ["Rahul", "Priya", "Arun"];

    $scope.showDetails = false;

    $scope.addStudent = function() {

        if ($scope.name) {

            $scope.students.push($scope.name);

            $scope.name = "";

        }

    };

});