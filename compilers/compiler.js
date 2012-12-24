var path = require('path'),
fs = require('fs'),
stdProcess = require("./stdprocess"),
lib = require("./../lib/misc"),
util = require('util');

var CompilerCache = {};
var Compilers = {};

Compilers.cachePackage = function(pack){
	//Add a new package to the cache
	var packPath = path.resolve(path.join(__dirname, "./"+pack+".compiler/"));
	if(lib.isDir(packPath) && lib.isFile(packPath+"/info.json") && lib.isFile(packPath+"/compiler.js")){
		var JSONText = fs.readFileSync(packPath+"/info.json");
		var CompilerCacheObject = JSON.parse(JSONText);
		CompilerCache[pack] = CompilerCacheObject;
		return true;
	} else {
		throw "Pack not found. ";
	}
}

Compilers.cachePackages = function(packs){
	//cache an array of packages and return success
	var results = [];
	for(var i=0;i<packs.length;i++){
		try{
			Compilers.cachePackage(packs[i]);
			results.push(true);
		} catch(e){results.push(false);}
	}
	return results;
}

Compilers.findPackagesFor = function(extension){
	//finds package for an extension
	var packs = [];
	for(var key in CompilerCache){
		if(CompilerCache.hasOwnProperty(key)){
			if(CompilerCache[key].supportedExtensions.indexOf(extension)>-1){
				packs.push(key);
			}
		}
	}
	return packs;
}

Compilers.findPackageFor = function(extension){
	//returns the first package for an extension or false
	var packs = Compilers.findPackagesFor(extension);
	return (packs.length > 0)?Compilers.getPackage(packs[0]):false;
}

Compilers.getPackage = function(name){
	//get an actual package
	var packCacheObject = CompilerCache[name];
	var packModule = require("./"+name+".compiler/compiler");
	if(packCacheObject.stdProcess === true){
		packModule.__setup(function(obj){
			util.inherits(obj, stdProcess);
		});
	}
	packModule.supportedFileExtensions = packCacheObject.supportedExtensions;
	packModule.compilerName = packCacheObject.name; 
	packModule.compilerVersion = packCacheObject.version;
	packModule.compilerDescription = packCacheObject.description;
	return packModule;
}

module.exports = Compilers;
