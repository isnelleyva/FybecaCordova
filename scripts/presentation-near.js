//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	// var $page = $('#presentation-near');
	var $page = $($('script').last()).closest('[data-role="page"]');
	var map;
	var markers = [];
	var lastPresentationId;
	var lastCurrentLatlng;
	var lastMinStock;
	var lastMaxDistance = maxDistance;
	var currentPositionMarker;
	var currentPositionMarkerDraggable = false;
	var accuracyCircle;
	var infoWindow;
	var lastUnit;
	var tipBoxTimer;
	var desplazar = false;

	var viewModel = {

		currLatitude : '',
		currLongitude : '',

		showPresentation : ko.observable(false),

		selectedPresentationN : ko.observable('U'),

		showConversion : ko.observable(false),

		unitsPerBox : ko.observable(1),

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

			$.mobile.loading("show", {
				text : 'Obteniendo información',
				textVisible : true,
				theme : 'b'
			});

			viewModel.pharmacyData.id = pharmacy.code;

			var data = {
				latitude : viewModel.currLatitude,
				longitude : viewModel.currLongitude,
				pharmacyId : pharmacy.code
			};

			models.DataRequests.getPharmacyDetail(data).done(function(response) {

				$page.find('#popupPharmacyDetail').popup('open');

				viewModel.pharmacyData.name(response.nombreFarmacia);
				viewModel.pharmacyData.address(response.direccion);
				viewModel.pharmacyData.phones(response.telefonos);
				viewModel.pharmacyData.schedule(response.horarios);
				viewModel.pharmacyData.services(response.servicios.join(', '));
				viewModel.pharmacyData.distance(response.distanciaReferencia);

			}).always(function() {
				$.mobile.loading("hide");
			});

			viewModel.loadPharmacyImage(pharmacy.code);

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

		},

		recalculate : function(form) {
			debugger;
			$('#popupQuantity').popup('close');
			var thisData = $(form).serializeObject();

			presentation_unit = viewModel.selectedPresentationN();
			presentation_minStock = thisData.presentationQuantity;

			loadPlaces({
				coords : {
					latitude : viewModel.currLatitude,
					longitude : viewModel.currLongitude
				}
			});

		}

	};

	$page.on('pageinit', function() {
		try {

			$page.find('[data-action="show-quantity"]').on('click', function() {
				$('#popupQuantity').popup('open');
				// $(':mobile-pagecontainer').pagecontainer('change',
				// 'product-quantity.html', {
				// changeHash : false
				// });
			});

			$page.on('tap', '[data-action]', function() {
				switch ($(this).data('action')) {
				case 'back':

					var urlToBack = data.urlToReturnFromMap;
					urlToBack = urlToBack == '' ? 'search-products.html' : urlToBack;

					$(':mobile-pagecontainer').pagecontainer('change', 'app/views/' + urlToBack, {
						reverse : true
					});
					break;
				case 'set-tab':
					setTab($(this).data('tab-name'));
					break;
				case 'show-pharmacy-detail':
					// window.current_map = 'presentation-near';
					// pharmacy_id = $(this).data('pharmacy_id');
					// pharmacy_distance = $(this).data('pharmacy_distance');
					// $(':mobile-pagecontainer').pagecontainer('change',
					// 'pharmacy-detail.html');

					viewModel.pharmacyData.distance($(this).data('pharmacy_distance'));

					viewModel.loadPharmacyDetail({
						code : $(this).data('pharmacy_id')
					});

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

			// Escucha de un llamado para ver en mapa una
			// farmacia
			// $.subscribe('presentation-near-marker-detail', function(e, id) {
			// $(':mobile-pagecontainer').pagecontainer('change',
			// 'presentation-near.html');
			// setTab('map');
			// var marker = null;
			// $.each(markers, function(i) {
			// if (i > 0 && Number(this.id) == id) {
			// marker = this;
			// }
			// });
			// if (marker) {
			// infoWindow.setContent('<div class="infoWindow"
			// style="margin-bottom:5px;">' + marker.teaser + '</div>');
			// infoWindow.open(map, marker);
			// }
			// });

			// $.subscribe('restore-page', function() {
			// setTab('list');
			// });

		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}

		try {
			if (!ko.dataFor($page[0])) {
				ko.applyBindings(viewModel, $page[0]);
			}
		} catch (err) {
			console.log(err.message);
		}

	})

	.on('pageshow', function(e, ui) {
		try {
			desplazar = false;
			var price = presentation_unit == 'C' ? presentation_price : presentation_price / presentation_units;
			var quantity_price = presentation_minStock > 0 ? presentation_minStock * price : presentation_price;
			var minStock = presentation_minStock > 0 ? presentation_minStock + ' ' : '1 ';
			var units = '';
			var unitAux = '';
			if (presentation_unit == 'U' && presentation_minStock > 0) {
				units = ' (' + presentation_minStock + ' unidades)';
				unitAux = presentation_units + ' unidades';
			} else if (presentation_units > 1 && presentation_unit == 'C') {
				units = ' (' + (Number(minStock) * presentation_units) + ' unidades)';
				unitAux = presentation_units + ' unidades';
				viewModel.unitsPerBox(Number(minStock) * presentation_units);
				viewModel.showConversion(true);
			}

			$page.find('#presentation_name').text((presentation_unit == 'C' ? minStock : '') + product_name + ' - ' + presentation_name + (presentation_unit != 'C' ? units : ''));
			$page.find('#presentation_price').text('$' + (Math.round(quantity_price * 100) / 100));
			$page.find('#presentation').empty();
			// $page.find('#presentation').append(((units == '') ? '' : '1
			// Presentación = ' + unitAux));
			$page.find('#range-distance').text($page.find('[name="range-distance"]').val());
			$page.find('[name="range-distance"]').val(maxDistance).slider('refresh');
			$page.find('#range-distance').text(maxDistance);
			presentationNameCenter();
			showPlaces(e, ui);

			viewModel.selectedPresentationN(presentation_units == 1 ? 'U' : 'C');
			viewModel.showPresentation(presentation_units != 1);

		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}

	});
	function toggleTipBox(status) {
		switch (status) {
		case 'show':
			$page.find('.tipbox').slideDown();
			$page.find('#presentation-near-header').hide();
			break;
		case 'hide':
			$page.find('.tipbox').hide();
			$page.find('#presentation-near-header').show();
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
			map = new google.maps.Map(document.getElementById('presentation-near-map'), mapOptions);
			var currentPositionControl = $('<div class="btn-control ui-btn ui-shadow ui-btn-corner-all ui-mini ui-btn-inline ui-btn-up-c" style="border-radius:4px;"><img src="themes/default/images2/icon-32-location.png" style="width:16px; height:16px; display:block;" /></div>').on('tap', function(e, ui) {
				showPlaces(e, ui);
			}).appendTo('<div />');
			var currentPositionDrag = $('<div id="btn-move" class="btn-control ui-btn ui-shadow ui-btn-corner-all ui-mini ui-btn-inline ui-btn-up-c" style="border-radius:4px;"><img src="themes/default/images2/icon-32-current-location-drag.png" style="width:16px; height:16px; display:block;" /></div>').on('tap', function(e, ui) {
				var $self = $(this);
				if ($self.not('.disabled').length > 0) {
					$self.toggleClass("down").addClass('disabled');
					setTimeout(function() {
						$self.removeClass('disabled')
					}, 600);
					if ($self.hasClass('down')) {
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
	}
	function showPlaces(e, ui) {
		try {
			if (typeof map != 'object') {
				createMap(e, ui);
			} else {
				if (navigator.geolocation) {
					$.mobile.loading("show", {
						text : 'Consultando presentaciones',
						textVisible : true,
						theme : 'b'
					});
					navigator.geolocation.getCurrentPosition(function(position) {

						try {
							viewModel.currLatitude = position.coords.latitude;
							viewModel.currLongitude = position.coords.longitude;
						} catch (e) {
							// TODO: handle exception
						}

						var distance = lastCurrentLatlng ? calcDistance(lastCurrentLatlng.lat(), lastCurrentLatlng.lng(), position.coords.latitude, position.coords.longitude, 'K') : 0;

						map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

						if ((lastPresentationId != presentation_id) || (lastMinStock != presentation_minStock) || (lastUnit != presentation_unit) || (!lastCurrentLatlng || distance * 1000 > refreshPlacesDistance || lastMaxDistance != maxDistance) && (!ui || $(ui.prevPage).attr('id') != 'pharmacy-detail')) {
							loadPlaces(position);
						} else {
							fitBounds();
							$.mobile.loading('hide');
						}
					}, function(error) {
						$.mobile.loading('hide');
						switch (error.code) {
						case error.PERMISSION_DENIED:
							showMessage("El usuario ha denegado el acceso a obtener su posición actual.");
							break;
						case error.POSITION_UNAVAILABLE:
							showConfirm("Información de posición actual no está disponible. Verifique que su GPS este encendido.\n\nDesea volver a intentar?", function(buttonIndex) {
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
				text : 'Consultando presentaciones',
				textVisible : true,
				theme : 'b'
			});
			clearAllMarkers();

			var latitude = position.coords ? position.coords.latitude : position.lat();
			var longitude = position.coords ? position.coords.longitude : position.lng();
			addCurrentPositionMarker(position);

			pharmacy_lat = latitude;
			pharmacy_lon = longitude;

			invokeService({
				url : svb,
				service : 'pharmacies',
				dataType : 'jsonp',
				data : {
					code : presentation_id,
					minStock : (presentation_minStock && presentation_minStock > 0) ? presentation_minStock : -1,
					unit : presentation_unit,
					latitude : latitude,
					longitude : longitude,
					unitsPerPresentation : presentation_units.toString(),
					maxDistance : maxDistance,
					applicationCode : parameters.codigoAplicacion
				},
				success : function(response) {

					if (response == null) {
						window.history.back();
						showMessage('Stock no disponible para la presentación seleccionada', null, 'Mensaje');
						return;
					}

					lastPresentationId = presentation_id;
					lastCurrentLatlng = currentPositionMarker.getPosition();
					lastMaxDistance = maxDistance;
					lastMinStock = presentation_minStock;
					lastUnit = presentation_unit;
					var listItems = [];
					var farthestAwayPlace = 0;

					$.each(response, function() {
						var status = this.estado == 'A' ? '<span style="color:#3cd628; font-weight:bold; font-size:12px;">Abierto <span style="color:black; font-weight:bold; font-size:12px;">hasta las ' + this.horaCierre + '</span></span>' : '<span style="color:#d01818; font-weight:bold; font-size:12px;">Cerrado <span style="color:black; font-weight:bold; font-size:12px;"> ' + this.horaApertura + '</span></span>';
						var minStock = presentation_minStock > 0 ? presentation_minStock : presentation_defaultMinStock;
						var stockCount = this.stockCaja;
						var stockQuantity = Number(this.stockCaja);
						var stockVars = stockQuantity >= minStock || stockCount.indexOf("+") >= 0 || (Number(this.stockUnidad) >= minStock && presentation_unit == 'U') ? {
							'class' : 'stock-avaliable',
							icon : iconMarkerGreen
						} : {
							'class' : 'stock-low',
							icon : iconMarkerOrange
						};

						if (this.estado == 'C')
							stockVars.icon = iconMarkerRed;
						var boxMessage = this.stockVentaCaja ? 'Venta solo por Presentación' : 'Venta por Unidades y Presentación';
						var stockUnitCount = this.stockUnidad;
						var availableUnits = (Number(this.stockCaja) == 0 && Number(this.stockUnidad) > 0) || (presentation_unit == 'U' && Number(this.stockUnidad) > 0) ? '<span style="font-size:11px;">Unidades disponibles: ' + stockUnitCount + '</span>' : '';
						var fields = '<div><span style="font-size:11px; font-weight:bold;">' + boxMessage + '</span> <div> <span class="ui-li-count stock-count ' + stockVars['class'] + '" style="border:0; color:#FFFFFF; text-shadow:0 0 0; bottom: 15%; top: 85%; font-size: 11px;">Stock caja: ' + stockCount + '</span> ' + availableUnits + '</div></div>';
						var teaser = '<a data-action="show-pharmacy-detail" data-pharmacy_distance="' + this.distanciaReferencia + '" data-pharmacy_id="' + this.codigoFarmacia + '" style="color:#333; text-decoration:none;  white-space: normal;"><div><span style="font-weight:bold;">' + this.nombreFarmacia + '</span> - <span style="font-weight:normal; font-size:11px; color:#99999;">' + this.distanciaReferencia + 'km</span></div>' + status + '<div class="capitalized" style="font-weight:normal; font-size:11px;">' + this.direccion + '</div>' + fields + '</a>';

						// Agrega marcas al mapa
						infoWindow = new google.maps.InfoWindow({
							content : teaser
						});
						var marker = new google.maps.Marker({
							position : new google.maps.LatLng(this.latitud.replace(',', '.'), this.longitud.replace(',', '.')),
							map : map,
							icon : stockVars.icon,
							shadow : iconMarkerShadow,
							shape : iconMarkerShape,
							title : this.nombreFarmacia,
							teaser : teaser,
							id : this.codigoFarmacia
						});
						google.maps.event.addListener(marker, 'click', function() {
							infoWindow.setContent('<div class="infoWindow">' + marker.teaser + '</div>');
							infoWindow.open(map, marker);
						});
						markers.push(marker);

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
					$page.find('[name="range-distance"]').slider('refresh');

					fitBounds();
					$.mobile.loading('hide');

					// Refresca la lista de lugares encontrados
					if (listItems.length > 0) {

						if (maxDistance < 10) {
							listItems.push('<li data-icon="plus" style="text-align: center; margin-bottom: 15px;"><a data-role="button" data-action="show-more" id="btnLoad">Encontrar más farmacias</a></li>');
						}

						$page.find('#presentation-near-list ul').html(listItems.join('')).listview('refresh');

						if (desplazar) {

							$('html,body').animate({
								scrollTop : $(document).height()
							}, 0);

						}

					} else {
						$page.find('#presentation-near-list ul').html('<li>No se han encontrado resultados</li>').listview('refresh');
						if ($page.find('#presentation-near-map').is(':visible')) {
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
				map.setCenter(lastCurrentLatlng);
				map.setZoom(defaultMapZoom);
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function clearAllMarkers() {
		try {
			$.each(markers, function() {
				this.setMap(null);
			});
			markers = [];
			$page.find('#presentation-near-list ul').html('');
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

			currentPositionMarker = new google.maps.Marker({
				position : currentLatlng,
				map : map,
				title : "Ubicación actual",
				shape : iconCurrentPositionShape,
				draggable : currentPositionMarkerDraggable,
				icon : iconCurrentPosition
			});

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
				$page.find('#presentation-near-map').show();
				$page.find('#presentation-near-tab-map').addClass('ui-btn-active ui-state-persist');
				$page.find('#presentation-near-list').hide();
				$page.find('#presentation-near-tab-list').removeClass('ui-btn-active ui-state-persist');
				resizeMap();
				fitBounds();
				if (markers.length <= 1) {
					showMapNoDataMessage();
				}
				break;
			case 'list':
				$page.find('#presentation-near-map').hide();
				$page.find('#presentation-near-tab-map').removeClass('ui-btn-active ui-state-persist');
				$page.find('#presentation-near-list').show();
				$page.find('#presentation-near-tab-list').addClass('ui-btn-active ui-state-persist');
				$page.find('.tipbox').hide();
				$page.find('#presentation-near-header').show();
				break;
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function resizeMap() {
		try {
			if ($page.is(':visible')) {
				var height = $(window).height() - ($page.find('[data-role="header"]').outerHeight() + $page.find('[data-role="footer"]').outerHeight());
				$page.find('#presentation-near-map').height(height);

				if (map != null) {
					google.maps.event.trigger(map, 'resize');
				}
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function presentationNameCenter() {
		try {
			if ($page.find('#presentation_name').height() < 30) {
				$page.find('#presentation_name').css({
					'margin-top' : 7
				});
			} else {
				$page.find('#presentation_name').css({
					'margin-top' : 0
				});
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
})();