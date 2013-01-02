var config = require("./../config/config"),
auth = require("./../auth/auth"),
WebServer = require("./../networking/webserver"),
lib = require("./../lib/misc"),
jayson = require('jayson');

/*
	JASON
*/

var yason_wrapper = function(params, func, firstObj, thisObj){
	var args = [];
	for(var i=0;i<params.length-1;i++){
		args.push(params[i]);
	}
	var callback = lib.lastMember(params);
	callback(firstObj, func.apply(thisObj, params));
};

var server = jayson.server({
	echo: function() {//Echoes everything back
		yason_wrapper(arguments, function(){
			return arguments;
		});
	},
	restart: function(){
		yason_wrapper(arguments, function(t){
			setTimeout(function(){process.send("restart");}, (typeof t=='number')?t:1000);return true;
		});
	},
	stop: function(){
		yason_wrapper(arguments, function(t){
			setTimeout(function(){process.send("stop");}, (typeof t=='number')?t:1000);return true;
		});
	},
	passwd: function(){
		yason_wrapper(arguments, function(identity, user, pass){//Change user name and pass, requires restart
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
		});
	},
	"register_session": function(){
		yason_wrapper(arguments, function(user, data){
			return auth.session.register(user, data);
		});
	},
	"expire_session": function(){
		yason_wrapper(arguments, function(id){
			return auth.session.expire(id);
		});
	}
});

module.exports = WebServer.make([
	WebServer.staticRequest('rpc_form', WebServer.file("./../rpc/client.html", "text/html", 200)),
	WebServer.staticRequest('/', 
			WebServer.basicAuth('RPC Access', 
				function(user, pass){
					return (new auth.request('rpc', {'username': user, 'password': pass})).success;
				}, 
				WebServer.otherServer(server.http()), 
				WebServer.textServer('Authorisation failure. ')
			)
	),
	WebServer.forward('/admin')
]);
