//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#social-networks');
	var twitter_access_token;
	$page.on('pageinit', function() {
		try {
			loadChildBrowser();
			$page.find('[data-action]').on('tap', function(e) {
				e.preventDefault();
				var self = this;

				switch ($(this).data('action')) {
				case 'open-facebook':

					// window.open(social_profile_fb, '_blank', {
					// location : 'yes',
					// closebuttoncaption : 'yes'
					// });

					// window.plugins.childBrowser.showWebPage(social_profile_fb,
					// {
					// showLocationBar : true
					// });

					if (navigator.network.connection.type != Connection.NONE) {
						if (!facebook_access_token) {
							facebook_auth(function() {
								window.plugins.childBrowser.close();
								setTimeout(function() {
									window.plugins.childBrowser.showWebPage(social_profile_fb, {
										showLocationBar : true
									});
								}, 500);
							});
						} else {
							window.plugins.childBrowser.showWebPage(social_profile_fb, {
								showLocationBar : true
							});
						}
					} else {
						ShowMessageInternetNotAvailable();
					}
					break;
				case 'open-twitter':

					// window.open(social_profile_tw, '_blank', {
					// location : 'yes',
					// closebuttoncaption : 'yes'
					// });

					if (navigator.network.connection.type != Connection.NONE) {
						window.plugins.childBrowser.showWebPage(social_profile_tw, {
							showLocationBar : true
						});
					} else {
						ShowMessageInternetNotAvailable();
					}
					break;
				case 'open-gplus':

					// window.open(social_profile_gp, '_blank', {
					// location : 'yes',
					// closebuttoncaption : 'yes'
					// });

					if (navigator.network.connection.type != Connection.NONE) {
						if (!google_access_token) {
							google_auth(function() {
								window.plugins.childBrowser.close();
								setTimeout(function() {
									window.plugins.childBrowser.showWebPage(social_profile_gp, {
										showLocationBar : true
									});
								}, 500);
							});
						} else {
							window.plugins.childBrowser.showWebPage(social_profile_gp, {
								showLocationBar : true
							});
						}
					} else {
						ShowMessageInternetNotAvailable();
					}

					break;
				case 'open-foursquare':

					// window.open(social_profile_fs, '_blank', {
					// location : 'yes',
					// closebuttoncaption : 'yes'
					// });

					if (navigator.network.connection.type != Connection.NONE) {
						window.plugins.childBrowser.showWebPage(social_profile_fs, {
							showLocationBar : true
						});
					} else {
						ShowMessageInternetNotAvailable();
					}
					break;
				case 'open-pinterest':

					// window.open(social_profile_pi, '_blank', {
					// location : 'yes',
					// closebuttoncaption : 'yes'
					// });

					if (navigator.network.connection.type != Connection.NONE) {
						window.plugins.childBrowser.showWebPage(social_profile_pi, {
							showLocationBar : true
						});
					} else {
						ShowMessageInternetNotAvailable();
					}
					break;
				}
			});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	});
})();