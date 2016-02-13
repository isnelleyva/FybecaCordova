(function() {
	var cordovaRef = window.PhoneGap || window.cordova || window.Cordova;

	function GAPlugin() {
	}

	// initialize google analytics with an account ID and the min number of
	// seconds between posting
	//
	// id = the GA account ID of the form 'UA-00000000-0'
	// period = the minimum interval for transmitting tracking events if any
	// exist in the queue
	GAPlugin.prototype.init = function(success, fail, id, period) {
		return cordovaRef.exec(success, fail, 'GAPlugin', 'initGA', [ id, period ]);
	};

	// log an event
	//
	// category = The event category. This parameter is required to be
	// non-empty.
	// eventAction = The event action. This parameter is required to be
	// non-empty.
	// eventLabel = The event label. This parameter may be a blank string to
	// indicate no label.
	// eventValue = The event value. This parameter may be -1 to indicate no
	// value.
	GAPlugin.prototype.trackEvent = function(success, fail, category, eventAction, eventLabel, eventValue) {
		return cordovaRef.exec(success, fail, 'GAPlugin', 'trackEvent', [ category, eventAction, eventLabel, eventValue ]);
	};

	// log a page view
	//
	// pageURL = the URL of the page view
	GAPlugin.prototype.trackPage = function(success, fail, pageURL) {
		try {
			return cordovaRef.exec(success, fail, 'GAPlugin', 'trackPage', [ pageURL ]);
		} catch (e) {
			fail('error');
		}
	};

	// Set a custom variable. The variable set is included with
	// the next event only. If there is an existing custom variable at the
	// specified
	// index, it will be overwritten by this one.
	//
	// value = the value of the variable you are logging
	// index = the numerical index of the dimension to which this variable will
	// be assigned (1 - 20)
	// Standard accounts support up to 20 custom dimensions.
	GAPlugin.prototype.setVariable = function(success, fail, index, value) {
		return cordovaRef.exec(success, fail, 'GAPlugin', 'setVariable', [ index, value ]);
	};

	GAPlugin.prototype.exit = function(success, fail) {
		return cordovaRef.exec(success, fail, 'GAPlugin', 'exitGA', []);
	};

	/**
	 * GA Ecommerce Transaction tracking
	 * 
	 * @param {type}
	 *            success
	 * @param {type}
	 *            fail
	 * @param {type}
	 *            transId Unique transaction id
	 * @param {type}
	 *            orderTotal Order total
	 * @param {type}
	 *            items JSON array
	 * 
	 * <pre>
	 * [{sku: &lt;string&gt;, name: &lt;string&gt;, price: &lt;number&gt;, quantity: &lt;number&gt;, category:&lt;string&gt;}]
	 * </pre>
	 * 
	 * @returns {@exp;cordovaRef@call;exec}
	 * 
	 * @author Gihan S <gihanshp@gmail.com>
	 */

	GAPlugin.prototype.trackTransaction = function(success, fail, transId, orderTotal, taxes, shipping, items) {
		return cordovaRef.exec(success, fail, 'GAPlugin', 'trackTransaction', [ transId, orderTotal, taxes, shipping, items ]);
	};

	if (cordovaRef && cordovaRef.addConstructor) {
		cordovaRef.addConstructor(init);
	} else {
		init();
	}

	function init() {
		if (!window.plugins) {
			window.plugins = {};
		}
		if (!window.plugins.gaPlugin) {
			window.plugins.gaPlugin = new GAPlugin();
		}
	}

	if (typeof module != 'undefined' && module.exports) {
		module.exports = new GAPlugin();
	}
})(); /* End of Temporary Scope. */
