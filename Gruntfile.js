  // Generated on 2015-04-09 using generator-angular 0.11.1
  'use strict';

  // # Globbing
  // for performance reasons we're only matching one level down:
  // 'test/spec/{,*/}*.js'
  // use this if you want to recursively match all subfolders:
  // 'test/spec/**/*.js'

  module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
      app: require('./bower.json').appPath || 'app',
      whiteboard: 'whiteboardApp',
      dist: 'dist'
    };

    // custom tasks
    grunt.loadTasks('tasks');

    // Define the configuration for all the tasks
    grunt.initConfig({

      // Project settings
      yeoman: appConfig,

      // Watches files for changes and runs tasks based on the changed files
      watch: {
        bower: {
          files: ['bower.json'],
          tasks: ['wiredep']
        },
        js: {
          files: ['<%= yeoman.app %>/scripts/{,*/}*.js', '<%= yeoman.app %>/pages/{,*/}*.js'],
          tasks: ['newer:jshint:all'],
          options: {
            livereload: '<%= connect.options.livereload %>'
          }
        },
        jsTest: {
          files: ['test/spec/{,*/}*.js'],
          tasks: ['newer:jshint:test', 'karma']
        },
        compass: {
          files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}', '<%= yeoman.app %>/pages/{,*/}*.{scss,sass}'],
          tasks: ['compass:server', 'autoprefixer']
        },
        less: {
          files: ['<%= yeoman.app %>/styles/less/**/*.less', '<%= yeoman.app %>/pages/{,*/}*.less'],
          tasks: ['less:server', 'autoprefixer']
        },
        gruntfile: {
          files: ['Gruntfile.js', './tasks/*.js']
        },
        config: {
          files: ['./config/config.js', './config/environments/development.json'],
          tasks: ['replace:development']
        },
        configWb: {
          files: ['./config/enyoConfig.js', './config/environments/development.json'],
          tasks: ['replace:developmentWb']
        },
        livereload: {
          options: {
            livereload: '<%= connect.options.livereload %>'
          },
          files: [
            '<%= yeoman.app %>/**/*.html',
            '.tmp/styles/{,*/}*.css',
            '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
          ]
        },
        livereloadWb: {
          options: {
            livereload: '<%= connect.options.livereloadWb %>'
          },
          files: [
            '<%= yeoman.whiteboard %>/**/*.html',
            '.tmp/styles/{,*/}*.css',
            '<%= yeoman.whiteboard %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
          ]
        }
      },
      // The actual grunt server settings
      connect: {
        // Proxy requests starting with /whieboard-rest to the server on port 8080
        proxies: [{
          context: '/whiteboard-rest',
          host: 'localhost',
          port: 8080,
          https: false,
          changeOrigin: false
        }],
        options: {
          port: 9000,
          // Change this to '0.0.0.0' to access the server from outside.
          hostname: 'localhost',
          livereload: 35729
        },
        livereload: {
          options: {
            open: true,
            middleware: function(connect) {
              return [
                connect.static('.tmp'),
                connect().use(
                  '/bower_components',
                  connect.static('./bower_components')
                ),
                connect().use(
                  '/app/styles',
                  connect.static('./app/styles')
                ),
                connect.static(appConfig.app)
              ];
            }
          }
        },
        livereloadWb: {
          options: {
            open: true,
            middleware: function(connect) {
              return [
                connect.static('.tmp'),
                connect().use(
                  '/bower_components',
                  connect.static('./bower_components')
                ),
                connect().use(
                  '/app/styles',
                  connect.static('./app/styles')
                ),
                connect.static(appConfig.whiteboard)
              ];
            }
          }
        },
        test: {
          options: {
            port: 9001,
            middleware: function(connect) {
              return [
                connect.static('.tmp'),
                connect.static('test'),
                connect().use(
                  '/bower_components',
                  connect.static('./bower_components')
                ),
                connect.static(appConfig.app)
              ];
            }
          }
        },
        dist: {
          options: {
            open: true,
            base: '<%= yeoman.dist %>'
          }
        }
      },

      // Make sure code styles are up to par and there are no obvious mistakes
      jshint: {
        options: {
          jshintrc: '.jshintrc',
          reporter: require('jshint-stylish')
        },
        all: {
          src: [
            'Gruntfile.js',
            '<%= yeoman.app %>/scripts/{,*/}*.js',
            '<%= yeoman.app %>/pages/{,*/}*.js'
          ]
        },
        test: {
          options: {
            jshintrc: 'test/.jshintrc'
          },
          src: ['test/spec/{,*/}*.js']
        }
      },

      // Empties folders to start fresh
      clean: {
        dist: {
          files: [{
            dot: true,
            src: [
              '.tmp',
              '<%= yeoman.dist %>/{,*/}*',
              '!<%= yeoman.dist %>/.git{,*/}*'
            ]
          }]
        },
        server: '.tmp'
      },

      // Add vendor prefixed styles
      autoprefixer: {
        options: {
          browsers: ['last 1 version']
        },
        server: {
          options: {
            map: true,
          },
          files: [{
            expand: true,
            cwd: '.tmp/styles/',
            src: '{,*/}*.css',
            dest: '.tmp/styles/'
          }]
        },
        dist: {
          files: [{
            expand: true,
            cwd: '.tmp/styles/',
            src: '{,*/}*.css',
            dest: '.tmp/styles/'
          }]
        }
      },

      // Automatically inject Bower components into the app
      wiredep: {
        options: {
          //exclude additional bootstrap
          exclude: ['bower_components/bootstrap/dist/js/bootstrap.js', 'bower_components/bootstrap/dist/css/bootstrap.css']
        },
        app: {
          src: ['<%= yeoman.app %>/index.html'],
          ignorePath: /\.\.\//
        },
        test: {
          devDependencies: true,
          src: '<%= karma.unit.configFile %>',
          ignorePath: /\.\.\//,
          fileTypes: {
            js: {
              block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
              detect: {
                js: /'(.*\.js)'/gi
              },
              replace: {
                js: '\'{{filePath}}\','
              }
            }
          }
        },
        sass: {
          src: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}', '<%= yeoman.app %>/pages/{,*/}*.{scss,sass}'],
          ignorePath: /(\.\.\/){1,2}bower_components\//
        }
      },

      // Compiles Sass to CSS and generates necessary files if requested
      compass: {
        options: {
          sassDir: '<%= yeoman.app %>/styles',
          cssDir: '.tmp/styles',
          generatedImagesDir: '.tmp/images/generated',
          imagesDir: '<%= yeoman.app %>/images',
          javascriptsDir: '<%= yeoman.app %>/scripts',
          fontsDir: '<%= yeoman.app %>/styles/fonts',
          importPath: './bower_components',
          httpImagesPath: '/images',
          httpGeneratedImagesPath: '/images/generated',
          httpFontsPath: '/styles/fonts',
          relativeAssets: false,
          assetCacheBuster: false,
          raw: 'Sass::Script::Number.precision = 10\n'
        },
        dist: {
          options: {
            generatedImagesDir: '<%= yeoman.dist %>/images/generated'
          }
        },
        server: {
          options: {
            sourcemap: true
          }
        }
      },

      // Compiles Less to CSS and generates necessary files if requested
      less: {
        options: {
          compress: true,
          path: ['<%= yeoman.app %>/styles/*', '<%= yeoman.app %>/pages/*'],
          optimization: 2
        },
        dist: {
          files: {
            // target.css file: source.less file
            '.tmp/styles/styles.css': '<%= yeoman.app %>/styles/less/default/styles.less'
          }
        },
        server: {
          files: {
            // target.css file: source.less file
            '.tmp/styles/styles.css': '<%= yeoman.app %>/styles/less/default/styles.less'
          }
        }
      },
      // Renames files for browser caching purposes
      filerev: {
        dist: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      },

      // Reads HTML for usemin blocks to enable smart builds that automatically
      // concat, minify and revision files. Creates configurations in memory so
      // additional tasks can operate on them
      useminPrepare: {
        html: '<%= yeoman.app %>/index.html',
        options: {
          dest: '<%= yeoman.dist %>',
          flow: {
            html: {
              steps: {
                js: ['concat', 'uglifyjs'],
                css: ['cssmin']
              },
              post: {}
            }
          }
        }
      },

      // Performs rewrites based on filerev and the useminPrepare configuration
      usemin: {
        html: ['<%= yeoman.dist %>/**/*.html'],
        css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
        options: {
          assetsDirs: [
            '<%= yeoman.dist %>',
            '<%= yeoman.dist %>/images',
            '<%= yeoman.dist %>/styles'
          ]
        }
      },

      // The following *-min tasks will produce minified files in the dist folder
      // By default, your `index.html`'s <!-- Usemin block --> will take care of
      // minification. These next options are pre-configured if you do not wish
      // to use the Usemin blocks.
      //  cssmin: {
      //    dist: {
      //      files: {
      //        '<%= yeoman.dist %>/styles/main.css': [
      //          '.tmp/styles/{,*/}*.css'
      //       ]
      //     }
      //   }
      // },
      // uglify: {
      //   dist: {
      //     files: {
      //       '<%= yeoman.dist %>/scripts/scripts.js': [
      //         '<%= yeoman.dist %>/scripts/scripts.js'
      //       ]
      //     }
      //   }
      // },
      // concat: {
      //   dist: {}
      // },

      imagemin: {
        dist: {
          files: [{
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.{png,jpg,jpeg,gif}',
            dest: '<%= yeoman.dist %>/images'
          }]
        }
      },

      svgmin: {
        dist: {
          files: [{
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.svg',
            dest: '<%= yeoman.dist %>/images'
          }]
        }
      },

      htmlmin: {
        dist: {
          options: {
            collapseWhitespace: true,
            conservativeCollapse: true,
            collapseBooleanAttributes: true,
            removeCommentsFromCDATA: true,
            removeOptionalTags: true
          },
          files: [{
            expand: true,
            cwd: '<%= yeoman.dist %>',
            src: ['*.html', 'pages/**/*.html'],
            dest: '<%= yeoman.dist %>'
          }]
        }
      },

      // ng-annotate tries to make the code safe for minification automatically
      // by using the Angular long form for dependency injection.
      ngAnnotate: {
        dist: {
          files: [{
            expand: true,
            cwd: '.tmp/concat/scripts',
            src: '*.js',
            dest: '.tmp/concat/scripts'
          }]
        }
      },

      // Replace Google CDN references
      cdnify: {
        dist: {
          html: ['<%= yeoman.dist %>/*.html']
        }
      },
      // Replace the config files based on environment
      replace: {
        development: {
          options: {
            patterns: [{
              json: grunt.file.readJSON('./config/environments/development.json')
            }]
          },
          files: [{
            expand: true,
            flatten: true,
            src: ['./config/config.js'],
            dest: '<%= yeoman.app %>/scripts/services/'
          }]
        },
        developmentWb: {
          options: {
            patterns: [{
              json: grunt.file.readJSON('./config/environments/development.json')
            }]
          },
          files: [{
            expand: true,
            flatten: true,
            src: ['./config/enyoConfig.js'],
            dest: '<%= yeoman.whiteboard %>/source/'
          }]
        },
        staging: {
          options: {
            patterns: [{
              json: grunt.file.readJSON('./config/environments/staging.json')
            }]
          },
          files: [{
            expand: true,
            flatten: true,
            src: ['./config/config.js'],
            dest: '<%= yeoman.app %>/scripts/services/'
          }]
        },
        stagingWb: {
          options: {
            patterns: [{
              json: grunt.file.readJSON('./config/environments/staging.json')
            }]
          },
          files: [{
            expand: true,
            flatten: true,
            src: ['./config/enyoConfig.js'],
            dest: '<%= yeoman.whiteboard %>/source/'
          }]
        },
        production: {
          options: {
            patterns: [{
              json: grunt.file.readJSON('./config/environments/production.json')
            }]
          },
          files: [{
            expand: true,
            flatten: true,
            src: ['./config/config.js'],
            dest: '<%= yeoman.app %>/scripts/services/'
          }]
        },
        productionWb: {
          options: {
            patterns: [{
              json: grunt.file.readJSON('./config/environments/production.json')
            }]
          },
          files: [{
            expand: true,
            flatten: true,
            src: ['./config/enyoConfig.js'],
            dest: '<%= yeoman.whiteboard %>/source/'
          }]
        }
      },

      // Copies remaining files to places other tasks can use
      copy: {
        dist: {
          files: [{
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.{ico,png,txt}',
              '.htaccess',
              '*.html',
              'pages/**/*.html',
              'images/{,*/}*.{webp}',
              'styles/fonts/{,*/}*.*'
            ]
          }, {
            expand: true,
            cwd: '.tmp/images',
            dest: '<%= yeoman.dist %>/images',
            src: ['generated/*']
          }, { //for bootstrap fronts
            expand: true,
            cwd: '.',
            src: 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*',
            dest: '<%= yeoman.dist %>'
          }, { //for font-awesome
            expand: true,
            cwd: '.',
            src: 'bower_components/font-awesome-sass/assets/fonts/font-awesome/*',
            dest: '<%= yeoman.dist %>'
          }]
        },
        styles: {
          expand: true,
          cwd: ['<%= yeoman.app %>/styles', '<%= yeoman.app %>/pages'],
          dest: '.tmp/styles/',
          src: '{,*/}*.css'
        }
      },

      // Run some tasks in parallel to speed up the build process
      concurrent: {
        server: [
          'compass:server',
          'less:server'
        ],
        test: [
          'compass',
          'less'
        ],
        dist: [
          'compass:dist',
          'less:dist',
          'imagemin',
          'svgmin'
        ]
      },

      // Test settings
      karma: {
        unit: {
          configFile: 'test/karma.conf.js',
          singleRun: true
        }
      }
    });


    grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
      if (target === 'dist') {
        return grunt.task.run(['build', 'connect:dist:keepalive']);
      }
      if (target === 'whiteboard'){
        return grunt.task.run(['wbdeploy'])
      }

      grunt.task.run([
        'clean:server',
        'wiredep',
        'configureProxies',
        'concurrent:server',
        'autoprefixer:server',
        'connect:livereload',
        'replace:development',
        'watch'
      ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
      grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
      grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('whiteboard', 'Compile then start a connect web server', function(target) {
      if (target === 'deploy') {
        return grunt.task.run(['wbdeploy']);
      }
      grunt.task.run([
        'clean:server',
        'replace:developmentWb',
        'connect:livereloadWb',
        'watch'
      ]);
    });

    grunt.registerTask('wbdeploy', [
      'clean:server',
      'replace:developmentWb',
      'whiteboard:deploy',
      'connect:livereloadWb',
      'watch'
    ]);
    grunt.registerTask('test', [
      'clean:server',
      'wiredep',
      'concurrent:test',
      'autoprefixer',
      'connect:test',
      // 'karma'
    ]);

    grunt.registerTask('build', [
      'clean:dist',
      'wiredep',
      'useminPrepare',
      'concurrent:dist',
      'autoprefixer',
      'replace:development',
      'concat',
      'ngAnnotate',
      'copy:dist',
      //commenting cdnify as it is not workig properly
      //'cdnify',
      'cssmin',
      'uglify',
      'filerev',
      'usemin',
      'htmlmin'
    ]);

    grunt.registerTask('default', [
      'newer:jshint',
      'test',
      'build'
    ]);
  };
