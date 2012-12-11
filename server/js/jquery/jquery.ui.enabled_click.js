//jQueray UI enabled click for widgets: Triggers only if the widget is enabled. 
jQuery.fn.enabled_click = function(handler){
		var me = this;
		this.click(function(event){
			if(!me.parent().hasClass("ui-state-disabled")){
				return handler(event, me, jQuery);
			}
		});
		return this;
};
