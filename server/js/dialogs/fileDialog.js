//Open a File Dialog
jQuery(function(){
	
	var is_dialog_open = false;

	dialog.FileDialog = function(title, buttonText, callback, fallback){
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
		var FileNameBox = OpenLine.find("input").val("/unnamed.txt");
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
		dialog.FileDialog("Open File / Create new", "Open / Create", function(dir, file){
			client.FileServerClient.readFile(dir, file, function(success, content){
				if(success){
					dialog.editor(dir, file, content);
				} else {
					dialog.editor(dir, file, "");
				}
			});
					
		}, function(){});
		return false;
	});

	dialog.saveFileDialog = function(dir, file, content){
		client.FileServerClient.writeFile(dir, file, content, true, function(success){
			if(success){
				dialog.alert("Save", "File saved. ", 250, function(){});
			} else {
				dialog.alert("Save failed", "File could not be saved. ", 250, function(){});
			}
		});
	};

});
