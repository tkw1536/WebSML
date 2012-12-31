var config = require("./../config/config"),
WebServer = require("./../networking/webserver");

/*
	Implements JSON-RPC 2.0 via get, see http://www.jsonrpc.org/specification; does **not** allow batch processing
*/

var commands = 
{
	"echo": function(){return arguments;},//Echo
	"restart": function(t){setTimeout(function(){process.send("restart");}, (typeof t=='number')?t:1000);return true;},//Restart server
	"stop": function(t){setTimeout(function(){process.send("stop");}, (typeof t=='number')?t:1000);return true;},//Stop server	
	"passwd": function(identity, user, pass){//Change user name and pass, requires restart
		if(identity == 'admin'){
			var old = config.db.readBaseKey('config', 'accessData');
			old["admin"] = {"username":user, "password": pass};
			config.db.writeBaseKey('config', 'accessData', old);
			return true;
		} else if(identity == 'rpc') {
			var old = config.db.readBaseKey('config', 'accessData');
			old["rpc"] = {"username":user, "password": pass};
			config.db.writeBaseKey('config', 'accessData', old);
			return true;
		} else {
			return false;
		}
	}
};

var JSONRPC_parse = function(pms, methods){
	var res = {"jsonrpc": "2.0", "id": null};
	try{
		var params = JSON.parse(pms);
		if(params.jsonrpc != "2.0"){
			res.error = {"code": -32600, "message": "Invalid request, wrong protocol?"};			
		} else {
			if(params.hasOwnProperty("method")){
				var method = params.method;
				if(methods.hasOwnProperty(method)){
					var args = [];
					if(params.hasOwnProperty("params")){
						if(params == ''){
							args = [];
						} else {
							args = JSON.parse(params.params);
						}
					}
					var func = methods[method];
					try{
						var funcres = func.apply(undefined, args);
						if(!params.hasOwnProperty("id") || params.id == ''){
							res.method = method;
							delete res.id;
						} else {
							res.id = params.id;
							res.result = funcres;
						}
					} catch(e){
						res.error = {"code": -32000, "message": "Internal method error. "};
					}
				} else {
					res.error = {"code": -32601, "message": "Method not found."};
				}
			} else {
				res.error = {"code": -32600, "message": "Invalid request, missing method name."};
			}
			
		}
	} catch(e){
		res.error = {"code": -32700, "message": "Parse error."};
	}
	return JSON.stringify(res);
}

module.exports = WebServer.make([
	WebServer.staticRequest('rpc_form', WebServer.file("./../auth/form.html", "text/html", 200)),
	WebServer.staticRequest('/', 
		WebServer.basicAuth('RPC Access', 
			function(user, pass){
				return (user == config.accessData.rpc.username && pass == config.accessData.rpc.password);
			}, 
			WebServer.make([
				WebServer.post(function(req, res){
					var str = '';
					req.on('data', function(d){
						str +=d;
					});
					req.on('end', function(){
						var result = JSONRPC_parse(str, commands);
						res.end(result);
					});
				}),
				function(req, res){
					res.end(JSON.stringify({"jsonrpc": "2.0", "id": null, "error": {"code": -32001, "message": "Needs post data. "}}));
					return true;
				}
			]),
			function(req, res){
				res.end(JSON.stringify({"jsonrpc": "2.0", "id": null, "error": {"code": -32000, "message": "Authorisation failed. "}}));
			}
		)
	),
	WebServer.forward('/rpc/rpc_form')
]);
