var fork = require('child_process').fork,
join = require('path').join;

var worker;

var messageHandler = function(m){
	if(m==='restart'){
		restart();
	}
};

var restart = function(w){
	console.log("Restarting Server ....");
	worker.send('exit_gracefully');
	workerLoop();
};

var workerLoop = function(){
	worker = fork(join(__dirname, "server.js"));
	worker.on('message', messageHandler);
};

process.once('SIGINT', function(){
	console.log("Caught SIGINT, shutting down ...");
	worker.send('exit_gracefully');
});

workerLoop();
