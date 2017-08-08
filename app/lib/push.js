var Cloud = require('ti.cloud'); 
var app_status;
var redirect = true;

// Process incoming push notifications
function receivePush(e) {   
	
	if(OS_IOS){
		var params = e.data.extra; 
	}else{
		var params = e.extra; 
	}
	result = params.split("_");  
	if(result.length > 1){	
		
		Ti.App.fireEvent('app:goToAds', {m_id: result[0],a_id: result[1], isFeed : 1 });
	}else{ 
		Ti.App.fireEvent('app:goToAds', {m_id: result[0], a_id: "", isFeed : 1});
	}
	return false;
}

if(OS_ANDROID){ 
	var CloudPush = require('ti.cloudpush');
	// notification callback function (important)
	CloudPush.addEventListener('callback', function (evt) { 
		var payload = JSON.parse(evt.payload);  
		Ti.API.info('call back notification');  
		Ti.App.Payload = payload;
		// if trayClickLaunchedApp or trayClickFocusedApp set redirect as true 
		receivePush(payload);
 
	});
	 
	
	CloudPush.addEventListener('trayClickLaunchedApp', function (evt) {
		redirect = true;
		app_status = "not_running";
		var payload = JSON.parse(evt.payload);   
		Ti.App.Payload = payload;
		Ti.API.info('Tray Click Launched App (app was not running)');  
		receivePush(payload);
	    //getNotificationNumber(Ti.App.Payload);
	});
	CloudPush.addEventListener('trayClickFocusedApp', function (evt) {
		redirect = true;
		app_status = "running";
		var payload = JSON.parse(evt.payload);   
		Ti.API.info('Tray Click Focused App (app was already running)'); 
		receivePush(payload);
	}); 
}


function registerPush(){
	console.log("registerPush");
	if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
 
	 // Wait for user settings to be registered before registering for push notifications
	    Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {
	 
	 // Remove event listener once registered for push notifications
	        Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush); 
	 
	        Ti.Network.registerForPushNotifications({
	            success: deviceTokenSuccess,
	            error: deviceTokenError,
	            callback: receivePush
	        });
	    });
	 
	 // Register notification types to use
	    Ti.App.iOS.registerUserNotificationSettings({
		    types: [
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
	        ]
	    });
	}else if(Ti.Platform.osname == "android"){
		CloudPush.retrieveDeviceToken({
		    success: deviceTokenSuccess,
		    error: deviceTokenError
		});
	}else{
		Titanium.Network.registerForPushNotifications({
		    types: [
		        Titanium.Network.NOTIFICATION_TYPE_BADGE,
		        Titanium.Network.NOTIFICATION_TYPE_ALERT,
		        Titanium.Network.NOTIFICATION_TYPE_SOUND
		    ],
			success:deviceTokenSuccess,
			error:deviceTokenError,
			callback:receivePush
		});
	}
}

function deviceTokenSuccess(ev) {
    deviceToken = ev.deviceToken;
    console.log(deviceToken+" deviceToken");
    
}

function deviceTokenSuccess(ev) {
    deviceToken = ev.deviceToken;
    console.log("deviceToken:"+ deviceToken); 
    Cloud.Users.login({
	    login: 'geomilano',
	    password: '123456'
	}, function (e) { 
		if (e.success) {
			Cloud.PushNotifications.subscribe({
			    channel: 'sales',
			    device_token: deviceToken,
			    type: Ti.Platform.name == 'android' ? 'android' : 'ios'
			}, function (e) {
			    if (e.success) {
			    	//alert('Success : ' + deviceToken);
			    	/** User device token**/
		     		Ti.App.Properties.setString('deviceToken', deviceToken);
			     	
					API.updateNotificationToken();
			    } else {
			    //	alert('Success Error: ' + deviceToken);
			        registerPush();
			    }
			});
			
			Cloud.PushNotifications.subscribeToken({
		        device_token: ev.deviceToken,
		        channel: 'featured',
		        type: Ti.Platform.name == 'android' ? 'android' : 'ios'
		    }, function (e) {
		        if (e.success) {
		            console.log('Subscribed');
		        } else {
		            console.log('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
		        }
		    });
			
	    } else {
	    	  console.log('GEO NOT Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
	    }
	});

    
}


function deviceTokenError(e) {
    alert('Failed to register for push notifications! ' + e.error);
}

function setAppBadge(){
	console.log("setAppBadge");
	if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
 
	 // Wait for user settings to be registered before registering for push notifications
	    Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {
	 
	 // Remove event listener once registered for push notifications
	        Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush); 
	 
	        Ti.Network.registerForPushNotifications({
	            success: deviceTokenSuccess,
	            error: deviceTokenError,
	            callback: receivePush
	        });
	    });
	 
	 // Register notification types to use
	    Ti.App.iOS.registerUserNotificationSettings({
		    types: [
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
	            Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
	        ]
	    });
	}else if(Ti.Platform.osname == "android"){
		CloudPush.retrieveDeviceToken({
		    success: deviceTokenSuccess,
		    error: deviceTokenError
		});
	}else{
		Titanium.Network.registerForPushNotifications({
		    types: [
		        Titanium.Network.NOTIFICATION_TYPE_BADGE,
		        Titanium.Network.NOTIFICATION_TYPE_ALERT,
		        Titanium.Network.NOTIFICATION_TYPE_SOUND
		    ],
			success:deviceTokenSuccess,
			error:deviceTokenError,
			callback:receivePush
		});
	}
	
}

function getNotificationNumber(payload){ 
	 
}

Ti.App.addEventListener("pause", function(e){ 
	var theWindow = Ti.App.Properties.getString('currentAppointmentWindow') || "";
	if(theWindow == "1"){
		redirect = false;
	}else{
		redirect = true;
	}
	console.log('sleep : '+ theWindow );
});

Ti.App.addEventListener("resumed", function(e){
	
	var theWindow = Ti.App.Properties.getString('currentAppointmentWindow') || "";
	if(theWindow == "1"){
		redirect = false;
	}else{
		redirect = true;
	}
	
	
});

exports.setInApp = function(){
	console.log('In App');
	redirect = false;
};

exports.registerPush = function(){
	registerPush();
};