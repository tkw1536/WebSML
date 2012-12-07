//Provider for socket.io
var provider = require("./provider"),
socket = require("socket.io");

module.exports = provider.ServiceProvider(
	function(server){//init
		return socket.listen(server);
	},
	function(sok, handler){//new_client
		sok.on('connection', function(sock){
			var SProvider = new provider.SocketServiceProvider(
				function(ev, handler){//on
					sock.on(ev, function(data){
						handler(data, SProvider);
					});
				},
				function(ev, handler){//once
					sock.once(ev, function(data){
						handler(data, SProvider);
					});
				},
				function(ev){//off
					sock.removeAllListeners(ev);
				},
				function(ev, args){//emit
					sock.emit(ev, args);
				},
				function(){//end
					sock.disconnect();
				}
			);			
			handler(SProvider);
		});	
	},
	function(sok){//end
		sok.close();
	}
);

