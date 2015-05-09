'use strict';

/**
 * @ngdoc function
 * @name mainApp.legal
 * @description
 * # LegalCtrl
 */
 angular
 .module('mainApp.legal', [
  'ui.router'
  ])
 .config(['$stateProvider', function($stateProvider){
  $stateProvider.state('legal',{
        url: '/legal',
        views: {
          'header': {
            templateUrl: '/pages/templates/nav.html'
          },
          'content' : {
            templateUrl: '/pages/legal/legal.html'
          },
          'footer' : {
            templateUrl: '/pages/templates/footer.html'
          }
          
        },
        controller: 'LegalCtrl'
    });
}])
 .controller('LegalCtrl', ['$scope',function ($scope) {
  $scope.title='legal';

 }])

 ;

