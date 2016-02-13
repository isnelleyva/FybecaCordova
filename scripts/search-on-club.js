//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var lastProductId = '';
	var $page = $('#search-on-club'), timer;
	var showMoreBen = false;
	$page.on('pageinit', function() {
		$page.find('input[data-type="search-list"]').trigger("change");

		$page.find('[data-type="search"]').on('keypress change', function() {
			$self = $(this);
			clearTimeout(timer);
			timer = setTimeout(function() {
				searchProducts($self.val());
			}, 300);
		});
		$page.find('#search-list-club').listview('option', 'filterCallback', function(text, search) {
			return false;
		});

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'search-items':
				product_name = $(this).data("productname");
				product_id = $(this).data("product_id");
				$.mobile.changePage('search-on-club-items.html', {
					changeHash : false
				});
				break;
			case 'show-more':
				showMoreBen = true;
				loadMoreProducts();
				break;
			case 'backh':
				if (isAuth()) {
					$.mobile.changePage('show-benefits-per-person.html', {
						reverse : true
					});
				} else {
					$.mobile.changePage('medication-clubs.html', {
						reverse : true
					});
				}
				break;
			}
		});
		$page.find('[data-action="change-tab"]').on('tap', function(e) {
			e.preventDefault();
			switch ($(this).data('view')) {
			case 'search-benefits':
				$(':mobile-pagecontainer').pagecontainer('change', 'search-on-club.html', {
				// changeHash : false
				});
				break;
			case 'another-benefits':
				$.mobile.changePage('explore-another-benefits.html', {
				// changeHash : false
				});
				break;
			}
		});

	}).on('pageshow', function() {

		showMoreBen = false;
		$page.find('[href="explore-another-benefits.html"]').removeClass('ui-btn-active');
		$page.find('#btnCargar').hide();
		var imgSrc = (club_id == '1') ? 'bbitos' : (club_id == '2') ? 'pmc' : (club_id == '7') ? 'aniosDorados' : 'beauty';
		$page.find('#logot').html("");

		$sections = $page.find('#logot');
		if (imgSrc == 'noIMG') {
			$sections.append('<h3 alignt="center">' + club_name + '</h3>');
		} else {
			$sections.append('<img src="themes/default/images2/clubs/' + imgSrc + '.png"></img>');
		}

		// if (auxLastClubId != club_id) {
		$page.find('#search-list-club').empty();
		auxLastClubId = club_id;
		searchProducts('');
		// }

		$page.find('input[data-type="search-list"]').val("");
		$page.find('input[data-type="search-list"]').text("");
		$page.find("#club-name").text(club_name);

		if (clear_club_search) {
			$page.find('input[data-type="search"]').val("");
			clear_club_search = false;
		}

	});

	function searchProducts(keyword) {

		$.mobile.loading('show', {
			text : 'Consultando',
			textVisible : true,
			theme : 'b'
		});
		// invokeAjaxService({
		invokeService({
			url : svf,
			service : 'obtenerProductosPorClub',
			dataType : 'jsonp',
			data : {

				codigoClub : club_id,
				codUltProdConsultado : 0,
				filtro : keyword,
				codigoAplicacion : parameters.codigoAplicacion

			},
			cache : {
				key : club_id + '_' + lastProductId,
				time : config.cacheTimeouts.getItemsByProductId
			},

			success : function(data) {

				var cargarMas = true;

				if (data.length > 0) {
					var list = [];
					$.each(data, function() {
						label = (keyword != '') ? this.nombreProducto.replace(keyword.toUpperCase(), '<span style="background:#FFCCCC;">' + keyword.toUpperCase() + '</span>') : this.nombreProducto;
						lastProductId = this["codigoProducto"];
						list.push('<li class="capitalized"><a class="capitalized" data-action="search-items" data-product_id="' + this.codigoProducto + '" data-productname="' + this.nombreProducto + '">' + label + '</a></li>');
						last_product_id = this["codigoProducto"];
						if (this["ultimaCoincidencia"] == '1') {
							cargarMas = false;
						}
					});
					if (cargarMas) {
						list.push('<li data-icon="plus" style="text-align: center"><a data-role="button" data-action="show-more" id="btnLoad">Más productos</a></li>')
					}
					;
					$page.find('#search-list-club').html(list.join('')).listview('refresh');

				} else {
					$page.find('#search-list-club').html('<li style="background-color: rgba(255, 255, 255, 0.9) !important; color: #333 !important;">No se han encontrado resultados</li>').listview('refresh');
				}
				$.mobile.loading('hide');

			},
			error : function() {
				showMessage(defaultErrorMsg, null, 'Mensaje');
				$.mobile.loading('hide');
			}

		});

	}

	function loadMoreProducts() {

		$.mobile.loading('show', {
			text : 'Cargando',
			textVisible : true,
			theme : 'b'
		});
		$page.find('#btnLoad').parents('li').remove();

		// invokeAjaxService({
		invokeService({
			url : svf,
			service : 'obtenerProductosPorClub',
			dataType : 'jsonp',
			data : {
				codigoClub : club_id,
				codUltProdConsultado : lastProductId,
				filtro : '',
				codigoAplicacion : parameters.codigoAplicacion
			},
			cache : {
				key : club_id + lastProductId,
				time : promotionsCacheTimeout
			},
			isNeededActivateButtons : true,
			success : function(data) {

				var cargarMas = true;

				if (data.length > 0) {
					var list = [];
					$.each(data, function() {
						label = this.nombreProducto;
						lastProductId = this["codigoProducto"];
						list.push('<li class="capitalized"><a data-action="search-items" data-product_id="' + this.codigoProducto + '" data-productname="' + this.nombreProducto + '">' + label + '</a></li>');
						last_product_id = this["codigoProducto"];
						if (this["ultimaCoincidencia"] == '1') {
							cargarMas = false;
						}
					});

					if (cargarMas) {
						list.push('<li data-icon="plus" style="text-align: center"><a data-role="button" data-action="show-more" id="btnLoad">Más productos</a></li>');
					}

					$page.find('#search-list-club').append(list.join('')).listview('refresh');

					$('html,body').animate({
						scrollTop : $(document).height()
					}, 2000);

				} else {
					$page.find('#search-list-club').html('<li>No se han encontrado resultados</li>').listview('refresh');
				}
				showMoreBen = false;
				$.mobile.loading('hide');
			},
			error : function(e, message, showMsg) {
				if (showMoreBen) {
					var list = [];
					list.push('<li data-icon="plus" style="text-align: center"><a data-role="button" data-action="show-more" id="btnLoad">Más productos</a></li>');
					$page.find('#search-list-club').append(list.join('')).listview('refresh');
					showMoreBen = false;
				}
				if (showMsg != undefined) {
					if (showMsg)
						showMessage(defaultErrorMsg, null, null);
				} else
					showMessage(defaultErrorMsg, null, null);

				$.mobile.loading('hide');
			}

		});

	}
})();