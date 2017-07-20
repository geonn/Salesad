var args = arguments[0] || {};
var cate_id = args.cate_id || "";
var contest_id = args.contest_id || "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;
var ads_counter = 0;
var loading = false;
var u_id = Ti.App.Properties.getString('u_id') || "";
var isAd = (typeof contest_id != "undefined" && contest_id != "")?false:true;
//console.log(typeof contest_id+" "+contest_id);
Alloy.Globals.naviPath.push($.adsCategoryWin);

var style = Ti.UI.ActivityIndicatorStyle.DARK;

var activityIndicator = Ti.UI.createActivityIndicator({
  color: '#404041',
  font: {fontFamily:'Helvetica Neue', fontSize:16, fontWeight:'bold'},
  message: 'Loading...',
  style:style,
  bottom: 10,
  height:Ti.UI.SIZE,
  width: Ti.UI.FILL,
  zIndex: 14,
});

/***Share***/
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

function createShareOptions(adsName, adsImage){
	var subject = adsName;
    var text = adsName + ". Download SalesAd : http://apple.co/1RtrCZ4";
  
    var intent = Ti.Android.createIntent({
        action: Ti.Android.ACTION_SEND,
        type: "text/plain",
    });
    intent.putExtra(Ti.Android.EXTRA_TEXT,text);
    intent.putExtra(Ti.Android.EXTRA_SUBJECT,subject);
 	intent.putExtraUri(Ti.Android.EXTRA_STREAM,adsImage);
    var share = Ti.Android.createIntentChooser(intent,'Share');
 
    return share;
}
/* 0 1 2 3 4 5 6
 * Function
 * */
