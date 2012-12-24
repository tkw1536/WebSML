//Help dialog
dialog.disconnect = function(){
	$("#menubar").find("li").addClass("ui-state-disabled");
	$("<div>")
	.attr("title", "Connection lost")
	.text("Connection to the server has been lost. Please check your network connection. \n All unsaved changes were lost. (Sorry about that...)")
	.dialog({
		modal: true,
		dialogClass: 'noCloseDialog',
		buttons: {
			'Reload Page': function(){location.reload();}
		},
		closeOnEscape: false
	});
};
