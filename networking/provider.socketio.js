//Provider for socket.io
var provider = require("./provider"),
socket = require("socket.io");

socket.enable('browser client minification');  // send minified client
socket.enable('browser client etag');          // apply etag caching logic based on version number
socket.enable('browser client gzip');          // gzip the file
socket.set('log level', 1);                    // reduce logging

// enable all transports (optional if you want flashsocket support, please note that some hosting
// providers do not allow you to create servers that listen on a port different than 80 or their
// default port)
socket.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);


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

