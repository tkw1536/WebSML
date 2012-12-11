//NodeJS Compiler
var node_compiler = require("./compiler_template");

node_compiler.Executable = "/usr/bin/node"; //Replace this by your executable
node_compiler.PreFileNameArgs = []; //Arguments prior to file name
node_compiler.PostFileNameArgs = []; //Arguments after file name
node_compiler.EmptyArguments = []; //Arguments for running compiler only. 
node_compiler.supportedFileExtensions = ['js']; //Supported File Extensions


node_compiler.compilerName = "NodeJS"; 
node_compiler.compilerVersion = "v0.8.15";
node_compiler.compilerDescription = "NodeJS compiler. ";

module.exports = node_compiler;
