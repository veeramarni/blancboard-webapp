'use strict';

/**
 * @ngdoc function
 * @name mainApp.pricing
 * @description
 * # DownloadCtrl
 */
 angular
 .module('mainApp.download', [
  'ui.router'
  ])
 .config(['$stateProvider', function($stateProvider){
  $stateProvider.state('download',{
        url: '/download',
        views: {
          'header': {
            templateUrl: '/pages/templates/nav.html'
          },
          'content' : {
            templateUrl: '/pages/download/download.html'
          },
          'footer' : {
            templateUrl: '/pages/templates/footer.html'
          }
          
        },
        controller: 'DownloadCtrl'
    });
}])
 .controller('DownloadCtrl', ['$scope',function ($scope) {
  $scope.title='download';

 }])

 ;

