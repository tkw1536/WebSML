//Auth Server Client
client.AuthServerClient = (function(socket){
	return function(name, pass, callback){
		socket
		.once('credentialsStatus', function(data){
			if(data['success']){
				var authObj = data['authObj'];
				socket
				.once('authStatus', function(data){
					callback(data['success']);			
				})
				.emit('auth', {'credentials': authObj});
			} else {
				callback(false);		
			}
		}).emit('makeCredentials', {'user': name, 'pass': pass});
	};
})(client);
