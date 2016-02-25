//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

/**
 * @fileOverview Page to change user's password
 * @author <a href="www.bayteq.com">Bayteq</a>
 * @version 1.0.0
 */

(function() {
	var $page = $('#user-change-password');
	/**
	 * @param {int}
	 *            bnombres flag to check if the user full name has more than 3
	 *            words
	 */
	var bNombres = 0;

	/**
	 * @param {int}
	 *            bnombres flag to check if the user full lastname has more than
	 *            3 words
	 */
	var bApellidos = 0;

	$page.on('pagebeforecreate', function() {

		if (deviceType != -1) {

			if (typeof (device) != "undefined" && device.version.substring(0, 2) == '2.' && device.platform == 'Android') {

				$page.find('[data-role="header"]').removeAttr('data-position');
				$page.find('[data-role="content"]').attr('style', 'overflow-x: initial');

			}

		}

	})

	.on('pageinit', function() {

		$page.find("#showPass").bind("change", function(event, ui) {

			if ($page.find("#showPass").is(':checked')) {

				$page.find("#txt-passAnterior").get(0).type = 'text';
				$page.find("#txt-passNuevo1").get(0).type = 'text';
				$page.find("#txt-passNuevo2").get(0).type = 'text';

			} else {

				$page.find("#txt-passAnterior").get(0).type = 'password';
				$page.find("#txt-passNuevo1").get(0).type = 'password';
				$page.find("#txt-passNuevo2").get(0).type = 'password';

			}

		});

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'cancelar':
				$.mobile.changePage('user-login.html');
				break;

			case 'aceptar':

				if (validar()) {

					cambiarPassword();

				}

				break;

			}
		});

	}).on('pageshow', function() {

		loadComponents();
		vaciarCampos();
		$page.find("#txt-id").val((isAuth()) ? localStorage.getItem("idPersona") : persona.id);
		$page.find('[type=submit]').removeAttr('disabled');

		try {
			if (navigator.connection.type == Connection.NONE) {
				ShowMessageInternetNotAvailable();
				return;
			}
		} catch (err) {

		}

	});

	function vaciarCampos() {

		$page.find("#txt-passAnterior").val('');
		$page.find("#txt-passNuevo1").val('');
		$page.find("#txt-passNuevo2").val('');

	}

	function loadComponents() {

		if (cambiaPassTemporal)
			$page.find('#pass').hide();
		else {
			$page.find('#pass').show();
		}

	}

	function validar() {

		if (($page.find('#txt-passAnterior').val() != '' || cambiaPassTemporal) && $page.find('#txt-passNuevo1').val() != '' && $page.find('#txt-passNuevo2').val() != '') {

			if ($page.find('#txt-passNuevo1').val().trim() == $page.find('#txt-passNuevo2').val().trim()) {

				if ($page.find('#txt-passAnterior').val() != $page.find('#txt-passNuevo1').val())
					return validarPassword();
				else {
					showMessage("Contraseña anterior no puede ser igual a contraseña nueva", null, "Mensaje");
					return false;
				}

			}

			showMessage("Nuevas contraseñas no coinciden", null, "Mensaje");
			return false;

		}

		showMessage("Llene todos los campos", null, "Mensaje")
		return false;

	}

	function validarPassword() {

		var pass = $page.find('#txt-passNuevo1').val();

		if (pass.length >= 6 && pass.length <= 16) {

			if (pass != persona.id) {

				// if (comprobarAlfanumerico(pass)) {

				return true;

				// } else {
				// showMessage('Contraseña debe contener numeros y letras',
				// null, 'Mensaje');
				// }
			} else {
				showMessage('Contraseña no puede ser igual a su identificación', null, 'Mensaje');
			}
		} else {
			showMessage('Contraseña debe tener entre 6 y 16 caracteres', null, 'Mensaje');
		}

		return false;

	}

	function comprobarAlfanumerico(texto) {

		var regExp = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{6,16})$/;

		if (regExp.test(texto)) {
			return true;
		}

		return false;

	}
	;

	function cambiarPassword() {

		try {
			if (navigator.connection.type == Connection.NONE) {
				ShowMessageInternetNotAvailable();
				return;
			}
		} catch (err) {

		}

		var codeP = (persona.codigoPersona != '') ? persona.codigoPersona : localStorage.getItem('codigoPersona');
		var pass = (cambiaPassTemporal) ? passTemporal : $page.find("#txt-passAnterior").val().trim();
		passTemporal = '';
		debugger;
		var thisPass = $page.find("#txt-passNuevo1").val().trim();
		if (thisPass.indexOf('&') >= 0 || thisPass.indexOf('%') >= 0 || thisPass.indexOf('=') >= 0 || thisPass.indexOf("'") >= 0) {
			showMessageTextClose('No puedes ingresar contraseñas q contengan "&", "%", " \' " o "="');
			return;
		}

		$.mobile.loading("show", {
			text : "Cambiando contraseña",
			textVisible : true,
			textonly : false,
			theme : 'b'
		});

		$page.find('[type=submit]').attr('disabled', 'disabled');

		invokeService2({
			url : svf,
			service : "cambiarClave",
			dataType : 'jsonp',
			data : {
				codigoPersona : codeP,
				claveAnterior : pass,
				nuevaClave : $page.find("#txt-passNuevo1").val().trim(),
				codigoAplicacion : parameters.codigoAplicacion
			},
			isNeededActivateButtons : true,
			success : function(data) {

				$page.find('[type=submit]').removeAttr('disabled');
				// $page.find('[type=submit]').button('refresh');

				$.mobile.loading('hide');
				showMessage('Su clave se ha cambiado exitosamente', null, "Mensaje");
				if (cambiaPassTemporal) {
					// localStorage.setItem('idPersona', persona.id);
					// localStorage
					// .setItem('codigoPersona', persona.codigoPersona);
					cambiaPassTemporal = false;
					facebook_logout();
					google_logout();
				}
				cambiaPassTemporal = false;
				parameters.session = true;

				try {
					models.CustomerActions.getAddresses(localStorage.getItem('codigoPersona'));
				} catch (e) {
					console.log('EXCEPTION userChangePassword getAddresses' + e);
				}

				try {
					models.cart.getItems(localStorage.getItem('idPersona'));
				} catch (e) {
					console.log('EXCEPTION userChangePassword' + e);
				}

				// $.mobile.changePage('index.html#menu-mifybeca');
				$.mobile.changePage('index.html');

			},
			error : function(e, message) {

				$page.find('[type=submit]').removeAttr('disabled');
				// $page.find('[type=submit]').button('refresh');
				if (message === 'timeout')
					showMessage('No se ha recibido respuesta del servidor en el tiempo máximo permitido. Para confirmar si se efectuó la actualización, por favor salga y vuelva a entrar a actualizar datos y compruebelo. Caso contrario espere unos minutos y vuelva a intentar.', null, null);
				$.mobile.loading('hide');
			}

		});

	}

})();
