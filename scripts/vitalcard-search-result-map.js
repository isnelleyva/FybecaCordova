//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {

	var viewModel = {
		backh : function() {
			var urlToBack = data.urlToReturnFromVitalcardSearchMap == '' ? 'vitalcard-search-result.html' : data.urlToReturnFromVitalcardSearchMap;
			$(':mobile-pagecontainer').pagecontainer('change', urlToBack, {
				reverse : true
			});

		}
	}

	var $page = $('#vitalcard-search-result-map');
	var map;
	var markers = [];
	var lastCurrentLatlng;
	var infoWindow;
	var lastNet = '';
	var lastCit = '';
	var hayMarcas = true;

	$page.on('pagebeforecreate', function() {

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageinit', function() {
		try {
			$page.find('#buscar').click(function() {
				$page.find('#categories').scroller('show');
				return false;
			});

			$page.on('tap', '[data-action]', function() {
				switch ($(this).data('action')) {
				case 'set-tab':
					setTab($(this).data('tab-name'));
					break;
				case 'show-pharmacy-detail':
					loadNetworkVitalcard = true;
					$(':mobile-pagecontainer').pagecontainer('change', 'establishment-detail.html');
					break;
				case 'aceptarFiltro':
					$page.find("#popFiltro").popup("close");
					break;
				case 'loadDetail':
					$(':mobile-pagecontainer').pagecontainer('change', 'establishment-detail.html');
					break;
				}
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}).on('pagebeforeshow', function(e, ui) {

		if (lastNet != establishment.id || lastCit != cityCode) {

			$page.find('#search-places-list ul').empty();
			lastNet = establishment.id;
			lastCit = cityCode;

		}

		try {
			loadHeader();
			showPlaces(e, ui);
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}).on('pageshow', function(e, ui) {

		try {
			// $.mobile.loading('show', {
			// text : 'Cargando',
			// textVisible : true,
			// theme : 'b'
			// });
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	});

	function loadHeader() {
		try {
			list = [];

			$page.find('#search-places-list').css("margin-top", ((establishment.name.length > 40) ? '90px' : '85px'));

			list.push('<li style="height: ' + ((establishment.name.length > 24) ? '55' : '40') + 'px;">' + '<div id="logoImg" style="position: absolute;margin-top: 5px;text-align: center;"><img style="width: 60px; left: 15px; margin-left:10px" src=""/></div>' + '<h3 style="text-align: center; '
					+ 'white-space: normal' + '; margin-left: 70px;">' + ((establishment.name.length > 40) ? establishment.name.substring(0, 37) + '...' : establishment.name) + '</h3>' + '<p style="text-align: center;margin-left: 70px;">' + cityName + '</p></li>');

			$page.find('#header-text ul').html(list.join('')).listview('refresh');
			loadLogo();
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}

	function loadLogo() {
		try {
			setTab('list');
			if (establishment.logoId == '-1') {
				$page.find("#logoImg").empty();
				$page.find("#logoImg").append('<img style="text-align: center;width: 60px;top: 6px;left: 15px;margin-left:10px" src="themes/default/images2/noLogoNetwork.png"/>');
			} else {
				invokeService({
					url : svb,
					service : 'commerce',
					dataType : 'jsonp',
					data : {
						logoId : establishment.logoId
					},
					cache : {
						time : promotionsCacheTimeout
					},
					success : function(response) {
						$page.find("#logoImg").empty();
						$page.find("#logoImg").append('<img style="width: 60px;top: 6px;left: 15px; margin-left:10px" src="data: ' + response.mimeType + ';base64,' + response.imageString + '"/>');
					}
				});

			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
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
				map = new google.maps.Map($page.find('#search-places-mapC')[0], mapOptions);
				showPlaces(e, ui);
				if (debug)
					console.log('Visor de google maps creado');
			} else {
				loadMaps();
				$(document).on('loadMaps', function() {
					createMap(e, ui);
				});
				if (debug)
					console.log('Cargando libreria de google maps');
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
					navigator.geolocation.getCurrentPosition(function(position) {
						var distance = lastCurrentLatlng ? calcDistance(lastCurrentLatlng.lat(), lastCurrentLatlng.lng(), position.coords.latitude, position.coords.longitude, 'K') : 0;

						// Centra el mapa en las coordenadas del
						// GPS
						map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));

						// Carga lugares más cercanas de acuerdo
						// a la posición enviada
						if ((!lastCurrentLatlng || distance * 1000 > refreshPlacesDistance || lastMaxDistance != maxDistance)) {
							loadPlaces(position);
						} else {
							fitBounds();
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
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
			clearAllMarkers();
			var latitude = position.coords ? position.coords.latitude : position.lat();
			var longitude = position.coords ? position.coords.longitude : position.lng();

			invokeService({
				url : svb,
				service : 'Commerce/',
				dataType : 'jsonp',
				data : {
					codeCity : cityCode,
					codeNetwork : establishment.id
				},
				cache : {
					key : cityCode + establishment.id,
					time : promotionsCacheTimeout
				},
				success : function(response) {
					try {
						var listItems = [];

						if (response == undefined) {

							$page.find('#search-places-list ul').html('<li style="margin-bottom:10px;">No hay establecimientos cercanos</li>').listview('refresh');
							return;

						}

						if (response.length == 0) {

							$page.find('#search-places-list ul').html('<li><h3>No existen locales de esta cadena en esta ciudad</h3><p style="white-space: initial;text-align: justify;"><strong></strong></p><p></p></li>').listview('refresh');

						}

						$.each(response,
								function() {
									var conUbicacion = (this.latitud == '0' && this.latitud == '0') ? false : true;

									var teaser = '<a data-action="show-pharmacy-detail" data-pharmacy_id="' + this.codigo + '" style="color:#333; text-decoration:none;"><div><span style="font-weight:bold;">' + this.nombre
											+ '</span> - <span style="font-weight:normal; font-size:11px; color:#99999;"></span></div><div class="capitalized" style="font-weight:normal; font-size:11px;">' + this.direccion + '</div></a>';
									icon = new google.maps.MarkerImage('themes/default/images2/categories/' + this.codigoCategoria + '_pin.png', new google.maps.Size(33, 34), new google.maps.Point(0, 0), new google.maps.Point(17, 34), new google.maps.Size(33, 34));

									// Agrega marcas al mapa
									// Ubicación en el mapa no
									// disponible
									infoWindow = new google.maps.InfoWindow({
										content : teaser
									});

									if (conUbicacion) {
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
									}
									// Agrega elementos a la lista
									var telString = '';
									if (this.telefono != null) {
										var telefonos = this.telefono.split('/');
										for ( var i = 0; i < telefonos.length; i++) {
											telString += '<a href="tel:' + telefonos[i] + '">' + telefonos[i] + '  </a>' + ((i == (telefonos.length - 1)) ? '' : ' - ');
										}
									}
									listItems.push('<li><h3>' + this.nombre + '</h3><p style="white-space: initial;text-align: justify;"><strong>' + this.direccion + '</strong></p><p>' + telString + '</p>' + ((conUbicacion) ? '' : '<p style="opacity: .5;">Ubicación en el mapa no disponible</p>')
											+ '</li>');
								});

						if (markers.length > 0) {
							hayMarcas = true;
							fitBounds();
							// Refresca la lista de lugares encontrados
							$page.find('#search-places-list').css("margin-top", '0px');
							$page.find('#search-places-list ul').html(listItems.join('')).listview('refresh');
						} else {
							$page.find('#search-places-list').css("margin-top", '0px');
							hayMarcas = false;
							map.setCenter(new google.maps.LatLng(latitude, longitude));
							map.setZoom(defaultMapZoom);
							if (debug)
								console.log('No existen marcas en el mapa, mapa centrado en la posición actual');
							// $page.find('#search-places-list
							// ul').css("margin-top", (establishment.name.length
							// > 24) ? '63px' : '43px');

							if (listItems.length > 0) {

								$page.find('#search-places-list').css("margin-top", '0px');
								$page.find('#search-places-list ul').html(listItems.join('')).listview('refresh');

							} else {

								$page.find('#search-places-list ul').html('<li style="margin-bottom:10px;">No hay establecimientos cercanos</li>').listview('refresh');

							}

							if ($page.find('#search-places-mapB').is(':visible')) {
								showMapNoDataMessage();
							}
						}
						$.mobile.loading('hide');
					} catch (err) {
						$.mobile.loading('hide');
						console.log(err.message);
						console.log(err.stack);
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
				$page.find('#search-places-mapC').show();
				$page.find('#header-text1').css({
					'opacity' : '0.7'
				});
				$page.find('#search-places-tab-map').addClass('ui-btn-active ui-state-persist');
				$page.find('#search-places-list').hide();
				$page.find('#search-places-tab-list').removeClass('ui-btn-active ui-state-persist');
				resizeMap();
				if (markers.length == 0) {
					showMapNoDataMessage();
				}
				if (hayMarcas) {
					fitBounds();
				}
				break;
			case 'list':
				$page.find('#search-places-mapC').hide();
				$page.find('#header-text1').css({
					'opacity' : '1'
				});
				$page.find('#search-places-tab-map').removeClass('ui-btn-active ui-state-persist');
				$page.find('#search-places-list').show();
				$page.find('#search-places-tab-list').addClass('ui-btn-active ui-state-persist');
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
			var bounds = new google.maps.LatLngBounds();
			$.each(markers, function() {
				bounds.extend(this.getPosition());
			});
			map.fitBounds(bounds);

			if (markers.length == 1) {

				map.setZoom(15);

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
			$page.find('#presentation-near-list ul').html('');
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}

	function resizeMap() {
		try {
			if ($page.is(':visible')) {
				var height = $(window).height() - ($page.find('[data-role="header"]').outerHeight() + $page.find('[data-role="footer"]').outerHeight());
				$page.find('#search-places-mapC').height(height);

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