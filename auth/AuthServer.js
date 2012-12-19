var auth = require("./auth");

var authServer = function(Provider, onAuth){
	Provider.new_client(
		function(socket)
			{
				socket
				.on('makeCredentials', function(data){
					try{
						var authObj = auth.makeCredentials(data['user'], data['pass'], function(authObj, err){
							if(err){
								socket.emit('credentialsStatus', {'success': false});
							} else {
								socket.emit('credentialsStatus', {'success': true, 'authObj': authObj});
							}
						});
					} catch(e){
						socket.emit('credentialsStatus', {'success': false});
					}
				}).on('auth', function(data){
					try{
						var cred = data['credentials'];
						auth.validCredentials(cred, function(valid){
							auth.getUserData(cred, function(userData){
								socket.emit('authStatus', {'success': valid});
								onAuth(socket, cred, userData);
							});
							
						});
						
						
					} catch(e){
						socket.emit('authStatus', {'success': false});
					}
				})
				.emit('serverReady');
			}	
	);
	return auth;
}

module.exports = authServer;
