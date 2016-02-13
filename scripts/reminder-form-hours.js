//  Created by BAYTEQ on 13/08/12.
//  Copyright © 2013 BAYTEQ. All rights reserved.

(function(){
	var $page = $('#reminder-form-hours');
	var $form = $('#reminder-form').find('#reminder');
	$page
	    .on('pageinit', function() {
	    	try {
	    		$page.find('.time').on('tap',function () {
	            	
	    			var currentField = $(this);
	    			
	            	if (typeof Cordova !== "undefined" && device.platform=='Android') {
	            		window.plugins.datePicker.show({
	    		            date : new Date(),
	    		            mode : 'time',
	    		            allowOldDates : true	    		            
	    		        }, function(selectedDate) {
	    		            
	    		        	var value=selectedDate.split(' ')[1].split(':');
	    		        	$(this).val('');
			            	var duplicate = false;
			            	var hours = [];
			            	var contAuxi=0;
			            	var selDate = '';
			            	
			            	if(value[1].indexOf('PM')>0 && value[0]!='12'){					
		            			value[0] = value[0].replace('0','');
		            			value[0] = parseInt(value[0])+12;
        					}
		            		value[1]=value[1].split(' ')[0];			            		
		            		selDate=((value[0].length==1)?'0'+value[0]:value[0]) + ':' + ((value[1].length==1)?'0'+value[1]:value[1]);
		            		
			            	$page.find('[name="hours"]').each(function(){
			            		var existDate = $(this).val();
			            		var time = parseTime24(existDate);
			            		
			            		timeArray = time.split(':');
			            		var today = new Date();
			            		today.setHours(timeArray[0]);
			            		today.setMinutes(timeArray[1]);
			            		hours.push(today);

			            		time=((timeArray[0].length==1)?'0'+timeArray[0]:timeArray[0]) + ':' + ((timeArray[1].length==1)?'0'+timeArray[1]:timeArray[1]);          		
			            		
			            		if (time==selDate) {
			            			duplicate = true;
			            		}
			            		
			            	});
			            	if (!duplicate) {
			            		var newTime = selDate;
			            		newTimeArray = newTime.split(':');
			            		var date = new Date();
			            		date.setHours(newTimeArray[0]);
			            		date.setMinutes(newTimeArray[1]);
			            		hours.push(date);
				            	var date_sort_asc = function (date1, date2) {
				                    if (date1 > date2) return 1;
				                    if (date1 < date2) return -1;
				                    return 0;
				                };
				                hours.sort(date_sort_asc);
				                var list = [];
				                $.each(hours, function(){				                	
				                	var hour = dateFormat(this, 'hh:MM TT');
				                	list.push('<li><a href="#">'+hour+'<input type="hidden" name="hours" value="'+hour+'" /></a><a href="#" data-action="delete-hour" class="ui-li-aside" data-icon="delete">Eliminar</a></li>');
				                });
				                $page.find('#hours').html(list.join('')).listview('refresh');
			            		
			            	}else{
			            		showMessage('La hora seleccionada ya existe, favor seleccione otra hora.');
			            	}
			            	currentField.blur();
	    		            
	    		        	
	    		        });
	    			}
	            	
	            });
	    		
	    		
	    		if (typeof Cordova !== "undefined" && device.platform=='Android') {}
	            else{
	    		
			    	$page.find('.time').scroller($.extend({}, scrollerOptions, {
			            preset: 'time',
			            label:'Seleccione una hora',
			            width:100,
			            stepMinute:1,
			            minDate:null,
			            onSelect:function(value, inst){
			            	$(this).val('');
			            	var duplicate = false;
			            	var hours = [];
			            	$page.find('[name="hours"]').each(function(){
			            		var time = parseTime24($(this).val());
			            		timeArray = time.split(':');
			            		var today = new Date();
			            		today.setHours(timeArray[0]);
			            		today.setMinutes(timeArray[1]);
			            		hours.push(today);
			            		
			            		var auxComparar=(($(this).val().split(' ')[1]=='PM') ? ((parseInt($(this).val().split(' ')[0].split(':')[0])+12)+ ':' + $(this).val().split(' ')[0].split(':')[1]) : $(this).val().split(' ')[0]);
		            		
			            		if (value==auxComparar) {
			            			duplicate = true;
			            		}
			            		
			            	});
			            	if (!duplicate) {
			            		var newTime = parseTime24(value);
			            		newTimeArray = newTime.split(':');
			            		var date = new Date();
			            		date.setHours(newTimeArray[0]);
			            		date.setMinutes(newTimeArray[1]);
			            		hours.push(date);
				            	var date_sort_asc = function (date1, date2) {
				                    if (date1 > date2) return 1;
				                    if (date1 < date2) return -1;
				                    return 0;
				                };
				                hours.sort(date_sort_asc);
				                var list = [];
				                $.each(hours, function(){
				                	var hour = dateFormat(this, 'HH:MM');
				                	list.push('<li><a href="#">'+hour+'<input type="hidden" name="hours" value="'+hour+'" /></a><a href="#" data-action="delete-hour" class="ui-li-aside" data-icon="delete">Eliminar</a></li>');
				                });
				                $page.find('#hours').html(list.join('')).listview('refresh');
			            		
			            	}else{
			            		showMessage('La hora seleccionada ya existe, favor seleccione otra hora.');
			            	}
			            }
			        }));
	            }
		    	
		    	
		    	
		    	
		    	$page.find('form').on('submit', function(e) {
		    		e.preventDefault();
		    			switch($(this).data('action')) {
			    			case 'set-hours':
			    				var formData = $(this).serializeObject();
			    				if (typeof formData.hours!='undefined' && typeof formData.days!='undefined') {
				    				var hours = typeof formData.hours=='object'? formData.hours.join(',') : formData.hours;
				    				var days = typeof formData.days=='object'? formData.days.join(',') : formData.days;
				    				var repeat = $.extend(formData, {hours:hours, days:days});
				    				setRepeat(repeat);
				    				$(':mobile-pagecontainer').pagecontainer('change', 'reminder-form.html');
					    		}else{
					    			showMessage('Debe ingresar una hora y un día al menos para ingresar la repetición.',null,"Mensaje");
					    		}	
			    				break;
			    		}
		    	});
		    	$page.find('[data-action="change-tab"]').on('tap', function(){
		    		switch($(this).data('view')){
		    			case 'hours':
		    				$page.find('#hours-container').show();
		    				$page.find('#days').hide();
		    				break;
		    			case 'days':
		    				$page.find('#hours-container').hide();
		    				$page.find('#days').show();
		    				break;
		    		}
		    	});
	    	}catch(err){
				console.log(err.message);
				console.log(err.stack);
			}
	    })
		.on('pageshow', function(e, ui) {
			try {
				bindForm();
			}catch(err){
				console.log(err.message);
				console.log(err.stack);
			}
		})
		.on('tap', '[data-action="delete-hour"]', function(e){
    		try {
				e.preventDefault();
	    		$(this).parents('li').remove();
	    		$page.find('#hours').listview('refresh');
    		}catch(err){
				console.log(err.message);
				console.log(err.stack);
			}
    	});
	function setRepeat(repeat) {
		try {
	    	var days = repeat.days.split(',');
	    	
	    	data.reminderRepeat = repeat;
			data.reminderRepeat.repeatLabel = (days.length==7? 'Todos los días a las ' : 'Algunos días a las ')+repeat.hours;

			// $form.find('[name="repeat_type"]').val(repeat.repeat_type);
			// $form.find('[name="interval"]').val(repeat.interval);
			// $form.find('[name="hours"]').val(repeat.hours);
			// $form.find('[name="days"]').val(repeat.days);
			// $form.find('#repeat-label').text((days.length==7? 'Todos los días
			// a las ' : 'Algunos días a las ')+repeat.hours);
	    	
		}catch(err){
			console.log(err.message);
			console.log(err.stack);
		}
	}
    function bindForm() {
    	try {
	    	//Horas
	    	var a = $form.find('[name="hours"]').val();
	    	var b = a.split(',');
	    	$page.find('#hours').empty();
	    	if ($.trim(a)!='' && b.length > 0) { 
	    		var list = [];
	    		$.each(b, function(){
	    			list.push('<li><a href="#">'+this+'<input type="hidden" name="hours" value="'+this+'" /></a><a href="#" data-action="delete-hour" class="ui-li-aside" data-icon="delete">Eliminar</a></li>');
	    		});
	            $page.find('#hours').html(list.join('')).listview('refresh');
	        }
	    	
	    	var c = $form.find('[name="days"]').val();
	    	var d = c.split(',');			    	
	    	if ($.trim(c)!='' && d.length > 0) { 
	    		$page.find('[name="days"]').attr('checked', false).checkboxradio("refresh");
	    		$.each(d, function(){
	    			$page.find('[name="days"][value="'+this+'"]').attr('checked', true).checkboxradio("refresh");
	    		});
	        }else{
	        	$page.find('[name="days"]').attr('checked', true).checkboxradio("refresh");
	        }
    	}catch(err){
			console.log(err.message);
			console.log(err.stack);
		}	
    }
})();