var a_id_submit = [];
var name = "", date = "";
function buildListing(){
	if(isAd){
		var c_ads_library = Alloy.createCollection('categoryAds'); 
		var ads = c_ads_library.getLatestAdsByCategory(cate_id, ads_counter, 3);
		a_id_submit = _.union(_.pluck(ads, "a_id"), a_id_submit);
	}else{
		var contest = Alloy.createCollection('contest'); 
		var ads = contest.getData(ads_counter, 3); 
	}
	if(ads.length <= 0){
		activityIndicator.hide();
		$.ads_listing.remove(activityIndicator);
		return;	
	}
	ads_counter += 3;
	for(var a = 0; ads.length > a; a++){
		var item_model = Alloy.createCollection('items'); 
		var isExclusive = item_model.getExclusiveByAid(ads[a].a_id);
		
		var tbr = Ti.UI.createTableViewRow({
			height: Ti.UI.SIZE,
			backgroundSelectedColor: "#FFE1E1"
		});
		
		var view_ad = $.UI.create("View",{
			bottom: 10,
			left: 10,
			right: 10,
			layout: "vertical",
		  	a_id: ads[a].a_id,
		  	width : Ti.UI.FILL,
		  	height: Ti.UI.SIZE,
			backgroundColor: "#ffffff",
			borderColor: "#C6C8CA",
			borderRadius:4,
		});
		
		if(ads[a].youtube != "" && ads[a].youtube != null){
			var bannerImage = Ti.UI.createView({
				width : Ti.UI.FILL,
				height: 200,
				backgroundColor: "#ffffff",
				borderColor: "#C6C8CA",
				borderRadius:4,
			});
			var webView = Ti.UI.createWebView({
			    url: 'http://www.youtube.com/embed/'+ads[a].youtube+'?autoplay=1&autohide=1&cc_load_policy=0&color=white&controls=0&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0',
			    enableZoomControls: false,
			    scalesPageToFit: false,
			    scrollsToTop: false,
			    scalesPageToFit :true,
			    disableBounce: true,
			    showScrollbars: false
			});
			bannerImage.add(webView);
		}else{
			var bannerImage = Ti.UI.createImageView({
		 	  defaultImage: "/images/image_loader_640x640.png",
			  image :ads[a].img_path,
			  width : Ti.UI.FILL,
			  name: ads[a].name,
			  a_id: ads[a].a_id,
			  id: ads[a].id,
			  passname: ads[a].merchant_name,
			  passdate: date = datedescription(),
			  height: Ti.UI.SIZE,//ads_height,
			});
			var image_view = $.UI.create("View", {classes:['wfill','hsize']});
			image_view.add(bannerImage);
		}
		
		var label_merchant = $.UI.create("Label", {
			font: { fontWeight: 'bold', fontSize: 16},
			text: ads[a].ads_name,
			top: 10,
			left: 10,
			right: 35,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#404041"
		});
		
		var label_ads_name = $.UI.create("Label", {
			text: ads[a].merchant_name,
			left: 10,
			right: 10,
			top: 5,
			bottom:5,
			font: {fontSize: 14},
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#626366"
		});
		
		
		function datedescription(e) {
			if(isAd){
				var dateDescription = convertToHumanFormat(ads[a].sales_from)+" - "+convertToHumanFormat(ads[a].sales_to);
				if(ads[a].sales_from == "0000-00-00" && ads[a].sales_to =="0000-00-00"){
					dateDescription = "Start from now!";
				}else if(ads[a].sales_from == "0000-00-00" && ads[a].sales_to !="0000-00-00"){
					dateDescription = "Until "+convertToHumanFormat(ads[a].sales_to)+"!";
				}else if(ads[a].sales_from != "0000-00-00" && ads[a].sales_to =="0000-00-00"){
					dateDescription = "Start from "+convertToHumanFormat(ads[a].sales_from)+"!";
				}
				return dateDescription;
			}else{
				var dateDescription = ads[a].description;
				return dateDescription;
			}
		}

		var label_date_period = $.UI.create("Label", {
			text: date,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			font:{fontSize: 12},
			left: 10,
			right: 10,
			bottom: 10,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#ED1C24"
		});
		
		var line = $.UI.create("View",{
			backgroundColor: "#C6C8CA",
			height: 0.5,
			width: Ti.UI.FILL
		});
		
		var line2 = $.UI.create("View",{
			backgroundColor: "#C6C8CA",
			height: 0.5,
			width: Ti.UI.FILL
		});
		var view_buttonBar = $.UI.create("View", {
			classes: ['wfill','hsize']
		});
		var line3 = $.UI.create("View",{
			backgroundColor: "#C6C8CA",
			height: 30,
			width: 0.5
		});
		
		/*var btn_reminder = $.UI,create("ImageView", {classes: ['small-padding'],active_date: ads[a].active_date,
			expired_date: ads[a].expired_date,
			ads_name: ads[a].ads_name,
			description: ads[a].description, width: 30, height: 30, image: "/images/Icon_AddToCalendar.png"});
		*/
		
		var exclusive_icon = $.UI.create("ImageView", {classes:['hsize'], width: 30, zIndex: 100, right: 10, top:0, image:"/images/Icon_Exclusive_Gold_Long@0,25x.png"});
		
		var btn_reminder = $.UI.create("ImageView", {
			classes: ['small-padding'],
			right:10,
			bottom:0,
			width: 25,
			height: 25,
			active_date: ads[a].sales_from,
			expired_date: ads[a].sales_to,
			ads_name: ads[a].ads_name,
			description: ads[a].description,
			image: "/images/Icon_AddToCalendar.png"
		});
		
		btn_reminder.addEventListener('click', function(e){
			COMMON.createAlert("Alert", "Do you want to add this sales to your calendar?", function(ex){
				if(Ti.Platform.osname == "android"){
					setAndroidCalendarEvent(e);
				}else{
					if(Ti.Calendar.eventsAuthorization == Ti.Calendar.AUTHORIZATION_AUTHORIZED) {
					    setCalendarEvent(e);
					} else {
					    Ti.Calendar.requestEventsAuthorization(function(ex1){
				            if (ex1.success) {
				                setCalendarEvent(e);
				            } else {
				                alert('Access to calendar is not allowed');
				            }
				        });
					}
				}
			});
			
		});
		
		var btn_share = $.UI.create("ImageView", {
			classes: ['small-padding'],
			right:0,
			bottom:0,
			width: 25,
			height: 25,
			active_date: ads[a].sales_from,
			expired_date: ads[a].sales_to,
			adsName: ads[a].ads_name,
			adsImage: ads[a].img_path,
			description: ads[a].description,
			image: "/images/Icon_Share.png"
		});
		
		btn_share.addEventListener('click', function(e){ 
			if(OS_IOS){
				if(Social.isActivityViewSupported()){ //min iOS6 required
			    	Social.activityView({
			        	text: e.source.adsName + ". Download SalesAd : http://apple.co/1RtrCZ4",
			        	//url: "http://apple.co/1RtrCZ4",
			        	image:e.source.adsImage
			     	});
			     } else {
			     	//implement fallback sharing..
			     }
			}else{
				var share = createShareOptions(e.source.adsName,e.source.adsImage);
				Ti.Android.currentActivity.startActivity(share);
			}
			
		});
		var view_left = $.UI.create("View", {classes:['hsize', 'vert'], left:0, width: "65%"});
		var view_right = $.UI.create("View", {classes:['hsize','wsize','horz'], right:10, bottom:10});
		var label_and_flag = $.UI.create("View", {classes:['wfill','hsize']});
		view_ad.add(image_view);
		view_ad.add(line);
		label_and_flag.add(label_merchant);
		if(isExclusive > 0){
			label_and_flag.add(exclusive_icon);
		}
		view_ad.add(label_and_flag);
		view_left.add(label_ads_name);
		view_left.add(label_date_period);
			
		view_right.add(btn_reminder);
		view_right.add(btn_share);
		view_buttonBar.add(view_left);
		view_buttonBar.add(view_right);
		view_ad.add(view_buttonBar);
		
		tbr.add(view_ad);
		$.ads_listing.appendRow(tbr);
		
		bannerImage.addEventListener('load', function(e){
			activityIndicator.hide();
			$.ads_listing.remove(activityIndicator);
		});
		
		setTimeout(function(e){
			loading = false;
		}, 1000);
		
		if(ads[a].youtube == ""){ 
			bannerImage.addEventListener('click', function(e) {
				if(isAd){
				 	goAd(e.source.a_id, e.source.passname, e.source.passdate);
				 }else{
				  	var win = Alloy.createController("webview", {id: e.source.id, title: e.source.name}).getView();
					COMMON.openWindow(win); 
				 }
			});
		}
		
		var params = {
			a_id: ads[a].a_id,
			type: 1,
			from: "ads_catagory",
			u_id: Ti.App.Properties.getString("u_id") || ""
		};
		
		API.callByPost({url:"addAdsClick",
						new:true,
						params:params},
						{onload: function(responseText){
							console.log("Impression ads category: " + responseText);
						},onerror: function(responseerror) {
							console.logg("Impression ads category: error " + responseerror);
						}});
	}
	setTimeout(function(e){
		activityIndicator.hide();
		$.ads_listing.remove(activityIndicator);
		loading = false;
	}, 1000);
	
	
}

