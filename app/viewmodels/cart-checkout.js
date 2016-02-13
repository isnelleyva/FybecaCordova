(function($) {

	window.state = {
		selectedItem : ko.observable()
	};

	window.checkoutCart = {

		itemsWithNoStock : ko.observableArray([]),

		disableFields : ko.observable(false),

		checkoutStep : ko.observable(1), // 1 userData, 2 shipping, 3 payment

		isShipmentsElegible : ko.observable(false),
		hasOneShipmentElement : ko.observable(false),

		goToSummary : false,

		cart : new Cart(),

		onCheckout : ko.observable(false),
		disableCalls : ko.observable(false),

		servicePaymentMethodsResponded : ko.observable(false),
		servicePricesResponded : ko.observable(false),

		customerName : ko.observable(''),
		customerCode : ko.observable(localStorage.codigoPersona == undefined ? '' : localStorage.codigoPersona),
		customerId : ko.observable(''),
		customerEmail : localStorage.emailPersona == undefined ? '' : localStorage.emailPersona,
		customerIdType : ko.observable(''),

		pharmacyMain : '',
		pharmacyAux : '',
		pharmacyF : '',
		pharmacyC : '',

		contactId : '',
		contactType : '',
		contactValue : '',

		shippingAddress : ko.observable({
			addressType : '',
			addressId : ko.observable('-1'),
			addressText : ko.observable(''),
			addressType : '',
			main : '',
			number : '',
			intersection : '',
			reference : '',
			cityId : '',
			cityName : '',
			neighborhoodId : ko.observable(""),
			neighborhoodName : '',
			phone : '',
		}),

		billingAddress : ko.observable({
			addressType : ko.observable("shipping"),
			addressId : ko.observable("shipping"),
			addressText : ko.observable(""),
			main : "",
			number : "",
			intersection : "",
			reference : "",
			cityId : "",
			cityName : "",
			neighborhoodId : "",
			neighborhoodName : "",
		}),

		shipments : ko.observable('1'),

		discountCard : ko.observable('0'),
		discountCardText : ko.observable(""),

		paymentTypeId : '',
		paymentType : ko.observable(''),
		paymentTypeText : ko.observable(""),

		creditCardType : "",
		creditCardOwner : "",
		creditCardNumber : "",
		creditCardMonth : "",
		creditCardMonthText : "",
		creditCardYear : "",
		creditCardCcv : "",
		pfizerCard : "",

		creditTypeId : '',
		credittypeText : '',

		orderNumber : '',
		orderId : '',
		messageToCustomer : '',

		fromCartToSaved : function(item) {
			console.log('CART');
		},

		callServicePrices : function() {

			$.mobile.loading("show", {
				text : 'Consultando precios y stock',
				textVisible : true,
				theme : 'b'
			});

			checkoutCart.disableFields(true);

			var encriptedCC = document.getElementById('encryptPage').contentWindow.encrypt(checkoutCart.creditCardNumber);
			console.log('X-X-X CreditCard: ' + encriptedCC);
			// encriptedCC = checkoutCart.creditCardNumber;

			models.checkoutCalls.getPrices({
				neighborhoodId : checkoutCart.shippingAddress().neighborhoodId(),
				creditCardType : checkoutCart.paymentTypeId,
				creditCard : encriptedCC,
				discountCard : checkoutCart.discountCard(),
				creditType : (checkoutCart.creditTypeId == undefined) ? '' : checkoutCart.creditTypeId,
				items : checkoutCart.cart.items()
			}).done(function(data) {

				ko.mapping.fromJS(data, checkoutCart.cart.items);

				$.each(customer.items().cartItems, function() {
					var thisItem = this;
					$.each(checkoutCart.cart.items(), function() {
						this.showPhoto = ko.observable(true);
						if (this.itemId() == thisItem.itemId) {
							this.showPhoto = ko.observable(thisItem.showPhoto);
						}
					});
				});

				if (checkoutCart.isShipmentsElegible() && checkoutCart.hasOneShipmentElement()) {
					$('#popupManyShipments').popup('open');
				} else {
					if (checkoutCart.goToSummary) {
						$(':mobile-pagecontainer').pagecontainer('change', 'checkout-summary.html');
					}
				}

				checkoutCart.servicePricesResponded(true);

			}).fail(function(data) {

				try {
					var errorItems = data.detallesprecio.detalleprecio;
					var hasNoStockItems = false;
					var noStockItems = [];

					$.each(errorItems, function() {
						if (this.detallesStock != '') {
							if (this.detallesStock.detalleStock[0].activarventa == 'N') {
								var thisItem = this;

								$.each(checkoutCart.cart.items(), function() {
									if (this.itemId() == thisItem.item) {
										noStockItems.push({
											itemId : ko.observable(thisItem.item),
											name : this.name(),
											imageUrl : this.imageUrl()
										});
									}
								});

								hasNoStockItems = true;

							}
						}
					});

					if (hasNoStockItems) {
						$.mobile.loading("hide")
						checkoutCart.itemsWithNoStock(noStockItems);
						$('#popupDeleteItems').popup('open');
						return;
					}

				} catch (e) {
					console.log(e);
				}

				checkoutCart.servicePricesResponded(false);

				var errorMsg = 'Estamos teniendo inconvenientes, por favor vuelte a intentarlo más tarde.';
				try {
					errorMsg = data.mensajecliente == undefined || data.mensajecliente == '' ? errorMsg : data.mensajecliente;
				} catch (e) {
				}

				showMessageTextClose(errorMsg);

				try {
					console.log(JSON.stringify(data));
				} catch (e) {
					console.log(data);
				}

			}).always(function() {
				checkoutCart.disableFields(false);
				if (checkoutCart.servicePricesResponded()) {
					$.mobile.loading("hide");
				}

			});

		},

		callServicePaymentTypes : function() {

			$.mobile.loading("show", {
				text : 'Consultando formas de pago',
				textVisible : true,
				theme : 'b'
			});

			models.checkoutCalls.getPaymentTypes({
				neighborhoodId : checkoutCart.shippingAddress().neighborhoodId(),
				discountCard : checkoutCart.discountCard()
			}).done(function(data) {

				customer.paymentTypes(data);

				if (data[0].tarjeta == '') {
					checkoutCart.paymentTypeId = 'E';
					checkoutCart.paymentType('');
					checkoutCart.paymentTypeText('Efectivo');
				} else if (data[0].tarjeta != '0000000') {
					checkoutCart.paymentTypeId = 'F';
					checkoutCart.paymentType(data[0].tarjeta);
					checkoutCart.paymentTypeText('Tarjeta de crédito');
				} else {
					checkoutCart.paymentTypeId = 'T';
					checkoutCart.paymentType(data[0].tarjeta);
					checkoutCart.paymentTypeText('Tarjeta empresarial');
				}

				// if (checkoutCart.creditCardNumber != '') {
				// checkoutCart.callServicePrices();
				// } else {
				$.mobile.loading("hide");
				// }
				checkoutCart.servicePaymentMethodsResponded(true);
				$('#rdsPaymentMethods').trigger("create");

			}).fail(function(data) {

				checkoutCart.servicePaymentMethodsResponded(false);

				var errorMsg = 'Estamos teniendo inconvenientes, por favor vuelte a intentarlo más tarde.';
				try {
					errorMsg = data.mensajecliente == undefined || data.mensajecliente == '' ? errorMsg : data.mensajecliente;
				} catch (e) {
				}

				showMessageTextClose(errorMsg);

				try {
					console.log(JSON.stringify(data));
				} catch (e) {
					console.log(data);
				}

			}).always(function() {
				checkoutCart.disableFields(false);
			});

		},

		callServiceCreditTypes : function() {

			$.mobile.loading("show", {
				text : 'Consultando tipos de crédito',
				textVisible : true,
				theme : 'b'
			});

			$('.ui-btn.selectButton').addClass('ui-disabled');

			var encriptedCC = document.getElementById('encryptPage').contentWindow.encrypt(checkoutCart.creditCardNumber);
			console.log('X-X-X CreditCard: ' + encriptedCC);

			models.checkoutCalls.getCreditTypes({
				neighborhoodId : checkoutCart.shippingAddress().neighborhoodId(),
				creditCardType : checkoutCart.creditCardType,
				creditCard : encriptedCC
			}).done(function(data) {
				customer.creditTypes(data);
				$.mobile.loading("hide");

				try {
					$('[name="creditType"], [name="creditTypeE"]').selectmenu("refresh", true);
					$('.ui-btn.selectButton').removeClass('ui-disabled');
				} catch (e) {
					console.log(e.message);
				}

			}).fail(function(data) {

				var errorMsg = 'Estamos teniendo inconvenientes, por favor vuelte a intentarlo más tarde.';
				try {
					errorMsg = data.mensajecliente == undefined || data.mensajecliente == '' ? errorMsg : data.mensajecliente;
				} catch (e) {
				}

				showMessageTextClose(errorMsg);

				try {
					console.log(JSON.stringify(data));
				} catch (e) {
					console.log(data);
				}

			});

		},

		callServicePayment : function() {

			$.mobile.loading("show", {
				text : 'Pagando, este proceso puede tomar unos minutos',
				textVisible : true,
				theme : 'b'
			});

			data.isProccesingCheckout = true;

			checkoutCart.disableFields(true);

			models.checkoutCalls.makePayment().done(function(data) {
				$.mobile.loading("show", {
					text : 'Finalizando pago',
					textVisible : true,
					theme : 'b'
				});

				checkoutCart.orderNumber = data.reciboimpresion;
				checkoutCart.messageToCustomer = data.mensajecliente;

				setTimeout(function() {

					$.mobile.loading("show", {
						text : 'Finalizando pago',
						textVisible : true,
						theme : 'b'
					});

					models.checkoutCalls.finalicePayment().done(function(data) {
						data.isProccesingCheckout = false;
						customer.items().cartItems = [];

						if (checkoutCart.orderId == '-1') {
							$(':mobile-pagecontainer').pagecontainer('change', 'order-detail.html?orderId=' + checkoutCart.orderId + '&orderNumber=' + checkoutCart.orderNumber);
						} else {
							$(':mobile-pagecontainer').pagecontainer('change', 'checkout-confirm.html?orderId=' + checkoutCart.orderId + '&orderNumber=' + checkoutCart.orderNumber);
						}
					}).fail(function(data) {
						data.isProccesingCheckout = false;
						var errorMsg = 'Estamos teniendo inconvenientes, por favor vuelte a intentarlo más tarde.';
						try {
							errorMsg = data.mensajecliente == undefined || data.mensajecliente == '' ? errorMsg : data.mensajecliente;
						} catch (e) {
						}

						$.mobile.loading("show", {
							text : errorMsg,
							textVisible : true,
							textonly : true,
							theme : 'b'
						});
						setTimeout(function() {
							$.mobile.loading("hide");
						}, 4000);

						console.log(data);

					}).always(function() {
						data.isProccesingCheckout = false;
						checkoutCart.disableFields(false);
					});

				}, 3000);

			}).fail(function(data) {

				data.isProccesingCheckout = false;
				var errorMsg = 'Estamos teniendo inconvenientes, por favor vuelte a intentarlo más tarde.';
				try {
					errorMsg = data.mensajecliente == undefined || data.mensajecliente == '' ? errorMsg : data.mensajecliente;
				} catch (e) {
				}

				showMessageTextClose(errorMsg);

				try {
					console.log(JSON.stringify(data));
				} catch (e) {
					console.log(data);
				}
				checkoutCart.disableFields(false);
			}).always(function() {
				data.isProccesingCheckout = false;
			});

		}

	};

	checkoutCart.shippingAddress().neighborhoodId.subscribe(function(neighborhoodId) {
		if (checkoutCart.shippingAddress().addressId() == 'new' && neighborhoodId != '') {
			// viewModel.disableFields(true);
			// checkoutCart.callServicePrices();
		}

	});

	checkoutCart.shippingAddress().addressId.subscribe(function(addressId) {

		if (!checkoutCart.disableCalls()) {

			if (addressId != 'new') {
				$.each(customer.addresses(), function() {
					if (this.addressId == addressId) {
						checkoutCart.shippingAddress().addressType = this.addressType;
						checkoutCart.shippingAddress().cityId = this.cityId;
						checkoutCart.shippingAddress().cityName = this.cityName;
						checkoutCart.shippingAddress().intersection = this.intersection;
						checkoutCart.shippingAddress().main = this.main;
						checkoutCart.shippingAddress().neighborhoodId(this.neighborhoodId);
						checkoutCart.shippingAddress().neighborhoodName = this.neighborhoodName;
						checkoutCart.shippingAddress().number = this.number;
						checkoutCart.shippingAddress().reference = this.reference;
						checkoutCart.shippingAddress().addressText(this.main + ' ' + this.number + ' y ' + this.intersection + ', ' + this.neighborhoodName + ', ' + this.cityName);

						try {
							checkoutCart.shippingAddress().addressText(checkoutCart.shippingAddress().addressText().toLowerCase());
						} catch (e) {
							// TODO: handle exception
						}

						checkoutCart.shippingAddress().phone = this.contactValue;

						checkoutCart.contactId = this.contactId;
						checkoutCart.contactType = this.contactType;
						checkoutCart.contactValue = this.contactValue;

						checkoutCart.billingAddress().cityId = checkoutCart.shippingAddress().cityId;
						checkoutCart.billingAddress().cityName = checkoutCart.shippingAddress().cityName;
						checkoutCart.billingAddress().intersection = checkoutCart.shippingAddress().intersection;
						checkoutCart.billingAddress().main = checkoutCart.shippingAddress().main;
						checkoutCart.billingAddress().neighborhoodId = checkoutCart.shippingAddress().neighborhoodId();
						checkoutCart.billingAddress().neighborhoodName = checkoutCart.shippingAddress().neighborhoodName;
						checkoutCart.billingAddress().number = checkoutCart.shippingAddress().number;
						checkoutCart.billingAddress().reference = checkoutCart.shippingAddress().reference;
						checkoutCart.billingAddress().addressText(checkoutCart.shippingAddress().addressText());

						return false;
					}
				});
			} else {
				checkoutCart.shippingAddress().cityId = '';
				checkoutCart.shippingAddress().cityName = '';
				checkoutCart.shippingAddress().intersection = '';
				checkoutCart.shippingAddress().main = '';
				if (!customer.isGuest()) {
					checkoutCart.shippingAddress().neighborhoodId('');
				}
				checkoutCart.shippingAddress().neighborhoodName = '';
				checkoutCart.shippingAddress().number = '';
				checkoutCart.shippingAddress().reference = '';
				checkoutCart.shippingAddress().addressText('');

			}

			if (addressId != "-1" && checkoutCart.onCheckout() && addressId != 'new') {
				// checkoutCart.disableFields(true);
				// checkoutCart.callServicePrices();
			}

		}

	});

	checkoutCart.billingAddress().addressId.subscribe(function(addressId) {

		if (addressId == 'shipping') {

			checkoutCart.billingAddress().cityId = checkoutCart.shippingAddress().cityId;
			checkoutCart.billingAddress().cityName = checkoutCart.shippingAddress().cityName;
			checkoutCart.billingAddress().intersection = checkoutCart.shippingAddress().intersection;
			checkoutCart.billingAddress().main = checkoutCart.shippingAddress().main;
			checkoutCart.billingAddress().neighborhoodId = checkoutCart.shippingAddress().neighborhoodId();
			checkoutCart.billingAddress().neighborhoodName = checkoutCart.shippingAddress().neighborhoodName;
			checkoutCart.billingAddress().number = checkoutCart.shippingAddress().number;
			checkoutCart.billingAddress().reference = checkoutCart.shippingAddress().reference;
			checkoutCart.billingAddress().addressText(checkoutCart.shippingAddress().addressText());

			try {
				checkoutCart.billingAddress().addressText(checkoutCart.billingAddress().addressText().toLowerCase());
			} catch (e) {
				// TODO: handle exception
			}

		} else if (addressId != 'new' && addressId != 'shipping') {
			$.each(customer.addresses(), function() {
				if (this.addressId == addressId) {
					checkoutCart.billingAddress().cityId = this.cityId;
					checkoutCart.billingAddress().cityName = this.cityName;
					checkoutCart.billingAddress().intersection = this.intersection;
					checkoutCart.billingAddress().main = this.main;
					checkoutCart.billingAddress().neighborhoodId = this.neighborhoodId;
					checkoutCart.billingAddress().neighborhoodName = this.neighborhoodName;
					checkoutCart.billingAddress().number = this.number;
					checkoutCart.billingAddress().reference = this.reference;
					checkoutCart.billingAddress().addressText(this.main + ' ' + this.number + ' y ' + this.intersection + ', ' + this.neighborhoodName + ', ' + this.cityName);

					try {
						checkoutCart.billingAddress().addressText(checkoutCart.billingAddress().addressText().toLowerCase());
					} catch (e) {
					}

					return false;
				}
			});
		} else if (addressId = !'-1') {
			checkoutCart.shippingAddress().cityId = '';
			checkoutCart.shippingAddress().cityName = '';
			checkoutCart.shippingAddress().intersection = '';
			checkoutCart.shippingAddress().main = '';
			checkoutCart.shippingAddress().neighborhoodId('');
			checkoutCart.shippingAddress().neighborhoodName = '';
			checkoutCart.shippingAddress().number = '';
			checkoutCart.shippingAddress().reference = '';
			checkoutCart.shippingAddress().addressText('');
		}
	});

	checkoutCart.discountCard.subscribe(function(discountCard) {

		checkoutCart.servicePaymentMethodsResponded(false);
		checkoutCart.servicePricesResponded(false);
		checkoutCart.paymentType('');
		customer.paymentTypes([]);

		var neighborhoodId = "-1";

		$.each(customer.addresses(), function() {
			if (this.addressId == checkoutCart.shippingAddress().addressId()) {
				checkoutCart.shippingAddress().neighborhoodId(this.neighborhoodId);
				return false;
			}
		});

		$.each(customer.discountCards(), function() {
			if (this.tarjeta == discountCard) {
				checkoutCart.discountCardText(this.descripcion);
				return false;
			}
		});

		checkoutCart.callServicePaymentTypes();

		// checkoutCart.callServicePrices();

	});

	checkoutCart.paymentType.subscribe(function(paymentType) {
		customer.creditTypes([]);
		checkoutCart.creditCardNumber = '';
		$('input[name="cardNumber"]').val('');

		if (paymentType != '0000000' && paymentType != '') {

			$.each(customer.paymentTypes(), function() {
				if (this.tarjeta == paymentType) {
					checkoutCart.paymentTypeText(this.descripcion);
					return false;
				}
			});

			checkoutCart.paymentTypeText('Tarjeta empresarial');
			checkoutCart.paymentTypeId = 'F';
			checkoutCart.creditCardType = checkoutCart.paymentTypeId;
			checkoutCart.creditCardNumber = paymentType;
			// checkoutCart.callServicePrices();
			checkoutCart.callServiceCreditTypes();

		} else {
			if (paymentType == '0000000') {
				checkoutCart.paymentTypeText('Tarjeta de crédito');
				checkoutCart.paymentTypeId = 'T';
			} else {
				checkoutCart.paymentTypeText('Eféctivo');
				checkoutCart.paymentTypeId = 'E';
				checkoutCart.creditCardNumber = '';
			}

		}

	});

})(jQuery);