//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {

	var $page = $('#user-register-step3');
	var $form = $page.find('#userRegisterStep3');

	$page.on('pageinit', function() {

		$form.on('submit', function(e) {
			e.preventDefault();

			switch ($(this).data('action')) {
			case 'finalizar-registro':
				if ($(this).valid()) {
					if (validaciones()) {
						enviarDatos();
					}
				} else {
					var destination = $('.error:visible:first').offset().top;
					$("html:not(:animated),body:not(:animated)").animate({
						scrollTop : destination - 2
					}, 500);
				}
				break;
			}

		});

		$page.find("#showPass").bind("change", function(event, ui) {

			if ($page.find("#showPass").is(':checked')) {

				$page.find("#txt-password1").get(0).type = 'text';
				$page.find("#txt-password2").get(0).type = 'text';

			} else {

				$page.find("#txt-password1").get(0).type = 'password';
				$page.find("#txt-password2").get(0).type = 'password';

			}

		});

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {

			case 'finalizar':

				$form.submit();

				break;

			}
		});

	}).on('pageshow', function() {

		$page.find('[type=submit]').removeAttr('disabled');
		$page.find('[type=submit]').button('refresh');

		$page.find("#showPass").prop('checked', false).checkboxradio('refresh');
		$page.find("#txt-password1").get(0).type = 'password';
		$page.find("#txt-password2").get(0).type = 'password';

		$page.find("#txt-id").val(persona.id);
		vaciarCampos();

	})

	function vaciarCampos() {

		$page.find("#txt-password1").val('');
		$page.find("#txt-password2").val('');
		$page.find("#txt-facebook").val(persona.facebookLink);
		$page.find("#txt-twitter").val('');
		$page.find("#txt-googleplus").val('');
		$page.find("#txt-pinterest").val('');
		$page.find('#txt-foursquare').val('');

	}

	function validarPassword() {

		var pass = $page.find('#txt-password1').val();

		if (pass.length >= 6 && pass.length <= 16) {

			if (pass != persona.id) {

				if (comprobarAlfanumerico(pass)) {

					return true;

				} else {
					showMessage('Contraseña debe contener números y letras', null, 'Mensaje');
				}
			} else {
				showMessage('Contraseña no puede ser igual a su identificación', null, 'Mensaje');
			}
		} else {
			showMessage('Contraseña debe tener entre 6 y 16 caracteres', null, 'Mensaje');
		}

	}

	function comprobarAlfanumerico(texto) {

		var regExp = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{6,16})$/;

		if (regExp.test(texto)) {
			return true
		}

		return false

	}

	function enviarDatos() {

		try {

			$.mobile.loading('show', {
				text : 'Guardando',
				textVisible : true,
				theme : 'b'
			});
			$page.find('[type=submit]').attr('disabled', 'disabled');
			$page.find('[type=submit]').button('refresh');

			invokeAjaxService({
				url : svb,
				service : "users",
				dataType : 'jsonp',
				data : {
					idNumber : persona.id,
					idNumberType : persona.tipoId,
					firstName : persona.primerNombre,
					secondName : persona.segundoNombre,
					lastName : persona.primerApellido,
					secondLastName : persona.segundoApellido,
					gender : persona.genero,
					birthDate : persona.fechaNacimiento,
					mobileNumber : persona.celular,
					phoneNumber : persona.fijo,
					email : persona.email,
					password : $page.find('#txt-password1').val().trim(),
					facebookUser : $page.find('#txt-facebook').val(),
					twitterUser : $page.find('#txt-twitter').val(),
					googlePlusUser : $page.find('#txt-googleplus').val(),
					pinterestUser : $page.find('#txt-pinterest').val(),
					foursquareUser : $page.find('#txt-foursquare').val(),
					// type: 'IP',
					// token: '1234567',
					applicationCode : parameters.codigoAplicacion
				},

				success : function(data) {

					$page.find('[type=submit]').removeAttr('disabled');
					$page.find('[type=submit]').button('refresh');

					try {

						seVaciaCampos = true;
						showMessage('Estimado usuario, se le ha enviado un link a su correo ' + persona.email + ' para que active su cuenta, por favor revíselo', null, null);
						$(':mobile-pagecontainer').pagecontainer('change', 'user-login.html');

						$.mobile.loading('hide');

					} catch (err) {

						$.mobile.loading('hide');
						console.log(err.message);
						console.log(err.stack);

					}

				},
				error : function(e, message) {

					$page.find('[type=submit]').removeAttr('disabled');
					$page.find('[type=submit]').button('refresh');

					if (message === 'timeout')
						showMessage('No se ha recibido respuesta del servidor en el tiempo máximo permitido. Para confirmar su registro por favor revise si recibió un correo para la activación de su cuenta. Caso contrario espere unos minutos y vuelva a intentar.', null, null);
					else
						showMessage(defaultErrorMsg, null, null);

					$.mobile.loading('hide');
					console.log(err.message);
					console.log(err.stack);
				}

			});
		} catch (err) {
			$page.find('[type=submit]').removeAttr('disabled');
			$page.find('[type=submit]').button('refresh');
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);

		}

	}

	function validaciones() {

		if (comprobarPasswords() && validarPassword()) {
			return true;
		}
		return false;

	}

	function comprobarLlenos() {

		if ($page.find("#txt-password1").val() != '' && $page.find("#txt-password2").val() != '') {

			return true

		} else {

			showMessage("Por favor, llene los campos resaltados", null, "Mensaje");
			return false;

		}

	}

	function comprobarPasswords() {

		if ($page.find("#txt-password1").val() == $page.find("#txt-password2").val()) {
			return true;
		}

		showMessage("Contraseñas no coinciden", null, "Mensaje");

		return false;

	}

})();
