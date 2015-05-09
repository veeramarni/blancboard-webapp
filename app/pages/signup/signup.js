'use strict';
/*jshint camelcase: false */

/**
 * @ngdoc function
 * @name mainApp.signup
 * @description
 * # SignupCtrl
 */
 angular
 .module('mainApp.signup', [
  'ui.router',
  'angular-storage',
  'services.config'
  ])
 .config(['$stateProvider', function($stateProvider){
  $stateProvider.state('signup',{
    url: '/signup',
    views: {
      'header': {
        templateUrl: '/pages/templates/nav.html'
      },
      'content' : {
        templateUrl: '/pages/signup/signup.html',
         controller: 'SignupCtrl',
      },
      'footer' : {
        templateUrl: '/pages/templates/footer.html'
      }
    }
  });
}])
.controller( 'SignupCtrl', ['$scope', '$http', 'store', '$state', 'configuration', function( $scope, $http, store, $state, configuration) {

  $scope.user = {};

  $scope.createUser = function() {
    $http({
      url: configuration.baseURL + 'users',
      method: 'POST',
      data: $scope.user
    }).then(function(response) {
      store.set('jwt', response.data.id_token);
    //  $state.go('home');
    }, function(error) {
      alert(error.data);
    });
  };

}])


 ;
