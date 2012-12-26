(function($) {
	var terminal_init = function($me, options, onEval){
		var options = jQuery.extend({
			'greeting': '',
			'prompt': '>',
			'onEval': function(){},
			'autoEnable': true,
			'autoFocus': true,
			'maxHistory': 0, //-1 => disabled, 0 = infinite, # => number
			'otherKey': function(){}
		}, options);
		if(typeof onEval == 'function'){
			options.onEval = onEval;		
		}
		$me.data('jqterm_option', options);
		$me.css("overflow", "auto");
		var history = [""];
		var historyIndex = 0;
		var upDateHistoryIndex = function(rel){
			if(options.maxHistory<0){
				return false;
			} else if(options.maxHistory>0){
				while(history.length+1 > options.maxHistory){
					history.shift();
					historyIndex--;
				}
			}
			historyIndex += rel;
			historyIndex = historyIndex % history.length;
			$input.val(history[historyIndex]);
		}

		var $div = $("<div>")
		.css({
			"background-color": "black",
			"color": "#AAA",
			"font-family": 'FreeMono, monospace',
			"font-size": 12	
		});

		var uuid = (function(){
			var S4 = function ()
			{
			return Math.floor(
				Math.random() * 0x10000 /* 65536 */
			    ).toString(16);
			};

			return (
			    S4() + S4() + "-" +
			    S4() + "-" +
			    S4() + "-" +
			    S4() + "-" +
			    S4() + S4() + S4()
			);
		})();


		var $contentTd = $("<td>");
		var $input = 
		$("<input type='text'>").attr("id", uuid).attr("name", uuid)
		.css({
			"width": "100%",
			"border": "none",
			"background-color": "black",
			"color": "#AAA",
			"font-family": 'FreeMono, monospace',
			"font-size": 12
		})
		.on('keydown', function(e){
			if (e.keyCode == 38) {//Up
				upDateHistoryIndex(-1);
				return false;
			} else if(e.keyCode == 40){//down
				upDateHistoryIndex(1);
				return false;
			} else if(e.keyCode != 13){
				options.otherKey.call(this, e, this);
				return true;
			}
		});
		$me.data("jqterm_contenttd", $contentTd);

		var $form = $("<form>")
		.on('submit', function(){
			if($me.data("jqterm_enabled")){
				var val = $input.val();
				history.pop()
				history.push(val);
				history.push("")
				historyIndex = history.length-1;
				upDateHistoryIndex(0);
				terminal_echo($me, "", function(e){
					e
					.append(options.prompt, "&nbsp;", $("<div style='display:inline'>")
					.text(val));
				});
				try{
					options.onEval.call($me, val, $me);
				} catch(e){}
			}
			return false;
		}).append($div).appendTo($me);
		
		var $table = 
		$("<table>")
		.css({
			"width": "100%",
			"border": "none",
			"background-color": "black",
			"color": "#AAA",
			"font-family": 'FreeMono, monospace',
			"font-size": 12
		})
		.append(
			$("<tr>").append($contentTd).css("vertical-align", "top"),
			$("<tr>").append(
				$("<td>").css("vertical-align", "bottom").append(
					$("<div>").append(
						$("<label>").css({
						"display": "block",
						"overflow": "hidden",
						"padding": "0 4px 0 6px"	
						})
						.attr("for", uuid)
						.text(options.prompt), 
						$("<span>")
						.css({
							"display": "table-cell",
							"padding": "0 0 0 5px"		
						})
						.append($input)
					).css({
							"display": "table",
    							"width": "100%"
					})
				)
			)
		);
		$div.append($table);

		$div.add($form).add($table).css({
			"width": "100%",
			"height": "100%"
		});
		
		if(options.greeting != ''){
			$me.webTerminal('echo', greeting);	
		}
		if(options.autoEnable){$me.webTerminal('enable');};

		if(options.autoFocus){
			$me.click(function(){
				$input.focus();
				$me.scrollTop($me.get(0).scrollHeight);
			}).click();	
		}
	};

	var terminal_disable = function($me){
		$me.find("tr :last").hide();
	};
	
	var terminal_enable = function($me){
		$me.find("ftr :last").show();
		$me.webTerminal('focus');
		$me.scrollTop($me.get(0).scrollHeight);
	};

	var terminal_echo = function($me, content, callback){

		function makeHTML(text) {//adapted from: http://stackoverflow.com/questions/4535888/jquery-text-and-newlines
		    var htmls = [];
		    var lines = text.split("\n");
		    var tmpDiv = $("<div>");
		    for(var i = 0; i<lines.length; i++){
			htmls.push(tmpDiv.text(lines[i]).html());
		    }
		    return htmls.join("<br>");
		}

		var elem = $("<div>").html(makeHTML(content)).appendTo($me.data("jqterm_contenttd"));
		if(typeof callback == 'function'){
			callback.call(elem, elem, $me);		
		}
		$me.scrollTop($me.get(0).scrollHeight);
	};

	var terminal_clear = function($me){
		$me.data("jqterm_contenttd").clear();
	};
	

	$.fn.webTerminal = function(option, option2, option3) {
		this.each(function(){
			var $me = $(this);
			if($me.data("jqterm") === true){
				if(option == 'disable' && $me.data("jqterm_enabled")===true){
					terminal_disable($me);
					$me.data("jqterm_enabled", false);
				}else if(option == 'enable' && $me.data("jqterm_enabled")===false){
					terminal_enable($me);
					$me.data("jqterm_enabled", true);
				} else if(option == 'remove'){
					$me
					.data("jqterm", false)
					.replaceWith($me.data("jqterm_originelem"))
					.data("jqterm_originelem", false);
				} else if(option === 'echo'){
					terminal_echo($me, option2, option3);
				} else if(option === 'clear'){
					terminal_clear($me);	
				} else if(option === 'focus'){
					$me.click();				
				}
			} else {
				$me.data("jqterm_originelem", $me.clone());
				$me.data("jqterm", true);
				$me.data("jqterm_enabled", false);
				if(typeof option == 'function'){
					terminal_init($me, option2, option);	
				} else {
					terminal_init($me, option, option2);	
				}
				
			}
			
		});
		return this;
	};
})(jQuery);
