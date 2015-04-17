var args = arguments[0] || {};

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "account",
	action: "view",
	label: "register",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Member Register"
});
/** include required file**/
var api = require('api');

/** To check if keyboard onfocus or onblur**/
var isKeyboardFocus = 0;
var isSubmit        = 0;
/*********************
*******FUNCTION*******
**********************/
var goSignUp = function(){
	
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
	var username 		 = $.username.value;
	var fullname 		 = $.fullname.value;
	var email 		     = $.email.value;
	var password 		 = $.password.value;
	var password2 		 = $.confirm_password.value;
	var url = api.registerUser +"&username="+username+"&fullname="+fullname+"&email="+email+"&password="+password+"&password2="+password2;
	
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	     	$.activityIndicator.hide();
	     	$.loadingBar.opacity = "0";
	         var res = JSON.parse(this.responseText);
	         console.log(res);
	         if(res.status == "success"){
	         	 
	         	//save session
	         	Ti.App.Properties.setString('session',res.data.session);
	         	/**load new set of category from API**/
		       	
		       	var member = Alloy.createModel('member', {
				        u_id       : res.data.userid,
				        username   : res.data.username,
				        fullname   : res.data.fullname,
				        email      : res.data.email
				    });
				member.save();
				
				common.createAlert('Successfully register', "Thank you sign up with Salesad. Please login to continue.");
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
	$.register.close({
			curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
			opacity: 0,
			duration: 300
	});
};


/*********************
*** Event Listener ***
**********************/
/** To fixed keyboard hide/show when textfield is activate**/
$.register.addEventListener('touchend', function(e){
	if(isKeyboardFocus == 1){
		isKeyboardFocus = 0;
		return;
	}else{
		$.username.blur();
	    $.email.blur();
	    $.fullname.blur();
	    $.password.blur();
	    $.confirm_password.blur();
	    isKeyboardFocus = 0;
	}
});

$.username.addEventListener('touchend', function(e){
    $.username.focus();
    isKeyboardFocus = 1;
});
$.email.addEventListener('touchend', function(e){
    $.email.focus();
    isKeyboardFocus = 1;
});
$.fullname.addEventListener('touchend', function(e){
    $.fullname.focus();
    isKeyboardFocus = 1;
});
$.password.addEventListener('touchend', function(e){
    $.password.focus();
    isKeyboardFocus = 1;
});
$.confirm_password.addEventListener('touchend', function(e){
    $.confirm_password.focus();
    isKeyboardFocus = 1;
});

$.username.addEventListener("return", function(){
	$.fullname.focus();
});
$.fullname.addEventListener("return", function(){
	$.email.focus();
});
$.email.addEventListener("return", function(){
	$.password.focus();
});
$.password.addEventListener("return", function(){
	$.confirm_password.focus();
});
$.confirm_password.addEventListener("return", function(){
	goSignUp();
});
/** close all register eventListener when close the page**/
$.register.addEventListener("close", function(){
    $.destroy();
    
    /* release function memory */
    isKeyboardFocus = null;
    goSignUp    = null;
    closeWindow = null;
});