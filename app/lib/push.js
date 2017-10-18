var Cloud = require('ti.cloud'); 
var app_status;
var redirect = true;

// Process incoming push notifications
function receivePush(e) {   

	var params = (OS_IOS)?e.data.extra:e.extra;
	var target = (OS_IOS)?e.data.target:e.target;
	
	result = params.split("_"); 
	params.replace('"', "");
	params.replace("'", "");
	params = '"'+params+'"'; 
	var res_param = JSON.parse(params);
	//console.log(res_param); 
		
	if(res_param.m_id != "" && res_param.a_id != "" ){ 
		Ti.App.fireEvent('app:goToAds', {m_id:  res_param.m_id, a_id: res_param.a_id, isFeed : 1, target: target});
	}else if(res_param.m_id != "" && res_param.a_id == "" ){
		Ti.App.fireEvent('app:goToAds', {m_id: res_param.m_id,a_id: "" , isFeed : 1, target: target });
	}else if(res_param.v_id == "" ){
		Ti.App.fireEvent('app:goToAds', {v_id: res_param.v_id, isFeed : 1, target: target });
	}
	Ti.App.fireEvent('refresh_notification');
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
		 
			
			Cloud.PushNotifications.unsubscribe({
			    channel: 'sales',
			    device_token: deviceToken
			}, function (ey) {
			    if (ey.success) {
			       Cloud.PushNotifications.subscribe({
					    channel: 'sales',
					    type:Ti.Platform.name == 'android' ? 'android' : 'ios', 
					    device_token: deviceToken
					}, function (e) { 
					    if (e.success  ) { 
					     
					    	/** User device token**/
			         		Ti.App.Properties.setString('deviceToken', deviceToken);
			     	
							API.updateNotificationToken();
							 
					    } else {
					    	registerPush();
					    }
					});
			    } else {
			    	Cloud.PushNotifications.subscribe({
					    channel: 'sales',
					    type:Ti.Platform.name == 'android' ? 'android' : 'ios', 
					    device_token: deviceToken
					}, function (e) { 
					    if (e.success  ) { 
					     
					    	/** User device token**/
			         		Ti.App.Properties.setString('deviceToken', deviceToken); 
							API.updateNotificationToken();
							
							 
					    } else {
					    	registerPush();
					    }
					});

			        console.log('Error:\n' + ((ey.error && ey.message) || JSON.stringify(ey)));
			    }
			});
		/**	
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
		**/	
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