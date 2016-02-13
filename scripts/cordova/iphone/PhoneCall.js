if (typeof PhoneGap !== "undefined") {

	/**
	 * Empty constructor
	 */
	var PhoneCall = function() {
	};
	
    /**
    * Make Call
    */
    PhoneCall.prototype.makeCall = function (options) {
    	
    	var defaults = {
                phoneNumber:"",
    	        success:null,
    	        error:null
    	    };
    		
		for ( var key in defaults) {
			if (typeof options[key] !== "undefined") {    			    
				defaults[key] = options[key];
			}
		}
    	
        Cordova.exec(defaults.success, defaults.error, 'PhoneCall', 'makeCall', [defaults]);
    };

	/**
	 * Register this plugin with phonegap
	 */
	window.phoneCall = new PhoneCall();
}