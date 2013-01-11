var lib = require("./../lib/misc");
var compiler = require("./compiler");
var config = require("./../config/config"),
path = require("path");

compiler.cachePackages(config.modes);

var compilerServer = function(Provider, root, cwd, authServer){
	var isRunning = 0;
	var ev = new (require('events').EventEmitter)();
	var CompilerProcess = null;
	Provider
	.on('cs_on', function(data){
		if(isRunning==0){
			isRunning=1;
			var dirname = path.resolve(path.join(root, data['dirname']));
			var filename = data['filename'];
			var extension = filename.split(".");
			var compiler_const = compiler.findPackageFor(extension[extension.length-1]);
			if(compiler_const === false){
				ev.emit('on', filename, false);
				Provider.emit('cs_on', undefined, false);
				isRunning = 0;
				return false;
			}
			CompilerProcess =  new compiler_const
			(function(success){
				isRunning = success?2:0;
				ev.emit('on', path.join(dirname, filename), success?true:false);
				Provider.emit('cs_on', success);
			}, cwd, dirname, filename);
			
			CompilerProcess.Events
			.on('stdOut', function(str){Provider.emit('cs_stdout', str);})
			.on('stdErr', function(str){Provider.emit('cs_stderr', str);})
			.on('exit', function(code){
				CompilerProcess = null; 
				isRunning = 0;
				ev.emit('exit', path.join(dirname, filename), code);
				Provider.emit('cs_exit', code);
			});			
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
			CompilerProcess.Events.emit('stdIn', data);	
		}
	})
	.on('cs_ctrlc', function(){
		if(isRunning==3){
			CompilerProcess.Events.emit('ctrlC');		
		}	
	})
	.on('cs_ctrld', function(){
		if(isRunning==3){
			CompilerProcess.Events.emit('ctrlD');			
		}		
	})
	.on('cs_flag_set', function(d){
		var flag = d['flag'];
		var val = d['value'];
		Provider.emit('cs_flag_set', {
			'success': COMPILER_CONSTRUCTOR.setFlag(flag, val)
		});
	})
	.on('cs_flag_get', function(d){
		var flag = d['flag'];
		var val = COMPILER_CONSTRUCTOR.getFlag(flag);
		Provider.emit('cs_flag_get', {
			'success': (typeof val != 'undefined'),
			'value': val
		});
	});
	return ev;
};

module.exports = compilerServer;
