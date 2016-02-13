//  Copyright Â© 2013 BAYTEQ. All rights reserved.

//Url acceso servicios producción

var svf = 'https://mapp02.fybeca.com/WebApplicationMovilGPF/resources/Generales/';
var svb = 'https://mapp01.fybeca.com/FybecaApi/api/';

var gaPlugin;

// Variables
var db;
var dbProcessesCalled = 0;
var dbProcessesSuccess = 0;
var dbProcessesExecuted = [];
var ajaxTimeout = 60000;
var debug = false;
var refreshPlacesDistance = 10; // En Metros
var facebook_access_token;
var facebook_expires_in;
var facebook_app_id = 179899325485210;
var facebook_redirect_uri = 'https://www.facebook.com/connect/login_success.html';// 'https://www.facebook.com/fybeca';
var cerrarSesionFacebook = false; // Indica si luego de interactuar con
// facebook es necesario cerrar la sesion
// abierta, util en inicio de sesión
var isSharePopOpen = false;
var returnToVitalcardPage = false;
var llamadasSeguras = true; // Permite seleccionar si las llamadas a servicios
// se hacen con seguridad o no
var wasSharedGoogle = false;
var carrier = "";
var version = "2.0.43";

var isComingFromClubs = false;
var isComingFromProducts = false;
// var isNeededActivateButtons=false;

var social_profile_fb = 'http://www.facebook.com/fybeca';
var social_profile_gp = 'http://plus.google.com/app/basic/117908549674250458433';
var social_profile_tw = 'https://mobile.twitter.com/fybeca';
var social_profile_fs = 'https://es.foursquare.com/fybeca';
var social_profile_pi = 'http://www.pinterest.com/fybeca';

var facebook_graph_api = 'https://graph.facebook.com/';
var facebook_default_image_event = 'https://mapp01.fybeca.com/FybecaService/Images/generic_event.png';
var facebook_default_image_prom = "https://mapp01.fybeca.com/FybecaService/Images/thumb_share_fyb.png";
var facebook_default_image_red_vc = "https://mapp01.fybeca.com/FybecaService/Images/thumb_redvitalcard.png";
var google_access_token;
var google_expires_in;
var google_apis = 'https://www.googleapis.com/oauth2/v1/';
var google_auth_uri = 'https://accounts.google.com/o/oauth2/auth';
var google_redirect_uri = 'https://www.corporaciongpf.com/appm/success.html';
var google_client_id = '916554996593.apps.googleusercontent.com';
var twitter_redirect_uri = 'https://mobile.twitter.com/fybeca';
var scrollerOptions = {
	theme : 'jqm',
	display : 'modal',
	mode : 'scroller',
	dayNames : [ 'Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado' ],
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
	timeFormat : 'HH:ii'
};
var defaultMapCenter;
var defaultMapZoom = 15;
var defaultErrorMsg = 'Lo sentimos, su petición no puede ser procesada.\n\nPor favor, verifique que tiene acceso a internet, navegando a cualquier página en su navegador y luego intentelo de nuevo.';
var defaultEmail = 'grecetas@corporaciongpf.com'; // Correo al que se enviaran
// las recetas
var deferShowReminder = null;
var maxDistance = 3; // Distancia máxima por default para las consultas por
// cercanía

var pharmacy_lat; // Latitud de farmacia
var pharmacy_lon; // Longitud de farmacia
var pharmacy_distance; // distancia hacia farmacia

var push_message;
var prom_vc_loaded = false;

var parameters = {
	session : false,
	codigoAplicacion : ''
};

var persona = {
	tipoId : 'C',
	id : '',
	codigoPersona : '',
	primerNombre : '',
	segundoNombre : '',
	primerApellido : '',
	segundoApellido : '',
	email : '',
	celular : '',
	fijo : '',
	genero : '',
	facebookLink : '',
	fechaNacimiento : 0
};

facebook_post_parameters = {
	link : '',
	picture : '',
	caption : '',
	name : '',
	description : ''
};

var loadNetworkVitalcard = false; // Determina si se carga cadenas o
// establecimientos en los detalles de
// establecimiento

// Variable tiempo expiracion cache
var promotionsCacheTimeout = 15 * 24 * 60 * 60 * 1000; // Obtener imagenes de
// promociones en
// vitalpuntos, cada 15
// dias
var obtenerVitalpuntosCacheTimeout = 10 * 60 * 1000; // Obtener puntos en
// vitalpuntos, cada
// 10 minutos
var defaultCacheTimeout = 60 * 60 * 1000; // Cache por defecto de 1 minuto,

var obtenerClubesMisBeneficiosCacheTimeout = 10 * 60 * 1000; // 10 minutos,
// se usa en Mis
// beneficios
var obtenerClubOtrosBeneficiosCacheTimeout = 24 * 60 * 60 * 1000; // 1 dia, se
// usa
// en otros
// beneficios
var obtenerItemsPorClubYProductoCacheTimeout = 60 * 60 * 1000; // 1 minuto, en
// presentaciones
// por producto
// y club
var pharmaciesCacheTimeout = 5 * 24 * 60 * 60 * 1000; // 5 dias, se
// usa en
// farmacias
var detalleProductoCacheTimeout = 15 * 24 * 60 * 60 * 1000; // 15
// dias,
// Vademecum

var categoriasCacheTimeout = 30 * 24 * 60 * 60 * 1000; // 30 dias, en
// categorias de
// mapa y de
// filtros,
// vitalcard
var categoriasCacheTimeout = 30 * 24 * 60 * 60 * 1000; // 30 dias, en
// categorias de
// mapa y de
// filtros,
// vitalcard
var ciudadesCacheTimeout = 30 * 24 * 60 * 60 * 1000; // 30 dias, en
// ciudades,
// vitalcard
var establishmentsFilterCacheTimeout = 24 * 60 * 60 * 1000; // 1 dia, resultados
// de
// busqueda por filtros
// Vitalcard
var establishmentsDetailCacheTimeout = 24 * 60 * 60 * 1000; // 1 dia, resultados
// de
// busqueda por filtros
// Vitalcard
var obtenerCiudadesEventoCacheTimeout = 15 * 24 * 60 * 60 * 1000; // 15
// dias,
// Ciudades
// de
// eventos
var obtenerEventosCiudadCacheTimeout = 24 * 60 * 60 * 1000; // 1
// día,
// eventos
// por
// ciudad
var obtenerEventoCacheTimeout = 24 * 60 * 60 * 1000; // 1 día,
// informacion
// de evento

var GetPromotionCacheTimeout = 60 * 60 * 1000; // 1 minuto para promociones

var GetLogoImageCacheTimeout = 15 * 24 * 60 * 60 * 1000; // 15 días para las
// imágenes de logos
var buyersGuideCacheTimeout = 7 * 24 * 60 * 60 * 1000; // 1 semana, guia de
// compras

// Variables que se deberian pasar entre paginas
var product_type_id = "";
var product_type_name = "";
var category_id = "";
var category_name = "";
var sub_category_id = "";
var sub_category_name = "";
var isCommingFromCat2 = false;
var product_id = "";
var product_name = "";
var presentation_id = "";
var presentation_name = "";
var presentation_minStock = -1;
var presentation_defaultMinStock = 5;
var presentation_unit = 'C';
var presentation_units = "";
var presentation_price;
var pharmacy_id = "";
var pharmacy_name = "";
var reminder_id = null;
var reminder_ids = [];
var reminder_take_time = null;
var reminder_flag;

var establishment_id = "";
var loadDirections = false;
var isCategoriesLoaded = false; // Determina si el menu de categorias presente
// en index esta ya cargado, para no volverlo a
// cargar y evitar un conflicto
var pageToReturn = ""; // Debido a que el formurlario de selección de
// categoria es usado por dos ventanas
// distintas, esta variable define a que ventana
// tiene que regresar cuando se pulse el boton
// "Atras"
var establishment = {
	id : '',
	name : '',
	benefits : '',
	services : '',
	logoId : ''
}
var categoryCode = "";
var cityCode = "";
var cityName = "";
var codeLastNetwork = "-1";
var loadNetworks = false;

var codeLastProm = '-1';
var loadPromotionsGen = false;

var codeLastPromPer = '-1';
var loadPromotionsPer = false;

var auxLastClubId = '';
var auxLastProductId = '';
var club_id = '';
var club_name = "";
var myClubOption = '';
var listAux = [];
var clear_club_search = true;

var event_id = '';
var event_name = '';
var event_description = '';
var event_selected_date = '';

var cambiaPassTemporal = false; // Si es false, cuando actualiza el password
// pide el pass anterior, si es true, no pide el
// pass anterior
var passTemporal = '';

var clear_product_category_serch = true;

var errorMessage = 'Por el momento no podemos atender su petición. Espere unos minutos y vuelva a intentar.';
var badResponseMessage = 'Respuesta del servicio no pudo ser procesada.';
var errorMessageShare = 'Al momento no se ha podido compartir esta información. Espere unos minutos y vuelva a intentar.';

