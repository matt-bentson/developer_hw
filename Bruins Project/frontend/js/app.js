var app = angular.module('myApp', ['ngRoute']);

//page routing
app.config(function($routeProvider) {
    $routeProvider
        .when('/playerSearch', {
            templateUrl: 'views/playerSearch/playerSearch.html',
            controller: 'playerSearchController'
        })
        .when('/playerCard/:id', {
            templateUrl: 'views/playerCard/playerCard.html',
            controller: 'playerCardController'
        })
        .when('/finalThoughts', {
            templateUrl: 'views/finalThoughts/finalThoughts.html'
        })
});

app.controller("indexController", function ($route, $rootScope, $scope, $http, $location) {
    $rootScope.showMainOptions = true;
    $rootScope.isHomeToggle = "active";

    $scope.goToPlayerSearch = function () {
        $rootScope.showMainOptions = false;
        $rootScope.isVPC = true;
        $rootScope.isFT = false;
        $rootScope.isHomeToggle = "bcHelp";
        $location.url("/playerSearch");
    }

    $scope.goToFinalThoughts = function () {
        $rootScope.showMainOptions = false;
        $rootScope.isVPC = false;
        $rootScope.isFT = true;
        $rootScope.isHomeToggle = "bcHelp";
        $location.url("/finalThoughts");
    }

    $scope.goHome = function () {
        $rootScope.isHomeToggle = "active";
        $rootScope.isVPC = false;
        $rootScope.isFT = false;
        $rootScope.showMainOptions = true;
        $rootScope.matches = [];
        $location.url("/home");
    }
});