//Main Process for handling logging. 
var path = require("path"),
fs = require('fs'),
currentLog = undefined,
logDir = path.resolve(path.join(__dirname, "/../logs/"));

var now = function(){
	return (new Date()).getTime();
};

var Log = {};

Log.init = function(time){
	this.Events = [];
	this.lastFlush = time;
	this.file = path.resolve(path.join(logDir, time.toString()+".log"));
	return this;
};

Log.log = function(evt, args){
	args = args || [];
	var ev = [now(), evt, args];
	console.log(Log.stringify(ev));
	this.Events.push(ev);
	if(now()-this.lastFlush>60000){//Flush every minute
		Log.flush.apply(this, []);
	}
};

Log.stringify = function(ev){
	EventString ="[";
	EventString +=new Date(ev[0]).toUTCString();
	EventString +="] ";
	EventString += ev[1];
	if(ev[2].length > 0){
		EventString += ": ";
		if(typeof ev[2] == 'string' || ev[2].length == 1){
			EventString += (typeof ev[2] == 'string')?ev[2]:ev[2][0];
		} else {
			EventString += "["+ev[2].join()+"]";
		}
	};
	return EventString;
};

Log.flush = function(){
	if(!fs.existsSync(logDir)){
		fs.mkdirSync(logDir);
	}
	fs.appendFileSync(this.file, "\n"+this.Events.map(Log.stringify).join("\n"), 'utf8');
	this.lastFlush = now();
	this.Events = [];
};

process.on('message', function(m){
	var target = m[0];
	if(target == 'init'){
		currentLog = {};
		var logFileName = parseInt(process.argv[2]);
		currentLog = Log.init.call(currentLog, logFileName);
	} else if(target == 'log'){
		if(typeof currentLog != "undefined"){
			Log.log.apply(currentLog, m.slice(1));
			process.send(m[1]);
		}

	}
	
});

process.on('SIGTERM', function(){
	Log.flush.apply(currentLog);//Flush Cache to disk
	process.exit(0);
});

process.on('SIGINT', function(){});//Ignore sigint from parent

process.on('unhandledException', function(e){
	console.log("["+(new Date()).toUTCString()+"]", "Logger.InternalException", ":", JSON.stringify(e.stack));
});
