var config = require("./../config/config"),
auth = require("./../auth/auth"),
WebServer = require("./../networking/webserver"),
lib = require("./../lib/misc"),
fs = require("fs"),
path = require("path"),
jayson = require('jayson'),
session = require('./../auth/session');

var yason_wrapper = function(params, func, firstObj, thisObj){
	var args = [];
	for(var i=0;i<params.length;i++){
		args.push(params[i]);
	}
	var callback = args.pop();
	callback(firstObj, func.apply(thisObj, args));
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
			var s = session.register({"user": user, "data": {"cwd": cd}});
			process.send(['Session.Registered', s, user, cd]);
			session.get(s).Events.on('kick', function(){
				process.send(['Session.Expire', s]);
			})
			return s;
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
	},
	"logs.list": function(){
		yason_wrapper(arguments, function(){
			var logdir = path.join(__dirname, "/../logs/");
			return fs.readdirSync(logdir).filter(function(e){
				return fs.statSync(path.join(logdir, e)).isFile() && lib.endsWith(e, ".log");
			}).map(function(e){
				return e.split(".log")[0];
			});
		});
	},
	"logs.view": function(){
		yason_wrapper(arguments, function(name){
			var name = lib.defineIfNull(name, "").toString();
			var file = path.join(__dirname, "/../logs/", name+".log");
			try{
				return fs.readFileSync(file, "utf8"); 
			} catch(e){
				return "";
			}
		});
	},
	"server.getSessionId": function(){
		yason_wrapper(arguments, function(){
			return parseInt(process.argv[2]);
		});
	}
});

server.on('request', function(req){process.send(['Session.RPC.MethodCall', req.method]);});

module.exports = WebServer.make([
	WebServer.staticRequest('rpc_form', WebServer.file("./../rpc/client.html", "text/html", 200)),
	WebServer.staticRequest('/', 
			WebServer.basicAuth('RPC Access', 
				function(user, pass){
					return (new auth.request('rpc', {'username': user, 'password': pass})).success;
				}, 
				WebServer.otherServer(server.http()), 
				[function(req, res, data){process.send(['Session.RPC.AuthenticationError', 'INVALID_CREDENTIALS']); return false;}, WebServer.textServer('Authorisation failure. ')]
			)
	),
	WebServer.forward('/admin')
]);
