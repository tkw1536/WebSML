//Help dialog
jQuery(function(){
	dialog.help = $("<div>")
	.append(
		$("<ul>").append(
			'<li><a href="#helptab-1">General</a></li>'
		),
		$('<div id="helptab-1">').append('<p>Help is not yet implemented.  </p>')
	).tabbedDialog({autoOpen: false, modal: false, width: 800, height: 600}, {});
	
	$("#help").enabled_click(function(){dialog.help.dialog("open");});
});
