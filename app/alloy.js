// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};
var _ = require('underscore')._;
Alloy.Globals.Map =  (OS_IOS || OS_ANDROID) ? require('ti.map') : Ti.Map;
if(OS_IOS){
	var GA = require('analytics.google');
	Alloy.Globals.tracker = GA.getTracker("UA-53651461-1");
}else{
	var GA =  require('ti.ga');
	Alloy.Globals.tracker = GA.createTracker({
	   trackingId:"UA-53651461-1" 
	});
}
 
Alloy.Globals.naviPath = [];
/** include required file**/
var API = require('api');
var COMMON = require('common'); 
var DBVersionControl = require('DBVersionControl');
DBVersionControl.checkAndUpdate();

var isNotification = Ti.App.Properties.getString('notification'); 
if(isNotification === null){
	Ti.App.Properties.setString('notification', "1");
}

/***Facebook Library***/ 
var FACEBOOK = require('facebook');
FACEBOOK.appid = "1593197804284763";
FACEBOOK.permissions = ['email','public_profile','user_friends']; // Permissions your app needs
FACEBOOK.initialize(1000); 
FACEBOOK.forceDialogAuth = true; 
 
var Cloud = require('ti.cloud');
 
Cloud.Users.login({
    login: 'geomilano',
    password: '123456'
}, function (e) {
	if (e.success) {
		var user = e.users[0];
		//console.log(e);
    } else {
    	// alert('B Error: ' + JSON.stringify(e));
      //  alert("Error :"+e.message);
    }
});

// Process incoming push notifications
function receivePush(e) {
	var params = e.data.extra; 
	result = params.split("_"); 
	if(result.length > 1){	
		Ti.App.fireEvent('app:goToAds', {m_id: result[0],a_id: result[1], isFeed : 1 });
	}else{ 
		Ti.App.fireEvent('app:goToAds', {m_id: result[0], a_id: "", isFeed : 1});
	}
	return false;
}
function deviceTokenSuccess(e) {
    deviceToken = e.deviceToken;
    Cloud.PushNotifications.subscribe({
			    channel: 'sales',
			    type:'ios',
			    device_token: deviceToken
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
}
function deviceTokenError(e) {
    alert('Failed to register for push notifications! ' + e.error);
}

function registerPush(){
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

if(Ti.Platform.osname != "android"){
	Titanium.UI.iPhone.setAppBadge("0");
	registerPush();
}

var Utils = {
  /* modified version of https://gist.github.com/1243697 */
  _getExtension: function(fn) {
    // from http://stackoverflow.com/a/680982/292947
    var re = /(?:\.([^.]+))?$/;
    var tmpext = re.exec(fn)[1];
    return (tmpext) ? tmpext : '';
  },
  RemoteImage: function(a){
    a = a || {};
     a.defaultImage = "";
    var md5;
    var needsToSave = false;
    var savedFile;
    if(a.image){
      md5 = Ti.Utils.md5HexDigest(a.image)+this._getExtension(a.image);
      savedFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,md5);
      if(savedFile.exists()){
        a.image = savedFile;
      } else {
        needsToSave = true;
      }
    }
    var image = Ti.UI.createImageView(a);
    if(needsToSave === true){
      function saveImage(e){
        image.removeEventListener('load',saveImage);
        savedFile.write(
          Ti.UI.createImageView({image:image.image,width:'auto',height:'auto'}).toImage()
        );
      }
      image.addEventListener('load',saveImage);
    }
    return image;
  },
  RemoteImage2: function(a){
	var activityIndicator = Ti.UI.createActivityIndicator({
	  color: 'green',
	  style: Ti.UI.ActivityIndicatorStyle.DARK,
	  top:10,
	  left:10,
	  height:Ti.UI.SIZE,
	  width:Ti.UI.SIZE,
	  zIndex: 11,
	});
	var view = Ti.UI.createView({
		width: Ti.UI.FILL, 
		height:Ti.UI.FILL,
		backgroundColor: "#eae7e1"
	});
	view.add(activityIndicator);
    a = a || {};
    a.defaultImage = "";
    var md5;
    var needsToSave = false;
    var savedFile;
    if(a.image){
      md5 = Ti.Utils.md5HexDigest(a.image)+this._getExtension(a.image);
      savedFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,md5);
      if(savedFile.exists()){
        a.image = savedFile;
        view.backgroundColor = "";
        activityIndicator.hide();
      } else {
      	activityIndicator.show();
        needsToSave = true;
      }
    }
    var image = Ti.UI.createImageView(a);
    view.add(image);
    if(needsToSave === true){
      function saveImage(e){
        image.removeEventListener('load',saveImage);
        image.getParent().children[0].hide();
        image.getParent().backgroundColor = "";
        savedFile.write(
          Ti.UI.createImageView({image:image.image,width:'auto',height:'auto'}).toImage()
        );
      }
      image.addEventListener('load',saveImage);
    }
    return view;
  }
};
 
function PixelsToDPUnits(ThePixels){
  return (ThePixels / (Titanium.Platform.displayCaps.dpi / 160));
}

function DPUnitsToPixels(TheDPUnits){
  return (TheDPUnits * (Titanium.Platform.displayCaps.dpi / 160));
}

function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}

