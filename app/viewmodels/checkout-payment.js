(function($) {
	'use strict';
	// var viewModel;

	var $page = $($('script').last()).closest('[data-role="page"]'), viewModel = {

		shipments : ko.observable('1'),

		discountCard : ko.observable(checkoutCart.discountCard() + ''),

		creditCardNumber : ko.observable(checkoutCart.creditCardNumber),

		buttonTextMonth : ko.observable('Mes'),

		buttonTextCreditType : ko.observable('Selecciona un tipo de crédito'),

		months : ko.observableArray(data.months),

		creditTypes : ko.observableArray([]),

		selectMonth : function() {
			viewModel.buttonTextMonth(this.label);
			checkoutCart.creditCardMonth = this.value;
			$('#popupMonths').popup('close');
			$('[href="#popupMonths"]').css('color', '#333')
		},

		selectOnChangeMonth : function(data, event) {
			viewModel.buttonTextMonth(event.target.options[event.target.selectedIndex].text);
		},

		selectOnChangeCreditType : function(data, event) {
			viewModel.buttonTextCreditType(event.target.options[event.target.selectedIndex].text);
		},

		toCheckoutSummary : function(form) {

			if ($(form).valid()) {

				if (checkoutCart.paymentTypeId != 'E' && (checkoutCart.creditTypeId == undefined || checkoutCart.creditTypeId == '')) {
					showMessageText('Selecciona un tipo de crédito', 5000);
					return;
				}

				if (checkoutCart.paymentTypeId == 'T' && (checkoutCart.creditCardMonth == undefined || checkoutCart.creditCardMonth == '')) {
					showMessageText('Selecciona el mes en el que expira tu tarjeta', 5000);
					return;
				}

				var months = [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ];

				checkoutCart.creditCardMonthText = months[parseInt(checkoutCart.creditCardMonth) - 1];

				checkoutCart.goToSummary = true;
				checkoutCart.callServicePrices();

			}

		},

		closeShipmentsPopup : function() {
			$('#popupManyShipments').popup('close');
			setTimeout(function() {
				$(':mobile-pagecontainer').pagecontainer('change', 'checkout-summary.html');
			}, 500);
		},

		closeDeleteItemsPopup : function() {
			$('#popupDeleteItems').popup('close');
		},

		checkoutCart : checkoutCart,

		discountCards : ko.observableArray(customer.discountCards()),

		paymentTypes : ko.observableArray(customer.paymentTypes()),

		getCreditTypesByCardNumber : function() {
			if (viewModel.creditCardNumber() != '') {
				if ($('[name="cardNumber"]').valid()) {

					checkoutCart.creditCardType = 'T';
					// checkoutCart.callServicePrices();
					checkoutCart.creditCardNumber = viewModel.creditCardNumber();
					checkoutCart.callServiceCreditTypes();

				}

			}

		},

		saveItem : function() {
			$.mobile.loading("show", {
				text : 'Guardando',
				textVisible : true,
				theme : 'b'
			});

			models.cart.toSaved(this).done(function(data) {
				$.mobile.loading("hide");

				$.each(checkoutCart.cart.items(), function() {
					if (data.itemId == this.itemId()) {
						checkoutCart.cart.items.remove(this);
						return;
					}
				});

				$.each(checkoutCart.itemsWithNoStock(), function() {
					if (data.itemId == this.itemId()) {
						checkoutCart.itemsWithNoStock.remove(this);
						return;
					}
				});

				if (checkoutCart.cart.items().length == 0) {
					$(':mobile-pagecontainer').pagecontainer('change', 'my-cart.html?ret=y');
				}

			}).fail(function(data) {
				$.mobile.loading("hide");
				console.log(data);
			});
		},

		deleteItem : function() {

			var thisItemDelete = this;

			$.mobile.loading("show", {
				text : 'Eliminando',
				textVisible : true,
				theme : 'b'
			});

			models.cart.remove(this).done(function(data) {

				$.mobile.loading("hide");

				$.each(checkoutCart.cart.items(), function() {
					try {
						if (thisItemDelete.itemId() == this.itemId()) {
							checkoutCart.cart.items.remove(this);
							return;
						}
					} catch (e) {
						console.log('err ' + e.getMessage + ' ' + this);
					}
				});

				$.each(checkoutCart.itemsWithNoStock(), function() {
					try {
						if (thisItemDelete.itemId() == this.itemId()) {
							checkoutCart.itemsWithNoStock.remove(this);
							return;
						}
					} catch (e) {
						console.log('err ' + e.getMessage + ' ' + this);
					}
				});

				if (checkoutCart.cart.items().length == 0) {
					$(':mobile-pagecontainer').pagecontainer('change', 'my-cart.html?ret=y');
				}

				$.mobile.loading('hide');

			}).fail(function(error) {
				console.log(error);
				$.mobile.loading('hide');
			});

		},

	};

	// viewModel.creditCardNumber.subscribe(function(creditCardNumber) {
	// debugger;
	// checkoutCart.creditCardNumber = viewModel.creditCardNumber();
	// });

	viewModel.discountCard.subscribe(function(discountCard) {
		checkoutCart.creditCardNumber = '';
		customer.creditTypes([]);
		checkoutCart.discountCard(discountCard);
	});

	viewModel.shipments.subscribe(function(shipments) {
		checkoutCart.shipments(shipments);
	});

	$page.on('pagebeforecreate', function() {

		checkoutCart.creditTypeId = '';

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

	}).on('pageinit', function() {
		$page.validate();
		checkoutCart.disableFields(false);
	}).on('pageshow', function() {

		$('#listCart').listview('refresh');
		$('#rdsDiscountCards input').checkboxradio('refresh');
		$('[name="cardNumber"]').rules("add", {
			creditcard : true,
			messages : {
				creditcard : 'Por favor ingresa un número de tarjeta válido'
			}
		});

	});

})(jQuery);

function openSelect(component) {
	$(component).next().find('select').selectmenu("open");
}