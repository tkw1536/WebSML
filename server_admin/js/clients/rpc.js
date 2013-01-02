client.rpc = function(method, args, callback){
	client
	.once('admin_rpc', function(data){
		if(data['success']){
			callback(true, data['result']);
		} else {
			callback(false, data['error']);
		}
	})	
	.emit('admin_rpc', {'method': method, 'args': args});
};
