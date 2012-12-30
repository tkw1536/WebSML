//webserver.js: Create a simple Web server with several options

var http = require('http'),
fs = require('fs'),
url = require('url'),
path = require('path'),
lib = require('./../lib/misc'),
EventEmitter = require('events').EventEmitter
extend = lib.extend;

var RequestUrl = function(req){
	return lib.defineIfNull(url.parse(req.url).pathname, "");
};

var EventFwd = function(source, dest, evts){
	for(var i=0;i<evts.length;i++){
		var event = evts[i];
		source.on(event, function(){
				var args = [event];
				for(var i=0;i<arguments.length;i++){
					args.push(arguments[i]);
				}
				dest.emit.apply(dest, args);		
		});
	}
	return dest;
};

var ObjectFwd = function(source, dest, keys){
	for(var i=0;i<keys.length;i++){
		var key = keys[i];
		if(typeof source[key] == 'function'){
			dest[key] = function(){
				return source[key].apply(source, arguments);
			};
		} else {
			dest[key] = source[key];
		}
	}
	return dest;
};

var ObjForwardAll = function(source, dest){
	for(var key in source){
		if(source.hasOwnProperty(key)){
			if(typeof source[key] == 'function'){
				dest[key] = function(){
					return source[key].apply(source, arguments);
				};
			} else {
				dest[key] = source[key];
			}
		}	
	}	
	return dest;
};



var WebServer = function(servers, port){
	var nullServer = WebServer.nullServer();
	var server = WebServer.make(servers, function(req, res){
		nullServer(req, res);
	})
	return http.createServer(server).listen(port);
}

WebServer.make = function(servers, fallback){//
	if(typeof fallback != 'function'){
		fallback = function(req, res){
			return false;
		};	
	}
	return function(req, res){
		var done = false;
		for(var i=0;i<servers.length;i++){
			if(servers[i](req, res) === true){
				done = true;
				break;			
			}
		}
		if(!done){return fallback(req, res);} else {return true;}
	};
}


WebServer.subServer = function(requestRoot, data){
	var requestRoot = lib.defineIfNull(url.parse(requestRoot).pathname, "");
	requestRoot = lib.startsWith(requestRoot, '/')?requestRoot:'/'+requestRoot;
	return function(req, res){
		if(lib.isIn(RequestUrl(req), requestRoot)){//Are we in  the root
			var req2 = new EventEmitter();
			EventFwd(req, req2, ['data', 'end', 'close']);
			ObjectFwd(req, req2, ['method', 'setEncoding']);
			var reqUrl = url.parse(req.url)
			reqUrl.pathname = path.relative(requestRoot, lib.defineIfNull(reqUrl.pathname, ""));
			req2.url = url.format(reqUrl);
			req2.url = lib.startsWith(req2.url, '/')?req2.url:'/'+req2.url;
			return data(req2, res);
		} else {return false;}
	};
};

WebServer.staticServer = function(root, options){
	var options = extend({
		"mimeTypes": {},
		"indexFile": "index.html", //Index files
		"ignore": function(){return false;},//is a file being ignored?
		"404": WebServer.textServer(function(url){return "HTTP 404\nRequested URL not found: "+url+"\n";}, 404),
		"401": WebServer.textServer(function(url){return "HTTP 401\nAccess to requested URL denied: "+url+"\n";}, 401)
	}, options);

	var root = path.resolve(root);
	var index = options.indexFile;
	var ignoreF = options.ignore;
	var ignore = function(fn)
	{
		return ignoreF(path.relative(root, fn));
	}

	var mimeTypes = extend(
	{//supported mimeTypes
		"html": "text/html",
		"jpeg": "image/jpeg",
		"jpg": "image/jpeg",
		"png": "image/png",
		"js": "text/javascript",
		"css": "text/css"
	}, options.mimeTypes);

	return function(req, res){
		var uri = RequestUrl(req);
		uri = lib.endsWith(uri, "/")?uri+index:uri;//Directory index files
		var filename = path.resolve(path.join(root, uri));//resolve absolute filename
		if(!lib.isIn(filename, root)){//Access denied. We used a .. in the request
			return 	options["401"](req, res);	
		}

		fs.exists(filename, function(exists) {
			if(!exists || ignore(filename)) {//Not Found
				return options["404"](req, res);
			}
			try{
				var mimeType = mimeTypes[lib.lastMember(path.extname(filename).split("."))];
			} catch(e){
				var mimeType = "text/plain";
			}
			res.writeHead(200, {'Content-Type':mimeType});

			var fileStream = fs.createReadStream(filename);//pump to the client
			fileStream.pipe(res);
		});
		return true;
	};
};

WebServer.staticRequest = function(pth, data){
	var pth = lib.defineIfNull(url.parse(pth).pathname, "");
	pth = lib.startsWith(pth, '/')?pth:'/'+pth;
	return function(req, res){
		if(RequestUrl(req) == pth){
			data(req, res);
			return true;
		} else {return false;}
	};
};

