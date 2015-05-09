'use strict';

/**
 * @ngdoc function
 * @name mainApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mainApp
 */
 angular
 .module('mainApp.about', [
 	'ui.router'
 	])
 .config(['$stateProvider', function($stateProvider){
 	$stateProvider.state('about',{
        url: '/about',
        views: {
          'header': {
            templateUrl: '/pages/templates/nav.html'
          },
          'content' : {
            templateUrl: '/pages/about/about.html'
          },
          'footer' : {
            templateUrl: '/pages/templates/footer.html'
          }
          
        },
        controller: 'AboutCtrl'
    });
}])
 .controller('AboutCtrl', ['$scope',function ($scope) {
 	$scope.title='About';
 	$scope.awesomeThings = [
 	'HTML5 Boilerplate',
 	'AngularJS',
 	'Karma'
 	];

 }])

 ;

