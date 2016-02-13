(function() {
	'use strict';

	window.Cart = function() {
		var self = this;

		self.items = ko.mapping.fromJS([]), self.summary = {};

		self.summary.shipping = ko.observable(0);

		self.summary.tax = ko.computed(function() {
			var tax = 0, total;
			$.each(self.items(), function() {
				total = (this.price.presentation() / this.saleUnit()) * this.state.quantity();
				tax += total / (this.taxRate() / 100 + 1) * (this.taxRate() / 100);
			});
			return tax;
		});

		self.summary.total = ko.computed(function() {
			// return self.summary.subtotal() + self.summary.tax()
			// + self.summary.shipping();
			var subtotal = 0;
			$.each(self.items(), function() {
				subtotal += (this.price.presentation() / this.saleUnit()) * this.state.quantity();
				// subtotal += total / 1 + (this.taxRate() / 100);
				subtotal = subtotal / 1;
			});

			return subtotal;
		});

		self.summary.subtotal = ko.computed(function() {
			// var subtotal = 0, total;
			// $.each(self.items(), function() {
			// total = (this.price.presentation() / this.saleUnit())
			// * this.state.quantity();
			// // subtotal += total / 1 + (this.taxRate() / 100);
			// subtotal += total / 1;
			// });
			return self.summary.total() - self.summary.shipping() - self.summary.tax();
		});

		self.hasPfizerItems = ko.computed(function() {
			var hasPfizer = false;
			$.each(self.items(), function() {
				if (this.isPfizer) {
					hasPfizer = true;
					return false;
				}
			});
			return hasPfizer;
		});

		self.add = function(data) {

			if (data.item().quantity() == "") {
				$.mobile.loading("show", {
					text : 'Indicanos la cantidad requerida',
					textVisible : true,
					textonly : true,
					theme : 'b'
				});

				setTimeout(function() {
					$.mobile.loading("hide");
				}, 3000);

				return false;
			}

			try {

				var currQuantity = parseInt(data.item().quantity());
				if (currQuantity < 1 || currQuantity > 99) {
					$.mobile.loading("show", {
						text : 'Puedes agregar una cantidad entre 1 y 99 items',
						textVisible : true,
						textonly : true,
						theme : 'b'
					});

					setTimeout(function() {
						$.mobile.loading("hide");
					}, 3000);

					return false;
				}

			} catch (e) {
				console.log(e);
			}

			if (!customer.isAuthenticated() && !customer.isGuest()) {
				$('#popupLogin').popup('open', {
					positionTo : "window"
				});
			} else if (customer.isAuthenticated() || customer.isGuest()) {

				$.mobile.loading("show", {
					text : 'Agregando producto',
					textVisible : true,
					theme : 'b'
				});

				models.cart.add(data.item()).done(function(newItem) {

					$.mobile.loading("show", {
						text : 'Agregado',
						textVisible : true,
						textonly : true,
						theme : 'b'
					});

					var existOnCart = false;

					if (customer.items().cartItems.length == 0) {
						customer.items().cartItems = [];
					}

					$.each(customer.items().cartItems, function() {
						if (this.itemId == newItem.itemId) {

							this.state.quantity = newItem.state.quantity;
							if (this.price.unit == 1) {
								this.price.unit = newItem.price.unit;
							}
							if (this.showPhoto == undefined) {
								this.showPhoto = ko.observable(true);
							}
							existOnCart = true;

							return false;
						}
					});

					if (!existOnCart) {
						if (newItem.showPhoto == undefined) {
							newItem.showPhoto = ko.observable(true);
						}
						newItem.isEditing = ko.observable(false);
						newItem.wasEditing = ko.observable(false);
						customer.items().cartItems.push(newItem);
					}

					setTimeout(function() {
						$.mobile.loading('hide');
						$.mobile.changePage('my-cart.html');
					}, 2000);

				}).fail(function(error) {

					$.mobile.loading("hide");
					var errorMsg = 'Estamos teniendo inconvenientes, por favor vuelte a intentarlo más tarde.<br><a href="#" data-bind="click: closeContactUsMessage">Cerrar</a>';
					try {
						if (typeof (error) == 'string') {
							showMessageTextClose(error);
						}
					} catch (e) {
					}

					console.log(data);

					console.log(error);

					// $.mobile.loading("show", {
					// html : error,
					// textVisible : true,
					// textonly : true,
					// theme : 'b'
					// });
					// setTimeout(function() {
					// $.mobile.loading('hide');
					// }, 5000);

				});
			}
		};

		self.save = function(data) {
			if (!customer.isAuthenticated() && !customer.isGuest()) {
				$('#popupLogin').popup('open');
			} else if (customer.isAuthenticated() || customer.isGuest()) {
				$.mobile.loading("show", {
					text : 'Guardando producto',
					textVisible : true,
					theme : 'b'
				});
				models.saved.add(data.item()).done(function(newItem) {

					$.mobile.loading("show", {
						text : 'Guardado',
						textVisible : true,
						textonly : true,
						theme : 'b'
					});
					if (customer.items().savedItems.length == 0) {
						customer.items().savedItems = [];
					}
					var existsOnSaved = false;
					$.each(customer.items().savedItems, function() {
						if (this.itemId == newItem.itemId) {
							existsOnSaved = true;
							this.state.quantity += 1;
						}
					});

					if (newItem.showPhoto == undefined) {
						newItem.showPhoto = ko.observable(true);
					}

					if (!existsOnSaved) {
						newItem.isEditing = ko.observable(false);
						customer.items().savedItems.push(newItem);
					}
					setTimeout(function() {
						$.mobile.loading('hide');
						$.mobile.changePage('my-cart.html');
					}, 1500);
				}).fail(function(error) {
					console.log(error);
					$.mobile.loading("show", {
						text : 'No se pudo guardar tu producto, inténtalo mas tarde por favor',
						textVisible : true,
						textonly : true,
						theme : 'b'
					});
					setTimeout(function() {
						$.mobile.loading('hide');
					}, 3000);

				});
			}
		};

		self.edit = function() {

		};

		self.remove = function(item) {
			return models.cart.remove(item.itemId());
		};

		self.itemsCount = ko.observable(0);
	};

	window.models = window.models || {};
	window.cartCount = 0;

	models.cart = {

		getItems : function(userId) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : "cartServices/getItems",
				dataType : 'json',
				data : {
					userId : userId
				},
				success : function(response) {

					$.each(response.cartItems, function() {
						this.state.localStock = 0;
						this.state.cityStock = 0;
						this.state.is2Shipments = false;
						this.isEditing = ko.observable(false);
						this.wasEditing = ko.observable(false);
						if (this.showPhoto == undefined) {
							this.showPhoto = ko.observable(true);
						}
					});
					$.each(response.savedItems, function() {
						this.isEditing = ko.observable(false);
						if (this.showPhoto == undefined) {
							this.showPhoto = ko.observable(true);
						}
					});

					customer.items(response)
					deferred.resolve(response);

				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		get : function() {
			// var deferred = $.Deferred();
			// if (typeof cartItems == 'undefined') {
			// $.ajax({
			// url : '../data/cart.json',
			// data : {},
			// dataType : 'json',
			// method : 'GET'
			// }).done(function(response) {
			// window.cartItems = ko.observableArray(response.data);
			// deferred.resolve(response);
			// });
			// } else {
			// deferred.resolve({
			// success : true,
			// data : cartItems
			// });
			// }
			// return deferred.promise();
		},

		add : function(data) {

			var deferred = $.Deferred();

			if (customer.addresses().length == 0 && !customer.isGuest() && customer.isAuthenticated()) {
				deferred.reject('No dispones de una dirección para consultar los items');
			} else {

				var neighborhoodId;
				var cityId;
				var userId;

				if (customer.isGuest()) {
					neighborhoodId = customer.selectedGuestNeighborhood();
					cityId = customer.selectedGuestCity();
				} else {

					var selectedAddress;
					$.each(customer.addresses(), function() {
						if (this.addressId == customer.selectedAddress()) {
							selectedAddress = this;
							return false;
						}
					});

					neighborhoodId = selectedAddress.neighborhoodId;
					cityId = selectedAddress.cityId;

				}

				var userId = customer.isGuest() ? '00000000' : localStorage.getItem('idPersona');

				invokeService({
					url : config.locUrl,
					service : "cartServices/addItemOnCart",
					dataType : 'json',
					data : {
						userId : userId,
						itemId : data.itemId,
						presentation : data.selectedPresentation(),
						quantity : data.quantity(),
						action : 1,
						neighborhoodId : neighborhoodId,
						cityId : cityId
					},
					success : function(response) {
						response.state.localStock = 0;
						response.state.cityStock = 0;
						response.state.is2Shipments = false;
						deferred.resolve(response);
					},
					error : function(data) {
						deferred.reject(data);
					}
				});

			}

			return deferred.promise();
		},

		edit : function(data) {

			var deferred = $.Deferred();
			var neighborhoodId;
			var cityId;
			var userId;

			if (customer.isGuest()) {
				neighborhoodId = customer.selectedGuestNeighborhood();
				cityId = customer.selectedGuestCity();
			} else {

				var selectedAddress;
				$.each(customer.addresses(), function() {
					if (this.addressId == customer.selectedAddress()) {
						selectedAddress = this;
						return false;
					}
				});

				neighborhoodId = selectedAddress.neighborhoodId;
				cityId = selectedAddress.cityId;

			}

			var userId = customer.isGuest() ? '00000000' : localStorage.getItem('idPersona');

			invokeService({
				url : config.locUrl,
				service : "cartServices/updateItems",
				dataType : 'json',
				data : {
					userId : userId,
					jsonItems : JSON.stringify(data),
					neighborhoodId : neighborhoodId,
					cityId : cityId
				},
				success : function(response) {

					$.each(response.cartItems, function() {
						this.state.localStock = 0;
						this.state.cityStock = 0;
						this.state.is2Shipments = false;
						this.isEditing = ko.observable(false);
						this.wasEditing = ko.observable(false);
					});

					customer.items().cartItems = response.cartItems
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		remove : function(item) {
			var deferred = $.Deferred();

			if (customer.isGuest()) {
				var auxElements = new Array();
				for (i = 0; i < customer.items().cartItems.length; i++) {
					if (customer.items().cartItems[i].itemId != item.itemId()) {
						auxElements.push(customer.items().cartItems[i]);
					}
				}
				customer.items().cartItems = auxElements;
				deferred.resolve();

			} else {
				invokeService({
					url : config.locUrl,
					service : "cartServices/deleteItemFromCart",
					dataType : 'json',
					data : {
						userId : localStorage.getItem('idPersona'),
						itemId : item.itemId
					},
					success : function(response) {

						var auxElements = new Array();
						for (i = 0; i < customer.items().cartItems.length; i++) {
							if (customer.items().cartItems[i].itemId != item.itemId()) {
								auxElements.push(customer.items().cartItems[i]);
							}
						}
						customer.items().cartItems = auxElements;

						deferred.resolve(response);

					},
					error : function(data) {
						deferred.reject(data);
					}
				});
			}

			return deferred.promise();
		},

		toSaved : function(item) {
			var deferred = $.Deferred();

			if (customer.isGuest()) {

				var auxElements = new Array();

				for (i = 0; i < customer.items().cartItems.length; i++) {
					if (customer.items().cartItems[i].itemId != item.itemId()) {
						auxElements.push(customer.items().cartItems[i]);
					} else {
						customer.items().savedItems.push(customer.items().cartItems[i]);
					}
				}
				customer.items().cartItems = auxElements;

				deferred.resolve();
			} else {
				invokeService({
					url : config.locUrl,
					service : "cartServices/moveFromCartToSaved",
					dataType : 'json',
					data : {
						userId : localStorage.getItem('idPersona'),
						itemId : item.itemId,
						quantity : item.state.quantity()
					},
					success : function(response) {

						if (customer.items().savedItems.length == 0) {
							customer.items().savedItems = [];
						}

						response.isEditing = ko.observable(false);
						customer.items().savedItems.push(response);

						var auxItems = new Array();

						$.each(customer.items().cartItems, function() {
							if (this.itemId != item.itemId()) {
								auxItems.push(this);
							}
						});

						customer.items().cartItems = auxItems;
						deferred.resolve(response);

					},
					error : function(data) {
						deferred.reject(data);
					}
				});

			}

			return deferred.promise();
		},

		getIfIsOpen : function(openHour, closeHour) {

			var currTime = parseInt(new Date().getHours() + "" + ((new Date().getMinutes() < 10) ? '0' + new Date().getMinutes() : new Date().getMinutes()));

			var openTime = parseInt(openHour.split(":")[0] + openHour.split(":")[1]);

			var closeTime = parseInt(closeHour.split(":")[0] + closeHour.split(":")[1]);

			return (currTime >= openTime && currTime < closeTime);
		}

	};

	models.saved = {

		get : function() {
			var deferred = $.Deferred();
			if (typeof savedItems == 'undefined') {
				$.ajax({
					url : '../data/saved.json',
					data : {},
					dataType : 'json',
					method : 'GET'
				}).done(function(response) {

					$.each(response.data, function() {
						this.isEditing = ko.observable(false);
						// if (this.showPhoto == undefined) {
						// this.showPhoto = ko.observable(false);
						// }
					});

					window.savedItems = response.data;
					deferred.resolve(response);
				});
			} else {
				deferred.resolve({
					success : true,
					data : savedItems
				});
			}
			return deferred.promise();
		},

		add : function(data) {

			var deferred = $.Deferred();
			var userId = (customer.isGuest()) ? "-2" : localStorage.getItem('idPersona');

			invokeService({
				url : config.locUrl,
				service : "cartServices/addItemOnSaved",
				dataType : 'json',
				data : {
					userId : userId,
					itemId : data.itemId,
					presentation : data.selectedPresentation(),
					quantity : data.quantity()
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

		remove : function(item) {
			var deferred = $.Deferred();
			if (customer.isGuest()) {

				var auxElements = new Array();
				for (i = 0; i < customer.items().savedItems.length; i++) {
					if (customer.items().savedItems[i].itemId != item.itemId()) {
						auxElements.push(customer.items().savedItems[i]);
					}
				}
				customer.items().savedItems = auxElements;
				deferred.resolve();

			} else {
				invokeService({
					url : config.locUrl,
					service : "cartServices/deleteItemFromSaved",
					dataType : 'json',
					data : {
						userId : localStorage.getItem('idPersona'),
						itemId : item.itemId()
					},
					success : function(response) {
						var auxElements = new Array();
						for (i = 0; i < customer.items().savedItems.length; i++) {
							if (customer.items().savedItems[i].itemId != item.itemId()) {
								auxElements.push(customer.items().savedItems[i]);
							}
						}
						customer.items().savedItems = auxElements;
						deferred.resolve(response);
					},
					error : function(data) {
						deferred.reject(data);
					}
				});
			}

			return deferred.promise();
		},

		toCart : function(item) {

			var deferred = $.Deferred();
			var neighborhoodId;
			var cityId;
			var userId;

			if (customer.isGuest()) {
				neighborhoodId = customer.selectedGuestNeighborhood();
				cityId = customer.selectedGuestCity();
				userId = '00000000';
			} else {

				var selectedAddress;
				userId = localStorage.getItem('idPersona');
				$.each(customer.addresses(), function() {
					if (this.addressId == customer.selectedAddress()) {
						selectedAddress = this;
						return false;
					}
				});

				neighborhoodId = selectedAddress.neighborhoodId;
				cityId = selectedAddress.cityId;

			}

			invokeService({
				url : config.locUrl,
				service : "cartServices/moveFromSavedToCart",
				dataType : 'json',
				data : {
					userId : userId,
					itemId : item.itemId(),
					neighborhoodId : neighborhoodId,
					cityId : cityId,
					quantity : item.state.quantity()
				},
				success : function(response) {

					if (customer.items().cartItems.length == 0) {
						customer.items().cartItems = [];
					}

					response.isEditing = ko.observable(false);
					response.wasEditing = ko.observable(false);
					response.state.cityStock = 0;
					response.state.localStock = 0;
					response.state.is2Shipments = false;

					customer.items().cartItems.push(response);

					var auxItems = new Array();

					$.each(customer.items().savedItems, function() {
						if (this.itemId != item.itemId()) {
							auxItems.push(this);
						}
					});

					customer.items().savedItems = auxItems;
					deferred.resolve(response);

				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		}

	};

	models.localCart = new Cart();

})();