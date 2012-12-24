//Sample Compiler
var Compiler = function(){
	this._super.apply(this, arguments);//Call the super constructor with all arguments
};

Compiler.__setup = function(inheritFunction){
	//since stdProcess is true this function is called. It creates the inheritance ... 
	inheritFunction(Compiler);
	
	//Setup
	Compiler.Executable = "/bin/cat"; //Replace this by your executable
	Compiler.PreFileNameArgs = []; //Arguments prior to file name
	Compiler.PostFileNameArgs = []; //Arguments after file name
	Compiler.EmptyArguments = []; //Arguments for running compiler only. 
}

module.exports = Compiler;