function currentDateTime(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();
	
	var hours = today.getHours();
	var minutes = today.getMinutes();
	var sec = today.getSeconds();
	if (minutes < 10){
		minutes = "0" + minutes;
	} 
	if (sec < 10){
		sec = "0" + sec;
	} 
	if(dd<10) {
	    dd='0'+dd;
	} 
	
	if(mm<10) {
	    mm='0'+mm;
	} 
	
	datetime = yyyy+'-'+mm+'-'+dd + " "+ hours+":"+minutes+":"+sec;
	return datetime ;
}

global_url = "";
if (OS_ANDROID) {
    // Somehow, only in alloy.js we can get the data (URL) that opened the app
    global_url = Ti.Android.currentActivity.intent.data;
}

// After app is fully resumed, recheck if launch arguments
// have changed and ignore duplicate schemes.
Ti.App.addEventListener( 'resumed', function(e) {
    var url = "";
	if(OS_IOS){
		cmd = Ti.App.getArguments();
		url = cmd.url;
	}else{
		url = Alloy.globals.url;
	}
	console.log(url);
	console.log(typeof(url));
	if ( (typeof(url) == 'undefined') && url != "" && url != null ) {
        var details = url;
        var arg = details.split("://"); 
        var ads = arg[1].split("?");
       
        var win = Alloy.createController( ads[0] , {a_id:  ads[1], from : "home"}).getView(); 
		COMMON.openWindow(win); 
        Ti.API.info( 'Resumed with url = ' + Ti.App.launchURL );
	    
	}
});

function parent(key, e){
	// if key.value undefined mean it look for key only
	console.log(typeof key.value);
	console.log(key.value);
	if(typeof key.value != "undefined"){
		
		if(eval("e."+key.name+"") != key.value){
			if(eval("e.parent."+key.name+"") != key.value){
				if(eval("e.parent.parent."+key.name+"") != key.value){
	    			console.log("box not found");
	    		}else{
	    			return e.parent.parent;
	    		}
	    	}else{
	    		return e.parent;
	    	}
	    }else{
	    		return e;
	    }
	}else{
		if(eval("typeof e."+key.name) == "undefined"){
			if(eval("typeof e.parent."+key.name+"") == "undefined"){
				if(eval("typeof e.parent.parent."+key.name+"") == "undefined"){
	    			console.log("box not found");
	    		}else{
	    			return eval("e.parent.parent."+key.name);
	    		}
	    	}else{
	    		return eval("e.parent."+key.name);
	    	}
	    }else{
	    		return eval("e."+key.name);
	    }
	}
}

function children(key, e){
	console.log("find children");
	console.log(key);
	console.log(e);
	
	if(eval("e."+key.name+"") != key.value){
		for (var i=0; i < e.children.length; i++) {
			if(eval("e.children[i]."+key.name+"") == key.value){
		  		return e.children[i];
		 	}
		 	console.log(e.children[i].zIndex);
			for (var a=0; a < e.children[i].children.length; a++) {
			  if(eval("e.children[i].children[a]."+key.name+"") == key.value){
			  	return e.children[i].children[a];
			  }
			  console.log(e.children[i].children[a].zIndex);
			  for (var c=0; c < e.children[i].children[a].children.length; c++) {
			  	  console.log(e.children[i].children[a].children[c].zIndex);
				  if(eval("e.children[i].children[a].children[c]."+key.name+"") == key.value){
				  	return e.children[i].children[a].children[c];
				  }
				};
			};
		};
    }else{
		return e;
    }
}
