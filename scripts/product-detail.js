//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#product-detail');
	var lastProductId;
	$page.on('pageinit', function() {
		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'show-presentation-info':
				presentation_id = $(this).data("presentation_id");
				presentation_name = $(this).data("presentation_name");
				tipo = $(this).data("type");
				$(':mobile-pagecontainer').pagecontainer('change', (tipo == 'M') ? 'presentation-info.html' : 'presentation-info-nm.html', {
					changeHash : false
				});
				break;
			case 'show-near-presentations':
				presentation_minStock = -1;
				presentation_id = $(this).data("presentation_id");
				presentation_name = $(this).data("presentation_name");
				presentation_units = $(this).data("presentation_units");
				presentation_price = $(this).data("presentation_price");
				$.publish('restore-page');
				$(':mobile-pagecontainer').pagecontainer('change', 'presentation-near.html');
				break;
			case 'backh':
				if (isComingFromProducts) {
					$(':mobile-pagecontainer').pagecontainer('change', 'search-products.html');
				} else {
					$(':mobile-pagecontainer').pagecontainer('change', 'explore-products-products.html');
				}
				break;
			}
		});
	}).on('pagebeforeshow', function() {
		isComingFromClubs = false;
		if (lastProductId != product_id) {
			$page.find("#productName").html(product_name);
			$page.find('#presentationsList').html('');
		}
	}).on('pageshow', function() {
		if (lastProductId != product_id) {
			loadPresentations();
			saveHistory();
		}
	});
	function loadPresentations() {
		$.mobile.loading('show', {
			text : 'Cargando',
			textVisible : true,
			theme : 'b'
		});

		invokeAjaxService({
			url : svf,
			service : 'obtenerPresentacionesProductos',
			dataType : 'jsonp',
			data : {
				codigoProducto : product_id
			},
			success : function(data) {

				if (data != null && data != undefined && data.length > 0) {
					lastProductId = product_id;
					var list = Array();
					list.push('<li data-role="list-divider">Elija una presentaci&oacute;n</li>');
					$.each(data, function() {
						presentation_id = this["codigoItem"];
						presentation_name = this["nombre"];
						presentation_price = this["precio"];
						list.push('<li class="capitalized"><a style="padding-right: 110px;" data-action="show-near-presentations" data-presentation_id="' + presentation_id + '" data-presentation_name="' + presentation_name + '" data-presentation_units="' + this.unidadFarmacias + '" data-presentation_price="' + this.precio + '"><span>' + presentation_name + '</span><span class="ui-li-count" style="font-size: 15px; border:0; background:transparent;">$' + (Math.round(presentation_price * 100) / 100) + '</span></a><a href="#" data-action="show-presentation-info" data-type="' + this["tipoNegocio"] + '" data-presentation_name="' + presentation_name + '" data-presentation_id="' + presentation_id + '">Informaci&oacute;n del producto</a></li>');
					});
					$('#presentationsList').html(list.join('')).listview('refresh');
				} else {
					$('#presentationsList').html('<li>No se han encontrado presentaciones</li>').listview('refresh');
				}
				$.mobile.loading('hide');

			},
			error : function() {
				showMessage(defaultErrorMsg, null, 'Mensaje');
				$.mobile.loading('hide');
			}
		});

	}

	// Guarda producto encontrado al historial
	function saveHistory() {
		var today = new Date();
		db.transaction(function(tx) {
			tx.executeSql('SELECT visits FROM wanted_products WHERE id = ?;', [ product_id ], function(tx, results) {
				var visits = 0;
				if (results.rows.length > 0) {
					visits = results.rows.item(0).visits;
				}
				tx.executeSql('INSERT OR REPLACE INTO wanted_products (`id`, `name`, `visits`, `last_visit`) VALUES (?, ?, ?, ?);', [ product_id, product_name, visits + 1, today.getTime() ], function(tx, results) {
					// TODO
				}, function(tx, error) {
					console.log(error);
				})
			}, function(tx, error) {
				console.log(error);
			});
		});
	}
})();