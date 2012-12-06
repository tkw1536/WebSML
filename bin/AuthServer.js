var auth = require("./auth");

var authServer = function(Provider, onAuth){
	return Provider.new_client(
		function(socket)
			{
				socket
				.on('makeCredentials', function(data){
					try{
						var authObj = auth.makeCredentials(data);
						socket.emit('credentialsStatus', {'success': true, 'authObj': authObj});
					} catch(e){
						socket.emit('credentialsStatus', {'success': false});
					}
				}).on('auth', function(data){
					try{
						var cred = data['credentials'];
						if(!auth.validCredentials(cred))
						{
							throw "UNAUTHORIZED-CREDENTIALS";//will be handled						
						}
						onAuth(socket, cred, auth.getUserData(cred));
						socket.emit('authStatus', {'success': true});
					} catch(e){
						socket.emit('authStatus', {'success': false});
					}
				})
				.emit('serverReady');
			}	
	);
}

module.exports = authServer;
