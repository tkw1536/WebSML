//Make a simple echo Server
var path = require("path"),
config = require("./../config/config"),
WebServer = require("./../networking/webserver"),
provider = require("./../networking/provider"),
authServer = require("./../auth/AuthServer"),
admin = require("./../rpc/admin"),
rpc = require("./../rpc/rpc")
FileServer = require("./FileServer"),
CompilerServer = require("./../compilers/compilerServer"),
sessionServer = require("./../auth/sessionServer");

var provider_data = provider.getProvider(config.server.provider);//Get the provider

var sessionStore = {};

//Make the webserver
var server = WebServer(
	WebServer.subServer('rpc', rpc),
	WebServer.subServer('admin', admin),
	//Public Server
	WebServer.session(false, undefined, sessionStore, 
		[
			sessionServer,			
			WebServer.staticRequest('js/clients/provider.js', WebServer.file(provider_data[1], "text/javascript", 200)),
			WebServer.staticServer(__dirname+'/./../server')
		]
	)
).listen(config.server.port);

var provider = new provider_data[0](server, config.server.port);

var authServer = authServer(provider, 
	function(socket, cred, userData){

		var fs = FileServer(socket, {'root': userData['cwd']});
		var cs = CompilerServer(socket, userData['cwd'], authServer);

		process.send(['Session.Access', userData.session.key]);
		socket.on('disconnect', function(){
			process.send(['Session.Exit', userData.session.key]);
		});
		userData['session'].Events.on('kick', function(){socket.end()});
		
		cs.on('on', function(filename, ok){
			if(ok){
				process.send(['Session.Interpreter.Start', userData.session.key, filename]);		
			}
		});
		cs.on('exit', function(filename){
				process.send(['Session.Interpreter.Exit', userData.session.key, filename]);
		});
		
		fs.on('listDir', function(dir){
			process.send(['Session.FileSystem.ListDir', userData.session.key, dir]);
		});
	
		fs.on('makeDir', function(dir){
			process.send(['Session.FileSystem.MakeDir', userData.session.key, dir]);
		});
	
		fs.on('deleteDir', function(dir){
			process.send(['Session.FileSystem.DeleteDir', userData.session.key, dir]);
		});

		fs.on('readFile', function(file){
			process.send(['Session.FileSystem.ReadFile', userData.session.key, file]);
		});
	
		fs.on('writeFile', function(file){
			process.send(['Session.FileSystem.WriteFile', userData.session.key, file]);
		});
	
		fs.on('deleteFile', function(file){
			process.send(['Session.FileSystem.DeleteFile', userData.session.key, file]);
		});

		
	},
	admin.services
);

process.once('SIGTERM', function(){
	server.close();
	process.exit(0);
});

process.once('SIGINT', function(){});

process.on('uncaughtException', function(e){
	process.send(['System.Error', e.stack]);
	process.exit(0);
});
