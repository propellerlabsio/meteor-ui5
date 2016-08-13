module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['doc', 'dist'],
    jsdoc: {
      dist: {
        src: ['src/**/*.js', 'README.md'],
        options: {
          destination: 'doc',
          template: "node_modules/ink-docstrap/template",
          configure: "jsdoc.conf.json"
        }
      }
    },
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      dist: {
        files: [{
          "expand": true,
          "cwd": "src/ui5",
          "src": ["**/*.js"],
          "dest": "dist/",
          "ext": ".js"
        }]
      }
    }
  });

  // Load grunt plugin tasks from pre-installed npm packages
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Local task: Create meteor package file
  grunt.registerTask(
    'create_package_js',
    'Create meteor package file',
    function () {
      // TODO rather than just copy package.js, build list of files for
      // api.addFiles() method based on current UI5 models and controls.
      grunt.file.copy('src/package.js', 'dist/package.js');
    }
  );

  // Local task: Copy meteor source files straight to dist folder.  Meteor
  // build process will handle minification and whatever other task have to
  // happen.
  grunt.registerTask(
    'copy_meteor_sources_to_dist',
    'Copying meteor sources to dist.',
    function () {
      grunt.file.copy('src/meteor', 'dist/meteor');
    }
  );


  // Local task: Create UI5 debug files
  grunt.registerTask(
    'create_ui5_debug_files',
    'Create UI5 debug files ("-dbg")',
    function () {
      // TODO move this into outside function so the grunt file is easier to
      // to follow. I tried but couldn't get a reference to the grunt object
      var filesCreated = 0;

      // Recurse source directory copying unminfied javascript to dist directory
      // but where target has "-dbg" in the name before the first dot.
      grunt.file.recurse('src/ui5', function(abspath, root, subdir, filename){
        // Ignore root directory
        if (subdir){
          // Source file is absolute path
          var sourceFile = abspath;

          // Destination file name has "-dbg" in the filename before first period
          var firstPeriod = filename.indexOf('.');
          var destFileName = [
            filename.slice(0, firstPeriod),
            '-dbg',
            filename.slice(firstPeriod)
          ].join('');

          // Destination is in 'dist' directory
          var destFile = 'dist/' + subdir + '/' + destFileName;

          // Copy file
          grunt.file.copy(sourceFile, destFile);
          filesCreated++;
        }
      });

      // Finished
      grunt.log.writeln(filesCreated + ' debug files created.');
    }
  );

  // Complete, combined build task
  grunt.registerTask('build', [
    'clean',
    'jsdoc',
    'babel',
    'copy_meteor_sources_to_dist',
    'create_package_js',
    'create_ui5_debug_files'
  ]);

};
