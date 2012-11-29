//SML online compiler
//Server side script
//(c) Tom Wiesing 2012

//dependencies:
var http = require('http'),
url = require('url'),
path = require('path'),
fs = require('fs'),
spawn = require('child_process').spawn,
io = require('socket.io');//socket.io: npm install socket.io

//Settings
var SML_CMD = '/usr/share/smlnj/bin/sml'; //Command to run SML
var SML_TEMP_DIR = './clients';//Temp dir for all the files

//INIT CODE
var tmpDir = path.resolve(SML_TEMP_DIR);

//Lib Functions



var endsWith = function(/* string */ y, /* string */ x){//Does y end with x
	var x = x.split("");//make arrays
	var y = y.split("");
	while(true){
		if(x.length == 0){return true;}//is x==[]? then we are done 
		if(x.pop() != y.pop()){ return false};//Two chars are not equal => false
	}	
};

var startsWith = function(/* string */ y, /* string */ x){//Does y start with x
	var x = x.split("");//make arrays
	var y = y.split("");
	while(true){
		if(x.length == 0){return true;}//is x==[]? then we are done 
		if(x.shift() != y.shift()){ return false};//Two chars are not equal => false
	}	
};

var isIn = function(query, basePath){
	var query = path.normalize(path.resolve(query));
	var base = path.normalize(path.resolve(basePath));
	return (startsWith(query, base));//If we start with .., we go back and are not inside
};

var isDir = function(d) {
  try { return fs.statSync(d).isDirectory() }
  catch (e) { return false }
}

var isFile = function(d) {
  try { return fs.statSync(d).isFile() }
  catch (e) { return false }
}

var sameDir = function(a, b){
	return path.normalize(path.resolve(a))==path.normalize(path.resolve(b))
}

var lastMember = function(/* array */ x){return x[x.length - 1];}//returns the last member of an array

var toRealString = function(/* string */ s){//Turns an array of char codes into a real string
	var res = "";
	for(var i=0;i<s.length;i++){
		res += String.fromCharCode(s[i]);	
	}
	return res;
};

/**
 * Offers functionality similar to mkdir -p
 *
 * Asynchronous operation. No arguments other than a possible exception
 * are given to the completion callback.
 * Source: https://gist.github.com/742162
 */
var mkdir_p = function (path, mode, callback, position) {
    mode = mode || 0777;
    position = position || 0;
    parts = require('path').normalize(path).split('/');

    if (position >= parts.length) {
        if (callback) {
            return callback();
        } else {
            return true;
        }
    }

    var directory = parts.slice(0, position + 1).join('/');
    fs.stat(directory, function(err) {
        if (err === null) {
            mkdir_p(path, mode, callback, position + 1);
        } else {
            fs.mkdir(directory, mode, function (err) {
                if (err) {
                    if (callback) {
                        return callback(err);
                    } else {
                        throw err;
                    }
                } else {
                    mkdir_p(path, mode, callback, position + 1);
                }
            })
        }
    })
}