// Maps
var iconMarkerShape;
var iconVCShadow; // Sombra para establecimientos vitalcard
var iconMarkerShadow;
var iconMarkerRed;
var iconMarkerOrange;
var iconMarkerBlue;
var iconMarkerGreen;
var iconCurrentPosition;
var iconCurrentPositionShape;

// Share
var promotionShareUrlBase = 'https://mapp01.fybeca.com/FybecaApi/PromotionShare/GetDetail';
var promotionImageShareUrlBase = 'https://mapp01.fybeca.com/FybecaService/Image.ashx';
var networkShareUrlBase = 'https://mapp01.fybeca.com/FybecaApi/VCNetworkShare/GetDetail';
var eventShareUrlBase = 'https://mapp01.fybeca.com/FybecaApi/EventShare/GetDetail';

if (navigator.userAgent.indexOf('iPhone') > -1) {
	var deviceType = 'IP';
} else if (navigator.userAgent.indexOf('Android') > -1) {
	var deviceType = 'AND';
} else if (navigator.userAgent.indexOf('Blackberry') > -1) {
	var deviceType = 'BB';
} else {
	var deviceType = -1;
}

$(document).on('pageshow', function(e) {
	// Track page navigation
	var path = getPathToTrack();
	path = (path == '') ? 'index.html' : path;
	// console.log('page showed: ' + path);

	if (window.plugins && typeof window.plugins.gaPlugin != 'undefined') {
		window.plugins.gaPlugin.trackPage(function(result) {
			// console.log('X-X-X-X gaPlugin success: ' + result);
		}, function(error) {
			// console.log('X-X-X-X gaPlugin fail: ' + error);
		}, path);
		// console.log('X-X-X-X gaPlugin track: ' + path);
	}

}).on('deviceready', function() {

	$.ajaxSetup({
		cache : true
	});

	try {
		if (device.platform == 'Android') {
			// Fixes for Android 2.* bugs
			if (device.version.indexOf('2') == 0) {
				// Slide transition do page flick or blink, bug
				// fixed at 4.4 version
				$.mobile.defaultPageTransition = 'none';
			}

			// Fixes for Android 4.0.*, 4.1.* bugs
			if (device.version.indexOf('4.0') == 0 || device.version.indexOf('4.1') == 0 || device.version.indexOf('4.2') == 0 || device.version.indexOf('4.3') == 0) {
				// Fix for input type number for Android 4.0,
				// 4.1, bug fixed at 4.2.2 version
				$(document).on('pageinit', function(e) {
					$("input[type='number']").each(function(i, el) {
						el.type = "text";
						el.onfocus = function() {
							this.type = "number";
						};
						el.onblur = function() {
							this.type = "text";
						};
					});
				});

				// Slide transition do page flick or blink, bug
				// fixed at 4.4 version
				$.mobile.defaultPageTransition = 'none';
			}
		} else if (device.platform == 'iOS') {
			$('body').addClass('ios');
			// $('head').append('<link rel="stylesheet"
			// href="themes/default/baseIos.css" type="text/css" />');
		}

		$.getScript('scripts/cordova/carrierName.js', function() {

			window.carrierName.getCarrier({
				success : function(carrier1) {
					carrier = carrier1;
				},
				error : function(carrier) {

				}
			});

		});

		this.addEventListener("backbutton", function(e) {
			if (debug)
				alert('backbutton');
			if ($.mobile.activePage.is('#product-quantity')) {
				if (debug)
					alert('product-quantity');
				$.mobile.changePage('presentation-near.html');
			} else if ($.mobile.activePage.is('#reminder-form-hours')) {
				if (debug)
					alert('reminder-form-hours');
				$.mobile.changePage('reminder-form.html');
			} else if ($.mobile.activePage.is('#reminder-form-interval')) {
				if (debug)
					alert('reminder-form-interval');
				$.mobile.changePage('reminder-form-interval.html');
			}

			else if ($.mobile.activePage.is('#menu-mifybeca')) {
				$.mobile.changePage('index.html');
			} else if ($.mobile.activePage.is('#user-login')) {
				$.mobile.changePage('index.html');
			} else if ($.mobile.activePage.is('#menu-offers')) {
				$.mobile.changePage('index.html');
			} else if ($.mobile.activePage.is('#explore-promotions')) {
				if (isSharePopOpen) {
					navigator.app.backHistory();
					isSharePopOpen = false;
				} else {
					$.mobile.changePage('index.html#menu-offers');
				}
			} else if ($.mobile.activePage.is('#explore-my-promotions')) {
				$.mobile.changePage('index.html#menu-offers');
			} else if ($.mobile.activePage.is('#menu-maps')) {
				$.mobile.changePage('index.html');
			}

			else if ($.mobile.activePage.is('#explore-products-products')) {
				try {
					if (isCommingFromCat2) {
						$.mobile.changePage('explore-products-categories.html');
					}
				} catch (e) {
					$.mobile.changePage('explore-products-subcategories.html');
				}
			} else if ($.mobile.activePage.is('#explore-products-subcategories')) {
				$.mobile.changePage('explore-products-categories.html');
			} else if ($.mobile.activePage.is('#explore-products-categories')) {
				$.mobile.changePage('explore-products.html');
			} else if ($.mobile.activePage.is('#search-products')) {
				$.mobile.changePage('../../index.html');
			} else if ($.mobile.activePage.is('#explore-products')) {
				$.mobile.changePage('index.html');
			}

			else if ($.mobile.activePage.is('#reminders')) {
				$.mobile.changePage('index.html');
			} else if ($.mobile.activePage.is('#send-prescription')) {
				$.mobile.changePage('index.html');
			} else if ($.mobile.activePage.is('#push-message-detail')) {
				location.href = 'index.html';
			} else if ($.mobile.activePage.is('#events-calendar')) {
				$.mobile.changePage('index.html');
			} else if ($.mobile.activePage.is('#social-networks')) {
				$.mobile.changePage('index.html');
			} else if ($.mobile.activePage.is('#reminders-calendar')) {
				$.mobile.changePage('index.html');
			} else if ($.mobile.activePage.is('#product-detail')) {
				// if(isComingFromProducts){
				$.mobile.changePage('search-products.html');
				// }else{
				// $.mobile.changePage('explore-products-products.html');
				// }
			} else if ($.mobile.activePage.is('#reminders')) {
				$.mobile.changePage('index.html');
			} else if ($.mobile.activePage.is('#search-on-club') || $.mobile.activePage.is('#explore-another-benefits')) {
				if (isAuth()) {
					$.mobile.changePage('show-benefits-per-person.html');
				} else {
					$.mobile.changePage('medication-clubs.html');
				}
			} else if ($.mobile.activePage.is('#product-info') || $.mobile.activePage.is('#presentation-info-nm')) {
				if (isComingFromClubs) {
					$.mobile.changePage('search-on-club-items.html');
				} else {
					$.mobile.changePage('product-detail.html');
				}
			} else if ($.mobile.activePage.is('#search-on-club-items')) {
				$.mobile.changePage('search-on-club.html');
			}

			else if ($.mobile.activePage.is('#reminder-view')) {
				if (navigator.userAgent.indexOf('Android') > -1) {
					location.href = 'index.html';
				} else {
					$.mobile.changePage('index.html');
				}
			}

			else if ($.mobile.activePage.is('#explore-another-benefits')) {
				$.mobile.changePage('medication-clubs.html');
			} else if ($.mobile.activePage.is('#explore-my-benefits')) {

				if (returnToVitalcardPage) {
					$.mobile.changePage('index.html#menu-vitalcard');
				} else {
					$.mobile.changePage('index.html#menu-offers');
				}

			} else if ($.mobile.activePage.is('#medication-clubs')) {
				$.mobile.changePage('index.html#menu-offers');
			} else if ($.mobile.activePage.is('#show-benefits-per-person')) {
				$.mobile.changePage('explore-my-benefits.html');
			} else if ($.mobile.activePage.is('#menu-vitalcard')) {
				$.mobile.changePage('index.html#menu-mifybeca');
			} else if ($.mobile.activePage.is('#index')) {
				e.preventDefault();
				navigator.app.exitApp();
			}
			// NUEVAS
			else if ($.mobile.activePage.is('#user-addresses-list')) {
				// $.mobile.changePage('../../index.html#menu-mifybeca');

				$(':mobile-pagecontainer').pagecontainer('change', '../../index.html#menu-mifybeca', {
					reverse : true
				});

			} else if ($.mobile.activePage.is('#user-addresses-add')) {
				// $.mobile.changePage('../../index.html#menu-mifybeca');

				$(':mobile-pagecontainer').pagecontainer('change', '../../index.html#menu-mifybeca', {
					reverse : true
				});

			} else if ($.mobile.activePage.is('#orders-history')) {
				// $.mobile.changePage('../../index.html#menu-mifybeca');

				$(':mobile-pagecontainer').pagecontainer('change', '../../index.html#menu-mifybeca', {
					reverse : true
				});

			} else if ($.mobile.activePage.is('#order-detail')) {
				// $.mobile.changePage('../../index.html#/app/views/orders-history.html');

				$(':mobile-pagecontainer').pagecontainer('change', 'orders-history.html', {
					reverse : true
				});

			} else if ($.mobile.activePage.is('#my-cart')) {
				// $.mobile.changePage('../../index.html');

				$(':mobile-pagecontainer').pagecontainer('change', '../../index.html', {
					reverse : true
				});

			} else if ($.mobile.activePage.is('#checkout-user-data')) {
				// $.mobile.changePage('../../index.html#/app/views/my-cart.html');

				$(':mobile-pagecontainer').pagecontainer('change', 'my-cart.html', {
					reverse : true
				});

			} else if ($.mobile.activePage.is('#checkout-payment')) {

				$(':mobile-pagecontainer').pagecontainer('change', 'checkout-user-data.html', {
					reverse : true
				});

			} else if ($.mobile.activePage.is('#checkout-summary')) {
				if (data.isProccesingCheckout) {

					$.mobile.loading("show", {
						text : 'No puedes regresar mientras se esta procesando la orden...',
						textVisible : true,
						theme : 'b'
					});

					setTimeout(function() {
						$.mobile.loading("show", {
							text : 'Pagando, este proceso puede tomar unos minutos',
							textVisible : true,
							theme : 'b'
						});
					}, 3000);

				} else {
					$(':mobile-pagecontainer').pagecontainer('change', 'checkout-payment.html', {
						reverse : true
					});
				}
			} else if ($.mobile.activePage.is('#checkout-confirm')) {
				$(':mobile-pagecontainer').pagecontainer('change', 'orders-history.html', {
					reverse : true
				});
			} else if ($.mobile.activePage.is('#pharmacy-detail')) {
				$(':mobile-pagecontainer').pagecontainer('change', '../../search-places.html?l=n', {
					reverse : true
				});
			} else if ($.mobile.activePage.is('#reminder-new')) {
				try {
					$('#dpBegin, #dpRepeatHour, #dpEndDate').scroller('hide');
				} catch (e) {
					console.log(e);
				}
				$.mobile.changePage('../../reminders.html');
				// checkout-payment.html
			} else {
				navigator.app.backHistory();
			}
		}, false);

		parameters.codigoAplicacion = device.uuid;
		getCommands();
		if (debug) {
			showMessage('Cordova inicializado.');
		}

		if (!localStorage.getItem('pushInstalled')) {
			debugger;
			$.ajaxSetup({
				cache : true
			});
			$.getScript('scripts/cordova/PushNotification.js', function() {
				if (!localStorage.getItem('token')) {
					window.pushNotification.getToken({
						success : function(token) {

							if (token) {
								localStorage.setItem('token', token);
								registerPushToken(token);
								if (debug)
									showMessage(token);
							}
						},
						error : function(error) {
							if (debug)
								showMessage(error);
						}
					});
				} else {
					registerPushToken(localStorage.getItem('token'));
				}
			});
		}

		if (deviceType == 'IP') {
			$(document).on('tap', '[href="tel:*1010"]', function(e) {
				e.preventDefault();
				window.phoneCall.makeCall('1800-392-322');
			});
		}
		// Para version de Cordova menor a 2.2
		if (typeof navigator.connection == 'undefined') {
			navigator.connection = navigator.network.connection;
		}

		if (typeof Cordova !== "undefined" && deviceType == 'AND') {
			$.getScript('scripts/cordova/NativeNotification.js', function() {
				if (debug)
					console.log("Llamar al plugin NativeNotification");
				window.nativeNotification.getNotificationInfo({
					success : function(info) {
						console.log("Info: " + info);
						if (info) {
							var infoDetail = info.split("|");
							// Recordatorio
							if (infoDetail.length > 2) {
								if (debug)
									console.log("Llamar a showReminder");
								showReminder(infoDetail[1], infoDetail[2]);
							}
							// Notificación
							// Push
							else {
								console.log("Llamar a showPushMessage");
								showPushMessage(infoDetail[1]);
							}
						}
					},
					error : function(error) {
						if (debug)
							console.log(error);
					}
				});
			});
		}

		cordova.exec(null, null, "SplashScreen", "hide", []);

	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
		cordova.exec(null, null, "SplashScreen", "hide", []);
	}

	try {

		gaPlugin = window.plugins.gaPlugin;
		gaPlugin.init(function(result) {
			console.log('XXXXXXXXXXX gaPlugin init: ' + result);
		}, function(error) {
			console.log('XXXXXXXXXXX gaPlugin fail: ' + error);
		}, data.gaId, 10);

	} catch (e) {
		console.log('error GA ' + gaPlugin);
	}

});

