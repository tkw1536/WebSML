//User Setup: Called after login. 
(function(){
	action.user_setup = function(next_step){
		$("#logout, #settings, #settings_compiler").parent().removeClass('ui-state-disabled');
		$("#pageRemainder").text("UNIMPLEMENTED");	
		next_step();
	};
})();
