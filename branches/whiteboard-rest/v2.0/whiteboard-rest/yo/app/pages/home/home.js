'use strict';

/**
 * @ngdoc function
 * @name mainApp.home
 * @description
 * # HomeCtrl
 */
 angular
 .module('mainApp.home', [
  'ui.router'
  ])
 .config(['$stateProvider', function($stateProvider){
  $stateProvider.state('home',{
        url: '/',
        views: {
          'header': {
            templateUrl: '/pages/templates/nav.html'
          },
          'content' : {
            templateUrl: '/pages/home/home.html'
          },
          'footer' : {
            templateUrl: '/pages/templates/footer.html'
          }
          
        },
        controller: 'HomeCtrl'
    });
}])
 .controller('HomeCtrl', ['$scope',function ($scope) {
  $scope.pageTitle='home';

 }])

 ;

