//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#reminder-form-interval');
	var $reminder = $('#reminder-form');
	var $form = $reminder.find('#reminder');
	$page.on('pageinit', function() {
		try {
			$page.find('form').on(
					'submit',
					function(e) {
						e.preventDefault();
						switch ($(this).data('action')) {
						case 'set-interval':
							setRepeat($(this).serializeObject());
							$(':mobile-pagecontainer').pagecontainer('change',
									'reminder-form.html');
							break;
						}
					});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	});
	function setRepeat(repeat) {
		try {
			debugger;
			data.reminderRepeat = repeat;
			data.reminderRepeat.repeatLabel = $page.find('[name="interval"] option:selected').text();
			// $form.find('[name="repeat_type"]').val(repeat.repeat_type);
			// $form.find('[name="interval"]').val(repeat.interval);
			// $form.find('[name="hours"]').val(repeat.hours);
			// $form.find('[name="days"]').val(repeat.days);
			// $form.find('#repeat-label').text(
			// $page.find('[name="interval"] option:selected').text());
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function bindForm() {
		try {
			$page.find('[name="interval"]').val(
					$form.find('[name="interval"]').val());
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
})();