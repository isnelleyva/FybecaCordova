(function(){
    var $page = $('#push-message-detail');
    var message = '';

    var viewModel = {
        back_home: function(){
            $.mobile.changePage('index.html');
        }
    };
    $page
        .on('pageinit', function() {

        	var pageUrl = $.url($page.data('url')), documentUrl = $.url(location.href);
            message = (pageUrl.param('msg') || documentUrl.param('msg'));
            console.log("XXXXX- Messages: "+message);

            /*try {
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
            }*/

            ko.applyBindings(viewModel, $page[0]);
        })
        .on('pageshow', function(){
            try {
            	/*if (deviceType == 'AND')
            		$('#index').attr('data-url', '/android_asset/www/index.html');*/

            	push_message = message;

            	$page.find("#push-message-text").append(push_message);
            }catch(err){
                console.log(err);                
            }   
        });    
    
})();