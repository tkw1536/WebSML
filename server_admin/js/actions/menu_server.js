action.menu_server = function(next){
	$("#stop").enabled_click(function(){
		dialog.confirm("Stopping the server", "Do you really want to stop the server? ", 200, function(){
			client.rpc("server.stop");
		}, function(){});
		
	});
	$("#restart").enabled_click(function(){
		dialog.confirm("Restarting the server", "Do you really want to restart the server? ", 200, function(){
			client.rpc("server.restart");
		}, function(){});
		
	});
	next();
};
