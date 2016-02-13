//<![CDATA[	

var markers = [];

var iconMarkerBlue = new google.maps.MarkerImage('../resources/themes/default/images/marker_blue2.png', new google.maps.Size(23, 34), new google.maps.Point(0, 0), new google.maps.Point(12, 34), new google.maps.Size(23, 34));
var iconMarkerLightBlue = new google.maps.MarkerImage('../resources/themes/default/images/marker_lightblue.png', new google.maps.Size(23, 34), new google.maps.Point(0, 0), new google.maps.Point(12, 34), new google.maps.Size(23, 34));
var iconMarkerRed = new google.maps.MarkerImage('../resources/themes/default/images/marker_red.png', new google.maps.Size(23, 34), new google.maps.Point(0, 0), new google.maps.Point(12, 34), new google.maps.Size(23, 34));
var iconMarkerShape = {
	coord : [ 16, 0, 17, 1, 19, 2, 20, 3, 20, 4, 21, 5, 22, 6, 22, 7, 22, 8, 22, 9, 22, 10, 22, 11, 22, 12, 22, 13, 22, 14, 22, 15, 22, 16, 21, 17, 21, 18, 20, 19, 20, 20, 19, 21, 18, 22, 18, 23, 17, 24, 16, 25, 16, 26, 15, 27, 14, 28, 14, 29, 13, 30, 13, 31, 12, 32, 12, 33, 10, 33, 10, 32, 9, 31,
			9, 30, 8, 29, 8, 28, 7, 27, 6, 26, 6, 25, 5, 24, 4, 23, 4, 22, 3, 21, 2, 20, 2, 19, 1, 18, 1, 17, 0, 16, 0, 15, 0, 14, 0, 13, 0, 12, 0, 11, 0, 10, 0, 9, 0, 8, 0, 7, 0, 6, 1, 5, 2, 4, 2, 3, 3, 2, 5, 1, 6, 0, 16, 0 ],
	type : 'poly'
};

$.extend(viewModel, {
	mapCities : ko.observableArray(),
	mapCurrentPlace : ko.observable({}),
	openPlaceDetail : function(item) {
		// Aqui va llamada a servicio de detalle de farmacia
		loadPharmacyDetail(item.id);
	},
	mapState : {
		city : ko.observable(),
		location : ko.observable()
	}
});

viewModel.mapState.city.subscribe(refreshMap);
viewModel.mapState.location.subscribe(function(newVal) {
	map.panTo(new google.maps.LatLng(newVal.coords.lat, newVal.coords.lng));
	$.each(markers, function() {
		if (this.title == newVal.name) {
			this.setIcon(iconMarkerLightBlue);
			this.setZIndex(999);
		} else {
			this.setIcon(this.data.openning.status ? iconMarkerBlue : iconMarkerRed);
			this.setZIndex(undefined);
		}
	});
});

(function() {
	// Definición de variables
	var $page = $($('script').last()).parent();
	var refreshMap;
	$(function() {
		$('#map-form').on('click', '[data-action]', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'select-pharmacy-map':

				var tempNeigs = viewModel.shippingState.neighborhoods();
				tempNeigs.push({
					label : 'FARMACIA CERCANA WEB',
					value : 5527
				})
				viewModel.shippingState.neighborhoods(tempNeigs);
				if (fromMapType == 1) {
					$('#login-form').data('methods').location();
				} else if (fromMapType == 2) {
					app.modal(locationModal).done(function(modal) {
						$(modal).on('location-changed', function() {
							$('#login-form').trigger('login');
						});
					});
				} else if (fromMapType == 3) {
					app.modal('_address-form.jsf');
					$('[name="address[neighborhood]"]').val('-1');
				}

				break;
			}
		}).validate();
	});
})(jQuery);

