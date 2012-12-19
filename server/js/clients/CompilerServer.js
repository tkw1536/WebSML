//Compiler Server Client
client.CompilerServerClient = {};

(function(socket){
	client.CompilerServerClient.runFile = function(dirname, filename, callBack, stdOut, stdErr, onEnd){
		socket.once('cs_on', function(success){
			callBack(success);
			if(success){
				socket.emit('cs_start');
			}
		})
		.on('cs_stdout', function(str){stdOut(str);})
		.on('cs_stderr', function(str){stdErr(str);})
		.once('cs_exit', function(code){
			socket
			.off('cs_stdout')
			.off('cs_stderr');
			onEnd(code);
		})	
		.emit('cs_on', {'dirname':dirname, 'filename':filename});
	};
	
	client.CompilerServerClient.stdIn = function(text){socket.emit('cs_stdin', text);};
	client.CompilerServerClient.ctrlC = function(){socket.emit('cs_ctrlc', {});};
	client.CompilerServerClient.ctrlD = function(){socket.emit('cs_ctrld', {});};

	client.CompilerServerClient.setFlag = function(flag, value, callback){
		socket
		.once('cs_flag_set', function(data){
			var success = data['success'];
			callback(success==true);
		})
		.emit('cs_flag_set', {'flag': flag, 'value': value});
	};

	client.CompilerServerClient.getFlag = function(flag, callback){
		socket
		.once('cs_flag_get', function(data){
			var success = data['success'];
			if(success){
				callback(false, data['value']);
			} else {
				callback(false);			
			}
		})
		.emit('cs_flag_get', {'flag': flag});
	};
	
})(client);
