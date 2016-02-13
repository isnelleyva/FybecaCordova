//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function(){
	var $page = $('#pharmacy-detail');
	$page
		.on('pageinit', function(event, data){
			$page.find('[data-action]').on('tap', function(e){
				e.preventDefault();
				switch($(this).data('action')){
					case 'show-map':
						$.publish(current_map+'-marker-detail', pharmacy_id);
						break;
				}
			});
		})
		.on('pageshow', function() {  
			
			$page.find('#ver-mapa').hide();
			
			try {
			    vaciar();
				loadDetail();
			}catch(err){
				console.log(err.message);
				console.log(err.stack);
			}
		});
	function vaciar(){
	    
	    $page.find(".field_name").empty();
	    $page.find(".field_distance").empty();
	    $page.find(".field_address").empty();
	    $page.find(".field_hours").empty();
	    $page.find(".field_phones").empty();
	    $page.find(".field_services").empty();
	    $page.find('.field_image').hide();
	    
	}
	function loadDetail(){
    	try {
    		
    		$.mobile.loading('show', {
				text : 'Cargando',
				textVisible : true,
				theme : 'b'
			});
				    
			invokeService({ 
				url: svb,
			    service: "pharmacies",
			    dataType: 'jsonp',
			    data: {
	                id:pharmacy_id,
	                longitude:pharmacy_lon,
                    latitude:pharmacy_lat
	            }, cache: {
	            	key: "Detail_" + pharmacy_id,
	                time: pharmaciesCacheTimeout
	            },
			            
	            success: function (response) {  
	                
	                var phones = response.telefonos.split(',');
                    var phonesHTML = [];
                    $.each(phones, function(){
                        var number = $.trim(this);
                        phonesHTML.push('<a href="tel:'+number+'">'+number+'</a>');
                    });
                    $page.find(".field_name").html(response.nombreFarmacia);
                    $page.find(".field_distance").html(pharmacy_distance+'km');
                    $page.find(".field_address").html(response.direccion);
                    $page.find(".field_phones").html(phonesHTML.join('<br />'));                            
                    $page.find(".field_hours").html(response.horarios);
                    $page.find(".field_services").html(response.servicios.join(','));
                    $.mobile.loading('hide');
	                
	            },error: function() { 
	            	showMessage(defaultErrorMsg,null,null);
	            	$.mobile.loading('hide');            	
	            }
	            
	        });
				    
		    invokeService({
	            url: svb,
	            service: "pharmacies",
	            dataType: 'jsonp',
	            data: {
	                sitecode:pharmacy_id  
	            }, cache: {
	            	key: "Image_" + pharmacy_id,
	                time: pharmaciesCacheTimeout
	            },
	            
	            success: function (response) {  
	                
	                $page.find('.field_image').show();
	                $page.find('.field_image').attr('src', 'data:'+response.mimeType+';base64,'+response.imageString);
	                
	                setTimeout(function(){
	                	 $page.find('#ver-mapa').show();						    						
					}, 1000);	
	                
	            },error: function() { 
	            	showMessage(defaultErrorMsg,null,null);
	            	$.mobile.loading('hide'); 
	            	
	            	setTimeout(function(){
	                	 $page.find('#ver-mapa').show();						    						
					}, 1000);
	            	
	            }
	            
	        });				    
					
    	}catch(err){
    		$.mobile.loading('hide');
			console.log(err.message);
			console.log(err.stack);
		}
    }
})();