//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#events-calendar');
	var fechasConEvento = [];
	var eventos = [];
	var ciudades = [];
	var codigoCiudad = '0';
	var defDate;
	var auxDate;
	var cont = 0;
	var cargado = false;
	$page.on('pageinit', function() {
		try {
			defDate = new Date();
			cityCode = '0';

			$page.find('#btnHoy').bind('click', function(evt) {

				$page.find("#datepickerE").datepicker().datepicker('setDate', new Date());
				loadEvents(((new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '/' + ((new Date().getDate() < 10) ? '0' + new Date().getDate() : new Date().getDate()) + '/' + (new Date().getYear() + 1900));

			});

			$page.find("#datepickerE").datepicker({
				changeMonth : false,
				stepMonths : 0,
				defaultDate : defDate,
				monthNames : [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
				dayNamesMin : [ "Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab" ]
			});

			$page.find('#datepickerE').datepicker().change(function() {
				defDate = new Date(this.value);
				auxDate = this.value;
				loadEvents(this.value);
			});

			// $page.find("#datepickerE").datepicker( "option",
			// "dayNamesMin", [ "Dom", "Lun", "Mar", "Mie",
			// "Jue", "Vie", "Sab" ] );

			$page.find("#selCiudades").bind("change", function(event, ui) {

				var codigoCiudad = $page.find("#selCiudades option:selected").val();
				cityCode = codigoCiudad;
				$page.find("#datepickerE").datepicker("destroy");
				$page.find("#datepickerE").datepicker({
					changeMonth : false,
					stepMonths : 0,
					defaultDate : defDate,
					monthNames : [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
				});
				$.mobile.loading('show', {
					text : 'Cargando',
					textVisible : true,
					theme : 'b'
				});
				loadEventsPerCity(codigoCiudad);
			});

			$page.on('tap', '[data-action]:not(form)', function(e) {
				e.preventDefault();
				switch ($(this).data('action')) {
				case 'pulsado':
					event_id = $(this).data("codigo_evento");
					event_name = $(this).data("nombre_evento");
					event_description = $(this).data("descripcion_evento");
					selectedDate = $page.find('#datepickerE').val();
					$.mobile.changePage('show-event-detail.html');
					break;
				}
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}).on('pageshow', function() {
		try {

			try {
				if (navigator.connection.type == Connection.NONE) {
					ShowMessageInternetNotAvailable();
					return;
				}
			} catch (err) {

			}

			loadSelCities();
			loadEventsPerCity(codigoCiudad);

			if (!cargado) {
				$.mobile.loading('show', {
					text : 'Cargando',
					textVisible : true,
					theme : 'b'
				});
				loadEvents(((new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '/' + ((new Date().getDate() < 10) ? '0' + new Date().getDate() : new Date().getDate()) + '/' + (new Date().getYear() + 1900));
				cont++;
			}
			// loadEvents(((new Date().getMonth()+1)<10?'0'+(new
			// Date().getMonth()+1):(new Date().getMonth()+1)) +
			// '/' + ((new Date().getDate()<10)?'0'+new
			// Date().getDate():new Date().getDate()) + '/' +
			// (new Date().getYear()+1900));
			// $page.find("#datepickerE").datepicker();
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	});

	function loadSelCities() {

		try {

			invokeService({
				url : svf,
				service : "obtenerCiudadesEvento",
				dataType : 'jsonp',
				data : {
					codigoAplicacion : parameters.codigoAplicacion
				},
				cache : {
					key : parameters.codigoAplicacion,
					time : obtenerCiudadesEventoCacheTimeout
				},

				success : function(data) {
					$.mobile.loading('hide');
					if (data.length > 0) {
						$.each(data, function() {
							$page.find("#selCiudades").append('<option value="' + this["codigo"] + '">' + this["nombre"].substring(0, 1).toUpperCase() + this["nombre"].substring(1).toLowerCase() + '</option>');
						});
						$page.find("#selCiudades").val('0').attr("selected", "selected");
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

	function loadEventsPerCity(id_ciudad) {

		try {

			$.mobile.loading('show', {
				text : 'Cargando eventos',
				textVisible : true,
				theme : 'b'
			});

			var fechaDesde = new Date(new Date().getTime() - 1209600000);
			var fechaHasta = new Date(new Date().getTime() + 5184000000);

			invokeService({
				url : svf,
				service : "obtenerEventosCiudad",
				dataType : 'jsonp',
				data : {
					codigoCiudad : id_ciudad,
					fechaInicial : ((fechaDesde.getDate() < 10) ? '0' + fechaDesde.getDate() : fechaDesde.getDate()) + '-' + (((fechaDesde.getMonth() + 1) < 10) ? '0' + (fechaDesde.getMonth() + 1) : (fechaDesde.getMonth() + 1)) + '-' + (fechaDesde.getYear() + 1900),
					fechaHasta : ((fechaHasta.getDate() < 10) ? '0' + fechaHasta.getDate() : fechaHasta.getDate()) + '-' + (((fechaHasta.getMonth() + 1) < 10) ? '0' + (fechaHasta.getMonth() + 1) : (fechaHasta.getMonth() + 1)) + '-' + (fechaHasta.getYear() + 1900),
					codigoAplicacion : parameters.codigoAplicacion
				},
				cache : {
					key : id_ciudad,
					time : obtenerEventosCiudadCacheTimeout
				},

				success : function(data) {
					var SelectedDates = {};
					fechasConEvento = [];
					eventos = [];
					$page.find("#datepickerE").datepicker("destroy");

					if (data.length > 0) {

						$.each(data, function() {

							var fecha = this["fechaHoraInicialActividadEvento"].split(' ');
							var fechaSplit = fecha[0].split('-');
							var fechaInicio = new Date(fechaSplit[1] + '/' + fechaSplit[2] + '/' + fechaSplit[0]);
							fecha = this["fechaHoraFinalActividadEvento"].split(' ');
							fechaSplit = fecha[0].split('-');

							var fechaFin = new Date(fechaSplit[1] + '/' + fechaSplit[2] + '/' + fechaSplit[0]);
							var aux = fechaInicio.getTime();
							var auxf = fechaFin.getTime();
							var dia = 1000 * 60 * 60 * 24;

							do {

								var fec = new Date(aux);
								fechasConEvento.push(((((fec.getMonth() + 1) + '').length == 1) ? '0' + (fec.getMonth() + 1) : fec.getMonth() + 1) + "/" + (((fec.getDate() + '').length == 1) ? '0' + fec.getDate() : fec.getDate()) + "/" + fec.getFullYear());
								eventos.push('<li><a style="font-size: 14px;" data-action="pulsado" data-nombre_evento="' + this['tituloActividadEvento'] + '" data-descripcion_evento="' + this['descripcionEvento'] + '" data-codigo_evento="' + this['codigoActividaEvento']
										+ '" + data-codigo_imagen="' + this['codigoImagenEvento'] + '">' + this['tituloActividadEvento'] + '</a></li>');
								SelectedDates[fec] = fec;
								aux = aux + dia;

							} while (aux <= auxf)

						});

					}
					$.mobile.loading('hide');

					if (defDate == undefined) {
						defDate = new Date();
					}
					// defDateStr = (defDate.getMonth() + 1 < 10 ? '0' +
					// (defDate.getMonth() + 1) : (defDate.getMonth() + 1)) +
					// '/' + (defDate.getDate() < 10 ? '0' + defDate.getDate() :
					// defDate.getDate()) + '/' + defDate.getFullYear();

					$page.find("#datepickerE").datepicker({
						defaultDate : defDate,
						monthNames : [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
						beforeShowDay : function(date) {
							try {
								var Highlight = SelectedDates[date];
								if (Highlight) {
									return [ true, "Highlighted", '' ];
								} else {
									return [ true, '', '' ];
								}
							} catch (e) {
								// TODO: handle exception
							}
						}
					});
					$page.find("#datepickerE").datepicker("option", "dayNamesMin", [ "Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab" ]);
					$.mobile.loading('hide');
					cargado = true;
					loadEvents(((new Date().getMonth() + 1) < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '/' + ((new Date().getDate() < 10) ? '0' + new Date().getDate() : new Date().getDate()) + '/' + (new Date().getFullYear()));

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

	function loadEvents(fecha) {
		try {
			var d = new Date(fecha);
			var weekday = [ "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado" ];
			var monthNames = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ];
			var n = weekday[d.getDay()];

			var list = [];
			var bandera = false;
			list.push('<li data-role="list-divider" style="font-size: 14px; text-align: center; height: 15px;padding-top: 5px;">Eventos, ' + weekday[d.getDay()] + ' ' + d.getDate() + ' de ' + monthNames[d.getMonth()] + '</li>');
			for ( var i = 0; i < fechasConEvento.length; i++) {
				if (fechasConEvento[i] == fecha) {
					bandera = true;
					list.push(eventos[i]);
				}
			}
			if (!bandera) {
				list.push('<li style="color: #333 !important;">No hay eventos en esta fecha</li>');
			}

			$page.find('#eventos').html(list.join('')).listview('refresh');
		} catch (err) {
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}
	}
})();
