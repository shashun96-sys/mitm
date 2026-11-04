var app = angular.module('myApp', []);

//parent controller

app.controller('CollegeController', function($scope) {
    $scope.collegeName = "MITM COLLEGE";
});

//child controller

app.controller(
    "StudentController", function($scope) {
        $scope.name = "Shashu";
        $scope.department = "Information Science";
        $scope.semester = 3;

        //aray
        $scope.students =[
            "RAjeev M",
            "Buffy",
            "Sede vruthvi",
            "Chiru",
        ];
    }
);