if (navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('iPad') > -1) {
	document.write('<script src="scripts/cordova/cordova-ios-2.9.1.js"></script>');
} else if (navigator.userAgent.indexOf('Android') > -1) {
	document.write('<script src="scripts/cordova/cordova-android-2.9.1.js"></script>');
}