var app = angular.module('myApp', []);

//parent controller

app.controller('CollegeController', function($scope) {
    $scope.collegeName = "abc college";
});

//child controller

app.controller(
    "StudentController", function($scope) {
        $scope.name = "Shashu";
        $scope.department = "Computer Science";
        $scope.semester = 3;

        //aray
        $scope.students =[
            "Rajeev",
            "Buffy",
            "chiru",
            "Vruthvi",
        ];

//function to add a student ussing ng click
        $scope.addStudent = function() {
            if ($scope.name.trim() !==""){
                $scope.students.push($scope.name);
                $scope.name = "";
            }
            else{
                alert("Please enter a student name");
            }
        };
        
    }
);