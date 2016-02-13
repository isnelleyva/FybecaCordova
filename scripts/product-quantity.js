//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#product-quantity');
	$page.on('pageinit', function() {
		try {

			validator = $page.find('form').validate();

			$page.find("input[type='radio']").bind("change", function(event, ui) {

				var unitSelected = $page.find('input[name=presentation-unit]:checked', '#product-quantity').val();
				if (unitSelected == 'C') { // 300
					$page.find("input[type='tel']").attr('max', '300');
				} else {
					$page.find("input[type='tel']").attr('max', '500');
				}
				validator.resetForm();
				$page.find('form').validate();

			});

			$page.find('form').on('submit', function(e) {

				// if ($(this).valid()) {
				e.preventDefault();
				var quantity = Number($.trim($page.find('[name="presentation-quantity"]').val()));
				presentation_unit = $page.find('[name="presentation-unit"]:checked').val();
				presentation_minStock = quantity != '' ? quantity : -1;
				$(':mobile-pagecontainer').pagecontainer('change', 'presentation-near.html');
				// }

			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}).on('pagebeforeshow', function() {
		try {
			$page.find('#presentation-name').text(product_name + ' - ' + presentation_name);
			$page.find('#presentation-units').text(presentation_units > 1 ? '(' + presentation_units + ' unidades)' : '');
			$page.find('[name="presentation-quantity"]').val(presentation_minStock != -1 ? presentation_minStock : '');
			if (presentation_units == 1) {
				presentation_unit = 'C';
				$page.find('#unit-1').attr("checked", true).checkboxradio('refresh');
				$page.find('#unit-2').checkboxradio('disable').checkboxradio('refresh');
			} else {
				$page.find('#unit-2').checkboxradio('enable');
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}).on('pageshow', function() {
		try {
			// $page.find('[name="presentation-quantity"]').focus();
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	});
})();