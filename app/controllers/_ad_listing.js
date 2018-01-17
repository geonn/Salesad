var args = arguments[0] || {};
var type = args.type || "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;
var ads_counter = 0;
var loading = false;
var type = args.type;
var data;
var u_id = Ti.App.Properties.getString('u_id') || "";
if(typeof args.m_id == "undefined" || args.m_id ==""){
	//alert("There is no sales from this store right now");
}
else{}
Alloy.Globals.naviPath.push($.win);

var style = Ti.UI.ActivityIndicatorStyle.DARK;

var activityIndicator = Ti.UI.createActivityIndicator({
  color: '#404041',
  font: {fontFamily:'Helvetica Neue', fontSize:16},
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
	if(type == "branch"){
		var ads_model = Alloy.createCollection('ads'); 
		data = ads_model.getDataByBranch(args.m_id, ads_counter, 5);
	}else if(type == "store"){
		var ads_model = Alloy.createCollection('ads'); 
		data = ads_model.getDataByStore(args.m_id, ads_counter, 5);
	}
	ads_counter += 3;
}

/* 0 1 2 3 4 5 6
 * Function
 * */
var a_id_submit = [];
function buildListing(){
	var c_ads_library = Alloy.createCollection('categoryAds'); 
	var ads = data;
	a_id_submit = _.union(_.pluck(ads, "a_id"), a_id_submit);
	
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
			    a_id: ads[a].a_id,
			  	m_id: ads[a].m_id,
			    disableBounce: true,
			    showScrollbars: false
			});
			bannerImage.add(webView);
		}else{
			var bannerImage = Ti.UI.createImageView({
		 	  defaultImage: "/images/image_loader_640x640.png",
			  image :ads[a].img_thumb,
			  width : Ti.UI.FILL,
			  name: ads[a].ads_name,
			  a_id: ads[a].a_id,
			  m_id: ads[a].m_id,
			  id: ads[a].id,
			  date: datedescription(ads[a].sales_from,ads[a].sales_to),
			  height: Ti.UI.SIZE,//ads_height,
			});
			var image_view = $.UI.create("View", {classes:['wfill','hsize']});
			image_view.add(bannerImage);
		}	
		
		var label_merchant = $.UI.create("Label", {
			font: {fontSize: 16},
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
		
		var dateDescription = convertToHumanFormat(ads[a].active_date)+" - "+convertToHumanFormat(ads[a].expired_date);
		if(ads[a].active_date == "0000-00-00" && ads[a].expired_date =="0000-00-00"){
			dateDescription = "Start from now!";
		}else if(ads[a].active_date == "0000-00-00" && ads[a].expired_date !="0000-00-00"){
			dateDescription = "Until "+convertToHumanFormat(ads[a].expired_date)+"!";
		}else if(ads[a].active_date != "0000-00-00" && ads[a].expired_date =="0000-00-00"){
			dateDescription = "Start from "+convertToHumanFormat(ads[a].active_date)+"!";
		}
		dateDescription = convertToHumanFormat(ads[a].sales_from)+" till "+convertToHumanFormat(ads[a].sales_to);
		var label_date_period = $.UI.create("Label", {
			text: dateDescription,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			font:{fontSize: 12},
			left: 10,
			right: 10,
			bottom: 10,
			width: Ti.UI.SIZE,
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
			active_date: ads[a].active_date,
			expired_date: ads[a].expired_date,
			ads_name: ads[a].ads_name,
			description: ads[a].description,
			image: "/images/Icon_AddToCalendar.png"
		});
		
		btn_reminder.addEventListener('click', function(e){
			COMMON.createAlert("Alert", "Do you want to add this sales to your calendar?", function(ex){
				if(Ti.Platform.osname == "android"){
					if (Ti.Calendar.hasCalendarPermissions()) {
						
						//setAndroidCalendarEvent(e);
					}
					else{
						Ti.Calendar.requestCalendarPermissions(function(e) {
							if (e.success) {
								//setAndroidCalendarEvent(e);
							}else{
								alert('You denied permission.');			
							}
						});
					}
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
			active_date: ads[a].active_date,
			expired_date: ads[a].expired_date,
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
		var view_left = $.UI.create("View", {classes:['hsize', 'vert','wsize'], left:0,});
		var view_right = $.UI.create("View", {classes:['hsize','wsize','horz'], right:10, bottom:10});
		var label_and_flag = $.UI.create("View", {classes:['wfill','hsize']});
		var merchant_data = $.UI.create("View", {classes:['vert', 'wfill', 'hsize']});
		var bottom_data = $.UI.create("View", {classes:['wfill', 'hsize']});
		view_ad.add(image_view);
		view_ad.add(line);
		merchant_data.add(label_merchant);
		label_and_flag.add(merchant_data);
		if(isExclusive > 0){
			label_and_flag.add(exclusive_icon);
		}
		view_ad.add(label_and_flag);
		view_left.add(label_ads_name);
		view_left.add(label_date_period);
		if(OS_IOS){ // calendar button
			view_right.add(btn_reminder);
		}
		view_right.add(btn_share);
		bottom_data.add(view_left);
		bottom_data.add(view_right);
		merchant_data.add(bottom_data);
		
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
			 	goAd(e.source.a_id, e.source.m_id, e.source.name, e.source.date);
			});
		}
	var params = {
		a_id:ads[a].a_id,
		type:1,
		from:"_ad_listing",
		u_id:u_id
	} ;
	API.callByPost({url:"addAdsClick",new:true,params:params},{
		onload:function(res){},onerror:function(err){}});	
	}
	setTimeout(function(e){
		activityIndicator.hide();
		$.ads_listing.remove(activityIndicator);
		loading = false;
	}, 1000);
	
	if(ads.length <= 0){
		activityIndicator.hide();
		$.ads_listing.remove(activityIndicator);
		var view = $.UI.create("View", {classes:['wfill', 'hfill']});
		var label = $.UI.create("Label", {classes: ['wfill', 'hsize'], text: "There is no sales from this merchant right now.", textAlign: "center", top: "55%", left: 50, right: 50});
		view.add(label);
		$.ads_listing.add(view);
		view = null;
		label = null;
		return;
	}
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

function datedescription(from,to) {
	var dateDescription = convertToHumanFormat(from)+" - "+convertToHumanFormat(to);
	if(from == "0000-00-00" && to =="0000-00-00"){
		dateDescription = "Start from now!";
	}else if(from == "0000-00-00" &&to !="0000-00-00"){
		dateDescription = "Until "+convertToHumanFormat(to)+"!";
	}else if(from != "0000-00-00" && to =="0000-00-00"){
		dateDescription = "Start from "+convertToHumanFormat(from)+"!";
	}
	return dateDescription;
}

/** navigate to Ad **/
var goAd = function(a_id, m_id, name, date){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	var win = Alloy.createController("ad", {a_id: a_id, target_m_id: args.m_id, from : "_ad_listing", name:name, date:date}).getView(); 
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

//var lastDistance = 0;
// $.ads_listing.addEventListener("scroll", function(e){
	// if(Ti.Platform.osname == 'iphone'){
		// var offset = e.contentOffset.y;
		// var height = e.size.height;
		// var total = offset + height;
		// var theEnd = e.contentSize.height;
		// var distance = theEnd - total;
// 
		// if (distance < lastDistance){
			// var nearEnd = theEnd * .75;
 			// if (!loading && (total >= nearEnd)){
 				// loading = true;
 				// refresh();
 			// }
		// }
		// lastDistance = distance;
	// }
// 	
	// if(Ti.Platform.osname == 'android' && !loading){
		// if((e.firstVisibleItem+e.visibleItemCount) == e.totalItemCount){
			// loading = true;
			// refresh();
		// }
	// }
// });
