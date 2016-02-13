(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]'), // Contexto
	viewModel = {

		securityQuestion : ko.observable(''),

		correctAnswer : ko.observable(false),

		checkAnswer : function() {
			if ($('#txtAnswer').val() != '') {

				$.mobile.loading('show', {
					text : 'Procesando',
					textVisible : true,
					theme : 'b'
				});

				models.CustomerActions.checkIfIsCorrectAnswer({
					userId : data.customerTemporalId,
					answer : $('#txtAnswer').val()
				}).done(function(response) {
					$.mobile.loading('hide');
					if (response) {
						viewModel.correctAnswer(true);
					} else {
						showMessageTextClose('Lo sentimos, has ingresado una respuesta incorrecta');
					}
				}).fail(function() {
					$.mobile.loading('hide');
					showMessageTextClose('No es posible cambiar el correo con tu usuario, por favor comunicate al 1700-FYBECA (392322) para mas información');
				});
			} else {
				showMessageText('Ingresa correctamente tu respuesta');
			}
		},

		changeEmail : function() {
			debugger;
			if ($('#txtAnswer').val() != '' && $('#txtEmail').val() != '') {
				models.CustomerActions.changeEmail({
					userId : data.customerTemporalId,
					answer : $('#txtAnswer').val(),
					email : $('#txtEmail').val(),
				}).done(function(response) {
					debugger;
					showMessageTextClose('Se ha cambiado correctamente tu correo, ahora puedes hacer llegar tu nueva contraseña a este correo');
					setTimeout(function() {
						$(':mobile-pagecontainer').pagecontainer('change', '../../index.html');
					}, 4000);

				}).fail(function() {
					showMessageTextClose('No es posible cambiar el correo con tu usuario, por favor comunicate al 1700-FYBECA (392322) para mas información');
				});
			} else {
				showMessageText('Llena correctamente los campos');
			}
		}
	};

	$page.on('pagebeforecreate', function() {

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {

		viewModel.securityQuestion(data.customerSecurityQuestion);

	});

})(jQuery);