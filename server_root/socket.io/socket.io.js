/* SOCKET IO DUMMY */

var io = {
	"connect": function(){
		console.log("DUMMY CODE");
		return io;	
	},
	"on": function(){return io;},
	"once": function(){return io;},
	"emit": function(){return io;},
	"disconnect": function(){return io;}
}

window.document.title += "[OFFLINE DUMMY]";
