//About dialog
jQuery(function(){
	dialog.about = $("<div>")
	.append(
		$("<ul>").append(
			'<li><a href="#abouttab-1">About</a></li>',
			'<li><a href="#abouttab-2">Used Libraries</a></li>',
			'<li><a href="#abouttab-3">License</a></li>'
		),
		$('<div id="abouttab-1">').append('<p><b>WebSML</b> was written in order to allow students to use the SML compiler online, rather than having to install it on every computer. </p>'),
		$('<div id="abouttab-2">').append('<p>The following software (libraries) are used inside WebSML: </p>'),
		$('<div id="abouttab-3">').append('<p>LICENSE TO BE DONE</p>')
	).tabbedDialog({autoOpen: false, modal: true, width: 800, height: 600}, {});

	//[SOFTWARE_NAME, SOFTWARE_LINK, SOFTWARE_VERSION, SOFTWARE_LICENSE, SOFTWARE_LICENSE_LINK]
	//Software used in this application
	var Softwares = [
		["nodejs", "http://nodejs.org/", "0.8.15", "Node's license", "https://raw.github.com/joyent/node/v0.8.15/LICENSE"],
		["jQuery", "http://jquery.com/", "1.8.3", "MIT License", "http://jquery.org/license/"],
		["jQuery UI", "http://jqueryui.com", "1.9.2", "MIT License", "http://jquery.org/license/"],
		["node-which", "https://github.com/isaacs/node-which", "1.0.5", "Unknown License", "https://raw.github.com/isaacs/node-which/master/LICENSE"],
		["jquery-dialogextend", "http://code.google.com/p/jquery-dialogextend/", "1.0.1", "MIT License", "http://www.opensource.org/licenses/mit-license.php"],
		["Socket.IO", "https://github.com/LearnBoost/socket.io/", "0.9.10", "MIT License", "https://raw.github.com/LearnBoost/socket.io/master/LICENSE"]
		
	];

	var MakeItem = function(software){
		var item = $("<li>").append(
			$("<b>").append(
				$("<a>")
				.attr("href", software[1])
				.text(software[0])
			),
			" (Version "+software[2]+"), released under ",
			$("<a>")
			.attr("href", software[4])
			.text(software[3])
		)
		item.find("a").hover(function(){
			$(this).css("text-decoration", "underline");
		}, function(){
			$(this).css("text-decoration", "none");
		}).css({
			"color": "black",
			"text-decoration": "none"		
		}).attr('target', '_blank');
		return item;
	};
	var ul = $("<ul>").appendTo(dialog.about.find("#abouttab-2"));
	for(var i=0;i<Softwares.length;i++){
		ul.append(MakeItem(Softwares[i]));
	}
	$("#about").enabled_click(function(){dialog.about.dialog("open");});
});
