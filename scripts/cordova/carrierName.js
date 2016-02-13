
if (typeof PhoneGap !== "undefined") {

	/**
	 * Empty constructor
	 */
	var CarrierName = function() {
	};
	
    /**
    * Initiate Alarms
    */
	CarrierName.prototype.getCarrier = function (options) {
    	
    	var defaults = {
    	        success:null,
    	        error:null
    	    };
    		
		for ( var key in defaults) {
			if (typeof options[key] !== "undefined") {    			    
				defaults[key] = options[key];
			}
		}
    	
        Cordova.exec(defaults.success, defaults.error, 'CarrierName', 'getCarrier', [defaults]);
    };

	/**
	 * Register this plugin with phonegap
	 */
	window.carrierName = new CarrierName();
}