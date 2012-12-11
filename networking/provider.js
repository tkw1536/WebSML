var path = require('path');

var ERROR_HANDLER = function(e){console.log("FATAL: PROVIDER ERROR"); console.log(e); process.exit(); };//TODO: Properly handle this

var Service = {};
//for the entire system
Service.ServiceProvider = function(init, new_client, end){
	return function(server, port)
	{
		var initObj = init(server, port, ERROR_HANDLER);
		this.new_client = function(handler)
		{
			new_client(initObj, handler, ERROR_HANDLER);
			return this;
		};
		this.end = function(){
			end(initObj);
			return this;
		};
	};
};

//for single sockets
Service.SocketServiceProvider = function(on, once, off, emit, end){
	this.on = function(ev, handler){
		on(ev, handler);
		return this;	
	};
	
	this.once = function(ev, handler){
		once(ev, handler);
		return this;	
	};

	this.off = function(ev){
		off(ev);
		return this;	
	};

	this.emit = function(ev, args){
		emit(ev, args);
		return this;	
	};

	this.end = function(){
		end();
		return this;	
	};
};

Service.getProvider = function(prov){
	return [require("./provider."+prov+".js"), 
		path.resolve(path.join(__dirname, "./provider.client."+prov+".js"))];
};


module.exports = Service;
