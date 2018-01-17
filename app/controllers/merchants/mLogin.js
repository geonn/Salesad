var args = arguments[0] || {};
COMMON.construct($); 
/** google analytics**/ 

/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'Advertiser Login', 
    color: '#ffffff', 
    width: Ti.UI.SIZE 
 });
  
$.login.titleControl = custom;

/** To check if keyboard onfocus or onblur**/
var isKeyboardFocus = 0;

if(Titanium.Platform.displayCaps.platformHeight > 480){
	$.loginLogo.width = 200;
	$.loginScrollView.height = 320;
}
 

var doForgotPassword = function(){
	var page = Alloy.createController('forgotPassword').getView();
  	page.open();
  	page.animate({
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
		opacity: 1,
		duration: 300
	});
};


function doLogin() {
	/** include required file**/
	var api = require('api');
	var common = require('common');
	
	$.activityIndicator.show();
	$.loadingBar.opacity = "1";
	$.loadingBar.height = "120";
	$.loadingBar.top = "100";
	
	//$.createAccountButton.hide();
	var username = $.username.value;
	var password = $.password.value;
	
	if(username == "" || password == ""){
		common.createAlert('Authentication warning','Please fill in username and password');
		$.activityIndicator.hide();
		$.loadingBar.opacity = "0";
		
		//$.createAccountButton.show();
		return;
	}
	
	var url = api.loginUser +"&username="+username+"&password="+password;

	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	     	$.activityIndicator.hide();
	     	$.loadingBar.opacity = "0";
	     	//$.createAccountButton.show();
	         var res = JSON.parse(this.responseText);
	         if(res.status == "success"){
	         	var member = Alloy.createCollection('member'); 
				member.updateUserSession(res.data.u_id, res.data.username, res.data.fullname, res.data.email, res.data.session);
	         	
	         	/** User session**/
	         	Ti.App.Properties.setString('u_id', res.data.u_id);
				Ti.App.Properties.setString('session', res.data.session);
	         	
	         	var isForgotPassword = Ti.App.Properties.getString('isForgotPassword');
	         	if(isForgotPassword == 1){
	         		var win = Alloy.createController("editPassword", {username:username }).getView(); 
					COMMON.openWindow(win); 
	         	}
	         	API.updateNotificationToken();
	         	$.login.close();
	         	
	         }else{
	         	common.createAlert('Authentication warning',res.data.error_msg);
	         }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	$.activityIndicator.hide();
	     	//$.createAccountButton.show();
			$.loadingBar.opacity = "0";
	        common.createAlert('Network declined','Failed to contact with server. Please make sure your device are connected to internet.');
	     },
	     timeout : 10000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
}

/** To fixed keyboard hide/show when textfield is activate**/
 
$.login.addEventListener('touchend', function(e){
	if(isKeyboardFocus == 1){
		isKeyboardFocus = 0;
		return;
	}else{
	    $.username.blur();
	    $.password.blur();
	    isKeyboardFocus = 0;
	}
});
$.username.addEventListener('touchend', function(e){
    $.username.focus();
    isKeyboardFocus = 1;
});
$.password.addEventListener('touchend', function(e){
    $.password.focus();
    isKeyboardFocus = 1;
});

$.username.addEventListener("return", function(){
	$.password.focus();
});

$.password.addEventListener("return", function(){
	doLogin();
});

$.btnBack.addEventListener('click', function(){  
	COMMON.closeWindow($.login); 
}); 

/** close all login eventListener when close the page**/
$.login.addEventListener("close", function(){
    $.destroy();
    $.username = null;
    /* release function memory */
    isKeyboardFocus = null;
   // goCreateAccount = null;
   doLogin         = null;
});
 