(function($) {
	'use strict';
	// var viewModel;

	var $page = $($('script').last()).closest('[data-role="page"]');

	$page.on('pagebeforecreate', function() {

		var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);

	}).on('pageinit', function() {

		var testA, testB, teTime, cTime;

		testA = document.getElementById('test-a');
		testB = document.getElementById('test-b');

		// Android 2.2 needs FastClick to be instantiated before the other
		// listeners so that the stopImmediatePropagation hack can work.
		// FastClick.attach(testB);

		testA.addEventListener('touchend', function(event) {
			teTime = Date.now();
			document.getElementById('te-time').value = teTime;
		}, false);

		testA.addEventListener('click', function(event) {
			cTime = Date.now();
			document.getElementById('c-time').value = cTime;
			document.getElementById('d-time').value = cTime - teTime;
			testA.style.backgroundColor = testA.style.backgroundColor ? '' : 'YellowGreen';
		}, false);

		testB.addEventListener('touchend', function(event) {
			teTime = Date.now();
			document.getElementById('te-time').value = teTime;
			document.getElementById('d-time').value = cTime - teTime;
		}, false);

		testB.addEventListener('click', function(event) {
			cTime = Date.now();
			document.getElementById('c-time').value = cTime;
			testB.style.backgroundColor = testB.style.backgroundColor ? '' : 'YellowGreen';
		}, false);

	});

})(jQuery);