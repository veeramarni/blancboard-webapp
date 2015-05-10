'use strict';

/**
 * @ngdoc function
 * @name mainApp.pricing
 * @description
 * # PricingCtrl
 */
 angular
 .module('mainApp.pricing', [
  'ui.router'
  ])
 .config(['$stateProvider', function($stateProvider){
  $stateProvider.state('pricing',{
        url: '/pricing',
        views: {
          'header': {
            templateUrl: '/pages/templates/nav.html'
          },
          'content' : {
            templateUrl: '/pages/pricing/pricing.html'
          },
          'footer' : {
            templateUrl: '/pages/templates/footer.html'
          }
          
        },
        controller: 'PricingCtrl'
    });
}])
 .controller('PricingCtrl', [ '$scope', '$location', '$uiViewScroll', '$anchorScroll', function ($scope, $location,$uiViewScroll,$anchorScroll) {
  $scope.scrollTo = function(id){
    $location.hash(id);
      
    //$uiViewScroll();
    $anchorScroll();
  };

}])

;
