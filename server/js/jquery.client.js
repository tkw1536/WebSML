jQuery(function($){
	$("#welcomeMessage")
	.remove();
	var PageDiv = $("#pageRemainder").show().removeAttr('id');
	//Make a login form
	var LoginForm = $("<form>");
	var UserBox = $("<input type='text'>");
	var PassBox = $("<input type='password'>");

	var WaitingDiv = $("<div>").text("Authorizing...");
	PageDiv.append(WaitingDiv);
	LoginForm
	.append(UserBox, "<br />", PassBox, "<br />", "<input type='submit' value='Login'>")
	.appendTo(PageDiv);
	var EnableLogin = function(message){
		WaitingDiv.hide();
		if(message){
			var m = $(message);
			LoginForm.prepend(m);
		}

		LoginForm
		.show()
		.submit(function(){
			if(m){
				m.remove(); //Delete m 
			}

			LoginForm.hide()
			.off('submit');
			WaitingDiv.show();
			
			var username = UserBox.val();
			var pass = PassBox.val();
			
			client.tryAuthorize(username, pass, function(success){
				if(success){
					Step_Two();
				} else {
					EnableLogin("<div>Login failed.</div>");
				}
			});
		
			return false;
		});
	};

	//Step Two
	var Step_Two = function(){
		LoginForm.remove();
		WaitingDiv.remove();
		PageDiv.text("UNIMPLEMENTED");
	};


	//Initialise
	EnableLogin(false);
});
