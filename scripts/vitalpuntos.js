//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

var $page = $($('script').last()).closest('[data-role="page"]');
var viewModel = {

	isLoaded : ko.observable(false),

	promotionsQuantity : 0,

	temporalPromotionsCount : 0,

	customerName : ko.observable(localStorage.getItem('nombrePersona')),

	customerType : ko.observable(localStorage.getItem('segmentoPersona')),

	points : ko.observable(''),

	pointsToExpire : ko.observable(''),

	lastAcumulationDate : ko.observable(''),

	expirationDate : ko.observable(''),

	lastTradeDate : ko.observable(''),

	images : ko.observableArray([]),

	getVitalpointsData : function() {
		models.CustomerActions.getVitalpointsData().done(function(response) {

			viewModel.isLoaded(true);
			var thisToday = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
			var thisPoints = 'no disponible';
			var thisPointsToExpire = 'no disponible';
			var thisLastAcumulationDate = 'no disponible';
			var thisExpirationDate = 'no disponible';
			var thisLastTradeDate = 'no disponible';

			if (response.saldo != null) {
				thisPoints = response.saldo;
			}

			if (response.vitalpuntosPorCaducar != null) {
				thisPointsToExpire = response.vitalpuntosPorCaducar;
			}
			if (response.fechaUltimaAcumulacion != null) {
				if (new Date(response.fechaUltimaAcumulacion).getTime() == thisToday.getTime()) {
					thisLastAcumulationDate = 'hoy';
				} else {
					thisLastAcumulationDate = response.fechaUltimaAcumulacion;
				}
			}
			if (response.fechaPorCaducar != null) {
				if (new Date(response.fechaPorCaducar).getTime() == thisToday.getTime()) {
					thisExpirationDate = 'hoy';
				} else {
					thisExpirationDate = response.fechaPorCaducar;
				}
			}
			if (response.fechaUltimoCanje != null) {
				if (new Date(response.fechaUltimoCanje).getTime() == thisToday.getTime()) {
					thisLastTradeDate = 'hoy';
				} else {
					thisLastTradeDate = response.fechaUltimoCanje;
				}
			}

			viewModel.points(thisPoints);
			viewModel.pointsToExpire(thisPointsToExpire);
			viewModel.lastAcumulationDate(thisLastAcumulationDate);
			viewModel.expirationDate(thisExpirationDate);
			viewModel.lastTradeDate(thisLastTradeDate);

		});
	},

	getPromotions : function() {

		models.DataRequests.getVitalcardPromotions().done(function(response) {
			viewModel.promotionsQuantity = response.length;
			$.each(response, function() {
				viewModel.getPromotionImage(this);
			});
		});

	},

	getPromotionImage : function(promotion) {

		models.DataRequests.getVitalcardPromotionImage({
			code : promotion.Code
		}).done(function(response) {
			viewModel.images.push({
				url : promotion.Link,
				image64 : 'data: ' + response.mimeType + ';base64,' + response.imageString
			});

			viewModel.temporalPromotionsCount++;
			if (viewModel.temporalPromotionsCount == viewModel.promotionsQuantity) {
				$("#imagesCarousel").owlCarousel({
					navigation : false, // Show next and prev buttons
					slideSpeed : 300,
					pagination : false,
					paginationSpeed : 400,
					singleItem : true
				});
			}

		});

	}

}

$page.on('pagebeforecreate', function() {
	ko.applyBindings(viewModel, $page[0]);
	try {
		viewModel.getVitalpointsData();
		viewModel.getPromotions();
	} catch (e) {

	}
}).on('pageshow', function() {

});
