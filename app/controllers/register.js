var args = arguments[0] || {};

/** google analytics**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "account",
		action: "view",
		label: "register",
		value: 1
	}); 
	Alloy.Globals.tracker.trackScreen({
		screenName: "Member Register"
	});
}else{ 
	Alloy.Globals.tracker.addEvent({
        category: "account",
		action: "view",
		label: "register",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView('Member Register');
}
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
	console.log($.gender.record.id+" $.gender.record.id");
	var common = require('common');
	var firstname 		 = $.firstname.value;
	var lastname 		 = $.lastname.value;
	var gender 		 = $.gender.record.id;
	var email 		     = $.email.value;
	var password 		 = $.password.value;
	var password2 		 = $.confirm_password.value;
	var url = api.registerUser +"&firstname="+firstname+"&lastname="+lastname+"&gender="+gender+"&email="+email+"&password="+password+"&password2="+password2;
	
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	     	$.activityIndicator.hide();
	     	$.loadingBar.opacity = "0";
	         var res = JSON.parse(this.responseText);
	         console.log(res);
	         if(res.status == "success"){
	         	 
	         	//save session
	         	Ti.App.Properties.setString('u_id', res.data.u_id);
	         	Ti.App.Properties.setString('firstname', res.data.firstname);
	         	Ti.App.Properties.setString('lastname', res.data.lastname);
	         	Ti.App.Properties.setString('email', res.data.email);
	         	Ti.App.Properties.setString('gender', res.data.gender);
				Ti.App.Properties.setString('session', res.data.session);
	         	/**load new set of category from API**/
		       	
		       	
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

function popDialogOption(e){
	var source = parent({name: "master", value: "1"}, e.source);
	var picker_list = [{name: "Male", id: 1}, {name: "Female", id: 2}];
	var options = _.pluck(picker_list, "name");
	options.push("Cancel");
	var dialog = Ti.UI.createOptionDialog({
	  cancel: options.length - 1,
	  options: options,
	  title: 'Category'
	});
	dialog.show();
	dialog.addEventListener("click", function(ex){   
		if(ex.index != options.length - 1){
			source.record = picker_list[ex.index];
			source.children[0].text = picker_list[ex.index].name;
			source.children[0].color = "#404041";
		}
	});
}

/*********************
*** Event Listener ***
**********************/
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