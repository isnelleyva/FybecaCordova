(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]');
	var map;
	var infoWindow;
	var markers = [];
	var thisE;
	var thisUi;

	var viewModel = {

		mapPharmacies : ko.observableArray(),

		data : data,

		showNoAddressesMessage : ko.observable(false),

		saveAddress : function(form) {

			var newAddress = $(form).serializeObject();

			if ($(form).valid()) {

				$.mobile.loading("show", {
					text : 'Guardando',
					textVisible : true,
					theme : 'b'
				});

				var cityText = '';
				var neighborhoodText = '';

				$.each(viewModel.data.cities(), function() {
					if (this.value == newAddress.city) {
						cityText = this.label;
						return false;
					}
				});

				$.each(viewModel.data.neighborhoods(), function() {
					if (this.value == newAddress.neighborhood) {
						neighborhoodText = this.label;
						return false;
					}
				});

				$.each(window.customer.addresses(), function() {
					this.principalAddress(false);
				});

				try {
					if (navigator.network.connection.type == Connection.NONE) {
						ShowMessageInternetNotAvailable();
						return;
					}
				} catch (err) {

				}

				if (customer.wantEditAddress()) {

					models.CustomerActions.updateAddress(customer.addressToEdit.addressId, newAddress).done(function() {

						customer.addressToEdit.main = newAddress.mainStreet;
						customer.addressToEdit.number = newAddress.number;
						customer.addressToEdit.intersection = newAddress.intersection;
						customer.addressToEdit.reference = newAddress.reference;
						customer.addressToEdit.cityId = newAddress.city;
						customer.addressToEdit.cityName = cityText;
						customer.addressToEdit.neighborhoodId = newAddress.neighbhorhood;
						customer.addressToEdit.neighborhoodName = neighborhoodText;

						window.customer.addressToAnimate(customer.addressToEdit.addressId);

						$.mobile.changePage('user-addresses-list.html');
					}).fail(function(error) {
						$.mobile.loading("show", {
							text : 'Hubo un error, por favor intentalo mas tarde',
							textVisible : true,
							textonly : true,
							theme : 'b'
						});
						setTimeout(function() {
							$.mobile.loading('hide');
						}, 3000);
						console.log(error);
					});

				} else {

					$.mobile.loading("show", {
						text : 'Agregando',
						textVisible : true,
						textonly : false,
						theme : 'b'
					});

					models.CustomerActions.addAddress(newAddress).done(function(response) {
						$.each(response, function() {
							if (this.principalAddress()) {
								window.customer.selectedAddress(this.addressId);
								window.customer.addressToAnimate(this.addressId);
								return false;
							}

						});
						$.mobile.changePage('user-addresses-list.html');
					}).fail(function(response) {
						console.log(response)
						$.mobile.loading("show", {
							text : 'Hubo un error, por favor intentalo mas tarde',
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

		loadPharmacies : function() {

			viewModel.clearAllMarkers();
			if (viewModel.mapPharmacies().length == 0) {
				$.mobile.loading("show", {
					text : 'Cargando',
					textVisible : true,
					theme : 'b'
				});
				models.CustomerActions.getPharmacies().done(function(response) {
					viewModel.mapPharmacies(response);
					viewModel.loadPlaces();
				}).fail(function() {
					debugger;
				}).always(function() {
					$.mobile.loading("hide");
				});
			} else {
				viewModel.loadPlaces();
			}

		},

		loadPlaces : function() {

			$.each(viewModel.mapPharmacies(), function() {

				if (this.city == data.state.selectedCityName) {

					var activePharmacies = JSON.parse(localStorage.activePharmacies);
					var isActivePharmacy = false;
					var currentPharmacyId = this.id;
					$.each(activePharmacies, function() {
						if (this.id == currentPharmacyId) {
							isActivePharmacy = true;
							return;
						}
					});

					if (isActivePharmacy) {
						var icon = new google.maps.MarkerImage('../../themes/default/images2/marker_blue2.png', new google.maps.Size(23, 34), new google.maps.Point(0, 0), new google.maps.Point(12, 34), new google.maps.Size(23, 34));
						var thisAddress = this.direccion;
						try {
							thisAddress = thisAddress.toLowerCase();
						} catch (e) {
						}
						var teaser = '<a href="#" data-action="show-pharmacy-detail" data-pharmacy_id="' + this.id + 'style="color:#333; text-decoration:none;"><div style="white-space:normal;"><span style="font-weight:bold;">' + this.name + '</span> </div><div class="capitalized" style="font-weight:normal; font-size:11px; white-space:normal;">' + this.address + '</div></a>';

						// Agrega marcas al mapa
						infoWindow = new google.maps.InfoWindow({
							content : teaser
						});

						var marker = new google.maps.Marker({
							position : new google.maps.LatLng(this.coords.lat, this.coords.lng),
							map : map,
							icon : icon,
							shadow : iconMarkerShadow,
							shape : iconMarkerShape,
							title : this.nombreFarmacia,
							teaser : teaser,
							id : this.codigoFarmacia
						});
						markers.push(marker);
						google.maps.event.addListener(marker, 'click', function() {
							infoWindow.setContent(marker.teaser);
							infoWindow.open(map, marker);
						});
					}

				}

			});

			viewModel.fitBounds();

		},

		clearAllMarkers : function() {
			try {
				// Elimina marcadores anteriores
				$.each(markers, function() {
					this.setMap(null);
				});
				markers = [];
				$page.find('#search-places-list ul').html('');
			} catch (err) {
				console.log(err.message);
				console.log(err.stack);
			}
		},

		createMap : function(e, ui) {
			try {
				if (typeof google != 'undefined') {
					var ios = (navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('iPad') > -1);
					var mapOptions = {
						zoom : defaultMapZoom,
						center : defaultMapCenter,
						mapTypeId : google.maps.MapTypeId.ROADMAP,
						streetViewControl : false,
						panControl : false,
						mapTypeControl : false,
						zoomControl : !ios,
						zoomControlOptions : {
							position : google.maps.ControlPosition.RIGHT_BOTTOM
						},
					};

					// $(window).resize(resizeMap);
					map = new google.maps.Map(document.getElementById('pharmacies_map'), mapOptions);
					var currentPositionControl = $('<div class="btn-control ui-btn ui-shadow ui-btn-corner-all ui-mini ui-btn-inline ui-btn-up-c" style="border-radius:4px;"><img src="../../themes/default/images2/icon-32-location.png" style="width:16px; height:16px; display:block;" /></div>').on('tap', function(e, ui) {
						showPlaces(e, ui);
					}).appendTo('<div />');
					var currentPositionDrag = $('<div id="btn-move" class="btn-control ui-btn ui-shadow ui-btn-corner-all ui-mini ui-btn-inline ui-btn-up-c" style="border-radius:4px;"><img src="../../themes/default/images2/icon-32-current-location-drag.png" style="width:16px; height:16px; display:block;" /></div>').on('tap', function(e, ui) {
						var $self = $(this);
						if ($self.not('.disabled').length > 0) {
							$self.addClass('disabled');
							setTimeout(function() {
								$self.removeClass('disabled')
							}, 600);
							if (!$self.hasClass('down')) {
								if (localStorage.getItem('removedMoveMarkerTip') != 'true') {
									toggleTipBox('show');
									clearTimeout(tipBoxTimer);
									tipBoxTimer = setTimeout(function() {
										toggleTipBox('hide');
									}, 20000);
									map.panTo(currentPositionMarker.getPosition());
								}
								toggleDraggableMarker('enable');
							} else {
								toggleDraggableMarker('disable');
							}
						}
					}).appendTo('<div />');
					var range = $('<a href="#edit-range" class="btn-range" data-rel="popup"></div>').html('<div class="range-label">Distancia</div><div class="range-field"><span id="range-distance">' + maxDistance + '</span> km</div>');
					map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(currentPositionControl[0]);
					map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(currentPositionDrag[0]);
					map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(range[0]);

					// Mueve la posición a donde se haya hecho clic
					google.maps.event.addListener(map, 'click', function(event) {
						if ($page.find('#btn-move').hasClass('down')) {
							currentPositionMarker.setPosition(event.latLng);
							loadPlaces(event.latLng);
							toggleDraggableMarker('disable');
						}
					});

					// showPlaces(e, ui);
					viewModel.loadPharmacies();
				} else {
					loadMaps();
					$(document).on('loadMaps', function() {
						viewModel.createMap(e, ui);
					});
				}
			} catch (err) {
				console.log(err.message);
				console.log(err.stack);
			}
		},

		openMapPopup : function() {

			if (typeof map != 'object') {
				viewModel.createMap(thisE, thisUi);
			} else {
				viewModel.loadPharmacies();
			}

			$('#popupMap').popup('open');
		},

		fitBounds : function() {
			try {
				// Permite que todas las marcas agregadas en el mapa estén
				// visibles
				// luego de cargarlas
				if (markers.length > 1) {
					var bounds = new google.maps.LatLngBounds();
					$.each(markers, function() {
						bounds.extend(this.getPosition());
					});
					map.fitBounds(bounds);
				} else {
					map.setZoom(defaultMapZoom);
					map.setCenter(lastCurrentLatlng);
				}
			} catch (err) {
				console.log(err.message);
				console.log(err.stack);
			}
		}

	};

	$page.on('pagebeforecreate', function() {
		ko.applyBindings(viewModel, $page[0]); // Inicializa binding
		// con la

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'backh':
				$(':mobile-pagecontainer').pagecontainer('change', '../../index.html#menu-mifybeca');
				break;
			}
		});

		$page.find("form").validate();

	}).on('pageshow', function(e, ui) {
		if (customer.addresses().length == 0) {
			viewModel.showNoAddressesMessage(true);
		}
		if (customer.wantEditAddress()) {
			data.state.selectedCity(customer.addressToEdit.cityId)
		}
		thisE = e;
		thisUi = ui;
		$('.pharmacyMapButton').css('display', 'none');

	});

})(jQuery);