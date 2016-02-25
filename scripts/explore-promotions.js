//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {

	loadPromotionsGen = true;
	var $page = $('#explore-promotions');
	var promotionDescription = "";
	var promotionName = "";
	var promotionURL = "";
	var promotionImageURL = "";
	var promotionCaption = "";
	var promotionNumber = 0;
	var promotionCode = "";
	var showMoreProm = false;

	var viewModel = {
		hasItems : ko.observable(true)
	};

	$page.on('pageinit', function() {
		loadChildBrowser();
		promotionNumber = 0;

		$page.find('#btnTwitter').click(function() {
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
		});

		$page.find('#btnFacebook').click(function() {
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
		});
		$page.find('#btnGoogle').click(function() {
			if (navigator.connection.type != Connection.NONE) {
				if (!google_access_token) {
					google_auth(function() {
						window.plugins.childBrowser.close();
						setTimeout(function() {
							gplus_post({
								url : promotionURL
							// promotionURL=='null'||
							// promotionURL
							// == null
							// ||
							// promotionURL
							// == ''? ''
							// :promotionURL
							});
						}, 500);
					});

				} else {
					getGoogleData();
					gplus_post({
						url : promotionURL
					// promotionURL=='null'||
					// promotionURL == null ||
					// promotionURL ==
					// ''?'www.fybeca.com':promotionURL
					});
				}
				$page.find('#shareMenu').popup('close');
			} else {
				ShowMessageInternetNotAvailable();
			}
		});

		$page.on('tap', '[data-action]:not(form)', function(e) {
			e.preventDefault();
			switch ($(this).data('action')) {
			case 'show-more':
				$.mobile.loading('show', {
					text : 'Cargando',
					textVisible : true,
					theme : 'b'
				});
				loadPromotionsGen = true;
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
					$('.detail').slideUp();
					$(this).parents('li').next().slideToggle();
					$(this).parents('li').attr('data-icon', 'arrow-u');

					if (($(this).parents('li').next().index() + 1) == (promotionNumber * 2)) {
						$('html,body').animate({
							scrollTop : $(document).height()
						}, 2000);
					}

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
				$.mobile.changePage('explore-my-promotions.html', {
					changeHash : false
				});
				break;
			case 'show-promotions':
				$.mobile.changePage('explore-promotions.html', {
					changeHash : false
				});
				break;

			case 'share':

				isSharePopOpen = true;
				promotionDescription = $(this).data('description');
				promotionName = $(this).data('name');
				promotionURL = $(this).data('url');
				promotionImageURL = $(this).data('image');
				promotionCode = $(this).data('code');

				promotionCaption = "";

				promotionImageURL = ((promotionImageURL == null || promotionImageURL == 'null') ? facebook_default_image_prom : promotionImageURL);
				promotionURL = ((promotionURL == null || promotionURL == 'null' || promotionURL.trim() == '') ? promotionShareUrlBase + '?code=' + promotionCode : promotionURL);

				$page.find('#shareMenu').popup('open');

				break;

			}
		});
		ko.applyBindings(viewModel, $page[0]);
	})

	.on('pageshow', function() {
		// promotionNumber = 0;
		showMoreProm = false;
		if ($page.find('.detail').size() == 0) {
			$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
			promotionNumber = 0;
		}

		if (loadPromotionsGen)
			loadPromotions();
		else
			$.mobile.loading('hide');

		loadFooter();

		$page.find('[href="explore-my-promotions.html"]').removeClass('ui-btn-active');

	});

	function loadPromotionImage(code) {

		invokeService({
			url : config.svb,
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
			success : function(response) {

				$page.find('#imgProm' + code).attr('src', 'data:' + response.mimeType + ';base64,' + response.imageString);

				$.mobile.loading('hide');

			},
			error : function(error) {
				$page.find('#imgProm' + code).hide();
				console.log(error);
			}

		});
	}

	function loadFooter() {
		var output = [ '<div data-id="mainTab" data-role="navbar"><ul id="footer_tabs">' ];

		if (isAuth()) {
			output.push('<li> <a href="explore-my-promotions.html" data-icon="search">Mis Promociones</a></li>');
			output.push('<li> <a href="explore-promotions.html" data-icon="grid" class="ui-btn-active ui-state-persist">Otras Promociones</a></li>');
			output.push('</ul></div>');
			$page.find('[data-role="footer"]').show();
			$page.find('[data-role="footer"]').html(output.join('')).trigger('create');
		} else {

			$page.find('[data-role="navbar"]').remove();
			$page.find('[data-role="footer"]').hide();
		}

	}

	function loadPromotions() {
		if (debug) {
			console.log(codeLastProm);
		}
		var $page = $('#explore-promotions');
		$page.find('#btnLoad').parents('li').remove();
		var resetList = false;
		if (codeLastProm == "-1") {
			resetList = true;
			promotionNumber = 0;
		}
		// isNeededActivateButtons=true;

		invokeService({
			url : config.svb,
			service : "promotions",
			dataType : 'jsonp',
			data : {
				typeCode : 'PROM_GEN',
				accessLevelCode : 'ACC_PUB',
				lastPromotionCode : codeLastProm
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
						viewModel.hasItems(true);
						var list = Array();
						$.each(response, function(index, value) {

							if (debug)
								console.log(value.Link);
							promotionNumber++;
							var initImage = 'loader.gif';
							var styleImage = '';
							if (value.IdLogo == -1) {
								initImage = 'noLogoPromotion.png';
								styleImage = 'style="width: 50px"';
							}
							
							value.Code = value.Code.replace(/ /g,'_');
							
							list.push('<li data-aux="a" data-icon="carat-d" style="margin-left: 0px"> <a ontouchend="switchIcon(this)" data-action="toggle-detail" style="padding: .7em 5px"> <table> <tr> <td align="center" width="50px" style="min-width:50px"> <img id="imgLogo' + value.IdLogo
									+ value.Code + '" src="themes/default/images2/' + initImage + '" ' + styleImage + '> </td> <td width="100%"> <label for="name" style="margin-left: 5px; white-space: normal; max-width: 220px; display: block; margin-right: 15px;">' + value.Name
									+ '</label> </td> </tr> </table> </a> </li>');
							list.push('<li class="detail" style="display:none;" data-promotion="' + value.Code + '"> <div style="margin-left: 20px;"> <p style="white-space: normal;">' + value.Description + '</p> <div align="center"><img id="imgProm' + value.Code
									+ '" src="themes/default/images2/loader.gif" style="max-width:200px; max-height:200px"></div> <h4>Restricciones</h4> <p style="white-space: normal;">' + value.Constraints + '</p>  <a href="#" data-action="share" data-description="' + value.Description
									+ '" data-name="' + value.Name + '" data-url="' + value.Link + '" data-image="' + value.LinkImage + '" data-code="' + value.Code
									+ '" data-transition="none" data-role="button" data-inline="true" data-rel="popup" class="ui-btn ui-shadow ui-corner-all">Compartir</a></div></li>');

							codeLastProm = value.Code;

							if (value.IdLogo != -1) {
								invokeService({
									url : config.svb,
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

										value.Code = value.Code.replace(/ /g,'_');
										setTimeout(function() {
											$page.find('#imgLogo' + value.IdLogo + value.Code).attr('src', 'data:' + response.mimeType + ';base64,' + response.imageString);
											$page.find('#imgLogo' + value.IdLogo + value.Code).attr('style', 'width: 50px');
											$.mobile.loading('hide');
										}, 100);

									},
									error : function() {
										value.Code = value.Code.replace(/ /g,'_');
										$page.find('#imgLogo' + value.IdLogo + value.Code).attr('src', 'themes/default/images2/noLogoPromotion.png');
										$page.find('#imgLogo' + value.IdLogo + value.Code).attr('style', 'width: 50px');
									}

								});
							}

						});

						if (response.length == 5)
							list.push('<li data-icon="plus" style="text-align: center; margin-bottom: 15px;"><a data-role="button" data-action="show-more" id="btnLoad">Cargar más Promociones</a></li>');
						else
							$page.find('#btnLoad').parents('li').remove();

						if (resetList)
							$page.find('#promotionsList').html(list.join('')).listview('refresh');
						else
							$page.find('#promotionsList').append(list.join('')).listview('refresh');

						$page.find('#promotionsList').find('[data-role="button"] [data-action="share"]').click(function() {
							promotionDescription = $(this).attr("data-description");
							promotionName = $(this).attr("data-name");
							promotionURL = $(this).attr("data-url");
							promotionImageURL = $(this).attr("data-image");
							isSharePopOpen = true;
							$page.find('#shareMenu').popup('open');
						});

						$.mobile.loading('hide');
					} else {
						if (resetList) {
							if ($page.find('#detail').size() == 0) {
								$.mobile.loading('hide');
								$page.find('#promotionsList').html('<li>No existen promociones vigentes</li>').listview('refresh');
							}
						}
						viewModel.hasItems(false);
					}
					loadPromotionsGen = false;
					showMoreProm = false;
					$.mobile.loading('hide');
				} catch (err) {
					$.mobile.loading('hide');
					console.log(err.message);
					console.log(err.stack);
					showMoreProm = false;
				}

			},
			error : function(e, message, showMsg) {
				if (showMoreProm) {
					var list = Array();
					list.push('<li data-icon="plus" style="text-align: center; margin-bottom: 15px;"><a data-role="button" data-action="show-more" id="btnLoad">Cargar más Promociones</a></li>');
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
	}

})();

function switchIcon(component) {
	setTimeout(function() {
		if ($(component).hasClass('ui-icon-carat-u') && $(component).parent().next().css('display') == 'none') {
			$(component).addClass('ui-icon-carat-d');
			$(component).removeClass('ui-icon-carat-u');
		} else if ($(component).hasClass('ui-icon-carat-d') && $(component).parent().next().css('display') == 'block') {
			$(component).addClass('ui-icon-carat-u');
			$(component).removeClass('ui-icon-carat-d');
		}
		$.each($('#promotionsList li a'), function() {
			if ($(this)[0] != $(component)[0]) {
				$(this).addClass('ui-icon-carat-d').removeClass('ui-icon-carat-u');
			}
		});
	}, 500);
}