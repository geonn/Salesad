var args = arguments[0] || {}; 

/** google analytics**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "settings",
		action: "view",
		label: "push notification settings",
		value: 1
	}); 
	Alloy.Globals.tracker.trackScreen({
		screenName: "Push Notification Settings"
	});
}else{ 
	Alloy.Globals.tracker.addEvent({
        category: "settings",
		action: "view",
		label: "push notification settings",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView('Push Notification Settings');
}
/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'Push Notification', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
 
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.notification.titleControl = custom; 
}  

//load user settings
var isNotification = Ti.App.Properties.getString('notification');
if(isNotification != "1"){
	$.notiSwitch.value = "false";
}

$.btnBack.addEventListener('click', function(){  
	COMMON.closeWindow($.notification); 
}); 

var changeStatus = function(e){
	
	if(e.source.value == "0"){
		var dialog = Ti.UI.createAlertDialog({
		    cancel: 1,
		    buttonNames: ['Cancel','Confirm'],
		    message: 'Are you sure want to turn off push notification?',
		    title: 'Push Notification'
		  });
		  dialog.addEventListener('click', function(ex){
		    if (ex.index == 0){
		    	$.notiSwitch.value = "true";
		    	Ti.App.Properties.setString('notification',"1");
				return;
		    }
		 });
	
		dialog.show();
	}
	
	//update push notification to server
	Ti.App.Properties.setString('notification',e.source.value);
	API.updateNotificationToken();
	
}; 
$.pushNotificationSettingsView.notiSwitch.addEventListener('change',changeStatus);