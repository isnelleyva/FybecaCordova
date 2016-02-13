//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#buying-guide');
	var yaCargado = false;

	var viewModel = {

		images : ko.observableArray([]),
		currImageCount : 0,
		imagesCount : 0

	}

	$page.on('pageinit', function(e) {
		try {
			loadChildBrowser();
			ko.applyBindings(viewModel, $page[0]);
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}

		$page.find('#descargarGuia').on('click', function() {

			if (device.platform == 'Android') {
				window.plugins.childBrowser.openExternal(localStorage.getItem('buyersGuideUrl'));
			} else {
				window.plugins.childBrowser.showWebPage(localStorage.getItem('buyersGuideUrl'), {
					showLocationBar : true
				});
			}

		});

		$page.find("#promotions1").swiperight(function() {
			$page.find("#promotions1").cycle('prev');
		});
		$page.find("#promotions1").swipeleft(function() {
			$page.find("#promotions1").cycle('next');
		});

	})

	.on('pageshow', function(e) {

		if (!yaCargado) {

			$.mobile.loading("show", {
				text : "Cargando",
				textVisible : true,
				textonly : false,
				theme : 'b'
			});

			invokeService({
				url : svb,
				service : 'promotions',
				data : {
					typeCode : 'PROM_GUIDE',
					accessLevelCode : 'ACC_PUB',
					lastPromotionCode : '-1'
				},
				cache : {
					key : 'PROM_GUIDEACC_PUB-1',
					time : buyersGuideCacheTimeout
				},
				dataType : 'jsonp',
				success : function(response) {
					$.mobile.loading("show", {
						text : 'Cargando',
						textVisible : true,
						textonly : false,
						theme : 'b'
					});
					viewModel.imagesCount = response.length;
					viewModel.currImageCount = 0;
					$.each(response, function(index, value) {

						invokeService({
							url : svb,
							service : 'promotions',
							dataType : 'jsonp',
							data : {
								code : value.Code,
								typeCode : 'PROM_GUIDE',
								distinct : 'GET_IMAGE'
							},
							cache : {
								key : value.Code,
								time : buyersGuideCacheTimeout
							},
							success : function(response) {

								$.mobile.loading('hide');
								yaCargado = true;

								viewModel.images.push({
									image64 : 'data: ' + response.mimeType + ';base64,' + response.imageString
								});

								viewModel.currImageCount++;
								if (viewModel.currImageCount == viewModel.imagesCount) {
									$("#imagesCarousel").owlCarousel({
										navigation : false,
										pagination : false,
										slideSpeed : 300,
										paginationSpeed : 400,
										singleItem : true
									});
								}

							}
						});
					});
				}
			});

		}

	});

})();