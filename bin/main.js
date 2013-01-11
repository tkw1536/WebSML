var fork = require('child_process').fork,
join = require('path').join;

var worker;
var logger;
var loggerEvents = new (require('events').EventEmitter)();
var stayAlive = false;

var workerLoop = function(){
	stayAlive = false;
	logger.send(['log', 'System.Start']);
	worker = fork(join(__dirname, "server.js"));
	worker.on('message', messageHandler);
	worker.once('exit', function(){
		logger.send(['log', 'System.Stop']);
		if(!stayAlive){
			do_exit();
		}
	});
};

var messageHandler = function(m){
	if(typeof m != 'string'){//Log an Event
		var ev = m[0];
		var args = m.slice(1);
		logger.send(['log', ev, args]);
	} else if(m==='restart'){
		restart();
	} else if(m==='stop'){
		exit();
	}
};

var exit = function(){

	if(worker.connected){
		loggerEvents.on('System.Stop', do_exit);
		worker.kill('SIGTERM');
	} else {
		do_exit();
	}

	
	return false;
	
};

var do_exit = function(){
	logger.kill('SIGTERM');
	logger.on('exit', function(){
		process.exit(0);//Wait for logger to exit
	});	
};

var restart = function(w){
	stayAlive = true;
	logger.send(['log', 'System.Restart', []]);
	loggerEvents.once('System.Stop', function(e){
		workerLoop();
	});
	worker.kill('SIGTERM');
	
};

/* Logger */
logger = fork(join(__dirname, "logger.js"));
logger.send(['create', []]);
logger.on('message', function(m){
	loggerEvents.emit(m);
});

process.once('SIGINT', function(){
	logger.send(['log', 'System.SignalReceived', 'SIGINT']);
	exit();
	return false;
});

process.once('SIGTERM', function(){
	logger.send(['log', 'System.SignalReceived', 'SIGTERM']);
	exit();
	return false;
});




workerLoop();
