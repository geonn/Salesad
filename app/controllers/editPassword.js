var args = arguments[0] || {};
$.editPasswordView.username.text = args.username;
/** google analytics**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "account",
		action: "view",
		label: "edit password",
		value: 1
	}); 
	Alloy.Globals.tracker.trackScreen({
		screenName: "Edit Password"
	});
}else{ 
	Alloy.Globals.tracker.addEvent({
        category: "account",
		action: "view",
		label: "edit password",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView('Edit Password');
}
var isSubmit        = 0;

var doSave = function(){
	if(isSubmit == 1){
		return;
	}
	isSubmit = 1; 
	/** User session**/
	var session = Ti.App.Properties.getString('session');
	
	$.editPasswordView.activityIndicator.show();
	$.editPasswordView.loadingBar.opacity = "1";
	$.editPasswordView.loadingBar.height = "120";
	$.editPasswordView.loadingBar.top = "100";
	
	//Check if password match
	if($.editPasswordView.editPasswordField.value !== $.editPasswordView.editConfirmPasswordField.value){
		COMMON.createAlert('Password Mismatch', 'Both password must be match.');
		isSubmit = 0;
		return;	
	}
	
	var url = API.updateUserPassword +"&session="+session+"&current_password="+$.editPasswordView.currentPasswordField.value+"&password="+$.editPasswordView.editPasswordField.value;

	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	         var res = JSON.parse(this.responseText);
	         $.editPasswordView.activityIndicator.hide();
	         $.editPasswordView.loadingBar.opacity = "0";
	         isSubmit = 0;
	         if(res.status == "success"){
	         	/** remove forgot password action**/
	         	Ti.App.Properties.removeProperty('isForgotPassword');
	         	
	         	$.editPasswordWin.close({animated:true});
	         }else{
	         	COMMON.createAlert('Update failed',res.data.error_msg);
	         }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	$.editPasswordView.activityIndicator.hide();
	     	$.editPasswordView.loadingBar.opacity = "0";
	     	isSubmit = 0;
	        COMMON.createAlert('Network declined','Failed to contact with server. Please make sure your device are connected to internet.');
	     },
	     timeout : 10000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
};
$.button.addEventListener('click', doSave); 
$.editPasswordWin.addEventListener('open', function(e) {
	$.editPasswordView.currentPasswordField.focus();
});

$.btnBack.addEventListener('click', function(){  
	COMMON.closeWindow($.editPasswordWin); 
}); 

/** close all editProfile eventListener when close the page**/
$.editPasswordWin.addEventListener("close", function(){
	$.destroy();
    
    /* release function memory */
    doSave    = null;
});
