module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsdoc: {
      dist: {
        src: ['src/**/*.js', 'README.md'],
        options: {
          destination: 'doc',
          template: "node_modules/ink-docstrap/template",
          configure: "jsdoc.conf.json"
        }
      }
    }
  });

  // Load the plugin that provides the "jsdoc".
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['jsdoc']);

};
