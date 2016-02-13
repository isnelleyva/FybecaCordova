(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]'), // Contexto
	viewModel = {
		textToUser : ko.observable(''),

		goToChangeMail : function() {
			models.CustomerActions.getUserSecurityQuestion({
				userId : data.customerTemporalId
			}).done(function(response) {

				data.customerSecurityQuestion = response.descripcion;
				$(':mobile-pagecontainer').pagecontainer('change', 'user-change-email-answer.html');

			}).fail(function() {
				showMessageTextClose('No es posible cambiar el correo con tu usuario, por favor comunicate al 1700-FYBECA (392322) para mas información');
			});
		}
	};

	$page.on('pagebeforecreate', function() {

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);
		var textToShow = pageUrl.param('op') || documentUrl.param('op');

		if (textToShow == 1) {
			viewModel.textToUser('Fybeca te ha enviado una clave temporal a tu correo <span class="highlightedWord">' + data.maskedCustomerMail + '</span>. Si este no es tu correo o por algun motivo ya no puedes acceder al mismo puedes cambiarlo pulsando en "Cambiar".');
		} else if (textToShow == 2) {
			viewModel.textToUser('Fybeca te ha enviado exitosamente un correo electrónico de activación a <span class="highlightedWord">' + data.maskedCustomerMail + '</span>. Si este no es tu correo o por algun motivo ya no puedes acceder al mismo puedes cambiarlo pulsando en "Cambiar".');
		}

	});

})(jQuery);