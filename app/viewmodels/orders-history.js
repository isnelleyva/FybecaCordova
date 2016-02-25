(function($) {
	'use strict';
	// var viewModel;

	var $page = $($('script').last()).closest('[data-role="page"]'), // Contexto
	viewModel = {

		orders : ko.observableArray([]),

		wasOrdersLoaded : ko.observable(false),

		goToOrderDetail : function(order) {
			$(':mobile-pagecontainer').pagecontainer('change', 'order-detail.html?orderId=' + order.orderId + '&orderNumber=' + order.number);
		}

	};

	$page.on('pagebeforecreate', function() {

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {

		try {
			if (navigator.connection.type == Connection.NONE) {
				ShowMessageInternetNotAvailable();
				return;
			}
		} catch (err) {

		}

		$.mobile.loading("show", {
			text : 'Consultando tu historial de órdenes',
			textVisible : true,
			theme : 'b'
		});

		models.CustomerActions.getOrdersHistory(localStorage.getItem('idPersona')).done(function(response) {

			viewModel.orders(response);
			$('[name="ordersList"]').listview('refresh');

			$.mobile.loading("hide");

		}).fail(function(error) {
			console.log(error);
			$.mobile.loading("hide");
		}).always(function() {
			viewModel.wasOrdersLoaded(true);
		});

	});

})(jQuery);