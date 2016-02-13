//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#establishment-detail');
	$page

	.on('pageinit', function() {
		loadChildBrowser();
		try {
			$page.find('#share').on('click', function() {
				try {
					if (navigator.network.connection.type != Connection.NONE) {
						$page.find('#shareMenu').popup('open');
					} else {
						ShowMessageInternetNotAvailable();
					}
				} catch (e) {
					$page.find('#shareMenu').popup('open');
				}

			});
			$page.find('#share1').on('click', function() {

				try {
					if (navigator.network.connection.type != Connection.NONE) {
						$page.find('#shareMenu').popup('open');
					} else {
						ShowMessageInternetNotAvailable();
					}
				} catch (e) {
					$page.find('#shareMenu').popup('open');
				}

			});

			$page.find('#btnTwitter').click(function() {
				var tweetText = $page.find(".field_name").html() + ', ' + $page.find(".field_benefits").html();
				tweetText = (tweetText.length > 125) ? tweetText.substring(0, 125) + '...' : tweetText;

				tweet({
					text : tweetText,
					via : "fybeca",
					url : "www.fybeca.com"
				});
				$page.find('#shareMenu').popup('close');
			});
			$page.find('#btnFacebook').click(function() {
				facebook_post_parameters.link = networkShareUrlBase + '?code=' + establishment.id;
				facebook_post_parameters.picture = facebook_default_image_red_vc;
				facebook_post_parameters.caption = $page.find(".field_benefits").html();
				facebook_post_parameters.name = 'Fybeca - ' + $page.find(".field_name").html();
				facebook_post_parameters.description = '';

				if (!facebook_access_token) {
					facebook_auth(function() {
						window.plugins.childBrowser.close();
						setTimeout(function() {
							facebook_post();
						}, 500);
					});

				} else {
					facebook_post();
					exportarDatosFacebook();
				}
				$page.find('#shareMenu').popup('close');
			});
			$page.find('#btnGoogle').click(function() {
				if (!google_access_token) {
					google_auth(function() {
						window.plugins.childBrowser.close();
						setTimeout(function() {
							gplus_post({
								url : networkShareUrlBase + '?code=' + establishment.id
							});
						}, 500);
					});

				} else {
					getGoogleData();
					gplus_post({
						url : networkShareUrlBase + '?code=' + establishment.id
					});
				}
				$page.find('#shareMenu').popup('close');
			});

		} catch (err) {
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}
	})

	.on('pageshow', function() {

		data.urlToReturnFromVitalcardSearchMap = 'establishment-detail.html';

		$page.find('#share').text('Compartir');
		$page.find('#share1').text('Compartir');
		vaciar();
		if (loadNetworkVitalcard) {
			$page.find('#see-establishments').text('Ver locales');
			$page.find('#see-establishments').show();
			$page.find('#share').show();
			$page.find('#share1').hide();
		} else {
			$page.find('#see-establishments').hide();
			$page.find('#share').hide();
			$page.find('#share1').show();
		}
		$page.find('#share').text('Compartir');
		try {
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
			if (!loadNetworkVitalcard) {
				loadDetailEstablishment();
			} else {
				loadDetailNetwork();
			}

			loadImage();
		} catch (err) {
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}
	});

	function loadImage() {

		if (establishment.logoId == '-1') {
			$page.find("#imagen").empty();
			$page.find("#imagen").append('<img style="width: 100px;top: 6px;left: 5px;" src="themes/default/images2/noLogoNetwork.png"/>');

		} else {

			invokeService({
				url : svb,
				service : 'commerce',
				dataType : 'jsonp',
				data : {
					logoId : establishment.logoId
				},
				cache : {
					key : establishment.logoId,
					time : establishmentsDetailCacheTimeout
				},

				success : function(response) {

					$page.find("#imagen").empty();
					$page.find("#imagen").append('<img style="width: 100px;top: 6px;left: 5px;" src="data: ' + response.mimeType + ';base64,' + response.imageString + '"/>');
					$.mobile.loading('hide');

				},
				error : function() {
					$page.find("#imagen").empty();
					$page.find("#imagen").append('<img style="width: 100px;top: 6px;left: 5px;" src="themes/default/images2/noLogoNetwork.png"/>');
					$.mobile.loading('hide');
				}

			});

		}

	}

	function vaciar() {

		$page.find(".field_name").html('');
		$page.find(".field_address").html('');
		$page.find(".field_phones").html('');
		$page.find(".field_benefits").html('');
		$page.find(".field_hours").html('');
		$page.find(".field_services").html('');

	}

	function loadDetailEstablishment() {
		try {

			$page.find('#h3Tel').show();
			$page.find('.field_phones').show();
			
			$.mobile.loading("show", {
				text : "Cargando",
				textVisible : true,
				textonly : false,
				theme : 'b'
			});

			invokeService({
				url : svb,
				service : "commerce",
				dataType : 'jsonp',
				data : {
					code : establishment.id,
					latitude : '-1',
					longitude : '-1'
				},
				cache : {
					key : establishment.id,
					time : establishmentsDetailCacheTimeout
				},

				success : function(response) {

					if (response.telefonos != undefined) {

						var phones = response.telefonos.split('/');
						var phonesHTML = [];
						$.each(phones, function() {
							var number = $.trim(this);
							phonesHTML.push('<a href="tel:' + number + '">' + number + '</a>');
						});

					}

					$page.find(".field_name").html(response.nombre);
					$page.find(".field_address").html(response.direccion);
					$page.find(".field_phones").html(phonesHTML.join(' - '));
					$page.find(".field_benefits").html(response.beneficios);
					$page.find(".field_hours").html(response.horarios);
					$page.find(".field_services").html(response.servicios);

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
	}

	function loadDetailNetwork() {
		try {

			$page.find('#h3Tel').hide();
			$page.find('.field_phones').hide();

			invokeService({
				url : svb,
				service : "Commerce",
				dataType : 'jsonp',
				data : {
					code : establishment.id,
				},
				cache : {
					key : establishment.id,
					time : establishmentsDetailCacheTimeout
				},

				success : function(response) {

					$page.find(".field_name").html(response.nombre);
					$page.find(".field_benefits").html(response.beneficios);
					$page.find(".field_services").html(response.servicios);

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
	}

})();