/*
 * mongrel
 * https://github.com/jacoblwe20/mongrel
 *
 * Copyright (c) 2013 Jacob Lowe
 * Licensed under the MIT license.
 */

 var fs = require('fs'),
    Mangos = require('mangos'),
    Template = require('./template.js'),
    template = new Template();

 var Mongrel = function(input, grunt, done){
  if (!(this instanceof Mongrel)) {
    return new Mongrel(input, grunt, done);
  }
  var that = this;
  that.file = (input[0]) ? input[0] : 'migrate.json';
  that.done = done;
  that.grunt = grunt;
  that.current = 0
  that.task = [];
  that.fns = {};

  that.log = function(str){
    // var caller_line = (new Error).stack.split("\n")[4]
    // var index = caller_line.indexOf("at ");
    // var clean = caller_line.slice(index+2, caller_line.length);
    that.grunt.log.writeln(str)
  };

  that.Write = function(){
    var done = function(i){
      if(i === that.dataset.length -1){
        that.Que();
      }
    };
    for(var i = 0; i < that.dataset.length; i += 1){
      (function(n){
      var data = that.dataset[n];
      that.database.update(data, function(err, res){
        that.done(n);
      });
      }(i));
    }
  };

  that.Que = function(){
    if(that.current < that.task.length){
      that.current += 1;
      that.log(that.task[that.current - 1] + 'ing');
      that[that.task[that.current - 1]]();
    }else{
      that.Done();
    }
  };

  // Read the file
  that.File = function(callback){
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
          callback();
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
    if(!that.config.keep){
    that.backup.collection(function(err, collection){
      collection.remove({}, function(err, res){
        that.grunt.log.writeln('Removed backup ' + that.config.prefix + '-' + that.config.database.collection);
        that.done();
      });
    });
    }else{
      that.done();
    }
  };

  that.execute = function(fns){
    var result;
    for(var i = 0; i < fns.length; i += 1){
      var set = fns[i];
      var name = set[0];
      set.shift();
      result = that.fns[name](set);
    }
    return result;
  };

  that.update = function(){
    var done = function(i){
      if(i === that.dataset.length -1){
        that.Que();
      }
    };
    for(var i = 0; i < that.dataset.length; i += 1){
      (function(n){
        var data = that.dataset[n];

        data.id = data._id.toString();
        delete data._id;
        for(var key in that.config.update){
          template.render(that.config.update[key], data, function(str, fns){
            if(fns) var results = that.execute(fns);
            if(results){
              data[key] = results;
            }else{
              data[key] = str;
            }
            done(n);
          });
        }
      }(i));
    }
  };

  that.requirments = function(){
    var requires = (that.config.require) ? that.config.require : null;
    for(var key in requires){
      that.fns[key] = require(__dirname + '/..' + requires[key]);
    }
  };

  that.BackupQue = function(i){
    if(i === that.dataset.length - 1){
      that.grunt.log.writeln('Sucessfully backuped');
      that.Que();
    }
  };

  that.BackupPush = function(){
    if(that.backup.ready){
      if(that.config.backup){
        that.database.read({}, function(err, dataset){
          that.dataset = dataset;
          that.grunt.log.writeln('Writing backup to ' + that.config.prefix + '-' + that.config.database.collection);
          for(var i = 0; i < dataset.length; i += 1){
            (function(n){
              that.backup.create(dataset[n], function(err, res){
                if(err) that.Done();
                else that.BackupQue(n)
              });
            }(i));
          }
        });
      }else{
        that.Que();
      }
    }else{
      setTimeout(function(){
        that.BackupPush();
      },2000)
    }
  };

  that.Backup = function(){

    if(that.database.ready){  
      var backup = that.config.prefix + '-' + that.config.database.collection;
      if(that.config.database.uri){
        that.backup = new Mangos(backup, that.config.database.uri);
        that.BackupPush();
      }else{
        that.backup = new Mangos(backup, that.config.database.host, parseFloat(that.config.database.port));
        that.BackupPush();
      } 
    }else{
      setTimeout(function(){
        that.Backup();
      },2000)
    }
  };

  that.Init = function(){
    that.File(function(){
      that.Backup();
      that.requirments();
      if(that.config.update) that.task.push('update');
      if(that.task.length > 0) that.task.push('Write');
    });
  };

  that.Init();
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
  });

};
