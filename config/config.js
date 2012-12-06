//General Configuration file for WebSML

var config = {
	
	//server config
	'server': 
	{
		'port': 80, //port for server, default: 80
		'provider': 'socketio' //Connection Provider to use
	},
	'mode': 'sml',//Mode (for different languages)
	//auth config
	'auth': {
		'enabled': false
	},
	//Log config
	'log': {
		'enabled': false
	},
	//Sandbox config
	'sandbox': {
		//Unimplemented
	},
	'auth': 
	{
		'enabled': false //Authorisation enabled?
	},
	'debug': false //Debugging enabled?
}


module.exports = config;
