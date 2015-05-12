var args = arguments[0] || {};
var m_id = args.m_id;
var a_id = args.a_id || "";
var from = args.from || "";
var isFeed = args.isFeed || "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;
var isAdsAvailable  = false;
console.log(args);
/** google analytics**/
var lib_feeds = Alloy.createCollection('feeds');
if(isFeed == 1){ 
	lib_feeds.updateUserFeeds(m_id,a_id);		
}
	
$.adView.activityIndicator.show();
$.adView.loadingBar.opacity = "1";
$.adView.loadingBar.height = "120";
$.adView.loadingBar.top = "100";

//Default ads background
$.ad.backgroundColor = "#FFFFF6";

//load model
var m_library = Alloy.createCollection('merchants'); 
var a_library = Alloy.createCollection('ads'); 
var i_library = Alloy.createCollection('items'); 
 
//load merchant & branches list
var merchants = m_library.getMerchantsById(m_id);

var u_id = Ti.App.Properties.getString('u_id') || "";
var model_favorites = Alloy.createCollection('favorites');
var exist = model_favorites.checkFavoriteExist(a_id, m_id);
var getFavorites = model_favorites.getFavoritesByUid(u_id);
var gBannerImg;
/*********************
*******FUNCTION*******
**********************/

var getAdDetails = function(){
	var ads = a_library.getAdsById(m_id,a_id);
    var items = i_library.getItemByAds(ads.a_id);
    console.log(ads);
    console.log(items);
	var counter = 0;
	var imagepath, adImage, row, cell = '';
	  
	var last = items.length-1;

 	$.adView.ads_details.removeAllChildren(); 
 	/***Set ads template***/
 	var ads_height = "100%";
 	if(ads.template == "1"){
 		ads_height = "33%";
 	}
 	if(ads.template == "2"){
 		ads_height = "66%";
 	}
 	 
 	/***Add ads banner***/
 	var bannerImage = Ti.UI.createImageView({
 		defaultImage: "/images/warm-grey-bg.png",
		image :ads.img_path,
		width : "100%",
		height: Ti.UI.SIZE,//ads_height,
	});
	
	gBannerImg = ads.img_path;
	//Ti.Platform.openURL('whatsapp://send?text='+ads.img_path);
	$.adView.ads_details.add(bannerImage);
 	
 	if( ads.ads_background !== undefined){
	 	$.ad.backgroundColor = "#"+ads.ads_background;
	 	if(Ti.Platform.osname == "android"){ 
	 		$.adHeader.backgroundColor = "#fffff6";
	 	}
	 	
	 }else{
	 	 $.ad.backgroundColor = "#fffff6";
	 }
	 
	$.adView.ads_details.addEventListener('click', function(e) {
		// double click prevention
	    var currentTime = new Date();
	    if (currentTime - clickTime < 1000) {
	        return;
	    };
	    clickTime = currentTime; 
		var win = Alloy.createController("branches", {m_id: m_id}).getView(); 
		COMMON.openWindow(win); 
	
	});
	/***Set ads items***/
 
	if(items.length > 0 ){
		for (var i=0; i< items.length; i++) {
	
			if(counter%2 == 0){
				row = $.adView.UI.create('View', {classes: ["rowAd"],});
			}
			cell = $.adView.UI.create('View', {classes: ["cellAd"],});
			
			imagepath = items[i].img_path;
			
			adImage = Ti.UI.createImageView({
				defaultImage: "/images/warm-grey-bg.png",
				image: imagepath,
				left: 4,
				width: Ti.UI.FILL,
				height: "auto",
			});
			
			createAdImageEvent(adImage,ads.a_id,counter,ads.name);
			
			cell.add(adImage);
			row.add(cell);
			
			if(counter%2 == 1 || last == counter){
				$.adView.ads_details.add(row);
			}
			counter++;
		} 
		
		isAdsAvailable = true;
	}else{
		var noAvailableLabel = Ti.UI.createLabel({
			text : "No ads available",
			height: Ti.UI.SIZE,
			width: Ti.UI.FILL,
			top:10,
			textAlign: 'center'
		});
		var default_image = $.UI.create("ImageView",{
			image: "images/default-panel-1.png",
			height: Ti.UI.FILL,
			width: Ti.UI.FILL
		});
		$.adView.ads_details.add(default_image);
	}
	
	/**Set Custom title**/
	console.log(merchants);
	
	if(typeof pageTitle == "undefined"){ 
		pageTitle =merchants.name;
	}else{
		pageTitle =merchants.name;
		
		Alloy.Globals.tracker.trackEvent({
			category: "ads",
			action: "view",
			label: "ads_details",
			value: 1
		});
		Alloy.Globals.tracker.trackScreen({
		    screenName: "Ads Details - " +pageTitle
		});
	
	}
	
	if (pageTitle.length > 14) {// if too long...trim it!}
    	pageTitle = pageTitle.substring(0, 14) + "...";
 
    }
    pageTitle =pageTitle.replace(/&quot;/g, "'");
	
	var custom = Ti.UI.createLabel({ 
		    text: pageTitle, 
		    color: '#CE1D1C' 
	});
	
	//var ads_title = textCounter(pageTitle , 14);
	if(Ti.Platform.osname == "android"){ 
		$.pageTitle.add(custom);   
	}else{
		$.ad.titleControl = custom;
	} 
	
	$.adView.activityIndicator.hide();
	$.adView.loadingBar.opacity = "0";
	$.adView.loadingBar.height = "0";
	$.adView.loadingBar.top = "0";	
};


