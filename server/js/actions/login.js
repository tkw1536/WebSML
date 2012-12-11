(function(){
	action.login = function(next_step){
			var PageDiv = $("#pageRemainder").addClass('login').show();
			var LoginForm = $("<form>");
			var UserBox = $("<input type='text'>");
			var PassBox = $("<input type='password'>");

			var WaitingDiv = $("<div class='AuthBox'>").html("<b>Authorizing...</b>").appendTo(PageDiv);
		LoginForm
		.append(
			$("<table>").append(
				$("<tr>").append("<td>Username:</td>", $("<td>").append(UserBox)),
				$("<tr>").append("<td>Password:</td>", $("<td>").append(PassBox)),
				$("<tr colspan='2'>").append("<td><input type='submit' value='Login'></td>")
			)
		)
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
					m.remove();
				}

				LoginForm.hide()
				.off('submit');
				WaitingDiv.show();
			
				var username = UserBox.val();
				var pass = PassBox.val();
			
				client.AuthServerClient(username, pass, function(success){
					if(success){
						LoginForm.remove();
						WaitingDiv.remove();
						PageDiv.removeClass('login').empty();
						next_step();
					} else {
						EnableLogin("<div>Login failed.</div>");
					}
				});
		
				return false;
			});
		};
		
		EnableLogin(false);
	};
})();
