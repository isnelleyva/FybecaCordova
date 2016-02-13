(function() {
	'use strict';

	window.models = window.models || {};

	models.CustomerActions = {

		login : function(idType, username, password) {

			var deferred = $.Deferred();

			try {
				customer.discountCards([]);
			} catch (e) {
			}

			$.mobile.loading('show', {
				text : 'Iniciando sesión',
				textVisible : true,
				theme : 'b'
			});

			var token = localStorage.getItem('token');
			token = (token == null || token == '') ? token = '-1' : token;

			var invocation = invokeService2;
			try {
				if (cordova == undefined || cordova.exec == undefined) {
					invocation = invokeService;
				}
			} catch (e) {
				invocation = invokeService;
			}

			invocation({
				url : config.svb,
				service : "users",
				dataType : 'jsonp',
				serviceName : 'GetLogin',
				data : {
					user : username,
					password : password,
					applicationCode : config.appCode,
					token : token,
					deviceType : deviceType
				},
				success : function(data) {

					var callSuccess = false;
					var callCode = "0";
					var answer = true;

					var responseCode = (data.code != undefined) ? data.code : "0";

					if (responseCode == "0") {

						var userStatus = data.estadoUsuario;
						var genderGreeting = userStatus.genero == 'F' ? 'a ' : 'o ';

						if (userStatus.claveGenerada == "S") {

							$.mobile.loading("hide");
							callSuccess = false;
							callCode = "1";

							showMessage('Bienvenid' + genderGreeting + userStatus.primerNombre + ', por tu seguridad tendras que cambiar tu contraseña', null, "Mensaje");

							cambiaPassTemporal = true;
							passTemporal = password;
							customer.id(username);
							customer.code(userStatus.codigoPersona);

							localStorage.setItem('nombrePersona', userStatus.primerNombre + ' ' + userStatus.primerApellido)

							localStorage.setItem('idPersona', username);
							localStorage.setItem('codigoPersona', userStatus.codigoPersona);
							localStorage.setItem('tipoId', idType);
							// $.mobile.changePage('user-change-password.html');

						} else if (userStatus.usuarioActivado == "N") {

							$.mobile.loading("hide");
							callSuccess = false;
							callCode = "8";

							showMessage('Estimad' + genderGreeting + userStatus.primerNombre + ', aun no has activado tu cuenta, te hemos enviado un link de activación a tu correo', null, "Mensaje");

						} else {
							var callSuccess = true;
							var callCode = "0";

							localStorage.setItem('codigoPersona', userStatus.codigoPersona);
							answer = false;

							models.CustomerActions.getAddresses(localStorage.getItem('codigoPersona')).done(function() {

								try {
									facebook_logout();
									google_logout();
								} catch (e) {
									// TODO: handle exception
								}

								persona.id = username;

								// localStorage.setItem('idPersona',
								// '1707188916');
								// localStorage.setItem('codigoPersona',
								// '3002533');

								localStorage.setItem('idPersona', username);
								localStorage.setItem('emailPersona', (userStatus.email == null) ? '' : userStatus.email);
								localStorage.setItem('tipoId', idType);

								try {
									checkoutCart.customerEmail = localStorage.emailPersona
								} catch (e) {
									// TODO: handle exception
								}

								try {
									localStorage.setItem('segmentoPersona', (userStatus.segmento == null) ? '' : userStatus.segmento);
								} catch (e) {
									localStorage.setItem('segmentoPersona', '');
								}

								try {
									localStorage.setItem('nombrePersona', userStatus.primerNombre.substring(0, 1) + userStatus.primerNombre.substring(1).toLowerCase() + ' ' + userStatus.primerApellido.substring(0, 1) + userStatus.primerApellido.substring(1).toLowerCase());
								} catch (e) {
									localStorage.setItem('nombrePersona', 'usuario');
								}

								parameters.session = true;

								customer.id(localStorage.getItem('idPersona'));
								customer.name(localStorage.getItem('nombrePersona'));
								customer.email(localStorage.getItem('emailPersona'));
								customer.isAuthenticated(true);
								customer.isGuest(false);
								customer.code(localStorage.getItem('codigoPersona'));

								models.cart.getItems(localStorage.getItem('idPersona'));

								showMessage('Bienvenid' + genderGreeting + userStatus.primerNombre, null, "Mensaje");
								$.mobile.loading("hide");

								deferred.resolve({
									'success' : true,
									'code' : 0
								});

							}).fail(function(error) {
								console.log(error);

								deferred.reject({
									'success' : false
								});

							});

						}

					} else if (data.code == "8") {
						$.mobile.loading("hide");
						showConfirm('Tu usuario no ha sido activado, para activarlo te hemos enviado a tu correo un link de activación.\n\n¿Deseas que te lo enviemos nuevamente?', function(response) {
							if (response == 2) {
								$.mobile.loading("hide");
								invokeService({
									url : svb,
									service : "users",
									dataType : 'jsonp',
									data : {
										user : id,
										applicationCode : parameters.codigoAplicacion
									},
									success : function(data) {
										if (debug)
											console.log(JSON.stringify(data));
										if (data.email != undefined) {
											if (data.email != '')
												showMessage('Fybeca te ha enviado exitosamente un correo electrónico de activación a ' + data.email, null, null);
										} else {
											showMessage('Fybeca te ha enviado exitosamente un correo electrónico de activación.', null, null);
										}
										$.mobile.loading("hide");
									},
									error : function() {
										if (debug)
											alert('Error llamada');
										showMessage('Fallo en el envío del correo electrónico de activación. Espera unos minutos y vuelve a intentar.', null, 'Fybeca');
									}

								});
							} else
								$.mobile.loading("hide");

						}, null);
					} else {
						showMessage(data.msgUsr, null, null);
						$.mobile.loading("hide");
					}

					if (answer) {
						deferred.resolve({
							'success' : callSuccess,
							'code' : callCode
						});
					}

				},
				error : function(error) {
					deferred.reject(error);
				}

			});

			return deferred.promise();

		},

		getAddresses : function(userCode) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : "addressServices/addressList",
				dataType : 'json',
				data : {
					userCode : userCode
				},
				success : function(response) {
					var sortAddresses = [];
					var hasPrincipalAddress = false;
					$.each(response, function() {
						this.addressTypeText = ko.observable('');
						this.principalAddress = ko.observable(this.principalAddress);
						if (this.principalAddress()) {
							customer.selectedAddress(this.addressId);
							hasPrincipalAddress = true;
							sortAddresses.push(this);
						}
					});

					if (!hasPrincipalAddress) {
						if (response.length > 0) {
							var pa = response[0];
							pa.principalAddress = ko.observable(true);
							sortAddresses.push(pa);
						}
					}

					$.each(response, function() {
						if (this.addressId != sortAddresses[0].addressId) {
							sortAddresses.push(this);
						}
					});

					customer.addresses(sortAddresses);
					deferred.resolve(sortAddresses);

				},
				error : function(data) {

					$('.products-loading').slideUp('fast');
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		addAddress : function(addressData) {

			var deferred = $.Deferred();
			invokeService({
				url : config.locUrl,
				service : "addressServices/addAddress",
				dataType : 'json',
				data : {
					userId : localStorage.getItem('idPersona'),
					addressType : addressData.addressType,
					mainStreet : addressData.mainStreet,
					number : addressData.number,
					intersection : addressData.intersection,
					reference : addressData.reference,
					phone : addressData.phone,
					cityId : addressData.city,
					neighborhoodId : addressData.neighborhood
				},
				success : function(response) {

					$.each(response, function() {
						this.principalAddress = ko.observable(this.principalAddress);
						this.addressTypeText = ko.observable('');
					});

					customer.addresses(response)

					deferred.resolve(response);

				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		updateAddress : function(addressId, addressData) {
			var deferred = $.Deferred();
			invokeService({
				url : config.locUrl,
				service : "addressServices/updateAddress",
				dataType : 'json',
				data : {
					userCode : localStorage.getItem('codigoPersona'),
					addressId : addressId,
					mainStreet : addressData.mainStreet,
					number : addressData.number,
					intersection : addressData.intersection,
					reference : addressData.reference,
					cityId : addressData.city,
					neighborhoodId : addressData.neighborhood
				},
				success : function(response) {

					// $.each(response, function() {
					// this.principalAddress =
					// ko.observable(this.principalAddress);
					// });
					// customer.addresses(response)

					deferred.resolve(response);

				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();
		},

		getOrdersHistory : function(userId) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : "orderServices/getOrdersHistory",
				dataType : 'json',
				data : {
					userId : userId
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		getOrderDetail : function(orderId) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : "orderServices/getOrderDetail",
				dataType : 'json',
				data : {
					orderId : orderId
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		sendContactUsMail : function(data) {

			var deferred = $.Deferred();

			var neighborhoodId = -1;

			$.each(customer.addresses(), function() {
				if (customer.selectedAddress() == this.addressId) {
					neighborhoodId = this.neighborhoodId;
					return false;
				}
			})

			invokeService({
				url : config.locUrl,
				service : "contactServices/contactUs",
				dataType : 'json',
				data : {
					itemId : data.itemId,
					itemName : data.itemName,
					userId : localStorage.getItem('idPersona'),
					userName : data.txtName,
					userMail : data.txtMail,
					userPhone : data.txtPhone,
					message : data.txtInfo,
					neighborhoodId : neighborhoodId
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		getUserType : function(data) {

			var deferred = $.Deferred();

			invokeService({
				url : config.svb,
				service : "users",
				dataType : 'jsonp',
				data : {
					id : data.id,
					typeId : data.idType,
					applicationCode : '12345a'
				},
				success : function(data) {
					deferred.resolve(data);
				},
				error : function() {
					// $page.find('[type=submit]').removeAttr('disabled');
					// // $page.find('[type=submit]').button('refresh');
					// showMessage(errorMessage, null, 'Fybeca');
					// $.mobile.loading('hide');

					deferred.reject(errorMessage);

				}

			});

			return deferred.promise();

		},

		getFacebookData : function() {

			var deferred = $.Deferred();

			try {

				if (localStorage.fbtoken == undefined) {

					var redirectUrl = 'https://www.facebook.com/connect/login_success.html';
					var url = 'https://graph.facebook.com/oauth/authorize?client_id=636181696450364&redirect_uri=' + redirectUrl + '&display=touch&type=user_agent&scope=email,user_birthday,user_location,publish_stream';

					window.plugins.childBrowser.showWebPage(url, {
						showLocationBar : true
					});

					window.plugins.childBrowser.onLocationChange = function(loc) {
						if (loc.indexOf(redirectUrl) == 0) {
							try {
								var parametersStr = loc.split('#')[1];
								var tokenParameter = parametersStr.split('&')[0];
								var fbToken = tokenParameter.split('=')[1];
								localStorage.setItem('fbtoken', fbToken);
								window.plugins.childBrowser.close();

								$.mobile.loading("show", {
									text : 'Obteniendo datos...',
									textVisible : true,
									theme : 'b'
								});

								$.ajax({
									timeout : 60000,
									url : 'https://graph.facebook.com/me',
									data : {
										access_token : localStorage.fbtoken
									},
									dataType : 'jsonp',
									success : function(response) {
										deferred.resolve(response);
									},
									error : function(err) {
										deferred.reject(err);
									}
								});

							} catch (e) {
								deferred.reject(err);
							}

						}
					};

				} else {

					$.ajax({
						timeout : 60000,
						url : 'https://graph.facebook.com/me',
						data : {
							access_token : localStorage.fbtoken
						},
						dataType : 'jsonp',
						success : function(response) {
							deferred.resolve(response);
						},
						error : function(err) {
							deferred.reject(err);
						}
					});

				}

			} catch (e) {
				alert('ERROR getFacebookData try' + e);
				deferred.reject(e);
			}

			return deferred.promise();

		},

		facebookLogout : function() {
			if (localStorage.fbtoken != undefined) {
				var redirectUrl = 'https://www.facebook.com/connect/login_success.html';
				var logout_url = "https://www.facebook.com/logout.php?next=" + redirectUrl + "&access_token=" + localStorage.fbtoken;
				cerrarSesionFacebook = false;

				$.ajax({
					timeout : ajaxTimeout,
					url : logout_url,
					success : function(response) {
						facebook_access_token = null;
					},
					error : function(err) {
						console.log('ERR facebookLogout ' + err);
					}
				});

			}
		},

		facebookLogin : function(data) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : "userServices/loginWithFacebook",
				dataType : 'json',
				data : {
					facebookId : data.facebookId
				},
				success : function(response) {
					if (!response.code) {

						facebook_logout();
						google_logout();

						persona.id = response.id;

						localStorage.setItem('idPersona', response.id);
						localStorage.setItem('codigoPersona', response.userCode);

						localStorage.setItem('emailPersona', response.email);
						localStorage.setItem('tipoId', response.idType);

						// localStorage.setItem('segmentoPersona',
						// (userStatus.segmento == null) ? '' :
						// userStatus.segmento);
						try {
							localStorage.setItem('nombrePersona', response.firstName.substring(0, 1) + response.firstName.substring(1).toLowerCase() + ' ' + response.lastName.substring(0, 1) + response.lastName.substring(1).toLowerCase());
						} catch (e) {
							localStorage.setItem('nombrePersona', response.firstName + ' ' + response.lastName.substring(0, 1));
						}

						parameters.session = true;

						customer.id(localStorage.getItem('idPersona'));
						customer.name(localStorage.getItem('nombrePersona'));
						customer.email(localStorage.getItem('emailPersona'));
						customer.isAuthenticated(true);
						customer.isGuest(false);
						customer.code(localStorage.getItem('codigoPersona'));

						// answer = false;

						models.CustomerActions.getAddresses(localStorage.getItem('codigoPersona')).always(function() {
							showMessage('Bienvenido' + response.firstName, null, "Mensaje");
							$.mobile.loading("hide");
							deferred.resolve({
								'success' : true,
								'code' : 0
							});
						});

						models.cart.getItems(localStorage.getItem('idPersona'));

					} else if (response.code == 1) {
						showMessage(response.message);

						cambiaPassTemporal = true;
						passTemporal = password;
						customer.id(username);
						customer.code(userStatus.codigoPersona);

						localStorage.setItem('nombrePersona', response.data.firstName + ' ' + response.data.lastName)

						localStorage.setItem('idPersona', response.data.id);
						localStorage.setItem('codigoPersona', response.data.code);
						localStorage.setItem('tipoId', response.data.idType);

						deferred.resolve(response);

					} else {
						deferred.resolve(response);
					}

				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		checkIfUserExists : function(data) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : "userServices/checkIfUserExists",
				dataType : 'json',
				data : {
					userId : data.userId
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		registerUser : function(data) {

			$.mobile.loading('show', {
				text : 'Procesando',
				textVisible : true,
				theme : 'b'
			});

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : "userServices/registerUser",
				dataType : 'json',
				timeout : config.timeouts.registerUser,
				data : {
					facebookId : data.facebookId,
					userIdType : data.userIdType,
					userId : data.userId,
					name : data.name,
					lastname : data.lastname,
					email : data.email,
					birthdate : data.birthdate,
					gender : data.gender,
					password : data.password
				},
				success : function(response) {

					if (!response.code) {

						facebook_logout();
						google_logout();

						persona.id = data.userId;

						localStorage.setItem('idPersona', response.id);
						localStorage.setItem('codigoPersona', response.userCode);

						localStorage.setItem('emailPersona', response.email);
						localStorage.setItem('tipoId', response.idType);

						try {
							localStorage.setItem('nombrePersona', response.firstName.substring(0, 1) + response.firstName.substring(1).toLowerCase() + ' ' + response.lastName.substring(0, 1) + response.lastName.substring(1).toLowerCase());
						} catch (e) {
							localStorage.setItem('nombrePersona', response.firstName + ' ' + response.lastName.substring(0, 1));
						}

						parameters.session = true;

						customer.id(localStorage.getItem('idPersona'));
						customer.name(localStorage.getItem('nombrePersona'));
						customer.email(localStorage.getItem('emailPersona'));
						customer.isAuthenticated(true);
						customer.isGuest(false);
						customer.code(localStorage.getItem('codigoPersona'));

						models.CustomerActions.getAddresses(localStorage.getItem('codigoPersona')).always(function() {
							deferred.resolve({
								'success' : true,
								'code' : 0
							});
						});

						models.cart.getItems(localStorage.getItem('idPersona'));

					} else if (response.code == 1) {

						deferred.resolve(response);

					} else {
						deferred.resolve(response);
					}

				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		checkIfHasMissingData : function(data) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : 'userServices/checkIfHasMissingData',
				dataType : 'json',
				data : {
					userId : data.userId
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		saveMissingData : function(data) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : 'userServices/saveMissingData',
				dataType : 'json',
				data : {
					userId : data.userId,
					question : data.question,
					answer : data.answer,
					birthdate : data.missingBirthday,
					gender : data.missingGender,
					maritalStatus : data.missingMaritalStatus
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		saveReminder : function(reminder) {
			https: // www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=0CAQQjBw&url=http%3A%2F%2Fwww.jeeptrailhawk.net%2Fwp-content%2Fuploads%2F2013%2F03%2FJeep-Grand-Cherokee-Trailhawk-II-Concept-front-three-quarters-view.jpg&ei=Y9lcVOr1N4iaNobNgugO&bvm=bv.79184187,d.eXY&psig=AFQjCNFvCl7nRBKAo3esYm5V-d_6Et2qvQ&ust=1415457487817936

			db.transaction(function(tx) {

				var query = "INSERT OR REPLACE INTO reminders (id, name, medicine, begin, end, repeat_type, interval, hours, days, doctor_name, doctor_phone, buy_available, buy_reminder_days) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";
				tx.executeSql(query, [ reminder.id, reminder.name, reminder.medicine, reminder.beginDate, reminder.endDate, reminder.repeatType, reminder.interval, reminder.hours, reminder.days, reminder.doctorName, reminder.doctorPhone, reminder.buyAvailable, reminder.buyReminderDays ], function(
						tx, results) {

					var reminderTimes = reminder.reminderTimes;

					var loopLimit = reminderTimes.length > 64 ? 64 : reminderTimes.length;
					var lastRepeat = 0;

					for ( var i = 0; i < loopLimit; i++) {

						var insQuery = "INSERT OR IGNORE INTO medicine_intake (reminder_id, intake_time, intake_postponed_time, intake, intake_time_taken, intake_postponed) VALUES('" + reminder.id + "','" + reminderTimes[i] + "','" + reminderTimes[i] + "', 0, '0', 0)";
						lastRepeat = reminderTimes[i];

						tx.executeSql(insQuery, [], function(tx, result) {

						}, function() {
							console.log("error insert medicine_intake " + reminderTimes[i]);
						});

					}

					try {

						var updQuery = "UPDATE reminders set end = '" + lastRepeat + "' WHERE id = " + reminder.id;

						tx.executeSql(updQuery, [], function(tx, result) {

						}, function() {
							console.log("error update reminders " + lastRepeat);
						});

					} catch (e) {
						console.log("error update reminders " + e);
					}

				}, function(tx, error) {
					console.log(error);
				});

			});

		},

		getReminders : function() {

			var deferred = $.Deferred();

			db.transaction(function(tx) {

				tx.executeSql("SELECT * FROM reminders ORDER BY name", [], function(tx, result) {

					var response = [];

					for ( var i = 0; i < result.rows.length; i++) {
						var reminderName = result.rows.item(i).name;
						var reminderId = result.rows.item(i).id;
						response.push({
							id : reminderId,
							name : reminderName
						});
					}

					deferred.resolve(response);

				}, function(error) {
					deferred.reject(error);
				});

			});

			return deferred.promise();

		},

		getReminderById : function(reminderId) {

			var deferred = $.Deferred();

			db.transaction(function(tx) {
				tx.executeSql("SELECT id, name, medicine, begin as begin_date, end as end_date, repeat_type, interval, hours, days, doctor_name, doctor_phone, buy_available, buy_reminder_days FROM reminders WHERE id = ?", [ reminderId ], function(tx, result) {
					if (result.rows.length > 0) {
						var reminder = result.rows.item(0);
						deferred.resolve(reminder);
					} else {
						$(':mobile-pagecontainer').pagecontainer('change', '/index.html');
						// showMessage('No existe el recordatorio.');
					}
				}, function(tx, error) {
					deferred.reject(error);
				});
			}, function(error) {
				deferred.reject(error);
			});

			return deferred.promise();

		},

		deleteReminderById : function(reminderId, reminderType) {

			var deferred = $.Deferred();

			db.transaction(function(tx) {

				tx.executeSql("DELETE FROM reminders WHERE id = ?", [ reminderId ], function(tx, results) {

					// if (reminderType == 'hours') {
					//
					// tx.executeSql("SELECT * FROM medicine_intake WHERE
					// reminder_id = ?", [ reminderId ], function(tx, result) {
					// for ( var i = 0; i < result.rows.length; i++) {
					// var remId;
					// try {
					// debugger;
					// remId = parseInt(result.rows.item(i).intake_time) / 1000;
					// window.localNotification.cancel(reminderId + '_' +
					// reminderId);
					// } catch (e) {
					// console.log('CATCH deleteReminderById remove from SO ' +
					// remId);
					// }
					// }
					//
					// tx.executeSql("DELETE FROM medicine_intake WHERE
					// reminder_id = ?", [ reminderId ], function(tx, results) {
					// deferred.resolve({
					// success : true
					// });
					// }, function(tx, error) {
					// deferred.reject({
					// error : error
					// });
					// });
					//
					// }, function(tx, error) {
					// deferred.reject(error);
					// });
					//
					// } else {

					try {
						window.localNotification.cancel(reminderId);
					} catch (e) {
						console.log('CATCH deleteReminderById remove from SO ' + reminderId);
					}

					tx.executeSql("DELETE FROM medicine_intake WHERE reminder_id = ?", [ reminderId ], function(tx, results) {
						deferred.resolve({
							success : true
						});
					}, function(tx, error) {
						deferred.reject({
							error : error
						});
					});

					// }

				}, function(tx, error) {
					deferred.reject({
						error : error
					});
				});

			}, function(error) {
				deferred.reject(error);
			});

			return deferred.promise();

		},

		getIntakesByDate : function(time) {

			var deferred = $.Deferred();

			db.transaction(function(tx) {
				var endTime = time + 86400000;

				tx.executeSql("SELECT remi.name, inta.* FROM reminders remi, medicine_intake inta WHERE remi.id = inta.reminder_id AND CAST(inta.intake_time AS INTEGER) >= " + time + " AND CAST(inta .intake_time AS INTEGER) < " + endTime, [], function(tx, results) {

					var responseAux = [];
					var response = [];

					for ( var i = 0; i < results.rows.length; i++) {

						responseAux.push({
							reminderId : results.rows.item(i).reminder_id,
							reminderName : results.rows.item(i).name,
							intakeTime : results.rows.item(i).intake_time,
							intakePostponedTime : results.rows.item(i).intake_postponed_time,
							intake : results.rows.item(i).intake,
							intakeTimeTaken : results.rows.item(i).intake_time_taken,
							intakePostponed : results.rows.item(i).intake_postponed
						});

					}

					$.each(responseAux, function() {
						var existsReminder = false;
						var reminderName = this.reminderName;
						$.each(response, function() {
							if (reminderName == this.reminderName) {
								existsReminder = true;
								return;
							}
						});

						if (!existsReminder) {
							response.push({
								reminderId : this.reminderId,
								reminderName : this.reminderName,
								intakes : []
							});
						}
					});

					$.each(response, function() {
						var remId = this.reminderId;
						var intakes = [];
						$.each(responseAux, function() {
							if (this.reminderId == remId) {

								var hours = new Date(parseInt(this.intakeTime)).getHours() + '';
								var minutes = new Date(parseInt(this.intakeTime)).getMinutes() + '';
								hours = hours.length == 1 ? '0' + hours : hours;
								minutes = minutes.length == 1 ? '0' + minutes : minutes;
								var intakeTimeText = hours + ':' + minutes;
								intakes.push({
									reminderId : remId,
									intakeTime : this.intakeTime,
									intakeTimeText : intakeTimeText,
									intakePostponedTime : this.intakePostponedTime,
									intake : ko.observable(this.intake == 1),
									intakeTimeTaken : this.intakeTimeTaken,
									intakeTimeTakenText : ko.observable(dateFormat(parseInt(this.intakeTimeTaken), 'dddd d " a las " H:MM')),
									intakePostponed : ko.observable(this.intakePostponed),
									intakePostponedText : ko.observable(dateFormat(parseInt(this.intakePostponedTime), 'dddd d " a las " H:MM')),
								});
							}
						});
						this.intakes = intakes;
					});

					deferred.resolve(response);

				}, function(tx, error) {
					deferred.reject({
						error : error
					});
				});

			}, function(error) {
				deferred.reject(error);
			});

			return deferred.promise();

		},

		getIntakesByReminderId : function(reminderId) {

			var deferred = $.Deferred();

			db.transaction(function(tx) {
				tx.executeSql("SELECT * FROM medicine_intake WHERE reminder_id = ?", [ reminderId ], function(tx, result) {
					var response = [];

					for ( var i = 0; i < result.rows.length; i++) {
						response.push(result.rows.item(i).intake_time);
					}

					deferred.resolve(response);

				}, function(tx, error) {
					deferred.reject(error);
				});
			}, function(error) {
				deferred.reject(error);
			});

			return deferred.promise();

		},

		updateIntake : function(intake) {

			var deferred = $.Deferred();

			db.transaction(function(tx) {
				var query = "UPDATE medicine_intake SET intake = " + (intake.intake() ? 1 : 0) + ", intake_time_taken = '" + intake.intakeTimeTake + "', intake_postponed = '0' WHERE reminder_id = '" + intake.reminderId + "' AND (intake_postponed_time = '" + intake.intakeTime
						+ "' OR intake_postponed_time = " + intake.intakeTime + ")";
				tx.executeSql(query, [], function(tx, results) {
					deferred.resolve(true);
				}, function(tx, error) {
					console.log(error);
					deferred.reject(error);
				});

			});

			return deferred.promise();

		},

		getAllIntakes : function() {

			var deferred = $.Deferred();

			db.transaction(function(tx) {
				var query = "SELECT * FROM medicine_intake";
				tx.executeSql(query, [], function(tx, results) {

					var response = [];

					for ( var i = 0; i < results.rows.length; i++) {
						response.push({
							intakeTime : results.rows.item(i).intake_time,
							intake : results.rows.item(i).intake == 1,
						});
					}

					deferred.resolve(response);
				}, function(tx, error) {
					console.log(error);
					deferred.reject(error);
				});

			});

			return deferred.promise();

		},

		postponeIntake : function(intake) {

			var deferred = $.Deferred();

			db.transaction(function(tx) {
				var query = "UPDATE medicine_intake SET intake_postponed_time = intake_postponed_time + 600000, intake_postponed = '1' WHERE reminder_id = '" + intake.reminderId + "' AND (intake_postponed_time = '" + intake.intakeTime + "' OR intake_postponed_time = " + intake.intakeTime + ")";
				tx.executeSql(query, [], function(tx, results) {
					deferred.resolve(true);
				}, function(tx, error) {
					console.log(error);
					deferred.reject(error);
				});

			});

			return deferred.promise();

		},

		predetermineAddress : function(data) {

			invokeService({
				url : config.locUrl,
				service : "addressServices/predetermineAddress",
				dataType : 'json',
				data : data,
				success : function(response) {

				},
				error : function(data) {

				}
			});

		},

		getPharmacies : function() {

			var deferred = $.Deferred();

			invokeService({
				url : 'https://mapp01.fybeca.com/FybecaApi/api/pharmacies',
				service : '',
				dataType : 'json',
				data : {
					latitude : '-0.180653',
					longitude : '-78.467838',
					maxDistance : '2000'
				},
				success : function(response) {
					var locations = $.map(response, function(n, i) {
						return {
							id : n.codigoFarmacia,
							name : n.nombreFarmacia,
							address : n.direccion,
							coords : {
								lat : n.latitud.replace(',', '.'),
								lng : n.longitud.replace(',', '.')
							},
							city : n.city.trim(),
							openning : {
								status : (n.estado == 'A'),
								open : n.horaApertura,
								close : n.horaCierre
							}
						}
					});
					deferred.resolve(locations);

				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		getActivePharmacies : function() {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : 'addressServices/getActivePharmacies',
				dataType : 'json',
				data : {},
				// cache : {
				// key : 'activePharmacies',
				// time : config.cacheTimeouts.getActivePharmacies
				// },
				success : function(response) {
					var activePharmacies = $.map(response, function(n, i) {
						return {
							id : n.value
						}
					});
					localStorage.setItem('activePharmacies', JSON.stringify(activePharmacies));
					deferred.resolve(response);

				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		getUserSecurityQuestion : function(data) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : 'userServices/getUserSecurityQuestion',
				dataType : 'json',
				data : {
					userId : data.userId
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		checkIfIsCorrectAnswer : function(data) {

			var deferred = $.Deferred();

			invokeService({
				url : config.locUrl,
				service : 'userServices/checkIfIsCorrectAnswer',
				dataType : 'json',
				data : {
					userId : data.userId,
					answer : data.answer
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		changeEmail : function(data) {

			var deferred = $.Deferred();
			invokeService({
				url : config.locUrl,
				service : 'userServices/changeEmailByAnswer',
				dataType : 'json',
				data : {
					userId : data.userId,
					answer : data.answer,
					email : data.email,
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		},

		getVitalpointsData : function() {

			var deferred = $.Deferred();

			invokeService({
				url : svf,
				service : 'obtenerVitalpuntos',
				dataType : 'jsonp',
				data : {
					codigoPersona : localStorage.getItem('codigoPersona'),
					codigoAplicacion : parameters.codigoAplicacion
				},
				cache : {
					key : localStorage.getItem('codigoPersona'),
					time : obtenerVitalpuntosCacheTimeout
				},
				success : function(response) {
					deferred.resolve(response);
				},
				error : function(data) {
					deferred.reject(data);
				}
			});

			return deferred.promise();

		}

	};

})(jQuery);
