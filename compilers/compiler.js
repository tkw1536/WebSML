//returns a compiler
module.exports = function(name){
	return require("./compiler."+name+".js");
};
