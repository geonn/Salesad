var args = arguments[0] || {};

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "account",
	action: "view",
	label: "edit profile",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Edit Profile"
});
/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: args.title, 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
  
$.editProfile.titleControl = custom;

$.editProfile.hintText = args.title;
$.description.text  = "Edit your "+ args.module + " below:";

if(args.title == "Fullname"){
	$.editField.value = args.fullname;
}else{
	$.editField.value = args.email;
}


var doSave = function (){
	/** include required file**/
	var api = require('api');
	var common = require('common');
	
	/** User session**/
	var session = Ti.App.Properties.getString('session');
	
	var field = args.module;
	var value = $.editField.value;
	
	var url = api.updateUserProfile +"&session="+session+"&field="+field+"&value="+value;

	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	         var res = JSON.parse(this.responseText);
	         if(res.status == "success"){
	         	var member = Alloy.createCollection('member'); 
	         	if(field == "fullname"){
	         		args.fullname = value;
	         	}
	         	if(field == "email"){
	         		args.email = value;
	         	}
				member.updateUserProfile(session, args.fullname, args.email);
	         	$.editProfile.close({animated:true});
	         	Ti.App.fireEvent("updateProfile", {fullname:args.fullname, email:args.email });
	         }else{
	         	common.createAlert('Authentication warning',res.data);
	         }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	$.activityIndicator.hide();
	        common.createAlert('Network declined','Failed to contact with server. Please make sure your device are connected to internet.');
	     },
	     timeout : 10000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
};

 
$.editProfile.addEventListener('open', function(e) {
	$.editField.focus();
});

$.btnBack.addEventListener('click', function(){ 
	var nav = Alloy.Globals.navMenu; 
	nav.closeWindow($.editProfile); 
}); 

/** close all editProfile eventListener when close the page**/
$.editProfile.addEventListener("close", function(){
	$.destroy();
    
    /* release function memory */
    doSave    = null;
});