//dynamic addEventListener for adImage
function createAdImageEvent(adImage,a_id,position, title) {
    adImage.addEventListener('click', function(e) {
    	// double click prevention
	    var currentTime = new Date();
	    if (currentTime - clickTime < 1000) {
	        return;
	    };
	    clickTime = currentTime;
		var page = Alloy.createController("itemDetails",{a_id:a_id,position:position, title:title}).getView(); 
	  	page.open();
	  	page.animate({
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
			opacity: 1,
			duration: 300
		});
    });
}

 
$.location.addEventListener('click', function(e){
	 
	var win = Alloy.createController("location",{m_id:m_id,a_id:a_id}).getView(); 
	COMMON.openWindow(win); 
});
/************************
*******APP RUNNING*******
*************************/

getAdDetails();
if(exist){
	$.favorites.visible = false;
}
/*********************
*** Event Listener ***
**********************/

//Add your favorite event
$.favorites.addEventListener("click", function(){
	var favoritesLibrary = Alloy.createCollection('favorites'); 
	var message = "Are you sure want to add into favorite";
	var dialog = Ti.UI.createAlertDialog({
	    cancel: 1,
	    buttonNames: ['Cancel','Confirm'],
	    message: message,
	    title: 'Add to favorite'
	  });
	  dialog.addEventListener('click', function(ex){
	  	if (ex.index == 1){
	    	var favorite = Alloy.createModel('favorites', {
				    m_id   : m_id,
				    b_id     : a_id,
				    u_id	 : u_id,
				    position : 0
				});
			favorite.save();
			$.favorites.visible = false;
			
			API.updateUserFavourite({
				m_id   : m_id,
				a_id     : a_id,
				u_id	 : u_id,
				status : 1
			});
			Ti.App.fireEvent("app:refreshAdsListing");
			return;
	  	}
	 });

	dialog.show();
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.ad); 
}); 

$.ad.addEventListener("close", function(){
	Ti.App.fireEvent('removeNav');
    $.adView.destroy();
});

/**Call API to update app's data**/
//API.loadAdsDetails(m_id,a_id);

Ti.App.addEventListener('app:loadAdsDetails', function(e){
	if(e.needRefresh == true){
		getAdDetails();
	}
});	


/*** GEO experiment***/  
if (Titanium.Platform.name == 'iPhone OS'){
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
     
    $.share.addEventListener("click", function(e){
    	 
		if(Social.isActivityViewSupported()){ //min iOS6 required
	    	Social.activityView({
	        	text: pageTitle + ". Download SalesAd : http://apple.co/1RtrCZ4",
	        	//url: "http://apple.co/1RtrCZ4",
	        	image:gBannerImg
	     	});
	     } else {
	     	//implement fallback sharing..
	     	console.log("items called");
	     }
		 
    });
     
	Social.addEventListener("twitterRequest", function(e){ //default callback
		Ti.API.info("twitterRequest: "+e.success);	
		Ti.API.info(e.response); //json
		Ti.API.info(e.rawResponse); //raw data - this is a string
	});
	 
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
}else{ 
	$.share.addEventListener("click", function(e){
    	var share = createShareOptions();
		Ti.Android.currentActivity.startActivity(share);
    });
} 

function createShareOptions(){
 
    var subject = pageTitle;
    var text = pageTitle + ". Download SalesAd : http://apple.co/1RtrCZ4";
  
    var intent = Ti.Android.createIntent({
        action: Ti.Android.ACTION_SEND,
        type: "text/plain",
    });
    intent.putExtra(Ti.Android.EXTRA_TEXT,text);
    intent.putExtra(Ti.Android.EXTRA_SUBJECT,subject);
 	intent.putExtraUri(Ti.Android.EXTRA_STREAM,gBannerImg);
    var share = Ti.Android.createIntentChooser(intent,'Share');
 
    return share;
}