$(function(){
	var $user = $("<input id='in-user' type='text' class='ui-widget-content ui-corner-all'>");
	var $cd = $("<input id='in-cd' type='text' class='ui-widget-content ui-corner-all'>");
	var $form = $("<form>")
	.append(
		$("<fieldset>").append(
			$("<label for='in-user'>").text("User"),
			$user,
			$("<label for='in-user'>").text("Working Directory"),
			$cd
		)
	);

	var form_reset = function(){
		$user.val("");
		$cd.val("");
	}

	dialog.newSession = $("<div class='newSessionDialog'>")
	.append($form)
	.attr("title", "New Session")
	.dialog({
		modal: true,
		autoOpen: false,
		dialogClass: "modalForm",
		buttons: {
			"Create new session": function(){
				dialog.newSession.dialog("close");
				var user = $user.val();
				var cd = $cd.val();
				client.rpc("session.register", [user, cd, false], function(suc){
					if(!suc){
						dialog.alert("Session creation failed. ");
					}
				});
			},
			"Cancel": function(){
				dialog.newSession.dialog("close");
			}		
		}
	});

	$("#session-register").enabled_click(function(){
		form_reset();
		dialog.newSession.dialog("open");
	});
});