$(document).on('mobileinit', function() {

	$('.homeOverlay').on('click', function() {
		$('.homeOverlay').css('opacity', '0');
		setTimeout(function() {
			$('.homeOverlay').css('display', 'none');
		}, 1000);
	});

	try {
		// Inicialización de app
		$.extend($.mobile, {
			defaultPageTransition : 'slide',
			defaultDialogTransition : 'none',
			pushStateEnabled : false,
		// phonegapNavigationEnabled : true
		});
		$.extend($.mobile.page.prototype.options, {
			backBtnText : "Atrás",
			domCache : false,
			addBackBtn : true
		});
		$.mobile.buttonMarkup.hoverDelay = 100;

		db = openDatabase('db', '1.0', 'Fybeca', 5 * 1024 * 1024);

		if (!localStorage.getItem('databaseInstalled')) {
			runSql('install/db.sql', 'Creación de base de datos');
			runSql('install/products.sql', 'Ingreso de productos');
			runSql('install/product_types.sql', 'Ingreso de tipos de producto');
			runSql('install/categories.sql', 'Ingreso de categorias');
			runSql('install/sub_categories.sql', 'Ingreso de sub-categorias');
		}

		fillParameters();

		clearCache();

		deleteAuxiliarVars();

		localStorage.setItem('isCallsLoaded', false);

		// localStorage

		if (localStorage.getItem('questionsJson') == null) {
			models.DataRequests.getQuestions();
		} else {
			data.questions(JSON.parse(localStorage.getItem('questionsJson')));
		}

		if (localStorage.getItem('citiesJson') == null) {
			models.DataRequests.getCities();
		} else {
			data.cities(JSON.parse(localStorage.getItem('citiesJson')));
		}

		if (localStorage.getItem('addressTypesJson') == null) {
			models.DataRequests.getAddressTypes();
		} else {
			data.addressTypes(JSON.parse(localStorage.getItem('addressTypesJson')));
		}

		try {
			if (isAuth()) {

				customer.isAuthenticated(true);
				customer.isGuest(false);
				customer.selectedGuestCity(-1);
				customer.selectedGuestNeighborhood(-1);

				if (localStorage.getItem('codigoPersona') != null) {
					customer.code(localStorage.getItem('codigoPersona'));
					models.CustomerActions.getAddresses(localStorage.getItem('codigoPersona'));
				}
				if (localStorage.getItem('idPersona') != null) {
					customer.id(localStorage.getItem('idPersona'));
					models.cart.getItems(localStorage.getItem('idPersona'));
				}
				if (localStorage.getItem('nombrePersona') != null) {
					customer.name(localStorage.getItem('nombrePersona'));
				}
				if (localStorage.getItem('emailPersona') != null) {
					customer.email(localStorage.getItem('emailPersona'));
				}
			}
			if (localStorage.getItem('activePharmacies') == null) {
				models.CustomerActions.getActivePharmacies();
			}
		} catch (e) {
			console.log('ERROR loadItems on common');
		}

	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}

});

// $(document).bind("pageloadfailed", function(event, data) {
// event.preventDefault();
// showMessageText('NO HAY PÃ�GINA', 5000);
// data.deferred.resolve(data.absUrl, data.options, '../../index.html');
// });

// $(document).on('click', '.ui-bar-a .ui-title', function() {
// try {
// $.mobile.changePage($('#index'));
// } catch (err) {
// console.log(err.message);
// console.log(err.stack);
// }
// });

