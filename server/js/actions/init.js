//Init Action
(function(){
	action.init = function(next_step){
		$("#welcomeMessage").remove();
		$("#content").show();
		client.on('disconnect', dialog.disconnect);
		next_step();
	};
})();
