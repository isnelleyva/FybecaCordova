//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function($) {

	var $page = $($('script').last()).closest('[data-role="page"]');

	var viewModel = {

		catalogs : ko.observableArray([]),

		cartCount : ko.observable(0),

		goToSubCatalog : function(data) {
			product_type_id = data.catalogId;
			product_type_name = data.catalogName;
			$(':mobile-pagecontainer').pagecontainer('change', 'explore-products-categories.html');
		}
	}

	$page.on('pagebeforecreate', function() {
		models.products.getCatalogsParents().done(function(result) {

			for ( var i = 0; i < result.rows.length; i++) {

				try {
					viewModel.catalogs.push({
						'catalogId' : result.rows.item(i).id,
						'catalogName' : result.rows.item(i).description.toLowerCase()
					});
				} catch (e) {
					// TODO: handle exception
				}

			}
			$('#product-types-list').listview('refresh');

		});
		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {

		viewModel.cartCount(customer.items().cartItems.length);

	});

})(jQuery);