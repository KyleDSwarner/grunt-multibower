
module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'tasks/**/*.js'],
      options: {
        globals: {
          module: true,
          process: true
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('default', ['jshint']);

};
