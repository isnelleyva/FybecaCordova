var ProductRepository = {
	search : function(keyword, callback) {
		try {
			db.transaction(function(tx) {
				var sql = 'SELECT DISTINCT id, name FROM (SELECT id, name, 1 AS ord  FROM products a WHERE a.name LIKE "' + keyword + '%" UNION SELECT id, name, 2 AS ord FROM products b WHERE b.name LIKE "%' + keyword + '%" AND b.name NOT LIKE "' + keyword + '%" ) ORDER BY ord, name LIMIT 10';
				tx.executeSql(sql, [], function(tx, results) {
					callback(results);
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
};

var MedicineIntakeRepository = {
	countMedicineIntakeAfter: function(idReminder, time){
		var deferred = $.Deferred();
		try{
			db.transaction(function(tx){
				var sql='select count(*) as c from medicine_intake where reminder_id = "'+idReminder+'" and intake_time > ?';
				tx.executeSql(sql,[time], function(tx, result){
					deferred.resolve(Number(result.rows.item(0).c));
				}, function(tx, error){
					console.log(error);
				});
			}, function(error){
				console.log(error);
			}, function(){});
		}catch(error){
			console.log(err.message);
			console.log(err.stack);
		}
		return deferred.promise();
	}
};

var ReminderRepository = {
	get : function(id, callback) {
		try {
			db.transaction(function(tx) {
				var sql = 'SELECT * FROM reminders WHERE id = ?';
				tx.executeSql(sql, [ id ], function(tx, results) {
					callback(results);
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
	},
	markTake : function(reminder, callback) {
		try {
			db.transaction(function(tx) {
				var scheduleTime = new Date(Number(reminder_take_time));
				var scheduleTimeNoSecs = new Date(scheduleTime.getFullYear(), scheduleTime.getMonth(), scheduleTime.getDate(), scheduleTime.getHours(), scheduleTime.getMinutes(), 0);
				var tiempoAhora = Math.floor(scheduleTimeNoSecs.getTime() / 1000);
				// var
				// tiempoAhora=Math.floor(Math.round(Number(reminder_take_time)/1000)/60)*60;

				var currentDate = Math.floor((new Date()).getTime() / 1000);
				tx.executeSql('SELECT intake_time FROM medicine_intake WHERE reminder_id=\'' + reminder.id + '\' AND (intake_time=\'' + tiempoAhora + '\' OR intake_postponed_time=\'' + tiempoAhora + '\')', [], function(tx, result) {

					var intakeTime = ((result.rows.length > 0) ? result.rows.item(0).intake_time : tiempoAhora);
					tx.executeSql("INSERT OR REPLACE INTO medicine_intake (reminder_id, intake_time, intake_postponed_time, intake_time_taken, intake, intake_postponed) VALUES('" + reminder.id + "','" + intakeTime + "','" + tiempoAhora + "','" + currentDate + "', 1, 0)", [], function(tx, result) {

						tx.executeSql("UPDATE reminders SET buy_available = buy_available - 1 WHERE id = " + reminder.id + " AND CAST(buy_available as integer) > 0 AND buy_available IS NOT null AND length(buy_available) > 0", [], function(tx, result) {

						});
						callback(result);
					}, function(tx, error) {
						console.log(error);
					});
				});

			}, function(error) {
				console.log(error);
			}, function() {
				$.mobile.loading('hide');
				console.log('aca');
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	},
	pospose : function(reminder, reminder_take_time, callback) {
		try {
			db.transaction(function(tx) {

				var scheduleTime = new Date(Number(reminder_take_time));
				var scheduleTimeNoSecs = new Date(scheduleTime.getFullYear(), scheduleTime.getMonth(), scheduleTime.getDate(), scheduleTime.getHours(), scheduleTime.getMinutes(), 0);
				var scheduleTimeTmStp = Math.floor(scheduleTimeNoSecs.getTime() / 1000);

				var newIntakeTime = (scheduleTimeTmStp + 600);
				var intakeTime = scheduleTimeTmStp;

				tx.executeSql('SELECT reminder_id, intake_postponed_time FROM medicine_intake WHERE reminder_id=\'' + reminder.id + '\' AND (intake_time=\'' + intakeTime + '\' OR intake_postponed_time=\'' + intakeTime + '\')', [], function(tx, result) {
					if (result.rows.length > 0) {
						var pastIntakeTime = result.rows.item(0).intake_postponed_time;
						var queryUpdate;
						tx.executeSql("UPDATE medicine_intake SET intake_postponed_time='" + newIntakeTime + "', intake_postponed = 1, intake = 0, intake_time_taken = '0' WHERE reminder_id='" + reminder.id + "' AND (intake_time='" + intakeTime + "' OR intake_postponed_time='" + intakeTime + "')", [], function(tx, result) {
							callback(result);
						}, function(tx, error) {
							console.log(error);
						});
					} else {
						tx.executeSql("INSERT INTO medicine_intake (reminder_id, intake_time, intake_postponed_time, intake, intake_time_taken, intake_postponed) VALUES('" + reminder.id + "','" + intakeTime + "', '" + newIntakeTime + "', 0, '0', 1)", [], function(tx, result) {
							callback(result);
						}, function(tx, error) {
							console.log(error);
						});
					}
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
};

var ParametersRepository = {

	updateParameter : function(parameterCode, parameterValue) {
		try {

			if (parameterCode == 'URLGUICOM') {

				localStorage.setItem('buyersGuideUrl', parameterValue);

			}

		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}

	}

};