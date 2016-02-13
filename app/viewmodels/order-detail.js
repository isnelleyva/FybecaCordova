(function($) {
	'use strict';
	// var viewModel;

	var $page = $($('script').last()).closest('[data-role="page"]'), viewModel = {
		cart : new Cart(),
		orderId : ko.observable(""),
		orderNumber : ko.observable(""),
		orderSource : '',
		orderCart : ko.mapping.fromJS([]),
		showInfo : ko.observable(false),
		showLegend : ko.observable(false),

		orderInfo : ko.observable({
			customerId : "",
			customerName : "",
			address : "",
			discountCard : "",
			paymentMethod : "",
			shipmentCost : 0,
			total : 0,
			tax : 0,
			items : ko.observableArray([])
		}),

		goToPreviousPage : function() {
			var previousPage = '';
			if (!customer.isGuest()) {
				previousPage = 'orders-history.html';
			} else {
				previousPage = '../../index.html';
			}

			$(':mobile-pagecontainer').pagecontainer('change', previousPage, {
				reverse : true
			});

		},

		addTransactionOnGa : function() {

			try {

				var itemsToGa = $.map(viewModel.orderInfo().items, function(n, i) {
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
					orderTotal : viewModel.orderInfo().total,
					taxes : viewModel.orderInfo().tax,
					shippingCost : viewModel.orderInfo().shipmentCost,
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
		viewModel.orderId(pageUrl.param('orderId') || documentUrl.param('orderId'));
		viewModel.orderNumber(pageUrl.param('orderNumber') || documentUrl.param('orderNumber'));
		viewModel.orderSource = pageUrl.param('source') || documentUrl.param('source');

	}).on('pageshow', function() {

		viewModel.showInfo(false);
		viewModel.showLegend(false);

		if (viewModel.orderId() == '-1') {

			var items = $.map(checkoutCart.cart.items(), function(n, i) {
				return {
					itemId : n.itemId(),
					name : n.name(),
					quantity : n.state.quantity(),
					unitPrice : n.price.presentation(),
					imageUrl : n.imageUrl(),
					saleUnit : n.saleUnit(),
					showPhoto : ko.observable(n.showPhoto())
				};
			});

			var data = {
				customerId : checkoutCart.customerId(),
				customerName : checkoutCart.customerName(),
				address : checkoutCart.shippingAddress().addressText(),
				discountCard : checkoutCart.discountCardText(),
				paymentMethod : checkoutCart.paymentTypeText(),
				shipmentCost : checkoutCart.cart.summary.shipping(),
				total : checkoutCart.cart.summary.total(),
				tax : checkoutCart.cart.summary.tax(),
				items : items
			};

			viewModel.orderInfo(data);
			viewModel.showInfo(true);
			$('#itemsList').listview('refresh');
			// viewModel.addTransactionOnGa();

		} else {

			$.mobile.loading("show", {
				text : 'Consultando orden # ' + viewModel.orderNumber(),
				textVisible : true,
				theme : 'b'
			});

			models.CustomerActions.getOrderDetail(viewModel.orderId()).done(function(response) {

				try {
					response.customerName = response.customerName.toLowerCase();
					response.address = response.address.toLowerCase();
					response.paymentMethod = response.paymentMethod.toLowerCase();
					response.discountCard = response.discountCard.toLowerCase();
				} catch (e) {
					// TODO: handle exception
				}

				$.each(response.items, function() {
					var showPhoto = this.showPhoto == undefined ? true : this.showPhoto;
					this.showPhoto = ko.observable(showPhoto);
				});

				viewModel.orderInfo(response);
				viewModel.showInfo(true);
				$('#itemsList').listview('refresh');
				// viewModel.addTransactionOnGa();
				$.mobile.loading("hide");
			}).fail(function(response) {
				console.log(response);
				try {
					if (response.msgUsr != undefined && response.msgUsr != '') {
						showMessageTextClose(response.msgUsr);
					} else {
						showMessageTextClose('Estamos teniendo inconvenientes, por favor intenta mas tarde');
					}
				} catch (e) {
					showMessageTextClose('Estamos teniendo inconvenientes, por favor intenta mas tarde');
				}
			}).always(function() {

			});

		}

	});

})(jQuery);
