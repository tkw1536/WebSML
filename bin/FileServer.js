var lib = require("./../lib/misc"), //Lib
path = require("path"),
fs = require("fs");

//TODO: continue adpating, implement canWrite

var FileServer = function(Provider, options){
	var opts = lib.extend(
	{
		'root': './',//root
		'outOfFolder': function(){},
		//What should happen when we try something outside of our folder
	}, options);
	
	var root = path.resolve(opts['root']);

	var pathCheck = function(pth){
		if(!lib.isIn(pth, root)){
			opts['outOfFolder'](Provider, pth);
			return false;		
		}
		return true;
	};

	Provider
	.on('fs_listDir', function(data){
		var dir = path.join(root, data["dir"])
		if(pathCheck(dir)){
			try{
				var everything = fs.readdirSync(dir);
				var files = everything.filter(function(e, i, a){
					return lib.isFile(path.join(dir, e)); 
				});
				var dirs = everything.filter(function(e, i, a){
					return lib.isDir(path.join(dir, e)); 
				});
				if(!lib.sameDir(dir, root)){
					dirs.unshift('..');//Directory up
				}
				Provider.emit('fs_listDir', {'dir': path.normalize(data['dir']), 'success': true, 'files': files, 'dirs': dirs});
			} catch(e){
				console.log(e);
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
		if(pathCheck(mypath)){
			//read a file
			try{
				var content = fs.readFileSync(mypath, 'utf-8');
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
		if(pathCheck(mypath)){
			//write a file
			try{
				if(overwrite==false && isFile(mypath)){throw "no overwrite";/*handled*/}
				fs.writeFileSync(mypath, content, 'utf-8');
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
		if(pathCheck(mypath)){
			//make dir
			try{
				fs.mkdirSync(mypath, '0777');
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
		if(pathCheck(mypath)){
			try{
				fs.unlinkSync(mypath);
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
		if(pathCheck(mypath) && !lib.sameDir(mypath, root)){
			try{
				lib.removeRecursive(mypath, function(err){
					if(err){
						Provider.emit('fs_deleteDir', {'dir': path.normalize(basedir), 'success': false});
					} else {
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

	this.close = function(){
		Provider
		.off("fs_listDir")
		.off("fs_readFile")
		.off("fs_writeFile")
		.off("fs_makeDir")
		.off("fs_deleteFile")
		.off("fs_deleteDir");
	};
};

module.exports = FileServer;