function setAndroidCalendarEvent(e){
	if(e.source.active_date != "0000-00-00"){
		var CALENDAR_TO_USE = 3;
		var calendar = Ti.Calendar.getCalendarById(CALENDAR_TO_USE);
		var active_date = e.source.active_date.split("-");
		var expired_date =  e.source.expired_date.split("-");
		var eventBegins = new Date(active_date[0], active_date[1]-1, active_date[2], 10, 0, 0);
		var eventEnds = new Date(expired_date[0], expired_date[1]-1, expired_date[2], 23, 59, 59);
		console.log(eventBegins+" "+eventEnds);
		// Create the event
		var details = {
		    title: e.source.ads_name,
		    description: e.source.description,
		    begin: eventBegins,
		    end: eventEnds
		};
		
		var event = calendar.createEvent(details);
		
		// Now add a reminder via e-mail for 10 minutes before the event.
		var reminderDetails = {
		    minutes: 10,
		    method: Ti.Calendar.METHOD_ALERT
		};
		
		event.createReminder(reminderDetails);
		COMMON.createAlert("Message", "Sales reminder added into your calendar.");
	}else{
		COMMON.createAlert("Message", "Sales started.");
	}
}

function setCalendarEvent(e){
	if(e.source.active_date != "0000-00-00"){
		var cal = Ti.Calendar.defaultCalendar;
		var active_date = e.source.active_date.split("/");
		var expired_date = e.source.expired_date.split("/");
		var start_date = new Date(active_date[0], active_date[1]-1, active_date[2], 10, 0, 0);
		var end_date = new Date(expired_date[0], expired_date[1]-1, expired_date[2], 23, 59, 59);
		
		console.log(start_date+" event to "+end_date);
		/*
		if(e.source.expired_date != "0000-00-00"){
			var expired_date = e.source.expired_date.split("/");
			var end_date = new Date(expired_date[2], expired_date[1]-1, expired_date[0]-1, 10, 0, 0);
		}else{
			var end_date = new Date(active_date[2], active_date[1]-1, active_date[0], 23, 0, 0);
		}*/
	
		 var event = cal.createEvent({
		    title: e.source.ads_name,
		    begin: start_date,
		    end: end_date,
		    availability: Ti.Calendar.AVAILABILITY_FREE,
		    allDay: true
		});
		
		 var mil = 60*1000;
		
		 //adding alert to your event , this alert will be before the start _date with 1 minutes
		 var alert1 = event.createAlert({
		    relativeOffset: mil
		});
		
		 event.alerts = [alert1];
		 event.save(Ti.Calendar.SPAN_FUTUREEVENTS);
		 alert("Sales reminder added into your calendar.");
	}else{
		alert("Sales started.");
	}
}

