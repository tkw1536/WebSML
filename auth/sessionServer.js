var WebServer = require("./../networking/webserver");
var session = require("./session");


module.exports = 
[
	WebServer.subServer("session", 
		WebServer.handled(
			[
				function(req, res, data){
					//TODO: Implement Errors
					var key = data.path.substring(1);
					if(session.has(key)){
						var sess = session.get(key);
						if(!sess.assoc()){
							var curSession = data.session.value;
							if(curSession){
								try{
									session.get(curSession.split(":")[0]).expire();
								} catch(e){}
							}
							var user = sess.data().user;
							
							session.getAll().map(function(sessionItem){
								if(sessionItem.data().user == user && sessionItem.key != key){
									sessionItem.expire();
								}
							});
							var sid = data.session.key;
							session.associate(key, data.session.key);
							data.session.value = key+":"+sid;
						} else {
							throw new Error("SESSION_ALREADY_ACTIVE");
						}
					
					} else {
						throw new Error("INVALID_SESSION_ID");		
					}
					return false;			
				},
				WebServer.forward("/")
			],
			WebServer.textServer(function(req, data){
				return "Error: "+data.errors[0].message;
			})
		)
	),
	WebServer.subServer("logout", 
		[
			function(req, res, data){
				data.session.expire();//Expire the session
				var val = data.session.value;
				if(val){
					session.expire(val.split(":")[0]);
				}
				return false;				
			},
			WebServer.textServer("You have been logged out and your session has been terminated. Have a nice day. ")
		]
	),
	WebServer.staticRequest('js/data_session.js', WebServer.provideJS('sessionId', function(req, data){return data.session.value;}))
];
