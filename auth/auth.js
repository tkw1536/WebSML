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

auth.getUserFlag = function(session, name, callback){
	//TODO: Implement setting user flgas
};

auth.setUserFlag = function(session, name, callback){
	//TODO: Implement setting user flag	
	this.validCredentials(session, function(s){
		if(s==true){
			
		} else {
			callback(undefined, false);		
		}
	});
};

auth.getUserData = function(cred, callback)
{
	//getUser Data
	var data =  
	{
		"HomeFolder": "/tmp/"
	};
	callback(data);
};


module.exports = auth;
