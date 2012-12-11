var lib = require("./../lib/misc");
var compiler = require("./compiler");
var config = require("./../config/config");

var CONST_COMPILERCONFIG = config.server.provider;

var compilerServer = function(Provider, root, cwd, userData){
	var isRunning = 0;
	var CompilerProcess = null;
	Provider
	.on('cs_on', function(data){
		if(isRunning==0){
			isRunning=1;
			var dirname = path.resolve(path.join(root, data['dirname']));
			var filename = data['filename'];
			CompilerProcess =  new (compiler(CONST_COMPILERCONFIG))
			(function(success){
				isRunning=2;
				Provider.emit('cs_on', d);
			}, cwd, userData, dirname, filename);
			
			CompilerProcess.Events
			.on('stdout', function(str){Provider.emit('cs_stdout', str);})
			.on('stderr', function(str){Provider.emit('cs_stderr', str);})
			.on('exit', function(code){
				CompilerProcess = null; 
				isRunning = 0; 
				Provider.emit('cs_exit', code);
			});

			CompilerProcess.prepare(code, tmpfile, cd);			
		}
	})
	.on('cs_start', function(){
		if(isRunning==2){
			isRunning=3;
			CompilerProcess.start();
		}	
	})
	.on('cs_stdin', function(data){
		if(isRunning==3){
			//STDIN
			CompilerProcess.stdIn(data);	
		}
	})
	.on('cs_ctrlc', function(){
		if(isRunning==3){
			CompilerProcess.ctrlC();		
		}	
	})
	.on('cs_crtld', function(){
		if(isRunning==3){
			CompilerProcess.ctrlD();		
		}		
	})
};

module.exports = compilerServer;
