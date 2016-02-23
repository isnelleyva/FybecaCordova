//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#index');

	var viewModel = {
		cartCount : ko.observable(0),

		showFeature : ko.observable(false),

//		imgTestShowed : ko.observable('1'),

		closeFeature : function() {
			$('.homeOverlay').css('opacity', '0');
			setTimeout(function() {
				$('.homeOverlay').css('display', 'none');
				$('#menuCart').css('border-color', '#fff');
				// $('.featureBubble, .newRibbon').css('display', 'none');
			}, 1000);
		},

		gotoMyAccount : function() {

			if (isAuth()) {
				data.urlToReturnFromClubs = 'index.html#menu-vitalcard';
				setTimeout(function() {
					$(':mobile-pagecontainer').pagecontainer('change', '#menu-mifybeca');
				}, 300);
			} else {
				setTimeout(function() {
					$(':mobile-pagecontainer').pagecontainer('change', 'user-login.html');
				}, 300);
			}

		},

//		gotoCart : function() {
//			setTimeout(function() {
//				viewModel.imgTestShowed(viewModel.imgTestShowed() == '1' ? '2' : '1');
//			}, 500);
//			$(':mobile-pagecontainer').pagecontainer('change', 'app/views/search-products.html');
//		}

	};

	$page.on('pageinit', function() {

		cordova.plugins.notification.local.on("click", function (notification, state) {
			var time = notification.at * 1000;
			var time_at = (new Date().getTime()/10000|0) * 10000;
			var data = jQuery.parseJSON(notification.data);
			$(':mobile-pagecontainer').pagecontainer('change', 'reminder-view.html?id='+data.id+'&time='+time, {
				changeHash : false
			});
		}, this);

		/*cordova.plugins.notification.local.on("trigger", function(notification) {
            console.log("XXXXXX -- Trigger");
            console.log("XXXXXXXX-da: "+JSON.stringify(notification));
        });*/

		FastClick.attach(document.body);

		ko.applyBindings(viewModel, $page[0]);

		try {

			$('#vitalcardFiltersMap').find('#regresar').on('click', function() {
				$(':mobile-pagecontainer').pagecontainer('change', 'vitalcard-map.html', {
					changeHash : false
				});
			});
			$('#vitalcardFiltersSearch').find('#regresar').on('click', function() {
				$(':mobile-pagecontainer').pagecontainer('change', 'vitalcard-search.html', {
					changeHash : false
				});
			});
			//
			$('#cityFilters').find('#regresar').on('click', function() {
				$(':mobile-pagecontainer').pagecontainer('change', pageToReturn, {
					changeHash : false
				});
			});

			$('#menu-offers').find('#explore-promotions-1').on('click', function(e) {

				e.preventDefault();
				codeLastPromPer = -1;
				loadPromotionsPer = true;

				codeLastProm = -1;
				loadPromotionsGen = true;

				if (isAuth()) {
					$(':mobile-pagecontainer').pagecontainer('change', "explore-my-promotions.html");
				} else {
					$(':mobile-pagecontainer').pagecontainer('change', "explore-promotions.html");
				}

			});

			$('#menu-mifybeca').find('#logout').on('click', function() {
				logout();
				showMessage('Gracias por usar nuestra aplicación móvil', null, 'Fybeca');
				customer.isAuthenticated(false);
				customer.isGuest(false);
				customer.addresses([]);

				customer.id('');
				customer.name('');
				customer.email('');
				customer.code('');

				try {
					checkoutCart.customerName('');
					checkoutCart.customerEmail = '';
					checkoutCart.customerCode('');
					checkoutCart.customerId('');
					checkoutCart.customerIdType('');
				} catch (e) {
					// TODO: handle exception
				}

				try {
					customer.discountCards([]);
				} catch (e) {
				}
				customer.items().cartItems = [];
				customer.items().savedItems = [];

				try {
					models.CustomerActions.facebookLogout();
				} catch (e) {
				}

				$(':mobile-pagecontainer').pagecontainer('change', 'index.html', {});
			});

			$('#menu-offers').find('#btnClubes').on('click', function(e) {
				e.preventDefault();
				if (!isAuth()) {
					$(':mobile-pagecontainer').pagecontainer('change', 'medication-clubs.html');
				} else {
					$(':mobile-pagecontainer').pagecontainer('change', 'explore-my-benefits.html');
				}
			});

			$('#menu-vitalcard').find('#btnClubes').on('click', function(e) {
				e.preventDefault();
				if (!isAuth()) {
					$(':mobile-pagecontainer').pagecontainer('change', 'medication-clubs.html');
				} else {
					$(':mobile-pagecontainer').pagecontainer('change', 'explore-my-benefits.html');
				}
			});

			$('#doctor').find('[data-action]:not(form)').on('tap', function(e) {
				try {
					e.preventDefault();
					switch ($(this).data('action')) {
					case 'search-contact':
						$(':mobile-pagecontainer').pagecontainer('change', 'search-contact.html', {
							changeHash : false
						});
						break;
					}
				} catch (err) {
					console.log(err.message);
					console.log(err.stack);
				}
			});

			$('form').on('submit', function(e) {
				try {
					e.preventDefault();
					$form = $page.find('#reminder');
					switch ($(this).data('action')) {
					case 'calc-end':
						if ($(this).valid()) {
							$.publish('çalc-end', $(this));
						} else {
							var destination = $('.error:visible:first').offset().top;
							$("html:not(:animated),body:not(:animated)").animate({
								scrollTop : destination - 2
							}, 500);
						}
						break;
					case 'select-repeat':
						$.publish("select-repeat", $(this));
						break;
					case 'select-end-date-type':
						if ($(this).find('[name="end-date-type"]:checked').val()) {
							$.publish('select-end-date-type', $(this).find('[name="end-date-type"]:checked').val());
						} else {
							showMessage('Favor seleccione una de las opciones disponibles.');
						}
						break;
					case 'categsel':
						selectedCategory = $(this).data("categ");
						$.publish("categsel", $(this));
						break;
					case 'set-buy-reminder':
						if ($(this).valid()) {
							var buyReminder = {
								buy_available : $(this).find('[name="buy_available"]').val(),
								buy_reminder_days : $(this).find('[name="buy_reminder_days"]').val()
							};
							$.publish('set-buy-reminder', buyReminder);
						} else {
							var destination = $('.error:visible:first').offset().top;
							$("html:not(:animated),body:not(:animated)").animate({
								scrollTop : destination - 2
							}, 500);
						}
						break;
					case 'set-doctor':
						var doctor = {
							doctor_name : $(this).find('[name="doctor_name"]').val(),
							doctor_phone : $(this).find('[name="doctor_phone"]').val()
						};
						$.publish('set-doctor', doctor);
						break;
					case 'set-nombres':
						var nombres = {
							primerNombre : $(this).find('[name="primerNombre"]').val().trim(),
							segundoNombre : $(this).find('[name="segundoNombre"]').val().trim()
						};
						if (nombres.primerNombre.trim() != '' && nombres.segundoNombre != '') {
							$.publish('set-nombres', nombres);
						} else {
							showMessage('Ingrese correctamente sus dos nombres')
						}
						break;
					case 'set-apellidos':
						var apellidos = {
							primerApellido : $(this).find('[name="primerApellido"]').val().trim(),
							segundoApellido : $(this).find('[name="segundoApellido"]').val().trim()
						};
						if (apellidos.primerApellido.trim() != '' && apellidos.segundoApellido != '') {
							$.publish('set-apellidos', apellidos);
						} else {
							showMessage('Ingrese correctamente sus dos apellidos')
						}
						break;
					case 'set-nombres-up':

						var nombres = {
							primerNombre : $(this).find('[name="primerNombre"]').val().trim(),
							segundoNombre : $(this).find('[name="segundoNombre"]').val().trim()
						};
						if (nombres.primerNombre.trim() != '' && nombres.segundoNombre != '') {
							$.publish('set-nombres-up', nombres);
						} else {
							showMessage('Ingrese correctamente sus dos nombres')
						}
						break;
					case 'set-apellidos-up':
						var apellidos = {
							primerApellido : $(this).find('[name="primerApellido"]').val().trim(),
							segundoApellido : $(this).find('[name="segundoApellido"]').val().trim()
						};
						if (apellidos.primerApellido.trim() != '' && apellidos.segundoApellido != '') {
							$.publish('set-apellidos-up', apellidos);
						} else {
							showMessage('Ingrese correctamente sus dos apellidos')
						}
						break;
					}
				} catch (err) {
					console.log(err.message);
					console.log(err.stack);
				}
			});

			if (isAuth()) {
				try {
					$page.find('#nombreUsuario').text(localStorage.getItem('nombrePersona').split(' ')[0]);
				} catch (e) {
					console.log(e);
				}
			} else {
				$page.find('#nombreUsuario').text('');
			}

		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}

		// localStorage.setItem('featureShowed', false);

	})

	.on('pageshow', function() {

		data.urlToReturnFromClubs = 'index.html#menu-offers';

		try {
			setTimeout(function() {
				$('[data-role="page"]#index').css('padding-top', '73px');
				$('[data-role="page"]#index').css('min-height', (parseInt($('body').css('height')) - 128) + 'px');
			}, 250);
		} catch (e) {
			console.log('Error ' + e);
		}

		try {

		} catch (e) {
			console.log(e);
		}

		if (localStorage.featureShowed == 'true') {
			$('.homeOverlay').css('opacity', '0');
			$('.homeOverlay').css('display', 'none');
			$('#menuCart').css('border-color', '#fff');
		} else {
			setTimeout(function() {
				localStorage.setItem('featureShowed', true);
				$('.homeOverlay').css('opacity', '0.7');
				$('.homeOverlay').css('display', '');
				$('#menuCart').css('border-color', 'rgb(255, 136, 0)');
			}, 1500);
		}

		viewModel.cartCount(customer.items().cartItems.length);

		if (isAuth()) {
			try {
				$page.find('#nombreUsuario').text(localStorage.getItem('nombrePersona').split(' ')[0]);
			} catch (e) {
				console.log(e);
			}

			customer.isAuthenticated(true);
			customer.id(localStorage.getItem('idPersona'));
			customer.name(localStorage.getItem('nombrePersona'));
			customer.email(localStorage.getItem('emailPersona'));
		} else {
			$page.find('#nombreUsuario').text('');
			customer.isAuthenticated(false);
		}

		if (customer.isGuest()){
			$page.find('#nombreUsuario').text('INVITADO');
		}

		if (deferShowReminder) {
			deferShowReminder();
			deferShowReminder = null;
		}

	});

})();