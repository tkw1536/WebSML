
//Sample RPC Client
var jayson = require('jayson');
var makeAuth = function(username, password){return 'Basic ' + new Buffer(username + ':' + password).toString('base64');};

var WebSMLRPCclient = function(host, port, user, pass){
	var client = jayson.client.http({
	  host: host,
	  port: port,
	  path: '/rpc',
	  headers: {'Authorization': makeAuth(user, pass)}
	});

	return function(){
		return client.request.apply(client, arguments);
	};
};

/*
var client = WebSMLRPCclient('localhost', 80, 'test', 'test');
client('echo', ['some nice parameters', 'again'], function(err, error, result){
	console.log(result);
});
*/
module.exports = WebSMLRPCclient;



