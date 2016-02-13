(function() {
	'use strict';

	window.models = window.models || {};

	models.DataRequests = {

		getCities : function() {

			invokeService({
				url : config.locUrl,
				service : "cityServices/citiesList/",
				dataType : 'json',
				data : {},
				success : function(data) {
					localStorage.setItem('citiesJson', JSON.stringify(data));
					window.data.cities(JSON.parse(localStorage.getItem('citiesJson')));
					$.mobile.loading("hide");
				},
				error : function() {
					$.mobile.loading("hide");
				}

			});

		},

		getNeigborhoods : function(cityId) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : "neighborhoodServices/neighborhoodList/",
				dataType : 'json',
				data : {
					cityId : cityId
				},
				success : function(data) {
					deferred.resolve(data);
				}

			});

			return deferred.promise();

		},

		getAddressTypes : function() {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : "addressServices/addressTypes/",
				dataType : 'json',
				data : {},
				success : function(data) {
					localStorage.setItem('addressTypesJson', JSON.stringify(data));
					window.data.addressTypes(JSON.parse(localStorage.getItem('addressTypesJson')));
					deferred.resolve(data);
				}

			});

			return deferred.promise();

		},

		getVitalcardCategories : function(categoryId) {

			var deferred = $.Deferred();
			invokeService({
				url : config.svb,
				service : "Catalogs/",
				dataType : 'jsonp',
				data : {
					codeCatalog : 'CAT_VC',
					codeParent : '-1'
				},
				cache : {
					key : 'CAT_VC',
					time : categoriasCacheTimeout
				},
				success : function(data) {

					var categories = $.map(data, function(n, i) {
						return {
							code : n.Code,
							id : n.Id,
							name : n.Name
						}
					});

					deferred.resolve(categories);

				}

			});

			return deferred.promise();

		},

		getVitalcardCities : function(categoryId) {

			var deferred = $.Deferred();
			invokeService({
				url : config.svb,
				service : "Commerce",
				dataType : 'jsonp',
				cache : {
					key : 'GetCitiesCommerceVC',
					time : ciudadesCacheTimeout
				},
				data : {
					distinct : 'GetCitiesCommerceVC'
				},
				success : function(data) {

					var cities = $.map(data, function(n, i) {
						return {
							id : n.Id,
							name : n.Name,
							code : n.Code
						}
					});

					deferred.resolve(cities);

				}

			});

			return deferred.promise();

		},

		getPharmacyDetail : function(data) {

			var deferred = $.Deferred();
			invokeService({
				url : config.svb,
				service : "pharmacies",
				dataType : 'jsonp',
				data : {
					id : data.pharmacyId,
					longitude : data.longitude,
					latitude : data.latitude,
				},
				cache : {
					key : "Detail_" + data.pharmacyId,
					time : pharmaciesCacheTimeout
				},
				success : function(data) {
					deferred.resolve(data);
				},
				error : function(error) {
					deferred.reject(error);
				}

			});
			return deferred.promise();

		},

		getPharmacies : function(data) {

			var deferred = $.Deferred();

			invokeService({
				url : svb,
				service : 'pharmacies',
				dataType : 'jsonp',
				data : {
					latitude : data.latitude,
					longitude : data.longitude,
					maxDistance : data.range
				},
				success : function(response) {

					var pharmacies = $.map(response, function(n, i) {

						return {
							code : n.codigoFarmacia,
							name : n.nombreFarmacia,
							latitude : n.latitud,
							longitude : n.longitud,
							status : n.estado,
							address : n.direccion,
							distance : n.distanciaReferencia,
							closeTime : n.horaCierre,
							openTime : n.horaApertura,
							city : n.city
						}

					});

					deferred.resolve(pharmacies);

				}
			});

			return deferred.promise();

		},

		getPharmacyImage : function(pharmacyId) {

			var deferred = $.Deferred();

			invokeService({
				url : svb,
				service : 'pharmacies',
				dataType : 'jsonp',
				data : {
					sitecode : pharmacyId
				},
				cache : {
					key : "Image_" + pharmacyId,
					time : pharmaciesCacheTimeout
				},
				success : function(response) {

					deferred.resolve(response);

				}
			});

			return deferred.promise();

		},

		getQuestions : function() {

			invokeService({
				url : config.locUrl,
				service : "userServices/getSecurityQuestions/",
				dataType : 'json',
				data : {},
				success : function(data) {
					localStorage.setItem('questionsJson', JSON.stringify(data));
					window.data.questions(JSON.parse(localStorage.getItem('questionsJson')));
				}

			});

		},

		getDeviceContacts : function(keyword) {

			var deferred = $.Deferred();

			try {
				var options = new ContactFindOptions();
				options.filter = keyword;
				options.multiple = true;
				options.limit = 10;
				var filter = [ "displayName" ];
				navigator.contacts.find([ 'name', 'phoneNumbers' ], function(data) {
					deferred.resolve(data);
				}, function(error) {
					deferred.reject(error);
				}, options);

			} catch (e) {
				console.log(e);
				// deferred.resolve([ {
				// name : {
				// givenName : 'Andres',
				// familyName : 'Lopez',
				// formatted : 'Andres López'
				// },
				// phoneNumbers : [ {
				// type : 'mobile',
				// value : '098-49-99880'
				// } ]
				// }, {
				// name : {
				// givenName : 'Liliana',
				// familyName : 'Muñoz',
				// formatted : 'Liliana Muñoz'
				// },
				// phoneNumbers : [ {
				// type : 'mobile',
				// value : '0984999880'
				// },{
				// type : 'mobile',
				// value : '0984999881'
				//					},{
				//						type : 'mobile',
				//						value : '0984999882'
				//					} ]
				//				} ]);
			}

			return deferred.promise();

		},

		getVitalcardPromotions : function() {

			var deferred = $.Deferred();

			invokeService({
				url : svb,
				service : 'promotions',
				dataType : 'jsonp',
				data : {
					typeCode : 'PROM_VITC',
					accessLevelCode : 'ACC_PUB',
					lastPromotionCode : '-1'
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		getVitalcardPromotionImage : function(data) {

			var deferred = $.Deferred();

			invokeService({
				url : svb,
				service : 'promotions',
				dataType : 'jsonp',
				data : {
					code : data.code,
					typeCode : 'PROM_VITC',
					distinct : 'GET_IMAGE'
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		}

	};

})(jQuery);
