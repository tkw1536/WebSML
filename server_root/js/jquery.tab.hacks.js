(function($){
	//Tab Hack: Enables Tabs in text areas
	//Source: http://stackoverflow.com/questions/1738808/keypress-in-jquery-press-tab-inside-textarea-when-editing-an-existing-text
	$.fn.tab_hack = function(opt){
		if(opt=='disable'){
			this.unbind("keydown.tabHack");
		} else {
			this.bind("keydown.tabHack", function (e) {
					if (e.keyCode == 9) {
						var myValue = "\t";
						var startPos = this.selectionStart;
						var endPos = this.selectionEnd;
						var scrollTop = this.scrollTop;
						this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos,this.value.length);
						this.focus();
						this.selectionStart = startPos + myValue.length;
						this.selectionEnd = startPos + myValue.length;
						this.scrollTop = scrollTop;

						e.preventDefault();
					}
				});
		}
		return this;
	}
})(jQuery)
