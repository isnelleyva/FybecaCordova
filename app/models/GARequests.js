(function() {
	'use strict';

	window.models = window.models || {};

	models.gaRequests = {

		trackEvent : function(eventName, eventLabel) {

			try {

				var label = eventLabel == undefined ? 'default' : eventLabel;

				gaPlugin.trackEvent(function() {
					// console.log('XXXXX TRACK SUCCESS ' + eventName + ' ' +
					// eventLabel);
				}, function() {
					// console.log('XXXXX TRACK ERROR ' + eventName + ' ' +
					// eventLabel);
				}, eventName, 'tap', label, 1);

			} catch (e) {
				console.log('XXXXX Catch gaRequests.trackEvent ' + e.message);
			}

		},

		trackTransaction : function(data) {

			try {
				gaPlugin.trackTransaction(function() {
				}, function() {
					console.log('XXXXX TRACK TRANSACTION ERROR ' + data.orderId);
				}, data.orderId, data.orderTotal, data.taxes, data.shippingCost, data.items);

			} catch (e) {
				console.log('XXXXX Catch gaRequests.trackTransaction ' + e.message);
			}

		}

	};

})(jQuery);