function loadPharmacies() { // Obtener las ciudades en donde hay Fybeca

	var timestamp = new Date().getTime();
	var parameters = [];
	parameters.push([ "latitude", "-0.20334432660182897" ]);
	parameters.push([ "longitude", "-78.4920628465874" ]);
	parameters.push([ "maxDistance", "2000" ]);
	parameters.push([ "oauth_consumer_key", "user" ]);
	parameters.push([ "oauth_timestamp", timestamp ]);
	parameters.push([ "oauth_nonce", OAuth.nonce(16) ]);
	parameters.push([ "oauth_signature_method", "HMAC-SHA1" ]);
	parameters.push([ "oauth_version", "1.0" ]);

	OAuth.SignatureMethod.sign({
		method : "GET",
		action : 'https://mapp01.fybeca.com/FybecaApi/api/pharmacies',
		parameters : parameters
	}, {
		consumerSecret : 'kd94hf93k423kf44',
		tokenSecret : ''
	});
	$.ajax({
		url : 'https://mapp01.fybeca.com/FybecaApi/api/pharmacies',
		dataType : 'jsonp',
		data : OAuth.getParameterMap(parameters)
	}).done(function(responseServ) {
		$.each(responseServ.resp, function() {
			viewModel.mapLocationsT.push({
				"id" : this.codigoFarmacia,
				"name" : this.nombreFarmacia,
				"address" : this.direccion,
				"coords" : {
					"lat" : this.latitud.replace(',', '.'),
					"lng" : this.longitud.replace(',', '.')
				},
				"city" : this.city.trim(),
				"openning" : {
					"status" : (this.estado == 'A'),
					"open" : this.horaApertura,
					"close" : this.horaCierre
				}
			});
		});
		refreshMap('');
	}).fail(function(jqXHR, textStatus) {
		console.log('error');
	});

}

function loadPharmacyDetail(pharmacyId) { // Obtener los detalles de una
	// farmacia
	var parametersString = 'id,' + pharmacyId + ';latitude,0' + ';longitude,0';
	var timestamp = new Date().getTime();
	var parameters = [];
	parameters.push([ "latitude", "-0.20334432660182897" ]);
	parameters.push([ "longitude", "-78.4920628465874" ]);
	parameters.push([ "maxDistance", "2000" ]);
	parameters.push([ "oauth_consumer_key", "user" ]);
	parameters.push([ "oauth_timestamp", timestamp ]);
	parameters.push([ "oauth_nonce", OAuth.nonce(16) ]);
	parameters.push([ "oauth_signature_method", "HMAC-SHA1" ]);
	parameters.push([ "oauth_version", "1.0" ]);
	OAuth.SignatureMethod.sign({
		method : "GET",
		action : 'https://mapp01.fybeca.com/FybecaApi/api/pharmacies',
		parameters : parameters
	}, {
		consumerSecret : 'kd94hf93k423kf44',
		tokenSecret : ''
	});
	$.ajax({
		url : 'https://mapp01.fybeca.com/FybecaApi/api/pharmacies',
		dataType : 'jsonp',
		data : OAuth.getParameterMap(parameters)
	}).done(function(resp) {

		viewModel.mapCurrentPlace({
			"direccion" : resp.resp.direccion,
			"horarios" : resp.resp.horarios,
			"nombreFarmacia" : resp.resp.nombreFarmacia,
			"servicios" : resp.resp.servicios,
			"telefonos" : resp.resp.telefonos
		});
		$('#place-detail').modal('show');
	}).fail(function(jqXHR, textStatus) {
		console.log('error');
	});
}

function initialize() {

	markers = [];
	var map = new google.maps.Map(document.getElementById('map-canvas'), {
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		streetViewControl : false,
		panControl : false,
		zoom : 4
	});

	var defaultBounds = new google.maps.LatLngBounds(new google.maps.LatLng(-0.20334432660182897, -78.4920628465874), new google.maps.LatLng(-0.20334432660182897, -78.4920628465874));
	map.fitBounds(defaultBounds);

	// Create the search box and link it to the UI element.
	var input = /** @type {HTMLInputElement} */
	(document.getElementById('pac-input'));
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	var searchBox = new google.maps.places.SearchBox(input);

	google.maps.event.addListener(searchBox, 'places_changed', function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}
		for ( var i = 0, marker; marker = markers[i]; i++) {
			marker.setMap(null);
		}

		// For each place, get the icon, place name, and location.
		markers = [];
		var bounds = new google.maps.LatLngBounds();
		for ( var i = 0, place; place = places[i]; i++) {
			var image = {
				url : place.icon,
				size : new google.maps.Size(71, 71),
				origin : new google.maps.Point(0, 0),
				anchor : new google.maps.Point(17, 34),
				scaledSize : new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			var marker = new google.maps.Marker({
				map : map,
				icon : image,
				title : place.name,
				position : place.geometry.location
			});

			markers.push(marker);

			bounds.extend(place.geometry.location);
		}

		map.fitBounds(bounds);

	});

}