$.fn.serializeObject = function() {
	try {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [ o[this.name] ];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
};
$.fn.reset = function() {
	try {
		return this.each(function() {
			this.reset();
		});
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
};

(function($) {
	try {
		var o = $({});

		$.subscribe = function() {
			o.on.apply(o, arguments);
		};

		$.unsubscribe = function() {
			o.off.apply(o, arguments);
		};

		$.publish = function() {
			o.trigger.apply(o, arguments);
		};
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}(jQuery));

$(document).ajaxError(function(e, x, settings, exception) {
	try {
		if (settings.url != "https://www.google.com/accounts/Logout") {
			console.log('XXXX ERROR: ' + settings.url);
		} else {
			return;
		}
		var message;
		var statusErrorMap = {
			'400' : "Server understood the request but request content was invalid.",
			'401' : "Unauthorised access.",
			'403' : "Forbidden resouce can't be accessed.",
			'404' : "Page not found.",
			'500' : "Internal Server Error.",
			'503' : "Service Unavailable."
		};
		if (x.status != undefined && x.status != null) {
			message = statusErrorMap[x.status];
			if (!message && x.getResponseHeader("Content-Type") != null && x.getResponseHeader("Content-Type").indexOf('text/html') == -1) {
				message = exception.message;
			}
			if (!message) {
				message = "Unknow Error.";
			}
		} else if (e == 'parsererror') {
			message = "Error.\nParsing JSON Request failed.";
			$.mobile.loading('hide');
		} else if (e == 'timeout') {
			message = "Request Time out.";
			$.mobile.loading('hide');
		} else if (e == 'abort') {
			message = "Request was aborted by the server.";
			$.mobile.loading('hide');
		} else {
			message = "Unknow Error.";
			showMessageText('En este momentos nos encontramos con problemas en nuestra plataforma, por favor vuelve a intentarlo mas tarde', 10000);
		}
		console.log('XXXX ' + message);
		// showMessage(message, null, 'Mensaje');

	} catch (err) {
		debugger;
		console.log(err.message);
		console.log(err.stack);
	}
});

function ajaxError() {
	try {
		showMessage('No se pudo obtener la respuesta en el tiempo esperado.', null, 'Mensaje');
		$.mobile.loading('hide');
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}
function runSql(url, description) {
	try {
		dbProcessesCalled++;
		$.get(url).success(function(result) {
			var scripts = result.split(";");
			var successCount = 0;
			db.transaction(function(tx) {
				$.each(scripts, function(i) {
					var query = $.trim(this);
					if (query != '') {
						tx.executeSql(query, [], function(tx, results) {
							successCount++;
						}, function(tx, error) {
							console.log(error);
							console.log(String(query));
						});
					} else {
						scripts.splice(i, 1);
					}
				});
			}, function(error) {
				console.log(error);
			}, function() {
				if (successCount == scripts.length) {
					dbProcessesExecuted.push(description);
					if (debug)
						console.log(description);
					dbProcessesSuccess++;
				}
				if (dbProcessesCalled == dbProcessesSuccess) {
					localStorage.setItem('databaseInstalled', true);
				}
			});

		}).error(function(event, jqXHR, ajaxSettings, thrownError) {
			console.log(jqXHR);
		});
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function facebook_post() {
	try {
		var defaults = facebook_post_parameters;
		$.extend(defaults, (facebook_post_parameters || {}));
		dialog_url = 'https://www.facebook.com/dialog/feed?';
		dialog_url += "app_id=" + facebook_app_id;
		dialog_url += "&redirect_uri=" + facebook_redirect_uri;
		dialog_url += "&link=" + defaults.link;
		dialog_url += "&picture=" + defaults.picture;
		dialog_url += "&caption=" + encodeURIComponent(defaults.caption);
		dialog_url += "&name=" + encodeURIComponent(defaults.name);
		dialog_url += "&description=" + encodeURIComponent(defaults.description);
		window.plugins.childBrowser.showWebPage(dialog_url, {
			showLocationBar : true
		});

		window.plugins.childBrowser.onLocationChange = function(loc) {
			if (loc.indexOf(facebook_redirect_uri) == 0) {
				window.plugins.childBrowser.close();
			}
		};

	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}
function tweet(options) {
	try {

		var defaults = {
			text : '',
			url : '',
			via : ''
		}
		$.extend(defaults, (options || {}));
		dialog_url = 'https://twitter.com/intent/tweet?';
		dialog_url += "text=" + encodeURIComponent(defaults.text);
		dialog_url += "&url=" + defaults.url;
		dialog_url += "&via=" + defaults.via;
		window.plugins.childBrowser.showWebPage(dialog_url, {
			showLocationBar : true
		});
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}
function gplus_post(options) {
	try {
		var defaults = {
			url : '',
			hl : 'es'
		}
		$.extend(defaults, (options || {}));
		dialog_url = 'https://plus.google.com/share?';
		dialog_url += "url=" + defaults.url;
		dialog_url += "&hl=" + defaults.hl;

		window.plugins.childBrowser.showWebPage(dialog_url, {
			showLocationBar : true
		});
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

/**
 * @descritpion Función para generar un número rándomico en formato hexadecimal
 * @author Santiago Benítez
 * @param Objeto
 *            invokeAjaxObject url: Url a la cual se va invocar el servicio
 *            data: Objeto en el cual se envia la data que debe recibir el
 *            servicio cache: Objeto en el cual se puede enviar una "key" para
 *            el guardado en cache y un "time" para el tiempo de vida dataType:
 *            El tipo de data que se espera se recibirá del servicio, si no se
 *            le envía nada el default es jsonp success: función que se llama
 *            cuando la llamada al servicio es exitosa, esta devuelve la
 *            respuesta error: función cuando existe algún inconveniente al
 *            hacer la llamada al servicio, si no se envía por default llama a
 *            la función ajaxError complete: función que se llama una vez
 *            concluida la llamada al servicio, sin importar que esta sea o no
 *            exitosa
 */
function invokeAjaxService(options) {

	try {
		// variables
		var dataType;
		var ajaxObject;
		var cacheObject = null;
		var defaults = {
			url : null,
			service : null,
			data : null,
			cache : null,
			dataType : 'jsonp',
			success : null,
			error : null,
			complete : null,
			serviceName : null,
			retries : 0,
			showInternetUnavailable : true,
			isNeededActivateButtons : false
		};
		var invokeAjaxObject = $.extend({}, defaults, options);
		var hashMD5 = hex_md5(JSON.stringify(invokeAjaxObject.data));
		if (debug)
			console.log("Datos para hash: " + JSON.stringify(invokeAjaxObject.data));
		if (debug)
			console.log("Hash: " + hashMD5);
		if (debug)
			console.log("Datos Cache: " + JSON.stringify(invokeAjaxObject.cache));

		var key;

		if (localStorage.getItem('traceService') == true && localStorage.getItem('serviceName') == options.service) {

			var timeInit = new Date().getTime();

		}

		if (invokeAjaxObject) {

			if (invokeAjaxObject.cache) {
				if (invokeAjaxObject.cache.key)
					key = invokeAjaxObject.service + "_" + invokeAjaxObject.cache.key;
				else
					key = invokeAjaxObject.service + "_" + hashMD5;

				if (debug)
					console.log("Servicio con Cache");
				if (localStorage.getItem(key)) {
					if (debug)
						console.log("Encuentra item: " + key);
					cacheObject = JSON.parse(localStorage.getItem(key));
				} else {
					if (debug)
						console.log("No encuentra: " + key);
					cacheObject = [];
				}

				// Si existe el item en cache
				if (cacheObject) {
					var stime = new Date().getTime();
					if (stime < cacheObject.time) {
						if (invokeAjaxObject.success) {
							if (debug)
								console.log("Objeto cache: " + JSON.stringify(cacheObject.data.resp));
							invokeAjaxObject.success(cacheObject.data.resp);
						}
						if (invokeAjaxObject.complete) {
							invokeAjaxObject.complete();
						}
						return;
					} else {
						localStorage.removeItem(invokeAjaxObject.cache.key);
					}
				}
			}

			// Obtener el token de seguridad que serï¿½ enviado al servicio
			var params = {};
			params["url"] = invokeAjaxObject.url + invokeAjaxObject.service;
			var parameters = "";
			if (invokeAjaxObject.data != null) {
				for ( var p in invokeAjaxObject.data) {
					parameters += p + "=" + invokeAjaxObject.data[p] + "&";
				}
				parameters = parameters.substring(0, parameters.length - 1);
			}
			params["parameters"] = parameters;

			cordova.exec(function(result) {
				var objResult = $.parseJSON(result);
				// Agregar los nuevos parametros al servicio
				invokeAjaxObject.data.oauth_timestamp = objResult.oauth_timestamp;
				invokeAjaxObject.data.oauth_nonce = objResult.oauth_nonce;
				invokeAjaxObject.data.oauth_signature = objResult.oauth_signature;

				// Si no esta en cache
				if (navigator.network.connection.type != Connection.NONE) {
					dataType = invokeAjaxObject.dataType;
					$.ajax({
						timeout : ajaxTimeout,
						url : invokeAjaxObject.url + invokeAjaxObject.service,
						dataType : dataType,
						retries : 0,
						data : invokeAjaxObject.data,
						success : function(response) {

							if (invokeAjaxObject.success) {
								if (invokeAjaxObject.cache) {
									if (invokeAjaxObject.cache.key) {

									}
								}

								if (response != null) {
									// Validar la
									// estructura nueva
									// de servicios
									if (response.code != undefined) {
										// Si la
										// respuesta es
										// exitosa
										if (response.code == 0) {

											if (localStorage.getItem('traceService') && localStorage.getItem('serviceName') == options.service) { // Para
												// analizar
												// tiempos
												// de
												// servicio

												var callTime = new Date().getTime() - timeInit;
												if (localStorage.getItem('minTimeCall') == '0') {
													localStorage.setItem('minTimeCall', callTime);
													localStorage.setItem('maxTimeCall', callTime);
												} else if (callTime < parseInt(localStorage.getItem('minTimeCall'))) {
													localStorage.setItem('minTimeCall', callTime);
												} else if (callTime > parseInt(localStorage.getItem('maxTimeCall'))) {
													localStorage.setItem('maxTimeCall', callTime);
												}

												localStorage.setItem('countServiceCalls', (parseInt(localStorage.getItem('countServiceCalls')) + 1));
												localStorage.setItem('sumServiceCalls', (parseInt(localStorage.getItem('sumServiceCalls')) + callTime));

											}

											if (debug)
												console.log('Si devuelve');
											// Guardar
											// en el
											// cache
											if (invokeAjaxObject.cache) {

												if (invokeAjaxObject.cache.key)
													key = invokeAjaxObject.service + "_" + invokeAjaxObject.cache.key;
												else
													key = invokeAjaxObject.service + "_" + hashMD5;

												if (debug)
													console.log("Llamada exitosa");
												if (debug)
													console.log("Cache Key: " + key);
												localStorage.setItem(key, JSON.stringify({
													"time" : new Date().getTime() + invokeAjaxObject.cache.time,
													"data" : response,
													"service" : invokeAjaxObject.service,
													"key" : invokeAjaxObject.cache.key
												}));

											}
											$.mobile.loading('hide');
											invokeAjaxObject.success(response.resp);

										} else if (invokeAjaxObject.serviceName != undefined && invokeAjaxObject.serviceName == "GetLogin") {
											if (debug)
												console.log(invokeAjaxObject.serviceName);
											invokeAjaxObject.success(response);
										} else if (invokeAjaxObject.serviceName != undefined && invokeAjaxObject.serviceName == "GetRecoverPassword") {
											if (debug)
												console.log(invokeAjaxObject.serviceName);
											invokeAjaxObject.success(response);
										} else if (response.msgUsr != undefined) {
											if (debug)
												console.log("InvokeAjax");
											if (debug)
												console.log(response);
											showMessage(response.msgUsr, null, null);
											$.mobile.loading('hide');
											// if(isNeededActivateButtons){
											if (invokeAjaxObject.isNeededActivateButtons) {
												// isNeededActivateButtons=false;
												invokeAjaxObject.error(response.msgUsr, response.msgUsr, false);
											}
											// isNeededActivateButtons=false;

										} else {
											invokeAjaxObject.error(response.msgUsr, response.msgUsr);
											$.mobile.loading('hide');
										}

									} else {
										$.mobile.loading('hide');
										if (debug)
											console.log("Servicio sin la nueva estructura");
										showMessage(badResponseMessage, null, null);

									}

								}
								// Si la respuesta es
								// nula
								else {
									$.mobile.loading('hide');
									if (debug)
										console.log("Respuesta nula");
									showMessage(badResponseMessage, null, null);
								}

							}
						},
						error : function(e, message) {
							$.mobile.loading('hide');
							if (debug)
								console.log("Error llamada: " + message);
							if (debug)
								console.log(e);
							if (invokeAjaxObject.error) {
								invokeAjaxObject.error(e, message);
							} else {
								ajaxError();
							}
						},
						complete : function(object, message) {

							if (invokeAjaxObject.cache) {
								if (invokeAjaxObject.cache.key) {
								}
							} else if (invokeAjaxObject.url) {

							}
							if (invokeAjaxObject.complete) {
								invokeAjaxObject.complete(object, message);
							}
						}
					});
				}
				// No hay conexión a internet
				else {
					if (invokeAjaxObject.showInternetUnavailable) {
						ShowMessageInternetNotAvailable();
					}

					$.mobile.loading('hide');
				}
			}, encryptErrorHandler, "Encrypt", "encryptHmacSHA1", [ params ]);
			return;
		} else {
			if (debug)
				console.log("Parametro no enviado");
		}
	} catch (err) {
		$.mobile.loading('hide');
		if (debug)
			console.log(err.message);
		if (debug)
			console.log(err.stack);
	}

}

function registerPushToken(token) {
	try {
		invokeAjaxService({
			url : svb,
			service : "devices",
			dataType : 'jsonp',
			data : {
				idDevice : token,
				type : deviceType
			},

			success : function(response) {
				localStorage.setItem('pushInstalled', true);
				if (debug)
					showMessage('Registrado notificaciones PUSH.');

			},
			error : function() {
				if (debug)
					showMessage('Falló registro de notificaciones PUSH.');
			}

		});

	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

var lastConnectionErrorTime = null;

function ShowMessageInternetNotAvailable() {

	if (lastConnectionErrorTime != null) {
		var ErrorConnectionTime = new Date(lastConnectionErrorTime + (5000));
		var CurrentTime = new Date().getTime();
		if (CurrentTime > ErrorConnectionTime) {
			if (debug)
				alert('Fuera del tiempo');
			showMessage('En este momento no posee conexión a internet, verifique su conexión y vuelva a intentar.', null, null);
			lastConnectionErrorTime = new Date().getTime();
		} else if (debug)
			alert('Dentro del tiempo');
	} else {
		if (debug)
			alert('Primera vez');
		showMessage('En este momento no posee conexión a internet, verifique su conexión y vuelva a intentar.', null, null);
		lastConnectionErrorTime = new Date().getTime();
	}

}

function encryptErrorHandler(error) {
	try {
		showMessage("ERRORR: \r\n" + error);
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

// Elimina los registros de cache que hayan expirado
function clearCache() {
	try {
		var cacheArray = Array();
		var size = 0;
		var key;
		var value;
		var cacheObject;
		var cacheKeyObject = new Object();
		var stime = new Date().getTime();
		var lslength = localStorage.length;

		for (i = 0; i < lslength; i++) {
			if (localStorage.key(i) != null && localStorage.getItem(localStorage.key(i)) != null) {
				key = localStorage.key(i);
				value = localStorage.getItem(key);
				try {
					cacheObject = JSON.parse(value);
				} catch (err) {
					cacheObject = null;
				}

				if (cacheObject != null && cacheObject.time) {
					cacheKeyObject.key = key;
					cacheKeyObject.value = cacheObject;
					cacheArray.push(cacheKeyObject);
					if (stime > cacheObject.time) {
						localStorage.removeItem(key);
					} else {
						size += value.length;
					}
				} else {
					size += value.length;
				}
			}

		}

		if (size > 2000000) {
			clearOldestCache(cacheArray, size);
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

// Elimina los registros de cache por comandos
function clearCacheCommand(options) {
	try {
		var defaults = {
			Service : null,
			Key : null
		};
		var clearCacheObject = $.extend({}, defaults, options);
		// var lslength = localStorage.length;
		for (i = 0; i < localStorage.length; i++) {

			if (localStorage.key(i) != null && localStorage.getItem(localStorage.key(i)) != null) {

				key = localStorage.key(i);
				value = localStorage.getItem(key);

				try {
					cacheObject = JSON.parse(value);
				} catch (err) {
					cacheObject = null;
				}

				if (cacheObject != null && cacheObject.service) {
					if (cacheObject.service == clearCacheObject.Service) {
						if (clearCacheObject.Key) {
							if (cacheObject.key == clearCacheObject.Key) {
								localStorage.removeItem(key);
								i -= 1;
							}
						} else {
							localStorage.removeItem(key);
							i -= 1;
						}
					}
				}
			}
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

// Elimina los registros de cache más próximos a expirar hasta que el tamaño
// sea menor al límite permitido
function clearOldestCache(cacheArray, size) {
	try {
		mergesort(cacheArray);
		var i = 0;
		while (size > 2000000) {
			size -= JSON.stringify(cacheArray[i].value).length;
			localStorage.removeItem(cacheArray[i].key);
			i++;
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

// Ordena un arreglo de objetos por timestamp
function mergesort(list) {
	try {
		var k;
		k = Math.floor(list.length / 2);
		if (k < 1) {
			return;
		}
		var left = new Array();
		var right = new Array();
		while (list.length > k) {
			left.push(list.shift());
		}
		while (list.length > 0) {
			right.push(list.shift());
		}
		mergesort(left);
		mergesort(right);
		while ((left.length > 0) && (right.length > 0)) {
			if (left[0].value.time < right[0].value.time) {
				list.push(left.shift());
			} else {
				list.push(right.shift());
			}
		}
		while (left.length > 0) {
			list.push(left.shift());
		}
		while (right.length > 0) {
			list.push(right.shift());
		}
		return;
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function updateCategories(commId) {

	invokeAjaxService({
		url : svf,
		service : 'obtenerCategorias',
		dataType : 'jsonp',
		data : {
			codigoAplicacion : parameters.codigoAplicacion
		},
		success : function(data) {

			var res = "";
			var cont = 0;
			var categorias = [];

			if (data.length > 0) {

				var datos = data;
				var ins = "";
				try {
					db.transaction(function(tx) {

						tx.executeSql("DELETE FROM sub_categories", [], function(tx, result) {
							if (debug)
								console.log('Borrado sub_categories');
						}, function(tx, error) {
							console.log('ERROR Borrado sub_categories');
						});
						tx.executeSql("DELETE FROM categories", [], function(tx, result) {
							if (debug)
								console.log('Borrado categories');
						}, function(tx, error) {
							console.log('ERROR Borrado categories');
						});
						tx.executeSql("DELETE FROM product_types", [], function(tx, result) {
							if (debug)
								console.log('Borrado product_types');
						}, function(tx, error) {
							console.log('ERROR Borrado product_types');
						});

						for ( var i = 0; i < datos.length; i++) {

							var codCateg = datos[i].codigoCategoria;
							var nomCateg = datos[i].nombreCategoria;
							var orden = datos[i].orden;
							var codCategPad = datos[i].codigoCategoriaPadre;
							var nivel = datos[i].nivel;

							nomCateg = nomCateg.replace("'", " ");

							if (nivel == 1) {

								ins = "INSERT OR REPLACE INTO product_types VALUES(" + codCateg + ",'" + nomCateg + "'," + orden + ");"

							} else if (nivel == 2) {

								ins = "INSERT OR REPLACE INTO categories VALUES(" + codCateg + ",'" + nomCateg + "'," + codCategPad + "," + orden + ");"

							} else if (nivel == 3) {

								ins = "INSERT OR REPLACE INTO sub_categories VALUES(" + codCateg + ",'" + nomCateg + "'," + codCategPad + "," + orden + ");"

							}

							tx.executeSql(ins, [], function(tx, result) {
							}, function(tx, error) {
								if (debug)
									console.log(error);
							});

						}

						confirmCommand(commId);

					});

				} catch (err) {
					console.log(err.message);
					console.log(err.stack);
				}

			}

		},
		error : function(error) {
			console.log(error);
		}

	});

}

function loadChildBrowser() {
	try {
		if (typeof Cordova !== "undefined" && (!window.plugins || !window.plugins.childBrowser)) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			switch (device.platform) {
			default:
			case 'Android':
				script.src = 'scripts/cordova/android/childbrowser.js';
				break;
			case 'iPhone':
			case 'iPad':
			case 'iPod touch':
				script.src = 'scripts/cordova/iphone/ChildBrowser.js';
				break;
			}
			document.body.appendChild(script);
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}
function loadMaps() {
	try {
		// if (navigator.network.connection.type!=Connection.NONE) {
		if (navigator.onLine) {
			if (typeof google == 'undefined') {
				setTimeout(function() {
					$.mobile.loading("show", {
						text : "Consultando farmacias cercanas",
						textVisible : true,
						textonly : false,
						theme : 'b'
					});
				}, 200);
				$(document).on('loadMaps', function() {
					$.mobile.loading('hide');
				})
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&' + 'callback=initializeMaps';
				document.body.appendChild(script);
			}
		} else {
			ShowMessageInternetNotAvailable();
			$.mobile.loading('hide');
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}
function initializeMaps() {
	try {

		$(document).trigger('loadMaps');
		iconCurrentPosition = new google.maps.MarkerImage('themes/default/images2/current_location_on.png', new google.maps.Size(64, 64), new google.maps.Point(0, 0), new google.maps.Point(16, 16), new google.maps.Size(32, 32));

		new google.maps.MarkerImage("images/blue_dot.png", new google.maps.Size(100, 100), new google.maps.Point(0, 0), new google.maps.Point(50, 50))

		iconMarkerGreen = new google.maps.MarkerImage('themes/default/images2/marker_green.png', new google.maps.Size(23, 34), new google.maps.Point(0, 0), new google.maps.Point(12, 34), new google.maps.Size(23, 34));
		iconMarkerBlue = new google.maps.MarkerImage('themes/default/images2/marker_blue2.png', new google.maps.Size(23, 34), new google.maps.Point(0, 0), new google.maps.Point(12, 34), new google.maps.Size(23, 34));
		iconMarkerOrange = new google.maps.MarkerImage('themes/default/images2/marker_orange.png', new google.maps.Size(23, 34), new google.maps.Point(0, 0), new google.maps.Point(12, 34), new google.maps.Size(23, 34));
		iconMarkerRed = new google.maps.MarkerImage('themes/default/images2/marker_red.png', new google.maps.Size(23, 34), new google.maps.Point(0, 0), new google.maps.Point(12, 34), new google.maps.Size(23, 34));
		iconMarkerShadow = new google.maps.MarkerImage('themes/default/images2/marker_shadow.png', new google.maps.Size(43, 34), new google.maps.Point(0, 0), new google.maps.Point(12, 34), new google.maps.Size(43, 34));
		iconVCShadow = new google.maps.MarkerImage('themes/default/images2/categories/SHADOW_pin.png', new google.maps.Size(43, 34), new google.maps.Point(0, 0), new google.maps.Point(12, 34), new google.maps.Size(43, 34));
		iconMarkerShape = {
			coord : [ 16, 0, 17, 1, 19, 2, 20, 3, 20, 4, 21, 5, 22, 6, 22, 7, 22, 8, 22, 9, 22, 10, 22, 11, 22, 12, 22, 13, 22, 14, 22, 15, 22, 16, 21, 17, 21, 18, 20, 19, 20, 20, 19, 21, 18, 22, 18, 23, 17, 24, 16, 25, 16, 26, 15, 27, 14, 28, 14, 29, 13, 30, 13, 31, 12, 32, 12, 33, 10, 33, 10, 32,
					9, 31, 9, 30, 8, 29, 8, 28, 7, 27, 6, 26, 6, 25, 5, 24, 4, 23, 4, 22, 3, 21, 2, 20, 2, 19, 1, 18, 1, 17, 0, 16, 0, 15, 0, 14, 0, 13, 0, 12, 0, 11, 0, 10, 0, 9, 0, 8, 0, 7, 0, 6, 1, 5, 2, 4, 2, 3, 3, 2, 5, 1, 6, 0, 16, 0 ],
			type : 'poly'
		};
		iconCurrentPositionShape = {
			coord : [ 32, 0, 32, 32, -32, 32, -32, -32 ],
			type : 'poly'
		};
		defaultMapCenter = new google.maps.LatLng(-0.2046097, -78.4840911);
	} catch (err) {
		// alert('error initializeMaps ' + err);
		console.log(err.message);
		console.log(err.stack);
	}
}
function queryString(key) {
	try {
		var re = new RegExp('(?:\\?|&)' + key + '=(.*?)(?=&|$)', 'gi');
		var r = [], m;
		while ((m = re.exec(document.location.search)) != null)
			r.push(m[1]);
		return r;
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}
function showMessage(message, callback, title) {
	try {
		if (typeof Cordova !== "undefined") {
			navigator.notification.alert(message, callback || null, title || 'Mensaje');
		} else {
			alert(message);
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}
function showConfirm(message, callback, title) {
	try {
		if (typeof Cordova !== "undefined") {
			navigator.notification.confirm(message, callback, title || 'Mensaje', 'Cancelar,Aceptar');
		} else {
			if (confirm(message)) {
				callback(2);
			} else {
				callback(1);
			}
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function showConfirmYesNo(message, callback, title) {
	try {
		if (typeof Cordova !== "undefined") {
			navigator.notification.confirm(message, callback, title || 'Mensaje', 'No,Si');
		} else {
			if (confirm(message)) {
				callback(2);
			} else {
				callback(1);
			}
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function showReminderAux(action, id, time) {
	localStorage.setItem('actionAux', action);
	localStorage.setItem('idAux', id);
	localStorage.setItem('timeAux', time);
}

function showReminder(id, time) {
	try {

		var thisId = id.split('_')[0];

		try {
			time = parseInt(parseInt(time) / 1000) * 1000
		} catch (e) {
			// TODO: handle exception
		}

		$.mobile.changePage('reminder-view.html?id=' + thisId + '&time=' + time, {
		// changeHash : false
		});

		/*
		 * var id = String(id).split('-'); reminder_id = id[0];
		 * 
		 * reminder_ids = localStorage['reminder_ids'] ?
		 * JSON.parse(localStorage['reminder_ids']) : []; if
		 * ($.inArray(reminder_id, reminder_ids) == -1) {
		 * reminder_ids.push(reminder_id); localStorage['reminder_ids'] =
		 * JSON.stringify(reminder_ids); } reminder_take_time = time || new
		 * Date().getTime(); if ($.mobile) { if ($.mobile.activePage &&
		 * $.mobile.activePage.attr('id') == 'reminder-view') {
		 * $('#reminder-view').trigger('pageshow'); } else {
		 * $.getScript('scripts/repositories/repository.js', function() {
		 * ReminderRepository.get(reminder_id, function(result) { if
		 * (result.rows.length > 0) {
		 * $.mobile.changePage('reminder-view.html?id=' & id & '&time=' & time, {
		 * changeHash : false }); } else { location.href = 'index.html'; }
		 * 
		 * });
		 * 
		 * }); } } else { deferShowReminder = function() { showReminder(id, new
		 * Date().getTime()); }; }
		 */
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function showPushMessageAux(action, message) {
	localStorage.setItem('actionAux', action);
	localStorage.setItem('messageAux', message);
}

function showPushMessage(message) {
	push_message = decodeURIComponent(message);
	console.log(push_message);
	if ($.mobile) {
		if ($.mobile.activePage && $.mobile.activePage.attr('id') == 'push-detail') {
			$('#push-detail').trigger('pageshow');
		} else {
			$.mobile.changePage('push-message-detail.html', {
				changeHash : false
			});
		}
	}
}

// Funcion que transforma la hora al formato 24 horas
function parseTime24(time) {
	try {
		var a = time.split(':');
		var b = a[1].split(' ');
		var c = a[0];
		if (b[1] == 'PM') {
			if (Number(a[0]) == 12) {
				c = 12;
			} else {
				c = Number(a[0]) + 12;
			}
		} else if (b[1] == 'AM' && Number(a[0]) == 12) {
			c = 0;
		}
		return c + ':' + b[0];
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

// Funcion que transforma la hora al formato 12 horas
function parseTime12(time) {
	try {
		var timeArray = Array();
		var result = "";
		timeArray = time.split(":");
		if (parseInt(timeArray[0]) > 12) {
			result = (parseInt(timeArray[0]) - 12) + ":" + timeArray[1] + " PM";
		} else if (parseInt(timeArray[0]) == 12) {
			result = timeArray[0] + ":" + timeArray[1] + " PM";
		} else {
			result = timeArray[0] + ":" + timeArray[1] + " AM";
		}
		return result;
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function prettyDate(time) {
	try {
		var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")), diff = (((new Date()).getTime() - date.getTime()) / 1000), day_diff = Math.floor(diff / 86400);

		if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31)
			return;

		return day_diff == 0 && (diff < 60 && "en este momento" || diff < 120 && "hace 1 minuto" || diff < 3600 && "hace " + Math.floor(diff / 60) + " minutos" || diff < 7200 && "1 hora" || diff < 86400 && "hace" + Math.floor(diff / 3600) + " horas") || day_diff == 1 && "Ayer" || day_diff < 7
				&& "hace" + day_diff + " días" || day_diff < 31 && "hace" + Math.ceil(day_diff / 7) + " semanas";
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

// Redes sociales
function google_auth(callback, $context, close) {
	try {
		var authorize_url = google_auth_uri + "?";
		authorize_url += "client_id=" + google_client_id;
		authorize_url += "&redirect_uri=" + google_redirect_uri;
		authorize_url += "&response_type=token";
		authorize_url += "&scope=https://www.googleapis.com/auth/userinfo.profile%20https://www.googleapis.com/auth/userinfo.email";

		window.plugins.childBrowser.showWebPage(authorize_url, {
			showLocationBar : true
		});
		window.plugins.childBrowser.onLocationChange = function(loc) {
			if (loc.indexOf(google_redirect_uri) == 0) {
				var result = unescape(loc).split("#")[1];
				result = unescape(result);
				google_access_token = result.split("&")[0].split("=")[1];
				google_expires_in = result.split("&")[1].split("=")[1];
				getGoogleData();
				wasSharedGoogle = true;
				if (callback && $context)
					callback($context);
				if (callback)
					callback();
				if (close)
					window.plugins.childBrowser.close();
			}
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function getGoogleData() {
	try {

		if (isAuth()) {

			if (localStorage.getItem('uploadSocialData')) {

				var compartidos = localStorage.getItem('uploadSocialData').split('-');

				for ( var i = 0; i < compartidos.length; i++) {

					if (compartidos[i] == (localStorage.getItem('codigoPersona') + 'gp')) {

						return;

					}

				}

			}

			$.mobile.loading('show');
			$.ajax({
				timeout : ajaxTimeout,
				url : google_apis + 'userinfo',
				data : {
					access_token : google_access_token
				},
				dataType : 'jsonp',
				success : function(response) {

					invokeAjaxService({
						url : svf,
						service : "crearDatosRedesSociales",
						dataType : 'jsonp',
						data : {
							codigoPersona : localStorage.getItem('codigoPersona'),
							link : response.link,
							email : response.email,
							fechaNacimiento : response.birthday.split('-')[0] + '-' + response.birthday.split('-')[1] + '-' + response.birthday.split('-')[2],
							username : '',
							genero : (response.gender == 'male') ? 'M' : 'F',
							ciudad : '',
							codigoAplicacion : parameters.codigoAplicacion,
							redSocial : 'googlep'
						},

						success : function(data) {

							if (localStorage.getItem('uploadSocialData')) {

								localStorage.setItem('uploadSocialData', localStorage.getItem('uploadSocialData') + '-' + localStorage.getItem('codigoPersona') + 'gp');

							} else {

								localStorage.setItem('uploadSocialData', localStorage.getItem('codigoPersona') + 'gp');

							}

							$.mobile.loading('hide');

						},
						error : function() {
							console.log('Error google data');
							$.mobile.loading('hide');
						}

					});

					$.mobile.loading('hide');
				},
				error : ajaxError
			});
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function facebook_auth(callback, $context, close) {
	try {
		var authorize_url = facebook_graph_api + "oauth/authorize?";
		authorize_url += "client_id=" + facebook_app_id;
		authorize_url += "&redirect_uri=" + facebook_redirect_uri;
		authorize_url += "&display=touch";
		authorize_url += "&type=user_agent";
		authorize_url += "&scope=email,user_birthday,user_location,publish_stream";

		window.plugins.childBrowser.showWebPage(authorize_url, {
			showLocationBar : true
		});
		window.plugins.childBrowser.onLocationChange = function(loc) {
			if (loc.indexOf(facebook_redirect_uri) == 0) {
				var result = unescape(loc).split("#")[1];
				result = unescape(result);
				facebook_access_token = result.split("&")[0].split("=")[1];
				facebook_expires_in = result.split("&")[1].split("=")[1];
				exportarDatosFacebook();
				if (callback && $context != null)
					callback($context);
				if (callback) {
					// alert('si hay callback');
					callback();
				}
				if (close)
					window.plugins.childBrowser.close();
				if (cerrarSesionFacebook) {
					facebook_logout();
				}
				;
			}
		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function twitter_auth() {
	try {
		var authorize_url = "https://api.twitter.com/oauth";

		window.plugins.childBrowser.showWebPage(authorize_url, {
			showLocationBar : true
		});
		window.plugins.childBrowser.onLocationChange = function(loc) {

		}
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function google_logout() {

	wasSharedGoogle = false;
	var logout_url = "https://www.google.com/accounts/Logout";

	$.ajax({
		timeout : ajaxTimeout,
		url : logout_url,
		success : function(response) {
		},
		error : function() {
			$.mobile.loading('hide');
		}
	});
	// }

}

function facebook_logout() {

	if (facebook_access_token) {

		var logout_url = "https://www.facebook.com/logout.php?next=" + facebook_redirect_uri + "&access_token=" + facebook_access_token;
		cerrarSesionFacebook = false;

		$.ajax({
			timeout : ajaxTimeout,
			url : logout_url,

			success : function(response) {
				facebook_access_token = null;
			},
			error : ajaxError
		});

	}

}

function getFacebookData($context) {
	try {
		$.mobile.loading('show');
		$.ajax({
			timeout : ajaxTimeout,
			url : facebook_graph_api + 'me',
			data : {
				access_token : facebook_access_token
			},
			dataType : 'jsonp',
			success : function(response) {
				ko.applyBindings(response, $context[0]);
				$context.find('#gender').selectmenu('refresh');
				$.mobile.loading('hide');
				persona.facebookLink = response.link;
				if (cerrarSesionFacebook) {
					facebook_logout();
				}
				;
			},
			error : ajaxError
		});
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function exportarDatosFacebook() {
	var link = '';
	var birthDate = '';
	var email = '';
	var socialNetwork = 'facebook';
	var username = '';
	var gender = '';
	var city = '';

	if (isAuth()) {

		if (localStorage.getItem('uploadSocialData')) {

			var compartidos = localStorage.getItem('uploadSocialData').split('-');

			for ( var i = 0; i < compartidos.length; i++) {

				if (compartidos[i] == (localStorage.getItem('codigoPersona') + 'fb')) {

					return;

				}

			}

		}

		try {
			$.mobile.loading('show');
			$.ajax({
				timeout : ajaxTimeout,
				url : facebook_graph_api + 'me',
				data : {
					access_token : facebook_access_token
				},
				dataType : 'jsonp',
				success : function(response) {

					link = response.link;
					email = response.email;
					birthDate = response.birthday;
					username = response.username;
					gender = (response.gender == 'male') ? 'M' : 'F';
					city = response.location.name;

					invokeAjaxService({
						url : svf,
						service : "crearDatosRedesSociales",
						dataType : 'jsonp',

						data : {
							codigoPersona : localStorage.getItem('codigoPersona'),
							link : link,
							email : email,
							fechaNacimiento : birthDate.split('/')[2] + '-' + birthDate.split('/')[0] + '-' + birthDate.split('/')[1],
							username : username,
							genero : gender,
							ciudad : city,
							codigoAplicacion : parameters.codigoAplicacion,
							redSocial : 'facebook'

						},

						success : function(data) {

							if (localStorage.getItem('uploadSocialData')) {

								localStorage.setItem('uploadSocialData', localStorage.getItem('uploadSocialData') + '-' + localStorage.getItem('codigoPersona') + 'fb');

							} else {

								localStorage.setItem('uploadSocialData', localStorage.getItem('codigoPersona') + 'fb');

							}

						},
						error : function() {
							alert('error');
							console.log('Error');
						}

					});

					$.mobile.loading('hide');
				},
				error : ajaxError
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
}

function isAuth() {
	try {
		return Boolean(localStorage.getItem('idPersona'));
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function desasociarToken(idPersona) {

	if (localStorage.getItem('token')) {

		invokeAjaxService({
			url : svb,
			service : "Users",
			dataType : 'jsonp',
			data : {
				user : idPersona,
				token : localStorage.getItem('token'),
				deviceType : deviceType
			},

			success : function(data) {

			},
			error : function(err) {
				console.log(err);
			}

		});
	}

}

function logout() {
	try {
		desasociarToken(localStorage.getItem('idPersona'))
		localStorage.removeItem('emailPersona');
		localStorage.removeItem('idPersona');
		localStorage.removeItem('codigoPersona');
		localStorage.removeItem('nombrePersona');
		facebook_logout();
		google_logout();
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function calcDistance(lat1, lon1, lat2, lon2, unit) {
	try {
		var radlat1 = Math.PI * lat1 / 180;
		var radlat2 = Math.PI * lat2 / 180;
		var radlon1 = Math.PI * lon1 / 180;
		var radlon2 = Math.PI * lon2 / 180;
		var theta = lon1 - lon2;
		var radtheta = Math.PI * theta / 180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist);
		dist = dist * 180 / Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit == "K") {
			dist = dist * 1.609344
		}
		;
		if (unit == "N") {
			dist = dist * 0.8684
		}
		;
		return dist;
	} catch (err) {
		console.log(err.message);
		console.log(err.stack);
	}
}

function getCommands() {

	invokeAjaxService({
		url : svb,
		service : 'devices',
		dataType : 'jsonp',
		data : {

			deviceId : device.uuid,
			devicePlatform : device.platform,
			deviceModel : device.name.replace(/'/g, '_'),
			version : device.version

		},
		showInternetUnavailable : false,
		success : function(data) {

			if (data != '') {

				var commandsSize = data.length;
				var commandsCount = 0;
				var successCommands = [];
				$.each(data, function(index, value) {
					switch (value.Code) {
					default:
						// Comando para actualizar categorias
					case 'C1':
						updateCategories(value.Id);
						successCommands.push({
							Code : value.Code,
							Id : value.Id
						});
						commandsCount++;

						if (commandsCount == commandsSize) {

						}
						break;
					// Comando para borrar cache
					case 'C2':
						// vaciar el cache por comando, se envia
						// el nombre del
						// servicio obligatoriamente y el campo
						// de key opcional

						// clearCacheCommand(value.Data);

						var datos = value.Data;
						var cacheEstr;

						if (datos.length == 1) {

							cacheEstr = {
								Service : datos[0].Value
							};

							clearCacheCommand(cacheEstr);

						} else if (datos.length == 2) {

							cacheEstr = {
								Service : datos[0].Value,
								Key : datos[1].Value
							};
							clearCacheCommand(cacheEstr);

						}

						successCommands.push({
							Code : value.Code,
							Id : value.Id
						});
						commandsCount++;
						confirmCommand(value.Id);
						if (commandsCount == commandsSize) {

						}
						break;

					// Comando para actualizar parametros
					case 'C3':

						var parameterCode = value.Data[0].Value;
						var parameterValue = value.Data[1].Value;
						;

						$.getScript('scripts/repositories/repository.js', function() {

							ParametersRepository.updateParameter(parameterCode, parameterValue);

						});

						commandsCount++;
						confirmCommand(value.Id);
						if (commandsCount == commandsSize) {

						}
						break;
					case 'C4':

						var service = value.Data[0].Value;
						var status = ((value.Data[1].Value == 'S') ? true : false);

						localStorage.setItem('traceService', status);
						localStorage.setItem('serviceName', service);
						localStorage.setItem('minTimeCall', '0');
						localStorage.setItem('maxTimeCall', '0');
						localStorage.setItem('countServiceCalls', '0');

						confirmCommand(value.Id);

						break;

					case 'C5':

						if (parseInt(localStorage.getItem('countServiceCalls')) > 10) {
							uploadDataServices(value.Id);
						}

						break;

					}
				});
			} else {

			}
		},
		error : function() {
			if (debug)
				alert('error getCom');
		}

	});

}

function confirmCommand(commandId) {

	invokeAjaxService({
		url : svb,
		service : 'devices',
		dataType : 'jsonp',
		data : {
			deviceId : device.uuid,
			cprId : commandId
		},
		showInternetUnavailable : false,
		success : function(data) {

		},
		error : function() {

		}

	});

}

function fillParameters() {

	if (!localStorage.getItem('parameters')) {

		localStorage.setItem('buyersGuideUrl', 'http://issuu.com/corporaciongpf/docs/guia_de_compras_octubre_sierra'); // URL
		localStorage.setItem('parameters', true);
		localStorage.setItem('traceService', false);
		localStorage.setItem('serviceName', 'obtenerDatosPersonaFromCodigo');
		localStorage.setItem('minTimeCall', '0');
		localStorage.setItem('maxTimeCall', '0');
		localStorage.setItem('countServiceCalls', '0');
		localStorage.setItem('sumServiceCalls', '0');

	}

}

function deleteAuxiliarVars() {
	if (!localStorage.getItem('actionAux'))
		localStorage.removeItem('actionAux');
	if (!localStorage.getItem('idAux'))
		localStorage.removeItem('idAux');
	if (!localStorage.getItem('timeAux'))
		localStorage.removeItem('timeAux');
	if (!localStorage.getItem('messageAux'))
		localStorage.removeItem('messageAux');
}

function uploadDataServices(comId) {

	invokeAjaxService({
		url : svb,
		service : 'devices',
		dataType : 'jsonp',
		data : {
			deviceId : device.uuid,
			cprId : comId,
			maxTime : localStorage.getItem('maxTimeCall'),
			minTime : localStorage.getItem('minTimeCall'),
			aveTime : (parseInt(localStorage.getItem('sumServiceCalls')) / parseInt(localStorage.getItem('countServiceCalls'))),
			networkConnectionType : carrier + '-' + navigator.network.connection.type

		},
		showInternetUnavailable : false,
		success : function(data) {

		},
		error : function() {
			console.log('Error uploadDataServices');
		}

	});

}

Number.prototype.formatMoney = function(c, d, t) {
	var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "." : d, t = t == undefined ? "," : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
	return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function checkQuantityLimit(e, elem) {
	if (e.keyCode > 47 && e.keyCode < 58) {
		try {
			var currQuantity = elem.value + '' + String.fromCharCode(e.keyCode);
			currQuantity = parseInt(currQuantity);
			if (currQuantity > 0 && currQuantity < 100) {
				return true;
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}

function showMessageText(text, duration, hideLoading) {

	$.mobile.loading("show", {
		text : text,
		textonly : hideLoading == undefined ? true : hideLoading,
		textVisible : true,
		theme : 'b'
	});

	setTimeout(function() {
		$.mobile.loading('hide');
	}, duration || 3000);
}

function showMessageTextClose(text) {

	$.mobile.loading("show", {
		html : text + '<br><div class="closeMessageLink"><a href="#" onclick="hideMessage()";>Cerrar</a></div>',
		textonly : true,
		textVisible : true,
		theme : 'b'
	});

}

function hideMessage() {
	$.mobile.loading("hide");
}

function checkOnlyLettersAndNumbers(word, field) {
	var regExp = /^[0-9a-zA-Z]+$/;
	field = field == undefined ? 'El campo ingresado' : field;
	if (regExp.test(word)) {
		return true;
	} else {
		showMessageTextClose(field + ' solo puede tener letras y números');
		return false;
	}

}

function removeSpecialChars(text) {
	try {
		if (text != undefined && text != null) {
			text = text.toLowerCase();
			text = text.replace(/á/g, 'a');
			text = text.replace(/e/g, 'e');
			text = text.replace(/í/g, 'i');
			text = text.replace(/ó/g, 'o');
			text = text.replace(/ú/g, 'u');
			text = text.replace(/ñ/g, 'n');
		}
	} catch (e) {
	}
	return text;
}
