//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function($) {
	'use strict';

	var $page = $($('script').last()).closest('[data-role="page"]');

	var viewModel = {

		reminders : ko.observableArray([]),

		addReminder : function() {
			$(':mobile-pagecontainer').pagecontainer('change', 'app/views/reminder-new.html');
		}

	};

	$page.on('pagebeforecreate', function() {

		models.CustomerActions.getReminders().done(function(response) {
			viewModel.reminders(response);
			$('#reminders-list').listview('refresh');
		});

		ko.applyBindings(viewModel, $page[0]);

	}).on('pageshow', function() {

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);

		var sm = pageUrl.param('sm') || documentUrl.param('sm');

		if (sm != undefined) {

			console.log('XXX js reminders sm ' + sm);
			var reminderMsg = sm == '1' ? 'Recordatorio creado exitosamente' : sm == '2' ? 'Recordatorio pospuesto' : sm == '3' ? 'Se pueden agendar 64 tomas como máximo, el resto de tomas se han descartado' : sm == '4' ? 'No es posible crear mas de 64 alarmas entre todos tus recordatorios, por favor considera eliminar recordatorios anteriores antes de crear uno nuevo.' : 'Recordatorio no agendado'

			if (sm == '1') {
				showMessageText(reminderMsg);
			} else {
				showMessageTextClose(reminderMsg);
			}

			// $.mobile.loading("show", {
			// text : sm == '1' ? 'Recordatorio creado exitosamente' : sm == '2'
			// ? 'Recordatorio pospuesto' : 'Recordatorio no agendado',
			// textVisible : true,
			// textonly : true,
			// theme : 'b'
			// });
			// setTimeout(function() {
			// $.mobile.loading("hide");
			// }, 3000);
		}

	});

})(jQuery);