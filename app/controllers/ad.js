var args = arguments[0] || {};
var m_id = args.m_id;
var a_id = args.a_id || "";
var from = args.from || "";
var isFeed = args.isFeed || "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;
var isAdsAvailable  = false;

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
 
/*********************
*******FUNCTION*******
**********************/

var getAdDetails = function(){
	var ads = a_library.getAdsById(m_id,a_id);
    var items = i_library.getItemByAds(ads.a_id);
	console.log(ads);
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
	
	$.adView.ads_details.add(bannerImage);
 	
 	if( ads.ads_background !== undefined){
	 	$.ad.backgroundColor = "#"+ads.ads_background;
	 	$.adHeader.backgroundColor = "#fffff6";
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
				width: Ti.UI.FILL,
				height: Ti.UI.FILL
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
	}
	
	/**Set Custom title**/
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



