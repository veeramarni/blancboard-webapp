'use strict';

/**
 * @ngdoc function
 * @name mainApp.features
 * @description
 * # FeaturesCtrl
 */
 angular
 .module('mainApp.features', [
  'ui.router'
  ])
 .config(['$stateProvider', function($stateProvider){
  $stateProvider.state('features',{
        url: '/features',
        views: {
          'header': {
            templateUrl: '/pages/templates/nav.html'
          },
          'content' : {
            templateUrl: '/pages/features/features.html'
          },
          'footer' : {
            templateUrl: '/pages/templates/footer.html'
          }
          
        },
        controller: 'FeaturesCtrl'
    });
}])
 .controller('FeaturesCtrl', ['$scope',function ($scope) {
  $scope.title='features';

 }])

 ;

