//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#user-forgot-password');
	var tipoId = 'cedula';
	$page

	.on('pagebeforecreate', function() {

		try {
			if (deviceType != -1) {
				if (typeof (device) != "undefined" && device.version.substring(0, 2) == '2.' && device.platform == 'Android') {

					$page.find('[data-role="header"]').removeAttr('data-position');
					$page.find('[data-role="content"]').attr('style', 'overflow-x: initial');

				}
			}
		} catch (error) {
			console.log(error)
		}
	})

	.on('pageinit', function() {

		try {

			$page.find("input[type='radio']").bind("change", function(event, ui) {
				tipoId = $page.find('input[name=radio-view]:checked', '#user-forgot-password').val();

				if (tipoId == 'cedula') {
					$page.find("#txt-id").get(0).type = 'tel';
					$page.find("#txt-id").get(0).placeholder = 'Cédula';
				} else {
					$page.find("#txt-id").get(0).type = 'text';
					$page.find("#txt-id").get(0).placeholder = 'Pasaporte';
				}
			});

			$page.on('tap', '[data-action]:not(form)', function(e) {
				e.preventDefault();
				switch ($(this).data('action')) {
				case 'cancelar':
					$.mobile.changePage('user-login.html');
					break;

				case 'recuperar':
					if ($page.find('#txt-id').val() != '') {

						if ((tipoId == 'cedula' && $page.find('#txt-id').val().length == 10) || tipoId == 'pasaporte') {
							if ((tipoId == 'cedula' && validarCedula($page.find('#txt-id').val())) || tipoId == 'pasaporte') {
								recuperarPassword();
							}

						} else {
							showMessage('La cédula debe contener 10 números');
						}

					} else {
						showMessage("Ingrese correctamente su identificación", null, null);
					}
					break;
				}
			});
		} catch (err) {
			console.log(err);
		}

	}).on('pageshow', function() {
		$page.find('[type=button]').removeAttr('disabled');
		// $page.find('[type=button]').button('refresh');
		vaciarCampos();
	});

	function vaciarCampos() {
		$page.find("#txt-id").val('');
	}

	function validarCedula(cadena) {

		var total = 0;

		for ( var i = 0; i < 9; i++) {
			var currD = parseInt(cadena.substring(i, i + 1));
			total += (i % 2 == 0) ? ((currD * 2 > 9) ? currD * 2 - 9 : currD * 2) : (parseInt(cadena.substring(i, i + 1)));
		}

		total = total % 10;
		total = (total == 0) ? 0 : 10 - total;

		if (total == cadena.substring(cadena.length - 1, cadena.length)) {
			return true;
		} else {
			showMessage("La cédula ingresada no es válida", null, null);
			return false;
		}

	}

	function recuperarPassword() {

		$.mobile.loading("show", {
			text : "Recuperando contraseña",
			textVisible : true,
			textonly : false,
			theme : 'b'
		});

		$page.find('[type=button]').attr('disabled', 'disabled');
		// $page.find('[type=button]').button('refresh');

		data.customerTemporalId =  $page.find("#txt-id").val();
		
		invokeService({
			url : svb,
			service : "users",
			dataType : 'jsonp',
			data : {
				id : $page.find("#txt-id").val(),
				applicationCode : parameters.codigoAplicacion
			},
			serviceName : "GetRecoverPassword",
			success : function(response) {
				$page.find('[type=button]').removeAttr('disabled');
				// $page.find('[type=button]').button('refresh');
				if (response.code != undefined) {
					if (response.code == "0") {
						$.mobile.loading('hide');
						response.maskedCustomerMail = response;
						$(':mobile-pagecontainer').pagecontainer('change', 'app/views/user-forgot-password.html?op=1');
					} else if (response.code == "8") {
						showConfirmYesNo('Su usuario no ha sido activado, para activarlo abra el correo de activación que se le envió y haga clic en el link que aparece ahí.\n\nDesea Ud. que se le envíe nuevamente este correo?', function(response) {
							if (response == 2) {
								$.mobile.loading('show', {
									text : 'Enviando',
									textVisible : true,
									theme : 'b'
								});
								invokeAjaxService({
									url : svb,
									service : "users",
									dataType : 'jsonp',
									data : {
										user : $page.find("#txt-id").val(),
										applicationCode : parameters.codigoAplicacion
									},
									success : function(response1) {
										if (data.email != undefined) {
											if (data.email != '') {
												data.maskedCustomerMail = response1.email;
												$(':mobile-pagecontainer').pagecontainer('change', 'app/views/user-forgot-password.html?op=2');
											}
										} else {
											showMessage('Fybeca le ha enviado exitosamente un correo electrónico de activación.', null, 'Fybeca');
										}
										$.mobile.loading('hide');
									},
									error : function() {
										showMessage('Fallo en el envío del correo electrónico de activación. Espere unos minutos y vuelva a intentar.', null, null);
										$.mobile.loading('hide');
									}

								});
							} else
								$.mobile.loading('hide');

						}, null);
					} else {
						showMessage(data.msgUsr, null, null);
						$.mobile.loading('hide');
					}
				} else {
					$.mobile.loading('hide');
					// showMessage('Fybeca le ha enviado una clave temporal a su
					// correo: ' + data + '. Si su email no es correcto favor
					// llamar al 1700-FYBECA (392322) y actualice sus datos.',
					// null, 'Fybeca');
					// $.mobile.changePage('user-login.html');
					data.maskedCustomerMail = response;
					$(':mobile-pagecontainer').pagecontainer('change', 'app/views/user-forgot-password-success.html?op=1');
				}
			},
			error : function() {
				$page.find('[type=button]').removeAttr('disabled');
				// $page.find('[type=button]').button('refresh');
				showMessage(defaultErrorMsg, null, null);
				$.mobile.loading('hide');
			}

		});
	}

})();
