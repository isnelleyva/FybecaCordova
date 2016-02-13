(function() {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]'), // Contexto
	timerL, // for local search 500ms
	timerR, // for remote search 2000ms

	viewModel = {

		showFooter : ko.observable(true),

		showHistoryList : ko.observable(true),

		showLocalList : ko.observable(false),

		otherResultsLoaded : ko.observable(false),

		cartCount : ko.observable(0),

		historyResults : ko.observableArray([]),

		mainResults : ko.observableArray([]),

		mainCategories : ko.observableArray([ {
			"catalogId" : -1,
			"catalogName" : "Todas"
		}, {
			"catalogId" : 1,
			"catalogName" : "Medicinas"
		}, {
			"catalogId" : 2,
			"catalogName" : "Salud"
		}, {
			"catalogId" : 3,
			"catalogName" : "Bebés y futura mama"
		}, {
			"catalogId" : 4,
			"catalogName" : "Belleza"
		}, {
			"catalogId" : 5,
			"catalogName" : "Cuidado personal"
		}, {
			"catalogId" : 6,
			"catalogName" : "Alimentos y bebidas"
		}, {
			"catalogId" : 7,
			"catalogName" : "Regalos y decoración"
		}, {
			"catalogId" : 8,
			"catalogName" : "Juegos y juguetes"
		} ]),

		otherResults : ko.observableArray([]),

		resultCategories : ko.observableArray([]),

		resultBrands : ko.observableArray([]),

		selectedCatalogId : ko.observable('-1'),

		selectedBrandId : ko.observable('-1'),

		selectedSort : ko.observable('0'),

		selectedCategoryText : ko.observable(''),

		searchText : ko.observable(''),

		displayedList : ko.observable('1'), // 1:main, 2:other, // 3:filters

		returnSearch : function() {
			viewModel.displayedList('1');
			$('.input-group').slideDown('fast');
		},

		backh : function() {
			if (viewModel.displayedList() == '2') {
				viewModel.displayedList('1');
				viewModel.showLocal();
				viewModel.displayedList('1');
				$('.input-group').slideDown('fast');
			} else {
				$(':mobile-pagecontainer').pagecontainer('change', '../../index.html', {
					reverse : true
				});
			}
		},

		loadFilters : function() {
			$('#popupFilters').popup('open');
			models.products.getFiltersByKeyword(viewModel.searchText());
		},

		showHideFooter : function() {
			viewModel.showFooter(!viewModel.showFooter());
		},

		showLocal : function() {
			viewModel.displayedList('1');
		},

		showRemote : function() {
			viewModel.displayedList('2');
		},

		showFilter : function() {
			viewModel.displayedList('3');
		},

		searching : ko.observable(true),

		search : function(form) {

			try {
				if (navigator.network.connection.type == Connection.NONE) {
					showMessageText('En este momento no posees conexión a internet, verifica tu conexión y vuelve a intentarlo');
					return;
				}
			} catch (err) {
			}

			if (viewModel.searchText().length > 2) {
				viewModel.searching(false);
				viewModel.showRemote();
				// $page.find('#search-button').hide().fadeIn();
				// $page.find('#search-box .input-group').slideUp('fast',
				// function() {
				// /*
				// * $page.find('#search-box').css({ margin : '-1em' });
				// */
				// });
			}

			$('.input-group').slideUp('fast');

		},

		showSearch : function(form) {
			viewModel.searching(true);
			viewModel.showLocal();
			$page.find('#search-button').fadeOut();
			/*
			 * $page.find('#search-box').css({ margin : '-.5em' });
			 */
			$page.find('#search-box .input-group').slideDown('fast', function() {
				$(this).find('input').focus();
			});

		},

		searchLocal : function(keyword) {

			$('.noProducts').slideUp('fast');

			models.products.getProductsByKeywordFromBD(keyword).done(function(results) {
				var len = results.rows.length;
				viewModel.mainResults.removeAll();

				for (i = 0; i < len; i++) {
					var item = results.rows.item(i);

					var itemName = item.name.toLowerCase().replace(keyword.toLowerCase(), '<span class="keyword-hightlight">' + keyword.toLowerCase() + '</span>');

					viewModel.mainResults.push({
						"productId" : item.id,
						"productName" : item.name,
						"productNameStyled" : itemName
					});

				}

				models.products.byNameSearchProducts = viewModel.mainResults;

				// $('#search-list-local').listview('refresh');
				$('.results').listview('refresh');
				setTimeout(function() {
					$('#search-list-local li:last a').css('margin-bottom', '10px');
				}, 500);

				try {
					$('#search-products #history-list-local').css('min-height', $('#search-list-local').css('height'));
				} catch (e) {
					console.log(e);
				}

			});
			$('#search-list-local').listview('refresh');
		},

		searchRemote : function(keyword) {

			if (keyword.length < 3) {
				return false;
			}

			$('.loadingProducts').slideDown('fast');
			$('#deepSearchLoading').slideDown('fast');
			viewModel.showLocalList(true);

			// try {
			// $('.input-group input').blur();
			// document.activeElement.blur();
			// } catch (e) {
			// console.log(e);
			// }

			viewModel.otherResults.removeAll();

			try {
				keyword = keyword.replace(/ñ/g, 'n');
			} catch (e) {
				// TODO: handle exception
			}

			models.products.getProductsByKeywordFromService(keyword, viewModel.selectedCatalogId(), viewModel.selectedBrandId()).done(function(data) {

				viewModel.otherResultsLoaded(true);
				viewModel.mainResults([]);

				var tempCont = 0;

				$.each(data.registrosPorNombre, function() {
					var itemName = this.label.toLowerCase().replace(keyword.toLowerCase(), '<span class="keyword-hightlight capitalized">' + keyword.toLowerCase() + '</span>');

					viewModel.mainResults.push({
						"productId" : this.value,
						"productName" : this.label,
						"productNameStyled" : itemName
					});

					if (tempCont++ == 20) {
						return false;
					}
					;

				});

				tempCont = 0;

				$.each(data.registrosPorMas, function() {
					viewModel.otherResults.push({
						"productId" : this.value,
						"productName" : this.label
					});

					if (tempCont++ == 20) {
						return false;
					}

				});

				models.products.byNameSearchProducts = viewModel.mainResults();
				models.products.byDeepSearchProducts = viewModel.otherResults();

				$('.results').listview('refresh');

				try {
					$('#search-products #history-list-local').css('min-height', $('#search-list-local').css('height'));
				} catch (e) {
					console.log(e);
				}

			}).always(function() {
				$('.loadingProducts').slideUp('fast');
				$('#deepSearchLoading').slideUp('fast');
				if (viewModel.mainResults().length == 0) {
					$('.noProducts').slideDown('fast');
					viewModel.showLocalList(true);
				} else {
					viewModel.showLocalList(false);
				}
			});

			$('#search-list-remote').listview('refresh');

		},

		showCategoriesPopup : function() {
			$('#popupCategories').popup('open');
		},

		toProductDetail : function(product) {
			viewModel.addProductToHistory(product);

			try {
				if (navigator.network.connection.type == Connection.NONE) {
					showMessageText('En este momento no posees conexión a internet, verifica tu conexión y vuelve a intentarlo');
					return;
				}
			} catch (err) {

			}

			data.urlToReturnFromProduct = 'search-products.html?productsLoaded=' + (viewModel.mainResults().length == 0 ? 'n' : 'y') + '&showDeep=' + (viewModel.displayedList() == '2' ? 'y' : 'n');
			$.mobile.changePage('product-detail.html?productId=' + product.productId + '&productName=' + product.productName);
		},

		searchWithCatalog : function(catalog) {
			viewModel.selectedCatalogId(catalog.catalogId);
			viewModel.selectedBrandId("-1");
			$('#popupFilters').popup('close');
			viewModel.searchRemote(viewModel.searchText());
		},

		searchWithBrand : function(brand) {
			viewModel.selectedCatalogId("-1");
			viewModel.selectedBrandId(brand.brandId);
			$('#popupFilters').popup('close');
			viewModel.searchRemote(viewModel.searchText());
		},

		loadHistoryList : function() {

			models.products.getProductsFromHistoryOnBd().done(function(response) {
				viewModel.historyResults(response);
				$('.results').listview('refresh');
			}).fail((function(data) {
				console.log('ERROR ' + data);
			}));

		},

		addProductToHistory : function(product) {
			models.products.addProductToHistory(product);
		}

	};

	viewModel.searchText.subscribe(function(keyword) {

		clearTimeout(timerL);
		clearTimeout(timerR);
		viewModel.showLocalList(false);

		if (typeof keyword != 'undefined' && $.trim(keyword) != '' && $.trim(keyword).length > 2) {

			timerL = setTimeout(function() {
				viewModel.searchLocal(viewModel.searchText());
				// viewModel.showHistoryList(false);
			}, 500);

			timerR = setTimeout(function() {
				viewModel.searchRemote(viewModel.searchText());
			}, 1000);

		} else {
			viewModel.mainResults([]);
		}

	});

	viewModel.selectedSort.subscribe(function() {

		if (viewModel.selectedSort() == "1") {
			viewModel.otherResults.sort(function(left, right) {
				return left.productName == right.productName ? 0 : (left.productName < right.productName ? -1 : 1)
			});
		} else {
			viewModel.otherResults.sort(function(left, right) {
				return left.productName == right.productName ? 0 : (left.productName > right.productName ? -1 : 1)
			});
		}

	});

	$page.on('pagebeforecreate', function() {

		data.urlToReturnFromCart = '/app/views/search-products.html';
		data.urlToReturnFromProduct = 'search-products.html';

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);

		var showSearch = pageUrl.param('productsLoaded') || documentUrl.param('productsLoaded');
		var showDeep = pageUrl.param('showDeep') || documentUrl.param('showDeep');

		if (showSearch == 'y') {
			viewModel.mainResults(models.products.byNameSearchProducts);
			viewModel.displayedList('1');
			// viewModel.showLocalList(true);
			if (showDeep == 'y') {
				viewModel.otherResults(models.products.byDeepSearchProducts);
				$('.input-group').slideUp('fast');
				viewModel.displayedList('2');
				viewModel.otherResultsLoaded(true);
			}
			try {
				setTimeout(function() {
					$('#search-products #history-list-local').css('min-height', $('#search-list-local').css('height'));
				}, 250);
			} catch (e) {
				console.log(e);
			}
		}

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {
		viewModel.showFooter(true);
		// viewModel.otherResultsLoaded(false);
		viewModel.showHistoryList(true);
		viewModel.loadHistoryList();
		viewModel.cartCount(customer.items().cartItems.length);
		viewModel.selectedCatalogId('-1');
		viewModel.selectedBrandId('-1');
		data.urlToReturnFromProduct = '';
		// $('#search-products .ui-content').css('min-height',
		// window.screen.height);

	});
})();