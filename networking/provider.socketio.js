//Provider for socket.io
var provider = require("./provider"),
socket = require("socket.io");

module.exports = provider.ServiceProvider(
	function(server, port, ERROR_HANDLER){//init
		var io = socket.listen(server);
		io.enable('browser client minification');  // send minified client
		io.enable('browser client etag');          // apply etag caching logic based on version number
		io.enable('browser client gzip');          // gzip the file
		io.set('log level', 1);                    // reduce logging

		// enable all transports (optional if you want flashsocket support, please note that some hosting
		// providers do not allow you to create servers that listen on a port different than 80 or their
		// default port)
		io.set('transports', [
			'websocket'
			, 'flashsocket'
			, 'htmlfile'
			, 'xhr-polling'
			, 'jsonp-polling'
		]);
		return io;
	},
	function(sok, handler, ERROR_HANDLER){//new_client
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

