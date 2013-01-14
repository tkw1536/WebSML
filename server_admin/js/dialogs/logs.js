$(function(){
	var $LogList = $("<div>").css({width: "20%", display: "inline", float: "left", overflow: "auto", height: "100%"});
	var $Log = $("<pre>").css({display: "inline", overflow: "auto", height: "100%"});
	var $LogDialog = 
	$("<div>")
	.attr("title", "Log Viewer")
	.append($LogList,$("<div>").css({width: "80%", display: "inline", float: "left", overflow: "auto", height: "100%"}).append($Log))
	.dialog({height: 350, width: 750, autoOpen:false});

	var viewLog = function(name){
		client.rpc("logs.view", [name], function(s, item){
			if(s){
				$Log.text(item);
			}
		});
	};

	var upDateLogs = function(){
		client.rpc("logs.list", [], function(s, items){
			if(s){
				$LogList
				.empty();
				for(var i=0;i<items.length;i++){
					var item = items[i];
					$LogList.append(
						$("<div>")
						.css({"height": 20, "background-color": "white"})
						.addClass("ui-corner-all")
						.text(item.toString())
						.data("logName", item)
						.click(function(){
							var $me = $(this);
							$me.parent().find("div").css({"background-color": "white"});
							$me.css({"background-color": "#C0C0C0"});
							viewLog($me.data("logName"));
						})	
					)
				};
			}
		});	
	};

	dialog.logs = function(){
		$LogDialog.dialog("open");
		upDateLogs();
	};

	$("#logs").enabled_click(dialog.logs);
	
});
