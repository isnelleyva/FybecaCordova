//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function($) {

	var $page = $($('script').last()).closest('[data-role="page"]');

	var viewModel = {

		products : ko.observableArray([]),

		cartCount : ko.observable(0),

		filter : ko.observable(''),

		subsubCatalogName : ko.observable(sub_category_name),

		showLoadMoreButton : ko.observable(false),

		lastProductId : '0',

		itemsWasLoaded : ko.observable(false),

		backh : function() {
			try {
				if (isCommingFromCat2) {
					$(':mobile-pagecontainer').pagecontainer('change', 'explore-products-categories.html', {
						reverse : true
					});
					return;
				}
			} catch (e) {
			}
			$(':mobile-pagecontainer').pagecontainer('change', 'explore-products-subcategories.html', {
				reverse : true
			});
		},

		goToProduct : function(product) {
			product_name = product.productId;
			product_id = product.productName;

			$(':mobile-pagecontainer').pagecontainer('change', 'app/views/product-detail.html?productId=' + product.productId + '&productName=' + product.productName);
		},

		showMore : function() {
			viewModel.loadProducts();
		},

		loadProducts : function() {

			$.mobile.loading('show', {
				text : 'Consultando productos',
				textVisible : true,
				theme : 'b'
			});
			models.products.getProductsByCatalog(sub_category_id, viewModel.filter(), viewModel.lastProductId).done(function(results) {
				if (results.length == 0) {
					$('.ui-filterable').css('display', 'none');
				}

				$.each(results, function() {
					try {
						viewModel.products.push({
							'productId' : this.codigoProducto,
							'productName' : this.nombreProducto.toLowerCase()
						});
					} catch (e) {
						// TODO: handle exception
					}

					viewModel.showLoadMoreButton(this.ultimaCoincidencia == 0);

					viewModel.lastProductId = this.codigoProducto;

				});

				$('#productsList').listview('refresh')

			}).always(function() {
				$('.ui-filterable').css('display', 'none')
				viewModel.itemsWasLoaded(true);
				$.mobile.loading('hide');
			});

		}
	}

	$page.on('pagebeforecreate', function() {
		viewModel.itemsWasLoaded(false);
		viewModel.cartCount(customer.items().cartItems.length);
		ko.applyBindings(viewModel, $page[0]);
	}).on('pageshow', function() {
		data.urlToReturnFromProduct = '../../explore-products-products.html';
		viewModel.loadProducts();
	});

})(jQuery);