'use strict';

/**
 * @ngdoc function
 * @name mainApp.directive: dialogForm
 * @description
 * # dialogForm
 * Directive of the mainApp
 */

 angular
	.module('mainApp')
	.directive('dialogForm', function(){
 	return {
 		restrict: 'E',
 		templateUrl: 'pages/directives/dialogForm.html',
 		replace: true,
 		transclude: true
 	};
 });

