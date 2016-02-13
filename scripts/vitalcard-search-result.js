//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#vitalcard-search-result');
	var lastCateg = '';
	var lastCity = '';

	$page.on('pageinit', function() {
		loadNetworks = true;
		$page.on('tap', '[data-action]', function() {
			switch ($(this).data('action')) {
			case 'loadEstablishment':
				codeLastNetwork = "-1";
				establishment.id = $(this).data('establishment_id');
				establishment.name = $(this).data('establishment_name');
				establishment.benefits = $(this).data('establishment_benefit');
				establishment.services = $(this).data('establishment_service');
				establishment.logoId = $(this).data('establishment_logo_id');
				loadNetworkVitalcard = true;
				$(':mobile-pagecontainer').pagecontainer('change', 'establishment-detail.html');
				break;
			case 'loadDetail':
				establishment.id = $(this).data('establishment_id');
				establishment.name = $(this).data('establishment_name');
				establishment.benefits = $(this).data('establishment_benefit');
				establishment.services = $(this).data('establishment_service');
				establishment.logoId = $(this).data('establishment_logo_id');
				$(':mobile-pagecontainer').pagecontainer('change', 'vitalcard-search-result-map.html');
				break;

			case 'show-more':

				loadNetworks = true;
				loadEstablishments();
				break;

			}

		});

	})

	.on('pageshow', function() {

		data.urlToReturnFromVitalcardSearchMap = 'vitalcard-search-result.html';

		if (lastCateg != categoryCode || lastCity != cityCode) {

			$page.find('#establishmentsList').empty();
			lastCateg = categoryCode;
			lastCity = cityCode;

		}

		if (loadNetworks)
			loadEstablishments();
	});

	function loadImages(imgCode, imgElement) {

		if (imgCode == '-1') {
			$page.find("#" + imgElement).empty();
			$page.find("#" + imgElement).append('<img style="width: 60px; position: absolute;" src="themes/default/images2/noLogoNetwork.png"/>');

		} else {

			invokeService({
				url : svb,
				service : 'commerce',
				dataType : 'jsonp',
				data : {
					logoId : imgCode
				},
				cache : {
					time : GetLogoImageCacheTimeout
				},
				success : function(response) {

					try {
						setTimeout(function() {
							$page.find("#" + imgElement).empty();
							$page.find("#" + imgElement).append('<img style="width: 60px; position: absolute;" src="data: ' + response.mimeType + ';base64,' + response.imageString + '" />');
							$.mobile.loading('hide');
						}, 100);
					} catch (err) {

						$.mobile.loading('hide');
						console.log(err.message);
						console.log(err.stack);

					}

				},
				error : function() {
					showMessage(defaultErrorMsg, null, null);
					$.mobile.loading('hide');
				}

			});
		}
	}

	function loadEstablishments() {

		$.mobile.loading('show', {
			text : 'Cargando',
			textVisible : true,
			theme : 'b'
		});
		var resetList = false;
		if (codeLastNetwork == "-1") {
			resetList = true;
		}
		$page.find('#btnLoad').parents('li').remove();
		invokeService({
			url : svb,
			service : 'commerce',
			dataType : 'jsonp',
			data : {
				codeCity : cityCode,
				codeCategory : categoryCode,
				codeLastNetwork : codeLastNetwork
			},
			cache : {
				key : cityCode + '_' + categoryCode + '_' + codeLastNetwork,
				time : establishmentsFilterCacheTimeout
			},

			success : function(response) {

				try {

					var list = [];
					if (response.length > 0) {

						$.each(response, function() {

							codeLastNetwork = this.codigo;

//							list.push('<li data-icon="false"><a href="#" data-action="loadEstablishment" data-establishment_id="' + this.codigo + '" data-establishment_name="' + this.nombre + '" data-establishment_benefit="' + this.beneficios + '" data-establishment_service="' + this.servicios
//									+ '" data-establishment_logo_id="' + this.logoId + '" data-icon="false">' + '<div id="' + this.codigo + 'Img" style="position: absolute;margin-left: -10px;">'
//									+ ((this.logoId == -1) ? '<img style="width: 60px; position: absolute;" src="themes/default/images2/noLogoNetwork.png"/>' : '') + '</div>' + '<h3 style="margin-left: 55px;margin-top: -5px;">' + this.nombre + '</h3>'
//									+ '<p style="white-space: initial;text-align: justify; margin-left: 55px;">' + ((this.beneficios != undefined) ? this.beneficios.substring(0, 75) + '...' : '') + '</p>'
//									+ '</a><a id="btn" data-theme="a" data-action="loadDetail" data-role="button" data-establishment_id="' + this.codigo + '" data-establishment_name="' + this.nombre + '" data-establishment_benefit="' + this.beneficios + '" data-establishment_service="'
//									+ this.servicios + '" data-establishment_logo_id="' + this.logoId + '" data-rel="popup" data-position-to="window" data-transition="pop">Ver mas</a></li>');
//
//							list.push(+'<a id="btn" data-theme="a" data-action="loadDetail" data-role="button" data-establishment_id="' + this.codigo + '" data-establishment_name="' + this.nombre + '" data-establishment_benefit="' + this.beneficios + '" data-establishment_service="'
//									+ this.servicios + '" data-establishment_logo_id="' + this.logoId + '" data-rel="popup" data-position-to="window" data-transition="pop">Ver mas');

							var newLi = '<li>';
							newLi += '<a href="#" data-action="loadEstablishment" data-establishment_id="' + this.codigo + '" data-establishment_name="' + this.nombre + '" data-establishment_benefit="' + this.beneficios + '" data-establishment_service="' + this.servicios
									+ '" data-establishment_logo_id="' + this.logoId + '" data-icon="false">';
							newLi += '<div id="' + this.codigo + 'Img" style="position: absolute;margin-left: -10px;">';
							newLi += ((this.logoId == -1) ? '<img style="width: 60px; position: absolute;" src="themes/default/images2/noLogoNetwork.png"/>' : '');
							newLi += '</div>';
							newLi += '<h3 style="margin-left: 55px;margin-top: -5px;">';
							newLi += this.nombre;
							newLi += '</h3>';
							newLi += '<p style="white-space: initial;text-align: justify; margin-left: 55px;">';
							newLi += ((this.beneficios != undefined) ? this.beneficios.substring(0, 75) + '...' : '');
							newLi += '</p>';
							//newLi += '</a>';
//							newLi += '';
//							newLi += '';
//							newLi += '';
//							newLi += '';
//							newLi += '';
//							newLi += '';
							newLi += '</a>';
							newLi += '</li>';

//							var newLi = '';
//							newLi += '<li>';
//							newLi += '<a href="#">';
//							newLi += '<img src="themes/default/images2/noLogoNetwork.png">';
//							newLi += '<h2>' + this.nombre + '</h2>';
//							newLi += '<p>' + ((this.beneficios != undefined) ? this.beneficios.substring(0, 75) + '...' : '') + '</p>';
//							newLi += '</a>';
//							newLi += '</li>';
							list.push(newLi);

							loadImages(this.logoId.toString(), this.codigo + 'Img');

						});

						if (response.length >= 5)
							list.push('<li data-icon="plus" style="text-align: center"><a data-role="button" data-action="show-more" id="btnLoad">Cargar más Cadenas</a></li>');

						if (resetList)
							$page.find('#establishmentsList').html(list.join('')).listview('refresh');
						else
							$page.find('#establishmentsList').append(list.join('')).listview('refresh');

					} else {
						if (resetList) {
							list.push('<li style="background-color: rgba(255, 255, 255, 0.9) !important; color: #333 !important;">No se han encontrado resultados</li>');
							$page.find('#establishmentsList').html(list.join('')).listview('refresh');
						}
					}
					loadNetworks = false;

					$('html,body').animate({
						scrollTop : $(document).height()
					}, 2000);

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
	}

})();