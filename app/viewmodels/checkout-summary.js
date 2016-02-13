(function($) {
	'use strict';
	// var viewModel;

	var $page = $($('script').last()).closest('[data-role="page"]'), viewModel = {

		isShipmentsElegible : ko.observable(checkoutCart.isShipmentsElegible()),

		shipments : ko.observable(checkoutCart.shipments()),

		checkoutCart : checkoutCart,

		questions : data.questions(),

		hasOneShipmentElement : ko.observable(checkoutCart.hasOneShipmentElement()),

		toOrderConfirm : function(form) {

			if ($(form).valid()) {
				checkoutCart.disableCalls(true);
				// checkoutCart.callServicePayment();
				viewModel.checkIFhasMissingData();
			}

		},

		checkIFhasMissingData : function() {

			// models.CustomerActions.checkIfHasMissingData({
			// userId : checkoutCart.customerId
			// }).done(function(response) {
			// if (response.hasMissingData) {
			// $('#popupConfirmMissingData').popup('open');
			// } else {
			checkoutCart.callServicePayment();
			// }
			// }).fail(function(response) {
			//
			// });

		},

		showMissingDataForm : function() {
			$('#popupConfirmMissingData').popup('close');
			setTimeout(function() {
				$('#popupMissingData').popup('open');
			}, 250);
		},

		saveMissingDataForm : function(form) {

			if ($(form).valid()) {

				var userData = $(form).serializeObject();
				models.CustomerActions.saveMissingData({
					userId : checkoutCart.customerId,
					question : userData.question,
					answer : userData.answer,
					missingBirthday : userData.missingBirthday,
					missingGender : userData.missingGender,
					missingMaritalStatus : userData.missingMaritalStatus
				}).done(function(response) {
					checkoutCart.callServicePayment();
				}).fail(function() {

				});

			}

		},

		onLoadImage : function(data, event) {
			$(event.target).css('display', '');
			$(event.target).next().css('display', 'none');
		}
		
	};

	viewModel.shipments.subscribe(function(shipments) {
		checkoutCart.shipments(shipments);
		setTimeout(function() {
			$('#listCart').listview('refresh');
		}, 200);
	});

	$page.on('pagebeforecreate', function() {

		ko.applyBindings(viewModel, $page[0]);

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'backh':
				$(':mobile-pagecontainer').pagecontainer('change', 'product-detail.html');
				break;
			}
		});

	}).on('pageshow', function() {
		// ko.mapping.fromJS(checkoutCart.items, viewModel.cart.items);
		$('#listCart').listview('refresh');
		checkoutCart.orderNumber = Math.floor(Math.random() * 999999) + '';
	});

})(jQuery);