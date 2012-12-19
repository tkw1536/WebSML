


jQuery(function(){
	var fileNames = [];
	dialog.editor = function(dirName, fileName, content){
		if(fileNames.indexOf(dirName+"/"+fileName) != -1){
			dialog.alert("Error", "The file is already open. ", 200, function(){});
			return false;
		}

		fileNames.push(dirName+"/"+fileName);

		var winElement = $("<div>").appendTo(document)

		winElement
		.attr("title", fileName + " ["+dirName+"]")
		.dialog().dialogExtend({'maximize': true});

		var codeMirror = winElement.codeMirror({lineNumbers: true, value: content}, true);
		$(winElement.find("div")[0]).css("width",  "100%");

		winElement.on('dialogclose', function(){
			//dialog is closed
			fileNames.splice(fileNames.indexOf(dirName+"/"+fileName), 1);
			selectDialog(false);
		});
		winElement.on('click', function(){
			selectDialog(winElement);
		});

		winElement.data({"e_fileName": fileName, "e_dirName": dirName, "e_codeMirror": codeMirror})

		winElement.click();
		return true;
	};

	var elem = false;
	var selectDialog = function(el){
		if(el == false){
			$("#save, #close, #compiler").parent().addClass("ui-state-disabled");
		} else {
			$("#save, #close, #compiler").parent().removeClass("ui-state-disabled");
		}
		elem = el;
	}

	//register all Handlers

	$("#save").enabled_click(function(){
		dialog.saveFileDialog(elem.data("e_dirName"), elem.data("e_fileName"), elem.data("e_codeMirror").getValue());
		return false;
	});

	$("#close").enabled_click(function(){
		elem.dialog("close");//TODO: Add 'Do you really want to close this' dialog...
	});
	
	$("#compiler").enabled_click(function(){
		dialog.runCompiler(elem.data("e_dirName"), elem.data("e_fileName"));
	});
});
