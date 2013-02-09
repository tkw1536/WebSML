//Open a File Dialog
jQuery(function(){

	var Files = [];

	var File = function(dirname, filename, b_content){
		/* file interface */
		var me = this;
		var editor = undefined;
		var dirname = dirname;
		var filename = filename;
		var block_delete = false;
		if(typeof dirname != 'string'){
			//Create a new File	
			block_delete = true;
			this.save = function(cb){
				this.save = function(cb){
					return this._save(cb);		
				};
				
				this.saveAs(cb);
			};
			if(typeof filename == 'string'){
				editor = dialog.editor("["+filename+"]", b_content, me);		
			} else {
				editor = dialog.editor("[New File]", "", me);
			}
			dirname = '';
			filename = '';

			
			editor.setChanged();	
		} else {
			this.save = function(cb){
				return this._save(cb);		
			};
	
			client.FileServerClient.readFile(dirname, filename, function(suc, content){
				if(!suc){
					dialog.alert("Oops", "That file couldn't be opened for some reason. ", 200);
				} else {
					editor = dialog.editor(filename+" ["+dirname+"]", content, me);	
				}
			});
		}

		this.is = function(d, f){
			return ((dirname == d)&&(filename == f));
		};

		this.saveAs = function(cb){
			//Save as
			dialog.FileDialog("Save as", function(d, f){
				dirname = d;
				filename = f;
				me.save(cb);
			});
		};

		this._save = function(cb){//Saves a file
			client.FileServerClient.writeFile(dirname, filename, editor.getContent(), true, function(suc){
				if(!suc){
					dialog.alert("Oops", "That file couldn't be saved for some reason. ", 200);				
				} else {
					block_delete = false;
					if(typeof cb == 'function'){
						cb();				
					}					
				}
			})
			editor.setUnChanged();
			editor.setTitle(filename+" ["+dirname+"]");
		};

		this.close = function(f, cb){
			//Closes this file, checks for edits
			if(f){
				for(var i=0;i<Files.length;i++){
					if(Files[i].is(dirname, filename)){
						Files.splice(i, 1);
					}		
				}
				editor.close();
				if(typeof cb == 'function'){cb(true);}
				return true;
			} else {
				if(editor.isChanged()){
					dialog.confirm("File not saved. ", "The file has not been saved. Close it anways? ", 200, function(){
						me.close(true, cb);
					}, function(){})
				} else {
					return this.close(true, cb);	
				}
			}
		
		};

		this.deleteClose = function(cb){
			var cb = (typeof cb == 'function')?cb:function(){};
			if(block_delete){
				dialog.alert("Error", "This can not be deleted. Try again later. ", 200, function(){});
				cb(false);
				return;
			}
			dialog.confirm("Deleting the file. ", "Do you really wish to delete this file? THIS CANNOT BE UNDONE. ", 200, function(){
				me.close(true, function(){
					client.FileServerClient.deleteFile(dirname, filename, function(suc){
						if(!suc){
							dialog.alert("Error", "The file wasn't deleted for some reason. ", 200, function(){});
						}
					});				
				});
			}, function(){cb(false);})
		};

		this.compile = function(){
			//Runs the compiler on this File: TODO!
			if(editor.isChanged()){
				dialog.confirm("File not saved. ", "The file has not been saved. You have to save it first to compile this file. Save now? ", 200, function(){
					me.save(function(){
						me.compile();					
					});
					
				}, function(){});
			} else {
				dialog.runCompiler(dirname, filename);			
			}
		};

		this.focus = function(){
			editor.focus();
		};

		Files.push(this);
	};

	File.open = function(callback){
		dialog.FileDialog("Open File", function(dirname, filename){
			for(var i=0;i<Files.length;i++){
				if(Files[i].is(dirname, filename)){
					Files[i].focus();
					callback(false);
					return false;			
				}		
			}

			var f = new File(dirname, filename);
			callback(f);
			return f;
		});
	};

	var is_dialog_open = false;

	dialog.FileDialog = function(title, callback, fallback, options){
		var options = (typeof options == 'undefined')?{}:options;
		var buttonText = (typeof options.buttonText == 'undefined')?title:options.buttonText;
		var defname = (typeof options.defname == 'undefined')?"":options.defname;
		var callback = (typeof callback == 'function')?callback:function(){};
		var fallback = (typeof fallback == 'function')?fallback:function(){};	

		if(is_dialog_open){
			fallback();
			return false;
		}
		is_dialog_open = true;

		var selected = false;

		var odialog = $("<div>");
		var current_dir = "/";
		
		odialog.append("<form style='height:100%; width: 100%; '><table style='height:100%; width: 100%; '><colgroup><col width='20%; '><col width='20%; '></colgroup><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td colspan='2'></td></tr></table></form>")
		var FolderList = $(odialog.find("td")[0]).css("width", "20%").append("<div class='fill'>").find("div");
		var DirName = $(odialog.find("td")[2]).css("width", "20%");
		var FileList = $(odialog.find("td")[1]).css("width", "80%").append("<div class='fill'>").find("div");
		var OpenLine = $(odialog.find("td")[3]).css({"width": "80%", "height": 30}).append("<input type='text' style='width:100%; '>");
		var FileNameBox = OpenLine.find("input").val(defname);
		var ActionLine = $(odialog.find("td")[4]).css({"width": "80%", "height": 30});
		odialog.find("td").css({"vertical-align": 'top'});
		var uptr = $(odialog.find("tr")[0]);		
		
		var refreshView = function(toDir){
			client.FileServerClient.listDir(toDir, function(success, files, dirs, dirname){
				if(!success){
					dialog.alert("Error", "Could not load files & folders, check your connection. ", 120, function(){});
					return;				
				}
				current_dir = dirname;
				DirName.text(dirname);
				FileList.empty();
				for(var i=0;i<files.length;i++){
					var file = files[i];
					var a = $("<a href='#'>").text(file).click(function(){
						FileNameBox.val($(this).text());
						return false;
					}).dblclick(function(){
						a.click();
						odialog.find("form").submit();
						return false;					
					}).appendTo(FileList);
					FileList.append("<br>");
				}
				FileList.find("a").css({'text-decoration': 'none'});
				FolderList.empty();
				for(var i=0;i<dirs.length;i++){
					var dir = dirs[i];
					var a = $("<a href='#'>").text(dir).click(function(){
						refreshView(current_dir+"/"+$(this).text())
						return false;
					});
					FolderList.append("[", a, "]<br>");
				}
				FolderList.find("a").css({'text-decoration': 'none'});
				
			});
		
			
		};
		
		odialog.find("form").on("submit", function(){
			selected = (FileNameBox.val() != '');
			odialog.dialog("close");
			return false;
		});

		ActionLine.append($("<button>").text(buttonText).button().click(function(){odialog.find("form").submit(); return false; }))

		refreshView(current_dir);

		odialog
		.attr("title", title)
		.dialog({'modal': true, 'height': 300, 'width': 700})
		.on('dialogclose', function(){
			if(selected==true){
				client.FileServerClient.resolveName(DirName.text(), FileNameBox.val(), function(success, dirname, filename){
					if(success == true){
						callback(dirname, filename);
					} else {
						fallback();
					}
				});
				
					
			} else {
				fallback();		
			}
			odialog.remove();
			is_dialog_open = false;
		});
		
	}

	$("#open").enabled_click(function(){
		File.open(function(){});
	});

	$("#new").enabled_click(function(){
		new File();
	});

	client.on('push_snippet', function(data){
		new File(false, data['title'], data['content']);	
	});
});