WebServer.filteredServer = function(filter, data){
	var filterFunc = (typeof filter != 'function')?filter:function(req){return filter.indexOf(req)!=-1;};

	return function(req, res){
		if(filterFunc(RequestUrl(req))){
			data(req, res);
			return true;
		} else {
			return false;
		}
	};
	
};

WebServer.echoServer = function(){
	return function(req, res){
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(require("util").inspect(req));
		res.end();
		return true;
	};
};

WebServer.passive = function(PassiveFunction){
	return function(req, res){
		var url = RequestUrl(req)
		PassiveFunction(lib.startsWith(url, '/')?url:'/'+url, req);
		return false;
	};
};

WebServer.always = function(server){
	return function(req, res){
		server(req, res);
		return true;
	};
};

WebServer.nullServer = function(status){
	var status = typeof status=='number'?status:200;
	return function(req, res){
		res.writeHead(status, {'Content-Type': 'text/plain'});
		res.end();
		return true;
	};
}

WebServer.file = function(file, mimeType, status){
	if(typeof mimeType =='undefined'){
		mimeType = 'text/plain';
		status = typeof status=='number'?status:200; 
	} else if(typeof mimeType =='number'){
		status = mimeType;
		mimeType = 'text/plain';
	} else if(typeof mimeType =='string'){
		status = typeof status=='number'?status:200;
	} else {
		mimeType = 'text/plain';
		status = 200;
	}

	return WebServer.fallBack(
		function(req, res){
			res.writeHead(status, {'Content-Type': mimeType});
			var fileStream = fs.createReadStream(path.resolve(file));//pump to the client
			fileStream.pipe(res);
			return true;
		},
		function(req, res){
			return false;		
		}
	);
};

WebServer.fallBack = function(func1, func2){
	return function(req, res){
		try{
			return func1(req, res);
		} catch(e){
			return func2(req, res, e);		
		}
	};
};

WebServer.textServer = function(text, mimeType, status){
	if(typeof mimeType =='undefined'){
		mimeType = 'text/plain';
		status = typeof status=='number'?status:200; 
	} else if(typeof mimeType =='number'){
		status = mimeType;
		mimeType = 'text/plain';
	} else if(typeof mimeType =='string'){
		status = typeof status=='number'?status:200;
	} else {
		mimeType = 'text/plain';
		status = 200;
	}

	var TextFunction = (typeof text == 'function')?text:function(){return text;};
	return function(req, res){
		res.writeHead(status, {'Content-Type': mimeType});
		res.write(TextFunction(RequestUrl(req)));
		res.end();
		return true;
	};
}

WebServer.otherServer = function(server){//forward to another http server instance, which does not have to be listening
	return function(req, res){
		server.emit("request", req, res);
		return true;
	};
};

WebServer.post = function(data){
	return function(req, res){
		if(req.method == 'POST'){
			return data(req, res);
		} else {
			return false;		
		}
	};
}

WebServer.get = function(data){
	return function(req, res){
		if(req.method == 'GET'){
			return data(req, res);
		} else {
			return false;		
		}
	};
}

WebServer.forceHead = function(status, headers, expandable, otherResponse){
	var statusFunc = (typeof status=='function')?status:function(){return status;};
	var headerFunc = (typeof headers=='function')?headers:function(){return headers;};
	var expandable = expandable?true:false;	
	var otherResponse = (typeof otherResponse=='function')?otherResponse:WebServer.nullServer();
	return function(req, res){
		var res2 = new EventEmitter();
		var reqUrl = RequestUrl(req);
		var reqStatus = statusFunc(reqUrl);
		var reqHead = headerFunc(reqUrl);
		EventFwd(res, res2, ['close']);
		ObjectFwd(res, res2, ['writeHead', 'statusCode', 'setHeader', 'sendDate', 'getHeader', 'removeHeader', 'write', 'addTrailers', 'end']);
		if(expandable){
			res2.writeHead = function(stat, headers){
				return res.writeHead(reqStatus, ObjForwardAll(headers, reqHead));
			}; 		
		} else {
			res2.writeHead = function(stat, head){
				return res.writeHead(reqStatus, reqHead);
			}; 		
		}

		return otherResponse(req, res2);
		
	};
};

WebServer.forward = function(to, otherResponse){
	var ToFunc = (typeof to=='function')?to:function(){return to;};
	return WebServer.forceHead(302, function(req){return {'Location': ToFunc(req)};}, true, otherResponse);
};

WebServer.parsedUrl = function(data, parseQueryString, slashesDenoteHost){
	return function(req, res){
		return data(req, res, url.parse(req.url, parseQueryString, slashesDenoteHost))
	};
}

module.exports = WebServer;
