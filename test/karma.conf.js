// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-04-09 using
// generator-karma 0.9.0

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/jquery-placeholder/jquery.placeholder.js',
      'bower_components/bootstrap-hover-dropdown/bootstrap-hover-dropdown.js',
      'bower_components/jquery-migrate/jquery-migrate.js',
      'bower_components/FitVids/jquery.fitvids.js',
      'bower_components/FlexSlider/jquery.flexslider.js',
      'bower_components/angular-jwt/dist/angular-jwt.js',
      'bower_components/a0-angular-storage/dist/angular-storage.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/enyo/enyo.js',
      'bower_components/raphael/raphael.js',
      'bower_components/raphael.json/raphael.json.js',
      'bower_components/raphael.export/raphael.export.js',
      'bower_components/raphael.free_transform/raphael.free_transform.js',
      'bower_components/jquery-timeago/jquery.timeago.js',
      'bower_components/jquery-dateFormat/dist/jquery-dateFormat.js',
      'bower_components/blueimp-load-image/js/load-image.js',
      'bower_components/blueimp-load-image/js/load-image-ios.js',
      'bower_components/blueimp-load-image/js/load-image-orientation.js',
      'bower_components/blueimp-load-image/js/load-image-meta.js',
      'bower_components/blueimp-load-image/js/load-image-exif.js',
      'bower_components/blueimp-load-image/js/load-image-exif-map.js',
      'bower_components/jquery-file-upload/js/jquery.fileupload.js',
      'bower_components/dropzone/dist/min/dropzone.min.js',
      'bower_components/lodash/lodash.js',
      'bower_components/blackbird/lib/blackbird.js',
      // endbower
      'app/scripts/**/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
