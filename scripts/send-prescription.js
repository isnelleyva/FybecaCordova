//  Created by BAYTEQ on 13/08/12.
//  Copyright � 2013 BAYTEQ. All rights reserved.

(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]');

	var viewModel = {

		to : defaultEmail,

		photo64 : ko.observable(''),

		photoMail : ko.observable(''),

		subject : 'Enviar receta',

		idType : ko.observable('C'),

		cities : ko.observableArray([]),

		takePicture : function() {

			var destinationType;

			try {
				switch (device.platform) {
				default:
				case 'Android':
					destinationType = Camera.DestinationType.FILE_URI;
					break;
				case 'iPhone':
				case 'iPad':
				case 'iPod touch':
				case 'iOS':
					destinationType = Camera.DestinationType.DATA_URL;
					break;
				}
			} catch (err) {
				destinationType = Camera.DestinationType.FILE_URI;
			}

			try {

				navigator.camera.getPicture(viewModel.takePictureSuccess, viewModel.takePictureError,
					{
						quality : 10,
						correctOrientation: true,
						encodingType: Camera.EncodingType.JPEG,
						destinationType : destinationType
					}
				);

			} catch (e) {
				console.log(e);
				alert(e);
			}

		},

		takePictureSuccess : function(imageData) {
			try {
				var thisImage = device.platform == 'Android' ? imageData : 'data:image/jpeg;base64,' + imageData
			} catch (e) {

			}
			viewModel.photo64(thisImage);
			viewModel.photoMail(imageData);
		},

		takePictureError : function(message) {
			alert('Error obteniendo foto: ' + message)
		},

		sendPrescription : function(form) {

			if ($(form).valid()) {

				var formData = $(form).serializeObject();

				if (viewModel.valCedula(formData.id) && viewModel.valPhone(formData.phone)) {

					var body = 'Estimados / as' + "\n" + 'Sres. Fybeca - Servicio a Domicilio' + "\n" + "\n" + 'El  Cliente  Sr (a) ' + formData.name + ' (' + formData.city + ') con ' + ((viewModel.idType() == 'C') ? 'cédula' : 'pasaporte') + ' No. '
							+ formData.id + ', requiere ser atendido con su receta adjunta. Comunicarse al teléfono  # ' + formData.phone;
					viewModel.sendEmail({
						to : viewModel.to,
						subject : viewModel.subject,
						body : body,
						image : viewModel.photo64()
					});

				}

			}

		},

		sendEmail : function(data) {

			try {

				cordova.plugins.email.open({
					to:      data.to, 		//'isnel.leyva.h@gmail.com',
					subject: data.subject,
					body:    data.body,
					attachments: data.image
					},
					function(sent){
						console.log(sent);
						if (sent=='OK'){
							viewModel.resetForm();
							console.log('Email sent');
						}else{
							console.log('Email cancelled');
							showMessage('Fallo en el envio de la receta', null, 'Mensaje');
						}
					}, this
				);
				/*
				switch (device.platform) {
				case 'Android':
					var extras = {};
					extras[webintent.EXTRA_SUBJECT] = data.subject;
					extras[webintent.EXTRA_EMAIL] = data.to;
					extras[webintent.EXTRA_TEXT] = data.body;
					extras[webintent.EXTRA_STREAM] = data.image;

					window.webintent.startActivity({
						action : webintent.ACTION_SEND,
						type : 'text/plain',
						extras : extras
					}, function() {
						viewModel.resetForm();
					}, function() {
						showMessage('Fallo en el envio de la receta', null, 'Mensaje');
					});
					break;
				case 'iPhone':
				case 'iPad':
				case 'iPod touch':
				case 'iOS':
					var args = {};
					args.toRecipients = data.to;
					args.subject = data.subject;
					args.body = data.body;
					args.image = data.image;
					cordova.exec(null, null, "EmailComposer", "showEmailComposer", [ args ]);
					viewModel.resetForm();
					break;
				case 'BlackBerry':
					// TODO
					break;
				}*/
			} catch (err) {
				console.log(err.message);
				console.log(err.stack);
			}

		},

		resetForm : function() {

			try {
				/*$page.find('#send-prescription').each(function() {
					this.reset();
				});
				$page.find('[name="city"]').selectmenu('refresh');
				$page.find('#picture-holder').html('');*/

				viewModel.photo64('');
				$('#id-form-send-pre')[0].reset();

				// fillFields();

				console.log('Form clean');

			} catch (err) {
				console.log(err.message);
				console.log(err.stack);
			}

		},

		loadCities : function() {

			try {
				invokeService({
					url : svb,
					service : "Pharmacies",
					dataType : 'jsonp',
					data : {

					},
					cache : {
						key : parameters.codigoAplicacion,
						time : obtenerCiudadesEventoCacheTimeout
					},

					success : function(data) {
						$.each(data, function() {
							try {
								viewModel.cities.push({
									cityId : this.Code,
									cityName : this.Name.substring(0, 1) + this.Name.substring(1).toLowerCase()
								});
							} catch (e) {
								// TODO: handle exception
							}

						});

						$.mobile.loading('hide');

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

		},

		valCedula : function(id) {

			var total = 0;

			for (var i = 0; i < 9; i++) {
				var currD = parseInt(id.substring(i, i + 1));
				total += (i % 2 == 0) ? ((currD * 2 > 9) ? currD * 2 - 9 : currD * 2) : (parseInt(id.substring(i, i + 1)));
			}

			total = total % 10;
			total = (total == 0) ? 0 : 10 - total;

			if (total == id.substring(id.length - 1, id.length)) {
				return true;
			} else {
				showMessage("La cédula ingresada no es válida", null, "Mensaje");
				return false;
			}

		},

		valPhone : function(phone) {

			var regExpFijo = /^[0-9]{1}[2-7]{1}[2-7]{1}[0-9]+$/;
			var regExpCelular = /^(09)[3|5|6|7|8|9]{1}[0-9]+$/;

			if (!/000000/.test(phone) && !/111111/.test(phone) && !/222222222/.test(phone) && !/3333333/.test(phone) && !/444444/.test(phone) && !/5555555/.test(phone) && !/666666/.test(phone) && !/7777777/.test(phone) && !/888888/.test(phone)
					&& !/999999/.test(phone)) {

				if (regExpFijo.test(phone)) {

					if (phone.length == 9) {

						return true;

					} else {

						showMessage("El teléfono fijo debe contener 9 números, verifique que su número incluya el prefijo correspondiente, ej 02", null, "Mensaje");

					}

				} else if (regExpCelular.test(phone)) {

					if (phone.length == 10) {

						return true;

					} else {

						showMessage('El teléfono celular debe tener 10 números');

					}

				} else {

					showMessage('El teléfono celular ingresado es incorrecto, recuerde que este debe empezar con 09');

				}

			} else {

				showMessage("El teléfono no puede tener demasiados números repetidos", null, "Mensaje");
				return false;

			}

		}

	};

	$page.on('pagebeforecreate', function() {
		ko.applyBindings(viewModel, $page[0]);
		viewModel.loadCities();
	}).on('pageshow', function() {

		if (isAuth()) {

			$page.find('[name="name"]').val(localStorage.getItem('nombrePersona'));
			$page.find('[name="id"]').val(localStorage.getItem('idPersona'));
			var tipoId = localStorage.getItem('tipoId');

			viewModel.idType(tipoId == 'P' ? 'P' : 'C');

			if (tipoId == 'pasaporte') {
				$page.find("input[value='cedula']").attr("checked", false).checkboxradio("refresh");
				$page.find("input[value='pasaporte']").attr("checked", true).checkboxradio("refresh");
				$page.find('[name="id"]').get(0).type = 'text';
				$page.find('[name="id"]').get(0).placeholder = 'Pasaporte';
			} else if (tipoId == 'cedula') {
				$page.find("input[value='cedula']").attr("checked", true).checkboxradio("refresh");
				$page.find("input[value='pasaporte']").attr("checked", false).checkboxradio("refresh");
				$page.find('[name="id"]').get(0).type = 'tel';
				$page.find('[name="id"]').get(0).placeholder = 'Cedula';
			}

		}

	});

})(jQuery);