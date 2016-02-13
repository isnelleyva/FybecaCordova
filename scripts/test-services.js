//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function() {
	var $page = $('#test-services');
	var $content = $page.find("[data-role=content]");
	$content.html('<H3>TIEMPO DE RESPUESTA POR SERVICIO</H3><button id="newTest" value="Nuevo Test"/><br /><br /><p></p>');
	$.mobile.loading('show', {
		text : 'Cargando',
		textVisible : true,
		theme : 'b'
	});
	// var list = Array();

	testServices();

	$page.find("#newTest").on("tap", function() {
		$page.find("p").html("");
		testServices();
	});

	function testServices() {
		var count0 = 0;
		var timer0 = $.timer(function() {
			count0++;
		}, 0, true);

		// OBTENER CATEGORIAS
		$.ajax({
			url : svf + "obtenerCategorias?callback=?",
			dataType : 'jsonp',
			data : {
				codigoAplicacion : "a53bb12412",
				callback : "callback123"
			},
			complete : function(data) {
				timer0.pause();
				$.mobile.loading('hide');
				// alert(count0);
				$content.find("p").append("OBTENER CATEGORIAS: " + (count0 * 5) + "ms<br /><br />");
				var count1 = 0;
				var timer1 = $.timer(function() {
					count1++;
				}, 0, true);

				// OBTENER PRODUCTOS POR CATEGORIAS
				$.ajax({
					url : svf + "obtenerProductosPorCategorias?callback=?",
					dataType : 'jsonp',
					data : {
						codigoCasa : '6775',
						codUltProdConsultado : '0',
						filtro : '',
						codigoAplicacion : "a53bb1241"
					},
					complete : function(data) {
						timer1.pause();
						// alert("count1: " + count1*5);
						// list.push("OBTENER PRODUCTOS POR CATEGORIAS:
						// "+(count1*5)+"ms");
						$content.find("p").append("OBTENER PRODUCTOS POR CATEGORIAS: " + (count1 * 5) + "ms<br /><br />");
						var count2 = 0;
						var timer2 = $.timer(function() {
							count2++;
						}, 1, true);
						// BUSCAR PRODUCTOS POR NOMBRE
						$.ajax({
							url : svf + "buscarProductoPorNombre?callback=?",
							dataType : 'jsonp',
							data : {
								busqueda : 'aspi',
								codigoAplicacion : "a53bb1241"
							},
							complete : function(data) {
								timer2.pause();
								// alert("count2: " + count2*5);
								// list.push("BUSCAR PRODUCTOS POR NOMBRE:
								// "+(count2*5)+"ms");
								$content.find("p").append("BUSCAR PRODUCTOS POR NOMBRE: " + (count2 * 5) + "ms<br /><br />");
								var count3 = 0;
								var timer3 = $.timer(function() {
									count3++;
								}, 1, true);
								// OBTENER PRESENTACIONES DE PRODUCTO
								$.ajax({
									url : svf + "obtenerPresentacionesProductos?callback=?",
									dataType : 'jsonp',
									data : {
										codigoProducto : '2171',
										codigoAplicacion : "a53bb1241"
									},
									complete : function(data) {
										timer3.pause();
										// alert("count3: " + count3*5);
										// list.push("OBTENER PRESENTACIONES DE
										// PRODUCTO: "+(count3*5)+"ms");
										$content.find("p").append("OBTENER PRESENTACIONES DE PRODUCTO: " + (count3 * 5) + "ms<br /><br />");
										var count4 = 0;
										var timer4 = $.timer(function() {
											count4++;
										}, 1, true);
										// //OBTENER INFO DE PRODUCTO
										$.ajax({
											url : svf + "obtenerInfoProducto?callback=?",
											dataType : 'jsonp',
											data : {
												codigoItem : '5577',
												codigoTipoInfo : '8',
												codigoAplicacion : "a53bb1241"
											},
											complete : function(data) {
												timer4.pause();
												// alert("count4: " + count4*5);
												// list.push("OBTENER INFO DE
												// PRODUCTO: "+(count4*5)+"ms");
												$content.find("p").append("OBTENER INFO DE PRODUCTO: " + (count4 * 5) + "ms<br /><br />");
												var count5 = 0;
												var timer5 = $.timer(function() {
													count5++;
												}, 1, true);
												// BUSCAR FARMACIAS CERCANAS SIN
												// IMPORTAR EL STOCK DE UN
												// PRODUCTO
												$.ajax({
													url : svb + "pharmacies/",
													dataType : 'jsonp',
													data : {
														latitude : '-0.2046089',
														longitude : '-78.4840715'
													},
													complete : function(data) {
														timer5.pause();
														// alert("count5: " +
														// count5*5);
														// list.push("BUSCAR
														// FARMACIAS CERCANAS:
														// "+(count5*5)+"ms");
														// $page.find("[data-role=content]").html("<p>"+list.join("<br
														// /><br />")+"</p>");
														$content.find("p").append("BUSCAR FARMACIAS CERCANAS SIN IMPORTAR EL STOCK DE UN PRODUCTO: " + (count5 * 5) + "ms<br /><br />");

														var count6 = 0;
														var timer6 = $.timer(function() {
															count6++;
														}, 1, true);
														// BUSCAR FARMACIAS
														// CERCANAS CON STOCK DE
														// UN PRODUCTO
														$.ajax({
															url : svb + "pharmacies/",
															dataType : 'jsonp',
															data : {
																code : "5577",
																minStock : "30",
																unit : "U",
																latitude : '-0.2046089',
																longitude : '-78.4840715'
															},
															complete : function(data) {
																timer6.pause();
																// alert("count6:
																// " +
																// count6*5);
																$content.find("p").append("BUSCAR FARMACIAS CERCANAS CON STOCK DE UN PRODUCTO: " + (count6 * 5) + "ms<br /><br />");
																$.mobile.loading('hide');
															}
														});
													}
												});

											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}

})();
