var WebServer = require("./../networking/webserver"),
auth = require("./../auth/auth"),
client = require("./client"),
config = require("./../config/config");

var adminAuth = WebServer.basicAuth('Admin Page', 
	function(user, pass){
		return (new auth.request('admin', {'username': user, 'password': pass})).success;
	}, 
	WebServer.make([
		WebServer.staticRequest("js/auth_data.js", WebServer.provideJS("adminKeys", function(url, req){return req.RequestParams.auth;})),
		WebServer.staticServer(__dirname+'/./../server_admin')
	]), 
	WebServer.textServer('Authorisation failure. ')
)

adminAuth.services = function(socket, rpcAuth){
	var rpc_client = new client("localhost", config.server.port, rpcAuth["username"], rpcAuth["password"]);
	
	socket.on('admin_rpc', function(data){
		rpc_client(data['method'], data['args'], function(error, err, result){
			socket.emit('admin_rpc', {'success': err?false:true, 'error': err, 'result': result});
		});
	});
};

module.exports = adminAuth;