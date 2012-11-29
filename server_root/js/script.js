//SML online compiler
//Client side script
//(c) Tom Wiesing 2012

//jQuery init
$(function(){
	var socket = io.connect('http://localhost', {reconnect: false});

	var terminal_active = 0;
	var global_block = true;

	//Code for running SML
	var sendC = function(){socket.emit('data_ctrlC', {});}//CTRL-C
	var sendD = function(){socket.emit('data_ctrlD', {});}//CTRL-D

	var switchFocus = function(){
		if(terminal.paused()&&(terminal_active==1||terminal_active==2)){
			terminal.resume()
		} else {
			terminal.pause();
			$("#sourcecode").focus();
		}
	};

	//Terminal init code
	var terminal = 
	$('#nice_terminal').terminal(function(command, term) {
		socket.emit('dataInput', {'input': command});
	}, {
	greetings: null,
	name: 'term',
	height: "100%",
	prompt: ''
	})

	//Code for keyboard shortcuts
	$(document).keydown(function(e)
	{
	if(e.ctrlKey){
	if(e.keyCode == 67){//c
		if(!terminal.paused()){sendC();return false;}
		
	} else
	if(e.keyCode == 68){//d
		sendD();
		return false;
	} else
	if(e.keyCode == 90){//z
		switchFocus();
		return false;
	}
	}
	});

	var runCode = function(code){
		if( terminal_active>0 || global_block){
			return false;		
		}
		terminal_active = 1;
		terminal.clear();
		socket
		.once('requestStatusC', function(data){
			var success = data['success'];
			if(success == true){
				terminal_active = 2;
				terminal.resume()
				socket
				.once('smlFinish', function(data){
					terminal_active = 3;
					terminal
					.echo("[[b;#ff0;#000]SML Process exited with code "+data["code"].toString()+"]")
					terminal_active = 0;
					switchFocus();
				})
				.emit('beginSML'); //Start
			} else {
				terminal
				.clear()
				.pause()
				.echo("[[b;#f00;#000]Can not run code"+(data["hasMessage"]?": ]"+data['message']:"]"));
				terminal_active = 0;
			}
		})
		.emit('runCode', {'code': code});
		return true;
	}


	//Tabs Controls
	var makeTabs = function(tabs){
		for(var i=0;i<tabs.length;i++){
			$("#"+tabs[i]).click(function(){
				var me = $(this); 
				for(var j=0;j<tabs.length;j++)
				{
					var item = tabs[j];
					$("#"+item).removeClass("active");
					$("#"+item+"b").hide();
				}
				me.addClass("active");
				$("#"+me.attr("id")+"b").show();
				return false;
			});		
		}
		$("#"+tabs[0]).click();
	};
	makeTabs(["tc-controls", "tc-help", "tc-about"]);
	makeTabs(["te-source", "te-files"]);

	//File System Handling
	var refreshDir, openFile, closeFile, saveFile, deleteFile;

	var current_directory = "";
	var updating = false;
	var FileOpen = 0;
	var filename = '';
	var filedir = '';

	deleteFile = function(){
		socket
		.once('deleteFile', function(data){
			var success = data['success'];
			if(success == false){
				alert("Could not delete file. "); 			
			}
		})
		.emit('deleteFile', {'dir': filedir, 'filename': filename});
	}
	
	saveFile = function(){//unimplemented
		var content = $("#fileC").val();
		socket
		.once('writeFile', function(data){
			var success = data["success"];
			if(success == false){
				alert("Could not save file. "); 			
			}		
		})	
		.emit('writeFile', {'dir': filedir, 'filename': filename, 'content': content, 'overwrite': true});
	}

	closeFile = function(){
		FileOpen = 0;
		filename = '';
		filedir = '';
		$("#file-options").hide().find("a").off("click");
		$('#file').empty();
	}

	openFile = function(file){
		if(FileOpen > 0){return false} else {
			FileOpen = 1;
			socket
			.once('readFile', function(data){
				var success = data['success'];
				if(success==true){
					FileOpen = 2;
					filename = data['filename'];
					filedir = data['dir'];
					var content = data['content'];
					
					//File is open put contents
					$("#file-options").show().css("display", "inline");
					$("#file-name").text(filedir+filename);
					$("#fs-close").click(function(){closeFile(); return false;});
					$("#fs-delete").click(function(){deleteFile(); return false;});
					$("#fs-save").click(function(){saveFile(); return false;});
					$('#file').append($("<textarea id='fileC'>").val(content).tab_hack().click(function(){$(this).focus();terminal.pause();}));
				} else {
					closeFile();
					FileOpen = 0;
				}
			})
			.emit('readFile', {'dir': current_directory, 'filename': file});
		}
	};

	var checkFile = function(){
		if(FileOpen == 2){
			socket
			.once('readFile', function(data){
				var success = data['success'];
				if(success == false){closeFile();}
			})
			.emit('readFile', {'dir': filedir, 'filename': filename, 'noCheck': true});
		}
	}


	refreshDir = function(new_dir){
		if(updating){return false;}
		updating = true;
		socket.once('listDir', function(data){
			//emit listFiles
			var success = data['success'];
			if(success==true){
				current_directory = data['dir'];
				//Remake all the fir links
				var dirList = $("#dirList").empty();
				var fileList = $("#fileList").empty();
				
				//Dirs
				var dirs = data['dirs']
				for(var i=0;i<dirs.length;i++){
					dirList.append(
						$("<li>").append($("<a href='#' class='dirItem'>").click(function(){
							var new_path = current_directory+"/"+$(this).data("dir")+"/";
							refreshDir(new_path);
							return false;
						}).text("["+dirs[i]+"]").data("dir", dirs[i]))
					);			
				}
				$("#dirName").text(current_directory);
				if(current_directory != "./"){
					$("#dirName").text(current_directory+" - ").append(
						$("<a href='#' class='control'>")
						.text("[Delete]")
						.data("dir", current_directory)
						.click(function(){
							socket
							.once('deleteDir', function(data){
								var success = data['success'];
								if(success){
									refreshDir(current_directory+"/../");
								} else {
									alert("Could not remove directory, please try again. ");
								}
							})
							.emit('deleteDir', {'dir': current_directory});
							return false;
						})
					);
				}

				//Files
				var files = data['files'];
				for(var i=0;i<files.length;i++){
					fileList.append(
						$("<li>").append($("<a href='#' class='fileItem'>").click(function(){
							openFile($(this).data('file'));
							return false;
						}).text(files[i]).data("file", files[i]))
					);	
				}
			}
			checkFile(); //Update file: is it still here ?
			updating = false;
		})
		.emit('listDir', {'dir': new_dir});
		return true;
	};
	$("#te-files").click(function(){refreshDir(current_directory);});

	var makeDir = function(dir){
		socket
		//.once('makeDir', function(data){})
		.emit('makeDir', {'dir': dir})
	};
	
	var makeFile = function(name){
		socket
		//.once('writeFile', function(data){})
		.emit('writeFile', {'dir': current_directory, 'filename': name, 'content': '', 'overwrite': false})
	};
	
	$("#fs-makedir").click(function(){var name=prompt("Enter name of new directory: "); if(name != null){makeDir(name); }});
	$("#fs-makefile").click(function(){var name=prompt("Enter name of new file: "); if(name != null){makeFile(name); }});

	//Terminal Init Code
	terminal
	.click(function(){
		if(terminal_active==2){terminal.resume(); }
	})
	.pause()
	.echo("[Authorising with Server...]");
	socket.once("requestStatusA", function(data){
		var clearence = data["clearence"];
		if(clearence == true){
			terminal
			.echo("[[b;#0f0;#000]Request authorised by server: ]"+data['message']);
			socket.once("requestStatusB", function(data){
				var success = data["success"];
				if(success==true){
					terminal
					.echo("[[b;#0f0;#000]Server initialised, ready to begin. ]");
					data["hasMessage"]?terminal.echo(data['message']):null;
					refreshDir("./");
					global_block = false;
				} else {
					terminal
					.echo("[[b;#f00;#000]Request failure: ]"+data['message']);
				}
			}).emit("clientReady", {});
		} else {
			terminal
			.echo("[[b;#f00;#000]Request denied by server: ]"+data['message']);
		}
	})
	.on('securityViolation', function(){
		alert("Security Violation: You tried something that is not allowed. You got kicked. ");
	})	
	.on('disconnect', function(){
		alert("Lost connection. Please reload the page. Remember to save your code. ");	
		global_block = true;
	})
	.on('dataOutput', function(data){
		if(terminal_active > 0){
			data = data['data']
			try{terminal.echo(data);}catch(e){}
		}
	})
	.on('triggerFileUpDate', function(d){
		refreshDir(current_directory);	
	});

	$("#cont-compile").click(function(){
		var code = runCode($("#sourcecode").val());
		if(code == false){
			alert("You can't do that right now. Please stop the current process first. "); 
		};
		return false;	
	});
	$("#cont-empty").click(function(){
		var code = runCode("");
		if(code == false){
			alert("You can't do that right now. Please stop the current process first. "); 
		};
		return false;	
	});
	$("#cont-ctrlc").click(function(){
		sendC();
		return false;	sen
	});
	$("#cont-ctrld").click(function(){
		sendD();
		return false;	
	});
	$("#cont-sf").click(function(){
		switchFocus();
		return false;
	});

	$("#sourcecode").tab_hack().click(function(){
		$(this).focus();
		terminal.pause();	
	});
	$("#file-options").hide();

	window.onbeforeunload = function(){
		return "Your data on the server will be deleted once you leave. Do you really wish to leave? ";	
	}
});


