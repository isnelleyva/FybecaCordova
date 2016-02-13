//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]');

	var viewModel = {

		idType : ko.observable('C'),

		showPassword : ko.observable(false),

		isProcessing : ko.observable(false),

		temporalIdType : '',

		temporalId : '',

		facebookData : '',

		login : function(form) {

			// try {
			// if (navigator.network.connection.type == Connection.NONE) {
			// ShowMessageInternetNotAvailable();
			// return;
			// }
			// } catch (err) {
			// }
			if ($(form).valid()) {

				var userData = $(form).serializeObject();

				if (userData.identificación != '' && userData.password != '') {

					if (!checkOnlyLettersAndNumbers(userData.identificación, 'Identificación')) {
						return false;
					}

					var thisPass = userData.password;
					if (thisPass.indexOf('&') >= 0 || thisPass.indexOf('%') >= 0 || thisPass.indexOf('=') >= 0 || thisPass.indexOf("'") >= 0) {
						showMessageTextClose('No puedes ingresar contraseñas q contengan "&", "%", " \' " o "="');
						// viewModel.isProcessing(false);
						return;
					}

					viewModel.isProcessing(true);

					var id = $page.find("#txt-id").val();

					try {
						userData.identificación = userData.identificación.replace(/ /g, '');
						id = id.replace(/ /g, '');
						$page.find("#txt-id").val(id);
					} catch (e) {
					}

					var pass = $page.find("#txt-password").val().trim();

					models.CustomerActions.login(viewModel.idType(), userData.identificación, pass).done(function(response) {
						viewModel.isProcessing(false);
						if (response.success) {

							try {
								models.gaRequests.trackEvent('login', 'loginPage');
							} catch (e) {
							}

							if (customer.addresses().length == 0) {
								$(':mobile-pagecontainer').pagecontainer('change', 'app/views/user-addresses-add.html');
							} else {
								$(':mobile-pagecontainer').pagecontainer('change', 'index.html');
							}

						} else {
							if (response.code == "1") {
								$(':mobile-pagecontainer').pagecontainer('change', 'user-change-password.html');
							}
						}

					}).fail(function(message) {

						$.mobile.loading("hide");
						showMessage('Estamos teniendo inconvenientes, por favor intentalo más tarde.', null, 'Mensaje');
						viewModel.isProcessing(false);
					});

				} else {
					showMessage("Llena correctamente todos los campos", null, "Mensaje");
					viewModel.isProcessing(false);
				}

			}

		},

		facebookLogin : function() {

			try {

				openFB.login('email', function() {

					$.mobile.loading("show", {
						text : "Iniciando sesión",
						textVisible : true,
						textonly : false,
						theme : 'b'
					});

					models.CustomerActions.getFacebookData().done(function(response) {

						viewModel.facebookData = response;

						models.CustomerActions.facebookLogin({
							facebookId : response.id
						}).done(function(response) {

							$.mobile.loading("hide");

							if (response.success) {
								if (response.code == 23) {

									$('#facebookIdSection').css('display', '');
									$('#facebookPasswordSection').css('display', 'none');

									$('#popupfacebookId').popup('open');
								} else if (response.code == 1) {
									$(':mobile-pagecontainer').pagecontainer('change', 'user-change-password.html');
								} else if (response.code == 0) {
									if (customer.addresses().length == 0) {
										$(':mobile-pagecontainer').pagecontainer('change', 'app/views/user-addresses-add.html');
									} else {
										$(':mobile-pagecontainer').pagecontainer('change', 'index.html#menu-mifybeca');
									}
								}
							} else {
								console.log('ERROR ' + response);
							}
						}).fail(function(error) {
							console.log('ERROR ' + error)
						});

					}).fail(function(error) {
						console.log('ERROR ' + error)
					});

				}, function(error) {
					alert('ERROR FB' + error);
				});
			} catch (e) {
				alert('ERROR getFacebookData try' + e);
			}

		},

		loginAsGuest : function(form) {
			var guestData = $(form).serializeObject();
			if (guestData.city != '' && guestData.neighborhood != '') {
				customer.addresses([]);
				customer.discountCards([]);
				customer.paymentTypes([]);
				checkoutCart.cart.items([]);
				customer.isAuthenticated(false);
				customer.isGuest(true);
				customer.selectedGuestCity(guestData.city);
				customer.selectedGuestNeighborhood(guestData.neighborhood);
				$(':mobile-pagecontainer').pagecontainer('change', 'index.html');
			} else {
				showMessage("Selecciona tu barrio y tu ciudad", null, "Mensaje");
			}
		},

		closeAddressGuestPopup : function() {
			$('#popupAddressGuest').popup('close');
		},

		enterIdForFacebook : function(form) {

			if ($(form).valid()) {

				var userData = $(form).serializeObject();

				viewModel.temporalIdType = userData.rdFacebookIdType;
				viewModel.temporalId = userData.facebookId;

				$.mobile.loading("show", {
					text : "Procesando",
					textVisible : true,
					textonly : false,
					theme : 'b'
				});

				models.CustomerActions.checkIfUserExists({
					userId : userData.facebookId
				}).done(function(response) {

					$.mobile.loading("hide");

					if (response.code == 0) {

						$('#facebookIdSection').css('display', 'none');
						$('#facebookPasswordSection').css('display', '');

					} else if (response.code == 24) {

						var userData = {
							facebookId : viewModel.facebookData.id,
							userIdType : viewModel.temporalIdType,
							userId : viewModel.temporalId,
							name : viewModel.facebookData.first_name,
							lastname : viewModel.facebookData.last_name,
							email : viewModel.facebookData.email,
							birthdate : viewModel.facebookData.birthday,
							gender : viewModel.facebookData.gender
						};

						models.CustomerActions.registerUser(userData).done(function(response) {

							if (response.code == 0) {

								if (customer.addresses().length == 0) {
									$(':mobile-pagecontainer').pagecontainer('change', 'app/views/user-addresses-add.html');
								} else {
									$(':mobile-pagecontainer').pagecontainer('change', 'index.html#menu-mifybeca');
								}

							} else if (response.code == 1) {

								$(':mobile-pagecontainer').pagecontainer('change', 'user-change-password.html');

							} else {
								console.log(response);
							}

						}).fail(function(data) {
							console.log('FAIL enterPasswordForFacebook' + data)
						});

					}

				}).fail(function() {

				});

			}

		},

		enterPasswordForFacebook : function(form) {

			if ($(form).valid()) {

				var userData = $(form).serializeObject();

				$.mobile.loading("show", {
					text : "Procesando",
					textVisible : true,
					textonly : false,
					theme : 'b'
				});

				var data = {
					facebookId : viewModel.facebookData.id,
					userIdType : viewModel.temporalIdType,
					userId : viewModel.temporalId,
					name : viewModel.facebookData.first_name,
					lastname : viewModel.facebookData.last_name,
					email : viewModel.facebookData.email,
					birthdate : viewModel.facebookData.birthday,
					gender : viewModel.facebookData.gender,
					password : userData.facebookPassword
				};

				models.CustomerActions.tryToRegisterFromFacebook(data).done(function(response) {

					$.mobile.loading("hide");

					if (response.code == 0) {

						if (customer.addresses().length == 0) {
							$(':mobile-pagecontainer').pagecontainer('change', 'app/views/user-addresses-add.html');
						} else {
							$(':mobile-pagecontainer').pagecontainer('change', 'index.html#menu-mifybeca');
						}

					} else if (response.code == 1) {

						$(':mobile-pagecontainer').pagecontainer('change', 'user-change-password.html');

					} else if (response.code == 25) {

						$.mobile.loading("show", {
							text : response.message,
							textVisible : true,
							textonly : true,
							theme : 'b'
						});

						setTimeout(function() {
							$.mobile.loading("hide");
						}, 3500)

					} else {
						console.log(response);
					}

				}).fail(function(data) {
					console.log('FAIL enterPasswordForFacebook' + data)
				});
			}

		},

		openPopupAdressesGuest : function() {

			try {
				if (navigator.network.connection.type == Connection.NONE) {
					showMessageText('En este momento no posees conexión a internet, verifica tu conexión y vuelve a intentarlo');
					return;
				}
			} catch (err) {
			}

			if (data.cities().length == 0) {
				$.mobile.loading("show", {
					text : 'Consultando ciudades',
					textVisible : true,
					theme : 'b'
				});
				models.DataRequests.getCities();
			}

			$('select[name="neighborhood"], select[name="neighborhoodB"], select[name="neighborhoodS"]').selectmenu('disable');

			$('#popupAddressGuest').popup('open');

		},

		goToRegister : function() {
			$(':mobile-pagecontainer').pagecontainer('change', 'user-register-step1.html');
		}

	};

	$page.on('pagebeforecreate', function() {
		ko.applyBindings(viewModel, $page[0]);

		// try {
		// // openFB.init('636181696450364');
		// } catch (e) {
		// alert('ERROR pagebeforecreate try' + e);
		// }

	}).on('pageshow', function() {

	});

})(jQuery);