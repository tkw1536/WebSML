//SML Compiler
var sml_compiler = require("./compiler_stdprocess");

sml_compiler.Executable = "/usr/share/smlnj/bin/sml"; //Replace this by your executable
sml_compiler.PreFileNameArgs = []; //Arguments prior to file name
sml_compiler.PostFileNameArgs = []; //Arguments after file name
sml_compiler.EmptyArguments = []; //Arguments for running compiler only. 
sml_compiler.supportedFileExtensions = ['sml']; //Supported File Extensions


sml_compiler.compilerName = "Standard ML of New Jersey"; 
sml_compiler.compilerVersion = "v110.74";
sml_compiler.compilerDescription = "Standard ML of New Jersey Compiler. ";

module.exports = sml_compiler;
