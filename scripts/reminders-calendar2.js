//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]');

	var viewModel = {

		dayReminders : ko.observableArray([]),

		activeDays : [],

		currentDate : ko.observable(''),

		loadCalendarColors : function() {

			models.CustomerActions.getAllIntakes().done(function(response) {
				viewModel.activeDays = [];
				$.each(response, function() {
					var thisDate = new Date(parseInt(this.intakeTime));
					var year = thisDate.getFullYear();
					var month = thisDate.getMonth();
					var day = thisDate.getDate();
					var isTaken = this.intake;
					var existsDay = false;

					$.each(viewModel.activeDays, function() {

						if (this.year == year && this.month == month && this.day == day) {
							existsDay = true;
							if (!isTaken) {
								this.isTotalTaken = false;
							}
						}

					});

					if (!existsDay) {
						viewModel.activeDays.push({
							year : year,
							month : month,
							day : day,
							isTotalTaken : isTaken
						})
					}

				});

				$.each(viewModel.activeDays, function() {

					var thisDay = this.day;
					var thisMonth = this.month;
					var thisYear = this.year;

					$('[data-month="' + thisMonth + '"][data-year="' + thisYear + '"] a').filter(function() {
						return $(this).text() === thisDay + '';
					}).css('background', this.isTotalTaken ? 'rgba(0, 173, 255, 0.5)' : 'rgba(255,0,0,0.5)');

				});

			}).always(function() {
				$('[data-handler="next"], [data-handler="prev"]').on('click', function() {
					viewModel.loadCalendarColors();
				});
				// $('[data-handler="prev"]').on('click', function() {
				// debugger;
				// viewModel.loadCalendarColors();
				// });

			});
		},

		loadDayReminders : function(time) {
			viewModel.currentDate(dateFormat(time, 'd " de " mmmm'));
			viewModel.loadCalendarColors();
			models.CustomerActions.getIntakesByDate(time).done(function(response) {
				viewModel.dayReminders(response);
			});
		},

		changeIntake : function() {
			this.intake(!this.intake());
			this.intakeTimeTake = new Date().getTime();
			this.intakeTimeTakenText(dateFormat(this.intakeTimeTake, 'dddd d " a las " H:MM'));
			viewModel.updateIntake(this);
		},

		updateIntake : function(intakeData) {
			intakeData.intakePostponed('0');
			models.CustomerActions.updateIntake(intakeData).done(function() {
				viewModel.loadCalendarColors();
			});
		}

	};

	$page.on('pagebeforecreate', function() {

		$page.find("#datepicker").datepicker({
			dateFormat : 'mm/dd/yy',
			monthNames : [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
			onSelect : function(dateText, inst) {
				viewModel.loadDayReminders(new Date(dateText).getTime());
			},
			onChangeMonthYear : function(year, month, inst) {
				$page.find('[data-role="listview"]').html("");
				var selectedMonth = month;
				if (selectedMonth < 10) {
					selectedMonth = "0" + selectedMonth;
				} else {
					selectedMonth += "";
				}
				// viewModel.loadDayReminders(selectedMonth, year, null);
			},

			defaultDate : new Date()
		});

		$page.find("#datepicker").datepicker("option", "dayNamesMin", [ "Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab" ]);

	}).on('pageshow', function() {

		ko.applyBindings(viewModel, $page[0]);
		var thisDate = new Date();
		viewModel.loadDayReminders(new Date((thisDate.getMonth() + 1) + "/" + thisDate.getDate() + "/" + thisDate.getFullYear()).getTime());
		viewModel.loadCalendarColors();

	});

})(jQuery);
