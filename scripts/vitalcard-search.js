//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {

	var $page = $($('script').last()).closest('[data-role="page"]');

	var viewModel = {

		selectedCityText : ko.observable('Selecciona una ciudad'),
		selectedCityId : '-1',
		selectedCategoryText : ko.observable('Selecciona una categoria'),
		selectedCategoryId : '-1',

		vitalcardCities : ko.observable([]),

		vitalcardCategories : ko.observable([]),

		openSearch : function() {

			cityCode = viewModel.selectedCityId;
			categoryCode = viewModel.selectedCategoryId;

			$(':mobile-pagecontainer').pagecontainer('change', 'vitalcard-search-result.html?cityId=' + viewModel.selectedCityId + 'categoryId=' + viewModel.selectedCategoryId);

		},

		chooseCity : function(city) {
			viewModel.selectedCityId = city.code;
			viewModel.selectedCityText(city.name);
			$('#popupVitalcardCities').popup('close');
		},

		chooseCategory : function(category) {
			viewModel.selectedCategoryId = category.code;
			viewModel.selectedCategoryText(category.name);
			$('#popupVitalcardCategories').popup('close');
		},

		loadVitalcardCategories : function() {

			models.DataRequests.getVitalcardCategories().done(function(response) {
				viewModel.vitalcardCategories(response);
				$page.find('#vitalcardCategoriesList').listview('refresh');
			}).always(function() {
				$.mobile.loading("hide");
			});

		},

		loadVitalcardCities : function() {

			models.DataRequests.getVitalcardCities().done(function(response) {
				viewModel.vitalcardCities(response);
				$page.find('#vitalcardCitiesList').listview('refresh');
			}).always(function() {
				$.mobile.loading("hide");
			});

		}

	}

	$page.on('pagebeforecreate', function() {

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageinit', function() {

	}).on('pageshow', function() {

		try {
			if (navigator.connection.type == Connection.NONE) {
				ShowMessageInternetNotAvailable();
				return;
			}
		} catch (err) {

		}

		$.mobile.loading("show", {
			text : 'Obteniendo ciudades y categorías',
			textVisible : true,
			theme : 'b'
		});

		viewModel.loadVitalcardCategories();
		viewModel.loadVitalcardCities();

	});

})();
