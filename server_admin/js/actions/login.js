action.login = function(next){

	var dialog = 
	$("<div>")
	.attr("title", "Authorising")
	.text("Authorising, waiting for the server, please wait....")
	.dialog({
		modal: true,
		dialogClass: 'noCloseDialog',
		closeOnEscape: false
	});

	client.AuthServerClient.admin(adminKeys["username"], adminKeys["password"], function(success){
		if(success){
			dialog.dialog('close').remove();
			next();
		} else {
			dialog.text("Server auth Failure");		
		}
	});
};
