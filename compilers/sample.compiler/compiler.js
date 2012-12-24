//Sample Compiler
var Compiler = function(){
	//Setup
	this.Executable = "/bin/cat"; //Replace this by your executable
	this.PreFileNameArgs = []; //Arguments prior to file name
	this.PostFileNameArgs = []; //Arguments after file name
	this.EmptyArguments = []; //Arguments for running compiler only. 

	Compiler._super.apply(this, arguments);//Call the super constructor with all arguments
};

Compiler.__setup = function(inheritFunction){
	//since stdProcess is true this function is called. It creates the inheritance ... 
	inheritFunction(Compiler);
	
	
}

module.exports = Compiler;
