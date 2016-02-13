if (typeof PhoneGap !== "undefined") {

	/**
	 * Empty constructor
	 */
	var NativeNotification = function() {
	};
	
    /**
    * Consultar por información de alguna notificación
    */
	NativeNotification.prototype.getNotificationInfo = function (options) {
    	
    	var defaults = {
    	        success:null,
    	        error:null
    	    };
    		
		for ( var key in defaults) {
			if (typeof options[key] !== "undefined") {    			    
				defaults[key] = options[key];
			}
		}
    	
        Cordova.exec(defaults.success, defaults.error, 'NativeNotification', 'getNotificationInfo', [defaults]);
    };

	/**
	 * Register this plugin with phonegap
	 */
	window.nativeNotification = new NativeNotification();
}