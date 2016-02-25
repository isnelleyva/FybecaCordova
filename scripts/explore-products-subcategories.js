//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function($) {

	var $page = $($('script').last()).closest('[data-role="page"]');

	var viewModel = {

		subCatalogName : ko.observable(''),

		subSubCatalogs : ko.observableArray([]),

		cartCount : ko.observable(0),

		goToProduct : function(data) {

			try {
				if (navigator.connection.type == Connection.NONE) {
					showMessageText('En este momento no posees conexión a internet, verifica tu conexión y vuelve a intentarlo');
					return;
				}
			} catch (err) {

			}

			sub_category_id = data.subSubCatalogId;
			// sub_category_id = 569;
			sub_category_name = data.subSubCatalogName;
			clear_product_category_serch = true;
			$(':mobile-pagecontainer').pagecontainer('change', 'explore-products-products.html');
		}
	};

	$page.on('pagebeforecreate', function() {

		viewModel.subCatalogName(category_name);

		models.products.getSubSubCatalogs(category_id).done(function(result) {

			for ( var i = 0; i < result.rows.length; i++) {
				try {
					viewModel.subSubCatalogs.push({
						'subSubCatalogId' : result.rows.item(i).id,
						'subSubCatalogName' : result.rows.item(i).description.toLowerCase()
					});
				} catch (e) {
					// TODO: handle exception
				}
			}

			$('#subcategories-list').listview('refresh');

		});
		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {
		viewModel.cartCount(customer.items().cartItems.length);
		isCommingFromCat2 = false;
	});

})(jQuery);