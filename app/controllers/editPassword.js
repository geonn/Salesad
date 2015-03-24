var args = arguments[0] || {};
$.username.text = args.username;
/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "account",
	action: "view",
	label: "edit password",
	value: 1
});
Alloy.Globals.tracker.trackScreen("Edit Password");

var isSubmit        = 0;

var doSave = function(){
	if(isSubmit == 1){
		return;
	}
	isSubmit = 1;
	
	/** include required file**/
	var api = require('api');
	var common = require('common');
	
	/** User session**/
	var session = Ti.App.Properties.getString('session');
	
	$.activityIndicator.show();
	$.loadingBar.opacity = "1";
	$.loadingBar.height = "120";
	$.loadingBar.top = "100";
	
	//Check if password match
	if($.editPasswordField.value !== $.editConfirmPasswordField.value){
		common.createAlert('Password Mismatch', 'Both password must be match.');
		isSubmit = 0;
		return;	
	}
	
	var url = api.updateUserPassword +"&session="+session+"&current_password="+$.currentPasswordField.value+"&password="+$.editPasswordField.value;

	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	         var res = JSON.parse(this.responseText);
	         $.activityIndicator.hide();
	         $.loadingBar.opacity = "0";
	         isSubmit = 0;
	         if(res.status == "success"){
	         	/** remove forgot password action**/
	         	Ti.App.Properties.removeProperty('isForgotPassword');
	         	
	         	$.editPasswordWin.close({animated:true});
	         }else{
	         	common.createAlert('Update failed',res.data.error_msg);
	         }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	$.activityIndicator.hide();
	     	$.loadingBar.opacity = "0";
	     	isSubmit = 0;
	        common.createAlert('Network declined','Failed to contact with server. Please make sure your device are connected to internet.');
	     },
	     timeout : 10000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
};

$.editPasswordWin.addEventListener('open', function(e) {
	$.currentPasswordField.focus();
});

$.btnBack.addEventListener('click', function(){ 
	var nav = Alloy.Globals.navMenu; 
	nav.closeWindow($.editPasswordWin); 
}); 

/** close all editProfile eventListener when close the page**/
$.editPasswordWin.addEventListener("close", function(){
	$.destroy();
    
    /* release function memory */
    doSave    = null;
});
