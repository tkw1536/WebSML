//SML Compiler
var Compiler = function(){
	
	this.Executable = "/usr/share/smlnj/bin/sml"; //Replace this by your executable
	this.PreFileNameArgs = []; //Arguments prior to file name
	this.PostFileNameArgs = []; //Arguments after file name
	this.EmptyArguments = []; //Arguments for running compiler only. 

	Compiler.super_.apply(this, arguments);//Call the super constructor with all arguments
};

Compiler.__setup = function(inheritFunction){
	//since stdProcess is true this function is called. It creates the inheritance ... 
	inheritFunction(Compiler);
}

module.exports = Compiler;
