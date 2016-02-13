(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]');

	var viewModel = {

		reminderId : '',

		reminderTime : '',

		reminderType : '',

		reminderName : ko.observable(''),

		reminderMedicine : ko.observable(''),

		reminderDate : ko.observable(''),

		availableTakes : ko.observable(''),

		markTake : function() {

			models.CustomerActions.updateIntake({
				intake : ko.observable(true),
				intakeTimeTake : new Date().getTime(),
				reminderId : viewModel.reminderId,
				intakeTime : viewModel.reminderTime
			}).done(function(reminder) {
				$.mobile.changePage('reminders-calendar.html', {
				// 
				});
			});

		},

		postpone10Mins : function() {

			debugger;

			models.CustomerActions.postponeIntake({
				postponedTime : parseInt(viewModel.reminderTime) + 600000,
				reminderId : viewModel.reminderId,
				intakeTime : viewModel.reminderTime
			}).done(function(reminder) {

				try {

					var reminderId = viewModel.reminderId + '_' + viewModel.reminderTime;
					var reminderTime = parseInt(viewModel.reminderTime) + 600000;

					window.localNotification.addNotification({
						dateIni : reminderTime,
						dateEnd : reminderTime,
						message : viewModel.reminderName(),
						title : 'Fybeca',
						ticker : viewModel.reminderName(),
						repeat : 'none',
						intervalType : 'none',
						id : reminderId,
						action : 'Ver',
						hasAction : true,
						sound : 'reminder',
						badge : 0,
						background : 'showReminder',
						foreground : 'showReminder',
						success : function(data) {
							// showMessage('Recordatorio creado exitosamente',
							// null, null);
							//
							// $.mobile.loading("show", {
							// text : 'Recordatorio pospuesto exitosamente',
							// textVisible : true,
							// textonly : true,
							// theme : 'b'
							// });

							// setTimeout(function() {
							showMessageText('Recordatorio pospuesto exitosamente', 5000);
							$(':mobile-pagecontainer').pagecontainer('change', 'reminders-calendar.html?sm=2');
							// }, 3000);

						},
						error : function(data) {
							$.mobile.changePage('reminders-calendar.html', {});
							$.mobile.loading("show", {
								text : 'Recordatorio NO calendarizado. Revise los datos ingresados e intente nuevamente',
								textVisible : true,
								textonly : true,
								theme : 'b'
							});
							setTimeout(function() {
								$.mobile.loading("hide");
							}, 3000);
						}
					});

				} catch (e) {
					// alert(e);
					console.log(e);
				}

			}).fail(function(err) {
				alert(err);
			});

		},

		openCalendar : function() {
			$.mobile.changePage('reminders-calendar.html', {});
		}

	};

	$page.on('pagebeforecreate', function() {

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);

		viewModel.reminderId = pageUrl.param('id') || documentUrl.param('id');
		viewModel.reminderTime = pageUrl.param('time') || documentUrl.param('time');

		viewModel.reminderDate(dateFormat(parseInt(viewModel.reminderTime), 'dddd d " a las " H:MM'));

		models.CustomerActions.getReminderById(viewModel.reminderId).done(function(reminder) {
			viewModel.reminderName(reminder.name);
			viewModel.reminderMedicine(reminder.medicine);
			viewModel.reminderType = reminder.repeat_type;
		});

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {

		// alert('id: ' + viewModel.reminderId + ' time: ' +
		// viewModel.reminderTime);

	});

})(jQuery);