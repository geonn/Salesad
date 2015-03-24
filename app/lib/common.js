exports.createAlert = function(tt,msg){
	var box = Titanium.UI.createAlertDialog({
		title: tt,
		message: msg
	});
	box.show();
};
exports.todayDateTime = function(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();
	
	if(dd<10) {
	    dd='0'+dd;
	} 
	
	if(mm<10) {
	    mm='0'+mm;
	} 
	
	today = yyyy+'-'+mm+'-'+ dd + " "+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	return today;
};