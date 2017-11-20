// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;
var deviceToken = Ti.App.Properties.getString('deviceToken');
var u_id = Ti.App.Properties.getString('u_id') || "";
var loading = Alloy.createController("loading");
var delete_mode = false;

function init(){
	$.win.add(loading.getView());
	var notification_onoff = Ti.App.Properties.getString('notification_onoff') || 1;
	if(notification_onoff != "1"){
		$.notification_switch.value = false;
	}
	refresh();
}

init();

function refresh(){
	loading.start();
	var u_id = Ti.App.Properties.getString('u_id') || 0;
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("13", u_id);
	API.callByPost({
		url: "getNotificationByUser",
		new: true,
		params: {u_id: u_id, last_updated: isUpdate.updated},
	},{onload: function(responseText){
		var model = Alloy.createCollection('notification');
		var res = JSON.parse(responseText);
		model.saveArray(res.data);
		checker.updateModule(13, "getNotificationByUser", res.last_updated, u_id);
		console.log("success call api");
		render_list();
		loading.finish();
	}});
	
}

function changeDeleteMode(){
	delete_mode = (delete_mode)?false:true;
	render_list();
}

function render_list(){
	
	var model = Alloy.createCollection('notification');
	var data = model.getList({u_id: u_id});
	var items = [];
	for (var i=0; i < data.length; i++) {
		console.log(data[i].is_read+" isread");
		var bgcolor = (data[i].is_read > 0)?"#f6f6f6":"#FFEA80";
		var delete_icon = (delete_mode)?"/images/icons/Icon_Delete.png":"";
		items.push({properties :{title: data[i].subject, image:delete_icon, color: "#404041", backgroundColor:bgcolor,  record: data[i]}});
	};
	console.log(items);
	$.listsection.setItems(items);
}

function navTo(e){
	if(delete_mode){
		loading.start();
		var item = e.section.getItemAt(e.itemIndex);
		item = item.properties;
		console.log(item.record.id);
		API.callByPost({
			url: "deleteNotification",
			new: true,
			params: {id: item.record.id},
		},{onload: function(responseText){
			var res = JSON.parse(responseText);
			if(res.status == "success"){
				console.log(e.section);
				console.log(e.itemIndex+" itemIndex");
				e.section.deleteItemsAt(e.itemIndex, 1);
			}
			loading.finish();
		}});
		return;
	}
	var item = e.section.getItemAt(e.itemIndex);
	item = item.properties;
	var model = Alloy.createCollection('notification');
	model.setIdAsRead({id: item.record.id});
	console.log(item);
	if(item.record.target == "webview"){ 
		var win = Alloy.createController("webview", {web_title: "Annoucement", url: "http://salesad.my/main/notification_announcement?announcement_id="+item.record.extra}).getView();
		COMMON.openWindow(win);
		return;
	}else if(item.record.target == "ad"){
		console.log(item.record.extra+" item.record.extra");
		COMMON.openWindow(Alloy.createController(item.record.target, {a_id: item.record.extra}).getView()); 
	}else if(item.record.target == "voucher_detail"){
		console.log(item.record.extra+" item.record.extra");
		COMMON.openWindow(Alloy.createController(item.record.target, {v_id: item.record.extra}).getView()); 
	}else if(item.record.target != ""){
		COMMON.openWindow(Alloy.createController(item.record.target, {}).getView()); 
	}
	render_list();
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
		    	Ti.App.Properties.setString("notification_onoff","0");
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
	}else{
		Ti.App.Properties.setString("notification_onoff", "1");
	}
	var notification_onoff = Ti.App.Properties.getString("notification_onoff");
	API.callByPost({
		url: "updateNotificationStatus",
		new: true,
		params: {deviceToken:deviceToken, u_id: u_id, notification_favourite: notification_onoff, notification_featured: notification_onoff}
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
};

function unsubcribe_feature(){
	Cloud.PushNotifications.unsubscribeToken({
        device_token: deviceToken,
        channel: 'sales',
        type: Ti.Platform.name == 'android' ? 'android' : 'ios'
    }, function (e) {
        if (e.success) {
        } else {
        }
    });
}

function subcribe_feature(){
	Cloud.PushNotifications.subscribeToken({
        device_token: deviceToken,
        channel: 'sales',
        type: Ti.Platform.name == 'android' ? 'android' : 'ios'
    }, function (e) {
        if (e.success) {
        } else {
        }
    });
}

function closeWindow(){
	COMMON.closeWindow($.win); 
}

$.win.addEventListener('android:back', function (e) {
	closeWindow();
});

$.btnBack.addEventListener('click', closeWindow); 

$.win.addEventListener("close", function(){
	Ti.App.fireEvent("updateNotificationNumber");
});
