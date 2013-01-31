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

  that.Done = function(){
    // remove backups
    that.backup.collection(function(err, collection){
      collection.remove({}, function(err, res){
        that.grunt.log.writeln('Removed backup ' + that.config.prefix + ':' + that.config.database.collection);
        that.done();
      });
    });
  };

  that.BackupQue = function(i){
    if(i === that.dataset.length - 1){
      that.grunt.log.writeln('Sucessfully backuped');
      that.Done();
    }
  };

  that.BackupPush = function(){
    if(that.backup.ready){
      that.database.read({}, function(err, dataset){
        that.dataset = dataset;
        that.grunt.log.writeln('Writing backup to ' + that.config.prefix + ':' + that.config.database.collection);
        for(var i = 0; i < dataset.length; i += 1){
          (function(n){
            that.backup.create(dataset[n], function(){
              that.BackupQue(n)
            });
          }(i));
        }
      });
    }else{
      setTimeout(function(){
        that.BackupPush();
      },2000)
    }
  };

  that.Backup = function(){

    if(that.database.ready){  
      var backup = that.config.prefix + ':' + that.config.database.collection;
      if(that.config.database.uri){
        that.backup = new Mangos(backup, that.config.database.uri);
        that.BackupPush();
      }else{
        that.backup = new Mangos(backup, that.config.database.host, parseFloat(that.config.database.port));
        that.BackupPush();
      } 
      //that.done();
    }else{
      setTimeout(function(){
        that.Backup();
      },2000)
    }
  };

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
