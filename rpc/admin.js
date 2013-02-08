var WebServer = require("./../networking/webserver"),
auth = require("./../auth/auth"),
client = require("./client"),
config = require("./../config/config");

var adminAuth = WebServer.basicAuth('Admin Page', 
	function(user, pass){
		return (new auth.request('admin', {'username': user, 'password': pass})).success;
	}, 
	[
		WebServer.subServer("docs", WebServer.staticServer(__dirname+'/./../docs', {"indexFile": "index.txt"})),
		WebServer.staticRequest("js/auth_data.js", WebServer.provideJS("adminKeys", function(req, data){return data.basicAuth;})),
		WebServer.staticServer(__dirname+'/./../server_admin')
	],
	WebServer.textServer('Authorisation failure. ')
)

adminAuth.services = function(socket, rpcAuth){
	process.send(['Session.Admin.Access']);
	var rpc_client = new client("localhost", config.server.port, rpcAuth["username"], rpcAuth["password"]);
	
	socket.on('admin_rpc', function(data){
		process.send(['Session.Admin.RPCRequest', data['method']]);
		rpc_client(data['method'], data['args'], function(error, err, result){
			socket.emit('admin_rpc', {'success': err?false:true, 'error': err, 'result': result});
		});
	});
	socket.on('disconnect', function(){
		process.send(['Session.Admin.Exit']);
	});
};

module.exports = adminAuth;
