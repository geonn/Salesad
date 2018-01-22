var args = {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var pwidth = Titanium.Platform.displayCaps.platformWidth;
var adsClick = [];
Alloy.Globals.navMenu = $.navMenu;
var PUSH = require("push");
PUSH.registerPush();

function init(){
	if(OS_IOS){
		$.navMenu.open({fullscreen:true});
		loadingView.getView().close();
	}else{
		$.indexView.win.open();
	}

	var url = "";
	if(OS_IOS){
		cmd = Ti.App.getArguments();
		url = cmd.url;
	}else{
		if(global_url != null && global_url != ""){
			url = global_url;
		}
	}
	if (url != "" && typeof(url) != "undefined") {
        var details = url;
        var arg = details.split("://"); 
        var ads = arg[1].split("?");
        var win = Alloy.createController(ads[0], {a_id:  ads[1], from : "home"}).getView();
		COMMON.openWindow(win);
        Ti.API.info('Resumed with url = ' + Ti.App.launchURL );
	    Ti.App.Properties.setString('global_url', "");
	}
}

// convert pixel to dp.
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

/*********************
*** Event Listener ***
**********************/
/*
$.nearby.addEventListener("click", function(e){
	var win = Alloy.createController("nearby").getView();
	if(OS_ANDROID) {
		var hasLocationPermissions = Ti.Geolocation.hasLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS);
	    if (hasLocationPermissions) {
			if (Ti.Geolocation.locationServicesEnabled) {
				COMMON.openWindow(win);
			}else {
				alert("Please open your GPS.");
			}
	    }else {
	    	Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
				if(e.success) {
					if (Ti.Geolocation.locationServicesEnabled) {
						COMMON.openWindow(win);
					}else {
						alert("Please open your GPS.");
					}
				}else {
					alert("You denied permission for now, forever or the dialog did not show at all because it you denied forever before.");
				}
			});
	    }
	}else {
		Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
			if(e.success) {
				if (Ti.Geolocation.locationServicesEnabled) {
					COMMON.openWindow(win);
				}else {
					alert("Please open your GPS.");
				}
			}else {
				alert("You denied permission for now, forever or the dialog did not show at all because it you denied forever before.");
			}
		});
	}
});

/** EventListerner for notification **/

/** Android Click to refresh **/
if(Ti.Platform.osname == "android"){
	// trigger if user click back
	$.indexView.win.addEventListener('android:back', function (e) {
		var dialog = Ti.UI.createAlertDialog({
			    cancel: 1,
			    buttonNames: ['Cancel','Confirm'],
			    message: 'Would you like to exit SalesAd?',
			    title: 'Exit app'
		});
		dialog.addEventListener('click', function(e){
			 	if(e.button === false){
			  		return e.button;
			  	}
		    	if (e.index === e.source.cancel){
			      //Do nothing
			    }
			    if (e.index === 1){ 
			    	var activity = Titanium.Android.currentActivity;
					activity.finish();
			    }
		});
		dialog.show(); 
	});
}

var SCANNER = require("scanner");

function QrScan(){
    if(Ti.Media.hasCameraPermissions()){
		SCANNER.openScanner("4");
    }else{
        Ti.Media.requestCameraPermissions(function(e) {
        	if(e.success){
				SCANNER.openScanner("4");				       
	        }
        	else{
        		alert("You denied permission.");
        	}			        
        });	        	
    }	

}

API.loadAPIBySequence({});

init();
