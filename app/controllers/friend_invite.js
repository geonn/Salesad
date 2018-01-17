var u_id = Ti.App.Properties.getString('u_id') || "";
var loading = Alloy.createController("loading");

if (OS_IOS){
//iOS only module

var Social = require('dk.napp.social');

// find all Twitter accounts on this phone
if(Social.isRequestTwitterSupported()){ //min iOS6 required
    var accounts = []; 
    Social.addEventListener("accountList", function(e){
    	Ti.API.info("Accounts:");
    	accounts = e.accounts; //accounts
    	Ti.API.info(accounts);
    });
    
    Social.twitterAccountList();
}

Social.addEventListener("complete", function(e){
		Ti.API.info("complete: " + e.success);

		if (e.platform == "activityView" || e.platform == "activityPopover") {
			switch (e.activity) {
				case Social.ACTIVITY_TWITTER:
					Ti.API.info("User is shared on Twitter");
					break;
				case Social.ACTIVITY_FACEBOOK:
					Ti.API.info("User is shared on Facebook");
					break;
				case Social.ACTIVITY_CUSTOM:
					Ti.API.info("This is a customActivity: " + e.activityName);
					break;
			}
		}
	});
	
	Social.addEventListener("error", function(e){
		Ti.API.info("error:");	
		Ti.API.info(e);	
	});
	
	Social.addEventListener("cancelled", function(e){
		Ti.API.info("cancelled:");
		Ti.API.info(e);		
	}); 
	Social.addEventListener("customActivity", function(e){
		Ti.API.info("customActivity");	
		Ti.API.info(e);	
		
	});
}
  
if(Ti.Platform.osname == "android"){ 
	var custom = $.UI.create("Label", { 
	    text: 'Invite Friend', 
	    color: '#ED1C24', 
	    width: Ti.UI.SIZE 
	 });
	$.pageTitle.add(custom);   
}else{
	$.win.title = 'Invite Friend'; 
}

function sendInvite(){
	loading.start();
	API.callByPost({
		url: "encrypt_uid",
		new: true,
		params: {u_id: u_id}
	}, 
	{
	onload: function(responseText){
		var res = JSON.parse(responseText);
		var encrypt_code = res.data || null;
		var share_url = "http://salesad.my/users/member_referral?referral="+encrypt_code;
		if(OS_IOS){
			if(Social.isActivityViewSupported()){ //min iOS6 required
				Social.activityView({
					text: "SalesAd. Please signup via the link : "+share_url,
					//url: "http://apple.co/1RtrCZ4"
				});
			} else {
				//implement fallback sharing..
			}
		}else{
			var text = "Download SalesAd now to receive sale alerts and exclusive deals : "+share_url;		  
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
		COMMON.closeWindow($.win);
		loading.finish();
	}
	});
}	
	
function closeWindow(){
	COMMON.closeWindow($.win); 
}

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});