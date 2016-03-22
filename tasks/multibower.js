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
         displayBowerOutput: true,
         debug: false
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
                  debug("Found Bower File: " + filePath);
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
      verbose("Running Bower in: " + directory);
      var bowerCommand = "cd " + directory + " && ";

      if(options.force === true) {
         bowerCommand += "rm -rf " + options.bowerDirectory + " && ";
      }

      bowerCommand += cmd;
      debug("Executing Command: " + bowerCommand);

      exec(bowerCommand, function(error, stdout, stderr) {

         if(options.displayBowerOutput === true && stdout !== undefined && stdout !== '') {
            log("Bower command completed in " + directory + ". Output:\n" + stdout);
         }

         if(stderr !== undefined && stderr !== '') {
            log("Bower warnings logged in " + directory + ". Output:\n" + stderr);
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
         debug("--- All Threads Finished! Exiting. ---");
         done();
      }
   }

   function log(message) {
      grunt.log.writeln(message);
   }

   function verbose(message) {
      grunt.verbose.writeln(message);
   }

   function debug(message) {
      if(options.debug) {
         grunt.log.writeln(message);
      }
   }

};
