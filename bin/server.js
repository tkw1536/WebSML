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
		userData['session'].Events.on('kick', function(){socket.end()});
		var fs = new FileServer(socket, {'root': userData['cwd']});
		var cs = new CompilerServer(socket, userData['cwd'], authServer);
	},
	admin.services
);

process.once('SIGTERM', function(){
	server.close();
	process.exit(0);
});

process.once('SIGINT', function(){});

