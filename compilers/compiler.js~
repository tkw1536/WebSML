//running a compiler
var lib = require("./../lib/misc"),
spawn = require('child_process').spawn,
path = require("path"),
fs = require("fs"),
events = require("events");


function Compiler(compiler)
{
	this.options = lib.extend(
		{
			"name": "",
			"executablePath": "",
			"FileInput": false,
			"FileInputExtension": "",
			"arguments": []
		},
		compiler	
	);
	this.runLevel = 0;
	this.process = null;
	this.cd = "";
	this.Events = new events.EventEmitter();
	this.tmpFile = "";
}

Compiler.prototype.prepare = function(code, tmpFile, cd)
{
	this.cd = path.resolve(cd);
	if(this.runLevel>0){
		return false; //We're already prepared	
	}
	this.runLevel = 1;
	if(this.options.FileInput)
	{
		var me = this;
		var tmpFile = path.resolve(tmpFile+"."+this.options.FileInputExtension);
		me.tmpFile = tmpFile;
		//FileInput
		fs.writeFile(tmpFile, code, function(err){
			if(err){
				me.Events.emit("processPrepared", {'success': false});
			} else {
				me.options.arguments.push(tmpFile);
				
				me.runLevel = 2;
				me.Events.emit("processPrepared", {'success': true});
			}	
		});
	} else {
		//noFile Input
		this.options.arguments.push(code);
		this.runLevel = 2;
		this.Events.emit("processPrepared", {'success': true});
	}
	return true;
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
		this.options.executablePath, this.options.arguments,
		{
			'cwd': this.cd
		});
	this.process.stdout.on('data', function(data)
	{
		me.Events.emit("stdout", lib.toRealString(data));	
	})
	this.process.stderr.on('data', function (data) {
	 	me.Events.emit("stderr", lib.toRealString(data));	
	});
	this.process.on('close', function(){
		if(me.runLevel==3){
			me.process.kill()
		}
	}).on('exit', function(code, signal){
		me.runLevel = 4;
		me.Events.emit('exit', {'code': code, 'signal': signal, 'tmpFile': me.tmpFile});
	});
	return true;
}

Compiler.prototype.run = function(code, fspath, fs)
{
	var me = this;
	var file = path.join(fspath, lib.lastMember(Math.random().toString().split(".")));
	this.Events.once("processPrepared", function(d)
	{
		d = d['success'];
		if(d==true)
		{
			me.start();
		}
	});
	this.prepare(code, file, fs);
}

Compiler.prototype.ctrlC = function(){
	if(this.runLevel != 3){
		return false;	
	}
	//send CTRL-C
	this.process.kill("SIGINT");
	return true;
}

Compiler.prototype.ctrlD = function(){
	if(this.runLevel != 3){
		return false;	
	}
	//send CTRL-D / End process
	this.process.stdin.end();
	return false;
}

Compiler.prototype.stdIn = function(data)
{
	if(this.runLevel != 3){
		return false;
	}
	//send STDIN
	this.process.stdin.resume()
	this.process.write(data+"\n", 'utf-8');
	return true;
}

Compiler.make = function(des)
{
	return new Compiler(require("./compiler."+des));
}
Compiler.makeCompiler = function(des, registerDefault)
{
	var c = Compiler.make(des);
	if(registerDefault==true)
	{
		c.Events.on('stdout', function(str){
			console.log(str);
		}).on('exit', function(status)
		{
			console.log("Ended with code: "+status['code'].toString());
			var file = status["tmpFile"];
			fs.unlink(file);
			console.log(file);
		});	
	}
	return c;
}

module.exports = Compiler;
