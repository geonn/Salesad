var args = arguments[0] || {};
var a_id = args.a_id;
var m_id = args.m_id;
var cate_id = args.cate_id || "";
var isFeed = args.isFeed || "";
var u_id = Ti.App.Properties.getString('u_id') || "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;
/** google analytics**/
var lib_feeds = Alloy.createCollection('feeds');
if(isFeed == 1){ 
	lib_feeds.updateUserFeeds(m_id,a_id);		
}
 

//Default ads background
$.ad.backgroundColor = "#FFFFF6";
var gBannerImg;
/*********************
*******FUNCTION*******
**********************/ 
var getAdDetails = function(a_id){
	
	var i_library = Alloy.createCollection('items'); 
	var a_library = Alloy.createCollection('ads'); 
	var ads = a_library.getAdsInfo(a_id);
	ads = ads[0];
	
	var the_view = [];
    var items = i_library.getItemByAds(a_id);

	var counter = 0;
	var imagepath, adImage, row, cell = '';
	var last = items.length-1;
 	var adspage = Ti.UI.createScrollView({
 		
 		ads_name: ads.ads_name,
 		m_id: ads.m_id,
 		ads_background: ads.ads_background,
 		a_id: ads.a_id,
		bottom: 4,
		scrollType: "vertical",
		height:	Ti.UI.FILL,
		width:	Ti.UI.FILL,
		contentHeight: Ti.UI.FILL,
		contentHeight: Ti.UI.SIZE,
 		layout:"vertical"
 	});
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
	adspage.add(bannerImage);
 	
 	if( ads.ads_background !== undefined){
	 	$.ad.backgroundColor = "#"+ads.ads_background;
	 }else{
	 	 $.ad.backgroundColor = "#fffff6";
	 }
	 
	adspage.addEventListener('click', function(e) {
		// double click prevention
	    var currentTime = new Date();
	    if (currentTime - clickTime < 1000) {
	        return;
	    };
	    clickTime = currentTime; 
		var win = Alloy.createController("branches", {m_id: m_id}).getView(); 
		COMMON.openWindow(win,{animated:true}); 
	
	});
	/***Set ads items**/
 
	if(items.length > 0 ){
		for (var i=0; i< items.length; i++) {
	
			if(counter%2 == 0){
				row = $.adsView.UI.create('View', {classes: ["rowAds"],});
			}
			cell = $.adsView.UI.create('View', {classes: ["cellAds"],});
			
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
				adspage.add(row);
			}
			counter++;
		} 
		
		isAdsAvailable = true;
	}
	
	/**Set Custom title*/
	var pageTitle = ads.ads_name; 
	if(typeof pageTitle == "undefined"){
		pageTitle ="";
	}else{
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
	
	
	
	//var ads_title = textCounter(pageTitle , 14);

	$.adsView.ads_details.addView(adspage);
	$.adsView.ads_details.scrollToView(1);
	$.adsView.ads_details.scrollToView(0);
	$.adsView.activityIndicator.hide();
	$.adsView.loadingBar.opacity = "0";
	$.adsView.loadingBar.height = "0";
	$.adsView.loadingBar.top = "0";	
	
	
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

var c_ads_library = Alloy.createCollection('categoryAds'); 
var ads = c_ads_library.getLatestAdsByCategory(cate_id, 0);

for(var a = 0; ads.length > a; a++){
	getAdDetails(ads[a].a_id);
}

/********						set first ads title								*******/
var a_library = Alloy.createCollection('ads'); 
var currentAds = a_library.getAdsInfo(ads[0].a_id);
var	adsTitle = currentAds[0].ads_name;
adsTitle =adsTitle.replace(/&quot;/g, "'");
var custom = Ti.UI.createLabel({ 
		    text: adsTitle, 
		    color: '#CE1D1C' 
});
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.ad.titleControl = custom; 
} 

/********						set first ads favorites visibility				*******/
var model_favorites = Alloy.createCollection('favorites');
	var exist = model_favorites.checkFavoriteExist(a_id, m_id);
	
	if(exist){
		$.favorites.visible = false;
	}else{
		$.favorites.visible = true;
	}
	
/*********					set first ads background color******/
if( currentAds[0].ads_backgroun !== undefined){
 	$.ad.backgroundColor = "#"+currentAds[0].ads_background;
 }else{
 	 $.ad.backgroundColor = "#fffff6";
 }

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.ad); 
}); 

$.ad.addEventListener("close", function(){
	Ti.App.fireEvent('removeNav');
    $.adsView.destroy();
});

$.adsView.ads_details.addEventListener("scrollend", function(e){
	if (typeof e.view === "undefined") {
		return;
	}
	var label_text = JSON.stringify(e.view.ads_name);
	var m_id_v= JSON.stringify(e.view.m_id);
	var a_id_v = JSON.stringify(e.view.a_id);
	
	var model_favorites = Alloy.createCollection('favorites');
	var exist = model_favorites.checkFavoriteExist(a_id, m_id);
	 
	if(exist){
		$.favorites.visible = false;
	}else{
		$.favorites.visible = true;
	}
 	
 	label_text = label_text.replace(/"/g, ""); 
	label_text =label_text.replace(/&quot;/g, "'");
	m_id = m_id_v.replace(/"/g, "");
	a_id = a_id_v.replace(/"/g, "");  
	$.ad.backgroundColor = "#"+JSON.stringify(e.view.ads_background).replace(/"/g, "");
 
	var custom = Ti.UI.createLabel({ 
	    text: label_text, 
	    color: '#CE1D1C' 
	});
	if(Ti.Platform.osname == "android"){ 
		//$.pageTitle.removeAllChildren();
		COMMON.removeAllChildren($.pageTitle);
		$.pageTitle.add(custom);   
	}else{
		$.ad.titleControl = custom; 
	} 
	
});

$.location.addEventListener('click', function(e){
	var win = Alloy.createController("location",{m_id:m_id,a_id:a_id}).getView(); 
	COMMON.openWindow(win); 
});

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