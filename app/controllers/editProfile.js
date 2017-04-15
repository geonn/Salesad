var args = arguments[0] || {};

/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: "EDIT " +args.title, 
    color: '#ED1C24', 
    width: Ti.UI.SIZE 
 });
   
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.editProfile.titleControl = custom; 
} 
//$.editProfile.hintText = args.title;
$.description.text  = "Edit your "+ args.module + " below:";
if(args.title == "Firstname"){
	$.editField.value = args.firstname;
}
else if(args.title == "Lastname"){
	$.editField.value = args.lastname;
}else{
	$.editField.value = args.email;
}


var doSave = function (){  
	/** User session**/
	var session = Ti.App.Properties.getString('session');
	
	var field = args.module;
	var value = $.editField.value;
	
	var url = API.updateUserProfile +"&session="+session+"&field="+field+"&value="+value;

	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	         var res = JSON.parse(this.responseText);
	         if(res.status == "success"){
	         	Ti.App.Properties.setString(field, value);
	         	$.editProfile.close({animated:true});
	         	Ti.App.fireEvent("updateProfile");
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

$.editProfile.addEventListener('open', function(e) {
	$.editField.focus();
});

function closeWindow() {
	COMMON.closeWindow($.editProfile);
}

/** close all editProfile eventListener when close the page**/
$.editProfile.addEventListener("close", function(){
	$.destroy();
    
    /* release function memory */
    doSave    = null;
});

$.editProfile.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.editProfile); 
});
