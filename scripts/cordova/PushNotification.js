if (typeof PhoneGap !== "undefined") {

	/**
	 * Empty constructor
	 */
	var PushNotification = function() {
	};
	
    /**
    * Initiate Alarms
    */
    PushNotification.prototype.getToken = function (options) {
    	
    	var defaults = {
    	        success:null,
    	        error:null
    	    };
    		
		for ( var key in defaults) {
			if (typeof options[key] !== "undefined") {    			    
				defaults[key] = options[key];
			}
		}
    	
        Cordova.exec(defaults.success, defaults.error, 'PushNotification', 'getToken', [defaults]);
    };

	/**
	 * Register this plugin with phonegap
	 */
	window.pushNotification = new PushNotification();
}