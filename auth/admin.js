var config = require("./../config/config"),
WebServer = require("./../networking/webserver");

module.exports = WebServer.basicAuth('Admin Page', 
	function(user, pass){
		return (user == config.accessData.admin.username && pass == config.accessData.admin.password);
	}, 
	WebServer.staticServer(__dirname+'/./../server_admin'), 
	WebServer.textServer("Admin authorisation failed. ")
)
