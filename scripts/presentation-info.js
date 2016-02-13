//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#presentation-info');
	var texto;
	var options;
	$page.on('pageinit', function() {

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {

			case 'backh':
				if (isComingFromClubs) {
					$(':mobile-pagecontainer').pagecontainer('change', 'search-on-club-items.html', {
						reverse : true
					});
				} else {
					$(':mobile-pagecontainer').pagecontainer('change', 'product-detail.html', {
						reverse : true
					});
				}
				break;

			}
		});

	}).on('pagebeforeshow', function() {
		try {
			$page.find('h2').addClass('ui-collapsible-heading-collapsed');
			$page.find('div').find('.ui-collapsible-content').addClass('ui-collapsible-content-collapsed').attr('aria-hidden', true);
			$page.find('div').find('.ui-collapsible-inset').addClass('ui-collapsible-collapsed');
			$page.find('span').find('.ui-icon').removeClass('ui-icon-minus').addClass('ui-icon-plus');
			$page.find("[id^=list_]").html("");
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}).on('pageshow', function() {
		try {
			options = [];
			$page.find("#presentationName").text(product_name + " - " + presentation_name);
			$page.find(".collapsible-element").each(function() {
				var option = $(this).attr("option");
				$(this).find("h2").find("a").on("click", function() {
					if ($.inArray(option, options) < 0) {
						loadInfo(option);
					}
				});
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	});
	function loadInfo(option) {
		try {
			options.push(option);
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});

			invokeService({
				url : svf,
				service : "obtenerInfoProducto",
				dataType : 'jsonp',
				data : {
					codigoItem : presentation_id,
					codigoTipoInfo : option,
					codigoAplicacion : parameters.codigoAplicacion
				},
				cache : {
					key : presentation_id + option,
					time : detalleProductoCacheTimeout
				},

				success : function(data) {

					if (data.length > 0) {
						texto = data[0]["texto"];
						$page.find('#list_' + option).html('<p class="capitalized">' + texto + '</p>');
					} else {
						$page.find('#list_' + option).html("<p>No hay informaci&oacute;n disponible.</p>");
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