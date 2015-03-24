var args = arguments[0] || {};

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "account",
	action: "view",
	label: "forgotpassword",
	value: 1
});
Alloy.Globals.tracker.trackScreen("Member Forgot Password");

/** include required file**/
var api = require('api');

/** To check if keyboard onfocus or onblur**/
var isKeyboardFocus = 0;
var isSubmit        = 0;
/*********************
*******FUNCTION*******
**********************/
var sendForgotPassword = function(){
	if(isSubmit == 1){
		return;
	}
	isSubmit = 1;
	$.activityIndicator.show();
	$.loadingBar.opacity = "1";
	$.loadingBar.height = "120";
	$.loadingBar.top = "100";
	//$.registerButton.hide();
	var common = require('common');
	var email 		     = $.email.value;
	
	if(email == ""){
		common.createAlert('Authentication warning','Please fill in email');
		$.activityIndicator.hide();
		isSubmit = 0;
		$.loadingBar.opacity = "0";
		return;
	}
	var url = api.forgotPassword + "&email="+email;
	
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	     	$.activityIndicator.hide();
	     	$.loadingBar.opacity = "0";
	         var res = JSON.parse(this.responseText);
	         if(res.status == "success"){
	         	 /** tag if user done forgot password action**/
	         	Ti.App.Properties.setString('isForgotPassword', 1);
	         	
				common.createAlert('Submitted successfully ', "Please check your email for activation code.");
				closeWindow(e);
				isSubmit = 0;
	         }else{
	         	isSubmit = 0;
	         	common.createAlert('Authentication warning',res.data.error_msg);
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

var closeWindow = function(e){
	$.forgotPassword.close({
			curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
			opacity: 0,
			duration: 300
	});
};


/*********************
*** Event Listener ***
**********************/
/** To fixed keyboard hide/show when textfield is activate**/
$.forgotPassword.addEventListener('touchend', function(e){
	if(isKeyboardFocus == 1){
		isKeyboardFocus = 0;
		return;
	}else{
		$.email.blur();
	    isKeyboardFocus = 0;
	}
});

$.email.addEventListener('touchend', function(e){
    $.email.focus();
    isKeyboardFocus = 1;
});

$.email.addEventListener("return", function(){
	sendForgotPassword();
});

$.forgotPassword.addEventListener('open', function(e){
    $.email.focus();
    isKeyboardFocus = 1;
});

/** close all register eventListener when close the page**/
$.forgotPassword.addEventListener("close", function(){
    $.destroy();
    
    /* release function memory */
    isKeyboardFocus = null;
    sendForgotPassword    = null;
    closeWindow = null;
});

