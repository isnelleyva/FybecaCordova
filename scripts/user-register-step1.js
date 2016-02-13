//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

var $page = $($('script').last()).closest('[data-role="page"]');
var viewModel = {

	idType : ko.observable('C'),

	isProcessing : ko.observable(false),

	getUserType : function(form) {

		if ($(form).valid()) {

			var formData = $(form).serializeObject();

			try {
				formData.txtId = formData.txtId.replace(/ /g, '');
				$('[name="txtId"]').val(formData.txtId);
			} catch (e) {
			}

			if (formData.txtId.length < 8) {
				showMessageText('Identificación debe tener por lo menos 8 caracteres');
				return false;
			}

			if (!checkOnlyLettersAndNumbers(formData.txtId, 'Identificación')) {
				return false;
			}

			viewModel.isProcessing(true);
			$.mobile.loading("show", {
				text : 'Consultando',
				textVisible : true,
				theme : 'b'
			});

			persona.id = formData.txtId;

			models.CustomerActions.getUserType({
				id : formData.txtId,
				idType : viewModel.idType()
			}).done(function(response) {
				if (response.estado == 4) {
					persona.id = formData.txtId;
					$(':mobile-pagecontainer').pagecontainer('change', 'user-register-step2.html');
				} else if (response.estado == 1) {
					showMessage('Estimado usuario, usted esta ya registrado en nuestro sistema, si no recuerda su contraseña pulse en Olvidó su contraseña', null, 'Fybeca');
					$(':mobile-pagecontainer').pagecontainer('change', 'user-login.html', {
						reverse : true
					});
				} else if (response.estado == 2) {
					showMessage('Estimado usuario, Fybeca le ha enviado un correo a ' + response.email + ' con una contraseña temporal para que pueda iniciar sesión en la aplicación. Si su email no es correcto favor llamar al 1700-FYBECA (392322) y actualice sus datos.', null, 'Fybeca');
					$(':mobile-pagecontainer').pagecontainer('change', 'user-login.html', {
						reverse : true
					});

				} else if (response.estado == 3) {
					showMessage('Estimado usuario para registrarse se requiere que Ud. actualice sus datos llamando a 1700-FYBECA (392322)', null, null);
					$(':mobile-pagecontainer').pagecontainer('change', 'user-login.html', {
						reverse : true
					});
				} else {
					showMessage(errorMessage, null, 'Fybeca');
				}
				$.mobile.loading('hide');

			}).fail(function() {
				// showMessage(errorMessage, null, 'Fybeca');
			}).always(function() {
				viewModel.isProcessing(false);
				$.mobile.loading('hide');
			});

		}

	},

	checkInputId : function() {
	}

}

$page.on('pagebeforecreate', function() {
	ko.applyBindings(viewModel, $page[0]);
	try {
		models.CustomerActions.facebookLogout();
	} catch (e) {
	}
}).on('pageshow', function() {

});