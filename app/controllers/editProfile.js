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
    text: "EDIT " +args.title, 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
   
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.editProfile.titleControl = custom; 
} 
//$.editProfileView.editProfile.hintText = args.title;
$.editProfileView.description.text  = "Edit your "+ args.module + " below:";

if(args.title == "Fullname"){
	$.editProfileView.editField.value = args.fullname;
}else{
	$.editProfileView.editField.value = args.email;
}


var doSave = function (){  
	/** User session**/
	var session = Ti.App.Properties.getString('session');
	
	var field = args.module;
	var value = $.editProfileView.editField.value;
	
	var url = API.updateUserProfile +"&session="+session+"&field="+field+"&value="+value;

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
	         	COMMON.createAlert('Authentication warning',res.data);
	         }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	$.activityIndicator.hide();
	        COMMON.createAlert('Network declined','Failed to contact with server. Please make sure your device are connected to internet.');
	     },
	     timeout : 10000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
};

$.saveButton.addEventListener('click', doSave); 
$.editProfile.addEventListener('open', function(e) {
	$.editProfileView.editField.focus();
});

$.btnBack.addEventListener('click', function(){  
	COMMON.closeWindow($.editProfile); 
}); 

/** close all editProfile eventListener when close the page**/
$.editProfile.addEventListener("close", function(){
	$.destroy();
    
    /* release function memory */
    doSave    = null;
});
