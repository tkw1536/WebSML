//Logout dialog
jQuery(function(){
	dialog.logout = function(callback){
		// Stuff to do before logout
		dialog.confirm("Logout", "Are you sure you want to logout? \nAll unsaved changes will be discarded. ", 150, callback, function(){});
	};
	$("#logout").enabled_click(function(){
		dialog.logout(function(){location.reload();});	
	});
});
