var fs = require('fs'),
path = require('path'),
lib = require('./misc');

var DB = function(dataDir, defaults){
	if(!lib.isDir(path.resolve(dataDir))){
		fs.mkdirSync(dataDir);
	}
	dataDir = path.resolve(dataDir);
	
	var Cache = {};//Cache
	var CacheStatus = {};//0: loaded, 1: changed, 2: saved

	this.loadCache = function(db){//Loads the Cache for a certain DB
		var db = lib.defineIfNull(db, DB.defaultName);
		try{
			if(CacheStatus[db] === 1){return false;}
			Cache[db] = JSON.parse(fs.readFileSync(path.join(dataDir, db+"."+DB.extension)));
			CacheStatus[db] = 0;
			return true;
		} catch(e){
			return false;
		}
	};
	
	this.forceLoadCache = function(db){//Forces loading the cache overwriting all changes
		var db = lib.defineIfNull(db, DB.defaultName);
		try{
			Cache[db] = JSON.parse(fs.readFileSync(path.join(dataDir, db+"."+DB.extension)));
			CacheStatus[db] = 0;
			return true;
		} catch(e){
			return false;
		}
	};

	this.writeCache = function(db){//writes the Cache for a certain DB
		var db = lib.defineIfNull(db, DB.defaultName);
		if(!this.isBaseOpen(db)){
			return false;		
		}		
		try{
			if(CacheStatus[db] === 2){return false;}
			fs.writeFileSync(path.join(dataDir, db+"."+DB.extension), JSON.stringify(Cache[db]));
			CacheStatus[db] = 2;
			return true;
		} catch(e){
			return false;		
		}
	};

	this.openBase = function(name, defaults){//opens a Base
		var name = lib.defineIfNull(name, DB.defaultName);
		var defaults = lib.defineIfNull(defaults, {});
		var filename = path.join(dataDir, name+"."+DB.extension);
		if(!lib.isFile(filename)){
			Cache[name] = defaults;
			CacheStatus[name] = 1;
			return true;
		} else {
			return this.loadCache(name);
		}
	};

	this.open = function(defaults){//opens the standard Base
		return this.openBase(undefined, defaults);
	};

	this.isBaseOpen = function(name){//is a Base open?
		return Cache.hasOwnProperty(name);
	};

	this.closeBase = function(name, save){//closes a Base
		var name = lib.defineIfNull(name, DB.defaultName);
		save = (typeof save == 'boolean')?save:true;
		if(save){this.writeCache(name);}
		delete Cache[name];
		delete CacheStatus[name];
		
	};
	
	this.writeBaseKey = function(name, key, value, autoCache){//writes a key
		var name = lib.defineIfNull(name, DB.defaultName);
		if(!this.isBaseOpen(name)){
			return false;		
		}
		key = (typeof key==='string')?key:(new Date().getTime().toString()+"_"+Math.random().toString().split(".")[1]);
		autoCache = (typeof autoCache == 'boolean')?autoCache:true;
		Cache[name][key] = value;
		if(autoCache){
			this.writeCache(name);	
		}
		return key;
		
	};
	
	this.writeKey = function(key, value, autoCache){//writes a key in the default base
		return this.writeBaseKey(undefined, key, value, autoCache);
	};

	this.readBaseKey = function(name, key, def, autoOpen, autoWrite){//reads a key
		var autoWrite = (typeof autoWrite=='boolean')?autoWrite:true;
		var name = lib.defineIfNull(name, DB.defaultName);
		if(!this.isBaseOpen(name)){
			if(autoOpen){
				this.openBase(name, {});
			} else {
				throw new Error("Base not opened. ");			
			}	
		}
		this.loadCache(name);//refresh the cache
		if(!this.BaseHasKey(name, key)){
			Cache[name][key] = def;
			if(autoWrite === true){
				this.writeCache(name);
			}
			return def;
		} else {
			return Cache[name][key]; 		
		}
	};

	this.readKey = function(key, def, autoWrite){//reads a key in the default base
		var autoWrite = (typeof autoWrite=='boolean')?autoWrite:true;
		return this.readBaseKey(undefined, key, def, true, autoWrite);
	};

	this.deleteBaseKey = function(name, key, autoCache){
		var name = lib.defineIfNull(name, DB.defaultName);
		if(!this.isBaseOpen(name)){
			return false;		
		}
		autoCache = (typeof autoCache == 'boolean')?autoCache:true;
		delete Cache[name][key];
		if(autoCache){
			this.writeCache(name);	
		}
		return true;
	};

	this.deleteKey = function(key, autoCache){
		var autoCache = (typeof autoCache=='boolean')?autoCache:true;
		return this.deleteBaseKey(undefined, key, autoCache);
	};

	this.deleteBase = function(name){//deletes a base conmplete (from disk also); to reset use forceLoadCache which reloads from Disk
		if(this.isBaseOpen(name)){
			this.closeBase(name);	
		}
		try{
			var filename = path.join(dataDir, db+"."+DB.extension);
			if(lib.isFile(filename)){
				fs.unlinkSync(filename); 
				return true;
			} else {
				return false;
			}
		} catch(e){
			return false;
		}
	};

	this.getBaseKeys = function(name, autoOpen){//gets the keys stored inside a certain base
		var name = lib.defineIfNull(name, DB.defaultName);
		if(!this.isBaseOpen(name)){
			if(autoOpen){
				this.openBase(name, {});
			} else {
				throw new Error("Base not opened. ");			
			}	
		}
		this.loadCache(name);//refresh the cache
		var keys = [];
		for(var key in Cache[name]){
			if(Cache[name].hasOwnProperty(key)){keys.push(key);}
		}
		return keys;
	};

	this.getKeys = function(){
		return this.getBaseKeys(undefined, true);
	};

	this.getAllFromBase = function(name){
		var keys = this.getBaseKeys(name, true);
		var res = {};
		for(var i=0;i<keys.length;i++){
			res[keys[i]] = 	this.readBaseKey(name, keys[i]);
		}
		return res;
	}

	this.BaseHasKey = function(name, key, autoOpen){
		var name = lib.defineIfNull(name, DB.defaultName);
		if(!this.isBaseOpen(name)){
			if(autoOpen){
				this.openBase(name, {});
			} else {
				throw new Error("Base not opened. ");			
			}
		}
		this.loadCache(name);
		return Cache[name].hasOwnProperty(key);
		
	};
	
	this.hasKey = function(key, autoOpen){
		return this.BaseHasKey(undefined, key, autoOpen);
	};
	
};

DB.defaultName = 'index';
DB.extension = 'db'

module.exports = DB;
