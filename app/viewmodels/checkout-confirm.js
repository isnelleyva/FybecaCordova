(function($) {
	'use strict';
	var $page = $($('script').last()).closest('[data-role="page"]'), viewModel = {

		toOrderDetail : function(form) {

			$(':mobile-pagecontainer').pagecontainer('change', 'order-detail.html?orderId=' + checkoutCart.orderId + '&orderNumber=' + viewModel.orderNumber() + '&source=ch');

		},

		orderNumber : ko.observable(''),
		messageToCustomer : ko.observable(checkoutCart.messageToCustomer),
		orderId : '',

		orderInfo : {
			customerId : "",
			customerName : "",
			address : "",
			discountCard : "",
			paymentMethod : "",
			shipmentCost : 0,
			total : 0,
			tax : 0,
			items : []
		},

		addTransactionOnGa : function() {

			try {

				var itemsToGa = $.map(viewModel.orderInfo.items, function(n, i) {
					return {
						sku : n.itemId,
						name : n.name,
						price : n.unitPrice,
						quantity : n.quantity,
						category : ''
					};
				});

				var data = {
					orderId : viewModel.orderNumber(),
					orderTotal : viewModel.orderInfo.total,
					taxes : viewModel.orderInfo.tax,
					shippingCost : viewModel.orderInfo.shipmentCost,
					items : itemsToGa
				};

				try {
					models.gaRequests.trackTransaction(data);
				} catch (e) {
					console.log('XXXXXXXXXXXXXXX ERROR ' + e);
				}

			} catch (e) {
				console.log(e);
				console.log('XXXXXXXXXXXXXXX ERROR addTransactionOnGa');
			}

		}

	};

	$page.on('pagebeforecreate', function() {
		ko.applyBindings(viewModel, $page[0]);

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);

		viewModel.orderNumber(pageUrl.param('orderNumber') || documentUrl.param('orderNumber'));
		viewModel.orderId = pageUrl.param('orderId') || documentUrl.param('orderId');

	}).on('pageinit', function() {
		$page.validate();
	}).on('pageshow', function() {

		try {

			var items = $.map(checkoutCart.cart.items(), function(n, i) {
				return {
					itemId : n.itemId(),
					name : n.name() == null || n.name() == undefined || n.name() == '' ? 'Sin nombre' : n.name(),
					quantity : n.state.quantity(),
					unitPrice : n.price.presentation(),
					imageUrl : n.imageUrl(),
					saleUnit : n.saleUnit()
				};
			});

			var data = {
				shipmentCost : checkoutCart.cart.summary.shipping(),
				total : checkoutCart.cart.summary.total(),
				tax : checkoutCart.cart.summary.tax(),
				items : items
			};

			viewModel.orderInfo = data;
			viewModel.addTransactionOnGa();

		} catch (e) {
			console.log(e);
		}

	});

})(jQuery);