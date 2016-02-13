//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#reminders-calendar');
	var startDayTime;
	var dayList = Array();
	$page.on('pageinit', function() {
		var curDate = new Date();
		// Captura todas las acciones de TAP/CLICK en botones
		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'get-reminder':
				reminder_id = $(this).data("reminder_id");
				$(':mobile-pagecontainer').pagecontainer('change', 'reminder-form.html');
				break;
			case 'show-list':
				$(':mobile-pagecontainer').pagecontainer('change', 'reminders.html', {
					changeHash : false
				});
				break;
			case 'show-calendar':
				$(':mobile-pagecontainer').pagecontainer('change', 'reminders-calendar.html', {
					changeHash : false
				});
				break;
			}
		});
		$page.find("#datepicker").datepicker({
			dateFormat : 'yy-mm-dd',
			monthNames : [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
			onSelect : function(dateText, inst) {
				loadRemindersByDay(dateText);
			},
			onChangeMonthYear : function(year, month, inst) {
				$page.find('[data-role="listview"]').html("");
				var selectedMonth = month;
				if (selectedMonth < 10) {
					selectedMonth = "0" + selectedMonth;
				} else {
					selectedMonth += "";
				}
				loadDates(selectedMonth, year, null);
			},
			defaultDate : curDate
		});
		$page.find("#datepicker").datepicker("option", "dayNamesMin", [ "Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab" ]);
	});
	$page.on('pageshow', function() {

		try {

			$page.find('#showl').removeClass('ui-btn-active');

			var curDate = new Date();
			$page.find("#datepicker").datepicker("setDate", curDate);
			var curYear = curDate.getFullYear() + "";
			var curMonth = curDate.getMonth() + 1;
			var curDay = curDate.getDate();
			if (curMonth < 10) {
				curMonth = "0" + curMonth;
			} else {
				curMonth += "";
			}
			if (curDay < 10) {
				curDay = "0" + curDay;
			} else {
				curDay += "";
			}
			loadDates(curMonth, curYear, curDay);
		} catch (err) {
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}
	})
	// FUNCION PARA CARGAR LOS RECORDATORIOS POR MES
	function loadDates(month, year, curday) {
		dayList = Array();
		var endDay = getEndDay(month);
		var endDayTime;
		var calendarBeginDay;
		var calendarEndDay;
		var days = Array();
		var day;
		var hours;
		var tempDate;
		var reminders = Array();
		var startTimeNumber;
		var dayObject;
		var curDate = new Date();
		var esteMes = month + '/1/' + year;

		$.mobile.loading('show', {
			text : 'Cargando',
			textVisible : true,
			theme : 'b'
		});
		db.transaction(function(tx) {
			// SE CARGAN LOS RECORDATORIOS
			tx.executeSql("SELECT  id, repeat_type, strftime('%d', datetime(begin, 'unixepoch', 'localtime')) as begin_day, strftime('%H:%M', datetime(begin, 'unixepoch',  'localtime')) as begin_time, hours, days, strftime('%d', datetime(end, 'unixepoch',  'localtime')) as end_day, strftime('%H:%M', datetime(end, 'unixepoch',  'localtime')) as end_time, interval, (julianday(datetime(begin, 'unixepoch',  'localtime')) - julianday(DATE('" + year + "-" + month + "-01'))) as begin_days,  (julianday(DATE('" + year + "-" + month + "-" + endDay + "')) - julianday(datetime(end, 'unixepoch',  'localtime'))) as end_days, end, begin FROM reminders WHERE DATE(datetime(begin, 'unixepoch',  'localtime')) <=  DATE('" + year + "-" + month + "-" + endDay + "') AND DATE(datetime(end, 'unixepoch',  'localtime')) >= DATE('" + year + "-" + month + "-01')", [], function(tx, result) {
				// por cada recordatorio

				for ( var i = 0; i < result.rows.length; i++) {
					endDayTime = result.rows.item(i).end_time;

					hours = Array();
					// en el caso de que se ingrese por horas y dias
					if (result.rows.item(i).days.length > 0) {
						days = result.rows.item(i).days.split(",");

						hours = result.rows.item(i).hours.split(",");
						// se llena el arreglo de horas y se lo convierte a
						// formato de 24 horas
						$.each(hours, function(index, value) {
							hours[index] = parseTime24(value);
						});
					}
					if (result.rows.item(i).begin_days < 0) {
						// si la fecha de inicio es menor a la fecha de inicio
						// del mes, se ingresa como primer día del mes el 1
						startDayTime = parseHour(getStartTime(-result.rows.item(i).begin_days, result.rows.item(i).interval));
						calendarBeginDay = 1;
					} else {
						// si la fecha de inicio es mayor a la fecha de inicio
						// del mes, se ingresa esa fecha como primer día del mes
						startDayTime = result.rows.item(i).begin_time;
						calendarBeginDay = Number(result.rows.item(i).begin_day);
					}
					if (result.rows.item(i).end_days < 0) {
						// si la fecha de finalización es `mayor al último día
						// del mes, se queda por default el último día del mes
						calendarEndDay = endDay;
					} else {
						// si la fecha de finalización es menor al último día
						// del mes, se ingresa esa fecha como último día del mes
						calendarEndDay = result.rows.item(i).end_day;
					}
					// se llenan los registros tomando en cuenta el arreglo de
					// horas y las fechas de inicio y finalización
					for ( var j = calendarBeginDay; j <= calendarEndDay; j++) {
						dayObject = new Object();
						dayObject.day = j;
						dayObject.color = "green";
						// se agrega un 0 cuando los días son menores a 10
						tempDate = new Date(year, month - 1, j);
						if (j < 10) {
							day = "0" + j;
						} else {
							day = j;
						}
						if (result.rows.item(i).days.length <= 0 || $.inArray(tempDate.getDay() + "", days) >= 0) {
							if (result.rows.item(i).days.length <= 0 && result.rows.item(i).repeat_type != "none") {
								// en el caso de que se ingrese por intervalo,
								// se usa la función de horas para poblar el
								// arreglo de horas
								if (j == calendarEndDay) {
									hours = getTimesByDay(result.rows.item(i).interval, endDayTime);
								} else {
									hours = getTimesByDay(result.rows.item(i).interval, false);
								}
							} else if (result.rows.item(i).repeat_type == "none") {
								// en el caso de que se ingrese por una sola
								// repetición, se ingresa en el arreglo de horas
								// esa hora en específico
								hours = Array();
								hours[0] = result.rows.item(i).begin_time;
							}
							// si la fecha es mayor o igual a la fecha actual se
							// ingresa cada uno de los recordatorios usando el
							// arreglo de horas
							// if(tempDate.getTime() >= new
							// Date(curDate.getFullYear(), curDate.getMonth(),
							// curDate.getDate())){

							$.each(hours, function(index2, value2) {
								var hoursArray = value2.split(":");
								var timestamp = Math.round(new Date(year, month - 1, day, hoursArray[0], hoursArray[1]).getTime() / 1000);
								var aux = result.rows.item(i).id;

								// if(timestamp>=result.rows.item(i).begin &&
								// timestamp<=result.rows.item(i).end){
								if (timestamp <= result.rows.item(i).end) {

									// tx.executeSql("INSERT OR IGNORE INTO
									// medicine_intake (reminder_id,
									// intake_time, intake_postponed_time,
									// intake) VALUES('" + aux + "','" +
									// timestamp + "','0', 0)", [], function(tx,
									// result) {
									tx.executeSql("INSERT OR IGNORE INTO medicine_intake (reminder_id, intake_time, intake_postponed_time, intake, intake_time_taken, intake_postponed) VALUES('" + aux + "','" + timestamp + "','0', 0, '0', 0)", [], function(tx, result) {
									}, function() {
										console.log("error insert");
									});

								}

							});
							// }
							// se arregla los objetos a una lista para pintar
							// los días que tienen recordatorio
							if ($.inArray(dayObject, dayList) < 0) {
								dayList.push(dayObject);
							}
						}
					}

				}
				if (curday) {
					loadRemindersByDay(year + "-" + month + "-" + curday);
				}
				tx.executeSql("SELECT intake, strftime('%d', datetime(intake_time, 'unixepoch', 'localtime')) as intake_day FROM medicine_intake WHERE intake = 0 AND DATE(datetime(intake_time, 'unixepoch', 'localtime')) <=  DATE('" + year + "-" + month + "-" + endDay + "') AND DATE(intake_time, 'unixepoch', 'localtime') >= DATE('" + year + "-" + month + "-01') GROUP BY intake_day ", [], function(tx, result) {
					for ( var i = 0; i < result.rows.length; i++) {
						$.each(dayList, function(index, value) {
							if (value.day == result.rows.item(i).intake_day) {
								dayList[index].color = "red";
							}
						});
					}
					highlightDays();
					$.mobile.loading('hide');
				});
			}, function(tx, error) {
				console.log(error);
			});
		}, function(error) {
			console.log(error);
		});
	}
	// FUNCION PARA PINTAR LOS DÍAS
	function highlightDays() {
		var classDay;
		var classDayRemove;
		$.each(dayList, function(index, value) {
			if (value.color == "red") {
				classDay = "highlight-red";
				classDayRemove = "highlight-green";
			} else {
				classDay = "highlight-green";
				classDayRemove = "highlight-red";
			}
			$page.find("a.ui-state-default").filter(function() {
				return $(this).text() === value.day + "";
			}).parent().removeClass(classDayRemove);
			$page.find("a.ui-state-default").filter(function() {
				return $(this).text() === value.day + "";
			}).parent().addClass(classDay);
		});
	}
	// FUNCION PARA CARGAR LOS RECORDATORIOS POR DIA
	function loadRemindersByDay(date) {
		var reDay = Number(date.split("-")[2]);
		var remindersList = Array();
		var idList = Array();
		var curDate = new Date();
		$.mobile.loading('show', {
			text : 'Cargando',
			textVisible : true,
			theme : 'b'
		});
		db.transaction(function(tx) {
			// SE CARGAN LOS RECORDATORIOS POR DIA
			// tx.executeSql("SELECT r.medicine, r.id, r.name, m.intake,
			// strftime('%H:%M', datetime(m.intake_time, 'unixepoch',
			// 'localtime')) as day_time, strftime('%H:%M',
			// datetime(m.intake_postponed_time, 'unixepoch', 'localtime')) as
			// postponed_time, m.intake_postponed_time as timestamp_intake,
			// m.intake_time as timestamp_intake_time FROM medicine_intake m
			// JOIN reminders r ON m.reminder_id = r.id WHERE
			// DATE(m.intake_time, 'unixepoch', 'localtime') = DATE('" + date +
			// "') ORDER BY r.name, day_time", [], function(tx, result) {
			tx.executeSql("SELECT r.medicine, r.id, r.name, m.intake, strftime('%H:%M', datetime(m.intake_time, 'unixepoch', 'localtime')) as day_time, strftime('%H:%M', datetime(m.intake_postponed_time, 'unixepoch', 'localtime')) as postponed_time, strftime('%H:%M', datetime(m.intake_time_taken, 'unixepoch', 'localtime')) as intake_time,  m.intake_time_taken as timestamp_intake, m.intake_time as timestamp_intake_time, m.intake_postponed  FROM medicine_intake m JOIN reminders r ON m.reminder_id = r.id WHERE DATE(m.intake_time, 'unixepoch', 'localtime') = DATE('" + date + "') ORDER BY r.name, day_time", [], function(tx, result) {
				if (result.rows.length > 0) {
					for ( var i = 0; i < result.rows.length; i++) {

						var timestamp_intake = result.rows.item(i).timestamp_intake;
						var time_intake = result.rows.item(i).intake_time;
						var postponed_time = result.rows.item(i).postponed_time;

						if ($.inArray(result.rows.item(i).id, idList) < 0) {
							if (i != 0) {
								remindersList.push('</fieldset></div>');
							}
							remindersList.push('<li><a data-action="get-reminder" data-reminder_id="' + result.rows.item(i).id + '">' + result.rows.item(i).name + '</a></li>');
							remindersList.push('<div data-role="fieldcontain"><fieldset data-role="controlgroup">');
							idList.push(result.rows.item(i).id);
						}
						var remindersHtml = '<input type="checkbox" value="' + result.rows.item(i).id + '-' + result.rows.item(i).day_time + '" name="checkbox-' + result.rows.item(i).id + '-' + result.rows.item(i).day_time + '" id="checkbox-' + result.rows.item(i).id + '-' + result.rows.item(i).day_time + '"';
						if (result.rows.item(i).intake) {
							remindersHtml += ' checked="true"';
						}

						var dayOfWeek = '';

						if (new Date(parseInt(result.rows.item(i).timestamp_intake_time + '000')).getDate() != new Date(parseInt(result.rows.item(i).timestamp_intake + '000')).getDate() && result.rows.item(i).timestamp_intake != '0') {

							dayOfWeek = dateFormat(parseInt(result.rows.item(i).timestamp_intake + '000'), "dddd");

						}

						var textoAux = ((dayOfWeek != '') ? ' style="margin-bottom: -5px;"' : '');
						/*
						 * remindersHtml += ' class="custom" />' + '<label
						 * for="checkbox-' + result.rows.item(i).id + '-' +
						 * result.rows.item(i).day_time + '"><h3 style="margin-top: 5px;">' +
						 * result.rows.item(i).day_time + '</h3><p id="p-' + result.rows.item(i).id + '-' + result.rows.item(i).day_time.replace(':','-') + '" style="font-size: 12px;text-align: right;margin-top: -27px;margin-bottom: 13px;">' +
						 * ((timestamp_intake!=0)?((result.rows.item(i).intake==0)?'Pospuesto
						 * para ':'Tomado a') +' las ' + time_intake +
						 * ((dayOfWeek!='')?'<br> el ' + dayOfWeek : ''):'·') + '</p><p' +
						 * textoAux + '>' + result.rows.item(i).medicine + '</p></label>';
						 */
						remindersHtml += ' class="custom" />' + '<label for="checkbox-' + result.rows.item(i).id + '-' + result.rows.item(i).day_time + '"><h3 style="margin-top: 10px;">' + result.rows.item(i).day_time + '</h3><p id="p-' + result.rows.item(i).id + '-' + result.rows.item(i).day_time.replace(':', '-') + '" style="font-size: 12px;text-align: right;margin-top: -27px; ' + ((result.rows.item(i).medicine == '') ? 'margin-bottom: 10px;' : '') + ' ">' + ((result.rows.item(i).intake == 1) ? 'Tomado a las ' + time_intake + ((dayOfWeek != '') ? '<br> el ' + dayOfWeek : '') + '</p>' : result.rows.item(i).intake_postponed ? 'Pospuesto para las ' + postponed_time + ((dayOfWeek != '') ? '<br> el ' + dayOfWeek : '') : '·') + '</p><p ' + textoAux + '>' + //												 
						result.rows.item(i).medicine + '</p></label>';

						remindersList.push(remindersHtml);
					}
					$page.find('[data-role="listview"]').html(remindersList.join(" "));
				} else {
					$page.find('[data-role="listview"]').html('<li>No tiene recordatorios en el d&iacute;a</li>');
				}

				$page.find('[data-role="listview"]').listview("refresh");
				$page.find('[data-role="listview"]').trigger("create");
				date = date.replace(/-/g, '/');
				if (new Date(date).getTime() > curDate.getTime()) {

					var $chkboxObj = $page.find("input[type='checkbox']");

					if ($chkboxObj.length > 0) {
						$chkboxObj.checkboxradio('disable');
					}

				}

				$page.find("[name^=checkbox]").on("change", function() {

					var intake;
					var intakeValue = $(this).val().split("-");
					var intakeReminderId = intakeValue[0];
					var intakeTime = intakeValue[1];

					dayOfWeekAux = dateFormat(new Date(date), "dddd");
					dayOfToday = dateFormat(new Date(), "dddd");

					var intakeText = $page.find('#p-' + $(this).val().replace(':', '-')).text();

					if ($(this).is(":checked")) {
						intake = '1';
						$page.find('#p-' + $(this).val().replace(':', '-')).html('Tomado a las ' + new Date().getHours() + ':' + ((new Date().getMinutes() < 10) ? '0' + new Date().getMinutes() : new Date().getMinutes()) + ((new Date().getTime() > new Date(date).getTime() && dayOfWeekAux != dayOfToday) ? '<br>el ' + dayOfToday + '<p style="margin-top: -15px;">' : ' '));
					} else {
						intake = '0';
						$page.find('#p-' + $(this).val().replace(':', '-')).html('·<p style="margin-top: -10px;">');
					}
					db.transaction(function(tx) {
						var op;

						var queryUpdateIntake = "";

						// tx.executeSql("UPDATE medicine_intake SET intake = "
						// + intake + ", intake_postponed_time = '" +
						// Math.floor(Math.round(Number(new Date())/1000)/60)*60
						// + "' WHERE reminder_id = '" + intakeReminderId + "'
						// AND DATETIME(intake_time, 'unixepoch', 'localtime') =
						// DATETIME('" + date + " " + intakeTime + "')", [],
						// function(tx, result) {
						if (intake == '0') {
							queryUpdateIntake = "UPDATE medicine_intake SET intake = " + intake + ", intake_time_taken = '0',  intake_postponed = 0 WHERE reminder_id = '" + intakeReminderId + "' AND intake_time = '" + (new Date(date + " " + intakeTime).getTime()) / 1000 + "'";
							// tx.executeSql("UPDATE medicine_intake SET intake
							// = " + intake + ", intake_time_taken = '0',
							// intake_postponed = 0 WHERE reminder_id = '" +
							// intakeReminderId + "' AND intake_time = '" + (new
							// Date(date + " " + intakeTime).getTime())/1000 +
							// "'", [], function(tx, result) {
						} else {
							queryUpdateIntake = "UPDATE medicine_intake SET intake = " + intake + ", intake_time_taken = '" + Math.floor(Math.round(Number(new Date()) / 1000) / 60) * 60 + "', intake_postponed = 0  WHERE reminder_id = '" + intakeReminderId + "' AND intake_time = '" + (new Date(date + " " + intakeTime).getTime()) / 1000 + "'";
							// tx.executeSql("UPDATE medicine_intake SET intake
							// = " + intake + ", intake_time_taken = '" +
							// Math.floor(Math.round(Number(new
							// Date())/1000)/60)*60 + "', intake_postponed = 0
							// WHERE reminder_id = '" + intakeReminderId + "'
							// AND intake_time = '" + (new Date(date + " " +
							// intakeTime).getTime())/1000 + "'", [],
							// function(tx, result) {
						}

						tx.executeSql(queryUpdateIntake, [], function(tx, result) {
							var queryUpdate = "";

							if (intake == '1') {
								op = "-1";
								queryUpdate = "UPDATE reminders SET buy_available = buy_available -1 WHERE id = " + intakeReminderId + " AND buy_available > 0 AND buy_available NOT LIKE '0' AND buy_available IS NOT null AND length(buy_available) > 0";
							} else {
								op = "+1";
								queryUpdate = "UPDATE reminders SET buy_available = buy_available +1 WHERE id = " + intakeReminderId;
							}
							tx.executeSql(queryUpdate, [], function(tx, result) {
								tx.executeSql("SELECT intake, strftime('%d', datetime(intake_time, 'unixepoch', 'localtime')) as intake_day FROM medicine_intake WHERE intake = 0 AND DATE(intake_time, 'unixepoch', 'localtime') =  DATE('" + date.replace(/\//g, '-') + "') GROUP BY intake_day ", [], function(tx, result) {
									$.each(dayList, function(index, value) {
										if (value.day == reDay) {
											if (result.rows.length == 0) {
												dayList[index].color = "green";
											} else {
												dayList[index].color = "red";
											}
										}
									});
									highlightDays();
									$.mobile.loading('hide');
								});
							});
						});
					});
				});
				highlightDays();
				$.mobile.loading('hide');
			});
		});
	}
	// FUNCION QUE DEVUELVE EL ULTIMO DIA DE UN MES DADO
	function getEndDay(month) {
		if (month == "01" || month == "03" || month == "05" || month == "07" || month == "08" || month == "10" || month == "12") {
			endDay = 31;
		} else if (month == "04" || month == "06" || month == "09" || month == "11") {
			endDay = 30;
		} else if (month == "02") {
			endDay = 28;
		} else {
			return false;
		}
		return endDay;
	}
	// FUNCION PARA CALCULAR LA PRIMERA HORA DEL MES DE UN RECORDATORIO
	function getStartTime(mdays, minterval) {
		var mstartTimeNumber = Math.round((minterval - (mdays * 24) % minterval) * 10000) / 10000;
		return mstartTimeNumber;
	}
	// FUNCTION QUE RETORNA UNA HORA CON FORMATO DESPUES DE RECIBIR UN NUMERO
	function parseHour(mnumber) {
		var mhoursArray = (mnumber + "").split(".");
		var mhours = mhoursArray[0];
		if (mnumber < 10) {
			mhours = "0" + mhours;
		}
		var mminutes;
		if (mhoursArray.length > 1) {
			mminutes = Math.round(Number("0." + mhoursArray[1]) * 60);
			if (mminutes < 10) {
				mminutes = "0" + mminutes
			}
		} else {
			mminutes = "00"
		}
		return mhours + ":" + mminutes;
	}
	// FUNCTION PARA RECIBIR LAS HORAS DE UN DIA PARA UN RECORDATORIO
	function getTimesByDay(minterval, mendTime) {
		var mtimeArray = startDayTime.split(":");
		var mendTimeArray = false;
		if (mendTime) {
			mendTimeArray = mendTime.split(":");
		}
		var mhour = Number(mtimeArray[0]);
		var shour;
		var returnArray = Array();
		while (mhour < 24) {
			if (mhour < 10) {
				shour = "0" + mhour;
			} else {
				shour = mhour;
			}
			if (mendTimeArray) {
				if (mendTimeArray[0] > shour || (mendTimeArray[0] == shour && mendTimeArray[1] >= mtimeArray[1])) {
					returnArray.push(shour + ":" + mtimeArray[1]);
				} else {
					break;
				}
			} else {
				returnArray.push(shour + ":" + mtimeArray[1]);
			}
			mhour += minterval;
		}
		startDayTime = (mhour - 24) + ":" + mtimeArray[1];
		return returnArray;
	}
})();