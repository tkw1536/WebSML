var config = require("./../config/config"),
auth = require("./../auth/auth"),
WebServer = require("./../networking/webserver"),
lib = require("./../lib/misc"),
jayson = require('jayson'),
session = require('./../auth/session');

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
	"test.echo": function() {//Echoes everything back
		yason_wrapper(arguments, function(){
			return arguments;
		});
	},
	"server.restart": function(){
		yason_wrapper(arguments, function(t){
			setTimeout(function(){process.send("restart");}, (typeof t=='number')?t:1000);return true;
		});
	},
	"server.stop": function(){
		yason_wrapper(arguments, function(t){
			setTimeout(function(){process.send("stop");}, (typeof t=='number')?t:1000);return true;
		});
	},
	"config.credentials": function(){
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
	"session.hasActiveSession": function(){
		yason_wrapper(arguments, function(user){
			return session.hasActiveSession(user);
		})
	},
	"session.register": function(){
		yason_wrapper(arguments, function(user, cd, overwrite){
			if((typeof overwrite=='boolean')?overwrite:false){
				session.getAll().map(function(sessionItem){
					if(sessionItem.data().user == user){
						sessionItem.expire();
					}
				});
			}
			return session.register({"user": user, "data": {"cwd": cd}});
		});
	},
	"session.expire": function(){
		yason_wrapper(arguments, function(id){
			return session.expire(id);
		});
	},
	"session.list": function(){
		yason_wrapper(arguments, function(){
			return session.getAll().map(function(sessionItem){
				return [sessionItem.key, sessionItem.assoc(), sessionItem.lastAccess, sessionItem.data()];
			});
		})
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
