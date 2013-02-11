var EventEmitter = require("events").EventEmitter,
config = require("./../config/config");
var now = function(){return (new Date()).getTime();};
var sessionCache = [];//untaken session Id
var validSessions = [];
var sessionData = {};
var maxLength = config.session.autoExpire*1000; //1 Hour
var newKey = function(){
	var rnd = function(){return Math.random().toString().split(".")[1];};
	return now().toString()+"_"+rnd()+"_"+rnd();
};

var Session = function(data){
	this.Events = new EventEmitter();
	var assoc = false;
	this.key = newKey();
	this.associate = function(key){
		this.ping();
		if(assoc!=false){return false;}
		assoc = key;
		sessionCache.splice(sessionCache.indexOf(this.key), 1);
		validSessions.push(this.key);
		return true;
	};

	this.validate = function(key){
		return (assoc != false && assoc == key);	
	};

	this.ping = function(){
		this.Events.emit("ping");
		this.lastAccess = now();
	};

	this.data = function(){
		return data;
	}

	this.expire = function(){
		this.kick();
		var id = this.key;
		var sIndex = sessionCache.indexOf(id);
		if(sIndex != -1){sessionCache.splice(sIndex, 1);}
		var sIndex = validSessions.indexOf(id);
		if(sIndex != -1){validSessions.splice(sIndex, 1);}
		if(sessionData.hasOwnProperty(id)){delete sessionData[id]; return true;} else {return false;}
	};

	this.kick = function(){
		this.ping();
		this.Events.emit("kick");
	};

	this.assoc = function(){
		return assoc?true:false;
	};

	sessionData[this.key] = this;
	sessionCache.push(this.key);
	this.ping();
};

module.exports = {
	"register": function(data){
		module.exports.cleanup();
		var session = new Session(data);
		return session.key;
	},
	"cleanup": function(){
		for(var key in sessionData){
			var session = sessionData[key];
			if(maxLength > 0 && session.lastAccess + maxLength < now()){
				session.expire();			
			}
		}
	},
	"expire": function(id){
		module.exports.cleanup();
		if(module.exports.has(id)){
			return sessionData[id].expire();
		} else {
			return false;		
		}
	},
	"has": function(id){
		module.exports.cleanup();
		return sessionData.hasOwnProperty(id);
	},
	"hasActiveSession": function(user){
		var sessions = module.exports.listAll();
		for(var i=0;i<sessions.length;i++){
			try{
				var sessionItem = module.exports.get(sessions[i]);
				if(sessionItem.data().user == user && sessionItem.assoc()){
					return true;
				}
			} catch(e){};
		}
		return false;	
	},
	"associate": function(id, key){
		module.exports.cleanup();
		if(sessionCache.indexOf(id)>-1){
			return sessionData[id].associate(key);
		}
		return false;
	},
	"validate": function(id, key){
		module.exports.cleanup();
		if(validSessions.indexOf(id)>-1){
			return sessionData[id].validate(key);
		}
		return false;
	},
	"returnData": function(id, key){
		module.exports.cleanup();
		if(validSessions.indexOf(id)>-1){
			return sessionData[id].data(key); 
		}
	},
	"get": function(id){
		if(module.exports.has(id)){
			return sessionData[id];		
		}
	},
	"getAll": function(){
		var sess = [];
		var keys = module.exports.listAll();
		for(var i=0;i<keys.length;i++){
			sess.push(module.exports.get(keys[i]));
		}
		return sess;
	},
	"listAll": function(){
		var keys = [];
		for(var id in sessionData){
			if(module.exports.has(id)){
				keys.push(id);
			}	
		}
		return keys;
	}
};
