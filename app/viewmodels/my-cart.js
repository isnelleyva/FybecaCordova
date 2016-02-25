(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]'), viewModel = {

		cartCount : ko.observable(0),

		cart : new Cart(),

		saved : new Cart(),

		itemToContact : ko.observable({
			itemId : ko.observable('')
		}),

		itemToManage : ko.observable(),

		itemToManageFlag : ko.observable(false), // false:cart, true:saved

		isLoading : ko.observable(false),

		gotoMyCart : function() {

			try {
				if (navigator.connection.type == Connection.NONE) {
					ShowMessageInternetNotAvailable();
					return;
				}
			} catch (err) {

			}

			$(':mobile-pagecontainer').pagecontainer('change', 'checkout-user-data.html');

		},

		backButton : function() {

			var urlToBack = (data.urlToReturnFromCart == '') ? '../../index.html' : '../..' + data.urlToReturnFromCart;
			$(':mobile-pagecontainer').pagecontainer('change', urlToBack, {
				reverse : true
			});

		},

		toggleEdit : function() {

			// if (viewModel.viewState.editing()) {
			var productsToUpdate = new Array();

			productsToUpdate = $.map(viewModel.cart.items(), function(n, i) {
				return {
					itemId : n.itemId(),
					quantity : n.state.quantity(),
					presentation : n.saleUnit() > 1 ? 1 : 2
				}
			});

			$.mobile.loading("show", {
				text : "Actualizando",
				textVisible : true,
				theme : 'b'
			});

			models.cart.edit(productsToUpdate).done(function(response) {
				
				var messages;

				ko.mapping.fromJS(customer.items().cartItems, viewModel.cart.items);

				ko.mapping.fromJS(customer.items().savedItems, viewModel.saved.items);

				messages = response.messages;

				if (messages.length > 0) {
					var itemsNoUpdated = '';
					$.each(messages, function() {
						itemsNoUpdated += this.value + '<br>';
					})

					showMessageTextClose(itemsNoUpdated);

					// $.mobile.loading("show", {
					// html : itemsNoUpdated,
					// textVisible : true,
					// textonly : true,
					// theme : 'b'
					// });
					// setTimeout(function() {
					// $.mobile.loading("hide");
					// }, 5000);
				} else {

					showMessageText('Se actualizaron tus items correctamente');

					// $.mobile.loading("show", {
					// text : "Se actualizaron tus items correctamente",
					// textVisible : true,
					// textonly : true,
					// theme : 'b'
					// });
					//
					// setTimeout(function() {
					// $.mobile.loading("hide");
					// }, 3000);
				}

			}).fail(function(error) {
				
				try {
					showMessageTextClose(error.response.msgUsr);
				} catch (e) {
					showMessageTextClose('Se actualizaron tus items correctamente');
				}

				console.log(error);

			});
			// }

			// viewModel.viewState.editing(!viewModel.viewState.editing());

		},

		closeMessage : function() {
			$.mobile.loading("hide");
		},

		toCart : function(item) {

			$.mobile.loading("show", {
				text : 'Agregando',
				textVisible : true,
				theme : 'b'
			});

			viewModel.itemToContact(item);

			models.saved.toCart(item).done(function(data) {
				viewModel.mapCarts();
				$.mobile.loading("hide");
			}).fail(function(data) {
				$.mobile.loading("hide");
				var errorMsg = 'Estamos teniendo inconvenientes, por favor vuelte a intentarlo más tarde.<br><a href="#" data-bind="click: closeContactUsMessage">Cerrar</a>';
				try {
					if (typeof (data) == 'string') {
						showMessageTextClose(data);
					}
				} catch (e) {
				}

				console.log(data);

			});

		},

		toSaved : function(item) {

			$.mobile.loading("show", {
				text : 'Guardando',
				textVisible : true,
				theme : 'b'
			});

			models.cart.toSaved(item).done(function(data) {
				viewModel.mapCarts();
				$.mobile.loading("hide");
			}).fail(function(data) {
				$.mobile.loading("hide");
				console.log(data);
			});

		},

		deleteFromCart : function() {

			$('#popupDelete').popup('close');
			$.mobile.loading("show", {
				text : 'Eliminando',
				textVisible : true,
				theme : 'b'
			});

			models.cart.remove(viewModel.itemToManage()).done(function() {
				// viewModel.cart.items.remove(viewModel.itemToManage())
				viewModel.mapCarts();
				$.mobile.loading('hide');
				checkoutCart.itemsWithNoStock.remove(this);

			}).fail(function(error) {
				console.log(error);
				$.mobile.loading('hide');
			});

		},

		deleteFromSaved : function() {
			$('#popupDelete').popup('close');
			$.mobile.loading("show", {
				text : 'Eliminando',
				textVisible : true,
				theme : 'b'
			});

			models.saved.remove(viewModel.itemToManage()).done(function() {
				// viewModel.saved.items.remove(viewModel.itemToManage())
				viewModel.mapCarts();
				$.mobile.loading('hide');

			}).fail(function(error) {
				console.log(error);
				$.mobile.loading('hide');
			})

		},

		showPopupDeleteCart : function(item) {
			viewModel.itemToManageFlag(false);
			viewModel.itemToManage(item);
			$('#popupDelete').popup('open');
		},

		showPopupDeleteSaved : function(item) {
			viewModel.itemToManageFlag(true);
			viewModel.itemToManage(item);
			$('#popupDelete').popup('open');
		},

		closePopupDelete : function(item) {
			$('#popupDelete').popup('close');
		},

		viewState : {
			editing : ko.observable(false),
			currentItem : {
				set : function(item) {
					if (item != viewModel.viewState.currentItem.data()) {
						viewModel.viewState.currentItem.data(item);
					} else {
						viewModel.viewState.currentItem.data(null);
					}
				},
				save : function(item) {
					viewModel.viewState.currentItem.data(null);
				},
				data : ko.observable()
			}
		},

		mapCarts : function() {

			ko.mapping.fromJS(customer.items().cartItems, viewModel.cart.items);
			ko.mapping.fromJS(customer.items().savedItems, viewModel.saved.items);

		},

		updateItems : function() {

			viewModel.isLoading(true);

			models.cart.getItems(localStorage.getItem('idPersona')).always(function() {
				$.mobile.loading("hide");
				viewModel.mapCarts();
				viewModel.isLoading(false);
			});

		},

		onLoadImage : function(data, event) {
			$(event.target).css('display', '');
			$(event.target).next().css('display', 'none');
		},

		editItem : function() {
			if (this.isEditing()) {
				if (this.state.quantity() == "") {
					this.state.quantity(1);
				}
				viewModel.toggleEdit();
			}
			this.isEditing(!this.isEditing());
		},

		cancelEditItem : function() {
			this.isEditing(false);
		},

		editItemSaved : function() {
			this.isEditing(!this.isEditing());
		},

		closePopupBtn : function() {
			$(event.target).parent().parent().popup('close');
		},

		sendContactUs : function(form) {

			if ($(form).valid()) {

				var contactData = $(form).serializeObject();

				try {
					if (contactData.txtPhone == '') {
						showMessageText('Llena correctamente los campos');
						return false;
					}
				} catch (e) {
					// TODO: handle exception
				}

				if (viewModel.validatePhone(contactData.txtPhone)) {

					$('#popupContactUs').popup('close');

					contactData.itemId = viewModel.itemToContact().itemId();
					contactData.itemName = viewModel.itemToContact().name();

					$.mobile.loading("show", {
						text : 'Enviando solicitud',
						textVisible : true,
						textonly : true,
						theme : 'b'
					});

					models.CustomerActions.sendContactUsMail(contactData).done(function() {

						$.mobile.loading("show", {
							text : 'Se ha enviado tu solicitud, pronto nuestro personal se pondra en contacto contigo',
							textVisible : true,
							textonly : true,
							theme : 'b'
						});

						setTimeout(function() {
							$.mobile.loading('hide');
						}, 5000);
					}).fail(function(message) {

						$.mobile.loading("show", {
							text : 'Hubo un problema al enviar solicitud, intentalo mas tarde por favor',
							textVisible : true,
							textonly : true,
							theme : 'b'
						});

						setTimeout(function() {
							$.mobile.loading('hide');
						}, 5000);
					});

				}

			}

		},

		openContactUsPopup : function() {
			$('#popupContactUs').popup('open');
		},

		closeContactUsPopup : function() {
			$('#popupContactUs').popup('close');
		},

		reduceQuantity : function() {
			try {
				this.wasEditing(true);
				var tq = parseInt(this.state.quantity()); // tq = thisQuantity
				tq = (isNaN(tq)) ? 1 : tq;
				tq = tq - 1 < 1 ? 1 : tq - 1;
				this.state.quantity(tq);
			} catch (e) {
				// TODO: handle exception
			}
		},

		addQuantity : function() {
			try {
				this.wasEditing(true);
				var tq = parseInt(this.state.quantity()); // tq thisQuantity
				tq = (isNaN(tq)) ? 0 : tq;
				tq = tq + 1 > 99 ? 99 : tq + 1;
				this.state.quantity(tq);
			} catch (e) {
				// TODO: handle exception
			}
		},

		checkQuantity : function(data, event) {

			try {
				if (event.keyCode == 8) {
					return true;
				}
				if (event.keyCode > 47 && event.keyCode < 58) {

					var currQuantity = this.state.quantity() + '' + String.fromCharCode(event.keyCode);
					currQuantity = parseInt(currQuantity);

					if (currQuantity > 0 && currQuantity < 100) {
						this.wasEditing(true);
						this.state.quantity(currQuantity)
					}

				}
			} catch (e) {
				// TODO: handle exception
			}

			return false;

		},

		validatePhone : function(phone) {

			if (phone.length < 9 || phone.length > 10) {
				showMessageText('El teléfono debe contener por lo menos 9 o 10 números, verifica que tu número incluya el prefijo correspondiente, ej 02');
				return false;
			}
			var regExp = /^[0-9]{1}[2-7]{1}[2-7]{1}[0-9]+$/;
			if (regExp.test(phone)) {

				if (!/000000/.test(phone) && !/111111/.test(phone) && !/222222222/.test(phone) && !/3333333/.test(phone) && !/444444/.test(phone) && !/5555555/.test(phone) && !/666666/.test(phone) && !/7777777/.test(phone) && !/888888/.test(phone) && !/999999/.test(phone)) {

					return true;

				} else {
					showMessageText('El teléfono fijo no puede tener demasiados números repetidos');
					return false;
				}

			}

			regExp = /^(09)[3|5|6|7|8|9]{1}[0-9]+$/;

			if (regExp.test(phone)) {

				if (!/000000/.test(phone) && !/111111/.test(phone) && !/222222222/.test(phone) && !/3333333/.test(phone) && !/444444/.test(phone) && !/5555555/.test(phone) && !/666666/.test(phone) && !/7777777/.test(phone) && !/888888/.test(phone) && !/999999/.test(phone)) {

					return true;

				} else {

					showMessageText("El teléfono celular no puede tener demasiados caracteres repetidos", null, "Mensaje");
					return false;

				}
			}
			showMessageText('El teléfono ingresado no es válido, recuerda que si este es fijo debe añadir el código de provincia "02", y si es celular este debe iniciar con "09"');
			return false;

		}

	};

	$page.on('pageinit', function(e) {

		viewModel.mapCarts();
		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function(e) {

		// viewModel.mapCarts();
		checkoutCart.onCheckout(false);

		$('body').on('click', '[data-action]', function() {
			var action = $(this).data('action');
			if (action == 'contact-us') {
				$.mobile.loading('hide');
				viewModel.openContactUsPopup();
			} else if (action == 'closeMessage') {
				$.mobile.loading('hide');
			}
		});

		if (isAuth()) {
			viewModel.updateItems();
		}

		try {
			if (customer.addresses().length == 0 && isAuth()) {

				var userCode = localStorage.codigoPersona;

				if (userCode != undefined && userCode != '') {
					models.CustomerActions.getAddresses(userCode);
				}

			}
		} catch (e) {
			// TODO: handle exception
		}

	});
})(jQuery);