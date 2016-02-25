(function() {
	'use strict';

	window.invokeService = function(options) {

		var url = options.url + options.service, dataType = options.dataType, timestamp = new Date().getTime();

		var callType = (options.type == undefined || options.type == '') ? 'GET' : options.type;

		var parameters = [];

		var defaults = {
			url : null,
			service : null,
			data : null,
			cache : null,
			dataType : 'jsonp',
			success : null,
			error : null,
			complete : null,
			serviceName : null,
			retries : 0,
			showInternetUnavailable : true,
			isNeededActivateButtons : false
		};

		var invokeAjaxObject = $.extend({}, defaults, options);

		if (localStorage.getItem('traceService') == true && localStorage.getItem('serviceName') == options.service) {

			var timeInit = new Date().getTime();

		}

		var stringified = JSON.stringify(invokeAjaxObject.data);
		try {
			// stringified = stringified.replace(/@/g, '%40');
		} catch (e) {
			console.log(e);
		}

		var hashMD5 = hex_md5(stringified);

		if (invokeAjaxObject) {

			if (invokeAjaxObject.cache) {

				var key, cacheObject;

				if (invokeAjaxObject.cache.key)
					key = invokeAjaxObject.service + "_" + invokeAjaxObject.cache.key;
				else
					key = invokeAjaxObject.service + "_" + hashMD5;

				if (debug)
					console.log("Servicio con Cache");
				if (localStorage.getItem(key)) {
					if (debug)
						console.log("Encuentra item: " + key);
					cacheObject = JSON.parse(localStorage.getItem(key));
				} else {
					if (debug)
						console.log("No encuentra: " + key);
					// cacheObject = [];
				}

				// Si existe el item en cache
				if (cacheObject) {
					var stime = new Date().getTime();
					if (stime < cacheObject.time) {
						if (invokeAjaxObject.success) {
							if (debug)
								console.log("Objeto caché: " + JSON.stringify(cacheObject.data.resp));
							if (cacheObject.data.resp) {
								invokeAjaxObject.success(cacheObject.data.resp);
							} else {
								invokeAjaxObject.success(cacheObject.data.data);
							}
						}
						if (invokeAjaxObject.complete) {
							invokeAjaxObject.complete();
						}
						return;
					} else {
						// localStorage.removeItem(invokeAjaxObject.cache.key);
						localStorage.removeItem(key);
					}
				}
			}

			for ( var p in options.data) {
				parameters.push([ p, options.data[p] ]);

				// try {
				// parameters.push([ p, options.data[p].replace(/@/g, '%40') ]);
				// console.log(p + ' - ' + options.data[p] + ' - ' +
				// options.data[p].replace(/@/g, '%40'));
				// } catch (e) {
				// parameters.push([ p, options.data[p] ]);
				// console.log(p + ' - ' + options.data[p]);
				// }

			}

			parameters.push([ "oauth_consumer_key", "user" ], [ "oauth_timestamp", timestamp ], [ "oauth_nonce", OAuth.nonce(16).replace(/=/g, '%3') ], [ "oauth_signature_method", "HMAC-SHA1" ], [ "oauth_version", "1.0" ]);

			OAuth.SignatureMethod.sign({
				method : "GET",
				action : url,
				parameters : parameters
			}, {
				consumerSecret : config.consumerSecret,
				tokenSecret : config.tokenSecret
			});

			var timeout = options.timeout == undefined ? config.ajaxTimeout : options.timeout;

			return $.ajax({
				timeout : timeout,
				url : url,
				dataType : dataType,
				type : callType,
				retries : 0,
				data : OAuth.getParameterMap(parameters)
			}).done(function(response) {

				if (response != null && response.code != undefined) {

					if (response.code == 0) {

						if (localStorage.getItem('traceService') && localStorage.getItem('serviceName') == options.service) {

							var callTime = new Date().getTime() - timeInit;

							if (localStorage.getItem('minTimeCall') == '0') {
								localStorage.setItem('minTimeCall', callTime);
								localStorage.setItem('maxTimeCall', callTime);
							} else if (callTime < parseInt(localStorage.getItem('minTimeCall'))) {
								localStorage.setItem('minTimeCall', callTime);
							} else if (callTime > parseInt(localStorage.getItem('maxTimeCall'))) {
								localStorage.setItem('maxTimeCall', callTime);
							}

							localStorage.setItem('countServiceCalls', (parseInt(localStorage.getItem('countServiceCalls')) + 1));
							localStorage.setItem('sumServiceCalls', (parseInt(localStorage.getItem('sumServiceCalls')) + callTime));

						}

						if (debug)
							console.log('Si devuelve');
						// Guardar en el cache
						if (invokeAjaxObject.cache) {

							if (invokeAjaxObject.cache.key)
								key = invokeAjaxObject.service + "_" + invokeAjaxObject.cache.key;
							else
								key = invokeAjaxObject.service + "_" + hashMD5;

							if (debug)
								console.log("Llamada exitosa");
							if (debug)
								console.log("Cache Key: " + key);
							localStorage.setItem(key, JSON.stringify({
								"time" : new Date().getTime() + invokeAjaxObject.cache.time,
								"data" : response,
								"service" : invokeAjaxObject.service,
								"key" : invokeAjaxObject.cache.key
							}));

						}
						// $.mobile.loading('hide');
						if (response.resp != null) {
							invokeAjaxObject.success(response.resp);
						} else if (response.data != null) {
							invokeAjaxObject.success(response.data);
						} else {
							invokeAjaxObject.success(response);
						}

					} else if (invokeAjaxObject.serviceName != undefined && invokeAjaxObject.serviceName == "GetLogin") {
						if (debug)
							console.log(invokeAjaxObject.serviceName);
						invokeAjaxObject.success(response);
					} else if (invokeAjaxObject.serviceName != undefined && invokeAjaxObject.serviceName == "GetRecoverPassword") {
						if (debug)
							console.log(invokeAjaxObject.serviceName);
						invokeAjaxObject.success(response);
					} else if (response.msgUsr != undefined) {
						if (debug)
							console.log("InvokeAjax");
						if (debug)
							console.log(response);
						showMessage(response.msgUsr, null, null);
						$.mobile.loading('hide');
						// if
						// (invokeAjaxObject.isNeededActivateButtons)
						// {
						invokeAjaxObject.error(response.msgUsr, response.msgUsr, false);
						// }
					} else if (response.code == 23 || response.code == 24) {

						invokeAjaxObject.success(response);

					} else {

						// $.mobile.loading('hide');
						invokeAjaxObject.error(response.msgUsr || response.message, response.msgUsr || response.message);

					}
				} else {
					console.log("response null or undefined");
				}

			}).fail(function(jqXHR, textStatus) {
				console.log(textStatus);
				var msgError = 'Estamos teniendo inconvenientes, por favor intenta mas tarde';
				if (textStatus == 'timeout') {
					msgError = 'No hemos recibido respuesta de los servicios, intentalo nuevamente más tarde por favor';
				}

				invokeAjaxObject.error({
					response : {
						msgUsr : msgError,
						message : textStatus
					}
				})
			});

		}

	};

	window.invokeXmlService = function(options) {

		var xmlData = json2xml(options.data);
		var timestamp = new Date().getTime();

		var parameters = [];

		parameters.push([ "tipoMensaje", 'xml' ]);
		parameters.push([ "mensaje", xmlData ]);

		parameters.push([ "oauth_consumer_key", "user" ]);
		parameters.push([ "oauth_timestamp", timestamp ]);
		parameters.push([ "oauth_nonce", OAuth.nonce(16) ]);
		parameters.push([ "oauth_signature_method", "HMAC-SHA1" ]);
		parameters.push([ "oauth_version", "1.0" ]);

		OAuth.SignatureMethod.sign({
			method : "GET",
			action : "https://www.corporaciongpf.com/HUBFacturacion/",
			parameters : parameters
		}, {
			consumerSecret : config.consumerSecret,
			tokenSecret : config.tokenSecret
		});

		var data = {
			mensaje : xmlData,
			id : '123123412'
		};

		console.log('XXXXX XML SERVICE ' + options.url + options.service + ' - ' + xmlData);

		// if (options.service == 'procesaFacturaPost/xml') {
		// debugger;
		// options.success({
		// success : true,
		// reciboimpresion : 9999,
		// mensajecliente : 'all ok'
		// });
		// return;
		// }

		$.ajax({
			timeout : config.ajaxTimeoutCheckout,
			url : options.url + options.service,
			type : 'POST',
			dataType : 'xml',
			retries : 0,
			contentType : "application/x-www-form-urlencoded;charset=ISO-8859-15",
			data : OAuth.getParameterMap(parameters)
		}).done(function(xmlResponse) {

			var jsonResponse = $.xml2json(xmlResponse);

			if (jsonResponse.estado == 'OK' || jsonResponse.estado == '1') {
				options.success(jsonResponse);
			} else {
				options.error(jsonResponse);
			}

		}).fail(function(jqXHR, textStatus, errorThrown) {
			var failResponse;
			try {
				failResponse = $.xml2json(textStatus);
			} catch (e) {
				console.log(e);
				failResponse = textStatus
			}
			options.error(failResponse);

		});

	};

	window.invokeService2 = function(options) {

		try {
			// variables
			var dataType;
			var ajaxObject;
			var cacheObject = null;
			var defaults = {
				url : null,
				service : null,
				data : null,
				cache : null,
				dataType : 'jsonp',
				success : null,
				error : null,
				complete : null,
				serviceName : null,
				retries : 0,
				showInternetUnavailable : true,
				isNeededActivateButtons : false
			};
			var invokeAjaxObject = $.extend({}, defaults, options);
			var hashMD5 = hex_md5(JSON.stringify(invokeAjaxObject.data));

			var key;

			if (localStorage.getItem('traceService') == true && localStorage.getItem('serviceName') == options.service) {

				var timeInit = new Date().getTime();

			}

			if (invokeAjaxObject) {

				if (invokeAjaxObject.cache) {
					if (invokeAjaxObject.cache.key)
						key = invokeAjaxObject.service + "_" + invokeAjaxObject.cache.key;
					else
						key = invokeAjaxObject.service + "_" + hashMD5;

					if (localStorage.getItem(key)) {
						cacheObject = JSON.parse(localStorage.getItem(key));
					} else {
						cacheObject = [];
					}

					// Si existe el item en caché
					if (cacheObject) {
						var stime = new Date().getTime();
						if (stime < cacheObject.time) {
							if (invokeAjaxObject.success) {
								invokeAjaxObject.success(cacheObject.data.resp);
							}
							if (invokeAjaxObject.complete) {
								invokeAjaxObject.complete();
							}
							return;
						} else {
							localStorage.removeItem(invokeAjaxObject.cache.key);
						}
					}
				}

				// Obtener el token de seguridad que ser� enviado al servicio
				var params = {};
				params["url"] = invokeAjaxObject.url + invokeAjaxObject.service;
				var parameters = "";
				if (invokeAjaxObject.data != null) {
					for ( var p in invokeAjaxObject.data) {
						parameters += p + "=" + invokeAjaxObject.data[p] + "&";
					}
					parameters = parameters.substring(0, parameters.length - 1);
				}
				params["parameters"] = parameters;

				cordova.exec(function(result) {
					var objResult = $.parseJSON(result);
					// Agregar los nuevos parametros al servicio
					invokeAjaxObject.data.oauth_timestamp = objResult.oauth_timestamp;
					invokeAjaxObject.data.oauth_nonce = objResult.oauth_nonce;
					invokeAjaxObject.data.oauth_signature = objResult.oauth_signature;

					// Si no esta en cache
					if (navigator.connection.type != Connection.NONE) {
						dataType = invokeAjaxObject.dataType;
						$.ajax({
							timeout : ajaxTimeout,
							url : invokeAjaxObject.url + invokeAjaxObject.service,
							dataType : dataType,
							retries : 0,
							data : invokeAjaxObject.data,
							success : function(response) {

								if (invokeAjaxObject.success) {
									if (invokeAjaxObject.cache) {
										if (invokeAjaxObject.cache.key) {

										}
									}

									if (response != null) {
										// Validar la
										// estructura nueva
										// de servicios
										if (response.code != undefined) {
											// Si la
											// respuesta es
											// exitosa
											if (response.code == 0) {

												if (localStorage.getItem('traceService') && localStorage.getItem('serviceName') == options.service) { // Para
													// analizar
													// tiempos
													// de
													// servicio

													var callTime = new Date().getTime() - timeInit;
													if (localStorage.getItem('minTimeCall') == '0') {
														localStorage.setItem('minTimeCall', callTime);
														localStorage.setItem('maxTimeCall', callTime);
													} else if (callTime < parseInt(localStorage.getItem('minTimeCall'))) {
														localStorage.setItem('minTimeCall', callTime);
													} else if (callTime > parseInt(localStorage.getItem('maxTimeCall'))) {
														localStorage.setItem('maxTimeCall', callTime);
													}

													localStorage.setItem('countServiceCalls', (parseInt(localStorage.getItem('countServiceCalls')) + 1));
													localStorage.setItem('sumServiceCalls', (parseInt(localStorage.getItem('sumServiceCalls')) + callTime));

												}

												// Guardar
												// en el
												// cache
												if (invokeAjaxObject.cache) {

													if (invokeAjaxObject.cache.key)
														key = invokeAjaxObject.service + "_" + invokeAjaxObject.cache.key;
													else
														key = invokeAjaxObject.service + "_" + hashMD5;

													localStorage.setItem(key, JSON.stringify({
														"time" : new Date().getTime() + invokeAjaxObject.cache.time,
														"data" : response,
														"service" : invokeAjaxObject.service,
														"key" : invokeAjaxObject.cache.key
													}));

												}
												// $.mobile.loading('hide');
												invokeAjaxObject.success(response.resp);

											} else if (invokeAjaxObject.serviceName != undefined && invokeAjaxObject.serviceName == "GetLogin") {
												if (debug)
													console.log(invokeAjaxObject.serviceName);
												invokeAjaxObject.success(response);
											} else if (invokeAjaxObject.serviceName != undefined && invokeAjaxObject.serviceName == "GetRecoverPassword") {
												if (debug)
													console.log(invokeAjaxObject.serviceName);
												invokeAjaxObject.success(response);
											} else if (response.msgUsr != undefined) {
												if (debug)
													console.log("InvokeAjax");
												if (debug)
													console.log(response);
												showMessage(response.msgUsr, null, null);
												$.mobile.loading('hide');
												// if(isNeededActivateButtons){
												if (invokeAjaxObject.isNeededActivateButtons) {
													// isNeededActivateButtons=false;
													invokeAjaxObject.error(response.msgUsr, response.msgUsr, false);
												}
												// isNeededActivateButtons=false;

											} else {
												invokeAjaxObject.error(response.msgUsr, response.msgUsr);
												$.mobile.loading('hide');
											}

										} else {
											$.mobile.loading('hide');
											if (debug)
												console.log("Servicio sin la nueva estructura");
											showMessage(badResponseMessage, null, null);

										}

									}
									// Si la respuesta es
									// nula
									else {
										$.mobile.loading('hide');
										if (debug)
											console.log("Respuesta nula");
										showMessage(badResponseMessage, null, null);
									}

								}
							},
							error : function(e, message) {
								$.mobile.loading('hide');
								if (debug)
									console.log("Error llamada: " + message);
								if (debug)
									console.log(e);
								if (invokeAjaxObject.error) {
									invokeAjaxObject.error(e, message);
								} else {
									ajaxError();
								}
							},
							complete : function(object, message) {

								if (invokeAjaxObject.cache) {
									if (invokeAjaxObject.cache.key) {
									}
								} else if (invokeAjaxObject.url) {

								}
								if (invokeAjaxObject.complete) {
									invokeAjaxObject.complete(object, message);
								}
							}
						});
					}
					// No hay conexión a internet
					else {
						if (invokeAjaxObject.showInternetUnavailable) {
							ShowMessageInternetNotAvailable();
						}

						$.mobile.loading('hide');
					}
				}, encryptErrorHandler, "Encrypt", "encryptHmacSHA1", [ params ]);
				return;
			} else {
				if (debug)
					console.log("Parametro no enviado");
			}
		} catch (err) {
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}

	}

})();