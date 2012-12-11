//Settings dialog
jQuery(function(){
	dialog.settings = $("<div>")
	.append(
		$("<ul>").append(
			'<li><a href="#settingstab-1">General</a></li>',
			'<li><a href="#settingstab-2">Compiler</a></li>'
		),
		$('<div id="settingstab-1">').append('<p>There are no general settings you can edit (yet). </p>'),
		$('<div id="settingstab-2">').append('<p>There are no compiler settings you can edit (yet). </p>')
	).tabbedDialog({autoOpen: false, modal: false, width: 800, height: 600}, {});
	
	$("#settings").enabled_click(function(){dialog.settings.dialog("open").tabs({selected: 0});});
	$("#settings_compiler").enabled_click(function(){dialog.settings.dialog("open").tabs({selected: 1});});
});
