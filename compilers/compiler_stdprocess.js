var lib = require("./../lib/misc"),
spawn = require('child_process').spawn,
path = require("path"),
fs = require("fs"),
events = require("events");

function Compiler(callback, cwd, userData, dirname, filename)
{
	try{
		this.Events = new events.EventEmitter();

		this.Events
		.on('ctrlC', function(){
			if(this.runLevel != 3){
				return;	
			}
			//send CTRL-C
			this.process.kill("SIGINT");		
		}).on('ctrlD', function(){
			if(this.runLevel != 3){
				return;	
			}
			//send CTRL-D / End process
			this.process.stdin.end();
		}).on('stdIn', function(data){
			if(this.runLevel != 3){
				return;
			}
			//send STDIN
			this.process.stdin.resume()
			this.process.write(data+"\n", 'utf-8');
		});

		this.runLevel = 1;
		this.process = null;

		this.cwd = path.resolve(cwd);

		this.compilerArgs = Compiler.EmptyArguments;

		if(typeof dirname == 'string' && typeof filename == 'string'){
			this.compilerArgs = Compiler.PreFileNameArgs.concat([path.resolve(path.join(dirname, filename))], Compiler.PostFileNameArgs);
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
		Compiler.Executable, 
		this.compilerArgs,
		{
			'cwd': this.cwd
		}
	);
	
	this.process.stdout.on('data', function(data)
	{
		me.Events.emit("stdout", lib.toRealString(data));	
	});
	
	this.process.stderr.on('data', function (data) {
	 	me.Events.emit("stderr", lib.toRealString(data));	
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

Compiler.Executable = "/bin/cat"; //Replace this by your executable
Compiler.PreFileNameArgs = []; //Arguments prior to file name
Compiler.PostFileNameArgs = []; //Arguments after file name
Compiler.EmptyArguments = []; //Arguments for running compiler only. 
Compiler.supportedFileExtensions = ['txt']; //Supported File Extensions


Compiler.compilerName = "<Standard Process Compiler>"; 
Compiler.compilerVersion = "<Insert Version here>";
Compiler.compilerDescription = "<Insert Description here>";

module.exports = Compiler;
