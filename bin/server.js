//Make a simple echo Server
var path = require("path"),
config = require("./../config/config")
WebServer = require("./../networking/webserver"),
provider = require("./../networking/provider"),
authServer = require("./../auth/AuthServer"),
FileServer = require("./FileServer"),
CompilerServer = require("./../compilers/compilerServer");

var provider_data = provider.getProvider(config.server.provider);//Get the provider

//Make the webserver
var server = WebServer([
	WebServer.subServer('rpc', 
		WebServer.make([
			WebServer.post(WebServer.nullServer()),
			WebServer.get(WebServer.textServer("You cant do this right now, you need POST. [FYI: RPC is not yet implemented]",200))			
		])
	),
	WebServer.subServer('admin', WebServer.textServer('Admin Panel not yet implemented. ', 200)),
	//Public Server
	WebServer.staticRequest('js/clients/provider.js', WebServer.file(provider_data[1], "text/javascript", 200)),
	WebServer.post(WebServer.textServer('', 200)),
	WebServer.staticServer(__dirname+'/./../server')
], config.server.port);

var provider = new provider_data[0](server, config.server.port);

var authServer = authServer(provider, 
	function(socket, cred, userData){
		var fs = new FileServer(socket, {'root': userData['HomeFolder']});
		var cs = new CompilerServer(socket, userData['HomeFolder'], userData['HomeFolder'], authServer);
	}
);

process.on('message', function(m){
	if(m === 'exit_gracefully'){
		server.close();	
		process.kill();
	}
});

