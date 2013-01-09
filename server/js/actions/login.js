(function(){
	action.login = function(next_step){
		var dialog = 
		$("<div>")
		.attr("title", "Authorising")
		.text("Authorising, waiting for the server, please wait....")
		.dialog({
			modal: true,
			dialogClass: 'noCloseDialog',
			closeOnEscape: false
		});
		client.AuthServerClient(sessionId, function(success){
			if(success){
				dialog.dialog("close");
				next_step();
			} else {
				dialog.text("Authorisation failed. Please try again. ");
			}
		});
	};
})();
