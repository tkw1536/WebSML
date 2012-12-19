//File Server Client
client.FileServerClient = {};

(function(socket){
	client.FileServerClient.listDir = function(dir, callback){
		socket
		.once('fs_listDir', function(d){
			var success = d['success'];
			if(success){
				callback(true, d['files'], d['dirs'], d['dir']);
			} else {
				callback(false);
			}
		}).emit('fs_listDir', {'dir': dir});
	};

	client.FileServerClient.resolveName = function(dir, filename, callback){
		socket
		.once('fs_resolveName', function(d){
			var success = d['success'];
			if(success){
				callback(true, d['dir'], d['filename']);
			} else {
				callback(false);
			}
		}).emit('fs_resolveName', {'dir': dir, 'filename':filename});
	};
	
	client.FileServerClient.readFile = function(dir, filename, callback){
		socket
		.once('fs_readFile', function(d){
			var success = d['success'];
			if(success){
				callback(true, d['content']);
			} else {
				callback(false);
			}
		}).emit('fs_readFile', {'dir': dir, 'filename':filename});
	};

	client.FileServerClient.writeFile = function(dir, filename, content, overwrite, callback){
		socket
		.once('fs_writeFile', function(d){
			callback(d['success']);
		}).emit('fs_writeFile', {'dir': dir, 'filename':filename, 'content': content, 'overwrite': overwrite});
	};

	client.FileServerClient.makeDir = function(dir, newdir, callback){
		socket
		.once('fs_makeDir', function(d){
			callback(d['success']);
		}).emit('fs_makeDir', {'dir': dir, 'newdir': newdir});
	};

	client.FileServerClient.deleteFile = function(dir, filename, callback){
		socket
		.once('fs_deleteFile', function(d){
			callback(d['success']);
		}).emit('fs_deleteFile', {'dir': dir, 'filename': filename});
	};	
	
	client.FileServerClient.deleteDir = function(dir, oldDir, callback){
		socket
		.once('fs_deleteDir', function(d){
			callback(d['success']);
		}).emit('fs_deleteDir', {'dir': dir, 'oldDir': oldDir});
	};
})(client);

