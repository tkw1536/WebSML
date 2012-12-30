//Misc lib functions

var path = require("path"),
fs = require('fs');

var lib = {};

lib.defineIfNull = function(val, def){
	return (typeof val == 'undefined')?def:val;
};

lib.startsWith = function(/* string */ y, /* string */ x){//Does y start with x
	var x = x.split("");//make arrays
	var y = y.split("");
	while(true){
		if(x.length == 0){return true;}//is x==[]? then we are done 
		if(x.shift() != y.shift()){ return false};//Two chars are not equal => false
	}	
};

lib.endsWith = function(/* string */ y, /* string */ x){//Does y end with x
	var x = x.split("");//make arrays
	var y = y.split("");
	while(true){
		if(x.length == 0){return true;}//is x==[]? then we are done 
		if(x.pop() != y.pop()){ return false};//Two chars are not equal => false
	}	
};

lib.isIn = function(query, basePath){
	var query = path.normalize(path.resolve(query));
	var base = path.normalize(path.resolve(basePath));
	return (lib.startsWith(query, base));//If we start with .., we go back and are not inside
};

lib.lastMember = function(/* array */ x){return x[x.length - 1];}//returns the last member of an array

lib.toRealString = function(/* string */ s){//Turns an array of char codes into a real string
	var res = "";
	for(var i=0;i<s.length;i++){
		res += String.fromCharCode(s[i]);	
	}
	return res;
};

lib.isDir = function(d) {
  try { return fs.statSync(d).isDirectory() }
  catch (e) { return false }
};

lib.isFile = function(d) {
  try { return fs.statSync(d).isFile() }
  catch (e) { return false }
};

lib.sameDir = function(a, b){
	return path.normalize(path.resolve(a))==path.normalize(path.resolve(b))
};


lib.removeRecursive = function(path,cb){//Delete a folder recusively. 
    var self = this;

    fs.stat(path, function(err, stats) {
      if(err){
        cb(err,stats);
        return;
      }
      if(stats.isFile()){
        fs.unlink(path, function(err) {
          if(err) {
            cb(err,null);
          }else{
            cb(null,true);
          }
          return;
        });
      }else if(stats.isDirectory()){
        // A folder may contain files
        // We need to delete the files first
        // When all are deleted we could delete the 
        // dir itself
        fs.readdir(path, function(err, files) {
          if(err){
            cb(err,null);
            return;
          }
          var f_length = files.length;
          var f_delete_index = 0;

          // Check and keep track of deleted files
          // Delete the folder itself when the files are deleted

          var checkStatus = function(){
            // We check the status
            // and count till we r done
            if(f_length===f_delete_index){
              fs.rmdir(path, function(err) {
                if(err){
                  cb(err,null);
                }else{ 
                  cb(null,true);
                }
              });
              return true;
            }
            return false;
          };
          if(!checkStatus()){
            for(var i=0;i<f_length;i++){
              // Create a local scope for filePath
              // Not really needed, but just good practice
              // (as strings arn't passed by reference)
              (function(){
                var filePath = path + '/' + files[i];
                // Add a named function as callback
                // just to enlighten debugging
                removeRecursive(filePath,function removeRecursiveCB(err,status){
                  if(!err){
                    f_delete_index ++;
                    checkStatus();
                  }else{
                    cb(err,null);
                    return;
                  }
                });
    
              })()
            }
          }
        });
      }
    });
  };

/*!
 * node.extend
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * @fileoverview
 * Port of jQuery.extend that actually works on node.js
 */

function is_plain_obj( obj ){
  if( !obj ||
      {}.toString.call( obj ) !== '[object Object]' ||
      obj.nodeType ||
      obj.setInterval ){
    return false;
  }

  var has_own                   = {}.hasOwnProperty;
  var has_own_constructor       = has_own.call( obj, 'constructor' );
  var has_is_property_of_method = has_own.call( obj.constructor.prototype, 'isPrototypeOf' );

  // Not own constructor property must be Object
  if( obj.constructor &&
      !has_own_constructor &&
      !has_is_property_of_method ){
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  var key;
  for( key in obj ){}

  return key === undefined || has_own.call( obj, key );
};

function extend (){
  var target = arguments[ 0 ] || {};
  var i      = 1;
  var length = arguments.length;
  var deep   = false;
  var options, name, src, copy, copy_is_array, clone;

  // Handle a deep copy situation
  if( typeof target === 'boolean' ){
    deep   = target;
    target = arguments[ 1 ] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if( typeof target !== 'object' && typeof target !== 'function' ){
    target = {};
  }

  for( ; i < length; i++ ){
    // Only deal with non-null/undefined values
    if(( options = arguments[ i ]) != null ){
      // Extend the base object
      for( name in options ){
        src  = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if( target === copy ){
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if( deep && copy && ( is_plain_obj( copy ) || ( copy_is_array = Array.isArray( copy )))){
          if( copy_is_array ){
            copy_is_array = false;
            clone = src && Array.isArray( src ) ? src : [];
          }else{
            clone = src && is_plain_obj( src)  ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = extend( deep, clone, copy );

        // Don't bring in undefined values
        }else if( copy !== undefined ){
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
}

/**
 * Exports module.
 */
lib.extend = extend;


module.exports = lib;
