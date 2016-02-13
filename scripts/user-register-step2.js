//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

var $page = $($('script').last()).closest('[data-role="page"]');

var viewModel = {

	facebookData : '',

	retryGetFbData : false,

	user : {
		facebookId : '',
		name : ko.observable(''),
		lastname : ko.observable(''),
		email : ko.observable(''),
		birthdate : '',
		gender : '',
	},

	showPassword : ko.observable(false),

	questions : data.questions(),

	loginFacebook : function() {

		var redirectUrl = 'https://www.facebook.com/connect/login_success.html';
		var url = 'https://graph.facebook.com/oauth/authorize?client_id=636181696450364&redirect_uri=' + redirectUrl;

		window.plugins.childBrowser.showWebPage(url, {
			showLocationBar : true
		});

		window.plugins.childBrowser.onLocationChange = function(loc) {
			if (loc.indexOf(redirectUrl) == 0) {
				var result = unescape(loc).split("#")[1];
				result = unescape(result);
				facebook_access_token = result.split("&")[0].split("=")[1];
				facebook_expires_in = result.split("&")[1].split("=")[1];
				exportarDatosFacebook();
				if (callback && $context != null)
					callback($context);
				if (callback) {
					// alert('si hay callback');
					callback();
				}
				if (close)
					window.plugins.childBrowser.close();
				if (cerrarSesionFacebook) {
					facebook_logout();
				}
				;
			}
		}

	},

	getFacebookData : function() {

		models.CustomerActions.getFacebookData().done(function(response) {
			viewModel.user.facebookId = response.id;
			viewModel.user.name(response.first_name);
			viewModel.user.lastname(response.last_name);
			viewModel.user.email(response.email);
			viewModel.user.birthdate = response.birthday;
			viewModel.user.gender = (response.gender == 'male' ? 'M' : response.gender == 'female' ? 'F' : '');
		}).fail(function(err) {
			showMessageText(showMessageTextClose('Hemos tenido un inconveniente, por favor intentalo mas tarde'));
			console.log(err);
		}).always(function() {
			$.mobile.loading('hide');
		});

	},

	registerUser : function(form) {

		if ($(form).valid()) {

			var formData = $(form).serializeObject();
			var facebookId;
			var gender;
			var birthdate;
			var question;
			var answer;

			if (viewModel.facebookData != '') {
				facebookId = viewModel.user.id;
				birthdate = viewModel.user.birthday;
				gender = viewModel.user.gender;
			}

			if (formData.password != formData.rePassword) {
				showMessageText('Contraseñas no coinciden');
			} else if (formData.email != formData.reEmail) {
				showMessageText('Correos no coinciden');
			} else {

				var thisPass = formData.password;
				if (thisPass.indexOf('&') >= 0 || thisPass.indexOf('%') >= 0 || thisPass.indexOf('=') >= 0 || thisPass.indexOf("'") >= 0) {
					showMessageTextClose('No puedes ingresar contraseñas q contengan "&", "%", " \' " o "="');
					// viewModel.isProcessing(false);
					return;
				}

				var data = {
					facebookId : facebookId,
					userIdType : persona.tipoId,
					userId : persona.id,
					name : formData.name,
					lastname : formData.lastName,
					email : formData.email,
					birthdate : birthdate,
					gender : gender,
					// question : formData.question,
					// answer : formdata.answer,
					password : formData.password
				};

				$.mobile.loading("show", {
					text : "Registrando",
					textVisible : true,
					textonly : false,
					theme : 'b'
				});

				models.CustomerActions.registerUser(data).done(function(response) {

					$.mobile.loading("show", {
						text : "Estimado " + formData.name + ", bienvenido a Fybeca, ahora podras gozar de todos los beneficios de nuestra aplicación",
						textVisible : true,
						textonly : true,
						theme : 'b'
					});

					setTimeout(function() {
						$.mobile.loading("hide");
						$(':mobile-pagecontainer').pagecontainer('change', 'app/views/user-addresses-add.html');
					}, 3500);

					// $(':mobile-pagecontainer').pagecontainer('change',
					// 'app/views/user-addresses-add.html');

				}).fail(function(err) {
					showMessageTextClose(err.response.msgUsr);
				});

			}

		}
	}

};

$page.on('pagebeforecreate', function() {
	ko.applyBindings(viewModel, $page[0]);
}).on('pageshow', function() {

	$('[name="id"]').val(persona.id);
	localStorage.removeItem('fbtoken');
	loadChildBrowser();

});
