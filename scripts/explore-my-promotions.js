//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {

	loadPromotionsPer = true;
	var $page = $('#explore-my-promotions');
	var promotionDescription = "";
	var promotionName = "";
	var promotionURL = "";
	var promotionImageURL = "";
	var promotionCaption = "";
	var myPromotionNumber = 0;
	var showMoreProm = false;

	$page.on('pageinit', function() {

		loadChildBrowser();
		myPromotionNumber = 0;

		$page.find('#btnTwitter').click(function() {
			try {
				if (navigator.connection.type != Connection.NONE) {
					var tweetText = promotionName + ', ' + promotionDescription;
					tweetText = (tweetText.length > 125) ? tweetText.substring(0, 125) + '...' : tweetText;

					tweet({
						text : tweetText,
						via : "fybeca",
						url : "www.fybeca.com"
					});
					$page.find('#shareMenu').popup('close');
				} else {
					ShowMessageInternetNotAvailable();
				}
			} catch (err) {
				showMessage(errorMessageShare, null, null);
				console.log(err);
			}

		});

		$page.find('#btnFacebook').click(function() {
			try {
				if (navigator.connection.type != Connection.NONE) {
					facebook_post_parameters.link = promotionURL;
					facebook_post_parameters.picture = promotionImageURL;
					facebook_post_parameters.caption = promotionDescription;
					facebook_post_parameters.name = 'Fybeca - ' + promotionName;
					facebook_post_parameters.description = '';

					if (!facebook_access_token) {
						facebook_auth(function() {
							window.plugins.childBrowser.close();
							setTimeout(function() {
								facebook_post();
							}, 500);
						});

					} else {
						facebook_post();
						exportarDatosFacebook();
					}
					$page.find('#shareMenu').popup('close');
				} else {
					ShowMessageInternetNotAvailable();
				}
			} catch (err) {
				showMessage(errorMessageShare, null, null);
				console.log(err);
			}
		});
		$page.find('#btnGoogle').click(function() {

			try {
				if (navigator.connection.type != Connection.NONE) {
					if (!google_access_token) {
						google_auth(function() {
							window.plugins.childBrowser.close();
							setTimeout(function() {
								gplus_post({
									url : promotionURL
								// promotionURL=='null'|| promotionURL == null
								// || promotionURL ==
								// ''?'www.fybeca.com':promotionURL
								});
							}, 500);
						});

					} else {
						getGoogleData();
						gplus_post({
							url : promotionURL
						// promotionURL=='null'|| promotionURL == null ||
						// promotionURL == ''?'www.fybeca.com':promotionURL
						});
					}
					$page.find('#shareMenu').popup('close');
				} else {
					ShowMessageInternetNotAvailable();
				}
			} catch (err) {
				showMessage(errorMessageShare, null, null);
				console.log(err);
			}
		});

		$page.find('#nombre').text('Bienvenido(a), ' + localStorage.getItem('nombrePersona'));
		if (localStorage.getItem('segmentoPersona') && localStorage.getItem('segmentoPersona') != null && localStorage.getItem('segmentoPersona') != '')
			$page.find('#nombre').append('<span style="font-weight:normal; float:right;" class="' + localStorage.getItem('segmentoPersona').toLowerCase() + '">' + localStorage.getItem('segmentoPersona').toUpperCase() + '</span></p>');

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'show-more':
				$.mobile.loading('show', {
					text : 'Cargando',
					textVisible : true,
					theme : 'b'
				});
				loadPromotionsPer = true;
				showMoreProm = true;
				loadPromotions();
				break;
			case 'toggle-detail':
				var promCode = $(this).parents('li').next().attr('data-promotion');

				$page.find('[data-aux="a"]').attr('data-icon', 'arrow-d');
				$page.find('[data-aux="a"]').children().children().next().removeClass('ui-icon-arrow-u').addClass('ui-icon-arrow-d');

				if ($(this).parents('li').next().is(":visible")) {
					$(this).parents('li').next().slideToggle();
					$(this).parents('li').attr('data-icon', 'arrow-d');
					$(this).parents('li').children().children().next().removeClass('ui-icon-arrow-u').addClass('ui-icon-arrow-d');
				} else {
					$page.find('.detail').slideUp();
					$(this).parents('li').next().slideToggle();

					if (($(this).parents('li').next().index() + 1) == (myPromotionNumber * 2)) {
						$('html,body').animate({
							scrollTop : $(document).height()
						}, 2000);
					}

					$(this).parents('li').attr('data-icon', 'arrow-u');
					$(this).parents('li').children().children().next().removeClass('ui-icon-arrow-d').addClass('ui-icon-arrow-u');
					$page.find('#imgProm' + promCode).show();
					if ($page.find('#imgProm' + promCode).attr('src') == 'themes/default/images2/loader.gif') {
						loadPromotionImage(promCode);
					}
				}

				if ($page.find('#imgProm' + promCode).attr('src') == 'themes/default/images2/loader.gif') {
					loadPromotionImage(promCode);
				}

				break;
			case 'show-my-promotions':
				$(':mobile-pagecontainer').pagecontainer('change', 'explore-my-promotions.html');
				break;
			case 'show-promotions':
				$(':mobile-pagecontainer').pagecontainer('change', 'explore-promotions.html');
				break;

			case 'share':

				promotionDescription = $(this).data('description');
				promotionName = $(this).data('name');
				promotionURL = $(this).data('url');
				promotionImageURL = $(this).data('image');
				promotionCaption = "";

				promotionImageURL = ((promotionImageURL == null || promotionImageURL == 'null') ? facebook_default_image_prom : promotionImageURL);
				promotionURL = ((promotionURL == null || promotionURL == 'null' || promotionURL.trim() == '') ? promotionShareUrlBase + '?code=' + promotionCode : promotionURL);

				$page.find('#shareMenu').popup('open');
				break;

			}
		});
	})

	.on('pageshow', function() {

		// myPromotionNumber = 0;
		showMoreProm = false;
		if ($page.find('.detail').size() == 0) {
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
			myPromotionNumber = 0;
		}

		if (loadPromotionsPer) {
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
			loadPromotions();
		} else
			$.mobile.loading('hide');

		$page.find('[href="explore-promotions.html"]').removeClass('ui-btn-active');
	});

	function loadPromotionImage(code) {

		invokeService({
			url : svb,
			service : "promotions",
			dataType : 'jsonp',
			data : {
				code : code,
				typeCode : 'PROM_GEN',
				distinct : 'GetPromotionImage'
			},
			cache : {
				time : GetPromotionCacheTimeout
			},
			async : true,
			success : function(data) {

				$page.find('#imgProm' + code).attr('src', 'data:' + data.mimeType + ';base64,' + data.imageString);
				$.mobile.loading('hide');
			},
			error : function(error) {
				$page.find('#imgProm' + code).hide();
				console.log(error);
			}
		});

	}

	function loadPromotions() {

		var $page = $('#explore-my-promotions');
		$page.find('#btnLoad').parents('li').remove();
		var resetList = false;
		if (codeLastPromPer == "-1") {
			resetList = true;
			myPromotionNumber = 0;
		}

		invokeService({
			url : svb,
			service : "promotions",
			dataType : 'jsonp',
			data : {
				typeCode : 'PROM_GEN',
				accessLevelCode : 'ACC_PRI',
				clientId : localStorage.getItem('idPersona'),
				lastPromotionCode : codeLastPromPer,
				distinct : 'GetPromotionCustomer'
			},
			cache : {
				time : GetPromotionCacheTimeout
			},
			isNeededActivateButtons : true,
			async : false,
			success : function(response) {
				try {
					var promotions = Array();
					if (response.length > 0) {

						var list = Array();
						$.each(response, function(index, value) {

							myPromotionNumber++;
							var initImage = 'loader.gif';
							var styleImage = '';
							if (value.IdLogo == -1) {
								initImage = 'noLogoPromotion.png';
								styleImage = 'style="width: 50px"';
							}

							list.push('<li data-aux="a" data-icon="arrow-d" style="margin-left: 0px"> <a data-action="toggle-detail" style="padding: .7em 5px"> <table> <tr> <td align="center" width="50px" style="min-width:50px"> <img id="imgLogo' + value.IdLogo + value.Code + '" src="themes/default/images2/' + initImage + '" ' + styleImage + '> </td> <td width="100%"> <label for="name" style="margin-left: 5px; white-space: normal; max-width: 230px; display: block;">' + value.Name + '</label> </td> </tr> </table> </a> </li>');
							list.push('<li class="detail" style="display:none;" data-promotion="' + value.Code + '"> <div style="margin-left: 20px;"> <p style="white-space: normal;">' + value.Description + '</p> <div align="center"><img id="imgProm' + value.Code + '" src="themes/default/images2/loader.gif" style="max-width:200px; max-height:200px"></div> <h4>Restricciones</h4> <p style="white-space: normal;">' + value.Constraints + '</p> <a href="#" data-action="share" data-description="' + value.Description + '" data-name="' + value.Name + '" data-url="' + value.Link + '" data-image="' + value.LinkImage + '" data-transition="none" data-role="button" data-inline="true" data-rel="popup">Compartir</a></div> </li>');

							codeLastPromPer = value.Code;

							if (value.IdLogo != -1) {

								invokeService({
									url : svb,
									service : "promotions",
									dataType : 'jsonp',
									data : {
										id : value.IdLogo
									},
									cache : {
										time : GetLogoImageCacheTimeout
									},
									async : true,
									success : function(response) {
										setTimeout(function() {
											$page.find('#imgLogo' + value.IdLogo + value.Code).attr('src', 'data:' + response.mimeType + ';base64,' + response.imageString);
											$page.find('#imgLogo' + value.IdLogo + value.Code).attr('style', 'width: 50px');
											$.mobile.loading('hide');
										}, 100);

									},
									error : function() {
										$page.find('#imgLogo' + value.IdLogo + value.Code).attr('src', 'themes/default/images2/noLogoPromotion.png');
										$page.find('#imgLogo' + value.IdLogo + value.Code).attr('style', 'width: 50px');
									}

								});

							}

						});
						if (response.length == 5)
							list.push('<li data-icon="plus" style="text-align: center"><a data-role="button" data-action="show-more" id="btnLoad">Cargar más Promociones</a></li>');
						else
							$page.find('#btnLoad').parents('li').remove();

						if (resetList)
							$page.find('#promotionsList').html(list.join('')).listview('refresh');
						else
							$page.find('#promotionsList').append(list.join('')).listview('refresh');

						$page.find('#promotionsList').find('[data-role="button"]').click(function() {
							promotionDescription = $(this).attr("data-description");
							promotionName = $(this).attr("data-name");
							promotionURL = $(this).attr("data-url");
							promotionImageURL = $(this).attr("data-image");
							$page.find('#shareMenu').popup('open');
						});

						$.mobile.loading('hide');
					} else {
						if (resetList) {
							if ($page.find('#detail').size() == 0) {
								$page.find('#promotionsList').html('<li style="background-color: rgba(255, 255, 255, 0.9) !important;color: #333 !important;">No existen promociones vigentes</li>').listview('refresh');

							}
						}
					}
					showMoreProm = false;
					$.mobile.loading('hide');
				} catch (err) {
					$.mobile.loading('hide');
					console.log(err);
					showMoreProm = false;
				}

			},
			error : function(e, message, showMsg) {
				if (showMoreProm) {
					var list = Array();
					list.push('<li data-icon="plus" style="text-align: center"><a data-role="button" data-action="show-more" id="btnLoad">Cargar más Promociones</a></li>');
					$page.find('#promotionsList').append(list.join('')).listview('refresh');
					showMoreProm = false;
				}

				if (showMsg != undefined) {
					if (showMsg)
						showMessage(defaultErrorMsg, null, null);
				} else
					showMessage(defaultErrorMsg, null, null);

				$.mobile.loading('hide');
			}
		});
		loadPromotionsPer = false;
	}

})();