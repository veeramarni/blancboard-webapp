'use strict';

/**
 * @ngdoc function
 * @name mainApp.resetPassword
 * @description
 * # ResetPasswordCtrl
 */
 angular
 .module('mainApp.resetPassword', [
  'ui.router'
  ])
 .config(['$stateProvider', function($stateProvider){
  $stateProvider.state('resetPassword',{
        url: '/resetPassword',
        views: {
          'header': {
            templateUrl: '/pages/templates/nav.html'
          },
          'content' : {
            templateUrl: '/pages/resetPassword/resetPassword.html'
          },
          'footer' : {
            templateUrl: '/pages/templates/footer.html'
          }
          
        },
        controller: 'ResetPasswordCtrl'
    });
}])
 .controller('ResetPasswordCtrl', ['$scope',function ($scope) {
  $scope.title='resetPassword';

 }])


 ;

