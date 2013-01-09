//Authorisation / Session Module
var config = require("./../config/config"),
session = require("./session");


//session: 
var db = config.db;

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
	try{
		var ids = id.split(":");
		me.success = session.validate(ids[0], ids[1]);
		if(me.success){
			var data = session.returnData(ids[0], ids[1]);
			me.credentials = 
			{
				"username": data.user
			};
			me.userData = data.data;
			me.userData.session = session.get(ids[0]);
		};
	} catch(e){
		me.success = false;
	}
};



module.exports = auth;
