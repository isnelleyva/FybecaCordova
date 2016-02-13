(function() {

	window.models = window.models || {};

	models.checkoutCalls = {

		getDiscountCards : function(data) {

			var deferred = $.Deferred();

			var userId = '';
			var userIdType = '';
			var tipoCon = 'B'; // B Neighborhood, F Pharmacy
			var valorCon = ''; // Neighborhood or pharmacy id

			if (customer.isGuest()) {
				userId = '00000000';
				userIdType = 'I';
			} else {
				userId = localStorage.idPersona;
				userIdType = localStorage.tipoId == 'C' ? 'I' : 'I';
			}

			valorCon = data.neighborhoodId;

			var dco = models.servicesBodies.discountCard.mensajeWeb.cabeceraTarjetasDescuento;

			dco.tipocon = tipoCon;
			dco.valorcon = valorCon;
			dco.codpersona = userId;
			dco.tipoid = userIdType;

			var checkoutObject = models.servicesBodies.discountCard;
			checkoutObject.mensajeWeb.cabeceraTarjetasDescuento = dco;

			// var discountCards = [];
			// discountCards.push({
			// descripcion : 'SIN DESCUENTO',
			// tarjeta : 0
			// }, {
			// descripcion : 'VITALCARD',
			// tarjeta : 'H491680010'
			// });
			// deferred.resolve(discountCards);

			invokeXmlService({
				url : config.chUrl,
				service : 'tarjetasDescuentoPost/xml',
				dataType : 'json',
				data : checkoutObject,
				success : function(response) {
					var discountCards = [];
					discountCards.push({
						descripcion : 'SIN DESCUENTO',
						tarjeta : 0
					});
					if (Array.isArray(response.detallestarjetasdescuento.detalletarjetasdescuento)) {
						$.each(response.detallestarjetasdescuento.detalletarjetasdescuento, function() {
							discountCards.push(this);
						})
					} else {
						if (response.detallestarjetasdescuento != '') {
							discountCards.push(response.detallestarjetasdescuento.detalletarjetasdescuento)
						}
					}

					deferred.resolve(discountCards);

				},
				error : function(data) {
					// deferred.resolve([ '0000000' ]);

					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		getPaymentTypes : function(data) {

			var deferred = $.Deferred();

			var userId = '';
			var tipoCon = 'B'; // B Neighborhood, F Pharmacy
			var valorCon = ''; // Neighborhood or pharmacy id

			if (customer.isGuest()) {
				userId = '0';
			} else {
				userId = localStorage.codigoPersona;
			}

			valorCon = data.neighborhoodId;

			var pty = models.servicesBodies.paymentTypes.mensajeWeb.cabeceraFormasPago;

			pty.tipocon = tipoCon;
			pty.valorcon = data.neighborhoodId;
			pty.codpersona = userId;
			pty.tdescuento = data.discountCard;

			var checkoutObject = models.servicesBodies.paymentTypes;
			checkoutObject.mensajeWeb.cabeceraFormasPago = pty;

			invokeXmlService({
				url : config.chUrl,
				service : 'formasPagoPost/xml',
				dataType : 'json',
				data : checkoutObject,
				success : function(response) {

					var paymentTypes = [];

					paymentTypes.push({
						tipo : 'E',
						descripcion : 'EFECTIVO',
						tarjeta : '',
						clase : 'EFECTIVO'
					});

					if (Array.isArray(response.detallesformaspago.detalleformaspago)) {
						$.each(response.detallesformaspago.detalleformaspago, function() {
							paymentTypes.push(this);
						})
					} else {
						paymentTypes.push(response.detallesformaspago.detalleformaspago)
					}
					$.each(paymentTypes, function() {
						if (this.tipo == 'T') {
							this.tarjeta = '0000000';
						}
					});

					deferred.resolve(paymentTypes);

				},
				error : function(data) {

					deferred.reject(data);

				}
			});

			return deferred.promise();

		},

		getCreditTypes : function(data) {

			var deferred = $.Deferred();
			var tipoCon = 'B';

			var cty = models.servicesBodies.creditTypes.mensajeWeb.cabeceraTiposCredito;

			cty.tipocon = tipoCon;
			cty.valorcon = data.neighborhoodId;
			cty.tipo = data.creditCardType;
			cty.tarjeta = data.creditCard;

			// var creditTypes = [];
			// creditTypes.push({
			// codigo : 1,
			// descripcion : 'Corriente',
			// emisor : 'Diners'
			// });
			// deferred.resolve(creditTypes);

			var checkoutObject = models.servicesBodies.creditTypes;
			checkoutObject.mensajeWeb.cabeceraTiposCredito = cty;

			invokeXmlService({
				url : config.chUrl,
				service : 'tiposCreditoPost/xml',
				dataType : 'json',
				data : checkoutObject,
				success : function(response) {

					var creditTypes = [];

					if (!Array.isArray(response.detallestiposcredito.detalletipocredito)) {
						creditTypes.push({
							codigo : response.detallestiposcredito.detalletipocredito.codigo,
							descripcion : response.detallestiposcredito.detalletipocredito.descripcion,
							emisor : response.detallestiposcredito.detalletipocredito.emisor
						});
					} else {
						$.each(response.detallestiposcredito.detalletipocredito, function() {
							creditTypes.push({
								codigo : this.codigo,
								descripcion : this.descripcion,
								emisor : this.emisor
							});
						});
					}

					deferred.resolve(creditTypes);

				},
				error : function(data) {

					deferred.reject(data);

				}
			});

			return deferred.promise();

		},

		getPrices : function(data) {

			var deferred = $.Deferred();

			var pri = models.servicesBodies.prices.mensajeWeb;

			pri.cabeceraFactura.tipocon = "B";
			pri.cabeceraFactura.valorcon = data.neighborhoodId;

			pri.detallesFormasPago.detFPago.tipo = data.creditCardType;
			pri.detallesFormasPago.detFPago.tarjeta = data.creditCard;
			pri.detallesFormasPago.detFPago.tdescuento = data.discountCard;
			pri.detallesFormasPago.detFPago.codtipocredito = data.creditType;

			var detFacts = new Array();
			detFacts = [];

			models.servicesBodies.prices.mensajeWeb.detallesFactura.detFac = [];
			$.each(data.items, function() {
				var item = $.extend({}, models.servicesBodies.prices.mensajeWeb.detallesFactura.detFac, {
					tipo : 'COMPRA',
					item : this.itemId(),
					present : (this.price.unit() == 1) ? 'C' : 'U',
					cant : this.state.quantity(),
					stockm : 3
				});

				detFacts.push(item);
			});

			pri.detallesFactura.detFac = detFacts;

			var checkoutObject = models.servicesBodies.prices;
			checkoutObject.mensajeWeb = pri;

			invokeXmlService({
				url : config.chUrl,
				service : 'calculaPreciosPost/xml',
				dataType : 'json',
				data : checkoutObject,
				success : function(response) {

					if (response.estado == "1") {
						var items = [];
						checkoutCart.pharmacyMain = response.codigofarmaciafactura;
						checkoutCart.pharmacyAux = response.farmaciaalterna;
						checkoutCart.pharmacyF = response.codigof;
						checkoutCart.pharmacyC = response.codigoc;

						$.each(response.detallesprecio.detalleprecio, function() {
							var sItemId = this.item;
							var sPrice = this.fybeca; // fybecaPrice
							var pPrice = this.pvp; // publicPrice

							var localStock = 0;
							var cityStock = 0;

							if (sItemId == 'S7') {
								checkoutCart.cart.summary.shipping(parseFloat(this.fybeca));
							} else {
								$.each(this.detallesStock.detalleStock, function() {
									if (this.tipo == 'C') {
										cityStock = parseInt(this.cantidad);
									} else if (this.tipo == 'F') {
										localStock = parseInt(this.cantidad);
									}
								})
							}

							$.each(customer.items().cartItems, function() {
								if (sItemId == this.itemId) {

									var is2Shipments = (localStock != cityStock);

									items.push({
										itemId : this.itemId,
										imageUrl : this.imageUrl,
										name : this.name,
										price : {
											presentation : (parseFloat(sPrice) * this.price.unit) * (1 + this.taxRate / 100),
											unit : this.price.unit,
											pvp : (parseFloat(pPrice) * this.price.unit) * (1 + this.taxRate / 100),
										},
										state : {
											localStock : localStock,
											cityStock : cityStock,
											quantity : this.state.quantity,
											container : this.state.container,
											is2Shipments : is2Shipments
										},
										taxRate : this.taxRate,
										upc : this.upc,
										saleUnit : this.saleUnit
									});

									if (is2Shipments) {
										checkoutCart.isShipmentsElegible(is2Shipments);
									} else {
										checkoutCart.hasOneShipmentElement(true);
									}
									return false;

								}

							});

						});
					}

					deferred.resolve(items);

				},
				error : function(data) {

					deferred.reject(data);

				}
			});

			return deferred.promise();

		},

		makePayment : function() {

			var deferred = $.Deferred();

			var userCode;
			var addressId;
			var addressTypeId;
			var contactId;
			var contactTypeId;

			if (customer.isGuest()) {
				userCode = '000000000';
				addressId = '0';
				addressTypeId = '4';
				contactId = '0';
				contactTypeId = '24';
			} else {
				userCode = checkoutCart.customerCode();
				try {
					if (userCode == '') {
						userCode = localStorage.codigoPersona;
					}
				} catch (e) {
					// TODO: handle exception
				}
				addressId = checkoutCart.shippingAddress().addressId();
				addressTypeId = checkoutCart.shippingAddress().addressType;
				contactId = checkoutCart.contactId;
				contactTypeId = checkoutCart.contactType;
			}

			// Cabecera
			var payCab = models.servicesBodies.payment.mensajeWeb.cabeceraFactura;
			payCab.barrio = checkoutCart.shippingAddress().neighborhoodId();
			payCab.tipoEntrega = 'F';
			payCab.codigoFarmaciaFactura = checkoutCart.pharmacyMain;
			payCab.farmaciaAlterna = checkoutCart.pharmacyAux;

			// detallePersona
			var payDcu = models.servicesBodies.payment.mensajeWeb.detallePersona;

			var names = checkoutCart.customerName().replace(/  /g, ' ').split(' ');
			var name = names[0];
			var lastName = (names.length > 1) ? names[1] : names[0];

			payDcu.datosfactura.id = checkoutCart.customerId();
			payDcu.datosfactura.nombre = name;
			payDcu.datosfactura.apellido = lastName;
			payDcu.datosfactura.apellidom = '';
			payDcu.datosfactura.direccion = checkoutCart.shippingAddress().addressText();

			payDcu.persona.cod = checkoutCart.customerCode();
			payDcu.persona.tipoid = checkoutCart.customerIdType();
			payDcu.persona.id = checkoutCart.customerId();
			payDcu.persona.nombre1 = name;
			payDcu.persona.nombre2 = '';
			payDcu.persona.apellido1 = lastName;
			payDcu.persona.apellido2 = '';

			payDcu.direccionp.codciudad = checkoutCart.shippingAddress().cityId;
			payDcu.direccionp.cod = addressId;
			payDcu.direccionp.tipo = addressTypeId;
			payDcu.direccionp.principal = checkoutCart.shippingAddress().main;
			payDcu.direccionp.no = checkoutCart.shippingAddress().number;
			payDcu.direccionp.inter = checkoutCart.shippingAddress().intersection;
			payDcu.direccionp.ref = checkoutCart.shippingAddress().reference;

			payDcu.mediocontacto.cod = contactId;
			payDcu.mediocontacto.tipo = contactTypeId;
			payDcu.mediocontacto.valor = checkoutCart.contactType;

			// detallePago
			var payDpa = models.servicesBodies.payment.mensajeWeb.detallesFormasPago;
			var expiration = (checkoutCart.creditCardMonth != 'Selecciona un mes' ? checkoutCart.creditCardMonth : '') + "/" + checkoutCart.creditCardYear;
			payDpa.detFPago.tipo = checkoutCart.paymentTypeId;

			// var encriptedCreditCard = checkoutCart.creditCardNumber;
			var encriptedCreditCard = document.getElementById('encryptPage').contentWindow.encrypt(checkoutCart.creditCardNumber);
			// console.log('X-X-X CVV: ' + encriptedCreditCard);
			payDpa.detFPago.tarjeta = encriptedCreditCard;

			payDpa.detFPago.thabiente = checkoutCart.creditCardOwner;
			payDpa.detFPago.tpfizer = checkoutCart.pfizerCard;

			var encriptedCaducity = expiration;
			// var encriptedCaducity =
			// document.getElementById('encryptPage').contentWindow.encrypt(expiration);
			// console.log('X-X-X Caducity: ' + encriptedCaducity);
			payDpa.detFPago.fcaducidad = encriptedCaducity;

			payDpa.detFPago.codtipocredito = (checkoutCart.creditTypeId == undefined ? '' : checkoutCart.creditTypeId);

			// var encriptedCvv = checkoutCart.creditCardCcv;
			var encriptedCvv = document.getElementById('encryptPage').contentWindow.encrypt(checkoutCart.creditCardCcv);
			// console.log('X-X-X CVV: ' + encriptedCvv);
			payDpa.detFPago.codseg = encriptedCvv;

			payDpa.detFPago.tdescuento = checkoutCart.discountCard();

			var detFacts = new Array();
			detFacts = [];

			models.servicesBodies.payment.mensajeWeb.detallesFactura.detFac = [];
			$.each(checkoutCart.cart.items(), function() {

				var shipments = {
					envio : []
				};

				if (this.state.is2Shipments()) {
					if (this.state.localStock() > 0) {
						// shipments.envios.push({
						// envio : {
						// cod : checkoutCart.pharmacyF,
						// cant : this.state.localStock()
						// }
						// });

						shipments.envio.push({
							cod : checkoutCart.pharmacyF,
							cant : this.state.localStock()
						});

					}
					if (this.state.cityStock() > 0) {
						// shipments.envios.push({
						// envio : {
						// cod : checkoutCart.pharmacyC,
						// cant : this.state.cityStock()
						// }
						// });

						shipments.envio.push({
							cod : checkoutCart.pharmacyC,
							cant : this.state.cityStock()
						});

					}
				} else {
					var pharmacyToSend = checkoutCart.shipments() == 1 ? checkoutCart.pharmacyC : checkoutCart.pharmacyF;
					// shipments.envios.push({
					// envio : {
					// cod : pharmacyToSend,
					// cant : this.state.quantity()
					// }
					// });
					shipments.envio.push({
						cod : pharmacyToSend,
						cant : this.state.quantity()
					});
				}

				var item = $.extend({}, models.servicesBodies.payment.mensajeWeb.detallesFactura.detFac, {
					tipo : 'COMPRA',
					servtele : '',
					item : this.itemId(),
					fono : '',
					valor : this.price.presentation(),
					cant : this.state.quantity(),
					present : (this.price.unit() == 1) ? 'C' : 'U',
					stockm : 3,
					envios : shipments

				});

				detFacts.push(item);
			});

			var checkoutObject = models.servicesBodies.payment;

			checkoutObject.mensajeWeb.cabeceraFactura = payCab;
			checkoutObject.mensajeWeb.detallePersona = payDcu;
			checkoutObject.mensajeWeb.detallesFormasPago = payDpa;
			checkoutObject.mensajeWeb.detallesFactura.detFac = detFacts;

			if (payDcu.direccionp.cod == 'new' && !customer.isGuest()) {

				invokeService({
					url : config.locUrl,
					service : "addressServices/addAddress",
					dataType : 'json',
					data : {
						userId : localStorage.getItem('idPersona'),
						addressType : '6',
						mainStreet : checkoutCart.shippingAddress().main,
						number : checkoutCart.shippingAddress().number,
						intersection : checkoutCart.shippingAddress().intersection,
						reference : checkoutCart.shippingAddress().reference,
						phone : checkoutCart.shippingAddress().phone,
						cityId : checkoutCart.shippingAddress().cityId,
						neighborhoodId : checkoutCart.shippingAddress().neighborhoodId()
					},
					success : function(response) {

						$.each(response, function() {
							this.principalAddress = ko.observable(this.principalAddress);
						});

						customer.addresses(response);

						checkoutObject.mensajeWeb.detallePersona.direccionp.cod = response[response.length - 1].addressId;
						checkoutCart.shippingAddress().addressId(response[response.length - 1].addressId);

						// setTimeout(function() {
						// var randomnumber = Math.floor(Math.random() * 9999);
						// deferred.resolve({
						// reciboimpresion : randomnumber,
						// mensajecliente : 'En poco tiempo tu orden sera
						// despachada'
						// });
						// }, 5000);

						invokeXmlService({
							url : config.chUrl,
							service : 'procesaFacturaPost/xml',
							dataType : 'json',
							data : checkoutObject,
							success : function(response) {

								deferred.resolve(response);

							},
							error : function(response) {
								$.mobile.loading("show", {
									text : 'Estamos teniendo inconvenientes, por favor vuelte a intentarlo más tarde.',
									textVisible : true,
									textonly : true,
									theme : 'b'
								});
								setTimeout(function() {
									$.mobile.loading("hide");
								}, 4000);
								console.log(data);
							}
						});

					},
					error : function(data) {
						data.isProccesingCheckout = false;
						deferred.reject(data);
					}
				});

			} else {

				// setTimeout(function() {
				// var randomnumber = Math.floor(Math.random() * 9999);
				// deferred.resolve({
				// reciboimpresion : randomnumber,
				// mensajecliente : 'En poco tiempo tu orden sera despachada'
				// });
				// }, 5000);

				invokeXmlService({
					url : config.chUrl,
					service : 'procesaFacturaPost/xml',
					dataType : 'json',
					data : checkoutObject,
					success : function(response) {
						deferred.resolve(response);
					},
					error : function(data) {
						data.isProccesingCheckout = false;
						deferred.reject(data);
					}
				});
			}

			return deferred.promise();

		},

		finalicePayment : function() {

			var deferred = $.Deferred();

			var checkoutItems = [];

			checkoutItems = $.map(checkoutCart.cart.items(), function(n, i) {
				return {
					itemId : n.itemId(),
					name : n.name(),
					quantity : n.state.quantity(),
					fybecaPrice : n.price.presentation(),
					publicPrice : n.price.pvp(),
					saleUnit : n.saleUnit()
				};
			});

			var data = {

				orderNumber : checkoutCart.orderNumber,
				itemsJson : JSON.stringify(checkoutItems),
				subtotal : checkoutCart.cart.summary.subtotal(),
				sendPrice : checkoutCart.cart.summary.shipping(),
				taxes : checkoutCart.cart.summary.tax(),
				total : checkoutCart.cart.summary.total(),
				customerName : checkoutCart.customerName(),
				customerCode : checkoutCart.customerCode(),
				customerId : checkoutCart.customerId(),
				addressId : checkoutCart.shippingAddress().addressId() == 'new' ? '-2' : checkoutCart.shippingAddress().addressId(),
				addressComplete : checkoutCart.shippingAddress().addressText(),
				neighborgoodId : checkoutCart.shippingAddress().neighborhoodId(),
				phone : checkoutCart.shippingAddress().phone,
				email : checkoutCart.customerEmail,
				paymentType : checkoutCart.paymentTypeId,
				discountCard : checkoutCart.discountCard(),
				isGuest : customer.isGuest()

			}

			invokeService({
				url : config.locUrl,
				service : "orderServices/finaliceCheckout",
				type : 'POST',
				dataType : 'json',
				data : data,
				success : function(response) {
					checkoutCart.orderId = response.value;
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		}

	};

	models.servicesBodies = {

		// tipoCon -> B for neighborhood, F for Pharmacy
		// valorcon -> Neighborhood or pharmacy id

		discountCard : {
			mensajeWeb : {
				cabeceraTarjetasDescuento : {
					tipocon : "",
					valorcon : "",
					codpersona : "",
					tipoid : ""
				}
			}
		},

		paymentTypes : {
			mensajeWeb : {
				cabeceraFormasPago : {
					tipocon : "",
					valorcon : "",
					codpersona : "",
					tdescuento : ""
				}
			}
		},

		creditTypes : {
			mensajeWeb : {
				cabeceraTiposCredito : {
					tipocon : "",
					valorcon : "",
					tipo : "",
					tarjeta : ""
				}
			}
		},

		prices : {
			mensajeWeb : {
				cabeceraFactura : {
					tipocon : "",
					valorcon : ""
				},
				detallesFormasPago : {
					detFPago : {
						tipo : "",
						tarjeta : "",
						tdescuento : "",
						codtipocredito : ""
					}
				},
				detallesFactura : {
					detFac : {
						tipo : 'COMPRA',
						item : '',
						present : '',
						cant : 1,
						stockm : ''
					}
				}
			}

		},

		payment : {
			mensajeWeb : {
				cabeceraFactura : {
					barrio : '',
					tipoEntrega : '',
					codigoFarmaciaFactura : '',
					farmaciaAlterna : ''
				},
				detallePersona : {
					datosfactura : {
						id : '',
						nombre : '',
						apellido : '',
						apellidom : '',
						direccion : '',
					},
					persona : {
						cod : '',
						tipoid : '',
						id : '',
						nombre1 : '',
						nombre2 : '',
						apellido1 : '',
						apellido2 : '',
					},
					direccionp : {
						codciudad : '',
						cod : '',
						tipo : '',
						principal : '',
						no : '',
						inter : '',
						ref : '',
					},
					mediocontacto : {
						cod : '',
						tipo : '',
						valor : '',
					}
				},
				detallesFormasPago : {
					detFPago : {
						tipo : '',
						tarjeta : '',
						thabiente : '',
						tpfizer : '',
						fcaducidad : '', // MM/YYY
						codtipocredito : '',
						codseg : '',
						tdescuento : '',
					}
				},
				detallesFactura : {
					detFac : {
						tipo : '',
						servtele : '',
						item : '',
						fono : '', // empty
						valor : '', // empty
						cant : '',
						present : '',
						stockm : '',
						envios : {
							cod : '',
							cant : ''
						}
					}
				}
			}

		}
	}

})();