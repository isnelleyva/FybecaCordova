(function(){
    var $page = $('#push-message-detail');
    
    $page
        .on('pageinit', function() {
        	
            try {
                $page.on('tap', '[data-action]', function(e){
                    e.preventDefault();
                    
                    switch($(this).data('action')) {
                        case 'go-home':
                        	push_message = '';
                        	
                        	if (navigator.userAgent.indexOf('Android') > -1) {
                				location.href='index.html';	                                				
                	        } else {
                	        	$(':mobile-pagecontainer').pagecontainer('change', 'index.html');
                	        }
                        	
                            break;                        
                    }                    
                });
            }catch(err){
                console.log(err);                
            }
        })
        .on('pageshow', function(){
            try {
            	if (deviceType == 'AND')
            		$('#index').attr('data-url', '/android_asset/www/index.html');
            	$page.find("#push-message-text").append(push_message);
            }catch(err){
                console.log(err);                
            }   
        });    
    
})();