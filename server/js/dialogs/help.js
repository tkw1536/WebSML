//Help dialog
jQuery(function(){
	var Help = [
		["Getting started", 
			"To run some code, you will first have to create a file and save it with the correct extension. <br />"
			+"To do so click <i>File->New (Ctrl+N)</i>, then enter your text and afterwards click <i>File->Save (Ctrl+S)</i>. You will be prompted to enter a filename. <br />"
			+"Then you can run your code by clicking <i>Compiler->Run Code (F5)</i>. <br />"
			+"A new window will open which will run your code. You can enter text at the bottom of that window, which will then be evaluated by the compiler. <br />"
			+"To interrupt the compiler, click <i>Compiler->Send CTRL-C (Ctrl+C)</i>. <br />"
			+"To stop the compiler, either just close the window or click <i>Compiler->Send CTRL-D (Ctrl+D)</i>. "
		]
	];

	
	dialog.help = $("<div>")

	var ul = $("<ul>").appendTo(dialog.help);

	for(var i=0;i<Help.length;i++){
		ul.append('<li><a href="#helptab-'+i.toString()+'">'+Help[i][0]+'</a></li>');
		dialog.help.append(
			$('<div id="helptab-'+i.toString()+'">').append($("<p>").html(Help[i][1]))
		);
	}

	dialog.help.tabbedDialog({autoOpen: false, modal: false, width: 800, height: 600}, {});
	
	$("#help").enabled_click(function(){dialog.help.dialog("open");});
});
