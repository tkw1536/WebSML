//SOCKETIO Client
var client = (function(){
	var cl = {};
	var socket = io.connect('http://localhost');//Connect to localhost or whatever...
	cl.on = function(ev, handler){
		socket.on(ev, handler);
		return cl;
	};
	cl.once = function(ev, handler){
		socket.once(ev, handler);
		return cl;
	};
	cl.off = function(ev){
		socket.off(ev);
		return cl;	
	};
	cl.emit = function(ev, args){
		socket.emit(ev, args);
		return cl;	
	};
	return cl;
})();
