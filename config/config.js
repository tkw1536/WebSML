//General Configuration file for WebSML
var DB = require("./../lib/db"),
path = require("path");

var db = new DB(path.join(__dirname, "../data"));

db.openBase("config", {//Default Settings can be changed via admin panel
	
	//server config
	'server': 
	{
		'port': 8080, //port for server, default: 80
		'provider': 'socketio' //Connection Provider to use
	},
	'modes': ['sml', 'node', 'python'],//Supported compiler(s)
	'accessData':
	{
		'admin': {'username': 'admin', 'password': 'pleasechange'},
		'rpc': {'username': 'rpc', 'password': 'pleasechange'}
	},
	'session':
	{
		'autoExpire': 3600
	},
	'sandbox':
	{
		'enabled': false,
		'command': 'soapbox',
		'arguments': [
			'-p',
			0, //%dir%
			1, //%executable%
			2  //%args%
		]
	}
});

db.writeCache("config");


module.exports = db.getAllFromBase("config");
module.exports.db = db;
