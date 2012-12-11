//Authorisation Module

//TODO: Properly implement async authorisation
var auth = {};

auth.makeCredentials = function(user, pass, callback){
	//grab authentication and return an auth-like object
	callback({'user': user, 'pass': pass}, false);
};

auth.validCredentials = function(session, callback)
{
	//check if a credentials object is valid
	var user = session['user'];
	var pass = session['pass'];
	callback(user=='admin' && pass=='admin');
};

auth.getUserData = function(cred, callback)
{
	var data =  
	{
		"HomeFolder": "/tmp/"
	};
	callback(data);
};


module.exports = auth;
