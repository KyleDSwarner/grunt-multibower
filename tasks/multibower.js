/*
 * grunt-multibower
 * https://github.com/KyleDSwarner/grunt-multibower
 *
 * Copyright (c) 2016 Swarner, Kyle
 * Licensed under the MIT license.
 */

var fs = require('fs');
var exec = require('child_process').exec;

module.exports = function(grunt) {
   'use strict';

   var pendingThreads = 0;
   var options;
   var done;
   var cmd;
   
   grunt.registerMultiTask('multibower', 'Find and execute installs for nested bower files', function() {
      done = this.async();
      cmd = "bower install";

      options = this.options({
         bowerDirectory: 'bower_components', //Used during force, can be updated to remove the correct directory
         bowerFilename: 'bower.json',
         force: false, //force a complete refresh of all bower items by deleting the directory
         maxDepth: 0, //Limit the subdirectory depth. 0 and undefined mean unlimited.
         excludeDirs: ['.git', 'bower_components', 'node_modules', 'dist', 'grunt', 'release'],
         verbose: false
      });

      _searchDirectory(process.cwd());
   });

   function _searchDirectory(dir, subdirDepth) {
      var currentDepth = subdirDepth || 0;
      addThreads();

      //Don't recuse past the maximum subdirectory depth.
      if(options.maxDepth !== undefined && options.maxDepth !== 0 && currentDepth > options.maxDepth) {
         finishThread();
         return;
      }

      fs.readdir(dir, function(err, files) {

         //Filter out directories based on the exclusion list;
         files = files.filter(function(filename) {
            return options.excludeDirs.indexOf(filename) == -1; //TODO directory regex mapping, if required
         });

         addThreads(files.length);

         files.forEach(function(file) {
            try {
               var filePath = dir + "/" + file;
               if(fs.lstatSync(filePath).isDirectory()) {
                  _searchDirectory(filePath, currentDepth + 1);
               }
               else if(file === options.bowerFilename) {
                  runBower(dir);
               }
            }
            catch(err) {
               grunt.log.writeln(err);
            }
            finally {
               finishThread();
            }
         });

         finishThread();
      });
   }

   function runBower(directory) {
      addThreads();
      log("Running Bower in Directory: " + directory);
      var bowerCommand = "cd " + directory + " && ";

      if(options.force === true)
      {
         bowerCommand += "rm -rf " + options.bowerDirectory + " && ";
      }

      bowerCommand += cmd;

      verbose("Executing Command: " + bowerCommand);

      exec(bowerCommand, function(error, stdout, stderr) {

         verbose("Bower command completed in directory: " + directory);
         verbose("Output of Bower command:");
         verbose(stdout);

         if(stderr !== undefined && stderr !== '') {
            log("Bower warnings logged from directory: " + directory);
            log(stderr);
         }

         finishThread();
      });
   }

   function addThreads(size) {
      if (size === undefined) size = 1;
      pendingThreads += size;
   }

   function finishThread() {
      pendingThreads--;
      if(pendingThreads === 0) {
         verbose("--- All Threads Finished! Exiting. ---");
         done();
      }
   }

   function log(message) {
      grunt.log.writeln(message);
   }

   function verbose(message) {
      if(options.verbose) {
         grunt.log.writeln(message);
      }
   }

};
