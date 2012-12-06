//TODO: Implement client logic here

client.tryAuthorize = function(name, pass, callback){
	client
	.once('credentialsStatus', function(data){
		if(data['success']){
			var authObj = data['authObj'];
			client
			.once('authStatus', function(data){
				callback(data['success']);			
			})
			.emit('auth', {'credentials': authObj});
		} else {
			callback(false);		
		}
	}).emit('makeCredentials', {'user': name, 'pass': pass});
};
