//Menu Action
(function(){
	action.menu = function(next_step){
		$("#menubar").show().menubar({
			autoExpand: true,
			menuIcon: true,
			buttons: true
		}).ui_keyShort(document);
		next_step();
	};
})();
