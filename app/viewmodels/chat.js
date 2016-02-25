(function($) {
	'use strict';
	var viewModel = {
		backToIndex : function() {
			$(':mobile-pagecontainer').pagecontainer('change', '../../index.html', {
				reverse : true
			});

		}
	};

	var $page = $($('script').last()).closest('[data-role="page"]');

	$page.on('pagebeforecreate', function() {

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);
		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {

		try {
			if (navigator.connection.type == Connection.NONE) {
				ShowMessageInternetNotAvailable();
				return;
			}
		} catch (err) {
		}

		$.mobile.loading('show', {
			text : 'Cargando',
			textVisible : true,
			theme : 'b'
		});

	});

})(jQuery);