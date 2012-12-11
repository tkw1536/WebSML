var dialog = {};

dialog.confirm = function(title, text, height, true_callback, false_callback){
	var answer = false;
	var dialog = $("<div>")
	.attr("title", title)
	.append(
		$("<p>").append(
			'<span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;">',
			$("<div style='display:inline; '>").text(text)
		)
	).on('dialogclose', function(){
		dialog.remove();
		if(answer == true){
			true_callback();
		} else {
			false_callback();
		}
	}).dialog({
		'resizable': false,
		'height':height,
		'modal': true,
		'buttons': {
			'Yes': function() {
				answer = true;
				$(this).dialog("close");
			},
			'No': function() {
				answer = false;
				$(this).dialog("close");
			}
		}
    	});
	return dialog;
};

dialog.alert = function(title, text, height, callback){
	var dialog = $("<div>")
	.attr("title", title)
	.append(
		$("<p>").append(
			'<span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;">',
			$("<div style='display:inline; '>").text(text)
		)
	).on('dialogclose', function(){
		dialog.remove();
		callback();
	}).dialog({
		'resizable': false,
		'height':height,
		'modal': true,
		'buttons': {
			'OK': function() {
				$(this).dialog("close");
			}
		}
    	});
	return dialog;
};
