(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]');

	var contactTimer;

	var productTimer;

	var viewModel = {

		products : ko.observableArray([]),

		contacts : ko.observableArray([]),

		productKeyword : '',

		contactKeyword : '',

		reminderName : ko.observable(''),

		reminderMedicine : ko.observable(''),

		reminderCodeOnEdit : ko.observable(''),

		reminderBeginDateText : ko.observable(''),

		reminderEndDateText : ko.observable(''),

		repeatType : ko.observable('none'),

		repeatTypeText : ko.observable('Ninguna'),

		reminderBeginDate : new Date().getTime(),

		reminderEndDate : ko.observable(''),

		reminderTotalTakes : 0,

		reminderIntervalValue : 0,

		reminderSelectedEndDate : new Date(),

		doctor : ko.observable(''),

		doctorPhone : ko.observable(''),

		leftTakes : ko.observable(0),

		leftTakesDaysReminder : ko.observable(0),

		buyReminder : ko.observable(''),

		reminderHours : ko.observableArray([]),

		reminderEndType : '',

		reminderTimes : [],

		showHours : ko.observable(true),

		showProductsList : ko.observable(false),

		reminderDays : {
			mon : ko.observable(true),
			tue : ko.observable(true),
			wed : ko.observable(true),
			thu : ko.observable(true),
			fri : ko.observable(true),
			sat : ko.observable(true),
			sun : ko.observable(true)
		},

		openBeginDp : function() {
			$('#dpBegin').scroller('show');
		},

		onSelectBeginTime : function(data) {
			viewModel.reminderBeginDate = new Date(data).getTime();
			viewModel.reminderBeginDateText(dateFormat(viewModel.reminderBeginDate, 'dddd, mmmm d, yyyy, H:MM'));

			if (viewModel.repeatType() == 'none') {
				viewModel.reminderEndDate(new Date(data).getTime());
				viewModel.reminderEndDateText(data);
				viewModel.reminderEndDateText(dateFormat(viewModel.reminderEndDate(), 'dddd, mmmm d, yyyy, H:MM'));
				viewModel.calcEndDate();
			} else {
				viewModel.reminderEndDate('');
				viewModel.reminderEndDateText('');
			}
		},

		toogleShowHours : function(show) {
			viewModel.showHours(show);
		},

		showHourPicker : function() {
			$page.find('#dpRepeatHour').scroller('show');
		},

		showDatePicker : function() {
			$page.find('#dpEndDate').scroller('show');
		},

		addReminderHour : function(hour) {

			var existsHour = false

			var newHour = {
				time : parseInt(hour.split(':')[0] + hour.split(':')[1]),
				hour : hour.split(':')[0],
				minute : hour.split(':')[1]
			};

			$.each(viewModel.reminderHours(), function() {
				if (this.hour == newHour.hour && this.minute == newHour.minute) {
					existsHour = true;
					return;
				}
			});

			if (!existsHour) {
				viewModel.reminderHours.push(newHour);
				viewModel.reminderHours.sort(function(l, r) {
					return l.time == r.time ? 0 : l.time < r.time ? -1 : 1
				})
			} else {
				$.mobile.loading("show", {
					text : 'Ya se ha ingresado esa hora',
					textVisible : true,
					textonly : true,
					theme : 'b'
				});
				setTimeout(function() {
					$.mobile.loading("hide");
				}, 3000);
			}
			$('#hoursList').listview('refresh');
		},

		removeReminderHour : function(hour) {
			$.each(viewModel.reminderHours(), function() {
				if (this.hour == hour.hour && this.minute == hour.minute) {
					viewModel.reminderHours.remove(this);
					return;
				}
			})
		},

		selectReminderEnd : function(date) {
			viewModel.reminderSelectedEndDate = new Date(date).getTime();
			viewModel.calcEndDate();

		},

		openReminderEndPopup : function() {

			if (viewModel.repeatType() != '' && viewModel.repeatType() != 'none') {
				$('#popupEndReminder').popup('open');
			} else {
				$.mobile.loading("show", {
					text : 'No es necesaria una fecha de finalización si el tipo de repetición es "Ninguna"',
					textVisible : true,
					textonly : true,
					theme : 'b'
				});
				setTimeout(function() {
					$.mobile.loading("hide");
				}, 3000);
			}

		},

		closePopupRepeatType : function() {
			$('#popupRepeatType').popup('close');
		},

		closePopupRepeatInterval : function() {
			$('#popupRepeatInterval').popup('close');
		},

		closePopupRepeatHours : function() {
			$('#popupRepeatHours').popup('close');
			viewModel.reminderHours.removeAll();
		},

		closePopUpReminderEnd : function() {
			$('#popupEndReminder').popup('close');
		},

		closePopupTotalTakes : function() {
			$('#popupTotalTakes').popup('close');
		},

		chooseRepeatType : function(form) {

			var repeatData = $(form).serializeObject();

			$('#popupRepeatType').popup('close');

			viewModel.repeatType(repeatData.rdRepeat);

			setTimeout(function() {
				viewModel.reminderEndDate('');
				viewModel.reminderEndDateText('');
				if (repeatData.rdRepeat == 'none') {
					viewModel.repeatTypeText('Ninguna');
					viewModel.reminderEndDate(viewModel.reminderBeginDate);
					viewModel.reminderEndDateText(dateFormat(viewModel.reminderBeginDate, 'dddd, mmmm d, yyyy, H:MM'));
				} else if (repeatData.rdRepeat == 'interval') {
					viewModel.repeatTypeText('Intervalo');
					$('#popupRepeatInterval').popup('open');
				} else if (repeatData.rdRepeat == 'hours') {
					viewModel.repeatTypeText('Por horas');
					$('#popupRepeatHours').popup('open');
				}
			}, 300);
		},

		chooseRepeatInterval : function(form) {

			var repeatInterval = $(form).serializeObject();
			$('#popupRepeatInterval').popup('close');
			var ri = repeatInterval.slRepeatInterval;
			viewModel.reminderIntervalValue = ri;
			viewModel.repeatTypeText('Cada ' + (ri == 1 ? '' : ri) + ' hora' + (ri == 1 ? '' : 's'));
		},

		chooseRepeatHours : function(form) {

			var textToShow = 'Por horas';
			$('#popupRepeatHours').popup('close');

			if (viewModel.reminderDays.mon() && viewModel.reminderDays.tue() && viewModel.reminderDays.wed() && viewModel.reminderDays.thu() && viewModel.reminderDays.fri() && viewModel.reminderDays.sat() && viewModel.reminderDays.sun()) {
				textToShow += ', todos los días';
			} else {
				if (viewModel.reminderDays.mon()) {
					textToShow += ', Lunes';
				}
				if (viewModel.reminderDays.tue()) {
					textToShow += ', Martes';
				}
				if (viewModel.reminderDays.wed()) {
					textToShow += ', Miercoles';
				}
				if (viewModel.reminderDays.thu()) {
					textToShow += ', Jueves';
				}
				if (viewModel.reminderDays.fri()) {
					textToShow += ', Viernes';
				}
				if (viewModel.reminderDays.sat()) {
					textToShow += ', Sabado';
				}
				if (viewModel.reminderDays.sun()) {
					textToShow += ', Domingo';
				}
			}

			textToShow += ' a las ';

			$.each(viewModel.reminderHours(), function() {
				textToShow += this.hour + ':' + this.minute + ' ';
			});

			viewModel.repeatTypeText(textToShow);
		},

		chooseReminderEnd : function(form) {

			var endData = $(form).serializeObject();
			$('#popupEndReminder').popup('close');
			setTimeout(function() {
				if (endData.rdEnd == 'calculate') {
					$('#popupTotalTakes').popup('open');
					viewModel.reminderEndType = 'calc';
				} else if (endData.rdEnd == 'endDate') {
					viewModel.showDatePicker();
					viewModel.reminderEndType = 'date';
				}
			}, 300);

		},

		chooseReminderTotalTakes : function(form) {

			var totalTakes = $(form).serializeObject();
			var currTotalTakes = parseInt(totalTakes.totalTakes);

			if (isNaN(currTotalTakes)) {
				showMessageTextClose('Ingresa un número válido');
				return false;
			}

			if (currTotalTakes < 1 || currTotalTakes > 64) {
				showMessageTextClose('Debes indicar entre 1 y 64 tomas');
				return false;
			}

			$('#popupTotalTakes').popup('close');
			viewModel.reminderTotalTakes = totalTakes.totalTakes;

			viewModel.calcEndDate();

		},

		chooseDoctor : function(form) {

			var drData = $(form).serializeObject();

			if (drData.doctorName == '' || drData.doctorPhone == '') {
				showMessageTextClose('Llena correctamente los campos');
				return false;
			}

			if (viewModel.validatePhone(drData.doctorPhone)) {
				$('#popupDoctor').popup('close');
				viewModel.doctor(drData.doctorName);
				viewModel.doctorPhone(drData.doctorPhone);
			}

		},

		closePopupDoctor : function() {
			$('#popupDoctor').popup('close');
		},

		chooseBuyReminder : function(form) {

			$('#popupBuyReminder').popup('close');
			var br = $(form).serializeObject();

			if (br.availableTakes < 1 || br.availableTakes > 99) {
				showMessageTextClose('Debes indicar entre 1 y 99 tomas disponibles');
				return false;
			}

			viewModel.leftTakes(br.availableTakes);
			viewModel.leftTakesDaysReminder(br.takesDays);

		},

		closePopupBuyReminder : function() {
			$('#popupBuyReminder').popup('close');
		},

		askForDelete : function() {
			showConfirm('¿Desea eliminar este recordatorio? Esta acción no puede deshacerse', function(option) {
				if (option == 2) {
					viewModel.deleteReminder();
				}
			}, 'Eliminar recordatorio');
		},

		deleteReminder : function() {

			$.mobile.loading('show', {
				text : 'Eliminando',
				textVisible : true,
				theme : 'b'
			});

			models.CustomerActions.getIntakesByReminderId(viewModel.reminderCodeOnEdit()).done(function(repeats) {
				var ini =1;
				var cont =0;
				$.each(repeats, function() {
					var thisRepeat = parseInt(this) / 1000;
					//console.log('delete ' + viewModel.reminderCodeOnEdit() +"-"+ thisRepeat)
					//console.log('delete ' + viewModel.reminderCodeOnEdit() + thisRepeat)
					try {
						if(ini==1){
							cordova.plugins.notification.local.cancel(viewModel.reminderCodeOnEdit(), function () {
								// Notification was cancelled
							}, this);
							ini=2;
						}
						var idHours = ""+viewModel.reminderCodeOnEdit()+""+thisRepeat;
                        cordova.plugins.notification.local.cancel(idHours, function () {
                                                    // Notification was cancelled
                                                }, this);
                        var idInterval = ""+viewModel.reminderCodeOnEdit()+""+cont;
                        cordova.plugins.notification.local.cancel(idInterval, function () {
													// Notification was cancelled
												}, this);
					} catch (e) {
						console.log('error ' + e);
					}
					cont++;
				});

			}).always(function() {

				models.CustomerActions.deleteReminderById(viewModel.reminderCodeOnEdit()).done(function() {

					$(':mobile-pagecontainer').pagecontainer('change', '../../reminders.html');

				}).fail(function(error) {
					showMessage('No se pudo borrar tu recordatorio', null, null);
					console.log('XXXXXXX' + error);

					setTimeout(function() {
						$(':mobile-pagecontainer').pagecontainer('change', '../../reminders.html');
					}, 3000);
				}).always(function() {
					$.mobile.loading('hide');
				});

			});

		},

		calcEndDate : function() {
			viewModel.reminderTimes = [];
			if (viewModel.repeatType() == 'none') {
				viewModel.reminderEndDate(viewModel.reminderBeginDate);
				viewModel.reminderTimes.push(viewModel.reminderBeginDate);
			} else if (viewModel.repeatType() == 'interval') {

				var initTime = viewModel.reminderBeginDate;
				var incrementTime = viewModel.reminderIntervalValue * 3600000;

				if (viewModel.reminderEndType == 'calc') {

					var repeatCount = 0;
					var endTime = initTime;

					do {
						viewModel.reminderTimes.push(new Date(endTime).getTime());
						endTime += incrementTime;
						repeatCount++;
					} while (repeatCount < viewModel.reminderTotalTakes);

					endTime -= incrementTime;
					// viewModel.reminderTimes.push(new
					// Date(endTime).getTime());
					viewModel.reminderEndDate(new Date(endTime).getTime());
					viewModel.reminderEndDateText(dateFormat(viewModel.reminderEndDate(), 'dddd, mmmm d, yyyy, H:MM'));

				} else if (viewModel.reminderEndType == 'date') {

					var currTime = initTime
					var endTime = new Date(viewModel.reminderSelectedEndDate).getTime() + 86400000;

					while (currTime < endTime) {
						repeatCount++;
						viewModel.reminderTimes.push(new Date(currTime).getTime());
						currTime += incrementTime;
					}

					currTime -= incrementTime;
					viewModel.reminderEndDate(new Date(currTime).getTime());
					viewModel.reminderEndDateText(dateFormat(currTime, 'dddd, mmmm d, yyyy, H:MM'));

				}

			} else if (viewModel.repeatType() == 'hours') {

				var beginDay = new Date(viewModel.reminderBeginDate).getDay();

				if (viewModel.reminderEndType == 'calc') {
					var repeatCount = 0;

					var initDayNumber = new Date(viewModel.reminderBeginDate).getDay();
					var choosenDayNumber = new Date(viewModel.reminderSelectedEndDate).getDay();
					// var currentDay = choosenDayNumber;
					var initTime = viewModel.reminderBeginDate;
					var activeDays = [ viewModel.reminderDays.mon(), viewModel.reminderDays.tue(), viewModel.reminderDays.wed(), viewModel.reminderDays.thu(), viewModel.reminderDays.fri(), viewModel.reminderDays.sat(), viewModel.reminderDays.sun() ];

					var aux = false;

					while (!aux) {
						if (activeDays[choosenDayNumber - 1]) {
							aux = true;
						} else {
							choosenDayNumber += 1;
						}
					}

					while (choosenDayNumber != initDayNumber) {
						initTime += 86400000;
						initDayNumber = (initDayNumber + 1 > 7) ? 1 : initDayNumber + 1;
					}

					aux = new Date(initTime);
					var currentDay = new Date((aux.getMonth() + 1) + '/' + aux.getDate() + '/' + aux.getFullYear()).getTime();
					var currentTime;

					while (repeatCount < viewModel.reminderTotalTakes) {

						$.each(viewModel.reminderHours(), function() {

							var dayHourTime = this.hour * 3600000 + this.minute * 60000;
							currentTime = currentDay + dayHourTime;
							if (repeatCount == viewModel.reminderTotalTakes) {
								return;
							}

							if (currentTime >= viewModel.reminderBeginDate) {
								viewModel.reminderTimes.push(new Date(currentTime).getTime());
								repeatCount++;
							}

						});

						var isAnActiveDay = false;

						while (!isAnActiveDay) {
							currentDay += 86400000;
							choosenDayNumber = (choosenDayNumber + 1 > 7) ? 1 : choosenDayNumber + 1;
							if (activeDays[choosenDayNumber - 1]) {
								isAnActiveDay = true;
							}
						}

					}

					viewModel.reminderEndDate(new Date(currentTime).getTime());
					viewModel.reminderEndDateText(dateFormat(viewModel.reminderEndDate(), 'dddd, mmmm d, yyyy, H:MM'));

				} else if (viewModel.reminderEndType == 'date') {

					var aux = new Date(viewModel.reminderSelectedEndDate);
					var selectedEndDate = new Date((aux.getMonth() + 1) + '/' + aux.getDate() + '/' + aux.getFullYear()).getTime();
					var lastHour = viewModel.reminderHours()[viewModel.reminderHours().length - 1];
					var lastHourTime = 86400000;
					try {
						var lastHourTime = parseInt(lastHour.hour) * 1000 * 60 * 60 + parseInt(lastHour.minute) * 1000 * 60;
					} catch (e) {

					}
					var calculatedEndTime = selectedEndDate + lastHourTime;
					/*
					 * 
					 */
					var initDayNumber = new Date(viewModel.reminderBeginDate).getDay();
					var choosenDayNumber = new Date(viewModel.reminderBeginDate).getDay();
					var initTime = viewModel.reminderBeginDate;
					var activeDays = [ viewModel.reminderDays.mon(), viewModel.reminderDays.tue(), viewModel.reminderDays.wed(), viewModel.reminderDays.thu(), viewModel.reminderDays.fri(), viewModel.reminderDays.sat(), viewModel.reminderDays.sun() ];

					var aux = false;

					while (!aux) {
						if (activeDays[choosenDayNumber - 1]) {
							aux = true;
						} else {
							choosenDayNumber += 1;
						}
					}

					while (choosenDayNumber != initDayNumber) {
						initTime += 86400000;
						initDayNumber = (initDayNumber + 1 > 7) ? 1 : initDayNumber + 1;
					}

					aux = new Date(initTime);
					var currentDay = new Date((aux.getMonth() + 1) + '/' + aux.getDate() + '/' + aux.getFullYear()).getTime();
					while (currentDay < calculatedEndTime) {

						$.each(viewModel.reminderHours(), function() {
							var dayHourTime = this.hour * 3600000 + this.minute * 60000;
							var currentTime = currentDay + dayHourTime;

							if (currentTime >= viewModel.reminderBeginDate) {
								viewModel.reminderTimes.push(new Date(currentTime).getTime());
							}

						});

						var isAnActiveDay = false;

						while (!isAnActiveDay) {
							currentDay += 86400000;
							choosenDayNumber = (choosenDayNumber + 1 > 7) ? 1 : choosenDayNumber + 1;
							if (activeDays[choosenDayNumber - 1]) {
								isAnActiveDay = true;
							}
						}

					}

					/*
					 * 
					 */

					viewModel.reminderEndDate(new Date(calculatedEndTime).getTime());
					viewModel.reminderEndDateText(dateFormat(viewModel.reminderEndDate(), 'dddd, mmmm d, yyyy, H:MM'));

				}

			}

		},

		saveReminder : function(form) {

			var rd = $(form).serializeObject();

			if (rd.reminderName == '') {

				showMessageTextClose('Debes indicar un nombre para tu recordatorio');

			} else if (viewModel.reminderEndDate() == '') {

				showMessageTextClose('Debes indicar como finaliza el recordatorio');

			} else {

				var title = "Fybeca";
				var reminderId;

				if (viewModel.reminderCodeOnEdit() != '') {
					reminderId = viewModel.reminderCodeOnEdit();
				} else {
					reminderId = Math.floor(Math.random() * 6000);
				}

				try {

					$.mobile.loading("show", {
						text : 'Guardando',
						textVisible : true,
						theme : 'b'
					});

					setTimeout(function() {

						var typeRepeat;
						var is64Times = false;

						if (viewModel.repeatType() == 'none') {
							typeRepeat = "none";

							try {
								//console.log("Local Notification ID: "+reminderId);
								cordova.plugins.notification.local.schedule({
                                        id: reminderId,
                                        title: title,
                                        text: rd.reminderName,
                                        at: viewModel.reminderBeginDate,
										sound: 'reminder',
										data: { id: reminderId }
                                });

							} catch (e) {
								console.log(e);
							}

						} else if (viewModel.repeatType() == 'interval') {

							var intervalTime = parseInt(viewModel.reminderIntervalValue);
							//intervalTime = intervalTime * 1000 * 60;
							typeRepeat = 'hour';
							//intervalTime = intervalTime * 60;
							try {

								var intervalMilSec = intervalTime * 60 * 60 * 1000;
								var beginTimeMilSec =  viewModel.reminderBeginDate;
								//console.log("Incio "+beginTimeMilSec);
								var endTimeMilSec = viewModel.reminderEndDate();
								//console.log("Fin "+endTimeMilSec);

								var cantInterval = ((endTimeMilSec-beginTimeMilSec)/intervalMilSec)|0;
								console.log("Cantidad de notificaciones "+cantInterval);

								for(i = 0; i<=cantInterval; i++){
									var id = ""+reminderId+""+i;
									var timeNotifications = beginTimeMilSec + (intervalMilSec*i);
									cordova.plugins.notification.local.schedule({
											id: id,
											title: title,
											text: rd.reminderName,
											at: timeNotifications,
											sound: 'reminder',
											data: { id: reminderId}
									});
									//console.log("Notificacion "+(i+1)+" Date "+new Date(timeNotifications));
								}

							} catch (e) {
								console.log('XXXX JS error interval');
							}

						} else if (viewModel.repeatType() == 'hours') {

							var isWeekly = false
							if (viewModel.reminderDays.mon() && viewModel.reminderDays.tue() && viewModel.reminderDays.wed() && viewModel.reminderDays.thu() && viewModel.reminderDays.fri() && viewModel.reminderDays.sat() && viewModel.reminderDays.sun()) {
								isWeekly = true;
							}

							var eachCount = 1;

							$.each(viewModel.reminderTimes, function() {

								var thisTime = this;
								var thisTimeInt = parseInt(thisTime) / 1000;
								var thisId = ""+reminderId +""+ thisTimeInt;
								//console.log('reminder ' + thisId);
								if (eachCount > 60) {
									return false;
								}
								try {
									//console.log("Local Notification ID: "+thisId);
									//console.log("Local Notification ID: "+reminderId +"-"+ thisTimeInt);
									cordova.plugins.notification.local.schedule({
											id: thisId,
											title: title,
											text: rd.reminderName,
											at: thisTime,
											sound: 'reminder',
											data: { id: reminderId }
									});

								} catch (e) {
									console.log(e);
								}
								;
								eachCount = eachCount + 1;

							});
						}

						var reminderHours = '';
						var reminderDays = '';

						$.each(viewModel.reminderHours(), function() {
							reminderHours += this.hour + ':' + this.minute + ',';
						});

						var activeDays = [ viewModel.reminderDays.mon(), viewModel.reminderDays.tue(), viewModel.reminderDays.wed(), viewModel.reminderDays.thu(), viewModel.reminderDays.fri(), viewModel.reminderDays.sat(), viewModel.reminderDays.sun() ];
						var aux = 0;

						$.each(activeDays, function() {
							if (this) {
								reminderDays += aux + ',';
							}
							aux++;
						});

						var reminderData = {
							id : reminderId,
							name : rd.reminderName,
							medicine : rd.reminderMedicine,
							beginDate : viewModel.reminderBeginDate,
							endDate : viewModel.reminderEndDate(),
							repeatType : viewModel.repeatType(),
							interval : viewModel.reminderIntervalValue,
							hours : reminderHours,
							days : reminderDays,
							doctorName : viewModel.doctor(),
							doctorPhone : viewModel.doctorPhone(),
							buyAvailable : viewModel.leftTakes(),
							buyReminderDays : viewModel.leftTakesDaysReminder(),
							reminderTimes : viewModel.reminderTimes
						};

						var moreThan64Takes = viewModel.reminderTimes.length > 64;
						// models.CustomerActions.deleteReminderById(reminderId).always(function()
						// {
						try {
							models.CustomerActions.saveReminder(reminderData);
							if (is64Times) {
								$(':mobile-pagecontainer').pagecontainer('change', '../../reminders.html?sm=4');
							} else {
								$(':mobile-pagecontainer').pagecontainer('change', '../../reminders.html?sm=' + (moreThan64Takes == true ? '3' : '1'));
							}
						} catch (e) {
							$(':mobile-pagecontainer').pagecontainer('change', "../../reminders.html?sm=1");
						}
						// });

					}, 500);

				} catch (e) {
					console.log(e);
				}

			}
		},

		getContacts : function(event, data) {

			try {

				viewModel.contactKeyword = data.target.value.trim();
				clearTimeout(contactTimer);

				if (viewModel.contactKeyword != '') {

					$.mobile.loading("show", {
						text : 'Consultando',
						textVisible : true,
						textonly : true,
						theme : 'b'
					});

					contactTimer = setTimeout(function() {

						models.DataRequests.getDeviceContacts(viewModel.contactKeyword).done(function(response) {

							$.each(response, function() {
								var thisName = this.name.formatted;
								try {
									$.each(this.phoneNumbers, function() {
										this.fullName = thisName;
									});
								} catch (e) {
								}
							});
							viewModel.contacts(response);
							$('#contactsList').listview('refresh');
						}).fail(function(error) {

						}).always(function() {
							$.mobile.loading("hide");
						});

					}, 1000);

				}

			} catch (e) {
			}

			return true;

		},

		contactChoosen : function() {
			try {
				viewModel.doctor(this.fullName);
				viewModel.doctorPhone(this.value);
				// if (this.phoneNumbers.length > 0) {
				// viewModel.doctorPhone(this.phoneNumbers[0].value);
				// }
			} catch (e) {
			}
			$("#popupContact").popup('close');

			setTimeout(function() {
				$("#popupDoctor").popup('open');
			}, 300);
		},

		openPopupContacts : function() {
			$("#popupDoctor").popup('close');
			setTimeout(function() {
				$("#popupContact").popup('open');
			}, 300);
		},

		openPopupDoctor : function() {
			$("#popupContact").popup('close');
			setTimeout(function() {
				$("#popupDoctor").popup('open');
			}, 300);
		},

		getProducts : function(keyword) {
			try {

				viewModel.productKeyword = keyword;

				if (viewModel.productKeyword.length < 3) {
					return true;
				}

				$.mobile.loading("show", {
					text : 'Consultando',
					textVisible : true,
					theme : 'b'
				});

				clearTimeout(productTimer);

				if (viewModel.productKeyword != '') {

					productTimer = setTimeout(function() {

						models.products.getProductsByKeywordFromBD(viewModel.productKeyword).done(function(results) {

							$.mobile.loading("hide");
							viewModel.showProductsList(true);

							var len = results.rows.length;
							viewModel.products.removeAll();

							for (i = 0; i < len; i++) {
								var item = results.rows.item(i);

								var itemName = item.name.toLowerCase().replace(viewModel.productKeyword.toLowerCase(), '<span class="keyword-hightlight">' + viewModel.productKeyword.toLowerCase() + '</span>');

								viewModel.products.push({
									"productId" : item.id,
									"productName" : item.name,
									"productNameStyled" : itemName
								});

							}

							$('.reminderProductsList').listview('refresh')

							try {
								// (parseInt($('#reminderProducts').css('height'))
								// + 200) + 'px'
								$('#reminder-new #remindersFields').css('min-height', (parseInt($('#reminderProducts').css('height')) + 100) + 'px');

							} catch (e) {
								console.log(e);
							}

							// $('#search-list-local').listview('refresh');
							// $('#productsList').listview('refresh');
							$('.reminderProductsList').listview('refresh')

						});

					}, 1000);

				}

			} catch (e) {
				// TODO: handle exception
			}

			return true;

		},

		productChoosen : function() {
			try {
				viewModel.reminderMedicine(this.productName.toLowerCase());
			} catch (e) {
				try {
					viewModel.reminderMedicine(this.productName);
				} catch (e) {
				}
			}
			$('#reminder-new #remindersFields').css('min-height', 'initial');
			viewModel.showProductsList(false);

		},

		openPopupProducts : function(event, data) {

			// $("#popupProducts").popup('open');
			viewModel.products([]);
			viewModel.getProducts(viewModel.reminderMedicine());
			// viewModel.showProductsList(true);
			// try {
			// $('#popupProducts
			// input').val($(data.target).prev().find('input').val());
			// // $('#popupProducts input').keyup();
			// } catch (e) {
			// // TODO: handle exception
			// }

		},

		closePopupProducts : function() {
			$("#popupProducts").popup('close');
		},

		validatePhone : function(phone) {

			if (phone.length < 9) {
				showMessageTextClose('El teléfono debe contener por lo menos 9 números');
				return false;
			}

			// if (phone.length < 9 || phone.length > 13) {
			// showMessageTextClose('El tel�fono debe contener por lo menos 9 o
			// 10 n�meros, verifica que tu n�mero incluya el prefijo
			// correspondiente, ej 02');
			// return false;
			// }
			// var regExp = /^[0-9]{1}[2-7]{1}[2-7]{1}[0-9]+$/;
			// if (regExp.test(phone)) {
			//
			// if (!/000000/.test(phone) && !/111111/.test(phone) &&
			// !/222222222/.test(phone) && !/3333333/.test(phone) &&
			// !/444444/.test(phone) && !/5555555/.test(phone) &&
			// !/666666/.test(phone) && !/7777777/.test(phone) &&
			// !/888888/.test(phone) && !/999999/.test(phone)) {
			//
			// return true;
			//
			// } else {
			// showMessageTextClose('El tel�fono fijo no puede tener demasiados
			// n�meros repetidos');
			// return false;
			// }
			//
			// }
			//
			// regExp = /^(09)|(593)|(\+593)[3|5|6|7|8|9]{1}[0-9]+$/;
			//
			// if (regExp.test(phone)) {
			//
			// if (!/000000/.test(phone) && !/111111/.test(phone) &&
			// !/222222222/.test(phone) && !/3333333/.test(phone) &&
			// !/444444/.test(phone) && !/5555555/.test(phone) &&
			// !/666666/.test(phone) && !/7777777/.test(phone) &&
			// !/888888/.test(phone) && !/999999/.test(phone)) {
			//
			// return true;
			//
			// } else {
			//
			// showMessageTextClose("El tel�fono celular no puede tener
			// demasiados caracteres repetidos", null, "Mensaje");
			// return false;
			//
			// }
			// }
			// showMessageTextClose('El tel�fono ingresado no es v�lido,
			// recuerda que si este es fijo debe a�adir el c�digo de provincia
			// "02", y si es celular este debe iniciar con "09"');
			return true;

		}

	};

	$page.on('pagebeforecreate', function() {

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);

		viewModel.reminderCodeOnEdit(pageUrl.param('id') || documentUrl.param('id'));
		viewModel.reminderCodeOnEdit(viewModel.reminderCodeOnEdit() == undefined ? '' : viewModel.reminderCodeOnEdit());

		if (viewModel.reminderCodeOnEdit() != '') {

			models.CustomerActions.getReminderById(viewModel.reminderCodeOnEdit()).done(function(reminder) {

				viewModel.reminderBeginDate = reminder.begin_date;
				viewModel.reminderBeginDateText(dateFormat(viewModel.reminderBeginDate, 'dddd, mmmm d, yyyy, H:MM'));
				viewModel.reminderIntervalValue = reminder.interval;
				viewModel.reminderEndDate(reminder.end_date);
				viewModel.reminderEndDateText(dateFormat(viewModel.reminderEndDate(), 'dddd, mmmm d, yyyy, H:MM'));
				viewModel.reminderName(reminder.name);
				viewModel.reminderMedicine(reminder.medicine);
				viewModel.doctor(reminder.doctor_name);
				viewModel.doctorPhone(reminder.doctor_phone);
				viewModel.leftTakes(reminder.buy_available);
				viewModel.leftTakesDaysReminder(reminder.buy_reminder_days);
				viewModel.repeatType(reminder.repeat_type);

				var rt = viewModel.repeatType();

				if (rt == 'none') {
					viewModel.repeatTypeText('Ninguna');
				} else if (rt == 'interval') {
					viewModel.repeatTypeText('Cada ' + reminder.interval + ' hora' + (reminder.interval == 1 ? '' : 's'));
				} else if (rt == 'hours') {

					var hours = reminder.hours;
					var days = reminder.days;

					var hoursArr = hours.split(',')

					$.each(hoursArr, function() {
						var hour = this.split(':');
						var newHour = {
							time : parseInt(hour[0] + hour[1]),
							hour : hour[0],
							minute : hour[1]
						};
						viewModel.reminderHours.push(newHour);
					});

					viewModel.reminderHours.remove(viewModel.reminderHours()[viewModel.reminderHours().length - 1]);

					viewModel.reminderDays.mon(days.indexOf('0') > -1);
					viewModel.reminderDays.tue(days.indexOf('1') > -1);
					viewModel.reminderDays.wed(days.indexOf('2') > -1);
					viewModel.reminderDays.thu(days.indexOf('3') > -1);
					viewModel.reminderDays.fri(days.indexOf('4') > -1);
					viewModel.reminderDays.sat(days.indexOf('5') > -1);
					viewModel.reminderDays.sun(days.indexOf('6') > -1);

					var textToShow = 'Por horas';

					if (viewModel.reminderDays.mon() && viewModel.reminderDays.tue() && viewModel.reminderDays.wed() && viewModel.reminderDays.thu() && viewModel.reminderDays.fri() && viewModel.reminderDays.sat() && viewModel.reminderDays.sun()) {
						textToShow += ', todos los días';
					} else {
						if (viewModel.reminderDays.mon()) {
							textToShow += ', Lunes';
						}
						if (viewModel.reminderDays.tue()) {
							textToShow += ', Martes';
						}
						if (viewModel.reminderDays.wed()) {
							textToShow += ', Miercoles';
						}
						if (viewModel.reminderDays.thu()) {
							textToShow += ', Jueves';
						}
						if (viewModel.reminderDays.fri()) {
							textToShow += ', Viernes';
						}
						if (viewModel.reminderDays.sat()) {
							textToShow += ', Sabado';
						}
						if (viewModel.reminderDays.sun()) {
							textToShow += ', Domingo';
						}
					}

					textToShow += ' a las ';

					$.each(viewModel.reminderHours(), function() {
						textToShow += this.hour + ':' + this.minute + ' ';
					});

					viewModel.repeatTypeText(textToShow);

				}

			});

		}

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {

		$page.find('#dpBegin').scroller($.extend({}, configuration.datetimePickerOptions, {
			onSelect : viewModel.onSelectBeginTime,
			rtl : false,
			endYear : new Date().getFullYear() + 5
		}, {}));

		$page.find('#dpRepeatHour').scroller($.extend({}, configuration.datetimePickerOptions, {
			preset : 'time',
			label : 'Selecciona una hora',
			stepMinute : 1,
			onSelect : viewModel.addReminderHour,
			minDate : new Date('01/01/1900'),
			endYear : new Date().getFullYear() + 5
		}, {}));

		$page.find('#dpEndDate').scroller($.extend({}, configuration.datetimePickerOptions, {
			preset : 'date',
			label : 'Selecciona una fecha',
			stepMinute : 1,
			onSelect : viewModel.selectReminderEnd,
			endYear : new Date().getFullYear() + 5
		}));

	});

})(jQuery);