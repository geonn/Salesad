var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var data;
var loading = Alloy.createController("loading");

function render_page(){
}

function navTo(e){
	var target = parent({name: "target"}, e.source);
	if(target == "profile"){
		var user = Ti.App.Properties.getString('session');
		if(user === null){
			var win = Alloy.createController("signin_signout").getView();
			if(Ti.Platform.osname == "android"){
				win.fbProxy = FACEBOOK.createActivityWorker({lifecycleContainer: win});
			}
			COMMON.openWindow(win);  
		}else{
			var win = Alloy.createController("profile").getView(); 
			COMMON.openWindow(win); 
		} 
	}else if(target == "webview"){
		var url = parent({name: "url"}, e.source);
		var win = Alloy.createController("webview", {url:url}).getView(); 
		COMMON.openWindow(win);
	}else if(target != "") {
		var win = Alloy.createController(target).getView();  
		COMMON.openWindow(win);
	}
}

function refresh() {
	var user = Ti.App.Properties.getString('session');
	if(user === null) {
		(OS_IOS)?$.textlogin_out.title = "Login":$.textlogin_out.text = "Login";
	}else{
		(OS_IOS)?$.textlogin_out.title = "Logout":$.textlogin_out.text = "Logout";
	}
}

function init(){
	$.win.add(loading.getView());
	refresh();
}

init();

function doLogout(e) { 
	var dialog = Ti.UI.createAlertDialog({
	    cancel: 1,
	    buttonNames: ['Cancel','Confirm'],
	    message: 'Would you like to logout?',
	    title: 'Logout SalesAd'
	  });
	  dialog.addEventListener('click', function(e){
	  	if(e.button === false){
	  		return e.button;
	  	}
	  	
	    if (e.index === 1){
	    	//fb logout
	    	if(Ti.App.Properties.getString('facebooklogin') == "1"){
	    		FACEBOOK.logout();
	   		}
	   		
			var url = API.logoutUser + Ti.App.Properties.getString('session');
			var client = Ti.Network.createHTTPClient({
			     // function called when the response data is available
			     onload : function(e) {
			     	Ti.App.Properties.removeProperty('u_id');
		         	Ti.App.Properties.removeProperty('firstname');
		         	Ti.App.Properties.removeProperty('lastname');
		         	Ti.App.Properties.removeProperty('email');
		         	Ti.App.Properties.removeProperty('gender');
					Ti.App.Properties.removeProperty('session');
			     	COMMON.closeWindow($.win);
			     },
			     // function called when an error occurs, including a timeout
			     onerror : function(e) {
			        createAlert('Network declined','Failed to contact with server. Please make sure your device are connected to internet.');
			     },
			     timeout : 5000  // in milliseconds
			 });
			 // Prepare the connection.
			 client.open("GET", url);
			 // Send the request.
			 client.send(); 
	    }
	 });

	dialog.show();
	refresh();
};

$.invitefriend.addEventListener("click", function(e) {
try{
	loading.start();
	API.callByPost({
		url: "encrypt_uid",
		new: true,
		params: {u_id: u_id}
	},{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			var encrypt_code = res.data || null;
		
			var share_url = "http://salesad.my/users/member_referral?referral="+encrypt_code;
			if(OS_IOS){
				var Social = require('dk.napp.social');
				if(Social.isActivityViewSupported()){ //min iOS6 required
					Social.activityView({
						text: "SalesAd. Please signup via the link : "+share_url,
					});
				} else {
				}
			}else{
				var text = "SalesAd. Please signup via the link : "+share_url;
				
				var intent = Ti.Android.createIntent({
					action: Ti.Android.ACTION_SEND,
					type: "text/plain",
				});
				intent.putExtra(Ti.Android.EXTRA_TEXT,text);
				intent.putExtra(Ti.Android.EXTRA_SUBJECT, "Salesad Invite Friend");
				var share = Ti.Android.createIntentChooser(intent,'Share');
				Ti.Android.currentActivity.startActivity(share);
			}
			loading.finish();
		},
		onerror: function(err){
			_.isString(err.message) && alert(err.message);
			loading.finish();
		},
		onexception: function(){
			loading.finish();
		}
	});
}catch(e) {
	
}
});

function windowClose(){
	COMMON.closeWindow($.win);
}

Ti.App.addEventListener("ads:close",windowClose);
Ti.App.addEventListener("more:refresh", refresh);

$.textlogin_out.addEventListener('click', function(e){
	if(e.source.text == "Login" || e.source.title == "Login") {
		var win = Alloy.createController("signin_signout").getView();
		COMMON.openWindow(win);
	}else if(e.source.text == "Logout" || e.source.title == "Logout") {
		doLogout();
	}
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener('android:back', function (e) {
	COMMON.closeWindow($.win); 
});
