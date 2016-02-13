//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#reminder-form');
	var $form = $page;
	var validator;
	var fechaSeleccionada;
	var remTotalTakes;

	$page.on('pagehide', function() {
		data.reminderData.name = $('#name').val();
		data.reminderData.medicine = $('#medicine').val();

	}).on('pageinit', function() {
		try {

			// $form = $page.find('#reminder');
			$.validator.addMethod("end", function(value, element) {
				return this.optional(element) || new Date(value) >= new Date($page.find('[name="begin"]').val());
			}, "La fecha de fin no puede ser menor a la de inicio.");
			validator = $form.validate({
				ignore : '',
				rules : {
					end : {
						required : function() {
							return $page.find('[name="repeat_type"]').val() != 'none';
						}
					}
				}
			});
			$('form[data-action="calc-end"], form[data-action="set-buy-reminder"]').validate();
			$form.on('submit', function(e) {
				// $form =
				// $page.find('#reminder');
				e.preventDefault();
				switch ($(this).data('action')) {
				case 'post-reminder':
					if ($(this).valid()) {
						fechaSeleccionada = new Date($page.find('[name="begin"]').val());
						if (reminder_id == null && fechaSeleccionada < new Date()) {
							showMessage('Fecha de inicio debe ser mayor a la fecha actual', null, null);
						} else {
							postReminder($(this).serializeObject());
						}

					} else {
						var destination = $('.error:visible:first').offset().top;
						$("html:not(:animated),body:not(:animated)").animate({
							scrollTop : destination - 2
						}, 500);
					}
					break;
				}
			});

			$.subscribe('çalc-end', function(e, form) {
				calcEnd(form);
				$(':mobile-pagecontainer').pagecontainer('change', 'reminder-form.html');
			});
			$.subscribe('select-repeat', function(e, form) {
				selectRepeat(form);
			});
			$.subscribe('set-buy-reminder', function(e, buyReminder) {
				setBuyReminder(buyReminder);
				$(':mobile-pagecontainer').pagecontainer('change', 'reminder-form.html');
			});
			$.subscribe('set-doctor', function(e, doctor) {
				setDoctor(doctor);
				$(':mobile-pagecontainer').pagecontainer('change', 'reminder-form.html');
			});
			$.subscribe('select-end-date-type', function(e, value) {
				switch (value) {
				case 'calc':
					$(':mobile-pagecontainer').pagecontainer('change', $('#calc-end'), {
						changeHash : false
					});
					break;
				case 'calendar':
					$(':mobile-pagecontainer').pagecontainer('change', 'reminder-form.html');
					showEndCalendar($page.find('[data-action="select-end"]')[0]);
					break;
				}
			});

			$page.find('[data-action]:not(form)').on('tap', function(e) {
				e.preventDefault();
				var _self = this;
				switch ($(this).data('action')) {
				case 'delete-reminder':
					showConfirm('Desea eliminar este recordatorio? Esta acción no puede deshacerse.', function(buttonIndex) {
						if (buttonIndex == 2) {
							deleteReminder(reminder_id);
						}
					}, 'Confirmación');
					break;
				case 'select-product':
					$(':mobile-pagecontainer').pagecontainer('change', 'select-product.html', {
						changeHash : false
					});
					break;
				case 'select-begin':
					var date = $page.find('[name="begin"]').val() != '' ? $page.find('[name="begin"]').val() : new Date();
					if (typeof Cordova !== "undefined" && device.platform == 'Android') {
						window.plugins.datePicker.show({
							date : new Date(date),
							mode : 'date',
							allowOldDates : true
						}, function(selectedDate) {

							var time = new Date(selectedDate);
							time.setHours(new Date(date).getHours());
							time.setMinutes(new Date(date).getMinutes());

							window.plugins.datePicker.show({
								date : time,
								mode : 'time',
								allowOldDates : true
							}, function(selectedTime) {

								var selectedTime = new Date(selectedTime);
								var selectedValue = new Date(selectedDate);
								var currDate = new Date();
								selectedValue.setHours(selectedTime.getHours());
								selectedValue.setMinutes(selectedTime.getMinutes());
								selectedValue.setSeconds(00);
								fechaSeleccionada = selectedValue;

								if (selectedValue.getTime() >= currDate.getTime() || reminder_id == null) {
									$form.find('[name="begin"]').val(dateFormat(selectedValue, 'mm/dd/yyyy H:MM'));
									data.reminderRepeat.begin = dateFormat(selectedValue, 'mm/dd/yyyy H:MM');
									(beginSelect.bind(_self, selectedValue))();
								} else {
									showMessage('Fecha de inicio debe ser mayor a la fecha actual', null, null);
								}
							});
						});
					} else {
						if ($page.find('#name').is(":focus")) {
							$page.find('#name').blur();
						}
						if ($page.find('#medicine').is(":focus")) {
							$page.find('#medicine').blur();
						}

						$page.find('[name="begin"]').scroller('show');

					}
					break;
				case 'select-end':
					if ($page.find('[name="repeat_type"]').val() != 'none') {
						if ($page.find('[name="begin"]').val() != '') {
							$(':mobile-pagecontainer').pagecontainer('change', $('#end-date-type'), {
								changeHash : false
							});
						} else {
							showMessage('Debe seleccionar una fecha de inicio para hacer el cálculo.');
						}
					} else {
						showMessage('En caso de no tener marcada ninguna repetición, no se puede seleccionar este campo.');
					}
					break;
				case 'show-calc-end':
					var validCalc = false;
					if ($page.find('[name="repeat_type"]').val() != 'none') {
						if ($page.find('[name="begin"]').val() != '') {
							$(':mobile-pagecontainer').pagecontainer('change', $('#calc-end'), {
								changeHash : false
							});
						} else {
							showMessage('Debe seleccionar una fecha de inicio para hacer el cálculo.');
						}
					} else {
						showMessage('Esta opción no esta disponible cuando la Repetición está definida a Ninguna.');
					}
					break;
				case 'show-buy-reminder':
					$(':mobile-pagecontainer').pagecontainer('change', $('#buy-reminder'), {
						changeHash : false
					});
					break;
				case 'show-doctor':
					$(':mobile-pagecontainer').pagecontainer('change', $('#doctor'), {
						changeHash : false
					});
					break;
				}
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}

	}).on('pageshow', function(e, ui) {
		try {
			$('#calc-end').find('[type="tel"]').val('');
			// Limpia la validación al volver a entrar a la
			// página
			if (data.reminderBegin != undefined) {
				$('[name="begin"]').val(data.reminderBegin)
				beginSelect(data.reminderBegin);
			}
			validator.resetForm();
			$page.find('[name="begin"]').scroller({
				theme : 'jqm',
				display : 'modal',
				mode : 'scroller',
				dayNames : [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ],
				dayNamesShort : [ 'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab' ],
				monthNames : [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
				monthNamesShort : [ 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic' ],
				yearText : 'Año',
				monthText : 'Mes',
				dayText : 'Día',
				hourText : 'Hora',
				minuteText : 'Minutos',
				cancelText : 'Cancelar',
				setText : 'Aceptar',
				dateFormat : 'mm/dd/yy',
				dateOrder : 'ddmmyy',
				timeWheels : 'HHii',
				timeFormat : 'HH:ii',
				preset : 'datetime',
				minDate : new Date(),
				onSelect : beginSelect
			});
			$page.find('[name="end"]').scroller($.extend({}, scrollerOptions, {
				theme : 'jqm',
				display : 'modal',
				mode : 'scroller',
				dayNames : [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ],
				dayNamesShort : [ 'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab' ],
				monthNames : [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
				monthNamesShort : [ 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic' ],
				yearText : 'Año',
				monthText : 'Mes',
				dayText : 'Día',
				hourText : 'Hora',
				minuteText : 'Minutos',
				cancelText : 'Cancelar',
				setText : 'Aceptar',
				dateFormat : 'mm/dd/yy',
				dateOrder : 'ddmmyy',
				timeWheels : 'HHii',
				timeFormat : 'HH:ii',
				preset : 'date',
				minDate : new Date(),
				onSelect : endSelect
			}));
			if ($.inArray($(ui.prevPage).attr('id'), [ 'reminder-form-interval', 'reminder-form-hours', 'search-contact', 'select-product', 'doctor', 'repeat', 'calc-end', 'buy-reminder', 'end-date-type' ]) == -1) {
				// Limpia el formulario
				bindReminder({
					id : "",
					name : "",
					medicine : "",
					begin : "",
					repeat_type : "none",
					interval : "",
					end : "",
					hours : "",
					days : "",
					doctor_name : "",
					doctor_phone : "",
					buy_available : "",
					buy_reminder_days : ""
				});
				if (reminder_id != null) {
					$page.find('.footer-actions').addClass('ui-grid-a').find('.btn-save').addClass('ui-block-a').end().find('.btn-delete').show();
					getReminder(reminder_id);
				} else {
					$page.find('.footer-actions').removeClass('ui-grid-a').find('.btn-save').removeClass('ui-block-a').end().find('.btn-delete').hide();
				}
			}

			if (data.reminderRepeat != undefined) {
				$page.find('[name="repeat_type"]').val(data.reminderRepeat.repeat_type);
				$page.find('[name="interval"]').val(data.reminderRepeat.interval);
				$page.find('[name="hours"]').val(data.reminderRepeat.hours);
				$page.find('[name="days"]').val(data.reminderRepeat.days);
				$page.find('#repeat-label').text(data.reminderRepeat.repeatLabel);

			}

			$('#name').val(data.reminderData.name);
			$('#medicine').val(data.reminderData.medicine);

		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	});
	function showEndCalendar(_self) {
		var date = $page.find('[name="end"]').val() != '' ? $page.find('[name="end"]').val() : new Date();
		// Muestra un datapicker nativo para la versión android y el scroller
		// para Iphone
		if (typeof Cordova !== "undefined" && device.platform == 'Android') {
			window.plugins.datePicker.show({
				date : new Date(date),
				mode : 'date',
				allowOldDates : true
			}, function(selectedDate) {
				var selectedValue = new Date(selectedDate);
				selectedValue.setHours(23);
				selectedValue.setMinutes(59);
				$form.find('[name="end"]').val(dateFormat(selectedValue, 'mm/dd/yyyy H:MM'));
				(endSelect.bind(_self, selectedValue))();
			});
		} else {
			$page.find('[name="end"]').scroller('show');
		}
	}
	function calcEnd(calc) {
		try {
			var date = calcEndDate($.extend($(calc).serializeObject(), $form.serializeObject()));

			$form.find('[name="end"]').val(date).parents('[data-role="fieldcontain"]').find('.label').text(dateFormat(date, 'dddd, mmmm d, yyyy, H:MM'));
			$form.find('[name="end"]').valid();
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function selectRepeat(form) {
		try {
			switch ($(form).find('[name="repeat"]:checked').val()) {
			case 'none':
				var value = $page.find('[name="begin"]').val();
				$form.find('#repeat-label').text('Ninguna');
				$page.find('[name="end"]').val(value).parents('[data-role="fieldcontain"]').find('.label').text(dateFormat(value, 'dddd, mmmm d, yyyy, H:MM'));
				$(':mobile-pagecontainer').pagecontainer('change', 'reminder-form.html', {
					changeHash : false
				});
				break;
			case 'interval':
				$(':mobile-pagecontainer').pagecontainer('change', 'reminder-form-interval.html', {
					changeHash : false
				});
				changeEnd();
				break;
			case 'hours':
				debugger;
				$(':mobile-pagecontainer').pagecontainer('change', 'reminder-form-hours.html', {
					changeHash : false
				});
				changeEnd();
				break;
			}
			$form.find('[name="repeat_type"]').val($(form).find('[name="repeat"]:checked').val());
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function setDoctor(reminder) {
		try {
			var redirect = redirect || true;
			$form.find('[name="doctor_name"]').val(reminder.doctor_name);
			$form.find('[name="doctor_phone"]').val(reminder.doctor_phone);
			$page.find('#doctor-label').text(reminder.doctor_name);
			if (reminder.doctor_phone && $.trim(reminder.doctor_phone) != '') {
				$page.find('#doctor-call').show().attr('href', 'tel:' + reminder.doctor_phone);
			}
			$('#reminder-list').listview('refresh');
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function setBuyReminder(reminder) {
		try {
			var redirect = redirect || true;
			$form.find('[name="buy_available"]').val(reminder.buy_available);
			$form.find('[name="buy_reminder_days"]').val(reminder.buy_reminder_days);
			if ($.trim(reminder.buy_available) != '' && $.trim(reminder.buy_reminder_days) != '') {
				$page.find('#buy-reminder-label').text(reminder.buy_available + ' tomas disponibles, recordarme comprar ' + reminder.buy_reminder_days + ' días antes.');
			} else {
				$page.find('#buy-reminder-label').text('');
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function beginSelect(value, i) {
		try {
			data.reminderBegin = value;
			$form.find('[name="begin"]').parents('[data-role="fieldcontain"]').find('.label').text(dateFormat(value, 'dddd, mmmm d, yyyy, H:MM'));
			// /$(this).parents('[data-role="fieldcontain"]').find('.label').text(dateFormat(value,
			// 'dddd, mmmm d, yyyy, H:MM'));
			$form.find('[name="begin"]').valid();
			$page.find('[name="end"]').scroller('option', 'minDate', new Date($page.find('[name="begin"]').val()));
			if ($page.find('[name="repeat_type"]').val() == 'none') {
				$page.find('[name="end"]').val(value).parents('[data-role="fieldcontain"]').find('.label').text(dateFormat(value, 'dddd, mmmm d, yyyy, H:MM'));
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function endSelect(value, i) {
		try {
			$(this).val(value).parents('[data-role="fieldcontain"]').find('.label').text(dateFormat(value, 'dddd, mmmm d, yyyy, H:MM'));
			$form.find('[name="end"]').valid();
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function changeEnd() {
		try {
			if ($page.find('[name="begin"]').val() == $page.find('[name="end"]').val()) {
				$page.find('[name="end"]').val('').parents('[data-role="fieldcontain"]').find('.label').text('');
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function postReminder(reminder) {
		try {
			if ($.trim(reminder.id) == '')
				reminder.id = null;
			if (reminder.end.indexOf(':') == -1) {
				reminder.end = reminder.end + ' 11:59 PM';
			}
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
			db.transaction(function(tx) {
				if (reminder.id != null) {

					tx.executeSql('SELECT * FROM reminders WHERE id = ?', [ reminder_id ], function(tx, result) {
						if (result.rows.length > 0) {
							var reminder = result.rows.item(0);
							if (typeof Cordova !== "undefined") {
								cancelAlarms(reminder);
							}
						}
					}, function(tx, error) {
						console.log(error);
					});

					// tx.executeSql("DELETE FROM
					// medicine_intake WHERE
					// datetime(intake_time, 'unixepoch') >
					// datetime('now') AND reminder_id = ?",
					// [reminder.id], function(tx, results){
					tx.executeSql("DELETE FROM medicine_intake WHERE intake = '0' AND reminder_id = ?", [ reminder.id ], function(tx, results) {

					}, function(tx, error) {
						console.log(error);
					});
				}

				var beginDate = Math.round((new Date(reminder.begin).getTime()) / 1000);
				var endDate = Math.round((new Date(reminder.end).getTime()) / 1000);

				// if(beginDate < new Date().getTime()){
				//	    			
				// var horas=reminder.hours.split(',');
				// aux=beginDate;
				//	    			
				// for(var i=0;i<horas.length;i++){
				//	    				
				//	    				
				//	    				
				// }
				//	    			
				//	    			
				// }

				var query = "INSERT OR REPLACE INTO reminders (id, name, medicine, begin, end, repeat_type, interval, hours, days, doctor_name, doctor_phone, buy_available, buy_reminder_days) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";
				tx.executeSql(query, [ reminder.id, reminder.name, reminder.medicine, beginDate, endDate, reminder.repeatType, reminder.interval, reminder.hours, reminder.days, reminder.doctor_name, reminder.doctor_phone, reminder.buy_available, reminder.buy_reminder_days ], function(tx, results) {
					if (typeof Cordova !== "undefined") {
						setAlarms($.extend(reminder, {
							id : results.insertId
						}));
					}
					$(':mobile-pagecontainer').pagecontainer('change', "reminders.html");
				}, function(tx, error) {
					console.log(error);
				});
			}, function(error) {
				console.log(error);
			}, function() {
				$.mobile.loading('hide');
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function getReminder(reminder_id) {
		try {
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
			$page.find('input').attr('disabled', 'disabled');
			db.transaction(function(tx) {
				tx.executeSql("SELECT id, name, medicine, begin as begin_date, end as end_date, repeat_type, interval, hours, days, doctor_name, doctor_phone, buy_available, buy_reminder_days FROM reminders WHERE id = ?", [ reminder_id ], function(tx, result) {
					if (result.rows.length > 0) {
						var reminder = result.rows.item(0);
						reminder.begin = dateFormat(new Date(reminder.begin_date * 1000), "m/d/yyyy, H:MM");
						reminder.end = dateFormat(new Date(reminder.end_date * 1000), "m/d/yyyy, H:MM");
						bindReminder(reminder);
					} else {
						$(':mobile-pagecontainer').pagecontainer('change', 'reminders.html');
						showMessage('No existe el recordatorio.');
					}
				}, function(tx, error) {
					console.log(error);
				});
			}, function(error) {
				console.log(error);
			}, function() {
				$page.find('input').removeAttr('disabled');
				$.mobile.loading('hide');
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function deleteReminder(reminder_id) {
		try {
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
			db.transaction(function(tx) {
				tx.executeSql('SELECT * FROM reminders WHERE id = ?', [ reminder_id ], function(tx, result) {

					if (result.rows.length > 0) {
						var reminder = result.rows.item(0);
						if (typeof Cordova !== "undefined") {
							cancelAlarms(reminder);
						}
						tx.executeSql('DELETE FROM reminders WHERE id = ?', [ reminder_id ], function(tx, results) {
							$(':mobile-pagecontainer').pagecontainer('change', 'reminders.html');
						}, function(tx, error) {
							console.log(error);
						});
						tx.executeSql("DELETE FROM medicine_intake WHERE reminder_id = '" + reminder_id + "'", [], function(tx, results) {
						}, function(tx, error) {
							console.log(error);
						});
					}
				}, function(tx, error) {
					console.log(error);
				}, function() {
					$.mobile.loading('hide');
				});
			}, function(error) {
				console.log(error);
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function bindReminder(reminder) {
		try {
			var days = reminder.days.split(',');
			if ($.trim(reminder.end) != '' && reminder.end.indexOf(':') == -1) {
				reminder.end = reminder.end + ' 11:59 PM';
			}
			$form.find('[name="id"]').val(reminder.id);
			$form.find('[name="name"]').val(reminder.name);
			$form.find('[name="medicine"]').val(reminder.medicine);
			$form.find('[name="begin"]').val(reminder.begin).parents('[data-role="fieldcontain"]').find('.label').text(reminder.begin != '' ? dateFormat(reminder.begin, 'dddd, mmmm d, yyyy, H:MM') : '');
			$form.find('[name="end"]').val(reminder.end).parents('[data-role="fieldcontain"]').find('.label').text(reminder.end != '' ? dateFormat(reminder.end, 'dddd, mmmm d, yyyy, H:MM') : '');
			$form.find('[name="repeat_type"]').val(reminder.repeat_type);
			$form.find('[name="interval"]').val(reminder.interval);
			$form.find('[name="hours"]').val(reminder.hours);
			$form.find('[name="days"]').val(reminder.days);

			if ($('#repeat').hasClass('ui-page')) {
				$('#repeat [name="repeat"]').attr('checked', false).checkboxradio("refresh");
				$('#repeat [name="repeat"][value="' + reminder.repeat_type + '"]').attr('checked', true).checkboxradio("refresh");
			} else {
				$('#repeat [name="repeat"]').attr('checked', false);
				$('#repeat [name="repeat"][value="' + reminder.repeat_type + '"]').attr('checked', true);
			}

			$('#doctor [name="doctor_name"]').val(reminder.doctor_name);
			$('#doctor [name="doctor_phone"]').val(reminder.doctor_phone);
			$('#buy-reminder [name="buy_available"]').val(reminder.buy_available);
			$('#buy-reminder [name="buy_reminder_days"]').val(reminder.buy_reminder_days);
			switch (reminder.repeat_type) {
			case 'interval':
				$form.find('#repeat-label').text('Cada ' + reminder.interval + ' ' + (reminder.interval === 1 ? 'hora' : 'horas'));
				break;
			case 'hours':
				$form.find('#repeat-label').text((days.length == 7 ? 'Todos los días a las ' : 'Algunos días a las ') + reminder.hours);
				break;
			default:
				$form.find('#repeat-label').text('Ninguna');
				break;
			}
			setDoctor(reminder);
			setBuyReminder(reminder);
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function setAlarms(reminder) {
		try {
			var title = "Fybeca";
			var typeRepeat = "none";
			// Verificar el tipo de alarma.
			// Tipo 1. Recordatorio único.
			if (reminder.repeat_type == "none") {

				var reminderEnd = new Date(reminder.end);
				window.localNotification.addNotification({
					dateIni : new Date(reminder.begin),
					dateEnd : reminderEnd,
					message : reminder.name,
					title : title,
					ticker : reminder.name,
					repeat : typeRepeat, // TODO: unificar con
					// intervalType en android
					intervalType : typeRepeat,
					id : reminder.id,
					action : 'Ver',
					hasAction : true,
					sound : 'reminder',
					badge : 0,
					background : 'showReminder',
					foreground : 'showReminder',
					success : function(data) {
						showMessage('Recordatorio creado exitosamente', null, null);
					},
					error : function(data) {
						showMessage('Recordatorio NO calendarizado. Revise los datos ingresados e intente nuevamente', null, null);
					}
				});
			}

			// Tipo 2. Recordatorio por intervalos
			else if (reminder.repeat_type == "interval") {

				var currentDate = new Date();
				var dateNextInterval = new Date(reminder.begin);
				var dateBegin = new Date(reminder.begin).valueOf();
				if (new Date(reminder.begin) < currentDate) {
					while (dateNextInterval < currentDate) {
						var currentDateTimeSt = dateBegin;
						var intervalMillSecs = reminder.interval * 60 * 60 * 1000;
						var dateNextIntervalVal = currentDateTimeSt + intervalMillSecs;
						dateBegin = new Date(dateNextIntervalVal).valueOf();
						dateNextInterval = new Date(dateNextIntervalVal);
					}

					reminder.begin = dateNextInterval;
				}

				var reminderEnd = new Date(reminder.end);

				if (new Date(reminder.begin) <= reminderEnd || $.trim(reminder.end) == '') {
					typeRepeat = "hour";
					window.localNotification.addNotificationByInterval({
						dateIni : new Date(reminder.begin),
						dateEnd : reminderEnd,
						message : reminder.name,
						title : title,
						ticker : reminder.name,
						interval : reminder.interval,
						intervalType : typeRepeat,
						id : reminder.id,
						action : 'Ver',
						hasAction : true,
						sound : 'reminder',
						badge : 0,
						background : 'showReminder',
						foreground : 'showReminder',
						success : function(data) {
							showMessage('Recordatorio creado exitosamente', null, null);
						},
						error : function(data) {
							var msg;

							if (data != null && data.length > 0) {
								msg = 'Recordatorio NO creado. ' + data;
							} else {
								msg = 'Recordatorio NO creado. Revise los datos ingresados e intente nuevamente';
							}

							showMessage(msg, null, null);

						}
					});
				} else {
					showMessage('Recordatorio NO creado. Revise los datos ingresados e intente nuevamente', null, 'Mensaje');
				}
			}
			// Tipo 3. Horas Fijas por semana.
			else if (reminder.repeat_type == "hours") {

				var daysOfWeek = (reminder.days).split(",");

				var hoursPerDay = [];
				var hours = reminder.hours.split(',');
				$.each(hours, function() {
					var a = this.split(':');
					var b = a[1].split(' ');
					var c = a[0];
					if (b[1] == 'PM' && c != '12')
						c = Number(a[0]) + 12;
					hoursPerDay.push(c + ':' + b[0]);
				});

				// Días saltados
				if (daysOfWeek.length < 7) {

					typeRepeat = "weekly";
					// Obtener el día actual.
					var currentDate = new Date();
					// Obtener el día de la semana de la fecha de inicio
					var dayOfWeekRemind = new Date(reminder.begin).getDay();

					window.localNotification.initiateNotifications();

					var days = 0;
					var date = new Date();
					var countRem = 0;
					// Recorrer los días
					for (i = 0; i < daysOfWeek.length; i++) {
						// Recorrer las horas
						for (j = 0; j < hoursPerDay.length; j++) {

							var dateRemind = GetNextReminderDate(new Date(reminder.begin), parseInt(daysOfWeek[i], 10), hoursPerDay[j]);
							var hourMinute = hoursPerDay[j].split(":");

							// Generar el id único del recordatorio. Id
							// Recordatorio + Dia de la Semana + Hora
							// Recordatorio + Minuto Recordatorio
							var idRem = reminder.id.toString() + '-' + parseInt(daysOfWeek[i], 10).toString() + hourMinute[0] + hourMinute[1];

							var reminderEnd = new Date(reminder.end);

							// Solo si la fecha del recordatorio es menor a la
							// fecha de fin se setea el recordatorio.
							if ($.trim(reminder.end) == '' || new Date(dateRemind).getTime() <= new Date(reminderEnd).getTime()) {
								countRem = countRem + 1;
								window.localNotification.addNotification({
									dateIni : dateRemind,
									dateEnd : reminderEnd,
									message : reminder.name,
									title : title,
									ticker : reminder.name,
									interval : reminder.interval,
									intervalType : typeRepeat,
									id : idRem,
									action : 'Ver',
									hasAction : true,
									sound : 'reminder',
									badge : 0,
									background : 'showReminder',
									foreground : 'showReminder',
									success : function() {

									},
									error : function() {

									}
								});
							}
						}
					}

					window.localNotification.verifyExitsGroupNotifications({
						id : reminder.id.toString(),
						count : countRem,
						success : function() {

						},
						error : function() {

						}
					});
				}
				// Semana completa
				else {
					typeRepeat = "daily";
					// Obtener el día actual.
					var currentDate = new Date();
					var contOcurrencias = 0;

					window.localNotification.initiateNotifications();

					// Recorremos las horas enviadas
					for (i = 0; i < ((hoursPerDay.length > remTotalTakes) ? remTotalTakes : hoursPerDay.length); i++) {

						var hourMinute = hoursPerDay[i].split(":");

						// Obtener la fecha y hora de inicio en base al día
						// señalado y las horas indicadas
						var dateIniRem = new Date(new Date(reminder.begin).getFullYear(), new Date(reminder.begin).getMonth(), new Date(reminder.begin).getDate(), parseInt(hourMinute[0], 10), parseInt(hourMinute[1], 10));

						var currentDate = new Date();
						var dateNextInterval = dateIniRem;
						var dateBegin = dateIniRem.valueOf();

						if (dateIniRem < currentDate) {
							while (dateNextInterval < currentDate) {
								var currentDateTimeSt = dateBegin;
								// Convertir el intervalo en milisegundos
								var intervalMillSecs = 24 * 60 * 60 * 1000;

								var dateNextIntervalVal = currentDateTimeSt + intervalMillSecs;
								dateBegin = new Date(dateNextIntervalVal).valueOf();
								dateNextInterval = new Date(dateNextIntervalVal);
							}

							dateIniRem = dateNextInterval;
						}

						// Generar el id único del recordatorio. Id Recordatorio
						// + Hora Recordatorio + Minuto Recordatorio
						var idRem = reminder.id.toString() + '-' + hourMinute[0] + hourMinute[1];

						var reminderEnd = new Date(reminder.end);

						dateIniRem = new Date((dateIniRem <= new Date(reminder.begin).getTime()) ? dateIniRem.getTime() + (1000 * 60 * 60 * 24) : dateIniRem.getTime());

						if (dateIniRem <= reminderEnd || $.trim(reminder.end) == '') {
							contOcurrencias++;
							window.localNotification.addNotification({
								dateIni : dateIniRem,
								dateEnd : reminderEnd,
								message : reminder.name,
								title : title,
								ticker : reminder.name,
								interval : reminder.interval,
								intervalType : typeRepeat,
								id : idRem,
								action : 'Ver',
								hasAction : true,
								sound : 'reminder',
								badge : 0,
								background : 'showReminder',
								foreground : 'showReminder',
								success : function() {

								},
								error : function() {

								}
							});
						}
					}

					window.localNotification.verifyExitsGroupNotifications({
						id : reminder.id.toString(),
						count : contOcurrencias,
						success : null,
						error : null
					});

				}
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function cancelAlarms(reminder) {
		try {
			// Tipo 1. Recordatorio unico.
			if (reminder.repeat_type == "none") {
				window.localNotification.cancel(reminder.id);
			}
			// Tipo 2. Recordatorio por intervalos
			else if (reminder.repeat_type == "interval") {
				window.localNotification.cancel(reminder.id);
			}
			// Tipo 3. Horas Fijas por semana.
			else if (reminder.repeat_type == "hours") {

				var daysOfWeek = (reminder.days).split(",");
				var hoursPerDay = [];
				var hours = reminder.hours.split(',');
				$.each(hours, function() {
					var a = this.split(':');
					var b = a[1].split(' ');
					var c = a[0];
					if (b[1] == 'PM')
						c = Number(a[0]) + 12;
					hoursPerDay.push(c + ':' + b[0]);
				});

				// Días saltados
				if (daysOfWeek.length < 7) {

					// Obtener el día actual.
					var currentDate = new Date();
					// Obtener el día de la semana de la fecha de inicio
					var dayOfWeekRemind = new Date(reminder.begin * 1000).getDay();

					var days = 0;
					var date = new Date();

					// Recorrer los días
					for (i = 0; i < daysOfWeek.length; i++) {
						// Recorrer las horas
						for (j = 0; j < hoursPerDay.length; j++) {

							var dateRemind = GetNextReminderDate(new Date(reminder.begin * 1000), parseInt(daysOfWeek[i], 10), hoursPerDay[j]);

							var hourMinute = hoursPerDay[j].split(":");
							// Generar el id único del recordatorio. Id
							// Recordatorio + Dia de la Semana + Hora
							// Recordatorio + Minuto Recordatorio
							var idRem = reminder.id.toString() + '-' + parseInt(daysOfWeek[i], 10).toString() + hourMinute[0] + hourMinute[1];

							if ($.trim(reminder.end) == '' || dateRemind <= new Date(reminder.end * 1000)) {

								window.localNotification.cancel(idRem);
							}
						}

					}

				}

				// Semana completa
				else {

					for (i = 0; i < hoursPerDay.length; i++) {
						var hourMinute = hoursPerDay[i].split(":");
						// Generar el id �nico del recordatorio. Id Recordatorio
						// + Hora Recordatorio + Minuto Recordatorio
						var idRem = reminder.id.toString() + '-' + hourMinute[0] + hourMinute[1];
						window.localNotification.cancel(idRem);
					}

				}
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}

	// Método que en base a la fecha de inicio calcula el siguiente recordatorio
	// con el día de la semana y la hora dadas
	// Begin. En formato Date
	// dayOfWeek. Entero. 0 al 6
	// hora. String. Formato hh:mm
	// Retorna un date con la fecha y hora del siguiente recordatorio
	function GetNextReminderDate(begin, dayOfWeek, hour) {
		try {
			// Obtener el día de la semana de la fecha de inicio
			var dayOfWeekBegin = begin.getDay();
			// Sumarle un día al día de la semana recibido, debido a que viene
			// contado desde 0
			var dayOfWeekRemind = dayOfWeek;
			// Obtener la hora del recordatorio con la fecha de inicio,
			// solamente como referencia para realizar los cálculos
			var dateRemind = SetTimeToDate(begin, hour);

			var days = 0;
			var currentDate = new Date();
			if (dayOfWeekBegin > dayOfWeekRemind) {
				days = 7 - dayOfWeekBegin + dayOfWeekRemind;
				dateRemind = AddDaysToDate(dateRemind, days);
				while (dateRemind < currentDate) {
					dateRemind = AddDaysToDate(dateRemind, 7);
				}
			} else if (dayOfWeekBegin < dayOfWeekRemind) {
				days = dayOfWeekRemind - dayOfWeekBegin;
				dateRemind = AddDaysToDate(dateRemind, days);
				while (dateRemind < currentDate) {
					dateRemind = AddDaysToDate(dateRemind, 7);
				}
			} else {
				if (begin > dateRemind) {
					days = 7;
					dateRemind = AddDaysToDate(dateRemind, days);
					while (dateRemind < currentDate) {
						dateRemind = AddDaysToDate(dateRemind, 7);
					}
				}
			}

			return dateRemind;
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	// Función que devuelve una variable tipo Date con los días sumados a la
	// fecha y hora enviada.
	function AddDaysToDate(date, days) {
		try {
			var dateTimeStamp = date.valueOf();
			var dateResult = dateTimeStamp + (days * 24 * 60 * 60 * 1000);
			return new Date(dateResult);
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	// Función que permite setear una hora y minuto a una fecha dada

	function SetTimeToDate(date, time) {
		try {
			var hourMin = time.split(":");
			return new Date(date.getFullYear(), date.getMonth(), date.getDate(), parseInt(hourMin[0], 10), parseInt(hourMin[1], 10));
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function calcEndDate(reminder) {
		try {
			var dateEnd = new Date();

			var date_sort_asc = function(date1, date2) {

				if (date1 > date2)
					return 1;
				if (date1 < date2)
					return -1;
				return 0;
			};

			var date_sort_desc = function(date1, date2) {

				if (date1 > date2)
					return -1;
				if (date1 < date2)
					return 1;
				return 0;
			};

			var totalTakes = parseInt(reminder.total_takes);
			remTotalTakes = totalTakes;
			var intervalMils = parseFloat(reminder.interval.toString()) * 60 * 60 * 1000;
			var auxTotalTakes = 0;
			var needChange = false;

			if (reminder.repeat_type == "none") {
				dateEnd = new Date(reminder.begin);
			} else if (reminder.repeat_type == "interval") {
				var dateBeginVal;
				var currentDate = new Date();
				var dateNextInterval = new Date(reminder.begin);
				var dateBegin = new Date(reminder.begin).valueOf();
				if (new Date(reminder.begin) < currentDate) {
					while (dateNextInterval < currentDate) {
						var currentDateTimeSt = dateBegin;
						var intervalMillSecs = reminder.interval * 60 * 60 * 1000;
						var dateNextIntervalVal = currentDateTimeSt + intervalMillSecs;
						dateBegin = new Date(dateNextIntervalVal).valueOf();
						dateNextInterval = new Date(dateNextIntervalVal);
					}

					dateBeginVal = dateNextInterval.getTime();
				} else
					dateBeginVal = new Date(reminder.begin).getTime();

				var totalInterval = intervalMils * (totalTakes - 1);
				var dateEndVal = dateBeginVal + totalInterval;
				dateEnd = new Date(dateEndVal);
			} else if (reminder.repeat_type == "hours") {
				var daysOfWeek = (reminder.days).split(",");

				var hoursPerDay = (reminder.hours).split(",");

				var takesPerDay = hoursPerDay.length;

				// if (daysOfWeek.length < 7) {

				var contRecordatorios = 0;
				var dateBegin = new Date(reminder.begin);
				var dateEnd = new Date(reminder.begin);
				var auxDateEnd = new Date(reminder.begin);
				var dateEndMillis = new Date(reminder.begin).getTime();
				var flag1 = false; // Indica si el bucle que recorre los dias
				// seleccionados de la semana empieza en 0 o
				// en el dia de la fecha de inicio

				while (contRecordatorios <= totalTakes) {

					for ( var i = ((!flag1) ? dateBegin.getDay() : 0); i < 7; i++) {
						flag1 = true;
						if ($.inArray(i + '', daysOfWeek) >= 0) {
							for ( var j = 0; j < takesPerDay; j++) {
								var hourMin = hoursPerDay[j].split(':');
								if (hourMin[1].indexOf('PM') > 0 && hourMin[0] != '12') {
									hourMin[0] = hourMin[0].replace('0', '');
									hourMin[0] = parseInt(hourMin[0]) + 12;

								}

								auxDateEnd = new Date(auxDateEnd.getFullYear(), auxDateEnd.getMonth(), auxDateEnd.getDate(), parseInt(hourMin[0], 10), parseInt(hourMin[1].split(' '), 10));

								if (auxDateEnd.getTime() >= dateBegin.getTime()) {

									contRecordatorios++;
									if (contRecordatorios == totalTakes) {
										dateEnd = auxDateEnd;
										i = 7;
										break;
									}

								}

								if (j == (takesPerDay - 1)) {
									auxDateEnd = new Date(auxDateEnd.getTime() + (1000 * 60 * 60 * 24));
								}

							}
						} else {
							// Omite el dia en que no se deben registrar tomas
							auxDateEnd = new Date(auxDateEnd.getTime() + (1000 * 60 * 60 * 24));
						}

					}

				}

			}

			return dateEnd;
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}

	function LostInTakes(startDate, hoursPerDay) {
		try {

			var i = 0;
			var countLostIntakes = 0;
			var hoursArr = new Array();
			var date_sort_asc = function(date1, date2) {
				// This is a comparison function that will result in dates being
				// sorted in
				// ASCENDING order. As you can see, JavaScript's native
				// comparison operators
				// can be used to compare dates. This was news to me.
				if (date1 > date2)
					return 1;
				if (date1 < date2)
					return -1;
				return 0;
			};
			for (i = 0; i < hoursPerDay.length; i++) {
				hourMinute = hoursPerDay[i].split(":");
				hoursArr[i] = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), parseInt(hourMinute[0], 10), parseInt(hourMinute[1], 10));
			}
			hoursArr.sort(date_sort_asc);

			for (i = 0; i < hoursArr.length; i++) {
				if (startDate > hoursArr[i])
					countLostIntakes++;
			}
			return countLostIntakes;
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}

	function CalcStartDate(startDate, hours) {
		try {
			if (startDate < new Date()) {
				var hourMinute;
				var auxDate;
				var i;
				var startDateChanged = false;
				var startDateCalc;

				var hoursArr = new Array();
				for (i = 0; i < hoursPerDay.length; i++) {
					hourMinute = hoursPerDay[i].split(":");
					hoursArr[i] = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), parseInt(hourMinute[0], 10), parseInt(hourMinute[1], 10));
				}
				hoursArr.sort(date_sort_asc);

				do {
					for (i = 0; i < hoursArr.length; i++) {
						if (hoursArr[i] > new Date()) {
							startDateCalc = hoursArr[i];
							startDateChanged = true;
						}
					}
					if (!startDateChanged) {
						auxDate = AddDaysToDate(startDate, i + 1)
						for (i = 0; i < hoursPerDay.length; i++) {
							hourMinute = hoursPerDay[i].split(":");
							hoursArr[i] = new Date(auxDate.getFullYear(), auxDate.getMonth(), auxDate.getDate(), parseInt(hourMinute[0], 10), parseInt(hourMinute[1], 10));
						}
					}

				} while (startDateCalc < new Date())

				return startDateCalc;
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
})();