function refreshMap() {

	clearAllMarkers();
	var currentCity = '';
	$.each(viewModel.cities, function() {
		if (this.value == viewModel.shippingState.city()) {
			currentCity = this.label;
		}
	});
	var existsPharmacyOnCity = false;

	$.each(viewModel.mapLocationsT(), function() {
		if (currentCity == this.city.trim()) {
			existsPharmacyOnCity = true;
			var isActivePharmacy = false;
			var currentPhar = this;
			$.each(viewModel.activePharmacies, function() {
				if (currentPhar.id == this.id) {
					isActivePharmacy = true;
				}
			});
			if (isActivePharmacy) {
				var status = this.openning.status ? '<div style="font-weight:bold; font-size:12px;"><span style="color:#3cd628; font-weight: bold;">Abierto</span> <span style="font-weight: bold;">hasta las ' + this.openning.close + '</span></div>'
						: '<div style="font-weight:bold; font-size:12px;"><span style="color:#d01818;">Cerrado <span style="color:black; font-weight:bold; font-size:12px;"> ' + this.openning.open + '</span></span></div>';
				var teaser = '<a href="#" data-action="select-pharmacy-map"><div style="white-space:normal;"><span style="font-weight:bold;">' + this.name + '</span> <span style="font-weight:normal; font-size:11px; color:#99999;"></span></div>' + status
						+ '<div class="capitalized" style="font-weight:normal; font-size:11px; white-space:normal;">' + this.address + '</div></a>';
				infoWindow = new google.maps.InfoWindow({
					content : teaser
				});
				var marker = new google.maps.Marker({
					position : new google.maps.LatLng(Number(this.coords.lat.replace(',', '.')), Number(this.coords.lng.replace(',', '.'))),
					map : map,
					icon : this.openning.status ? iconMarkerBlue : iconMarkerRed,
					shape : iconMarkerShape,
					title : this.name,
					teaser : teaser,
					data : this
				});
				markers.push(marker);
				google.maps.event.addListener(marker, 'click', function() {
					$.each(viewModel.mapLocationsT(), function() {
						if (this.name == marker.title) {
							/*
							 * var location = this var top =
							 * $('[data-location="'+marker.title+'"]').position().top;
							 * $('#locations-addresses').animate({scrollTop:
							 * (top-$('#locations-addresses').position().top)+$('#locations-addresses').scrollTop()},
							 * 300, function(){
							 * viewModel.mapState.location(location); });
							 */
							viewModel.shippingState.selectedPharmacy(this);
							infoWindow.setContent(marker.teaser);
							infoWindow.open(map, marker);
						}
					});
					$('#map-tools [data-action="select-location"]').removeAttr("disabled");
				});
			}
		}
	});

	if (!existsPharmacyOnCity) {
		// console.log('NO HAY FARMACIAS');
		$('#login-form').animate({
			'width' : '600px',
			'margin-left' : '-300px'
		}, function() {
			$(this).animate({
				'width' : '400px',
				'margin-left' : '-200px'
			});
		});
		$('#login-form').data('methods').location();
		app.message('No tenemos farmacias con atención a domicilio en tu ciudad.', {
			container : '#login-form #new-address-message',
			type : 'error'
		});
		setTimeout(function() {
			$('.app-message').slideUp('fast');
		}, 8000);
	}
	if (viewModel.mapLocationsT().length > 0) {
		fitBounds(markers, map);
	}
	Process.hide();

}

var clearAllMarkers = function() {
	try {
		// Elimina marcadores anteriores
		$.each(markers, function() {
			this.setMap(null);
		});
		markers = [];
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

google.maps.event.addDomListener(window, 'load', initialize);

// ]]>;
