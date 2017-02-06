var args = arguments[0] || {};
var type = args.type || "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;
var ads_counter = 0;
var loading = false;
var type = args.type;
var data;

Alloy.Globals.naviPath.push($.win);

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

function getData(){
	console.log(type+" "+args.m_id);
	if(type == "branch"){
		var ads_model = Alloy.createCollection('ads'); 
		data = ads_model.getDataByBranch(args.m_id, ads_counter, 3);
	}else if(type == "store"){
		var ads_model = Alloy.createCollection('ads'); 
		data = ads_model.getDataByStore(args.m_id, ads_counter, 3);
	}
	ads_counter += 3;
}

/* 0 1 2 3 4 5 6
 * Function
 * */
function buildListing(){
	if(data.length <= 0){
		activityIndicator.hide();
		$.ads_listing.remove(activityIndicator);
		return;	
	}
	ads_counter += 3;
	console.log('check data');
	console.log(data);
	for(var a = 0; data.length > a; a++){
		var tbr = Ti.UI.createTableViewRow({
			height: Ti.UI.SIZE,
			backgroundSelectedColor: "#FFE1E1"
		});
		
		var view_ad = $.UI.create("View",{
			bottom: 10,
			left: 10,
			right: 10,
			layout: "vertical",
			m_id: data[a].m_id,
		  	a_id: data[a].a_id,
		  	width : Ti.UI.FILL,
		  	height: Ti.UI.SIZE,
			backgroundColor: "#ffffff",
			borderColor: "#C6C8CA",
			borderRadius:4,
		});
		
		if(data[a].youtube != "" && data[a].youtube != null){
			var bannerImage = Ti.UI.createView({
				width : Ti.UI.FILL,
				height: 200,
				backgroundColor: "#ffffff",
				borderColor: "#C6C8CA",
				borderRadius:4,
			});
			var webView = Ti.UI.createWebView({
			    url: 'http://www.youtube.com/embed/'+data[a].youtube+'?autoplay=1&autohide=1&cc_load_policy=0&color=white&controls=0&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0',
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
		 	  defaultImage: "/images/warm-grey-bg.png",
			  image :data[a].img_path,
			  width : Ti.UI.FILL,
			  m_id: data[a].m_id,
			  name: data[a].name,
			  a_id: data[a].a_id,
			  id: data[a].id,
			  height: Ti.UI.SIZE,//ads_height,
			});
		}
		
		
		var label_merchant = $.UI.create("Label", {
			font: { fontWeight: 'bold', fontSize: 16},
			text: data[a].merchant,
			top: 10,
			left: 10,
			right: 10,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#404041"
		});
		
		var label_ads_name = $.UI.create("Label", {
			text: data[a].ads_name,
			left: 10,
			right: 10,
			font: {fontSize: 14},
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#626366"
		});
		
		var dateDescription =data[a].active_date+" - "+data[a].expired_date;
		if(data[a].active_date == "0000-00-00" && data[a].expired_date =="0000-00-00"){
			dateDescription = "Start from now!";
		}else if(data[a].active_date == "0000-00-00" && data[a].expired_date !="0000-00-00"){
			dateDescription = "Until "+data[a].expired_date+"!";
		}else if(data[a].active_date != "0000-00-00" && data[a].expired_date =="0000-00-00"){
			dateDescription = "Start from "+data[a].active_date+"!";
		}
		
		var label_date_period = $.UI.create("Label", {
			text: dateDescription,
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
			classes: ['horz', 'wfill'],
			height: 30
		});
		var line3 = $.UI.create("View",{
			backgroundColor: "#C6C8CA",
			height: 30,
			width: 0.5
		});
		
		var btn_reminder = $.UI.create("Button", {
			width: "50%",
			height: 30,
			active_date: data[a].active_date,
			expired_date: data[a].expired_date,
			ads_name: data[a].ads_name,
			description: data[a].description,
			backgroundColor:"#ededed",
			backgroundFocusedColor: "#ffffff",
			selectedColor: "#ffffff",
			title: "Add To Calendar",
			color: "#ED1C24"
		});
		
		btn_reminder.addEventListener('click', function(e){
			if(Ti.Platform.osname == "android"){
				setAndroidCalendarEvent(e);
				
			}else{
				if(Ti.Calendar.eventsAuthorization == Ti.Calendar.AUTHORIZATION_AUTHORIZED) {
				    setCalendarEvent(e);
				} else {
				    Ti.Calendar.requestEventsAuthorization(function(e){
			            if (e.success) {
			                setCalendarEvent(e);
			            } else {
			                alert('Access to calendar is not allowed');
			            }
			        });
				}
			}
		});
		
		var btn_share = $.UI.create("Button", {
			width: Ti.UI.FILL,
			height: 30,
			backgroundFocusedColor: "#ffffff",
			selectedColor: "#ffffff",
			backgroundColor:"#ededed",
			title: "Share",
			color: "#ED1C24",
			adsName: data[a].ads_name,
			adsImage: data[a].img_path
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
		
		view_ad.add(bannerImage);
		view_ad.add(line);
		view_ad.add(label_merchant);
		view_ad.add(label_ads_name);
		view_ad.add(label_date_period);
		
		view_ad.add(line2);
		view_buttonBar.add(btn_reminder);
		view_buttonBar.add(line3);
		view_buttonBar.add(btn_share);
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
		
		if(data[a].youtube == ""){ 
			bannerImage.addEventListener('click', function(e) {
			 	goAd(e.source.a_id);
			});
		}
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
		var eventBegins = new Date(active_date[0], active_date[1]-1, active_date[2], 10, 0, 0);
		var eventEnds = new Date(active_date[0], active_date[1]-1, active_date[2], 23, 59, 59);
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
		var start_date = new Date(active_date[0], active_date[1]-1, active_date[2], 10, 0, 0);
		var end_date = new Date(active_date[0], active_date[1]-1, active_date[2], 23, 59, 59);
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
		 COMMON.createAlert("Message", "Sales reminder added into your calendar.");
	}else{
		COMMON.createAlert("Message", "Sales started.");
	}
}

//$.adsCategory.ads_listing.add(videoView);

/** navigate to Ad **/
var goAd = function(a_id){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	    
	var win = Alloy.createController("ad", {a_id: a_id, from : "home"}).getView(); 
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
refresh();


function refresh(){
	getData();
	buildListing();
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
 				refresh();
 			}
		}
		lastDistance = distance;
	}
	
	if(Ti.Platform.osname == 'android' && !loading){
		if((e.firstVisibleItem+e.visibleItemCount) == e.totalItemCount){
			loading = true;
			refresh();
		}
	}
});