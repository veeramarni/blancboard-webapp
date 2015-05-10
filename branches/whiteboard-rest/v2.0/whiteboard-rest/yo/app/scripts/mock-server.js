'use strict';


/**
 * @ngdoc function
 * @name mock-server
 * @description
 * # Add ?nobackend in the url to mock backend http server
 */
(function(ng){


	if(!document.URL.match(/\?nobackend$/)){
		return; //do nothing special - this app is not gonna use stubbed backend
	}



	console.log('======= ACHTUNG!!! USING STUBBED BACKEND ==========');
	

    var initializeStubbedBackend = function (){
		ng.module('mainApp')
			.config(function($provide){
				$provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
			})
			.run(function($httpBackend){
				// define responses for requests here as usual

				// passthrough all views etc
				$httpBackend.whenGET(/pages\/.*/).passThrough();
				$httpBackend.whenPOST('/users')
					.respond(200,{'id_token': 'xxx'});
			})
			;


	};	
	initializeStubbedBackend();

})(angular);