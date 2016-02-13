//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#vitalcard');

	$page.on('pageinit', function() {

		$page.find('[data-action]').on('tap', function(e) {
			e.preventDefault();

			switch ($(this).data('action')) {
			case 'mapa':
				try {
					if (navigator.network.connection.type == Connection.NONE) {
						ShowMessageInternetNotAvailable();
						return;
					}
				} catch (err) {

				}
				$(':mobile-pagecontainer').pagecontainer('change', 'vitalcard-map.html');
				break;
			case 'busqueda':
				$(':mobile-pagecontainer').pagecontainer('change', 'vitalcard-search.html');
				break;

			}

		});

	})

})();
