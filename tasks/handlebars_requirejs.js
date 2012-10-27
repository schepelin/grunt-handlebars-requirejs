/*
 * grunt-handlebars-requirejs
 *
 * Copyright (c) 2012 Darcy Murphy
 * Licensed under the MIT license.
 * https://github.com/mrDarcyMurphy/grunt-handlebars-requirejs/blob/master/LICENSE
 */

module.exports = function(grunt) {
  'use strict';

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils
  var _ = grunt.util._
  var helpers = require('grunt-contrib-lib').init(grunt);

  // filename conversion for templates
  var defaultProcessName = function(name) {
    name = name.substr(name.lastIndexOf('/') + 1).split('.')[0]
    return name
  };

  // filename conversion for partials
  var defaultProcessPartialName = function(filePath) {
    var pieces = _.last(filePath.split('/')).split('.');
    var name   = _(pieces).without(_.last(pieces)).join('.'); // strips file extension
    return name.substr(1, name.length);                       // strips leading _ character
  };

  grunt.registerMultiTask('handlebars_requirejs', 'Compile Handlebars templates to RequireJS module.', function() {

    var options = helpers.options(this, {namespace: 'JST'});

    grunt.verbose.writeflags(options, 'Options');

    // TODO: ditch this when grunt v0.4 is released
    this.files = this.files || helpers.normalizeMultiTaskFiles(this.data, this.target);

    var compiled, srcFiles, src, filename, outputFilename, partialName

    // assign filename transformation functions
    var processName = options.processName || defaultProcessName
    var output = "define(['handlebars'], function(Handlebars){\n"
    output += "var template = Handlebars.template;" +
    "var templates = Handlebars.templates = Handlebars.templates || {}; \n";
    // iterate files, processing partials and templates separately
    this.files.forEach(function(files) {
      srcFiles = grunt.file.expandFiles(files.src);
      srcFiles.forEach(function(file) {
        src = grunt.file.read(file);

        try {
          compiled = require('handlebars').precompile(src);
        } catch (e) {
          grunt.log.error(e);
          grunt.fail.warn('Handlebars failed to compile '+file+'.');
        }
        filename = processName(file);

        output += "templates['" + filename + "'] = template(" + compiled + ");\n";

      });

    });
    output += "});\n";

    outputFilename = options.output || 'temp/scripts/templates.js';
    grunt.file.write(outputFilename, output);
    grunt.log.writeln('File "' + outputFilename + '" created.');
  });
}
