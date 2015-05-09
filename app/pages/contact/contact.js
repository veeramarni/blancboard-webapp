'use strict';

/**
 * @ngdoc function
 * @name mainApp.contact
 * @description
 * # ContactCtrl
 */
 angular
 .module('mainApp.contact', [
  'ui.router'
  ])
 .config(['$stateProvider', function($stateProvider){
  $stateProvider.state('contact',{
        url: '/contact',
        views: {
          'header': {
            templateUrl: '/pages/templates/nav.html'
          },
          'content' : {
            templateUrl: '/pages/contact/contact.html'
          },
          'footer' : {
            templateUrl: '/pages/templates/footer.html'
          }
          
        },
        controller: 'ContactCtrl'
    });
}])
 .controller('ContactCtrl', ['$scope',function ($scope) {
  $scope.title='Contact';

 }])

;