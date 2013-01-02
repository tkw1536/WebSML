var auth = require("./auth");

var authServer = function(Provider, onAuth, onAdminAuth){
	Provider.new_client(
		function(socket)
			{
				socket
				.on('auth_request', function(data){
					try{
						var request = new auth.request(data['role'], data['data']);
						socket.emit('auth_request', {'success': request.success});
						if(request.success){
							if(request.role == 'admin'){
								onAdminAuth(socket, request.credentials)
							} else {
								onAuth(socket, request.credentials, request.userData)
							}
						}
					} catch(e){}
				});
			}	
	);
	return auth;
}

module.exports = authServer;
