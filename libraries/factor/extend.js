(function () {
	'use strict';
	
	String.prototype.format = function() {
		var s = this,
			i = arguments.length;
	
		while (i--) {
			s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
		}
		return s;
	};
	Number.prototype.format = function(c, d, t){
		var n = this, 
			c = isNaN(c = Math.abs(c)) ? 2 : c, 
			d = d == undefined ? "." : d, 
			t = t == undefined ? "," : t, 
			s = n < 0 ? "-" : "", 
			i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
			j = (j = i.length) > 3 ? j % 3 : 0;
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	};
	$.fn.serializeObject = function () {
		var self = this,
			json = {},
			push_counters = {},
			patterns = {
				"validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
				"key": /[a-zA-Z0-9_]+|(?=\[\])/g,
				"push": /^$/,
				"fixed": /^\d+$/,
				"named": /^[a-zA-Z0-9_]+$/
			};
	
		this.build = function (base, key, value) {
			base[key] = value;
			return base;
		};
	
		this.push_counter = function (key) {
			if (push_counters[key] === undefined) {
				push_counters[key] = 0;
			}
			return push_counters[key]++;
		};
	
		$.each($(this).serializeArray(), function () {
	
			// skip invalid keys
			if (!patterns.validate.test(this.name)) {
				return;
			}
	
			var k,
				keys = this.name.match(patterns.key),
				merge = this.value,
				reverse_key = this.name;
	
			while ((k = keys.pop()) !== undefined) {
	
				// adjust reverse_key
				reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');
	
				// push
				if (k.match(patterns.push)) {
					merge = self.build([], self.push_counter(reverse_key), merge);
				}
	
					// fixed
				else if (k.match(patterns.fixed)) {
					merge = self.build([], k, merge);
				}
	
					// named
				else if (k.match(patterns.named)) {
					merge = self.build({}, k, merge);
				}
			}
	
			json = $.extend(true, json, merge);
		});
	
		return json;
	};
})();	