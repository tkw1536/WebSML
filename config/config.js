//General Configuration file for WebSML

var config = {
	
	//server config
	'server': 
	{
		'port': 80, //port for server, default: 80
		'provider': 'socketio' //Connection Provider to use
	},
	'mode': 'sml',//Mode (for different languages)
	'storage': {
		'storageFolder': 'data/', //storage folder
		'userDb': 'user.db'
	}
	
	
}


module.exports = config;
