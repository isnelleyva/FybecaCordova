(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]'), viewModel = {

		// cart : checkoutCart.cart,

		enableComponents : ko.observable(true),

		showAddressError : ko.observable(false),

		idType : ko.observable('C'),

		shipments : ko.observable('1'),

		addresses : customer.addresses,

		shippingAddressId : ko.observable(''),

		cities : data.cities,

		neighborhoods : data.neighborhoods,

		isAddressTypeShipping : ko.observable(true),

		shippingNeighborhood : ko.observable(''),

		toCheckoutPayment : function(form) {

			if ($(form).valid()) {

				var userData = $(form).serializeObject();

				var cityText = '';
				var neighborhoodText = '';
				var addressText = '';

				if (userData.shippingAddress == 'new') {

					$.each(data.cities(), function() {
						if (this.value == userData.cityS) {
							cityText = this.label;
							return false;
						}
					});

					$.each(data.neighborhoods(), function() {
						if (this.value == userData.neighborhoodS) {
							neighborhoodText = this.label;
							return false;
						}
					});

					addressText = userData.mainStreetS + ' ' + userData.numberS + ' y ' + userData.intersectionS + ', ' + neighborhoodText + ', ' + cityText;

					// checkoutCart.shippingAddress().addressId("-1");
					checkoutCart.shippingAddress().main = userData.mainStreetS;
					checkoutCart.shippingAddress().number = userData.numberS;
					checkoutCart.shippingAddress().intersection = userData.intersectionS;
					checkoutCart.shippingAddress().reference = userData.referenceS;
					checkoutCart.shippingAddress().cityId = userData.cityS;
					checkoutCart.shippingAddress().cityName = cityText;
					checkoutCart.shippingAddress().neighborhoodId(userData.neighborhoodS);
					checkoutCart.shippingAddress().neighborhoodName = neighborhoodText;
					try {
						checkoutCart.shippingAddress().addressText(addressText.toLowerCase());
					} catch (e) {
						checkoutCart.shippingAddress().addressText(addressText);
					}
					checkoutCart.shippingAddress().phone = userData.phoneB;

					if (checkoutCart.billingAddress().addressId() == 'shipping') {

						// checkoutCart.billingAddress().addressId("-1");
						checkoutCart.billingAddress().main = userData.mainStreetS;
						checkoutCart.billingAddress().number = userData.numberS;
						checkoutCart.billingAddress().intersection = userData.intersectionS;
						checkoutCart.billingAddress().reference = userData.referenceS;
						checkoutCart.billingAddress().cityId = userData.cityS;
						checkoutCart.billingAddress().cityName = cityText;
						checkoutCart.billingAddress().neighborhoodId = userData.neighborhoodS;
						checkoutCart.billingAddress().neighborhoodName = neighborhoodText;
						try {
							checkoutCart.billingAddress().addressText(addressText.toLowerCase());
						} catch (e) {
							checkoutCart.billingAddress().addressText(addressText);
						}

					}

				}

				if (checkoutCart.billingAddress().addressId() == 'new') {

					$.each(data.cities(), function() {
						if (this.value == userData.cityB) {
							cityText = this.label;
							return false;
						}
					});

					$.each(data.neighborhoods(), function() {
						if (this.value == userData.neighborhoodB) {
							neighborhoodText = this.label;
							return false;
						}
					});

					addressText = userData.mainStreetB + ' ' + userData.numberB + ' y ' + userData.intersectionB + ', ' + neighborhoodText + ', ' + cityText;

					// checkoutCart.billingAddress().addressId("-1");
					checkoutCart.billingAddress().main = userData.mainStreetB;
					checkoutCart.billingAddress().number = userData.numberB;
					checkoutCart.billingAddress().intersection = userData.intersectionB;
					checkoutCart.billingAddress().reference = userData.referenceB;
					checkoutCart.billingAddress().cityId = userData.cityB;
					checkoutCart.billingAddress().cityName = cityText;
					checkoutCart.billingAddress().neighborhoodId = userData.neighborhoodB;
					checkoutCart.billingAddress().neighborhoodName = neighborhoodText;
					try {
						checkoutCart.billingAddress().addressText(addressText.toLowerCase());
					} catch (e) {
						checkoutCart.billingAddress().addressText(addressText);
					}

				}

				checkoutCart.customerIdType(userData.customerIdType);
				checkoutCart.customerId(userData.customerId);
				checkoutCart.customerName(userData.customerName);

				$(':mobile-pagecontainer').pagecontainer('change', 'checkout-payment.html');

			} else {
				if (viewModel.shippingAddressId() == "") {
					viewModel.showAddressError(true);
				}
			}

		},

		checkoutCart : checkoutCart,

		closeShipmentsPopup : function() {
			$('#popupManyShipments').popup('close');
		},

	};

	viewModel.shippingAddressId.subscribe(function(shippingAddressId) {
		checkoutCart.shippingAddress().addressId(shippingAddressId);

		if (shippingAddressId != "") {
			viewModel.showAddressError(false);
		}

	});

	viewModel.idType.subscribe(function(idType) {
		checkoutCart.customerIdType(idType);
	});

	viewModel.shipments.subscribe(function(shipments) {
		checkoutCart.shipments(shipments);
	});

	viewModel.shippingNeighborhood.subscribe(function(neighborhoodId) {
		if (neighborhoodId != undefined) {
			checkoutCart.shippingAddress().neighborhoodId(neighborhoodId);
		}
	});

	viewModel.isAddressTypeShipping.subscribe(function(value) {

		if (value) {
			checkoutCart.billingAddress().addressId('shipping');
		} else {
			if (checkoutCart.shippingAddress().addressId() != 'new' && checkoutCart.shippingAddress().addressId() != '') {
				checkoutCart.billingAddress().addressId(checkoutCart.shippingAddress().addressId());
			}
			$('#billingAddressList input').checkboxradio("refresh");
			$('html,body').animate({
				scrollTop : $(document).height()
			}, 1000);
		}

	});

	$page.on('pagebeforecreate', function() {
		ko.applyBindings(viewModel, $page[0]);
		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);
	}).on('pageinit', function() {
		$page.validate();
		checkoutCart.disableFields(false);
	}).on('pageshow', function() {

		ko.mapping.fromJS(customer.items().cartItems, checkoutCart.cart.items);

		viewModel.isAddressTypeShipping(checkoutCart.billingAddress().addressId() == 'shipping');

		checkoutCart.goToSummary = false;

		if (checkoutCart.shippingAddress().addressId() == '-1') {

			if (customer.isGuest()) {

				// checkoutCart.shippingAddress().neighborhoodId(
				// customer.selectedGuestNeighborhood());
				checkoutCart.customerCode('0');
				data.state.selectedCity(customer.selectedGuestCity() + '');

				viewModel.shippingNeighborhood(customer.selectedGuestNeighborhood() + '');

				$('[name="cityS"]').selectmenu('refresh');
				$('[name="neighborhoodS"]').selectmenu('refresh');

				viewModel.shippingAddressId('new');

			} else {

				try {
					checkoutCart.customerCode(localStorage.codigoPersona);
				} catch (e) {
					console.log('err' + e);
					checkoutCart.customerCode('0');
				}

				checkoutCart.shippingAddress().addressId(customer.selectedAddress() + '');

				viewModel.shippingAddressId(customer.selectedAddress() + '');

				$.each(customer.addresses(), function() {
					if (this.addressId == customer.selectedAddress()) {
						checkoutCart.shippingAddress().neighborhoodId(this.neighborhoodId);
						return false;
					}
				});

			}
		}

		checkoutCart.onCheckout(true);

		if (customer.discountCards().length == 0) {

			$.mobile.loading('show', {
				text : 'Consultando tarjetas de descuento',
				textVisible : true,
				theme : 'b'
			});

			checkoutCart.disableFields(true);

			models.checkoutCalls.getDiscountCards({
				neighborhoodId : checkoutCart.shippingAddress().neighborhoodId()
			}).done(function(data) {
				customer.discountCards(data);

				if (customer.discountCards().length == 1 || customer.discountCards().length > 2) {

					checkoutCart.discountCard(customer.discountCards()[0].tarjeta)
					checkoutCart.discountCardText(customer.discountCards()[0].descripcion)

				} else {

					checkoutCart.discountCard(customer.discountCards()[1].tarjeta)
					checkoutCart.discountCardText(customer.discountCards()[1].descripcion)

				}

			}).fail(function(data) {
				if (data != undefined) {

					var msgCus = data.mensajecliente;
					var msgSys = data.mensajesistema;

					$.mobile.loading("hide");

					setTimeout(function() {

						var showMessage = msgCus == undefined && msgSys == undefined ? 'Estamos teniendo un problema con nuestros servicios, por favor intenta mas tarde.' : msgCus + ' ' + msgSys;

						$.mobile.loading("show", {
							text : showMessage,
							textVisible : true,
							textonly : true,
							theme : 'b'
						});
						setTimeout(function() {
							$.mobile.loading("hide");
						}, 2000);

					}, 200);
					console.log(data);
				} else {
					$.mobile.loading("hide");
					setTimeout(function() {
						$.mobile.loading("show", {
							text : 'Error, ver consola',
							textVisible : true,
							textonly : true,
							theme : 'b'
						});
						setTimeout(function() {
							$.mobile.loading("hide");
						}, 2000);
					}, 200);
				}

			}).always(function() {
				// checkoutCart.disableFields(false);
			});

		}

		setTimeout(function() {
			$('#shippingAddressList input').checkboxradio("refresh");
			$('#checkbox-mini-0').checkboxradio("refresh");
			$('#billingAddressList input').checkboxradio("refresh");
		}, 750);

		try {
			if (localStorage.tipoId == 'P') {
				viewModel.idType('P');
			} else {
				viewModel.idType('C');
			}
		} catch (e) {
			viewModel.idType('C');
		}
		$('[name="customerIdType"]').checkboxradio("refresh");

	});

})(jQuery);