'use strict';

/**
 * @ngdoc function
 * @name mainApp.login
 * @description
 * # LoginCtrl
 */
 angular
 .module('mainApp.login', [
  'ui.router',
  'angular-storage'
  ])
 .config(['$stateProvider', function($stateProvider){
  $stateProvider.state('login',{
        url: '/login',
        views: {
          'header': {
            templateUrl: '/pages/templates/nav.html'
          },
          'content' : {
            templateUrl: '/pages/login/login.html'
          },
          'footer' : {
            templateUrl: '/pages/templates/footer.html'
          }
          
        },
        controller: 'LoginCtrl'
    });
}])
 .controller('LoginCtrl', ['$scope', '$http', 'store', '$state', function ($scope, $http, store, $state) {
  
  $scope.user = {};

  $scope.login = function(){
    $http({
      url: 'http://localhost:8080/session/create',
      method: 'POST',
      data: $scope.user
    }).then(function(response){
      store.set('jwt',response.data.idToken);
      $state.go('home');
    }, function(error){
      console.log(error.data);
    });
  };

 }])

 ;

