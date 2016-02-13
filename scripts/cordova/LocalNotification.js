/*-
 * Phonegap LocalNotification Plugin for Android
 * 
 * Created by Daniel van 't Oever 2012 MIT Licensed
 * 
 * Usage: 
 * 
 * plugins.localNotification.add({ date: new Date(), message: 'This is an Android alarm using the statusbar', id: 123 });
 * plugins.localNotification.cancel(123); 
 * plugins.localNotification.cancelAll();
 * 
 * This interface is similar to the existing iOS LocalNotification plugin created by Greg Allen
 */

//if (typeof PhoneGap !== "undefined") {
/**
 * Empty constructor
 */
var LocalNotification = function() {
};

/**
 * Register a notification message for a specific date / time
 * 
 * @param successCB
 * @param failureCB
 * @param options
 *            Array with arguments. Valid arguments are date, message, repeat
 *            and id repeat: none, hourly, daily, weekly
 */
LocalNotification.prototype.addNotification = function(options) {
	if (debug)
		alert("addNotification, Id: " + options.id + ". Fecha: " + options.dateIni);

	var defaults = {
		dateIni : new Date(),
		dateEnd : new Date(),
		message : '',
		title : '',
		ticker : '',
		repeat : '',
		interval : 0,
		intervalType : '',
		id : "",
		action : "",
		sound : "",
		badge : "",
		foreground : "",
		background : "",
		success : null,
		error : null
	};

	options.dateIni = options.dateIni.valueOf();
	options.dateEnd = options.dateEnd.valueOf();

	for ( var key in defaults) {
		if (typeof options[key] !== "undefined") {

			defaults[key] = options[key];
		}
	}

	PhoneGap.exec(defaults.success, defaults.error, 'LocalNotification', 'addNotification', new Array(defaults));
};

/**
 * Register an alarm using a specific inteval
 * 
 * @param successCB
 * @param failureCB
 * @param options
 *            Array with arguments. Valid arguments are date, message and id
 */
LocalNotification.prototype.addNotificationByInterval = function(options) {
	if (debug)
		alert("addNotificationByInterval, Id: " + options.id + ". Fecha: " + options.dateIni);

	var defaults = {
		dateIni : new Date(),
		dateEnd : new Date(),
		message : '',
		title : '',
		ticker : '',
		interval : 0,
		intervalType : '',
		id : "",
		action : "",
		sound : "",
		badge : "",
		foreground : "",
		background : "",
		success : null,
		error : null
	};

	options.dateIni = options.dateIni.valueOf();
	options.dateEnd = options.dateEnd.valueOf();

	for ( var key in defaults) {
		if (typeof options[key] !== "undefined") {

			defaults[key] = options[key];
		}
	}

	PhoneGap.exec(defaults.success, defaults.error, 'LocalNotification', 'addNotificationByInterval', new Array(defaults));
};

/**
 * Cancel an existing notification using its original ID.
 * 
 * @param id
 *            The ID that was used when creating the notification using the
 *            'add' method.
 */
LocalNotification.prototype.cancel = function(notificationId) {
	if (debug)
		alert("cancel, Id: " + notificationId);
	PhoneGap.exec(null, null, 'LocalNotification', 'cancel', new Array({
		id : notificationId
	}));
};

/**
 * Cancel all notifications that were created by your application.
 */
LocalNotification.prototype.cancelAll = function() {
	PhoneGap.exec(null, null, 'LocalNotification', 'cancelAll', new Array());
};

/**
 * Stop sound
 */
LocalNotification.prototype.stopSound = function() {
	PhoneGap.exec(null, null, 'LocalNotification', 'stopSound', new Array());
};

/**
 * Verify a group of notifications
 * 
 * @param successCB
 * @param failureCB
 * @param options
 *            Array with arguments. Valid arguments are date, message and id
 */
LocalNotification.prototype.verifyExitsGroupNotifications = function(options) {

	PhoneGap.exec(function(result) {
		navigator.notification.alert(result, null, 'Mensaje');
	}, function(result) {
		navigator.notification.alert(result, null, 'Mensaje');
	}, 'LocalNotification', 'verifyExitsGroupNotificationsJS', new Array(options));
};

/**
 * Initiate Alarms
 */
LocalNotification.prototype.initiateNotifications = function() {

	PhoneGap.exec(null, null, 'LocalNotification', 'initiateNotifications', new Array({
		count : 0
	}));
};

/**
 * Register this plugin with phonegap
 */

window.localNotification = new LocalNotification();
// }
