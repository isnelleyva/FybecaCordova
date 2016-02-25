(function($) {
	'use strict';
	// var viewModel;

	var $page = $($('script').last()).closest('[data-role="page"]'), // Contexto
	viewModel = {
		cart : new Cart(),

		cartCount : ko.observable(0),

		vademecumLoaded : ko.observable(true),

		showVademecumSection : ko.observable(false),

		addresses : customer.addresses,

		productId : '',

		productName : '',

		vademecum : ko.observableArray([]),

		loginIdType : ko.observable('C'),

		selectedAddress : ko.observable(customer.selectedAddress() + ''),

		itemId : ko.observable(''),

		currentLocation : ko.observable(''),

		showPassword : ko.observable(false),

		vademecumToShow : ko.observable(''),

		data : data, // Addresses

		backh : function() {

			$(':mobile-pagecontainer').pagecontainer('change', 'product-detail.html?productId=' + viewModel.productId.trim() + '&productName=' + viewModel.productName, {
				reverse : true
			});

		},

		openZoom : function() {
			if (viewModel.item().psicotropic == 'R' || viewModel.item().restricted == 'N') {
				return;
			}
			$(':mobile-pagecontainer').pagecontainer('change', 'image.html?itemId=' + viewModel.itemId() + '&productName=' + viewModel.productName + '&productId=' + viewModel.productId + '&itemName=' + viewModel.item().name.toLowerCase());
		},

		goToMyCart : function() {
			$(':mobile-pagecontainer').pagecontainer('change', 'my-cart.html');
		},

		goToMap : function() {

			try {
				if (navigator.connection.type == Connection.NONE) {
					ShowMessageInternetNotAvailable();
					return;
				}
			} catch (err) {
			}

			data.urlToReturnFromMap = 'presentation-detail.html?itemId=' + viewModel.itemId() + '&productId=' + viewModel.productId + '&productName=' + viewModel.productName;
			presentation_minStock = -1;
			presentation_id = viewModel.item().itemId;
			presentation_name = viewModel.item().name;
			presentation_units = 1;
			presentation_price = viewModel.item().fybecaPrice;

			// var unitPresentation = 1;

			if (viewModel.item().saleUnit > 1) {
				presentation_units = 2;
			}

			$(':mobile-pagecontainer').pagecontainer('change', '../../presentation-near.html');
		},

		openContactUsPopup : function() {
			$('#popupContactUs').popup('open');
		},

		closeContactUsPopup : function() {
			$('#popupContactUs').popup('close');
		},

		openAddressesPopup : function() {
			$('#popupAddresses').popup('open');
		},

		closeAddressesPopup : function() {
			$('#popupAddresses').popup('close');
		},

		closePopupAddressesGuest : function() {
			$('#popupAddressGuest').popup('close');
		},

		sendContactUs : function(form) {

			var cd = $(form).serializeObject();

			if ($(form).valid()) {

				if (cd.txtName == '' || cd.txtMail == '' || cd.txtPhone == '') {
					showMessageText('Por favor llena correctamente todos los campos.');
					return false;
				}

				if (viewModel.validatePhone(cd.txtPhone)) {

					$('#popupContactUs').popup('close');

					cd.itemId = viewModel.item().itemId;
					cd.itemName = viewModel.item().name;

					$.mobile.loading("show", {
						text : 'Enviando solicitud',
						textVisible : true,
						theme : 'b'
					});

					models.CustomerActions.sendContactUsMail(cd).done(function() {

						showMessageText('Se ha enviado tu solicitud, pronto nuestro personal se pondra en contacto contigo', 5000);

					}).fail(function(message) {

						showMessageText('Hubo un problema al enviar solicitud, intentalo mas tarde por favor', 5000);

					});

				}

			}

		},

		item : ko.observable($.extend(cartSelectedItem, {
			"selectedPresentation" : ko.observable("2"),
			"quantity" : ko.observable(1)
		})),

		addQuantity : function() {
			viewModel.item().quantity(viewModel.item().quantity() == '' ? 0 : viewModel.item().quantity());
			var newVal = parseInt(viewModel.item().quantity()) + 1;
			viewModel.item().quantity(newVal > 99 ? 99 : newVal);
		},

		reduceQuantity : function() {
			var newVal = viewModel.item().quantity() - 1;
			viewModel.item().quantity(newVal < 1 ? 1 : newVal);
		},

		login : function(form) {

			if ($(form).valid()) {

				var loginData = $(form).serializeObject();

				if (!checkOnlyLettersAndNumbers(loginData.username, 'Identificación')) {
					return false;
				}

				var thisPass = loginData.password;

				if (thisPass.indexOf('&') >= 0 || thisPass.indexOf('%') >= 0 || thisPass.indexOf('=') >= 0 || thisPass.indexOf("'") >= 0) {
					showMessageTextClose('No puedes ingresar contraseñas q contengan "&", "%", " \' " o "="');
					viewModel.isProcessing(false);
					return;
				}

				models.CustomerActions.login(loginData.rdIdType, loginData.username, loginData.password).done(function(response) {

					$('#popupLogin').popup('close');

					if (response.success) {

						try {
							models.gaRequests.trackEvent('login', 'itemPage');
						} catch (e) {
						}

						viewModel.cart.add({
							item : ko.observable(viewModel.item())
						});

					} else {

						if (response.code == "1") {
							$.mobile.changePage('user-change-password.html');
						}

					}

				});
			}

		},

		openGuestPopup : function() {
			$('#popupLogin').popup('close');
			// customer.isGuest(true);
			setTimeout(function() {
				if (data.cities().length == 0) {
					$.mobile.loading('show', {
						text : 'Consultando ciudades',
						textVisible : true,
						theme : 'b'
					});
					models.DataRequests.getCities();
				}
				$('#popupAddressGuest').popup('open');
			}, 250);
		},

		loginAsGuest : function(form) {
			var guestData = $(form).serializeObject();
			if (guestData.city != '' && guestData.neighborhood != '') {
				customer.isGuest(true);
				customer.addresses([]);
				customer.discountCards([]);
				customer.paymentTypes([]);
				checkoutCart.cart.items([]);
				customer.isAuthenticated(false);
				customer.isGuest(true);
				customer.selectedGuestCity(guestData.city);
				customer.selectedGuestNeighborhood(guestData.neighborhood);
				viewModel.closeAddresGuestPopup();
				viewModel.cart.add({
					item : ko.observable(viewModel.item())
				});
			} else {
				showMessage("Selecciona tu barrio y tu ciudad", null, "Mensaje");
			}
		},

		closeAddresGuestPopup : function() {
			$('#popupAddressGuest').popup('close');
		},

		loadVademecum : function() {
			if (viewModel.item().bussinessType == 'N' || viewModel.item().psicotropic == 'R' || viewModel.item().restricted == 'S') {
				viewModel.vademecumLoaded(true);
				viewModel.showVademecumSection(false);
			} else {

				models.products.getItemVademecum(viewModel.itemId).done(function(data) {
					viewModel.vademecum(data);
					// $page.find('#collVad').trigger('create')

					if (data.length > 0) {
						viewModel.showVademecumSection(true);
					}

					$('#collVad li:first-child a').click()

					$('#collVad').listview('refresh');
				}).fail(function(message) {
					console.log(message);
				}).always(function() {
					viewModel.vademecumLoaded(true);
				});

			}

		},

		showVademecumInfo : function(data, event) {

			$('.vademecumTab').removeClass('vademecumTabActive');
			$(event.target).toggleClass('vademecumTabActive');

			var thisVademecum = this.label;
			$.each(viewModel.vademecum(), function() {
				if (thisVademecum == this.label) {
					viewModel.vademecumToShow(this.value);
					return;
				}
			});
		},

		checkQuantityLimit : function(e) {

		},

		closePopupBtn : function() {
			$(event.target).parent().parent().popup('close');
		},

		validatePhone : function(phone) {

			if (phone.length < 9 || phone.length > 10) {
				showMessageText('El teléfono debe contener por lo menos 9 o 10 números, verifica que tu número incluya el prefijo correspondiente, ej 02');
				return false;
			}
			var regExp = /^[0-9]{1}[2-7]{1}[2-7]{1}[0-9]+$/;
			if (regExp.test(phone)) {

				if (!/000000/.test(phone) && !/111111/.test(phone) && !/222222222/.test(phone) && !/3333333/.test(phone) && !/444444/.test(phone) && !/5555555/.test(phone) && !/666666/.test(phone) && !/7777777/.test(phone) && !/888888/.test(phone) && !/999999/.test(phone)) {

					return true;

				} else {
					showMessageText('El teléfono fijo no puede tener demasiados números repetidos');
					return false;
				}

			}

			regExp = /^(09)[3|5|6|7|8|9]{1}[0-9]+$/;

			if (regExp.test(phone)) {

				if (!/000000/.test(phone) && !/111111/.test(phone) && !/222222222/.test(phone) && !/3333333/.test(phone) && !/444444/.test(phone) && !/5555555/.test(phone) && !/666666/.test(phone) && !/7777777/.test(phone) && !/888888/.test(phone) && !/999999/.test(phone)) {

					return true;

				} else {

					showMessageText("El teléfono celular no puede tener demasiados caracteres repetidos", null, "Mensaje");
					return false;

				}
			}
			showMessageText('El teléfono ingresado no es válido, recuerda que si este es fijo debe añadir el código de provincia "02", y si es celular este debe iniciar con "09"');
			return false;

		}

	};

	viewModel.selectedAddress.subscribe(function(address) {
		customer.selectedAddress(parseInt(address));
		$('#popupAddresses').popup('close');

		$.each(customer.addresses(), function() {
			if (address == this.addressId + '') {
				$.mobile.loading("show", {
					text : 'Se ha seleccionado el barrio ' + this.neighborhoodName + ' en ' + this.cityName,
					textVisible : true,
					textonly : true,
					theme : 'b'
				});
			}
		});

		setTimeout(function() {
			$.mobile.loading('hide');
		}, 3000);
	});

	$page.on('pagebeforecreate', function() {

		viewModel.cartCount(customer.items().cartItems.length);

		ko.applyBindings(viewModel, $page[0]);

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);
		viewModel.itemId(pageUrl.param('itemId') || documentUrl.param('itemId'));
		viewModel.productName = pageUrl.param('productName') || documentUrl.param('productName');
		viewModel.productId = pageUrl.param('productId') || documentUrl.param('productId');

	}).on('pageshow', function() {

		viewModel.vademecumLoaded(false);

		$('body').on('click', '[data-action]', function() {
			var action = $(this).data('action');
			if (action == 'contact-us') {
				$.mobile.loading('hide');
				viewModel.openContactUsPopup();
			}
		});

		$('[data-role="collapsible-set"]').trigger("create");

		$.each(customer.addresses(), function() {
			if (this.addressId == customer.selectedAddress()) {
				viewModel.currentLocation(this.neigborhoodName + ", " + this.cityName);
				return false;
			}
		});

		viewModel.loadVademecum();

		ko.mapping.fromJS(customer.items().cartItems, viewModel.cart.items);

		$("#popupLogin, #popupAddressGuest, #popupContactUs, #popupAddresses").bind({
			popupafteropen : function(event, ui) {
				$page.find('.ui-content').css('opacity', '0.3');
			},
			popupafterclose : function(event, ui) {
				$page.find('.ui-content').css('opacity', '1');
			}
		});

	});

})(jQuery);

function checkQuantityLimit(e) {
	if (e.keyCode > 47 && e.keyCode < 58) {
		try {
			var currQuantity = $('#quantity').val() + String.fromCharCode(e.keyCode);
			currQuantity = parseInt(currQuantity);
			if (currQuantity > 0 && currQuantity < 100) {
				return true;
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}