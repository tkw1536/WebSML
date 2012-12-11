//Compiler Server Client
client.CompilerServerClient = {};

(function(socket){
	client.CompilerServerClient.runFile = function(dirname, filename, callBack, stdOut, stdErr, onEnd){
		socket.once('cs_on', function(d){
			var success = d['success'];
			callBack(success);
			if(success){
				socket.emit('cs_start');
			}
		})
		.on('cs_stdout', function(str){stdOut(str);})
		.on('cs_stderr', function(str){stdErr(str);})
		.once('cs_end', function(code){
			socket
			.off('cs_stdout')
			.off('cs_stderr');
			onEnd(code);
		})	
		.emit('cs_on', {'dirname':code, 'filename':filename});
	};
	
	client.CompilerServerClient.stdIn = function(text){socket.emit('cs_stdin', text);};
	client.CompilerServerClient.ctrlC = function(){socket.emit('cs_ctrlc', {});};
	client.CompilerServerClient.ctrlD = function(){socket.emit('cs_ctrld', {});};
})(client);
