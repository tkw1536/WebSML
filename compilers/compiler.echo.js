
/* Echo 'compiler' */
/* A simple example for a compiler configuration */

var compiler = {
	"name": "Echo compiler", //Name
	"executablePath": "/bin/echo", //Path of the executable
	"FileInput": false, //Does this compiler accept files a as input or does it need an argument of the content
	"FileInputExtension": "", //extension for file input if enabled above
	"arguments": [] //additional arugments to pass before the filename
}

module.exports = compiler;
