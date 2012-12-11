/* jQuery UI TABS+DIALOGS COMBINED */
$.fn.tabbedDialog = function (dialogopts, tabopts) {
	var me = this;
	this.tabs(tabopts);
	this.dialog(dialogopts);
	this.find('.ui-tab-dialog-close').append($('a.ui-dialog-titlebar-close'));
	this.find('.ui-tab-dialog-close').css({'position':'absolute','right':'0', 'top':'23px'});
	this.find('.ui-tab-dialog-close > a').css({'float':'none','padding':'0'});
	var tabul = this.find('ul:first');
	this.parent().addClass('ui-tabs').prepend(tabul).draggable('option','handle',tabul); 
	tabul.append(
		this.siblings('.ui-dialog-titlebar').find('a').clone()
		.click(function(){me.dialog("close");})
	);
	this.siblings('.ui-dialog-titlebar').remove();
	tabul.addClass('ui-dialog-titlebar');
	return this;
}
