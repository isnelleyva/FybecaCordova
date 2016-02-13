(function($) {
	'use strict';
	// var viewModel;

	var $page = $($('script').last()).closest('[data-role="page"]');

	$page.on('pagebeforecreate', function() {

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'backh':

				if (customer.isAuthenticated()) {
					$(':mobile-pagecontainer').pagecontainer('change', '../../index.html#menu-mifybeca', {
						reverse : true
					});
				} else {
					$(':mobile-pagecontainer').pagecontainer('change', '../../user-login.html', {
						reverse : true
					});
				}

				break;
			}
		});

		localStorage.setItem('featureShowed', false);

	});

})(jQuery);