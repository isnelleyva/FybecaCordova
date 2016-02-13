//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var lastProductId = '0';
	var $page = $('#search-on-club-items'), timer;
	$page.on('pageinit', function(e, data) {
		$('#btnCargar').hide();
		$('input[data-type="search-list"]').trigger("change");
		$page.find('[data-type="search"]').on('keypress change', function() {
			$self = $(this);
			clearTimeout(timer);
			timer = setTimeout(function() {
				searchProducts($self.val());
			}, 300);
		});
		$page.find('#search-list').listview('option', 'filterCallback', function(text, search) {
			return false;
		});

		$page.on('tap', '[data-action="toggle-detail"]', function() {
			if ($(this).parents('li').next().is(":visible")) {
				$(this).parents('li').next().slideToggle();
			} else {
				$page.find('.detail').slideUp();
				$(this).parents('li').next().slideToggle();
				var offs = $(this).offset().top;
				$('html,body').animate({
					scrollTop : offs - 150
				}, 1000);
			}
		});

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'show-presentation-info':
				presentation_id = $(this).data("presentation_id");
				presentation_name = $(this).data("presentation_name");
				tipo_negocio = $(this).data("tipo_negocio");

				if (tipo_negocio == 'M') {
					$(':mobile-pagecontainer').pagecontainer('change', 'presentation-info.html');
				} else {
					$(':mobile-pagecontainer').pagecontainer('change', 'presentation-info-nm.html');
				}
				break;
			case 'show-more':
				loadMoreProducts();
				break;
			}
		});
		$page.find('[data-action="change-tab"]').on('tap', function() {
			switch ($(this).data('view')) {
			case 'search-benefits':
				$(':mobile-pagecontainer').pagecontainer('change', 'search-on-club.html');
				break;
			case 'another-benefits':
				$(':mobile-pagecontainer').pagecontainer('change', 'explore-another-benefits.html');
				break;
			}
		});
	}).on('pageshow', function(e, data) {

		isComingFromClubs = true;

		$sections = $page.find('#logot');
		var imgSrc = (club_id == '1') ? 'bbitos' : (club_id == '2') ? 'pmc' : (club_id == '7') ? 'aniosDorados' : 'beauty';
		$page.find('#logot').html("");
		if (imgSrc == 'noIMG') {
			$sections.append('<h3 alignt="center">' + club_name + '</h3>');
		} else {
			$sections.append('<img id="" src="themes/default/images2/clubs/' + imgSrc + '.png"></img>');
		}

		$page.find('#another').removeClass('ui-btn-active');
		$('input[data-type="search-list"]').val("");
		$('input[data-type="search-list"]').text("");
		$page.find("#club-name").text(club_name);

		// if (auxLastProductId != product_id) {
		$.mobile.loading('show', {
			text : 'Cargando',
			textVisible : true,
			theme : 'b'
		});
		$page.find('#itemsBenefitsList').empty();
		auxLastProductId = product_id + '';
		cargarNombre();
		cargarItems();
		// }

	});

	function cargarNombre() {

		var list = [];
		list.push('<h3 align="center">' + product_name + '</h3>');
		$page.find('#item-name').html(list.join('')).listview('refresh');

	}

	function cargarItems() {

		try {

			invokeService({
				url : svf,
				service : 'obtenerItemsPorClubYProducto',
				dataType : 'jsonp',
				data : {
					codigoClub : club_id,
					codigoProducto : product_id,
					codigoAplicacion : parameters.codigoAplicacion
				},
				cache : {
					key : club_id + product_id,
					time : promotionsCacheTimeout
				},

				success : function(data) {

					try {

						if (data.length > 0) {
							var list = [];

							$.each(data, function() {

								label = this.presentacionItem;
								lastProductId = this["codigoProducto"];
								tipoNegocio = this["tipoNegocio"];
								benefitInfo = this.beneficios;

								list.push('<li class="capitalized" data-icon="info" style="margin-left: 0px"><a data-action="toggle-detail" style="padding: .7em 5px"><label for="name" style="margin-left: 5px; white-space: normal; max-width: 230px; display: block;">' + label + '</label></a><a href="#" data-action="show-presentation-info" data-tipo_negocio="' + tipoNegocio + '" data-presentation_name="' + this.presentacionItem + '" data-presentation_id="' + this.codigoItem + '"></a></li>');

								if (benefitInfo.length == 0) {

									list.push('<li class="detail" style="display:none; background-color: cornsilk;"><div style="margin-left: 20px;"><p align="justify" style="white-space: normal;">Por ahora este producto no tiene beneficios</b></p></div></li>');

								} else {

									for ( var i = 0; i < benefitInfo.length; i++) {

										if (club_name != 'CLUB AÑOS DORADOS') {

											if (benefitInfo[i].presentacionItemRegalo != '') {

												var formaPresentacion = benefitInfo[i].formaPresentacion;
												var auxCSN = (benefitInfo[i].unidadProducto == 1) ? " caja" : " unidad"; // Determina
												// si lo necesario para
												// bonificar esta en cajas o
												// unidades
												var auxCSR = (benefitInfo[i].unidadRegalo == 1) ? " caja" : " unidad"; // Determina
												// si el regalo esta en cajas o
												// unidades
												var auxS = (benefitInfo[i].hasta == 1) ? '' : ((benefitInfo[i].formaPresentacion == 'UNIDAD') ? "es" : "s");
												var auxRS = (benefitInfo[i].cantidadRegalo == 1) ? '' : ((benefitInfo[i].formaPresentacion == 'UNIDAD') ? "es" : "s");

												list.push('<li class="detail" style="display:none; background-color: cornsilk;"><div style="margin-left: 20px;"><p align="justify" style="white-space: normal;">Por la compra de ' + benefitInfo[i].hasta + ' ' + benefitInfo[i].formaPresentacion.toLowerCase() + auxS + ', ganarás <b>' + benefitInfo[i].cantidadRegalo + ' ' + benefitInfo[i].formaPresentacion.toLowerCase() + auxRS + ' de ' + benefitInfo[i].presentacionItemRegalo + '. ' + ((benefitInfo[i].textRegalo != 'undefined') ? benefitInfo[i].textRegalo : '') + '</b></p></div></li>');

											} else {

												list.push('<li class="detail" style="display:none; background-color: cornsilk;"><div style="margin-left: 20px;"><p align="justify" style="white-space: normal;">' + ((benefitInfo[i].textRegalo != 'undefined') ? benefitInfo[i].textRegalo : 'Futuro beneficio') + '</b></p></div></li>');

											}

										} else {

											list.push('<li class="detail" style="display:none; background-color: cornsilk;"><div style="margin-left: 20px;"><p align="justify" style="white-space: normal;">Por la compra de este producto reciba el <b>' + benefitInfo[i].porcentajeDescuento + '% de descuento.</b></p></div></li>');

										}

									}

								}

							});

							$page.find('#itemsBenefitsList').html(list.join('')).listview('refresh');

						} else {
							// showMessage("No existe productos", null,
							// "Mensaje");
							$page.find('#itemsBenefitsList').html('<li style="background-color: rgba(255, 255, 255, 0.9) !important; color: #333 !important;">No se han encontrado resultados</li>').listview('refresh');
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