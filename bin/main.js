var fork = require('child_process').fork,
join = require('path').join;

var worker;

var messageHandler = function(m){
	if(m==='restart'){
		restart();
	} else if(m==='stop'){
		console.log("Stopping Server ....");
		worker.kill('SIGTERM');
		process.exit(0);
	}
};

var restart = function(w){
	console.log("Restarting Server ....");
	worker.kill('SIGTERM');
	workerLoop();
};

var workerLoop = function(){
	worker = fork(join(__dirname, "server.js"));
	worker.on('message', messageHandler);
};

process.once('SIGINT', function(){
	console.log("Caught SIGINT, shutting down ...");
	worker.kill('SIGTERM');
	process.exit(0);
});

process.once('SIGTERM', function(){
	console.log("Caught SIGTERM, shutting down ...");
	worker.kill('SIGTERM');
	process.exit(0);
});

workerLoop();
