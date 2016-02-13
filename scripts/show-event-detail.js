//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#show-event-detail');

	var horaInicio;
	var minutoInicio;
	var horaFin;
	var minutoFin;
	var fechaElegida;
	var farmaciasJuntas = '';
	var descripcionCalendario = '';
	var imgUrl = '';
	var eventCaption = '';
	var eventName = '';
	var eventCity = ' ';
	var eventDescription = '';
	var timeInit = 0;
	var timeEnd = 0;
	var fechaInicioAgendar;
	var fechaFinAgendar;
	var isEventFinished = false;

	$page.on('pageinit', function() {

		loadChildBrowser();
		var aux = 0;

		$(window).scroll(function() {

			if (aux > 0) {
				$page.find('#btnMas').hide();
			}
			aux++;

		});

		$page.find('#share').click(function() {
			if (isEventFinished) {
				showMessage('Este evento ha finalizado, no es posible compartirlo.', null, 'Fybeca');
				return;
			}
			$page.find('#shareMenu').popup('open');
		});

		$page.find('#btnTwitter').click(function() {
			if (navigator.network.connection.type != Connection.NONE) {
				var tweetText = event_name + ', ' + eventDescription;
				tweetText = (tweetText.length > 125) ? tweetText.substring(0, 125) + '...' : tweetText;

				tweet({
					text : tweetText,
					via : 'fybeca',
					url : 'www.fybeca.com'
				});
				$page.find('#shareMenu').popup('close');
			} else {
				ShowMessageInternetNotAvailable();
			}
		});
		$page.find('#btnFacebook').click(function() {
			if (navigator.network.connection.type != Connection.NONE) {
				facebook_post_parameters.link = eventShareUrlBase + '?codeEvent=' + event_id + '&codeCity=' + cityCode;
				facebook_post_parameters.picture = imgUrl;
				facebook_post_parameters.caption = eventDescription;
				facebook_post_parameters.name = event_name;
				facebook_post_parameters.description = '';

				if (!facebook_access_token) {
					facebook_auth(function() {
						window.plugins.childBrowser.close();
						setTimeout(function() {
							facebook_post();
						}, 500);
					});

				} else {
					facebook_post();
					exportarDatosFacebook();
				}
			} else {
				ShowMessageInternetNotAvailable();
			}
			$page.find('#shareMenu').popup('close');
		});
		$page.find('#btnGoogle').click(function() {
			if (navigator.network.connection.type != Connection.NONE) {
				if (!google_access_token) {
					google_auth(function() {
						window.plugins.childBrowser.close();
						setTimeout(function() {
							gplus_post({
								url : eventShareUrlBase + '?codeEvent=' + event_id + '&codeCity=' + cityCode
							});
						}, 500);
					});

				} else {
					getGoogleData();
					gplus_post({
						url : eventShareUrlBase + '?codeEvent=' + event_id + '&codeCity=' + cityCode
					});
				}
			} else {
				ShowMessageInternetNotAvailable();
			}
			$page.find('#shareMenu').popup('close');
		});

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'agendar':
				if (!isEventFinished)
					calendar();
				else
					showMessage('Este evento ha finalizado, no es posible agendarlo.', null, 'Fybeca');

				break;
			// case 'mas':
			//
			// $('html,body').animate({
			// scrollTop : $(document).height()
			// }, 2000);
			//
			// $page.find('#btnMas').hide();
			// $(document).scrollTop($(document).height());
			// break;
			}
		});
	}).on('pageshow', function() {
		eventCity = ' ';
		farmaciasJuntas = '';
		descripcionCalendario = '';
		$page.find('#btnMas').show();
		vaciar();
		loadEventInfo();
		// loadEventImage();

	});

	// function loadEventImage() {
	//
	// var listcab = [];
	// listcab.push('<li style="text-align: center;border: white;font-size:
	// 20px;">' + event_name + '</li>');
	// $page.find('#cabecera').html(listcab.join('')).listview('refresh');
	//
	// }

	function calendar() {

		var fechaInit = new Date(timeInit);
		var fechaEnd = new Date(timeEnd);

		if (new Date().getTime() > fechaInit.getTime()) {
			var tempHour = fechaInicioAgendar.getHours();
			var tempMinute = fechaInicioAgendar.getMinutes();
			fechaInicioAgendar = new Date();
			fechaInicioAgendar.setHours(tempHour, tempMinute, 0, 0);
		}

		var fechaFinalEvento = new Date((fechaInicioAgendar.getYear() + 1900) + '/' + (fechaInicioAgendar.getMonth() + 1) + '/' + fechaInicioAgendar.getDate() + ' ' + fechaFinAgendar.getHours() + ':' + fechaFinAgendar.getMinutes());
		var diasEvento = parseInt((fechaFinAgendar.getTime() - fechaInicioAgendar.getTime()) / 86400000) + 1;

		window.calendar.addEvent({
			timeInicial : fechaInicioAgendar.getTime(),
			timeFinal : fechaFinalEvento.getTime(),
			dias : diasEvento,
			nombreEvento : event_name,
			city : eventCity,
			descripcionEvento : descripcionCalendario,
		}, function() {

			if (fechaInit.getMonth() == fechaEnd.getMonth() && fechaInit.getDate() == fechaEnd.getDate()) {

				showMessage('Agendado el ' + dateFormat(fechaInit, 'dddd dd "de" mmmm "del" yyyy') + ', desde las ' + dateFormat(fechaInit, 'HH:mm') + ' hasta las ' + dateFormat(fechaEnd, 'HH:mm'));

			} else {

				showMessage('Agendado desde el ' + dateFormat(fechaInit, 'dddd dd "de" mmmm "del" yyyy "a las" HH:mm') + ', hasta el ' + dateFormat(fechaEnd, 'dddd dd "de" mmmm "del" yyyy "a las" HH:mm'));

			}

			resetForm();
		}, function() {
			showMessage('Fallo agendar', null, 'Mensaje');
		});

	}
	;

	// function loadCabecera() {
	//
	// var listcab = [];
	// listcab.push('<li style="text-align: center;border: white;font-size:
	// 20px;">' + event_name + '</li>');
	// $page.find('#cabecera').html(listcab.join('')).listview('refresh');
	//
	// }

	function vaciar() {

		var list = [];
		list.push('<li><div align="center" style="margin-bottom: -10px;"><img style="width: 150px;" src=""></img></div></li>');
		list.push('<li style="text-align: justify;">-</li>');
		list.push('<li style="margin-bottom: -11px;"><h3 style="margin-left: -5px;margin-top: 0;margin-bottom: 0;font-size: 15px;">Tipo:</h3><p style="text-align: right; font-size: 15px;margin-top: -17px;">-</strong></p></li>');
		list.push('<li style="margin-bottom: -11px;"><h3 style="margin-left: -5px;margin-top: 0;margin-bottom: 0;">Inicia:</h3><p style="text-align: right; font-size: 13px;margin-top: -17px;">-</strong></p><p style="text-align: right; font-size: 15px;"></strong></p></li>');
		list.push('<li style="margin-bottom: -11px;"><h3 style="margin-left: -5px;margin-top: 0;margin-bottom: 0;">Termina:</h3><p style="text-align: right; font-size: 13px;margin-top: -17px;">-</strong></p><p style="text-align: right; font-size: 15px;"></strong></p></li>');
		list.push('<li style="margin-bottom: -11px;"><h3 style="margin-left: -5px;margin-top: 0;margin-bottom: 0;">Farmacias:</h3></li>');
		$page.find('#event-description-list').html(list.join('')).listview('refresh');

	}

	function loadEventInfo() {

		$.mobile.loading('show', {
			text : 'Cargando información',
			textVisible : true,
			theme : 'b'
		});

		// event_id = 1;
		// cityCode = 25;

		invokeService({
			url : svf,
			service : "obtenerEvento",
			dataType : 'jsonp',
			data : {
				codigoEvento : event_id,
				codigoAplicacion : parameters.codigoAplicacion,
				codigoCiudad : cityCode
			},
			cache : {
				key : event_id + cityCode,
				time : promotionsCacheTimeout
			},

			success : function(data) {
				try {

					var list = [];
					var items = data.farmacias;
					var daysNames = [ "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado" ];
					var monthNames = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];

					data.fechaHoraInicialActividadEvento = data.fechaHoraInicialActividadEvento.replace('-', '/').replace('-', '/');
					data.fechaHoraFinalActividadEvento = data.fechaHoraFinalActividadEvento.replace('-', '/').replace('-', '/');

					var fechaInicio = new Date(data.fechaHoraInicialActividadEvento);
					var fechaFinal = new Date(data.fechaHoraFinalActividadEvento);

					var tiempoInicio = data.horaInicial;
					var tiempoFin = data.horaFinal;

					var fechaIn = new Date(data.fechaHoraInicialActividadEvento);
					var fechaFin = new Date(data.fechaHoraFinalActividadEvento);

					timeInit = fechaIn.getTime();
					timeEnd = fechaFin.getTime();

					fechaInicioAgendar = new Date(data.fechaHoraInicialActividadEvento + ' ' + tiempoInicio);
					fechaFinAgendar = new Date(data.fechaHoraFinalActividadEvento + ' ' + tiempoFin);

					isEventFinished = (new Date().getTime() > fechaFinAgendar.getTime()) ? true : false;

					var imgSrc = (data.codigoImagenEvento == null) ? 'themes/default/images2/noImg.png' : svf + 'obtenerImagenDeCodigo/' + data.codigoImagenEvento + '.jpg';

					imgUrl = (data.codigoImagenEvento == null) ? facebook_default_image_event : svf + 'obtenerImagenDeCodigo/' + data.codigoImagenEvento + '.jpg';
					eventDescription = data.descripcionEvento + ', desde el ' + daysNames[fechaInicio.getDay()] + ' ' + fechaInicio.getDate() + ' de ' + monthNames[fechaInicio.getMonth()] + ', ' + fechaInicio.getFullYear() + ' hasta el ' + daysNames[fechaFinal.getDay()] + ' ' + fechaFinal.getDate()
							+ ' de ' + monthNames[fechaFinal.getMonth()] + ', ' + fechaFinal.getFullYear();

					list.push('<li><div align="center" style="margin-bottom: -10px;"><img style="width: 150px;" src="' + imgSrc + '"></img></div></li>');
					list.push('<li style="text-align: center; color: #333 !important; white-space: normal;">' + data.descripcionEvento + '</li>');
					list.push('<li style="margin-bottom: -11px;"><h3 style="margin-left: -5px;margin-top: 0;margin-bottom: 0;font-size: 15px;">Tipo:</h3><p style="text-align: right; font-size: 15px;margin-top: -17px;">' + data.descripcionTipoActividad + '</strong></p></li>');

					if (data.nombreCiudad != undefined) {

						list.push('<li style="margin-bottom: -11px;"><h3 style="margin-left: -5px;margin-top: 0;margin-bottom: 0;">Ciudad:</h3><p style="text-align: right; font-size: 13px;margin-top: -17px;">' + data.nombreCiudad + '</strong></p></li>');
						eventCity = (data.nombreCiudad == 'Todas') ? ' ' : data.nombreCiudad;

					}

					list.push('<li style="margin-bottom: -11px;"><h3 style="margin-left: -5px;margin-top: 0;margin-bottom: 0;">Inicia:</h3><p style="text-align: right; font-size: 13px;margin-top: -17px;">' + daysNames[fechaInicio.getDay()] + ' ' + fechaInicio.getDate() + ' de '
							+ monthNames[fechaInicio.getMonth()] + ', ' + fechaInicio.getFullYear() + '</strong></p></li>');
					list.push('<li style="margin-bottom: -11px;"><h3 style="margin-left: -5px;margin-top: 0;margin-bottom: 0;">Termina:</h3><p style="text-align: right; font-size: 13px;margin-top: -17px;">' + daysNames[fechaFinal.getDay()] + ' ' + fechaFinal.getDate() + ' de '
							+ monthNames[fechaFinal.getMonth()] + ', ' + fechaFinal.getFullYear() + '</strong></p></li>');

					if (data.horaInicial != undefined && data.horaFinal != undefined) {

						eventDescription += ', de ' + tiempoInicio.split(':')[0] + ':' + tiempoInicio.split(':')[1] + ' a ' + tiempoFin.split(':')[0] + ':' + tiempoFin.split(':')[1];
						list.push('<li style="margin-bottom: -11px;"><h3 style="margin-left: -5px;margin-top: 0;margin-bottom: 0;">Horario:</h3><p style="text-align: right; font-size: 13px;margin-top: -17px;">De ' + tiempoInicio.split(':')[0] + ':' + tiempoInicio.split(':')[1] + ' a '
								+ tiempoFin.split(':')[0] + ':' + tiempoFin.split(':')[1] + '</strong></p></li>');

					}

					list.push('<li style="margin-bottom: -11px;"><h3 style="margin-left: -5px;margin-top: 0;margin-bottom: 0;">Farmacias:</h3>');

					for ( var i = 0; i < items.length; i++) {

						if (i == 0) {
							list.push('<p style="white-space: normal; text-align: right; font-size: 15px;margin-top:' + (((items[i].nombreFarmacia + items[i].nombreCiudad).length > 20) ? '0px' : '-17px') + ';">' + items[i].nombreFarmacia + ', '
									+ ((cityCode == 0) ? (items[i].nombreCiudad.substring(0, 1) + items[i].nombreCiudad.substring(1).toLowerCase()) : '') + '</strong></p>');
							farmaciasJuntas += items[i].nombreFarmacia;
						} else {
							list.push('<p style="white-space: normal; text-align: right; font-size: 15px;">' + items[i].nombreFarmacia + ', ' + ((cityCode == 0) ? (items[i].nombreCiudad.substring(0, 1) + items[i].nombreCiudad.substring(1).toLowerCase()) : '') + '</strong></p>');
							farmaciasJuntas += ', ' + items[i].nombreFarmacia;
						}

					}

					descripcionCalendario = data.descripcionEvento + '. En ' + farmaciasJuntas;

					list.push('</li>');
					$page.find('#event-description-list').html(list.join('')).listview('refresh');

					$.mobile.loading('hide');

				} catch (err) {
					console.log(err.message);
					console.log(err.stack);
					$.mobile.loading('hide');
				}

			},
			error : function() {
				showMessage(defaultErrorMsg, null, 'Mensaje');
				$.mobile.loading('hide');
			}

		});

	}
})();