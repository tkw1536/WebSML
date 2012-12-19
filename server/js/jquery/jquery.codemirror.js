/* jQuery CodeMirror */
$.fn.codeMirror = function (opts, hackSize) {
	var me = this[0];
	if(hackSize===true){
		$(me)
		.height($(me).height())
		.width($(me).width());
	}
	return CodeMirror(me, opts);
}
