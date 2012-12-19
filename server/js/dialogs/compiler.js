$(function(){
	var running = false;

	dialog.runCompiler = function(dirName, fileName){
		if(running){
			dialog.alert("Cannot start compiler", "Another compiler instance is already running, please close it first. ");
			return false;
		}
		$("#ctrlc, #ctrld").parent().removeClass('ui-state-disabled');

		var div = $("<div>").dterm(function(e){client.CompilerServerClient.stdIn(e); }, {"title": fileName+" ["+dirName+"] - Compiler", prompt: ">", greetings: null, keypress: function(ev){ztr$(document).trigger("keypress", ev);}, keydown:function(ev){$(document).trigger("keydown", ev);}});

		div.on('dialogclose', function(){
			if(running){
				client.CompilerServerClient.ctrlD();
				running = false;
				div.terminal.pause();
			}
			div.remove();
			$("#ctrlc, #ctrld").parent().addClass('ui-state-disabled');
		});

		client.CompilerServerClient.runFile(dirName, fileName, function(success){
			if(success == false){
				div.terminal.echo("[FATAL] Server side error");	
			} else {
				running = true;
				div.click();	
			}
		}, function(stdOut){
			div.terminal.echo(stdOut);
		}, function(stdErr){
			
		}, function(endCode){
			//Terminal ended
			div.terminal.echo("Process terminated with code " +endCode['code']);
			running = false;
		});
		
		div.on('focusout', function(){div.terminal.pause();});	
		div.on('focusin', function(){if(running){div.terminal.resume();}});	
		
	}

	$("#ctrlc").enabled_click(function(){client.CompilerServerClient.ctrlC();});
	$("#ctrld").enabled_click(function(){client.CompilerServerClient.ctrlD();});
});
