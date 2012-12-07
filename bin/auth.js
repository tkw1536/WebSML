var lib = require("../lib/misc");

//Authorisation
var auth = {};

auth.makeCredentials = function(user, pass){
	//grab authentication and return an auth-like object
	return {'user': user, 'pass': pass};//TODO: Enycrypt password
};

auth.validCredentials = function(session)
{
	//check if a credentials object is valid
	//TODO: Implement proper check here
	var user = session['user'];
	var pass = session['pass'];
	return (user=='admin' && pass=='admin');
};

auth.getUserData = function(auth)
{
	//TODO: GET USER DATA from auth key
	var data =  
	{
		"HomeFolder": "/tmp/",
		"FSFolder": "/tmp/"
	};
	return data;
};


module.exports = auth;
