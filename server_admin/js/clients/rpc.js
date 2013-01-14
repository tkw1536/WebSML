client.rpc = function(method, args, callback){
	var args = (typeof args == 'undefined')? []:args;
	var callback = (typeof callback == 'function')?callback:function(){};
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
