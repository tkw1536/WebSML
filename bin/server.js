//Make a simple echo Server
var path = require("path"),
config = require("./../config/config"),
WebServer = require("./../networking/webserver"),
provider = require("./../networking/provider"),
authServer = require("./../auth/AuthServer"),
admin = require("./../rpc/admin"),
rpc = require("./../rpc/rpc")
FileServer = require("./FileServer"),
CompilerServer = require("./../compilers/compilerServer");

var provider_data = provider.getProvider(config.server.provider);//Get the provider

console.log(provider_data[1]);

//Make the webserver
var server = WebServer(
	WebServer.subServer('rpc', rpc),
	WebServer.subServer('admin', admin),
	//Public Server
	WebServer.staticRequest('js/clients/provider.js', WebServer.file(provider_data[1], "text/javascript", 200)),
	WebServer.staticServer(__dirname+'/./../server')
).listen(config.server.port);

var provider = new provider_data[0](server, config.server.port);

var authServer = authServer(provider, 
	function(socket, cred, userData){
		var fs = new FileServer(socket, {'root': userData['HomeFolder']});
		var cs = new CompilerServer(socket, userData['HomeFolder'], userData['HomeFolder'], authServer);
	},
	admin.services
);

process.once('SIGTERM', function(){
	server.close();
	process.exit(0);
});

process.once('SIGINT', function(){});

