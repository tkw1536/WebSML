//returns a compiler
module.exports = function(name){
	var Instance = require("./compiler."+name+".js");
	Instance.getFlagOrg = Instance.getFlag;
	Instance.getFlag = function(flag){
		console.log(flag);
		if(flag=='compiler.name'){
			return this.compilerName;		
		} else if(flag=='compiler.version'){
			return this.compilerVersion;		
		} else if(flag=='compiler.description'){
			return this.compilerDescription;		
		} else if(flag=='compiler.fileTypes'){
			return this.supportedFileExtensions;		
		} else {
			return this.getFlagOrg(flag);	
		}
	};
	Instance.setFlagOrg = Instance.getFlag;
	Instance.setFlag = function(flag, value){
		console.log(flag);
		if(flag=='compiler.name'){
			return false;		
		} else if(flag=='compiler.version'){
			return false;		
		} else if(flag=='compiler.description'){
			return false;		
		} else if(flag=='compiler.fileTypes'){
			return false;		
		} else {
			return this.setFlagOrg(flag, value);
		}
	};
	
	return Instance;
};
