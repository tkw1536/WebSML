//Auth Server Client
client.AuthServerClient = (function(socket){
	return function(sid, callback){
		socket
		.once('auth_request', function(data){
			var success = data['success'];
			callback(success);
		})
		.emit('auth_request', {'role': 'client', 'data':{'id':sid}})
	};
})(client);

client.AuthServerClient.admin =(function(socket){
	return function(user, pass, callback){
		socket
		.once('auth_request', function(data){
			var success = data['success'];
			callback(success);
		})
		.emit('auth_request', {'role': 'admin', 'data':{'username':user, 'password': pass}})
	};
})(client)
