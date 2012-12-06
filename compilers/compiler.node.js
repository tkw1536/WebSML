/* Compiler SML */

var compiler = {
	"name": "Node", //Name
	"executablePath": "/usr/bin/node", //Path of the executable
	"FileInput": true, //Does this compiler accept files a as input or does it need an argument of the content
	"FileInputExtension": "js", //extension for file input if enabled above
	"arguments": [] //additional arugments to pass before the filename
}

module.exports = compiler;
