//Client Actions
var action = {};

action.empty_action = function(next_action){next_action();};

action.runChained = function(arr, finish){
	var i = -1;
	var next_action = function(){
		i++;
		if(i<arr.length){
			window.setTimeout(function(){action[arr[i]](next_action);}, 10);
		} else {
			if(typeof finish == 'function'){
				finish();			
			}
		}
	};
	return next_action;
};
