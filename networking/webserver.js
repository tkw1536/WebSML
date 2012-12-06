//webserver.js: Create a simple Web server with several options

var http = require('http'),
fs = require('fs'),
url = require('url'),
path = require('path'),
lib = require('./../lib/misc'),
extend = lib.extend;



var webServer = function(opts, mime){
	var options = extend(
	{
		"port": 80, //Port
		"root": "./", //Server root directory
		"indexFile": "index.html", //Index files
		"ignore": function(){return false;},//is a file being ignored?
		"dynExtension": "dynamic",//Extension for dynamic file
		"specialFile": function(filename, request){return filename;}//dynamic files: return
	}	
	, opts);

	var root = path.resolve(options.root);
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
	}, mime);
	
	
	return http.createServer(function(req, res) {//create the server
		var uri = url.parse(req.url).pathname;
		uri = lib.endsWith(uri, "/")?uri+index:uri;//Directory index files
		var filename = path.resolve(path.join(root, uri));//resolve absolute filename
		var extension = lib.lastMember(path.extname(filename).split("."));
		if(!lib.isIn(filename, root) && extension != options.dynExtension){//Access denied. We used a .. in the request
				res.writeHead(401, {'Content-Type': 'text/plain'});
				res.write('401 Access denied\n');
				res.end();
				return;			
		}
	
		if(extension == options.dynExtension)
		{
			filename = path.resolve(options.specialFile(filename, req));
		}
		
		fs.exists(filename, function(exists) {
			if(!exists || ignore(filename)) {//Not Found
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.write('404 Not Found\n');
				res.end();
				return;
			}
			try{
			var mimeType = mimeTypes[lastMember(path.extname(filename).split("."))];
			} catch(e){var mimeType = "text/plain";}
			res.writeHead(200, {'Content-Type':mimeType});
	
			var fileStream = fs.createReadStream(filename);//pump to the client
			fileStream.pipe(res);
		});
	}).listen(options.port);
};

module.exports = webServer;
