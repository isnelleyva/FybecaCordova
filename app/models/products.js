(function() {
	'use strict';

	window.models = window.models || {};

	var callProductsService;

	models.products = {

		byNameSearchProducts : [],

		byDeepSearchProducts : [],

		getItemsByProductsId : function(id) {
			var deferred = $.Deferred();

			$.mobile.loading("show", {
				text : 'Consultando presentaciones',
				textVisible : true,
				theme : 'b'
			});

			invokeService({
				url : config.appUrl,
				service : 'obtenerPresentacionesProductosCd',
				dataType : 'jsonp',
				data : {
					codigoProducto : id
				},
				cache : {
					key : id,
					time : config.cacheTimeouts.getClubProducts
				},
				success : function(data) {

					var response = {
						success : true,
						data : {
							items : data
						}
					}

					deferred.resolve(response);
				},
				error : function() {
					showMessage(defaultErrorMsg, null, 'Mensaje');
					$.mobile.loading('hide');
				}
			});

			return deferred.promise();

		},

		getProductsFromHistoryOnBd : function(keyword) {

			var deferred = $.Deferred();

			db.transaction(function(tx) {
				tx.executeSql('SELECT * FROM wanted_products ORDER BY last_visit DESC LIMIT 10', [], function(tx, result) {

					var len = result.rows.length;
					var response = [];

					for (i = 0; i < len; i++) {
						var item = result.rows.item(i);
						var itemName = item.name;
						try {
							itemName = itemName.toLowerCase();
						} catch (e) {
							// TODO: handle exception
						}
						response.push({
							"productId" : item.id,
							"productName" : itemName,
						});

					}

					deferred.resolve(response);

				});
			});

			return deferred.promise();

		},

		getProductsByKeywordFromBD : function(keyword) {

			var deferred = $.Deferred();

			ProductRepository.search(keyword, function(results) {
				deferred.resolve(results);
			});

			return deferred.promise();

		},

		getProductsByKeywordFromService : function(keyword, catalogId, brandId) {

			var deferred = $.Deferred();
			if (callProductsService != undefined) {
				callProductsService.abort();
			}
			$('#deepSearchLoading').css('display', '');

			var invocation = invokeService;

			if (typeof (cordova) == 'undefined') {
				console.log('XXXXXXXXXX NO HAY CORDOVA');
				invocation = invokeService;
			}

			callProductsService = invocation({
				// url : config.appUrl,
				// service : "buscarProductoPorNombreCd",
				// dataType : 'jsonp',
				// data : {
				// busqueda : keyword,
				// marca : brandId,
				// categoria : catalogId,
				// codigoAplicacion : config.appCode
				// },
				url : config.locUrl,
				service : "itemServices/getDeepSearch",
				dataType : 'json',
				timeout : config.timeouts.getProductsByKeyword,
				data : {
					keyword : keyword,
					si : 0,
					ei : 25,
					brand : brandId,
					cat : catalogId,
					codigoAplicacion : config.appCode
				},
				cache : {
					key : keyword + brandId + catalogId,
					time : config.cacheTimeouts.getClubProducts
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					$('.products-loading').slideUp('fast');
					$('#deepSearchLoading').css('display', 'none');
					if (data.response.msgUsr != undefined && data.response.msgUsr != '') {
						// showMessageText(data.response.msgUsr, 5000);
					}
				}
			});

			return deferred.promise();

		},

		getFiltersByKeyword : function(keyword) {
			// debugger;
		},

		getProductsByCatalog : function(catalogId, filter, lastProduct) {

			var deferred = $.Deferred();

			invokeService({
				url : config.appUrl,
				service : "obtenerProductosPorCategoriasCd",
				dataType : 'jsonp',
				data : {
					codigoCasa : catalogId,
					codUltProdConsultado : lastProduct,
					filtro : filter,
					codigoAplicacion : config.appCode
				},
				cache : {
					key : catalogId + '_' + lastProduct,
					time : config.cacheTimeouts.getProductsByCatalogId
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

		getCatalogsParents : function() {

			var deferred = $.Deferred();

			db.transaction(function(tx) {
				tx.executeSql('SELECT * FROM product_types ORDER BY product_types_order', [], function(tx, result) {

					deferred.resolve(result);

				});
			});

			return deferred.promise();

		},

		getSubCatalogs : function(catalogId) {

			var deferred = $.Deferred();

			db.transaction(function(tx) {
				tx.executeSql('SELECT * FROM categories WHERE product_type_id = ' + catalogId + ' ORDER BY categories_order', [], function(tx, result) {

					deferred.resolve(result);

				});
			});

			return deferred.promise();

		},

		getSubSubCatalogs : function(subCatalogId) {

			var deferred = $.Deferred();

			db.transaction(function(tx) {
				tx.executeSql('SELECT * FROM sub_categories WHERE category_id = ? ORDER BY description', [ subCatalogId ], function(tx, result) {

					deferred.resolve(result);

				});
			});

			return deferred.promise();

		},

		getItemVademecum : function(itemId) {

			var deferred = $.Deferred();
			invokeService({
				url : config.locUrl,
				service : "itemServices/vademecumInfo",
				dataType : 'json',
				data : {
					itemId : itemId
				},
				cache : {
					key : 'vad_' + itemId,
					time : config.cacheTimeouts.getClubProducts
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

		addProductToHistory : function(product) {

			if (product.productName && product.productName != '') {
				db.transaction(function(tx) {
					tx.executeSql('SELECT * FROM wanted_products WHERE id = ' + product.productId, [], function(tx, result) {

						var len = result.rows.length;

						if (len > 0) {
							var item = result.rows.item(0);
							tx.executeSql('UPDATE wanted_products SET visits = ' + (item.visits + 1) + ', last_visit = ' + (new Date().getTime()) + ' WHERE id = ' + product.productId, [], function(tx, result) {

							});
						} else {

							tx.executeSql('INSERT INTO wanted_products VALUES (' + product.productId + ',"' + product.productName + '",1,' + (new Date().getTime()) + ')', [], function(tx, result) {

							});

						}

					});
				});
			}

		}

	};

})();