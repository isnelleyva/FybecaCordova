//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#search-contact'), timer;
	var $reminder = $('#reminder-form');
	var $form = $('#reminder');
	$page.on('pageinit', function(e, data) {
		try {
			$page.find('[data-type="search"]').on('keypress change', function() {
				$self = $(this);
				clearTimeout(timer);
				timer = setTimeout(function() {
					searchContact($self.val());
				}, 300);
			});
			$page.find('#search-list').listview('option', 'filterCallback', function(text, search) {
				return false;
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}).on('pageshow', function(e, data) {
		try {
			setDoctor({
				doctor_name : '',
				doctor_phone : null
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}).on('tap', '[data-action="select-contact"]', function(e) {
		try {
			e.preventDefault();
			var reminder = {
				doctor_name : $(this).data('name'),
				doctor_phone : $(this).data('phone')
			}
			setDoctor(reminder);
			$(':mobile-pagecontainer').pagecontainer('change', 'reminder-form.html');
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	});
	function searchContact(keyword) {
		try {
			if ($.trim(keyword) != '') {
				$.mobile.loading('show', {
					text : 'Cargando',
					textVisible : true,
					theme : 'b'
				});
				var options = new ContactFindOptions();
				options.filter = keyword; // empty search string returns all
											// contacts
				options.multiple = true; // return multiple results
				options.limit = 10; // limit results to 10 contacts
				filter = [ "displayName" ];
				navigator.contacts.find([ 'name', 'phoneNumbers' ], findContactSuccess, findContactError, options);
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function findContactSuccess(contacts) {
		try {
			var list = [];
			var displayedContacts = 0;
			$.each(contacts, function() {
				if (this.name && this.phoneNumbers) {
					var contact = this;
					var displayName = (this.name.givenName || '') + ' ' + (this.name.familyName || '');
					list.push('<li data-role="list-divider">' + displayName + '</li>');
					$.each(contact.phoneNumbers, function() {
						list.push('<li><a data-action="select-contact" data-name="' + displayName + '" data-phone="' + this.value + '">' + this.value + ' (' + this.type + ')</a></li>');
					});
					displayedContacts++;
				}
			});
			if (displayedContacts > 0) {
				$page.find('#search-list').html(list.join('')).listview('refresh');
			} else {
				$page.find('#search-listt ul').html('<li>No se han encontrado resultados</li>').listview('refresh');
			}
			$.mobile.loading('hide');
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function findContactError(contactError) {
		try {
			console.log(contactError);
			$.mobile.loading('hide');
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function setDoctor(reminder) {
		try {
			$form.find('[name="doctor_name"]').val(reminder.doctor_name);
			$form.find('[name="doctor_phone"]').val(reminder.doctor_phone);
			$reminder.find('#doctor-label').text(reminder.doctor_name);
			$('#doctor [name="doctor_name"]').val(reminder.doctor_name);
			$('#doctor [name="doctor_phone"]').val(reminder.doctor_phone);
			if (reminder.doctor_phone && $.trim(reminder.doctor_phone) != '') {
				$reminder.find('#doctor-call').show().attr('href', 'tel:' + reminder.doctor_phone);
			} else {
				$reminder.find('#doctor-call').hide();
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
})();