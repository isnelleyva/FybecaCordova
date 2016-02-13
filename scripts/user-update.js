//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#user-update');
	var bNombres = 0; // Si es 0 se toma el nombre de txt-nombres, Si es 1 se
	// toma el texto de txt-nombre1 y txt-nombre2. Lo mismo
	// para apellidos
	var bApellidos = 0;
	var codeMovil = 0;
	var codeFijo = 0;
	var codeEmail = 0;
	var codeFB = 0;
	var codeTW = 0;
	var codeFS = 0;
	var codePI = 0;
	var codeGP = 0;
	var contCaracteresRepetidos = 0;
	var $form = $page.find('#userUpdate');
	var date = new Date(new Date().getTime() - 315360000000); // Se restan 10
	// años a la
	// fecha actual
	var cargar = true; // Indica si en el pageshow se cargan los datos, se usa
	// false cuando se carga pantalla para los nombres, y al
	// regreso no cargue nuevamente los datos
	var datosCambiados = false;

	var isUpdating = false;

	$page

	.on('pagebeforecreate', function() {

		if (deviceType != -1) {

			if (typeof (device) != "undefined" && device.version.substring(0, 2) == '2.' && device.platform == 'Android') {

				$page.find('[data-role="header"]').removeAttr('data-position');
				$page.find('[data-role="content"]').attr('style', 'overflow-x: initial');

			}

		}

	})

	.on('pageinit', function() {

		validator = $form.validate();

		$.subscribe('set-nombres-up', function(e, nombres) {
			persona.primerNombre = nombres.primerNombre.trim();
			persona.segundoNombre = nombres.segundoNombre.trim();
			setNombresApellidos(persona.primerNombre, persona.segundoNombre, 1);
			$(':mobile-pagecontainer').pagecontainer('change', 'user-update.html');
			cargar = true;
		});

		$.subscribe('set-apellidos-up', function(e, apellidos) {
			persona.primerApellido = apellidos.primerApellido.trim();
			persona.segundoApellido = apellidos.segundoApellido.trim();
			setNombresApellidos(persona.primerApellido, persona.segundoApellido, 2);
			$(':mobile-pagecontainer').pagecontainer('change', 'user-update.html');
			cargar = true;
		});

		$page.find("#showPass").bind("change", function(event, ui) {

			if ($page.find("#showPass").is(':checked')) {

				$page.find("#txt-password").get(0).type = 'text';

			} else {

				$page.find("#txt-password").get(0).type = 'password';

			}

		});

		$page.find('[data-role="collapsible"]').on('tap', function() {

			$('html,body').animate({
				scrollTop : $(document).height()
			}, 2000);

		});

		// $page.find('#fechaNacimiento').on('tap', function() {
		// var currentField = $(this);
		// currentField.blur();
		// if (typeof Cordova !== "undefined" && device.platform == 'Android') {
		// window.plugins.datePicker.show({
		//
		// date : new Date(date),
		// mode : 'date',
		// allowOldDates : true
		//
		// }, function(selectedDate) {
		//
		// $page.find('#fechaNacimiento').val(selectedDate.split('/')[2] + '/' +
		// selectedDate.split('/')[1] + '/' + selectedDate.split('/')[0]);
		// date = new Date(selectedDate.split('/')[1] + '/' +
		// selectedDate.split('/')[2] + '/' + selectedDate.split('/')[0]);
		//
		// });
		// }
		//
		// });

		// if (typeof Cordova !== "undefined" && device.platform == 'Android') {
		// } else {
		$page.find("#fechaNacimiento").scroller($.extend({}, scrollerOptions, {
			preset : 'date',
			maxDate : new Date(new Date().getTime() - 315360000000),
			dateFormat : 'yy/mm/dd'
		}));

		// }

		$page.find('#txt-nombres').keyup(function() {
			bNombres = 0;
			comprobarNombres();
			datosCambiados = true;
		});

		$page.find('#txt-apellidos').keyup(function() {
			bApellidos = 0;
			comprobarApellidos();
			datosCambiados = true;
		});

		$page.find("#txt-email").keyup(function() {
			datosCambiados = true;
		});
		$page.find("#txt-celular").keyup(function() {
			datosCambiados = true;
		});
		$page.find("#txt-telfijo").keyup(function() {
			datosCambiados = true;
		});
		$page.find('#txt-nombre1').keyup(function() {
			datosCambiados = true;
		});
		$page.find('#txt-nombre2').keyup(function() {
			datosCambiados = true;
		});
		$page.find('#txt-apellido1').keyup(function() {
			datosCambiados = true;
		});
		$page.find('#txt-apellido2').keyup(function() {
			datosCambiados = true;
		});
		$page.find("#txt-password").keyup(function() {
			datosCambiados = true;
		});
		$page.find("#txt-facebook").keyup(function() {
			datosCambiados = true;
		});
		$page.find("#txt-twitter").keyup(function() {
			datosCambiados = true;
		});
		$page.find("#txt-googleplus").keyup(function() {
			datosCambiados = true;
		});
		$page.find("#txt-pinterest").keyup(function() {
			datosCambiados = true;
		});
		$page.find('#txt-foursquare').keyup(function() {
			datosCambiados = true;
		});

		$page.find('#txt-apellidos').keyup(function() {
			datosCambiados = true;
		});

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'cancelar':
				$(':mobile-pagecontainer').pagecontainer('change', 'user-login.html');
				break;

			case 'aceptar':

				$form.submit();
				break;

			}
		});

		$page.find('#txt-celular').keyup(function() {
			datosCambiados = true;
			if ($page.find('#txt-celular').val() != '') {
				$page.find('#txt-telfijo').removeClass('required');
				$page.find('#txt-telfijo').css('border-color', 'darkGray');
				$form.valid();
			} else {
				$page.find('#txt-telfijo').addClass('required');
				$page.find('#txt-telfijo').css('border-color', '');
				$form.valid();
			}
		});

		$page.find('#txt-telfijo').keyup(function() {
			datosCambiados = true;
			if ($page.find('#txt-telfijo').val() != '') {
				$page.find('#txt-celular').removeClass('required');
				$page.find('#txt-celular').css('border-color', 'darkGray');
				$form.valid();
			} else {
				$page.find('#txt-celular').addClass('required');
				$page.find('#txt-celular').css('border-color', '');
				$form.valid();
			}
		});

		$form.on('submit', function(e) {
			e.preventDefault();

			$page.find('#txt-celular').keyup(function() {
				datosCambiados = true;
				if ($page.find('#txt-celular').val() != '') {
					$page.find('#txt-telfijo').removeClass('required');
					$page.find('#txt-telfijo').css('border-color', 'darkGray');
					$form.valid();
				} else {
					$page.find('#txt-telfijo').addClass('required');
					$page.find('#txt-telfijo').css('border-color', '');
					$form.valid();
				}
			});

			$page.find('#txt-telfijo').keyup(function() {
				datosCambiados = true;
				if ($page.find('#txt-telfijo').val() != '') {
					$page.find('#txt-celular').removeClass('required');
					$page.find('#txt-celular').css('border-color', 'darkGray');
					$form.valid();
				} else {
					$page.find('#txt-celular').addClass('required');
					$page.find('#txt-celular').css('border-color', '');
					$form.valid();
				}
			});

			switch ($(this).data('action')) {
			case 'update':
				if ($(this).valid()) {

					var maxDate = new Date(new Date().getTime() - 315360000000);
					var selectedDate = new Date();
					
					selectedDate = new Date($page.find('#fechaNacimiento').val());

					if (selectedDate > maxDate) {

						showMessage('Debe tener por lo menos 10 años para poder registrarse. Corregir fecha de nacimiento', null, 'Mensaje');

					} else {

						prepararDatos();

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

	}).on('pageshow', function() {

		isUpdating = false;

		$page.find('[type=submit]').removeAttr('disabled');
		// $page.find('[type=submit]').button('refresh');

		validator.resetForm();

		$page.find("#showPass").prop('checked', false).checkboxradio('refresh');
		$page.find("#txt-password").get(0).type = 'password';

		if (cargar) {

			date = new Date();
			contCaracteresRepetidos = 0;
			$page.find("#txt-id").val(localStorage.getItem('idPersona'));
			vaciarCampos();
			cargarDatos();

		}

	});

	function setNombresApellidos(par1, par2, bandera) {

		if (bandera == 1) {

			$('#user-update').find("#txt-nombres").val(par1 + ' ' + par2);

		} else if (bandera == 2) {

			$('#user-update').find("#txt-apellidos").val(par1 + ' ' + par2);

		}

	}

	function vaciarCampos() {

		$page.find("#txt-nombres").val('');
		$page.find("#txt-apellidos").val('');
		$page.find("#txt-email").val('');
		$page.find("#fechaNacimiento").val('');
		$page.find("#txt-celular").val('');
		$page.find("#txt-telfijo").val('');
		$page.find('#txt-nombre1').val('');
		$page.find('#txt-nombre2').val('');
		$page.find('#txt-apellido1').val('');
		$page.find('#txt-apellido2').val('');
		$page.find("#txt-password").val('');
		$page.find("#txt-facebook").val('');
		$page.find("#txt-twitter").val('');
		$page.find("#txt-googleplus").val('');
		$page.find("#txt-pinterest").val('');
		$page.find('#txt-foursquare').val('');

	}

	function cargarDatos() {

		try {

			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});

			// invokeAjaxService({
			invokeService({
				url : config.svf,
				service : "obtenerDatosPersonaFromCodigo",
				dataType : 'jsonp',
				data : {
					codigoAplicacion : parameters.codigoAplicacion,
					codigoPersona : localStorage.getItem("codigoPersona")
				},

				success : function(data) {
					var datosCambiados = false;
					try {

						var datos = data.estadoUsuario;
						var contactos = data.mediosContacto;
						var genero = datos.genero;
						$page.find('select').val((genero == 'F') ? 'female' : 'male').change();

						$page.find('#gender').selectmenu('refresh');

						datos.primerNombre = fixName(datos.primerNombre);
						datos.segundoNombre = fixName(datos.segundoNombre);
						datos.primerApellido = fixName(datos.primerApellido);
						datos.segundoApellido = fixName(datos.segundoApellido);

						$page.find("#txt-nombres").val(((datos.primerNombre != null) ? datos.primerNombre : '').trim() + ' ' + ((datos.segundoNombre != null) ? datos.segundoNombre : '').trim());
						$page.find("#txt-apellidos").val(((datos.primerApellido != null) ? datos.primerApellido : '').trim() + ' ' + ((datos.segundoApellido != null) ? datos.segundoApellido : '').trim());
						$page.find("#txt-email").val(datos.email.trim());

						if ($.trim($page.find("#txt-nombres").val()).split(' ').length > 2) {
							bNombres = 1;
							persona.primerNombre = datos.primerNombre.trim();
							persona.segundoNombre = datos.segundoNombre.trim();
						}
						if ($.trim($page.find("#txt-apellidos").val()).split(' ').length > 2) {
							bApellidos = 1;
							persona.primerApellido = datos.primerApellido.trim();
							persona.segundoApellido = datos.segundoApellido.trim();
						}

						if (datos.fechaNacimiento != null) {

							datos.fechaNacimiento = datos.fechaNacimiento.split(' ')[0];
							date = new Date(datos.fechaNacimiento.replace(/-/g, '/'));

							// if (typeof Cordova !== "undefined" &&
							// device.platform == 'Android') {
							// $page.find("#fechaNacimiento").val(datos.fechaNacimiento.split('-')[2]
							// + '/' + datos.fechaNacimiento.split('-')[1] + '/'
							// + datos.fechaNacimiento.split('-')[0]);
							// } else {
							$page.find("#fechaNacimiento").val(date.getDate().toString() + '/' + (date.getMonth() + 1).toString() + '/' + date.getFullYear().toString());

							if ($page.find("#fechaNacimiento").scroller('getDate') == undefined) {
								$page.find("#fechaNacimiento").scroller($.extend({}, scrollerOptions, {
									preset : 'date',
									maxDate : new Date(new Date().getTime() - 315360000000),
									dateFormat : 'dd/mm/yy'
								}));
							}
							$page.find("#fechaNacimiento").scroller('setDate', date, true);
							// }

						}

						for ( var i = 0; i < contactos.length; i++) {

							if (contactos[i].descripcion == 'numeroConvencional') {
								codeFijo = contactos[i].codigo;
								$page.find("#txt-telfijo").val(contactos[i].valor.split(' ').join('').trim());
								$page.find('#txt-celular').removeClass('required');
								$page.find('#txt-celular').css('border-color', 'darkGray');
							}
							if (contactos[i].descripcion == 'numeroCelular') {
								codeMovil = contactos[i].codigo;
								$page.find("#txt-celular").val(contactos[i].valor.split(' ').join('').trim());
								$page.find('#txt-telfijo').removeClass('required');
								$page.find('#txt-telfijo').css('border-color', 'darkGray');
							}
							if (contactos[i].descripcion == 'email') {
								codeEmail = contactos[i].codigo;
								$page.find("#txt-email").val(contactos[i].valor.split(' ').join('').trim());
							}
							if (contactos[i].descripcion == 'usuarioFacebook') {
								codeFB = contactos[i].codigo;
								$page.find("#txt-facebook").val(contactos[i].valor.trim());
							}
							if (contactos[i].descripcion == 'usuarioTwitter') {
								codeTW = contactos[i].codigo;
								$page.find("#txt-twitter").val(contactos[i].valor.trim());
							}
							if (contactos[i].descripcion == 'usuarioPinterest') {
								codePI = contactos[i].codigo;
								$page.find("#txt-pinterest").val(contactos[i].valor.trim());
							}
							if (contactos[i].descripcion == 'usuarioGooglep') {
								codeGP = contactos[i].codigo;
								$page.find("#txt-googleplus").val(contactos[i].valor.trim());
							}
							if (contactos[i].descripcion == 'usuarioFoursquare') {
								codeFS = contactos[i].codigo;
								$page.find("#txt-foursquare").val(contactos[i].valor.trim());
							}

						}

						$.mobile.loading('hide');

					} catch (err) {
						$.mobile.loading('hide');
						console.log(err.message);
						console.log(err.stack);
					}

				},
				error : function() {
					showMessage(defaultErrorMsg, null, 'Mensaje');
					$.mobile.loading('hide');
				}
			});
		} catch (err) {
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}

	}

	function fixName(nombre) { // En caso de un nombre compuesto, pone
		// mayusculas a la 1ra letra de cada nombre

		aux = '';
		if (nombre != null && nombre.split(' ').length > 0) {
			nombres = nombre.split(' ');
			for ( var i = 0; i < nombres.length; i++) {
				aux += nombres[i].substring(0, 1).toUpperCase() + nombres[i].substring(1).toLowerCase() + ' ';
			}
		}
		return aux.trim();

	}

	function validaciones() {

		if (comprobarLlenos()) {

			return true;

		}

		return false;

	}

	function comprobarLlenos() {

		return ($page.find("#txt-password").val().trim() != '') ? true : false;

	}

	function actualizarDatos() {

		$.mobile.loading('show', {
			text : 'Actualizando',
			textVisible : true,
			theme : 'b'
		});

		if (isUpdating) {
			isUpdating = false;
			return false;
		}

		isUpdating = true;

		$page.find('[type=submit]').attr('disabled', 'disabled');
		// $page.find('[type=submit]').button('refresh');
		// isNeededActivateButtons=true;

		// invokeAjaxService({
		invokeService2({
			url : svb,
			service : "users",
			dataType : 'jsonp',
			data : {
				idNumber : localStorage.getItem("idPersona"),
				code : localStorage.getItem("codigoPersona"),
				firstName : persona.primerNombre,
				secondName : persona.segundoNombre,
				lastName : persona.primerApellido,
				secondLastName : persona.segundoApellido,
				gender : persona.genero,
				birthDate : persona.fechaNacimiento,
				codePhoneNumber : codeFijo,
				phoneNumber : $page.find("#txt-telfijo").val(),
				codeMobileNumber : codeMovil,
				mobileNumber : $page.find("#txt-celular").val(),
				codeEmail : codeEmail,
				email : $page.find("#txt-email").val(),
				password : $page.find('#txt-password').val().trim(),
				codeFacebookUser : codeFB,
				facebookUser : $page.find('#txt-facebook').val().trim(),
				codeTwitterUser : codeTW,
				twitterUser : $page.find('#txt-twitter').val().trim(),
				codeGooglePlusUser : codeGP,
				googlePlusUser : $page.find('#txt-googleplus').val().trim(),
				codePinterestUser : codePI,
				pinterestUser : $page.find('#txt-pinterest').val().trim(),
				codeFourSquareUser : codeFS,
				foursquareUser : $page.find('#txt-foursquare').val().trim(),
				applicationCode : parameters.codigoAplicacion
			},
			isNeededActivateButtons : true,
			success : function(data) {
				$page.find('[type=submit]').removeAttr('disabled');
				// $page.find('[type=submit]').button('refresh');
				$.mobile.loading('hide');

				showMessage('Cambios actualizados', null, null);
				localStorage.setItem('nombrePersona', persona.primerNombre.substring(0, 1) + persona.primerNombre.substring(1).toLowerCase() + ' ' + persona.primerApellido.substring(0, 1) + persona.primerApellido.substring(1).toLowerCase());
				$(':mobile-pagecontainer').pagecontainer('change', 'index.html#menu-mifybeca');

			},
			error : function(e, message) {
				$page.find('[type=submit]').removeAttr('disabled');
				// $page.find('[type=submit]').button('refresh');
				if (message === 'timeout') {
					showMessage('No se ha recibido respuesta del servidor en el tiempo máximo permitido. Para confirmar si se efectuó la actualización, por favor salga y vuelva a entrar a actualizar datos y compruebelo. Caso contrario espere unos minutos y vuelva a intentar.', null, null);
				} else {
					showMessage('En este momentos nos encontramos con problemas en nuestra plataforma, por favor vuelve a intentarlo mas tarde');
				}
				$.mobile.loading('hide');
			}

		});

	}

	function comprobarNombres() {

		var nombres = $page.find("#txt-nombres").val().trim();
		if (nombres.split(' ').length > 2) {

			cargar = false;
			$('#nombres-up').find('#primerNombre').val(nombres.split(' ')[0] + ' ' + nombres.split(' ')[1]);
			$('#nombres-up').find('#segundoNombre').val(nombres.split(' ')[2]);
			$(':mobile-pagecontainer').pagecontainer('change', $('#nombres-up'), {
				changeHash : false
			});
			bNombres = 1;

		}

	}

	function comprobarApellidos() {

		var apellidos = $page.find("#txt-apellidos").val().trim();
		if (apellidos.split(' ').length > 2) {

			cargar = false;
			$('#apellidos-up').find('#primerApellido').val(apellidos.split(' ')[0] + ' ' + apellidos.split(' ')[1]);
			$('#apellidos-up').find('#segundoApellido').val(apellidos.split(' ')[2]);
			bApellidos = 1;
			$(':mobile-pagecontainer').pagecontainer('change', $('#apellidos-up'), {
				changeHash : false
			});

		}

	}

	function prepararDatos() {

		persona.primerNombre = (bNombres == 0) ? $page.find('#txt-nombres').val().split(' ')[0] : persona.primerNombre;
		persona.segundoNombre = (bNombres == 0 && $page.find('#txt-nombres').val().split(' ').length == 2) ? $page.find('#txt-nombres').val().split(' ')[1] : (bNombres == 0 && $page.find('#txt-nombres').val().split(' ').length == 1) ? '' : persona.segundoNombre;
		persona.primerApellido = (bApellidos == 0) ? $page.find('#txt-apellidos').val().split(' ')[0] : persona.primerApellido;
		persona.segundoApellido = (bApellidos == 0 && $page.find('#txt-apellidos').val().split(' ').length == 2) ? $page.find('#txt-apellidos').val().split(' ')[1] : (bApellidos == 0 && $page.find('#txt-apellidos').val().split(' ').length == 1) ? '' : persona.segundoApellido;
		persona.genero = ($page.find('#gender').val() == "male") ? 'M' : 'F';

		var fechaNacimientoDate = new Date($page.find('#fechaNacimiento').val().split('/')[2] + "/" + $page.find('#fechaNacimiento').val().split('/')[1] + "/" + $page.find('#fechaNacimiento').val().split('/')[0]);
		persona.fechaNacimiento = fechaNacimientoDate.getTime();// new
		// Date($page.find('#fechaNacimiento').val()).getTime();
		persona.celular = $page.find('#txt-celular').val();
		persona.fijo = $page.find('#txt-telfijo').val();
		persona.email = $page.find('#txt-email').val();

		persona.primerNombre = prepararNombres(persona.primerNombre);
		persona.segundoNombre = prepararNombres(persona.segundoNombre);
		persona.primerApellido = prepararNombres(persona.primerApellido);
		persona.segundoApellido = prepararNombres(persona.segundoApellido);

		var nombresValidos1 = true;
		var nombresValidos2 = true;
		var telefonosValidos = true;

		if (persona.primerNombre != '') {
			nombresValidos1 = valNoCaracteresEspeciales(persona.primerNombre);
			nombresValidos2 = valNoCaracteresSeguidos(persona.primerNombre);
		}
		if (persona.segundoNombre != '' && nombresValidos1 && nombresValidos2) {
			nombresValidos1 = valNoCaracteresEspeciales(persona.segundoNombre);
			nombresValidos2 = valNoCaracteresSeguidos(persona.segundoNombre);
		}
		if (persona.primerApellido != '' && nombresValidos1 && nombresValidos2) {
			nombresValidos1 = valNoCaracteresEspeciales(persona.primerApellido);
			nombresValidos2 = valNoCaracteresSeguidos(persona.primerApellido);
		}
		if (persona.segundoApellido != '' && nombresValidos1 && nombresValidos2) {
			nombresValidos1 = valNoCaracteresEspeciales(persona.segundoApellido);
			nombresValidos2 = valNoCaracteresSeguidos(persona.segundoApellido);
		}

		if (persona.celular != '') {
			telefonosValidos = valTelefonoCelular(persona.celular);
		}
		if (persona.fijo != '' && telefonosValidos) {
			telefonosValidos = valTelefonoFijo(persona.fijo);
		}

		if (nombresValidos1 && nombresValidos2 && telefonosValidos) {

			if ($page.find('#gender').val() != "all") {
				actualizarDatos();
			} else {
				showMessage('Seleccione su sexo', null, 'Mensaje');
			}
		}

	}

	function prepararNombres(cadena) { // Esta funcion remueve las tildes y
		// transforma la cadena a mayusculas

		cadena = cadena.replace(/á/g, 'a');
		cadena = cadena.replace(/é/g, 'e');
		cadena = cadena.replace(/í/g, 'i');
		cadena = cadena.replace(/ó/g, 'o');
		cadena = cadena.replace(/ú/g, 'u');
		cadena = cadena.replace(/Á/g, 'a');
		cadena = cadena.replace(/É/g, 'e');
		cadena = cadena.replace(/Í/g, 'i');
		cadena = cadena.replace(/Ó/g, 'o');
		cadena = cadena.replace(/Ú/g, 'u');

		return cadena.toUpperCase();

	}

	function valNoCaracteresEspeciales(cadena) {

		var regExp = /^[a-zA-ZáéíóúÁÉÍÓÚ ]{2,30}$/;

		if (regExp.test(cadena)) {
			return true;
		}
		showMessage("Nombres o apellidos deben contener entre 2 y 30 caracteres, no números ni caracteres especiales", null, "Mensaje");
		return false;

	}

	function valNoCaracteresSeguidos(cadena) {

		var cad = cadena.toLowerCase();

		if (/aaa/.test(cad) || /bbb/.test(cad) || /ccc/.test(cad) || /ddd/.test(cad) || /eee/.test(cad) || /fff/.test(cad) || /ggg/.test(cad) || /hhh/.test(cad) || /iii/.test(cad) || /jjj/.test(cad) || /kkk/.test(cad) || /lll/.test(cad) || /mmm/.test(cad) || /nnn/.test(cad) || /ooo/.test(cad)
				|| /ppp/.test(cad) || /qqq/.test(cad) || /rrr/.test(cad) || /sss/.test(cad) || /ttt/.test(cad) || /uuu/.test(cad) || /vvv/.test(cad) || /www/.test(cad) || /xxx/.test(cad) || /yyy/.test(cad) || /zzz/.test(cad)) {
			showMessage("Nombre incorrecto", null, "Mensaje");
			return false;
		}

		for ( var i = 0; i < cadena.length - 1; i++) {

			if (cadena.substring(i, i + 1).toLowerCase() == cadena.substring(i + 1, i + 2).toLowerCase()) {

				contCaracteresRepetidos++;

				if (contCaracteresRepetidos > 2) {
					showMessage("Entre nombres y apellidos no se pueden repetir mas de 2 veces caracteres seguidos", null, "Mensaje");
					contCaracteresRepetidos = 0;
					return false;
				}

			}

		}

		contCaracteresRepetidos = 0;

		return true;

	}

	function valTelefonoFijo(cadena) {

		if (cadena.length != 9) {
			showMessage("El teléfono fijo debe contener 9 números, verifique que su número incluya el prefijo correspondiente, ej 02", null, "Mensaje");
			return false;
		}

		var regExp = /^[0-9]{1}[2-7]{1}[2-7]{1}[0-9]+$/;

		if (regExp.test(cadena)) {

			if (!/000000/.test(cadena) && !/111111/.test(cadena) && !/222222222/.test(cadena) && !/3333333/.test(cadena) && !/444444/.test(cadena) && !/5555555/.test(cadena) && !/666666/.test(cadena) && !/7777777/.test(cadena) && !/888888/.test(cadena) && !/999999/.test(cadena)) {

				return true;

			} else {

				showMessage("El teléfono fijo no puede tener demasiados números repetidos", null, "Mensaje");
				return false;

			}

		}
		showMessage("El teléfono fijo tiene errores, por favor verifiquelo. Ejemplo: 022123456", null, "Mensaje");
		return false;

	}

	function valTelefonoCelular(cadena) {

		if (cadena.length != 10) {
			showMessage("El teléfono celular debe contener 10 números", null, "Mensaje");
			return false;
		}

		var regExp = /^(09)[3|5|6|7|8|9]{1}[0-9]+$/;

		if (regExp.test(cadena)) {

			if (!/000000/.test(cadena) && !/111111/.test(cadena) && !/222222222/.test(cadena) && !/3333333/.test(cadena) && !/444444/.test(cadena) && !/5555555/.test(cadena) && !/666666/.test(cadena) && !/7777777/.test(cadena) && !/888888/.test(cadena) && !/999999/.test(cadena)) {

				return true;

			} else {

				showMessage("El teléfono celular no puede tener demasiados caracteres repetidos", null, "Mensaje");
				return false;

			}
		}
		showMessage("El teléfono celular tiene errores, por favor verifiquelo. Recuerde que debe empezar con '09'", null, "Mensaje");
		return false;

	}

	function getBirthDate() {
		var dateBirth = new Date();
		var dateBirthTxt = $page.find('#fechaNacimiento').val();
		if ($page.find('#fechaNacimiento').val() != '') {
			dateBirth = new Date(dateBirthTxt.split('/')[2] + '/' + dateBirthTxt.split('/')[1] + '/' + dateBirthTxt.split('/')[0]);
		}
		return dateBirth;
	}

})();