//User Setup: Called after login. 
(function(){

	var page_resize = function(){
		var m_size = $("#menubar").outerHeight(true);
		var p_height = $(document).height();
		var p_width = $(document).width()
		$("#pageRemainder").css({
			'position': 'fixed',
			'top': m_size,
			'height': p_height - m_size,
			'width': p_width,
			'overflow': 'auto'
		});
	};

	action.user_setup = function(next_step){
		$("#logout, #settings, #settings_compiler, #open").parent().removeClass('ui-state-disabled');
		$(window).resize(page_resize);
		page_resize();

		next_step();
	};
})();