//$.ads_listing.add(videoView);

/** navigate to Ad **/
var goAd = function(a_id, a_name, a_date){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	console.log("a id     " + a_id + " " + a_name + " " + a_date);
	
	if(u_id!=""){
		var params = {u_id:u_id, action:'add', purpose:'7'};
		API.callByPost({
			url: "doPointAction",
			new: true,
			params: params
		},{
		onload: function(res){
			var res = JSON.parse(res);
			var arr = res.data || null;
			console.log("Daily ad view point added "+JSON.stringify(arr));
		},
		onerror: function(err){
			console.log("fail!");
		}});
	}
				
	var win = Alloy.createController("ad", {a_id: a_id, from: "ads_caregory", name: a_name, date: a_date}).getView();
	COMMON.openWindow(win); 
};
/*
 * App Running
 * */
var dummy = $.UI.create("View",{
	bottom: 10,
	left: 10,
	right: 10,
  	width : Ti.UI.FILL,
  	height: Ti.UI.SIZE,
	backgroundColor: "#F1F1F2",
});

$.ads_listing.add(dummy);
buildListing();
render_header();

function render_header(){
	if(isAd){
		var category_library = Alloy.createCollection('category'); 
		var category_info = category_library.getCategoryById(cate_id);
		var customeTitle = category_info['categoryName'];
	}else{
		var customeTitle = "CONTEST";
	}
	
	
	var custom = $.UI.create("Label", { 
	    text: customeTitle, 
	    color: '#ED1C24'
	});
	
	if(Ti.Platform.osname == "android"){ 
		COMMON.removeAllChildren($.pageTitle);
		$.pageTitle.add(custom);   
	}else{
		$.adsCategoryWin.titleControl = custom; 
	}
}


/*
 * Event Listener 
 * */

var lastDistance = 0;
$.ads_listing.addEventListener("scroll", function(e){
	if(Ti.Platform.osname == 'iphone'){
		var offset = e.contentOffset.y;
		var height = e.size.height;
		var total = offset + height;
		var theEnd = e.contentSize.height;
		var distance = theEnd - total;

		if (distance < lastDistance){
			var nearEnd = theEnd * .75;
 			if (!loading && (total >= nearEnd)){
 				loading = true;
 				buildListing();
 			}
		}
		lastDistance = distance;
	}
	
	if(Ti.Platform.osname == 'android' && !loading){
		if((e.firstVisibleItem+e.visibleItemCount) == e.totalItemCount){
			loading = true;
			buildListing();
		}
	}
});

$.adsCategoryWin.addEventListener("close", function(e){
	console.log('window close');
	console.log(a_id_submit);
	API.callByPost({url: "addAdsImpression", new:true, params:{a_id: JSON.stringify(a_id_submit)}}, {onload: function(responseText){
		console.log(responseText);
	}});
});

function closeWindow() {
	COMMON.closeWindow($.adsCategoryWin);
}

Ti.App.addEventListener("ads:close",closeWindow);

$.adsCategoryWin.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.adsCategoryWin); 
});