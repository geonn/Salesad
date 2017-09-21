var args = arguments[0] || {}; 
var deviceToken = Ti.App.Properties.getString('deviceToken');
var u_id = Ti.App.Properties.getString('u_id');

/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'Notifications', 
    color: '#ED1C24', 
    width: Ti.UI.SIZE 
 });
 
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.notification.titleControl = custom; 
}  

//load user settings
var isNotification = Ti.App.Properties.getString('notification');
var isNotificationFeatured = Ti.App.Properties.getString('notification_featured');
if(isNotification != "1"){
	$.notiSwitch.value = false;
}

if(isNotificationFeatured != "1"){
	$.notiSwitch_featured.value = false;
}

function closeWindow(){
	COMMON.closeWindow($.notification); 
}

var changeStatus = function(e){
	
	if(e.source.value == "0"){
		var dialog = Ti.UI.createAlertDialog({
		    cancel: 1,
		    buttonNames: ['Cancel','Confirm'],
		    message: 'You might miss out great sales & deals.',
		    title: 'Confirm to switch off push notification?'
		  });
		  dialog.addEventListener('click', function(ex){
		    if (ex.index == 1){
		    	e.source.value = false;
		    	Ti.App.Properties.setString(e.source.notification_title,"0");
		    	if(e.source.notification_title == "notification_featued"){
					unsubcribe_feature();
				}
				return;
		    }
		    else{
		    	e.source.value = true;
		    }
		 });
	
		dialog.show();
	}
	if(e.source.notification_title == "notification_featued"){
		subcribe_feature();
	}
	//update push notification to server
	Ti.App.Properties.setString(e.source.notification_title, "1");
	API.callByPost({
		url: "updateNotificationStatus",
		new: true,
		params: {deviceToken:deviceToken, u_id: u_id, notification_favourite: Ti.App.Properties.getString('notification'), notification_featured: Ti.App.Properties.getString('notification_featured')}
	}, 
	{
		onload: function(responseText){
		},
		onerror: function(err){
			_.isString(err.message) && alert(err.message);
		},
		onexception: function(){
			COMMON.closeWindow($.win);
		}
	});
	//API.updateNotificationToken();
}; 

function unsubcribe_feature(){
	/*Cloud.PushNotifications.unsubscribeToken({
        device_token: deviceToken,
        channel: 'featured',
        type: Ti.Platform.name == 'android' ? 'android' : 'ios'
    }, function (e) {
        if (e.success) {
        } else {
        }
    });*/
}

function subcribe_feature(){
	/*Cloud.PushNotifications.subscribeToken({
        device_token: deviceToken,
        channel: 'featured',
        type: Ti.Platform.name == 'android' ? 'android' : 'ios'
    }, function (e) {
        if (e.success) {
        } else {
        }
    });*/
}
$.notiSwitch.addEventListener('change',changeStatus);
$.notiSwitch_featured.addEventListener('change',changeStatus);

$.notification.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.notification); 
});