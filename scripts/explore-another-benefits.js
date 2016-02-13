//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#explore-another-benefits');
	$page.on('pageinit', function() {
		try {

			$page.on('tap', '[data-action]:not(form)', function(e) {
				e.preventDefault();
				switch ($(this).data('action')) {
				case 'backh':
					if (isAuth()) {
						$(':mobile-pagecontainer').pagecontainer('change', 'show-benefits-per-person.html');
					} else {
						$(':mobile-pagecontainer').pagecontainer('change', 'medication-clubs.html');
					}
					break;
				}
			});

			$page.find('[data-action="change-tab"]').on('tap', function(e) {
				e.preventDefault();
				switch ($(this).data('view')) {
				case 'search-benefits':
					$(':mobile-pagecontainer').pagecontainer('change', 'search-on-club.html', {
						changeHash : false
					});
					break;
				case 'another-benefits':
					$(':mobile-pagecontainer').pagecontainer('change', 'explore-another-benefits.html', {
						changeHash : false
					});
					break;
				}
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}).on('pageshow', function() {
		try {
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
			$page.find('[href="search-on-club.html"]').removeClass('ui-btn-active');
			var imgSrc = (club_id == '1') ? 'bbitos' : (club_id == '2') ? 'pmc' : (club_id == '7') ? 'aniosDorados' : 'beauty';
			$page.find('#logot').html("");
			$page.find('#contenido').empty();
			$sections = $page.find('#logot');
			if (imgSrc == 'noIMG') {
				$sections.append('<h3 alignt="center">' + club_name + '</h3>');
			} else {
				$sections.append('<img src="themes/default/images2/clubs/' + imgSrc + '.png" style="margin-left:-15px;"></img>');
			}
			cargarOtrosBeneficios();
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	})

	function cargarOtrosBeneficios() {
		try {

			// invokeAjaxService({
			invokeService({
				url : svf,
				service : "obtenerClubOtrosBeneficios",
				dataType : 'jsonp',
				data : {
					codigoClub : club_id,
					codigoAplicacion : parameters.codigoAplicacion
				},
				cache : {
					key : club_id,
					time : obtenerClubOtrosBeneficiosCacheTimeout
				},

				success : function(data) {

					$page.find('#contenido').empty();
					$page.find('#contenido').append(data.descripcion);

					$.mobile.loading('hide');

				},
				error : function() {
					showMessage(defaultErrorMsg, null, 'Mensaje');
					$.mobile.loading('hide');
				}

			});

		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}

})();