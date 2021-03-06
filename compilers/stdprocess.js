var lib = require("./../lib/misc"),
which = require("which").sync,
spawn = require('child_process').spawn,
path = require("path"),
fs = require("fs"),
events = require("events"),
config = require("./../config/config");

function Compiler(callback, cwd, dirname, filename)
{
	try{
		var me = this;
		this.Events = new events.EventEmitter();

		this.Events
		.on('ctrlC', function(){
			if(me.runLevel != 3){
				return;	
			}
			//send CTRL-C
			me.process.kill("SIGINT");		
		}).on('ctrlD', function(){
			if(me.runLevel != 3){
				return;	
			}
			//send CTRL-D / End process
			me.process.stdin.end("");
		}).on('stdIn', function(data){
			if(me.runLevel != 3){
				return;
			}
			//send STDIN
			me.process.stdin.resume()
			me.process.stdin.write(data+"\n", 'utf-8');
		});

		this.runLevel = 1;
		this.process = null;

		this.cwd = path.resolve(cwd);

		this.compilerArgs = Compiler.EmptyArguments;

		if(typeof dirname == 'string' && typeof filename == 'string'){
			this.compilerArgs = this.PreFileNameArgs.concat([path.resolve(path.join(dirname, filename))], this.PostFileNameArgs);
		}

		this.Executable = which(this.Executable);

		var Args = [];

		//Build wrapper arguments
		if(config.sandbox.enabled){
			for(var i=0;i<config.sandbox.arguments.length;i++){
				var arg = config.sandbox.arguments[i];
				if(arg == 0){
					Args.push(this.cwd);
				} else if(arg == 1){
					Args.push(this.Executable);
				} else if(arg == 2){
					for(var j=0;j<this.compilerArgs.length;j++){
						Args.push(this.compilerArgs[j]);
					}
				} else {
					Args.push(arg);
				}
			}
			this.Executable = which(config.sandbox.command);
			this.compilerArgs = Args;
		}

		this.runLevel = 2;

		callback(true);

	} catch(e){
		callback(false);	
	}
}

Compiler.prototype.start = function()
{
	var me = this;
	if(this.runLevel != 2){
		return false;	
	}
	this.runLevel = 3;
	
	//Start the process
	this.process = spawn(
		this.Executable, 
		this.compilerArgs,
		{
			'cwd': this.cwd
		}
	);
	
	this.process.stdout.on('data', function(data)
	{
		me.Events.emit("stdOut", lib.toRealString(data));	
	});
	
	this.process.stderr.on('data', function (data) {
	 	me.Events.emit("stdErr", lib.toRealString(data));	
	});
	
	this.process.on('close', function(){
		if(me.runLevel==3){
			me.process.kill()
		}
	}).on('exit', function(code, signal){
		me.runLevel = 4;
		me.Events.emit('exit', {'code': code, 'signal': signal});
	});
	return true;
};

Compiler.getFlag = function(flag){//Implement flags here
	return null;
};
Compiler.setFlag = function(flag, value){//Implement flags here
	return false;
};

Compiler.Executable = "/bin/cat"; //Replace this by your executable
Compiler.PreFileNameArgs = []; //Arguments prior to file name
Compiler.PostFileNameArgs = []; //Arguments after file name
Compiler.EmptyArguments = []; //Arguments for running compiler only. 

module.exports = Compiler;
