(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]'), // Contexto
	viewModel = {

		cart : new Cart(),

		cartCount : ko.observable(0),

		isZoomed : false,

		thisItem : '',

		vademecumLoaded : ko.observable(true),

		showVademecumSection : ko.observable(false),

		vademecum : ko.observableArray(),

		vademecumToShow : ko.observable(''),

		presentations : ko.observableArray([]),

		selectedPresentation : ko.observable(),

		loginIdType : ko.observable('C'),

		showPassword : ko.observable(false),

		productId : '',

		productName : ko.observable(''),

		selectedName : ko.observable(''),

		itemsWasLoaded : ko.observable(false),

		isImgZoomLoaded : ko.observable(false),

		imageToZoom : ko.observable(''),

		zoomInfo : ko.observable(1),

		backh : function() {
			var urlToBack = (data.urlToReturnFromProduct == '') ? 'search-products.html' : data.urlToReturnFromProduct;
			$(':mobile-pagecontainer').pagecontainer('change', urlToBack, {
				reverse : true
			});
		},

		opendetail : function(item) {
			// item.restricted = 'S';
			window.cartSelectedItem = item;
			$(':mobile-pagecontainer').pagecontainer('change', 'presentation-detail.html?itemId=' + item.itemId + "&productId=" + viewModel.productId + "&productName=" + viewModel.productName());
		},

		openZoom : function(item) {

			viewModel.thisItem = item;
			viewModel.zoomInfo(1);
			viewModel.isZoomed = false;

			if (viewModel.thisItem.bussinessType == 'N' || viewModel.thisItem.psicotropic == 'R' || viewModel.thisItem.restricted == 'N') {
				viewModel.showVademecumSection(false);
			} else {
				viewModel.showVademecumSection(true);
			}

			if (viewModel.thisItem.psicotropic == 'R' || viewModel.thisItem.restricted == 'N') {
				return;
			}

			viewModel.loadVademecum();
			if (viewModel.selectedName() != item.name) {
				viewModel.isImgZoomLoaded(false);
			}
			viewModel.selectedName(item.name);
			$('.panzoom').panzoom("zoom", 1);
			viewModel.imageToZoom('https://www.fybeca.com/carrocompras/MainImagenItemServlet?itemid=' + item.itemId);
			$('#popupZoom').popup('open');
			viewModel.onLoadImageZoom();
		},

		saveItem : function(currItem) {

			var auxItem = {
				item : ko.observable({
					itemId : currItem.itemId,
					selectedPresentation : ko.observable(1),
					quantity : ko.observable(1)
				})
			}

			viewModel.cart.save(auxItem);
		},

		login : function(form) {

			if ($(form).valid()) {

				var loginData = $(form).serializeObject();

				models.CustomerActions.login(loginData.rdIdType, loginData.username, loginData.password).done(function(response) {

					if (response.success) {

						$('#popupLogin').popup('close');

					} else {

						if (response.code == "1") {
							$.mobile.changePage('user-change-password.html');
						}

					}

				});
			}

		},

		openGuestPopup : function() {
			$('#popupLogin').popup('close');
			customer.isGuest(true);
			setTimeout(function() {
				$('#popupAddressGuest').popup('open');
			}, 250);
		},

		loginAsGuest : function(form) {
			var guestData = $(form).serializeObject();
			if (guestData.city != '' && guestData.neighborhood != '') {
				customer.addresses([]);
				customer.discountCards([]);
				customer.paymentTypes([]);
				checkoutCart.cart.items([]);
				customer.isAuthenticated(false);
				customer.isGuest(true);
				customer.selectedGuestCity(guestData.city);
				customer.selectedGuestNeighborhood(guestData.neighborhood);
				viewModel.closeAddresGuestPopup();
				// viewModel.cart.add({
				// item : ko.observable(viewModel.item())
				// });
			} else {
				showMessage("Selecciona tu barrio y tu ciudad", null, "Mensaje");
			}
		},

		closeAddresGuestPopup : function() {
			$('#popupAddressGuest').popup('close');
		},

		onLoadImage : function(data, event) {
			$(event.target).css('display', '');
			$(event.target).next().css('display', 'none');
		},

		onLoadImageZoom : function() {
			console.log('loaded');
			setTimeout(function() {
				$('.panzoom').panzoom('destroy');
				$('.panzoom').panzoom({
					increment : 0.4,
					minScale : 1,
					maxScale : 3,
					contain : 'invert'
				});
				viewModel.isImgZoomLoaded(true);
			}, 500);
		},

		toggleZoom : function() {
			$('.panzoom').panzoom("zoom", (viewModel.isZoomed ? 1 : 3), {
				animate : true
			});
			viewModel.isZoomed = !viewModel.isZoomed;
		},

		closeZoomPopup : function() {
			$('#popupZoom').popup('close');
		},

		loadVademecum : function() {

			models.products.getItemVademecum(viewModel.thisItem.itemId).done(function(data) {
				viewModel.vademecum(data);
				// $page.find('#collVad').trigger('create')

				if (data.length > 0) {
					viewModel.showVademecumSection(true);
				} else {
					viewModel.showVademecumSection(false);
				}

				$('#collVad li:first-child a').click();

				$('#collVad').listview('refresh');
			}).fail(function(message) {
				console.log(message);
			}).always(function() {
				viewModel.vademecumLoaded(true);
			});

		},

		toogleZoomInfo : function() {
			viewModel.zoomInfo(viewModel.zoomInfo() == 1 ? 2 : 1);
		},

		showVademecumInfo : function(data, event) {

			$('.vademecumTab').removeClass('vademecumTabActive');
			$(event.target).toggleClass('vademecumTabActive');

			var thisVademecum = this.label;
			$.each(viewModel.vademecum(), function() {
				if (thisVademecum == this.label) {
					viewModel.vademecumToShow(this.value);
					return;
				}
			});
		},

	};

	$page.on('pagebeforecreate', function() {
		ko.applyBindings(viewModel, $page[0]);

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'backh':
				$(':mobile-pagecontainer').pagecontainer('change', 'search-products.html');
				break;
			}
		});

	}).on('pageshow', function() {

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);
		data.urlToReturnFromCart = '/app/views/' + $page.data('url').split('/')[$page.data('url').split('/').length - 1];

		viewModel.cartCount(customer.items().cartItems.length);

		var currProductId = pageUrl.param('productId') || documentUrl.param('productId');

		setTimeout(function() {
			if (!viewModel.itemsWasLoaded()) {
				$.mobile.loading("show", {
					text : 'Consultando presentaciones',
					textVisible : true,
					theme : 'b'
				});
			}
		}, 1000);

		viewModel.productId = currProductId;
		viewModel.productName(pageUrl.param('productName') || documentUrl.param('productName'));
		// viewModel.returnShowDeep = pageUrl.param('productName') ||
		// documentUrl.param('showDeep')

		models.products.getItemsByProductsId(viewModel.productId).done(function(response) {
			if (response.success) {
				viewModel.presentations(response.data.items)
			}
			$page.find('#presentationsList').listview('refresh');

			$.mobile.loading('hide');

		}).fail(function(message) {
			console.log(message);
		}).always(function() {
			viewModel.itemsWasLoaded(true);
		});

		ko.mapping.fromJS(customer.items().cartItems, viewModel.cart.items);

	});

})(jQuery);
