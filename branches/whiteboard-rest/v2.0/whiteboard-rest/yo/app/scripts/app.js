'use strict';

/**
 * @ngdoc overview
 * @name mainApp
 * @description
 * # mainApp
 *
 * Main module of the application.
 */
angular
  .module('mainApp', [
    'services.config',
    'mainApp.home',
    'mainApp.about',
    'mainApp.contact',
    'mainApp.download',
    'mainApp.features',
    'mainApp.legal',
    'mainApp.login',
    'mainApp.pricing',
    'mainApp.resetPassword',
    'mainApp.signup',
    'angular-storage',
    'angular-jwt'
  ])
  .config(['$urlRouterProvider', function($urlRouterProvider){
    $urlRouterProvider.otherwise('/');

  }])
  .controller('MainCtrl', [ '$scope', function($scope){
    $scope.$on('$routeChangeSuccess', function(e, nextRoute){
      if(nextRoute.$$route && angular.isDefined(nextRoute.$$route.pageTitle)){
        $scope.pageTitle = nextRoute.$$route.pageTitle + ' | Blancboard';
      }
    });
  }])

  ;
