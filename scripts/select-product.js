//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#select-product'), $reminder = $('#reminder-form'), $form = $reminder
			.find('#reminder'), localResults, timerL, timerR;
	$page.on(
			'pageinit',
			function(e, data) {
				try {
					getRecent();
					$page.find('[data-type="search"]').on(
							'keyup',
							function() {
								$self = $(this);
								var keyword = $self.val();
								clearTimeout(timerL);
								clearTimeout(timerR);
								if (typeof keyword != 'undefined'
										&& $.trim(keyword) != '') {
									timerL = setTimeout(function() {
										searchProductsLocal($self);
									}, 500);
									timerR = setTimeout(function() {
										searchProductsServer($self);
									}, 2000);
								} else {
									getRecent();
								}
							});
					$page.find('.ui-input-clear').on('tap', function() {
						getRecent();
					});
					$page.find('#search-list').listview('option',
							'filterCallback', function(text, search) {
								return false;
							});
				} catch (err) {
					console.log(err.message);
					console.log(err.stack);
				}
			})

	.on(
			'tap',
			'[data-action="select-product"]',
			function(e) {
				try {
					e.preventDefault();
					$form.find('[name="medicine"]').val($(this).text());
					data.reminderData.medicine = $(this).text();
					setTimeout(function() {
						$(':mobile-pagecontainer').pagecontainer('change',
								'reminder-form.html');
					}, 150);

				} catch (err) {
					console.log(err.message);
					console.log(err.stack);
				}
			});

	function searchProductsLocal($self) {
		try {
			var keyword = $self.val();
			if (typeof keyword != 'undefined' && $.trim(keyword) != '') {
				ProductRepository
						.search(
								keyword,
								function(results) {
									var len = results.rows.length;
									var i;
									var curSearch = $page.find(
											'[data-type="search"]').val();
									localResults = results;
									if (typeof curSearch != 'undefined'
											&& curSearch == keyword) {
										if (len > 0) {
											var list = [];
											for (i = 0; i < len; i++) {
												var item = results.rows.item(i);
												label = item.name
														.replace(
																keyword
																		.toUpperCase(),
																'<span style="background:#FFCCCC;">'
																		+ keyword
																				.toUpperCase()
																		+ '</span>');
												list
														.push('<li class="capitalized"><a data-action="select-product" data-product_id="'
																+ item.id
																+ '">'
																+ label
																+ '</a></li>');
											}
											$page.find('#search-list').html(
													list.join('')).listview(
													'refresh');
										} else {
											$page
													.find('#search-list')
													.html(
															'<li>No se han encontrado productos</li>')
													.listview('refresh');
										}
									}
								});
			} else {
				getRecent();
			}
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function searchProductsServer($self) {
		try {
			var keyword = $self.val();
			if (typeof keyword != 'undefined' && $.trim(keyword) != '') {
				$page.find('.products-loading').remove();
				$(
						'<div class="products-loading" style="padding: 5px; text-align: center; font-size: 11px; margin: -15px; margin-bottom: 15px; background:#DDD;">Buscando más productos...</div>')
						.insertAfter($page.find('.ui-listview-filter')).hide()
						.slideDown();
				// Solicitud remota
				invokeAjaxService({
					url : svf,
					service : 'buscarProductoPorNombre',
					data : {
						busqueda : keyword
					},
					dataType : 'jsonp',
					success : function(data) {
						var curSearch = $page.find('[data-type="search"]')
								.val();

						if (typeof curSearch != 'undefined'
								&& curSearch == keyword) {

							if (data.length > 0) {

								var list = [];

								$
										.each(
												data,
												function() {
													label = this.nombreProducto
															.replace(
																	keyword
																			.toUpperCase(),
																	'<span style="background:#FFCCCC;">'
																			+ keyword
																					.toUpperCase()
																			+ '</span>');
													list
															.push('<li class="capitalized"><a data-action="select-product" data-product_id="'
																	+ this.codigoProducto
																	+ '">'
																	+ label
																	+ '</a></li>');
												});
								$page.find('#search-list').html(list.join(''))
										.listview('refresh');

								// Verifica si los resultados locales son
								// identicos a los remotos y en tal caso muestra
								// un mensaje
								var sameLocalResults = true;
								$
										.each(
												data,
												function() {
													var itemExists = false;
													for (i = 0; i < localResults.rows.length; i++) {
														var item = localResults.rows
																.item(i);
														if (this.codigoProducto == item.id) {
															itemExists = true;
															break;
														}
													}
													if (!itemExists) {
														sameLocalResults = false;
													}
												})
								if (sameLocalResults) {
									$page
											.find('.products-loading')
											.text(
													'No se ha encontrado productos adicionales');
									setTimeout(function() {
										$('.products-loading').slideUp('fast');
									}, 2000);
								} else {
									$page.find('.products-loading').slideUp(
											'fast');
								}
							} else {
								$page.find('.products-loading').slideUp('fast');
								$page
										.find('#search-list')
										.html(
												'<li>No se han encontrado productos</li>')
										.listview('refresh');
							}
						}
					},
					error : function() {
						$page.find('.products-loading').slideUp('fast');
					}
				});
			}
		} catch (err) {
			$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}
	}
	function getRecent() {
		try {
			$page.find('.products-loading').slideUp('fast');
			db
					.transaction(function(tx) {
						tx
								.executeSql(
										'SELECT * FROM wanted_products ORDER BY last_visit DESC LIMIT 10',
										[],
										function(tx, results) {
											var len = results.rows.length, i;
											if (len > 0) {
												var list = [];
												for (i = 0; i < len; i++) {
													var item = results.rows
															.item(i);
													list
															.push('<li class="capitalized"><a data-action="select-product" data-id="'
																	+ item.id
																	+ '">'
																	+ item.name
																	+ '</a></li>');
												}
												$page
														.find('#search-list')
														.html(
																'<li data-role="list-divider">Productos recientes</li>'
																		+ list
																				.join(''))
														.listview('refresh');
											}
										}, function(tx, error) {
											console.log(error);
										});
					});
		} catch (err) {
			console.log(err.message);
			console.log(err.stack);
		}
	}
})();