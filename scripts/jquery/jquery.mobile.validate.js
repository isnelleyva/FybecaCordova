/**
 * jQuery Mobile extensions for the jQuery validate plugin.
 * Lee Powers March 2012
 */
(function ($) {
    // Handle specially-formatted jQuery mobile form elements
    jQuery.validator.setDefaults({
        errorPlacement: function (label, element) {
        	var tag = element[0].tagName.toUpperCase();
        	if (tag == 'SELECT') {
        		label.appendTo(element.closest('.ui-select'));
        		return;
        	} else if (tag == 'INPUT') {
        		var type = element[0].type.toLowerCase();
        		if (type == 'checkbox' || type == 'radio') {
        			var container = element.closest('.ui-controlgroup-controls');
        			if (container.length > 0) {
        				label.appendTo(container);
        				return;
        			} else {
        				container = element.closest('.ui-' + type);
        				if (container.length > 0) {
        					label.insertAfter(container);
        					return;
        				}
        			}
                }else if(type == 'text' || type == 'tel' || type == 'password' || type == 'number'){
                    var container = element.closest('div.ui-input-text');
                    if (container.length > 0) {
                        label.insertAfter(container);
                        return;
                    }
                }
        	}
        	// Default insertion - always show the error message
        	label.insertAfter(element);
        }
    });
})(jQuery);