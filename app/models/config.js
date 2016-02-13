(function() {
	'use strict';

	window.config = {
		ajaxTimeout : 60000,
		ajaxTimeoutCheckout : 300000,

		/*
		 * URLs PARA LOS SERVICIOS
		 */

		svf : 'https://mapp02.fybeca.com/WebApplicationMovilGPF/resources/Generales/',
		// svf :
		// 'https://181.39.18.187/WebApplicationMovilGPF/resources/Generales/',

		svb : 'https://mapp01.fybeca.com/FybecaApi/api/',
		// svb : 'https://181.39.18.188/FybecaApi/api/',

		chUrl : 'https://www.corporaciongpf.com/servicios.carrito.web/rest/app/',
		// chUrl :
		// 'https://www.corporaciongpf.com/HUBFacturacion/rest/app/tarjetasDescuento/xml',
		// chUrl : 'https://mapp02.fybeca.com/HUBFacturacion/rest/app/',

		// appUrl :
		// 'https://www.corporaciongpf.com/servicios.app.movil/resources/Generales/',
		appUrl : 'https://mapp02.fybeca.com/WebApplicationMovilGPF/resources/Generales/',

		// locUrl : 'http://ns.bayteq.com:8097/FybecaServices/webresources/',
		// locUrl : 'http://localhost:8097/FybecaServices/webresources/',
		// locUrl : 'https://www.corporaciongpf.com/FybecaServices/',
		// locUrl : 'https://181.39.18.186/FybecaServices/webresources/',
		locUrl : 'https://www.fybeca.com/FybecaServices/webresources/',

		// tempUrl : 'http://ns.bayteq.com:8097/FybecaServices/webresources/',

		/*
		 * PARAMETROS PARA ENCRIPCION
		 */

		consumerSecret : 'kd94hf93k423kf44',
		tokenSecret : '',
		mKey : '1er45$56d0',
		mId : 'PKCC01',
		rsaPublicKey : '25431633936721626394017292368839454972469277154829490345834063897120080376163407567237074544908727071798246231926534075556315084798599379182596403504435358603126915190801673125818096311892278580648214717160228163478083638062333671968867764933320290142286516883099416583109798342626959300867831122840376220534599948190555971376351819509731253394048586414047765739687900698861330515655634222980915046242198477773465354358444464215442840869890328774520774590124607928585746151796586847936011247132424414090071650941342817286373780772557941246776135409167448613694534969357854102098869818993514407531987368342103895828223',

		timeouts : {
			getProductsByKeyword : 45000,
			registerUser : 90000
		},

		/*
		 * TIEMPOS DE EXPIRACION PARA CACHES, EN ms
		 */

		cacheTimeouts : {
			getItemsByProductId : 1000 * 60 * 24,
			getProductsByCatalogId : 1000 * 60 * 24,
			getClubProducts : 1000 * 60 * 60,
			getActivePharmacies : 1000 * 60 * 60 * 24 * 15
		},

		/*
		 * PARAMETROS DE APLICACION
		 */

		appCode : '',

	};
})();