//Source: https://gist.github.com/1722941
var removeRecursive = function(path,cb){//Delete a folder recusively. 
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


//fileserver code
var mimeTypes = {//supported mimeTypes
	"html": "text/html",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"png": "image/png",
	"js": "text/javascript",
	"css": "text/css"
};

var server = http.createServer(function(req, res) {//create the server
	var uri = url.parse(req.url).pathname;
	uri = endsWith(uri, "/")?uri+"index.html":uri;//Directory index files
	var filename = path.join(path.join(__dirname, "./server_root"), uri);//grab files
	
	fs.exists(filename, function(exists) {
		if(!exists) {//Not Found
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.write('404 Not Found\n');
			res.end();
			return;
		}
		var mimeType = mimeTypes[lastMember(path.extname(filename).split("."))];
		res.writeHead(200, {'Content-Type':mimeType});
	
		var fileStream = fs.createReadStream(filename);//pump to the client
		fileStream.pipe(res);
	});
});

//Ip blocked ?
var ipBlocked= function (ip){
	return false;
}


//socket io code
io = io.listen(server);//socket.io server

removeRecursive(tmpDir,function(){server.listen(80);}); //Cleanup before start

//IO Code
io.sockets.on('connection', function (socket) {//on socket connection
	//TODO: Implement overflow etc here
	var init_done = 0;
	var id = Date.now().toString()+"_"+lastMember(Math.random().toString().split("."));
	id = path.join(tmpDir, id);
	var id_fs = path.join(id, "filesystem");
	var sml_running = 0;
	var sml = "";

	var cleanUp = function(){
		if(sml_running==2){
			sml.kill();
		}
		if(init_done>0){
			if(init_done == 2){
				removeRecursive(id, function(err, stat){if(!(stat==true)){console.log("TRASH: Could not delete "+id+", please remove manually. ");}});//Remove the dir	
			} else {
				setTimeout(cleanUp, 1000);
				return;
			}		
		}
	};

	socket
	.once('clientReady', function(){
		init_done = 1;
		mkdir_p(id_fs, '0777', function(f){
			try{
				if(typeof f != 'undefined'){
					throw f;		
				}
				socket
				.on('runCode', function(data){
					if(sml_running > 0){
						socket.emit('requestStatusC', {'success': false, 'message': 'Client already running SML. Please terminate running instance. '});
						return false;				
					}
					var code = data["code"];
					fs.writeFile(path.join(id, 'code.sml'), code, function(err){
						if(err){
							//error
							socket.emit('requestStatusC', {'success': false, 'message': 'Internal Server error. Please try again later. '});
						} else {
							sml_running = 1;
							socket
							.once('beginSML', function(){
								sml_running = 2;
								sml = spawn(SML_CMD, (code==""?[]:[path.join(id, 'code.sml')]), {'cwd': id_fs})
								.on('close', function(){
									if(sml_running==2){
										sml.kill();
									}
								}).on('exit', function(code, signal){
									sml_running = 3;
									sml = null; //Delete object
									socket.emit('smlFinish', {'code': code, 'signal': signal});
									sml_running = 0;
									socket.emit('triggerFileUpDate', {});
								});
								sml.stdout.on('data', function(d){
									socket.emit('dataOutput', {'data':toRealString(d)})
									.emit('triggerFileUpDate', {})					
								});
							})
							.emit('requestStatusC', {'success': true, 'hasMessage': false, 'message': ''});
						}
					});
				})
				.emit('requestStatusB', {'success': true, 'hasMessage': false, 'message': ''});
				init_done = 2;
			}catch(e){
				socket.emit('requestStatusB', {'success': false, 'message': 'Internal Server error. '});
				init_done = 2;
				return;
			}
			//FileSystem listeners
			socket
			.on('listDir', function(data){
				var basedir = data["dir"];
				//read all File in basedir
				var mypath = path.normalize(path.join(id_fs, basedir));
				if(isIn(mypath, id_fs)){
					try{
						var everything = fs.readdirSync(mypath);
						var files = everything.filter(function(e, i, a){return isFile(path.join(mypath, e)); });
						var dirs =  everything.filter(function(e, i, a){return isDir(path.join(mypath, e)); });
						if(!sameDir(mypath, id_fs)){
							dirs.unshift('..');//Directory up
						}
						socket.emit('listDir', {'dir': path.normalize(basedir), 'success': true, 'files': files, 'dirs': dirs});
					} catch(e){
						socket.emit('listDir', {'dir': path.normalize(basedir), 'success': false});
					}
				} else {
					socket.emit('securityViolation').disconnect();
				}
			})
			.on('readFile', function(data){
				var basedir = data["dir"];
				var filename = data["filename"];
				var mypath = path.join(id_fs, path.join(basedir, filename));
				if(isIn(mypath, id_fs)){
					//read a file
					try{
						var content = fs.readFileSync(mypath, 'utf-8');
						socket.emit('readFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': true, 'content': content})
						if(data["noCheck"]!=true){
							socket.emit('triggerFileUpDate', {});
						}
						
					} catch(e){
						socket.emit('readFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': false});
					}
				} else {
					socket.emit('securityViolation').disconnect();
				}
			})
			.on('writeFile', function(data){
				var basedir = data["dir"];
				var filename = data["filename"];
				var content = data["content"];
				var overwrite = data["overwrite"];
				var mypath = path.join(id_fs, path.join(basedir, filename));
				if(isIn(mypath, id_fs)){
					//write a file
					try{
						if(overwrite==false && isFile(mypath)){throw "no overwrite";/*handled*/}
						fs.writeFileSync(mypath, content, 'utf-8');
						socket.emit('writeFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': true})
						.emit('triggerFileUpDate', {});
					} catch(e){
						socket.emit('writeFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': false});
					}
				} else {
					socket.emit('securityViolation').disconnect();
				}
			})
			.on('makeDir', function(data){
				var basedir = data["dir"];
				//read all File in basedir
				var mypath = path.join(id_fs, basedir);
				if(isIn(mypath, id_fs)){
					//make dir
					try{
						fs.mkdirSync(mypath, '0777');
						socket.emit('makeDir', {'dir': path.normalize(basedir), 'success': true})
						.emit('triggerFileUpDate', {});
					} catch(e) {
						socket.emit('makeDir', {'dir': path.normalize(basedir), 'success': false});
					}
				} else {
					socket.emit('securityViolation').disconnect();
				}		
			})
			.on('deleteFile', function(data){
				var basedir = data["dir"];
				var filename = data["filename"];
				var mypath = path.join(id_fs, path.join(basedir, filename));
				if(isIn(mypath, id_fs)){
					try{
						fs.unlinkSync(mypath);
						socket.emit('deleteFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': true})
						.emit('triggerFileUpDate', {});
					} catch(e){
						socket.emit('deleteFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': false});
					}
				} else {
					socket.emit('securityViolation').disconnect();
				}
			})
			.on('deleteDir', function(data){
				var basedir = data["dir"];
				var mypath = path.join(id_fs, basedir);
				if(isIn(mypath, id_fs)&& !sameDir(mypath, id_fs)){
					try{
						removeRecursive(mypath, function(err){
							if(err){
								socket.emit('deleteDir', {'dir': path.normalize(basedir), 'success': false})
								.emit('triggerFileUpDate', {});
							} else {
								socket.emit('deleteDir', {'dir': path.normalize(basedir), 'success': true});
							}
						});
						
					} catch(e){
						socket.emit('deleteDir', {'dir': path.normalize(basedir), 'success': false});
					}
				} else {
					socket.emit('securityViolation').disconnect();
				}
			})
		}, 1);
	})
	.on('disconnect', cleanUp)
	.on('dataInput', function(data){
		if(sml_running==2){
			sml.stdin.resume()
			sml.stdin.write(data['input']+"\n", 'utf-8');
		}
	})
	.on('data_ctrlC', function(){
		//send CTRL-C
		if(sml_running==2){
			sml.kill("SIGINT");
		}
	})
	.on('data_ctrlD', function(){
		//send CTRL-D
		if(sml_running==2){
			sml.stdin.end();	
		}	
	})
	.emit('requestStatusA', {'clearence': true, message: 'Welcome to server. '})//Ready
});

//socket io config

io.enable('browser client minification');
io.enable('browser client etag');
io.enable('browser client gzip');
io.set('log level', 1);

io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);

//some code has been adapted from:  http://stackoverflow.com/questions/7268033/basic-static-file-server-in-nodejs
//more sources: http://stackoverflow.com/questions/1738808/keypress-in-jquery-press-tab-inside-textarea-when-editing-an-existing-text


var SysCleanUp = function(){
	io.server.close();
	removeRecursive(tmpDir, function(){process.exit();});
};

process.once("SIGINT", function(){
	console.log("Caught SIGINT, shutting down ...");
	SysCleanUp();
	return false;
});
process.once("SIGTERM", function(){
	console.log("Caught SIGTERM, exiting");
	SysCleanUp();
	return false;
});
