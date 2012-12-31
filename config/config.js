//General Configuration file for WebSML
var DB = require("./../lib/db"),
path = require("path");

var db = new DB(path.join(__dirname, "../data"));

db.openBase("config", {//Default Settings can be changed via admin panel
	
	//server config
	'server': 
	{
		'port': 80, //port for server, default: 80
		'provider': 'socketio' //Connection Provider to use
	},
	'modes': ['sml', 'node'],//Supported compiler(s)
	'accessData':
	{
		'admin': {'username': 'admin', 'password': 'pleasechange'},
		'rpc': {'username': 'rpc', 'password': 'pleasechange'}
	}
});

db.writeCache("config");


module.exports = db.getAllFromBase("config");
module.exports.db = db;
