//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {

	var viewModel = {

		vitalcardCategories : ko.observableArray([]),

		selectedCategoryId : 'TODO',

		selectedCategoryName : ko.observable('Todos los establecimientos'),

		chooseCategory : function(category) {
			$page.find('#popupVitalcardCategories').popup('close');
			viewModel.selectedCategoryName(category.name);
			viewModel.selectedCategoryId = category.code;
			debugger;
			loadPlaces(lastCurrentLatlng);
			toggleDraggableMarker('disable');
		},

		loadVitalcardCategories : function() {

			$.mobile.loading("show", {
				text : 'Obteniendo categorías',
				textVisible : true,
				theme : 'b'
			});

			models.DataRequests.getVitalcardCategories(viewModel.selectedCategoryId).done(function(response) {
				viewModel.vitalcardCategories(response);
				$page.find('#vitalcardCategoriesList').listview('refresh');
			}).always(function() {
				$.mobile.loading("hide");
			})
		},

		loadVitalcardCities : function() {

			$.mobile.loading("show", {
				text : 'Obteniendo categorías',
				textVisible : true,
				theme : 'b'
			});

			models.DataRequests.getVitalcardCities(viewModel.selectedCategoryId).done(function(response) {
				viewModel.vitalcardCities(response);
				$page.find('#vitalcardCitiesList').listview('refresh');
			}).always(function() {
				$.mobile.loading("hide");
			})
		}

	}

	var $page = $('#vitalcard-map');
	var map;
	var markers = [];
	var lastCurrentLatlng;
	var lastMaxDistance = maxDistance;
	var currentPositionMarker;
	var currentPositionMarkerDraggable = false;
	var accuracyCircle;
	var infoWindow;
	var lastCategory = "TODO";
	var lastCat = "";
	var tipBoxTimer;
	var desplazar = false;

	$page.on('pagebeforecreate', function() {
		ko.applyBindings(viewModel, $page[0]);
	}).on('pageinit', function() {
		try {
			$page.find('#sCateg').on('click', function() {
				$(':mobile-pagecontainer').pagecontainer('change', $('#vitalcardFiltersMap'), {
					changeHash : false
				});
				pageToReturn = "vitalcard-search.html";
			});
			// loadCategories();
			$page.on('tap', '[data-action]', function() {
				switch ($(this).data('action')) {
				case 'set-tab':
					setTab($(this).data('tab-name'));
					break;
				case 'show-pharmacy-detail':
					establishment.id = $(this).data('establishment_id');
					establishment.logoId = $(this).data('logo_id');
					loadNetworkVitalcard = false;
					$(':mobile-pagecontainer').pagecontainer('change', 'establishment-detail.html');
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
					$page.find('#range-distance').text(maxDistance);
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
	})

	.on('pageshow', function(e, ui) {
		try {

			$page.find('#category_name').text(data.vitalcardCategoryName);

			$page.find('[name="range-distance"]').val(maxDistance).slider('refresh');
			$page.find('#range-distance').text(maxDistance);
			desplazar = false;
			if (lastCat != categoryCode) {
				lastCat = categoryCode;
				$page.find('#search-places-list ul').empty();
			}
			if ($('#vitalcardFiltersMap').find('#categoriesList').size() < 1) {
				if (debug)
					console.log("No hay categorias.");
				// loadCategories();
			}

			try {
				if (navigator.connection.type == Connection.NONE) {
					ShowMessageInternetNotAvailable();
					return;
				}
			} catch (err) {

			}

			viewModel.loadVitalcardCategories();
			showPlaces(e, ui);

		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	});
	function toggleTipBox(status) {
		switch (status) {
		case 'show':
			$page.find('#vitalcard-map-header').hide();
			$page.find('.tipbox').slideDown();
			break;
		case 'hide':
			$page.find('.tipbox').hide();
			$page.find('#vitalcard-map-header').show();
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
					}
				};

				$(window).resize(resizeMap);
				map = new google.maps.Map($page.find('#search-places-mapB')[0], mapOptions);
				var currentPositionControl = $('<div class="btn-control ui-btn ui-shadow ui-btn-corner-all ui-mini ui-btn-inline ui-btn-up-c" style="border-radius:4px;"><img src="themes/default/images2/icon-32-location.png" style="width:16px; height:16px; display:block;" /></div>').on('tap', function(e, ui) {
					showPlaces(e, ui);
				}).appendTo('<div />');
				var currentPositionDrag = $('<div id="btn-move" class="btn-control ui-btn ui-shadow ui-btn-corner-all ui-mini ui-btn-inline ui-btn-up-c" style="border-radius:4px;"><img src="themes/default/images2/icon-32-current-location-drag.png" style="width:16px; height:16px; display:block;" /></div>').on('tap', function(e, ui) {
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
			// Crea el visor de mapa si no existe
			if (typeof map != 'object') {
				createMap(e, ui);
			} else {
				if (navigator.geolocation) {
					$.mobile.loading('show', {
						text : 'Cargando',
						textVisible : true,
						theme : 'b'
					});
					navigator.geolocation.getCurrentPosition(function(position) {
						if (debug)
							console.log('Posición de GPS obtenida.');

						var distance = lastCurrentLatlng ? calcDistance(lastCurrentLatlng.lat(), lastCurrentLatlng.lng(), position.coords.latitude, position.coords.longitude, 'K') : 0;

						// Centra el mapa en las coordenadas del
						// GPS
						map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

						if ((!lastCurrentLatlng || distance * 1000 > refreshPlacesDistance || lastMaxDistance != maxDistance) || lastCategory != categoryCode) {
							lastCategory = categoryCode;
							loadPlaces(position);
						} else {
							fitBounds();
							$.mobile.loading('hide');
						}
					}, function(error) {
						switch (error.code) {
						case error.PERMISSION_DENIED:
							showMessage("El usuario ha denegado el acceso a obtener su posición actual.");
							break;
						case error.POSITION_UNAVAILABLE:
							showConfirm("Información de posición actual no está disponible.  Verifique que su GPS este encendido.\n\nDesea volver a intentar?", function(buttonIndex) {
								if (buttonIndex == 2)
									showPlaces(e, ui);
							});
							break;
						case error.TIMEOUT:
							showConfirm("Tiempo de espera agotado para obtener la posición actual del usuario.\n\nDesea volver a intentar?", function(buttonIndex) {
								if (buttonIndex == 2)
									showPlaces(e, ui);
							});
							break;
						case error.UNKNOWN_ERROR:
							showConfirm("Ha ocurrido un error desconocido.\n\nDesea volver a intentar?", function(buttonIndex) {
								if (buttonIndex == 2)
									showPlaces(e, ui);
							});
							break;
						}
					}, {
						enableHighAccuracy : true
					});
				} else {
					if (debug)
						console.log('geolocation not avaliable.');
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
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
			clearAllMarkers();
			var latitude = position.coords ? position.coords.latitude : position.lat();
			var longitude = position.coords ? position.coords.longitude : position.lng();
			addCurrentPositionMarker(position);

			// Llama el servicio para obtener farmacias cercanas
			invokeService({
				url : svb,
				service : 'Commerce/',
				dataType : 'jsonp',
				data : {
					category : viewModel.selectedCategoryId,
					latitude : latitude,
					longitude : longitude,
					distinct : 'GetCommerceFiltered',
					maxDistance : maxDistance
				},
				success : function(response) {

					lastCurrentLatlng = currentPositionMarker.getPosition();
					lastMaxDistance = maxDistance;
					var listItems = [];
					var farthestAwayPlace = 0;

					$.each(response, function() {
						var address = this.direccion.substring(0, 45);
						if (this.direccion.length > 45)
							address = address + '...';
						var teaser = '<a data-action="show-pharmacy-detail" data-establishment_id="' + this.codigo + '" data-logo_id="' + this.logoId + '" style="color:#333; text-decoration:none; margin-left: 0px;"><div><span style="font-weight:bold;white-space:normal;">' + this.nombre + '</span> - <span style="font-weight:normal; font-size:11px; color:#99999;">' + this.distanciaReferencia + ' km</span></div><div class="capitalized" style="font-weight:normal; font-size:11px;">' + address + '</div></a>';

						icon = new google.maps.MarkerImage('themes/default/images2/categories/' + this.codigoCategoria + '_pin.png', new google.maps.Size(33, 34), new google.maps.Point(0, 0), new google.maps.Point(17, 34), new google.maps.Size(33, 34));

						// Agrega marcas al mapa
						infoWindow = new google.maps.InfoWindow({
							content : teaser
						});
						var marker = new google.maps.Marker({
							position : new google.maps.LatLng(this.latitud.replace(',', '.'), this.longitud.replace(',', '.')),
							map : map,
							icon : icon,
							shadow : iconVCShadow,
							shape : iconMarkerShape,
							title : this.nombre,
							teaser : teaser
						});
						google.maps.event.addListener(marker, 'click', function() {
							infoWindow.setContent(marker.teaser);
							infoWindow.open(map, marker);
						});
						markers.push(marker);

						// Agrega elementos a la lista
						listItems.push('<li>' + teaser + '</li>');

						// Obtiene la distancia de la farmacia a
						// mayor distancia
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

					fitBounds();
					$.mobile.loading('hide');

					// Refresca la lista de lugares encontrados
					if (listItems.length > 0) {
						if (maxDistance < 10) {
							listItems.push('<li data-icon="plus" style="text-align: center"><a data-role="button" data-action="show-more" id="btnLoad">Encontrar más establecimientos</a></li>');
						}
						$page.find('#search-places-list ul').html(listItems.join('')).listview('refresh');

						if (desplazar) {
							$('html,body').animate({
								scrollTop : $(document).height()
							}, 0);
						}
					} else {
						$page.find('#search-places-list ul').html('<li class="liInfo">No hay establecimientos cercanos</li>').listview('refresh');
						if ($page.find('#search-places-mapB').is(':visible')) {
							showMapNoDataMessage();
						}
					}

				},
				error : function() {
					showMessage(defaultErrorMsg, null, 'Mensaje');
					$.mobile.loading('hide');
				}
			});
		} catch (err) {
			$.mobile.loading('hide');
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
				$page.find('#search-places-mapB').show();
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
				$page.find('#search-places-mapB').hide();
				$page.find('#search-places-tab-map').removeClass('ui-btn-active ui-state-persist');
				$page.find('#search-places-list').show();
				$page.find('#search-places-tab-list').addClass('ui-btn-active ui-state-persist');
				$page.find('.tipbox').hide();
				$page.find('#vitalcard-map-header').show();
				break;
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
				$page.find('#search-places-mapB').height(height);

				if (map != null) {
					google.maps.event.trigger(map, 'resize');
				}
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
})();