//Authorisation / Session Module
config = require("./../config/config");

//session: 
var db = config.db;

db.openBase("session", {});

var auth = {}
auth.request = function(role, data){
	this.role = role;
	if(this.role == 'admin'){
		auth.request.admin(this, data['username'], data['password']);	
	} else if(this.role == 'rpc'){
		auth.request.rpc(this, data['username'], data['password']);
	} else {
		auth.request.client(this, data['id']);
	}
};

auth.request.admin = function(me, user, pass){
	me.success = (user == config.accessData.admin.username && pass == config.accessData.admin.password);
	if(me.success){
		me.credentials = {
			"username": config.accessData.rpc.username,
			"password": config.accessData.rpc.password
		};
	};
};

auth.request.rpc = function(me, user, pass){
	me.success = (user == config.accessData.rpc.username && pass == config.accessData.rpc.password);
	if(me.success){
		me.credentials = {
			"username": config.accessData.rpc.username,
			"password": config.accessData.rpc.password
		};
	};
};

auth.request.client = function(me, id){
	me.success = db.hasBaseKey("session", id);
	if(me.success){
		var data = db.readBaseKey("session", id);
		
		me.credentials = {
			"username": data["user"]
		};
		me.userData = data["data"];
	};
};

auth.session = {
	"register": function(user, data){
		//Assign an id and store it in the database
		return db.writeBaseKey("session", undefined, {"user": user, "data": data});
	},
	"expire": function(id){
		return db.deleteBaseKey("session", id);
	}
};


module.exports = auth;
