var lib = require("./../lib/misc"), //Lib
path = require("path"),
fs = require("fs");

var FileServer = function(Provider, options){
	var ev = new (require('events').EventEmitter)();
	var opts = lib.extend(
	{
		'root': './',//root
		'canRead': function(path, isDir){return true;},//Can we read a certain file?
		'canWrite': function(path, isDir){return true;} //can we write a file?
	}, options);

	var canRead = (typeof opts.canRead == 'function')?opts.canRead:function(){return opts.canRead;};
	var canWrite = (typeof opts.canWrite == 'function')?opts.canWrite:function(){return opts.canWrite;};
	
	var root = path.resolve(opts['root']);

	var pathCheck = function(pth){
		if(!lib.isIn(pth, root)){
			return false;		
		}
		return true;
	};

	Provider
	.on('fs_resolveName', function(data){
		try{
			var dir = data['dir'];
			var file = data['filename'];
			var fullPath = path.normalize(path.join(dir, file));
			Provider.emit('fs_resolveName', {'success': true, 'dir': path.dirname(fullPath), 'filename': path.basename(fullPath)});
		} catch(e){
			Provider.emit('fs_resolveName', {'success': false});
		}		
	})
	.on('fs_listDir', function(data){
		var dir = path.join(root, data["dir"]);
		if(pathCheck(dir) && canRead(dir, true)){
			try{
				var everything = fs.readdirSync(dir);
				var files = everything.filter(function(e, i, a){
					return lib.isFile(path.join(dir, e)); 
				}).filter(function(e){return canRead(path.join(dir, e), false);});
				var dirs = everything.filter(function(e, i, a){
					return lib.isDir(path.join(dir, e)); 
				}).filter(function(e){return canRead(path.join(dir, e), true);});
				if(!lib.sameDir(dir, root)){
					dirs.unshift('..');//Directory up
				}
				ev.emit('listDir', dir);
				Provider.emit('fs_listDir', {'dir': path.normalize(data['dir']), 'success': true, 'files': files, 'dirs': dirs});
			} catch(e){
				Provider.emit('fs_listDir', {'success': false});
			}
		} else {
			Provider.emit('fs_listDir', {'success': false});
		}
	})
	.on('fs_readFile', function(data){
		var basedir = data["dir"];
		var filename = data["filename"];
		var mypath = path.join(root, path.join(basedir, filename));
		if(pathCheck(mypath)  && canRead(mypath, false)){
			//read a file
			try{
				var content = fs.readFileSync(mypath, 'utf-8');
				ev.emit('readFile', mypath);
				Provider.emit('fs_readFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': true, 'content': content})			
			} catch(e){
				Provider.emit('fs_readFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': false});
			}
		} else {
			Provider.emit('fs_readFile', {'success': false});
		}
	})

	.on('fs_writeFile', function(data){
		var basedir = data["dir"];
		var filename = data["filename"];
		var content = data["content"];
		var overwrite = data["overwrite"];
		var mypath = path.join(root, path.join(basedir, filename));
		if(pathCheck(mypath) && canWrite(mypath, false)){
			//write a file
			try{
				if(overwrite==false && isFile(mypath)){throw "no overwrite";/*handled*/}
				fs.writeFileSync(mypath, content, 'utf-8');
				ev.emit('writeFile', mypath);
				Provider.emit('fs_writeFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': true});
			} catch(e){
				Provider.emit('fs_writeFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': false});
			}
		} else {
			Provider.emit('fs_writeFile', {'success': false});
		}
	})
	.on('fs_makeDir', function(data){
		var basedir = data["dir"];
		var newdir = data["newdir"];
		//read all File in basedir
		var mypath = path.join(root, path.join(basedir, newdir));
		if(pathCheck(mypath) && canWrite(mypath, true)){
			//make dir
			try{
				fs.mkdirSync(mypath, '0777');
				ev.emit('makeDir', myPath);
				Provider
				.emit('fs_makeDir', {'dir': path.normalize(basedir), 'success': true});
			} catch(e) {
				Provider.emit('fs_makeDir', {'dir': path.normalize(basedir), 'success': false});
			}
		} else {
			Provider.emit('fs_makeDir', {'success': false});
		}		
	})
	.on('fs_deleteFile', function(data){
		var basedir = data["dir"];
		var filename = data["filename"];
		var mypath = path.join(root, path.join(basedir, filename));
		if(pathCheck(mypath) && canWrite(mypath, false)){
			try{
				fs.unlinkSync(mypath);
				ev.emit('deleteFile', mypath);
				Provider
				.emit('fs_deleteFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': true});
			} catch(e){
				Provider.emit('fs_deleteFile', {'dir': path.normalize(basedir), 'filename': filename, 'success': false});
			}
		} else {
			Provider.emit('fs_deleteFile', {'success': false});
		}
	})
	.on('fs_deleteDir', function(data){
		var basedir = path.join(data["dir"], data['oldDir']);
		var mypath = path.join(root, basedir);
		if(pathCheck(mypath) && !lib.sameDir(mypath, root) && canWrite(mypath, true)){
			try{
				lib.removeRecursive(mypath, function(err){
					if(err){
						Provider.emit('fs_deleteDir', {'dir': path.normalize(basedir), 'success': false});
					} else {
						ev.emit('deleteDir', path.normalize(basedir));
						Provider.emit('fs_deleteDir', {'dir': path.normalize(basedir), 'success': true});
					}
				});
			
			} catch(e){
				console.log(e);
				Provider.emit('fs_deleteDir', {'dir': path.normalize(basedir), 'success': false});
			}
		} else {
			Provider.emit('fs_deleteDir', {'success': false});
		}
	});

	ev.close = function(){
		Provider
		.off("fs_listDir")
		.off("fs_readFile")
		.off("fs_writeFile")
		.off("fs_makeDir")
		.off("fs_deleteFile")
		.off("fs_deleteDir");
	};
	return ev;
};

module.exports = FileServer;
