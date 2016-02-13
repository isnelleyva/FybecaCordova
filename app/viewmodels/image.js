(function($) {
	'use strict';
	var $page = $($('script').last()).closest('[data-role="page"]');

	var viewModel = {

		imageUrl : ko.observable('https://www.fybeca.com/carrocompras/MainImagenItemServlet?itemid=241800'),

		isZoomed : false,

		itemId : ko.observable(),
		
		itemName : ko.observable(),

		productName : '',

		productId : '',

		backh : function() {
			$(':mobile-pagecontainer').pagecontainer('change', 'presentation-detail.html?itemId=' + viewModel.itemId() + '&productName=' + viewModel.productName + '&productId=' + viewModel.productId, {
				reverse : true
			});
		},

		toggleZoom : function() {
			$('.panzoom').panzoom("zoom", (viewModel.isZoomed ? 1 : 3), {
				animate : true
			});
			viewModel.isZoomed = !viewModel.isZoomed;
		}

	};

	$page.on('pagebeforecreate', function() {

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);
		viewModel.itemId(pageUrl.param('itemId') || documentUrl.param('itemId'));
		viewModel.itemName(pageUrl.param('itemName') || documentUrl.param('itemName'));
		viewModel.productName = pageUrl.param('productName') || documentUrl.param('productName');
		viewModel.productId = pageUrl.param('productId') || documentUrl.param('productId');

		viewModel.imageUrl('https://www.fybeca.com/carrocompras/MainImagenItemServlet?itemid=' + viewModel.itemId());

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {

		$('.panzoom').panzoom({
			increment : 0.4,
			minScale : 1,
			maxScale : 3,
			contain : 'invert'
		});

	});

})(jQuery);