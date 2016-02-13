//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#medication-clubs');
	$page.on('pageinit', function() {
		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {

			case 'pulsado':
				club_name = $(this).data("club-name");
				club_id = $(this).data("club-id");
				clear_club_search = true;
				// $(':mobile-pagecontainer').pagecontainer('change',
				// 'search-on-club.html');

				setTimeout(function() {
					$(':mobile-pagecontainer').pagecontainer('change', 'search-on-club.html');
				}, 300);

				break;

			}
		}).on('pagebeforeshow', function() {

			// try {
			// // debugger;
			// var body = document.body, html = document.documentElement;
			// var height = Math.max(body.scrollHeight, body.offsetHeight,
			// html.clientHeight, html.scrollHeight, html.offsetHeight);
			// // var listHeight = parseInt($('#benefits-list').css('height'));
			// debugger;
			// var listHeight = 426;
			// if (height > listHeight) {
			// $('#benefits-list').css('margin-top', (height - listHeight) / 2 -
			// 45);
			// }
			// } catch (e) {
			//				console.log(e);
			//			}

		}).on('pageshow', function() {

			// try {
			// var body = document.body, html = document.documentElement;
			// var height = Math.max(body.scrollHeight, body.offsetHeight,
			// html.clientHeight, html.scrollHeight, html.offsetHeight);
			// var listHeight = parseInt($('#benefits-list').css('height'));
			// if (height > listHeight) {
			// $('#benefits-list').css('margin-top', (height - listHeight) / 2 -
			// 45);
			// }
			// } catch (e) {
			// console.log(e);
			//			}

		});
	});

})();
