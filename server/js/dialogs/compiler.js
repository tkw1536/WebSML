$(function(){
	var running = false;

	dialog.runCompiler = function(dirName, fileName){
		if(running){
			dialog.alert("Cannot start compiler", "Another compiler instance is already running, please close it first. ");
			return false;
		}
		$("#ctrlc, #ctrld").parent().removeClass('ui-state-disabled');

		var div = $("<div>")
		.dialog({"title": fileName+" ["+dirName+"] - Compiler", "width": 800, "height": 450, "autoEnable": false})

		.webTerminal(function(e){client.CompilerServerClient.stdIn(e); }, {prompt: ">", greetings: null, otherKey: function(e){$(document).trigger("keydown", e);div.click();}});

		div.on('dialogclose', function(){
			if(running){
				client.CompilerServerClient.ctrlD();
				running = false;
				div.webTerminal("disable");
			}
			div.remove();
			$("#ctrlc, #ctrld").parent().addClass('ui-state-disabled');
		});

		client.CompilerServerClient.runFile(dirName, fileName, function(success){
			if(!success){
				console.log("False");
				div
				.webTerminal("echo", "[FATAL] Server side error. Make sure the filetype is supported. ", function(){this.css("color", "red");})
				.webTerminal("disable");
			} else {
				running = true;
				div.webTerminal("enable");	
			}
		}, function(stdOut){
			div.webTerminal("echo", stdOut);
		}, function(stdErr){
			
		}, function(endCode){
			//Terminal ended
			div.webTerminal("echo", "", function(e){
				var color = 'white';
				if(endCode['code'] == 0){
					color = 'green';
				} else if(endCode['code'] == 1){
					color = 'red';
				} else if(endCode['code'] == 127){
					color = 'yellow';
				}
				e.append("Process terminated with code ", $("<b>").text(endCode['code']).css("color", color));
				e.append(endCode.code == 127?" (executable not found on server)":"");
			});
			div.webTerminal("disable");
			running = false;
		});
		
	}

	$("#ctrlc").enabled_click(function(){client.CompilerServerClient.ctrlC();});
	$("#ctrld").enabled_click(function(){client.CompilerServerClient.ctrlD();});
});
