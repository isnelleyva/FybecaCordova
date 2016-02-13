//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#explore-my-benefits');
	var lastId = '';

	$page.on('pageinit', function() {
		try {
			if (!isAuth()) {
				$(':mobile-pagecontainer').pagecontainer('change', 'medication-clubs.html', {
					changeHash : false
				});
				return;
			}
			$.event.special.tap.tapholdThreshold = 1000;
			$page.on('tap', '[data-action]:not(form)', function(e) {
				e.preventDefault();
				switch ($(this).data('action')) {
				case 'pulsado':
					club_name = $(this).data("club-name");
					club_id = $(this).data("club-id");
					myClubOption = $(this).data("club-action");
					$.mobile.changePage('show-benefits-per-person.html');
					clear_club_search = true;
					break;
				case 'noSuscrito':
					showMessage('Usted no esta suscrito a ' + $(this).data("club-name"), null, 'Mensaje')
					break;
				case 'backh':

					if (data.urlToReturnFromClubs == '') {
						data.urlToReturnFromClubs = 'index.html#menu-offers';
					}

					// if (returnToVitalcardPage) {
					$(':mobile-pagecontainer').pagecontainer('change', data.urlToReturnFromClubs, {
						reverse : true
					});
					// } else {
					// $(':mobile-pagecontainer').pagecontainer('change',
					// 'index.html#menu-offers', {
					// reverse : true
					// });
					// }
					break;

				}
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}

	}).on('pagebeforeshow', function() {

		// try {
		// var body = document.body, html = document.documentElement;
		// var height = Math.max(body.scrollHeight, body.offsetHeight,
		// html.clientHeight, html.scrollHeight, html.offsetHeight);
		// //var listHeight = parseInt($('#benefits-list').css('height'));
		// var listHeight = 426;
		// if (height > listHeight) {
		// $('#benefits-list').css('margin-top', (height - listHeight) / 2 -
		// 45);
		// }
		// } catch (e) {
		// console.log(e);
		//		}

	}).on('pageshow', function() {

		try {
			if ($.mobile.urlHistory.stack[$.mobile.urlHistory.stack.length - 2].pageUrl == 'menu-offers') {
				returnToVitalcardPage = false;
			} else if ($.mobile.urlHistory.stack[$.mobile.urlHistory.stack.length - 2].pageUrl == 'menu-vitalcard') {
				returnToVitalcardPage = true;
			}

		} catch (err) {
			returnToVitalcardPage = true;
		}

		try {
			if (isAuth()) {
				if (lastId != localStorage.getItem('codigoPersona')) {
					vaciar();
					loadBenefits();
				}
			} else {
				$(':mobile-pagecontainer').pagecontainer('change', 'medication-clubs.html', {
					changeHash : false
				});
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	});

	function vaciar() {

		var list = [];
		list.push('<div style="position:relative;" class="clubButton"><a data-action="cargando" data-role="button" data-club-id="2" data-club-name="CLUB PMC"  data-shadow="false"><img  src="themes/default/images2/clubs/pmc.png" style="width:90%; max-width:320px;"></img></a></div>');
		list.push('<div style="position:relative;" class="clubButton"><a data-action="cargando" data-role="button" data-club-name="CLUB AÑOS DORADOS" data-shadow="false"><img  src="themes/default/images2/clubs/aniosDorados.png" style="width:90%; max-width:320px;"/></a></div>');
		list.push('<div style="position:relative;" class="clubButton"><a data-action="cargando" data-role="button" data-club-id="1" data-club-name="CLUB BBITOS" data-shadow="false"><img  src="themes/default/images2/clubs/bbitos.png" style="width:90%; max-width:320px;"></img></a></div>');
		list.push('<div style="position:relative;" class="clubButton"><a data-action="cargando" data-role="button" data-club-id="8" data-club-name="CLUB DE LA BELLEZA" data-shadow="false"><img  src="themes/default/images2/clubs/beauty.png" style="width:90%; max-width:320px;"></img></a></div>');
		$page.find('#benefits-list').html(list.join(''));
		$page.find('#benefits-list a').button();

	}

	function loadBenefits() {
		try {

			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});

			var clubsExistentes = [ 'CLUB AÑOS DORADOS', 'CLUB BBITOS', 'CLUB PMC', 'CLUB DE LA BELLEZA' ];
			var codigosClub = [ '7', '1', '2', '8' ];

			// invokeAjaxService({
			invokeService({
				url : svf,
				service : "obtenerClubesMisBeneficios",
				dataType : 'jsonp',
				data : {
					codigoPersona : localStorage.getItem("codigoPersona"),
					codigoAplicacion : parameters.codigoAplicacion
				},
				cache : {
					key : localStorage.getItem("codigoPersona"),
					time : obtenerClubesMisBeneficiosCacheTimeout
				},

				success : function(data) {

					lastId = localStorage.getItem('codigoPersona');

					var bottom = (navigator.userAgent.indexOf('iPhone') > -1) ? '-5' : '0';

					if (data.length > 0) {

						var list = [];
						var clubsTrue = [];
						var auxBandera = 1;
						var block;
						listAux = [];

						$
								.each(
										data,
										function() {
											if (auxBandera == 1) {
												auxBandera += 1;
												block = 'a';
											} else {
												auxBandera -= 1;
												block = 'b';
											}

											nombreClub = this["nombreClub"];
											clubsTrue.push(nombreClub);
											items = this["items"];
											codigoClub = this["codigoClub"];

											var src = (nombreClub == 'CLUB BBITOS') ? 'bbitos' : (nombreClub == 'CLUB AÑOS DORADOS') ? 'aniosDorados' : (nombreClub == 'CLUB PMC') ? 'pmc' : 'beauty';
											var dataAct = (items.length > 0) ? 'normal' : 'noItems';

											list.push('<div style="position:relative;" class="clubButton"><a data-role="button" data-action="pulsado" data-club-action="' + dataAct + '" data-club-id="' + codigoClub + '" data-club-name="' + nombreClub
													+ '" data-shadow="false"><img  src="themes/default/images2/clubs/' + src + '.png" style="width:90%; max-width:320px;" /></a>' + ((items.length > 0) ? ('<div class="notification">' + items.length + '</div>') : '') + '</div>');

											var aux = codigoClub;

											if (items.length > 0) {
												for ( var i = 0; i < items.length; i++) {
													if (nombreClub == 'CLUB AÑOS DORADOS') {
														aux += '<li class="capitalized ui-nodisc-icon ui-alt-icon" data-aux="a" data-icon="carat-d" style="margin-left: 0px" ontouchstart="switchIcon(this)"><img src="themes/default/images2/icons/gift1.png" alt="France" class="ui-li-icon"><a data-action="toggle-detail" style="padding: .7em 5px"><label for="name" style="margin-left: 28px; white-space: normal; max-width: 230px; display: block;">'
																+ items[i].presentacionItemRegalo + '</label></a></li>';
														aux += '<li class="detail" style="display:none; background-color: cornsilk;"><div style="margin-left: 20px;"><p style="white-space: normal;">Por la compra de este producto reciba el ' + items[i].porcentajeDescuento
																+ '% de descuento</p></div></li>';
													} else {
														aux += '<li class="capitalized" data-aux="a" data-icon="carat-d" style="margin-left: 0px" onclick="switchIcon(this)"><img src="themes/default/images2/icons/gift1.png" alt="France" class="ui-li-icon"><a data-action="toggle-detail" style="padding: .7em 5px"><label for="name" style="margin-left: 28px; white-space: normal; max-width: 230px; display: block;">'
																+ items[i].presentacionItem + '</label></a></li>';
														var texto = '';

														var plurPenCaj = (items[i].pendienteCajas == 1) ? '' : 's';
														var plurPenSue = (items[i].pendienteSueltas == 1) ? '' : (items[i].formaPresentacion == 'UNIDAD') ? 'es' : 's';
														var plurFalCaj = (items[i].faltaParaBonificarCajas == 1) ? '' : 's';
														var plurFalSue = (items[i].faltaParaBonificarSueltas == 1) ? '' : (items[i].formaPresentacion == 'UNIDAD') ? 'es' : 's';

														if (items[i].unidadItem == 1) {
															texto = 'Usted tiene acumulado ' + items[i].pendienteCajas + ' ' + items[i].formaPresentacion.toLowerCase() + (items[i].formaPresentacion == 'PAQUETES' ? '' : plurPenCaj) + ', si compra ' + items[i].faltaParaBonificarCajas + ' '
																	+ items[i].formaPresentacion.toLowerCase() + (items[i].formaPresentacion == 'PAQUETES' ? '' : plurFalCaj) + ' más ganará <b>' + items[i].descripcionRegalo.toLowerCase() + '</b>';
														} else {
															var txtFaltaCajas = (items[i].faltaParaBonificarCajas > 0) ? ' ' + items[i].faltaParaBonificarCajas + ' caja' + plurFalCaj : '';
															var txtFaltaSueltas = (items[i].faltaParaBonificarSueltas > 0) ? ((items[i].faltaParaBonificarCajas == 0) ? ' ' : ' y ') + items[i].faltaParaBonificarSueltas + ' unidad' + plurFalSue : '';
															texto = 'Usted tiene acumulado ' + items[i].pendienteCajas + ' caja' + plurPenCaj + ' y ' + items[i].pendienteSueltas + ' ' + items[i].formaPresentacion.toLowerCase() + plurPenSue + ', si compra' + txtFaltaCajas + txtFaltaSueltas
																	+ ' más ganará <b>' + items[i].descripcionRegalo.toLowerCase() + '</b>';
														}
														;
														aux += '<li class="detail" style="display:none; background-color: cornsilk;"><div style="margin-left: 20px;"><p style="white-space: normal;">' + texto + '</p></div></li>';

													}

												}

												listAux.push(aux);

											}

										});

						for ( var i = 0; i < clubsExistentes.length; i++) {

							var bandera = false;

							for ( var j = 0; j < clubsTrue.length; j++) {

								if (clubsExistentes[i] == clubsTrue[j]) {

									bandera = true;

								}

							}

							if (!bandera) {

								var src = (clubsExistentes[i] == 'CLUB BBITOS') ? 'bbitos' : (clubsExistentes[i] == 'CLUB AÑOS DORADOS') ? 'aniosDorados' : (clubsExistentes[i] == 'CLUB PMC') ? 'pmc' : 'beauty';
								list.push('<div style="position:relative;"  class="clubButton"><a data-action="pulsado" data-club-action="noSuscrito" data-club-name="' + clubsExistentes[i] + '" data-club-id="' + codigosClub[i]
										+ '" data-role="button" data-shadow="false"><img  src="themes/default/images2/clubs/' + src + '.png" style="width:90%; max-width:320px;" /></a></div>');

							}

						}

						$page.find('#benefits-list').html(list.join(''));
						$page.find('#benefits-list a').button();
					} else {

						var list = [];

						for ( var i = 0; i < clubsExistentes.length; i++) {

							var src = (clubsExistentes[i] == 'CLUB BBITOS') ? 'bbitos' : (clubsExistentes[i] == 'CLUB AÑOS DORADOS') ? 'aniosDorados' : (clubsExistentes[i] == 'CLUB PMC') ? 'pmc' : 'beauty';
							list.push('<div style="position:relative;"  class="clubButton"><a data-action="pulsado" data-club-action="noSuscrito" data-club-name="' + clubsExistentes[i] + '" data-club-id="' + codigosClub[i]
									+ '" data-role="button" data-shadow="false"><img  src="themes/default/images2/clubs/' + src + '.png" style="width:90%; max-width:320px;" /></a></div>');

						}

						$page.find('#benefits-list').html(list.join(''));
						$page.find('#benefits-list a').button();

					}

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