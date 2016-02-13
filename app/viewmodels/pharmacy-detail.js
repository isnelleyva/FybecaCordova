(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]'), // Contexto

	viewModel = {

		latitude : '',
		longitude : '',

		pharmacyData : {
			id : '',
			name : ko.observable(''),
			address : ko.observable(''),
			phones : ko.observable(''),
			schedule : ko.observable(''),
			services : ko.observable(''),
			distance : ko.observable(''),
			imgSrc : ko.observable('')
		},

		backh : function() {

			$(':mobile-pagecontainer').pagecontainer('change', '../../search-places.html?l=n', {
				reverse : true
			});

		},

		loadPharmacyDetail : function() {

			$.mobile.loading('show', {
				text : 'Obteniendo información',
				textVisible : true,
				theme : 'b'
			});

			var data = {
				latitude : viewModel.latitude,
				longitude : viewModel.longitude,
				pharmacyId : viewModel.pharmacyData.id
			};

			models.DataRequests.getPharmacyDetail(data).done(function(response) {

				viewModel.pharmacyData.name(response.nombreFarmacia);
				viewModel.pharmacyData.address(response.direccion);
				viewModel.pharmacyData.phones(response.telefonos);
				viewModel.pharmacyData.schedule(response.horarios);
				try {
					viewModel.pharmacyData.services(response.servicios.join(', '));
				} catch (e) {
				}
				viewModel.pharmacyData.distance(response.distanciaReferencia);

			}).always(function() {
				$.mobile.loading('hide');
			});

			// viewModel.loadPharmacyImage(pharmacy.code);

		},

		loadPharmacyImage : function() {

			models.DataRequests.getPharmacyImage(viewModel.pharmacyData.id).done(function(response) {

				viewModel.pharmacyData.imgSrc('data:' + response.mimeType + ';base64,' + response.imageString);

			});

		},

	};

	$page.on('pagebeforecreate', function() {

		ko.applyBindings(viewModel, $page[0]);

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);
		viewModel.pharmacyData.id = pageUrl.param('code') || documentUrl.param('code');
		viewModel.latitude = pageUrl.param('lat') || documentUrl.param('lat');
		viewModel.longitude = pageUrl.param('lon') || documentUrl.param('lon');

	}).on('pageshow', function() {

		viewModel.loadPharmacyDetail();
		viewModel.loadPharmacyImage();

	});

})(jQuery);