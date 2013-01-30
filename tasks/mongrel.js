/*
 * mongrel
 * https://github.com/jacoblwe20/mongrel
 *
 * Copyright (c) 2013 Jacob Lowe
 * Licensed under the MIT license.
 */

 var fs = require('fs'),
    Mangos = require('mangos');

 var Mongrel = function(input, grunt, done){
  if (!(this instanceof Mongrel)) {
    return new Mongrel(input, grunt, done);
  }
  var that = this;
  that.file = (input[0]) ? input[0] : 'migrate.json';
  that.done = done;
  that.grunt = grunt;

  // Read the file
  that.File = function(){
    fs.readFile(that.file, function(err, res){
      if(err){
        that.grunt.log.writeln('File not found');
        that.done()
      }else{
        that.grunt.log.writeln(that.file + ' Found');
        var res = JSON.parse(res);
        that.config = res;
        that.Database(function(){
          that.grunt.log.writeln('Connected to ' + that.config.database.collection);
          that.Backup();
        });
      }
    });
  };

  that.Database = function(callback){
    if(that.config.database){
      var database = that.config.database;
      if(database.collection){
        if(database.uri){
          that.database = new Mangos(database.collection, database.uri);
        }else{
          that.database = new Mangos(database.collection, database.host, parseFloat(database.port));
        }
        callback();
      }else{
        that.grunt.log.writeln('You must specify a collection to modify');
        that.done(); 
      }
    }else{
      that.grunt.log.writeln('You must specify a database to connect to');
      that.done();
    }
  };

  that.Backup = function(){
    //create a copy of a database
    if(that.database.ready){
      that.database.db.copyDatabase(
        that.config.database.collection, 
        that.config.prefix + '.' + that.config.database.collection
      );
      that.done();
    }else{
      setTimeout(function(){
        that.Backup();
      },2000)
    }
  };

  //until i can get something working just finish
  that.File();
 }

module.exports = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerTask('mongrel', 'Mongo DB modification tool', function(a) {

    var done = this.async();

    new Mongrel([a], grunt, done);
    //grunt.log.write(grunt.helper('mongrel'));
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('mongrel', function() {
    return 'mongrel!!!';
  });

};
