action.init = function(next){
	client.AuthServerClient.admin(adminKeys["username"], adminKeys["password"], function(success){
		if(success){
			next();
		} else {
			alert("Server auth Failure");		
		}
	});
};
