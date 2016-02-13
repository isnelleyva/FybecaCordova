//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#show-benefits-per-person');
	$page.on('pageinit', function() {

		$page.find('#btnMasBeneficios').on('click', function() {
			$(':mobile-pagecontainer').pagecontainer('change', 'search-on-club.html');
		});

		$page.on('tap', '[data-action="toggle-detail"]', function() {

			$page.find('[data-aux="a"]').attr('data-icon', 'arrow-d');
			$page.find('[data-aux="a"]').children().children().next().removeClass('ui-icon-arrow-u').addClass('ui-icon-arrow-d');

			if ($(this).parents('li').next().is(":visible")) {
				$(this).parents('li').attr('data-icon', 'arrow-d');
				$(this).parents('li').children().children().next().removeClass('ui-icon-arrow-u').addClass('ui-icon-arrow-d');
				$(this).parents('li').next().slideToggle();
			} else {
				$(this).parents('li').attr('data-icon', 'arrow-u');
				$(this).parents('li').children().children().next().removeClass('ui-icon-arrow-d').addClass('ui-icon-arrow-u');
				$page.find('.detail').slideUp();
				$(this).parents('li').next().slideToggle();
			}
		});

		$.event.special.tap.tapholdThreshold = 1000;
	})

	.on('pageshow', function() {
		clearList();
		loadLogo();
		loadAux();
	});

	function loadLogo() {

		var list = [];
		var src = (club_name == 'CLUB BBITOS') ? 'bbitos' : (club_name == 'CLUB AÑOS DORADOS') ? 'aniosDorados' : (club_name == 'CLUB PMC') ? 'pmc' : 'beauty';
		// list.push('<img src="themes/default/images2/clubs/' + src + '.png"
		// style="margin-top:10px; margin-bottom:10px;"/>');
		$page.find('#logot').append('<img src="themes/default/images2/clubs/' + src + '.png"></img>');

	}

	function clearList() {

		$page.find('#item-benefits-list').empty();

	}

	function loadAux() {

		var list = [];

		if (myClubOption == 'normal') {

			for ( var i = 0; i < listAux.length; i++) {

				if (club_id == listAux[i].substring(0, 1)) {

					list.push(listAux[i].substring(1));

				}

			}

		} else if (myClubOption == 'noSuscrito') {

			list.push('<li class="liInfo">No te encuentras suscrito a este club</li>');

		} else if (myClubOption == 'noItems') {

			list.push('<li class="liInfo">Te encuentras suscrito a este club, pero no has comprado items que apliquen a un beneficio</li>');

		}

		$page.find('#item-benefits-list').html(list.join('')).listview('refresh');

	}

})();

// function switchIcon(component) {
// if ($(component).find('a').hasClass('ui-icon-carat-u')) {
// $(component).find('a').addClass('ui-icon-carat-d');
// $(component).find('a').removeClass('ui-icon-carat-u');
// } else if ($(component).find('a').hasClass('ui-icon-carat-d')) {
// $(component).find('a').addClass('ui-icon-carat-u');
// $(component).find('a').removeClass('ui-icon-carat-d');
// }
//
// $.each($('#item-benefits-list li'), function() {
// if ($(this)[0] != $(component)[0]) {
// $(this).find('a').addClass('ui-icon-carat-d').removeClass('ui-icon-carat-u');
// }
// });
// }

function switchIcon(component) {
	setTimeout(function() {
		debugger;
		if ($(component).find('a').hasClass('ui-icon-carat-u') && $(component).next().css('display') == 'none') {
			$(component).find('a').addClass('ui-icon-carat-d');
			$(component).find('a').removeClass('ui-icon-carat-u');
		} else if ($(component).find('a').hasClass('ui-icon-carat-d') && $(component).next().css('display') == 'block') {
			$(component).find('a').addClass('ui-icon-carat-u');
			$(component).find('a').removeClass('ui-icon-carat-d');
		}
		$.each($('#item-benefits-list li'), function() {
			if ($(this)[0] != $(component)[0]) {
				$(this).find('a').addClass('ui-icon-carat-d').removeClass('ui-icon-carat-u');
			}
		});
	}, 750);
}