(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]'), // Contexto
	viewModel = {

		selectedAddress : ko.observable(""),

		wasAddressLoaded : ko.observable(false),

		addresses : customer.addresses,

		showAddress : function(address) {
			viewModel.selectedAddress(address);
			$('#popupAddress').popup('open');
		},

		selectAddress : function() {

			try {
				if (navigator.network.connection.type == Connection.NONE) {
					ShowMessageInternetNotAvailable();
					return;
				}
			} catch (err) {
			}

			$.each(viewModel.addresses(), function() {
				if (this.addressId == viewModel.selectedAddress().addressId) {
					this.principalAddress(true);
				} else {
					this.principalAddress(false);
				}
			});

			customer.selectedAddress(viewModel.selectedAddress().addressId);
			$('#popupAddress').popup('close');

			try {
				if (localStorage.codigoPersona != undefined && localStorage.codigoPersona != '')
					models.CustomerActions.predetermineAddress({
						userCode : localStorage.codigoPersona,
						addressId : viewModel.selectedAddress().addressId
					});
			} catch (e) {
				// TODO: handle exception
			}

		},

		editAddress : function(address) {
			console.log('Edit');
			customer.wantEditAddress(true);
			customer.addressToEdit = address.selectedAddress();
			$(':mobile-pagecontainer').pagecontainer('change', 'user-addresses-add.html');
		}

	};

	$page.on('pagebeforecreate', function() {

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {

		viewModel.wasAddressLoaded(false);

		try {
			if (navigator.network.connection.type == Connection.NONE) {
				ShowMessageInternetNotAvailable();
				return;
			}
		} catch (err) {
		}

		$.mobile.loading("show", {
			text : 'Cargando tus direcciones.',
			textVisible : true,
			textonly : false,
			theme : 'b'
		});

		models.CustomerActions.getAddresses(localStorage.getItem('codigoPersona')).done(function() {
			$.mobile.loading('hide');
			$('#addressesList').listview('refresh');

			$.each(viewModel.addresses(), function() {
				var thisAddressType = this.addressType;
				var thisAddressTypeText = '';
				$.each(data.addressTypes(), function() {
					try {
						if (thisAddressType == this.value) {
							thisAddressTypeText = this.label;
							thisAddressTypeText = thisAddressTypeText.substring(0, 1) + thisAddressTypeText.substring(1).toLowerCase();
						}
					} catch (e) {
					}
				})
				this.addressTypeText(thisAddressTypeText);
			});

		}).fail(function() {
			// $.mobile.loading("show", {
			// text : 'Hubo un problema al cargar tus direcciones, inténtalo
			// nuevamente mas tarde por favor.',
			// textVisible : true,
			// textonly : true,
			// theme : 'b'
			// });
			// setTimeout(function() {
			// $.mobile.loading('hide');
			// }, 5000);

			showMessageText('Hubo un problema al cargar tus direcciones, inténtalo nuevamente mas tarde por favor.', 5000);

		}).always(function() {
			viewModel.wasAddressLoaded(true);
		});

		$('#addressesList').listview('refresh');
		setTimeout(function() {
			$('#addressLi_' + window.customer.addressToAnimate()).animate({
				backgroundColor : "#FFD977"
			}, 400).animate({
				backgroundColor : "rgba(0, 0, 0, 0)"
			}, 400);
			window.customer.addressToAnimate(0);
		}, 500);

		customer.wantEditAddress(false);

	});

})(jQuery);