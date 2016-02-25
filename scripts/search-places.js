//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {

	var $page = $('#search-places');
	var map;
	var markers = [];
	var lastCurrentLatlng = null;
	var accuracyCircle;
	var infoWindow;
	var lastMaxDistance = maxDistance;
	var currentPositionMarker;
	var currentPositionMarkerDraggable = false;
	var tipBoxTimer;
	var desplazar = false;
	var returnToHome = true;

	var viewModel = {

		currLatitude : '',
		currLongitude : '',
		currRange : '3',

		pharmacies : ko.observableArray([]),

		wasLoaded : ko.observable(false),

		pharmacyData : {
			id : '',
			name : ko.observable(''),
			address : ko.observable(''),
			phones : ko.observable(''),
			schedule : ko.observable(''),
			services : ko.observable(''),
			distance : ko.observable(''),
			imgSrc : ko.observable('')
		},

		loadPharmacyDetail : function(pharmacy) {

			data.temporalPharmacies = viewModel.pharmacies();
			data.temporalLatitude = viewModel.currLatitude;
			data.temporalLongitude = viewModel.currLongitude;

			$(':mobile-pagecontainer').pagecontainer('change', 'app/views/pharmacy-detail.html?code=' + pharmacy.code + '&lat=' + viewModel.currLatitude + '&lon=' + viewModel.currLongitude);

		},

		loadPharmacyImage : function(pharmacyId) {

			models.DataRequests.getPharmacyImage(pharmacyId).done(function(response) {
				viewModel.pharmacyData.imgSrc('data:' + response.mimeType + ';base64,' + response.imageString);
			});

		},

		showPharmacyOnMap : function() {

			$page.find('#popupPharmacyDetail').popup('close');

			setTab('map');
			var marker = null;
			$.each(markers, function(i) {
				if (i > 0 && Number(this.id) == viewModel.pharmacyData.id) {
					marker = this;
				}
			});
			if (marker) {
				infoWindow.setContent('<div class="infoWindow">' + marker.teaser + '</div>');
				infoWindow.open(map, marker);
			}

		}

	}

	$page.on('pageinit', function() {
		try {
			$page.on('tap', '[data-action]', function() {
				switch ($(this).data('action')) {

				case 'backh':
					if (returnToHome) {
						$(':mobile-pagecontainer').pagecontainer('change', 'index.html', {
							reverse : true
						});
					} else {
						setTab('list');
						returnToHome = true;
					}
					break;

				case 'set-tab':

					try {
						returnToHome = $(this).data('tab-name') == 'list';
					} catch (e) {
						returnToHome = true;
					}

					setTab($(this).data('tab-name'));
					break;
				case 'remove-move-marker-tipbox':
					toggleTipBox('show');
					localStorage.setItem('removedMoveMarkerTip', true);
					break;
				case 'hide-move-marker-tipbox':
					toggleTipBox('hide');
					break;
				case 'show-more':
					maxDistance = $page.find('[name="range-distance"]').val();
					if ((parseInt(maxDistance) + 3) >= 10) {
						maxDistance = 10;
					} else {
						maxDistance = parseInt(maxDistance) + 3;
					}
					;
					desplazar = true;
					loadPlaces(lastCurrentLatlng);
					$page.find('[name="range-distance"]').val(maxDistance);
					$page.find('[name="range-distance"]').slider('refresh');
					break;
				}
			});

			// Modifica rango de distancia para la búsqueda
			$page.find('[name="range-distance"]').on('slidestop', function(e, ui) {
				$page.find('#range-distance').text($(this).val());
				$page.find('#edit-range').popup('close');
				maxDistance = $(this).val();
				loadPlaces(lastCurrentLatlng);
			});

			$page.find('[name="range-distance"]').blur(function() {

				var prevMaxDistance = maxDistance;
				maxDistance = $(this).val();

				if (maxDistance == '1' || maxDistance == '2' || maxDistance == '3' || maxDistance == '4' || maxDistance == '5' || maxDistance == '6' || maxDistance == '7' || maxDistance == '8' || maxDistance == '9' || maxDistance == '10') {
					$page.find('#range-distance').text($(this).val());
					$page.find('#edit-range').popup('close');
					loadPlaces(lastCurrentLatlng);
				} else {
					$page.find('[name="range-distance"]').val(prevMaxDistance);
					maxDistance = prevMaxDistance;
				}
			});

		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
		ko.applyBindings(viewModel, $page[0]);
	})

	.on(
			'pageshow',
			function(e, ui) {
				try {
					try {
						console.log("XXXXX- Conexion: "+navigator.connection.type);
						console.log("XXXXX- Valor esperado: "+Connection.NONE);
						if (navigator.connection.type == Connection.NONE) {
							ShowMessageInternetNotAvailable();
							return;
						}
					} catch (err) {
					}

					desplazar = false;
					$page.find('[name="range-distance"]').val(maxDistance).slider('refresh');
					$page.find('#range-distance').text(maxDistance);

					var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);
					var loadPlaces = pageUrl.param('l') || documentUrl.param('l');

					if (loadPlaces == 'n') {

						viewModel.pharmacies(data.temporalPharmacies);
						viewModel.wasLoaded(true);
						viewModel.currLatitude = data.temporalLatitude;
						viewModel.currLongitude = data.temporalLongitude;


						var listItems = [];
						var farthestAwayPlace = 0;

						createMap(e, ui);

						$.each(viewModel.pharmacies(), function() {
							var icon = this.status == 'A' ? iconMarkerBlue : iconMarkerRed;
							var status = this.status == 'A' ? '<div style="font-weight:bold; font-size:12px;"><span style="color:#3cd628; font-weight: bold;">Abierto</span> <span style="font-weight: bold;">hasta las ' + this.closeTime + '</span></div>'
									: '<div style="font-weight:bold; font-size:12px;"><span style="color:#d01818;">Cerrado <span style="color:black; font-weight:bold; font-size:12px;"> ' + this.openTime + '</span></span></div>';
							var thisAddress = this.address;
							try {
								thisAddress = thisAddress.toLowerCase();
							} catch (e) {
							}
							var teaser = '<a data-action="show-pharmacy-detail" data-pharmacy_id="' + this.code + '" data-pharmacy_distance="' + this.distance + '" data-pharmacy_lat="' + this.latitude.replace(',', '.') + '" data-pharmacy_lon="' + this.longitude.replace(',', '.')
									+ '" style="color:#333; text-decoration:none;"><div style="white-space:normal;"><span style="font-weight:bold;">' + this.name + '</span> <span style="font-weight:normal; font-size:11px; color:#99999;">- ' + this.distance + 'km</span></div>'
									+ status + '<div class="capitalized" style="font-weight:normal; font-size:11px; white-space:normal;">' + thisAddress + '</div></a>';

							// Agrega marcas al mapa
							infoWindow = new google.maps.InfoWindow({
								content : teaser
							});

							var marker = new google.maps.Marker({
								position : new google.maps.LatLng(this.latitude.replace(',', '.'), this.longitude.replace(',', '.')),
								map : map,
								icon : icon,
								shadow : iconMarkerShadow,
								shape : iconMarkerShape,
								title : this.name,
								teaser : teaser,
								id : this.code
							});
							markers.push(marker);
							google.maps.event.addListener(marker, 'click', function() {
								infoWindow.setContent(marker.teaser);
								infoWindow.open(map, marker);
							});

							// Agrega elementos a la lista
							listItems.push('<li>' + teaser + '</li>');

							// Obtiene la distancia de la
							// farmacia a mayor distancia
							farthestAwayPlace = Math.max(farthestAwayPlace, Number(this.distance.replace(',', '.')));
						});

						if (farthestAwayPlace > maxDistance) {
							farthestAwayPlace = Math.ceil(farthestAwayPlace);
							var maxRange = $page.find('[name="range-distance"]').attr('max');
							maxDistance = Math.min(maxRange, farthestAwayPlace);
							$page.find('[name="range-distance"]').val(maxDistance).slider('refresh');
							$page.find('#range-distance').text(maxDistance + (farthestAwayPlace > maxRange ? '+' : ''));
						} else {
							$page.find('#range-distance').text(maxDistance);
						}
						$page.find('[name="range-distance"]').slider('refresh');
						showPlaces2(e, ui);
						fitBounds();
						$.mobile.loading('hide');
						// Refresca la lista de lugares encontrados
						if (listItems.length > 0) {

							if (desplazar) {
								$('html,body').animate({
									scrollTop : $(document).height()
								}, 0);
							}

						} else {
							$page.find('#search-places-list ul').html('<li>No se han encontrado resultados</li>').listview('refresh');
							if ($page.find('#search-places-map').is(':visible')) {
								showMapNoDataMessage();
							}
						}



					} else {
						showPlaces(e, ui);
					}

				} catch (err) {
					console.log(err.message);
					console.log(err.stack);
				}
			});
	function toggleTipBox(status) {
		switch (status) {
		case 'show':
			$page.find('.tipbox').slideDown();
			break;
		case 'hide':
			$page.find('.tipbox').slideUp();
			break;
		}
	}
	function toggleDraggableMarker(status) {
		switch (status) {
		case 'enable':
			$page.find('#btn-move').addClass("down");
			currentPositionMarker.setDraggable(true);
			currentPositionMarker.setAnimation(google.maps.Animation.BOUNCE);
			currentPositionMarkerDraggable = true;
			break;
		case 'disable':
			toggleTipBox('hide');
			$page.find('#btn-move').removeClass("down");
			currentPositionMarker.setDraggable(false);
			currentPositionMarker.setAnimation(null);
			currentPositionMarkerDraggable = false;
			break;
		}
	}
	function createMap(e, ui) {
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

				$(window).resize(resizeMap);
				map = new google.maps.Map(document.getElementById('search-places-map'), mapOptions);
				var currentPositionControl = $('<div class="btn-control ui-btn ui-shadow ui-btn-corner-all ui-mini ui-btn-inline ui-btn-up-c" style="border-radius:4px;"><img src="themes/default/images2/icon-32-location.png" style="width:16px; height:16px; display:block;" /></div>').on('tap',
						function(e, ui) {
							showPlaces(e, ui);
						}).appendTo('<div />');
				var currentPositionDrag = $(
						'<div id="btn-move" class="btn-control ui-btn ui-shadow ui-btn-corner-all ui-mini ui-btn-inline ui-btn-up-c" style="border-radius:4px;"><img src="themes/default/images2/icon-32-current-location-drag.png" style="width:16px; height:16px; display:block;" /></div>').on('tap',
						function(e, ui) {
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

				showPlaces(e, ui);
			} else {
				loadMaps();
				$(document).on('loadMaps', function() {
					createMap(e, ui);
				});
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}

	function showPlaces(e, ui) {

		try {
			if (typeof map != 'object') {
				createMap(e, ui);
			} else {
				if (navigator.geolocation) {

					$.mobile.loading("show", {
						text : "Consultando farmacias cercanas",
						textVisible : true,
						textonly : false,
						theme : 'b'
					});

					navigator.geolocation.getCurrentPosition(function(position) {

						viewModel.currLatitude = position.coords.latitude;
						viewModel.currLongitude = position.coords.longitude;

						var distance = lastCurrentLatlng ? calcDistance(lastCurrentLatlng.lat(), lastCurrentLatlng.lng(), position.coords.latitude, position.coords.longitude, 'K') : 0;

						// Centra el mapa en las coordenadas del
						// GPS
						map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

						// Carga lugares más cercanas de
						// acuerdo a la posición enviada
						if ((!lastCurrentLatlng || distance * 1000 > refreshPlacesDistance || lastMaxDistance != maxDistance) && (!ui || $(ui.prevPage).attr('id') != 'pharmacy-detail')) {
							loadPlaces(position);
							// viewModel.loadPharmacies(position);
						} else {
							fitBounds();
							$.mobile.loading('hide');
						}
					}, function(error) {
						$.mobile.loading('hide');
						// alert('error Here: ' + JSON.stringify(error));
						switch (error.code) {
						case error.PERMISSION_DENIED:
							showMessage("El usuario ha denegado el acceso a obtener su posición actual.");
							break;
						case error.POSITION_UNAVAILABLE:
							showConfirm("Información de posición actual no está disponible. Verifique que su GPS este encendido.\n\nDesea volver a intentar?", function(buttonIndex) {
								if (buttonIndex == 2) {
									showPlaces(e, ui);
								} else {
									viewModel.wasLoaded(true);
								}
							});
							break;
						case error.TIMEOUT:
							showConfirm("Tiempo de espera agotado para obtener la posición actual del usuario.\n\nDesea volver a intentar?", function(buttonIndex) {
								if (buttonIndex == 2) {
									showPlaces(e, ui);
								} else {
									viewModel.wasLoaded(true);
								}
							});
							break;
						case error.UNKNOWN_ERROR:
							showConfirm("Ha ocurrido un error desconocido.\n\nDesea volver a intentar?", function(buttonIndex) {
								if (buttonIndex == 2) {
									showPlaces(e, ui);
								} else {
									viewModel.wasLoaded(true);
								}
							});
							break;
						}
					}, {
						enableHighAccuracy : true
					});
				} else {
					console.log('geolocation not avaliable.');
					$.mobile.loading('hide');
				}
			}
		} catch (err) {
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function loadPlaces(position) {
		try {
			$.mobile.loading("show", {
				text : "Consultando farmacias cercanas",
				textVisible : true,
				textonly : false,
				theme : 'b'
			});
			clearAllMarkers();
			var latitude = position.coords ? position.coords.latitude : position.lat();
			var longitude = position.coords ? position.coords.longitude : position.lng();
			addCurrentPositionMarker(position);

			// Llama el servicio para obtener farmacias cercanas

			invokeService({
				url : config.svb,
				service : 'pharmacies',
				dataType : 'jsonp',
				data : {
					latitude : latitude,
					longitude : longitude,
					maxDistance : maxDistance
				},
				success : function(response) {
					try {
						lastCurrentLatlng = currentPositionMarker.getPosition();
						lastMaxDistance = maxDistance;
						var listItems = [];
						var farthestAwayPlace = 0;

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
							};

						});

						viewModel.pharmacies(pharmacies);
						viewModel.wasLoaded(true);

						$.each(response, function() {
							var icon = this.estado == 'A' ? iconMarkerBlue : iconMarkerRed;
							var status = this.estado == 'A' ? '<div style="font-weight:bold; font-size:12px;"><span style="color:#3cd628; font-weight: bold;">Abierto</span> <span style="font-weight: bold;">hasta las ' + this.horaCierre + '</span></div>'
									: '<div style="font-weight:bold; font-size:12px;"><span style="color:#d01818;">Cerrado <span style="color:black; font-weight:bold; font-size:12px;"> ' + this.horaApertura + '</span></span></div>';
							var thisAddress = this.direccion;
							try {
								thisAddress = thisAddress.toLowerCase();
							} catch (e) {
							}
							var teaser = '<a data-action="show-pharmacy-detail" data-pharmacy_id="' + this.codigoFarmacia + '" data-pharmacy_distance="' + this.distanciaReferencia + '" data-pharmacy_lat="' + this.latitud.replace(',', '.') + '" data-pharmacy_lon="' + this.longitud.replace(',', '.')
									+ '" style="color:#333; text-decoration:none;"><div style="white-space:normal;"><span style="font-weight:bold;">' + this.nombreFarmacia + '</span> <span style="font-weight:normal; font-size:11px; color:#99999;">- ' + this.distanciaReferencia + 'km</span></div>'
									+ status + '<div class="capitalized" style="font-weight:normal; font-size:11px; white-space:normal;">' + thisAddress + '</div></a>';

							// Agrega marcas al mapa
							infoWindow = new google.maps.InfoWindow({
								content : teaser
							});

							var marker = new google.maps.Marker({
								position : new google.maps.LatLng(this.latitud.replace(',', '.'), this.longitud.replace(',', '.')),
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

							// Agrega elementos a la lista
							listItems.push('<li>' + teaser + '</li>');

							// Obtiene la distancia de la
							// farmacia a mayor distancia
							farthestAwayPlace = Math.max(farthestAwayPlace, Number(this.distanciaReferencia.replace(',', '.')));
						});

						if (farthestAwayPlace > maxDistance) {
							farthestAwayPlace = Math.ceil(farthestAwayPlace);
							var maxRange = $page.find('[name="range-distance"]').attr('max');
							maxDistance = Math.min(maxRange, farthestAwayPlace);
							$page.find('[name="range-distance"]').val(maxDistance).slider('refresh');
							$page.find('#range-distance').text(maxDistance + (farthestAwayPlace > maxRange ? '+' : ''));
						} else {
							$page.find('#range-distance').text(maxDistance);
						}
						$page.find('[name="range-distance"]').slider('refresh');
						fitBounds();
						$.mobile.loading('hide');
						// Refresca la lista de lugares encontrados
						if (listItems.length > 0) {

							if (desplazar) {
								$('html,body').animate({
									scrollTop : $(document).height()
								}, 0);
							}

						} else {
							// $page.find('#search-places-list ul').html('<li>No
							// se han encontrado
							// resultados</li>').listview('refresh');
							// if
							// ($page.find('#search-places-map').is(':visible'))
							// {
							// showMapNoDataMessage();
							// }
						}

					} catch (err) {
						$.mobile.loading('hide');
						console.log(err.message);
						console.log(err.stack);
					}
				},
				error : function() {
					showMessage(defaultErrorMsg, null, 'Mensaje');
					viewModel.wasLoaded(true);
					$.mobile.loading('hide');
				}
			});
		} catch (err) {
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function showMapNoDataMessage() {
		$.mobile.loading('show', {
			textVisible : true,
			html : '<div style="text-align:center;">No existe disponible ubicaciones para visualizar en el mapa</div>'
		});
		setTimeout(function() {
			$.mobile.loading('hide');
		}, 3000);
	}
	function setTab(name) {
		try {
			switch (name) {
			case 'map':
				$page.find('#search-places-map').show();
				$page.find('#search-places-tab-map').addClass('ui-btn-active ui-state-persist');
				$page.find('#search-places-list').hide();
				$page.find('#search-places-tab-list').removeClass('ui-btn-active ui-state-persist');
				resizeMap();
				fitBounds();
				if (markers.length <= 1) {
					showMapNoDataMessage();
				}
				break;
			case 'list':
				$page.find('#search-places-map').hide();
				$page.find('#search-places-tab-map').removeClass('ui-btn-active ui-state-persist');
				$page.find('#search-places-list').show();
				$page.find('#search-places-tab-list').addClass('ui-btn-active ui-state-persist');
				$page.find('.tipbox').hide();
				break;
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function fitBounds() {
		try {
			// Permite que todas las marcas agregadas en el mapa estén visibles
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
	function clearAllMarkers() {
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
	}
	function addCurrentPositionMarker(position) {
		try {
			var latitude = position.coords ? position.coords.latitude : position.lat();
			var longitude = position.coords ? position.coords.longitude : position.lng();
			var currentLatlng = new google.maps.LatLng(latitude, longitude);

			// Agrega la posición actual a la lista de marcadores
			currentPositionMarker = new google.maps.Marker({
				position : currentLatlng,
				map : map,
				title : "Ubicación actual",
				shape : iconCurrentPositionShape,
				draggable : currentPositionMarkerDraggable,
				icon : iconCurrentPosition
			});

			// Accurancy circle
			if (accuracyCircle) {
				accuracyCircle.setMap(null);
			}
			if (position.coords) {
				accuracyCircle = new google.maps.Circle({
					center : currentLatlng,
					radius : position.coords.accuracy,
					map : map,
					fillColor : '#1877da',
					fillOpacity : '0.1',
					strokeColor : '#1877da',
					strokeOpacity : '0.5',
					strokeWeight : 1
				});
			}

			// Actualiza la posición del usuario
			google.maps.event.addListener(currentPositionMarker, 'dragend', function(event) {
				loadPlaces(event.latLng);
				toggleDraggableMarker('disable');
			});

			markers.push(currentPositionMarker);

			return currentPositionMarker;
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function resizeMap() {
		try {
			if ($page.is(':visible')) {
				var height = $(window).height() - ($page.find('[data-role="header"]').outerHeight() + $page.find('[data-role="footer"]').outerHeight());
				$('#search-places-map').height(height);

				if (map != null) {
					google.maps.event.trigger(map, 'resize');
				}
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function showPlaces2(e, ui) {

		try {
			if (typeof map != 'object') {
				createMap(e, ui);
			} else {
				if (navigator.geolocation) {

					/*$.mobile.loading("show", {
						text : "Consultando farmacias cercanas",
						textVisible : true,
						textonly : false,
						theme : 'b'
					});*/

					navigator.geolocation.getCurrentPosition(function(position) {

						viewModel.currLatitude = position.coords.latitude;
						viewModel.currLongitude = position.coords.longitude;

						addCurrentPositionMarker(position);

						var distance = lastCurrentLatlng ? calcDistance(lastCurrentLatlng.lat(), lastCurrentLatlng.lng(), position.coords.latitude, position.coords.longitude, 'K') : 0;

						// Centra el mapa en las coordenadas del
						// GPS
						map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

						// Carga lugares más cercanas de
						// acuerdo a la posición enviada
						if ((!lastCurrentLatlng || distance * 1000 > refreshPlacesDistance || lastMaxDistance != maxDistance) && (!ui || $(ui.prevPage).attr('id') != 'pharmacy-detail')) {
							// loadPlaces(position);
							// viewModel.loadPharmacies(position);
						} else {
							fitBounds();
							$.mobile.loading('hide');
						}
					}, function(error) {
						$.mobile.loading('hide');
						// alert('error Here: ' + JSON.stringify(error));
						switch (error.code) {
						case error.PERMISSION_DENIED:
							showMessage("El usuario ha denegado el acceso a obtener su posición actual.");
							break;
						case error.POSITION_UNAVAILABLE:
							showConfirm("Información de posición actual no está disponible. Verifique que su GPS este encendido.\n\nDesea volver a intentar?", function(buttonIndex) {
								if (buttonIndex == 2) {
									showPlaces(e, ui);
								} else {
									viewModel.wasLoaded(true);
								}
							});
							break;
						case error.TIMEOUT:
							showConfirm("Tiempo de espera agotado para obtener la posición actual del usuario.\n\nDesea volver a intentar?", function(buttonIndex) {
								if (buttonIndex == 2) {
									showPlaces(e, ui);
								} else {
									viewModel.wasLoaded(true);
								}
							});
							break;
						case error.UNKNOWN_ERROR:
							showConfirm("Ha ocurrido un error desconocido.\n\nDesea volver a intentar?", function(buttonIndex) {
								if (buttonIndex == 2) {
									showPlaces(e, ui);
								} else {
									viewModel.wasLoaded(true);
								}
							});
							break;
						}
					}, {
						enableHighAccuracy : true
					});
				} else {
					console.log('geolocation not avaliable.');
					$.mobile.loading('hide');
				}
			}
		} catch (err) {
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}
	}

})();