var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var loading = Alloy.createController("loading");
var data = [], daily_data = [], point_list=[];
var pwidth = Titanium.Platform.displayCaps.platformWidth;
var SCANNER = require("scanner");
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

function refresh(){
	loading.start();
	API.callByPost({
		url: "getMemberPointsRecords",
		new: true,
		params: {u_id: u_id}
	}, 
	{
		onload: function(responseText){
			var model = Alloy.createCollection("points");
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			model.saveArray(arr);
			data = model.getData({u_id: u_id});
			daily_data = model.getData({u_id: u_id, daily: true});
			console.log(data);
			render_current_point();
			render_point_list();
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
	
	API.callByPost({
		url: "pointDescList",
		new: true,
	}, 
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			point_list = res.data || null;
			point_list.pop();
			console.log(point_list);
			render_point_list();
		},
		onerror: function(err){
			_.isString(err.message) && alert(err.message);
		},
		onexception: function(){
			COMMON.closeWindow($.win);
		}
	});
}

function render_current_point(){
	if(data.length > 0){
		$.current_point.text = data[data.length - 1].balance;
	}else{
		$.current_point.text = "0";
	}
}

function render_point_list(){
	var arr = [];
	for (var i=0; i < point_list.length; i++) {
		console.log(point_list[i].title);
		var found;
		if(point_list[i].daily){
			found = _.where(daily_data, {purpose: point_list[i].id});
		}else{
			found = _.where(data, {purpose: point_list[i].id});
		}
		var task_yes_no_path = (found.length>0)?task_yes = "/images/Icon_Reward_Unlocked.png":"/images/Icon_Reward_Locked.png";
		var checked = (found.length>0)?true:false;
		_.extend(point_list[i], {checked: checked});
		var row = $.UI.create("TableViewRow", {classes:['horz','hsize'], record: point_list[i]});
		var task_yes_no = $.UI.create("ImageView", {image: task_yes_no_path, classes:['hsize'], top:10, left:20, right:20, width: 15});
		var view_mid = $.UI.create("View", {classes:['vert','hsize'], bottom:10, width: c_percent("63%", pwidth)});
		var label_title = $.UI.create("Label", {classes:['wfill','hsize','h5'], text: point_list[i].title});
		var label_subtitle = $.UI.create("Label", {classes:['wfill','hsize','h6'], text: point_list[i].subtitle});
		var view_last = $.UI.create("View", {classes:['hsize','wsize'], left:10});
		var view_container_point = $.UI.create("View", {classes:['wsize','hsize','horz']});
		var img_icon = $.UI.create("ImageView", {width: 15, top: 5, height: 15, image: "/images/Icon_CashPoint_Flat_Medium.png"});
		var label_point = $.UI.create("Label", {classes: ['wsize','hsize','h5'], top:3,  text: point_list[i].points});
		view_container_point.add(img_icon);
		view_container_point.add(label_point);
		view_last.add(view_container_point);
		view_mid.add(label_title);
		view_mid.add(label_subtitle);
		row.add(task_yes_no);
		row.add(view_mid);
		row.add(view_last);
		arr.push(row);
	};
	$.point_list.setData(arr);
	$.point_list.addEventListener("click", navTo);
}
var api_loading = false;
function navTo(e){
	var row = e.row;
	console.log(row.record);
	loading.start();
	if(row.record.id == 2){
		if(!row.record.checked && !api_loading){
			api_loading = true;
			API.callByPost({
				url: "doPointAction",
				new: true,
				params: {u_id: u_id, action: "add", purpose: row.record.id}
			}, 
			{
				onload: function(responseText){
					refresh();
					loading.finish();
					api_loading = false;
				},
				onerror: function(err){
					_.isString(err.message) && alert(err.message);
					loading.finish();
					api_loading = false;
				},
				onexception: function(){
					COMMON.closeWindow($.win);
					loading.finish();
					api_loading = false;
				}
			});
		}
		loading.finish();
	}else if(row.record.id == 3){
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
					COMMON.closeWindow($.win);
					loading.finish();
				}
			});
	}else if(row.record.id == 4){
		if(!row.record.checked){
			SCANNER.openScanner("4");
		}
		loading.finish();
	}else if(row.record.id == 1){
		loading.finish();
	}else if(row.record.id == 6){
		if(!row.record.checked){
			var favor_pop_up = $.UI.create("ImageView", {classes:['hsize','wfill','padding'], image: "/images/Popup_Rewards_Favorite.png"});
			$.win.add(favor_pop_up);
			favor_pop_up.addEventListener("click", function(e){
				$.win.remove(e.source);
			});
			loading.finish();
		}
		loading.finish();
	}
}

function init(){
	$.win.add(loading.getView());
	refresh();
}

init();

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener("close", function(){
	Ti.App.removeEventListener('reward:refresh', refresh);
});

Ti.App.addEventListener('reward:refresh', refresh);

function c_percent(percent, relative) {
    var percentInt = percent.replace("%", "");
    var percentInt = parseInt(percentInt);
    console.log(Math.round(percentInt * (relative / 100)));
    return (OS_ANDROID)?pixelToDp(Math.round(percentInt * (relative / 100))):Math.round(percentInt * (relative / 100));
};

function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}