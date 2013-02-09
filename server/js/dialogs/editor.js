jQuery(function(){

	dialog.editor = function(title, content, parentFile){
		var winElement = $("<div>").appendTo(document)
		var force_dirt = false;
		var title = title;
		var allow_close = false;
		winElement
		.attr("title", title)
		.dialog({
			'beforeClose': function(){
				if(!allow_close){
					parentFile.close(false, function(){
						allow_close = true;
						winElement.dialog('close');
					});
					return allow_close;	
				}
					
			}		
		}).dialogExtend({'maximize': true});

		var codeMirror = winElement.codeMirror({lineNumbers: true, value: content}, true);
		$(winElement.find("div")[0]).css("width",  "100%");
		

		winElement.on('dialogclose', function(){
			//dialog is closed
			selectDialog(false);
		});

		winElement.on('click', function(){
			selectDialog(parentFile);
			winElement.dialog('moveToTop');
		});
		winElement.click();

		codeMirror.on('change', function(){
			updateTitle();
		});

		var updateTitle = function(){
			if(me.isChanged()){
				winElement.dialog('option', 'title', "*"+title);
			}
		};

		
		var me = {
			"setTitle": function(text){
				title = text;
				winElement.dialog('option', 'title', text);
				updateTitle();
			},
			"setContent": function(text){
				return codeMirror.setValue(text)
			},
			"getContent": function(){
				return codeMirror.getValue()
			},
			"focus": function(){
				winElement.click();
			},
			"isChanged": function(){
				return !codeMirror.isClean() || force_dirt;
			},
			"setUnChanged": function(){
				force_dirt = false;
				codeMirror.markClean();
				updateTitle();	
			},
			"setChanged": function(){
				force_dirt = true;
				updateTitle();		
			},
			"close": function(){
				allow_close = true;
				winElement.dialog('close');
			}
		};

		return me;
	};

	var elem = false;
	var selectDialog = function(el){
		if(el == false){
			$("#save, #close, #save-as, #delete, #compiler").parent().addClass("ui-state-disabled");
		} else {
			$("#save, #close, #save-as, #delete, #compiler").parent().removeClass("ui-state-disabled");
		}
		elem = el;
	}

	$("#save").enabled_click(function(){
		elem.save();
		return false;
	});

	$("#save-as").enabled_click(function(){
		elem.saveAs();
		return false;
	});

	$("#close").enabled_click(function(){
		elem.close();
	});
	
	$("#compiler").enabled_click(function(){
		elem.compile();
	});	
	
	$("#delete").enabled_click(function(){
		elem.deleteClose();
	});
});
