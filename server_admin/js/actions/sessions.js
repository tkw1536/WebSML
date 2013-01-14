action.sessions = function(){
	var allow_refresh = true;
	var refreshLoop = false;
	var refreshInterval = 1000;


	var $session = $("#sessions");
	
	var expire = function(){
		allow_refresh = false;
		var $this = $(this);
		var sid = $this.data("SID");
		$this.parent().parent().css("background-color", "red");
		dialog.confirm("Removing a session. ", "Are you sure you want to remove the selected session? ", 250, function(){
			client.rpc("session.expire", [sid], function(){allow_refresh = true; toggle_refresh();});
		}, function(){allow_refresh = true; toggle_refresh();});
	};

	var toggle_refresh = function(){
		if(!allow_refresh || refreshLoop){
			return;
		}
		refreshLoop = true;
		client.rpc("session.list", [], function(success, result){
			if(success){
				//key, assoc, lastAccess, data
				$table
				.empty()
				.append(
					$("<thead>").append($("<tr class='ui-widget-header'>").append("<td>ID</td><td>last Access</td><td>User</td><td>Working dir</td><td></td>"))				
				);
				for(var i=0;i<result.length;i++){
					try{
						var res = result[i];
						$table.append(
							$("<tr>").append(
								$("<td>").text(res[0]),
								$("<td>").text((new Date(res[2])).toUTCString()),
								$("<td>").text(res[3].user),
								$("<td>").text(res[3].data.cwd),
								$("<td>").append(
									$("<button>").text("Remove").button().click(expire).data("SID", res[0]),
									(res[1]?"":$("<button>").append($("<a>").text("Open").attr({
										"href": "/session/"+res[0],
										"target": "_blank"
									})).button())
								)
							).css("background-color", (res[1]?"green":"yellow"))
						);
					} catch(e){}
				}
				$table.find("td").css("width", "20%");
				window.setTimeout(function(){refreshLoop = false; toggle_refresh();}, refreshInterval);
			} else {
				dialog.alert("Error updating dialogs. ");
			}
		});
	};
	
	var $table = $("<table class='ui-widget ui-widget-content' style='width: 100%; '>").appendTo($session);
	$("#update-sessions-now").enabled_click(toggle_refresh);
	

	window.stopUpdate = function(){
		allow_refresh = false;
	};
	toggle_refresh();
};
