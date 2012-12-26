
(function($){

	/* Adapted */
	jQuery.fn.ui_keyShort = function(scope){
		var map = {};
		this.each(function(i, e){
			var el = $(e);
			el.find("a").each(function(i, e){
				var a = $(e);
				var span = a.find("span");
				try{
					if(!span.hasClass("ui-button-text")){
						map[span.text().toLowerCase()] = function(){if(!a.parent().hasClass("ui-state-disabled")){a.click();}}
					}
				} catch(e){}
			});
		});
		$(scope).on('keydown', function(e){
			var evt = keyEventToString(e).toLowerCase();
			if(map.hasOwnProperty(evt)){
				map[evt]();
				return false;
			} else {
				return true;			
			}
		});
		return this;
	};

	/* adapted from jQuery Hotkeys Plugin
	 * Copyright 2010, John Resig
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	*/

	var specialKeys = {
		8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
		20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
		37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
		96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
		104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
		112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
		120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
	}

	var shiftNums = {
	"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", 
	"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<", 
	".": ">",  "/": "?",  "\\": "|"
	}

	var keyEventToString = function(event){
		var result = "";
		result += event.altKey?"alt+":"";
		result += event.ctrlKey?"ctrl+":"";
		result += (event.metaKey && !event.ctrlKey)?"meta+":"";
		result += event.shiftKey?"shift+":"";
		if(event.which == 17 || event.which == 18 || event.which ==  19 || event.which == 224){
			return specialKeys[event.which];//just one of them
		} else {
			
			var char = specialKeys[event.which]?specialKeys[event.which]:String.fromCharCode(event.which).toLowerCase()
			if(event.shiftKey){
				char = shiftNums[char]?shiftNums[char]:char.toUpperCase();	
			}
			return result+char;
		}
	}
})(jQuery);
