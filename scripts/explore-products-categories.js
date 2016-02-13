//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function($) {

	var $page = $($('script').last()).closest('[data-role="page"]');

	window.viewModel = {
		catalogName : ko.observable(''),

		subCatalogs : ko.observableArray([]),

		cartCount : ko.observable(0),

		goToSubSubCatalog : function(data) {
			category_id = data.subCatalogId;
			category_name = data.subCatalogName;
			$(':mobile-pagecontainer').pagecontainer('change', 'explore-products-subcategories.html');
		},

		goToProduct : function(data) {
			try {
				if (navigator.network.connection.type == Connection.NONE) {
					showMessageText('En este momento no posees conexión a internet, verifica tu conexión y vuelve a intentarlo');
					return;
				}
			} catch (err) {
			}

			sub_category_id = data.subCatalogId;
			// sub_category_id = 569;
			sub_category_name = data.subCatalogName;
			clear_product_category_serch = true;
			isCommingFromCat2 = true;
			$(':mobile-pagecontainer').pagecontainer('change', 'explore-products-products.html');

		}
	};

	$page.on('pagebeforecreate', function() {

		viewModel.catalogName(product_type_name);

		models.products.getSubCatalogs(product_type_id).done(function(result) {

			for ( var i = 0; i < result.rows.length; i++) {

				try {
					viewModel.subCatalogs.push({
						'subCatalogId' : result.rows.item(i).id,
						'subCatalogName' : result.rows.item(i).description.toLowerCase()
					});
				} catch (e) {
					// TODO: handle exception
				}

			}

			$('#categories-list').listview('refresh');

		});
		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {
		viewModel.cartCount(customer.items().cartItems.length);
	});

})(jQuery);