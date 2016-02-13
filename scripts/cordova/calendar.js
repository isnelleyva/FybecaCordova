var Calendar = function() { 

};

//Calendar.ACTION_SEND = "android.intent.action.SEND";

Calendar.prototype.addEvent = function(options) {
    
    var defaults = {
//            date: options.fecha,
//            initHour: options.horaInicial,
//            endHour: options.horaFinal,
    		initTime:options.timeInicial,
    		endTime:options.timeFinal,
    		days:options.dias,
            nombreEvento: options.nombreEvento,
            descripcionEvento: options.descripcionEvento,
            city: options.city,
     };
    
   
    PhoneGap.exec(null, null, 'Calendar', 'addEvent', new Array(defaults));
};

window.calendar=new Calendar();