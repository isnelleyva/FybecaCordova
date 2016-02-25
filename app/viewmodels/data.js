(function($) {

	window.data = {

		maskedCustomerMail : '',

		customerSecurityQuestion : '',

		customerTemporalId : '',

		gaId : 'UA-33601223-7',

		defaultErrorMsg : 'Estamos teniendo inconvenientes, por favor intenta mas tarde',

		reminderData : {
			name : '',
			medicine : ''
		},

		vitalcardCategoryName : 'Todos los establecimientos',

		questions : ko.observableArray([]),

		cities : ko.observableArray([]),

		neighborhoods : ko.observableArray([]),

		addressTypes : ko.observableArray([]),

		state : {
			selectedCity : ko.observable(),
			selectedCityName : '',
			selectedAddresType : ko.observable()
		},

		urlToReturnFromClubs : '',

		urlToReturnFromCart : '',

		urlToReturnFromMap : '',

		urlToReturnFromProduct : '',

		urlToReturnFromVitalcardSearchMap : '',

		months : [ {
			value : '01',
			label : 'Enero'
		}, {
			value : '02',
			label : 'Febrero'
		}, {
			value : '03',
			label : 'Marzo'
		}, {
			value : '04',
			label : 'Abril'
		}, {
			value : '05',
			label : 'Mayo'
		}, {
			value : '06',
			label : 'Junio'
		}, {
			value : '07',
			label : 'Julio'
		}, {
			value : '08',
			label : 'Agosto'
		}, {
			value : '09',
			label : 'Septiembre'
		}, {
			value : '10',
			label : 'Octubre'
		}, {
			value : '11',
			label : 'Noviembre'
		}, {
			value : '12',
			label : 'Diciembre'
		}, ],

		temporalPharmacies : [],

		temporalLatitude : '',

		temporalLongitude : '',
		
		isProccesingCheckout : false

	};

	window.configuration = {

		datetimePickerOptions : {
			theme : 'jqm',
			display : 'modal',
			mode : 'scroller',
			dayNames : [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ],
			dayNamesShort : [ 'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab' ],
			monthNames : [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
			monthNamesShort : [ 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic' ],
			yearText : 'Año',
			monthText : 'Mes',
			dayText : 'Día',
			hourText : 'Hora',
			minuteText : 'Minutos',
			cancelText : 'Cancelar',
			setText : 'Aceptar',
			dateFormat : 'mm/dd/yy',
			dateOrder : 'ddmmyy',
			timeWheels : 'HHii',
			timeFormat : 'HH:ii',
			preset : 'datetime',
			minDate : new Date()
		},

	};

	data.state.selectedCity.subscribe(function(city) {

		try {
			$.each(data.cities(), function() {
				if (this.value == city) {
					data.state.selectedCityName = this.label;
				}
			});
		} catch (e) {
			// TODO: handle exception
		}

		try {
			if (navigator.connection.type == Connection.NONE) {
				showMessageText('En este momento no posees conexión a internet, verifica tu conexión y vuelve a intentarlo');
				return;
			}
		} catch (err) {
		}

		$('select[name="neighborhood"], select[name="neighborhoodB"], select[name="neighborhoodS"]').selectmenu('disable');

		$.mobile.loading("show", {
			text : 'Consultando barrios',
			textVisible : true,
			theme : 'b'
		});

		data.neighborhoods.removeAll();

		models.DataRequests.getNeigborhoods(city).done(function(data) {

			window.data.neighborhoods(data);
			$('select[name="neighborhood"], select[name="neighborhoodB"], select[name="neighborhoodS"]').selectmenu('enable');
			$.mobile.loading("hide");

		});

		try {
			// $('.pharmacyMapButton').css('display', '');
			$('.pharmacyMapButton').removeClass('ui-btn ui-btn-icon-right ui-icon-carat-r');
		} catch (e) {
			// TODO: handle exception
		}

	});

	window.goToCart = function() {
		$(':mobile-pagecontainer').pagecontainer('change', 'my-cart.html');
	};

	window.goToCartOut = function() {
		$(':mobile-pagecontainer').pagecontainer('change', '/app/views/my-cart.html');
	};

	window.getPathToTrack = function() {
		var currPage = $.mobile.activePage.attr('id');
		var currUrl = window.location.href;
		var splitedUrl = currUrl.split('?');
		var pageToTrack = currPage + '.html';
		if (splitedUrl.length > 1) {
			pageToTrack += '?' + splitedUrl[1];
		}
		return pageToTrack;
	};

})(jQuery);