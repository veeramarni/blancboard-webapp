'use strict';

angular.module('services.config', [])
  .constant('configuration', {
    baseURL: '@@baseUrl'
  });
