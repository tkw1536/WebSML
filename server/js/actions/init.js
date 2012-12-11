//Init Action
(function(){
	action.init = function(next_step){
		$("#welcomeMessage").remove();
		$("#content").show();
		next_step();
	};
})();
