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

/** include required file**/
var API = require('api');
var common = require('common');

//Default ads background
$.ad.backgroundColor = "#FFFFF6";

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
 		height:	Ti.UI.FILL,
 		ads_name: ads.ads_name,
 		m_id: ads.m_id,
 		ads_background: ads.ads_background,
 		a_id: ads.a_id,
		width:	Ti.UI.FILL,
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
 	var bannerImage = Utils.RemoteImage({
 	  defaultImage: "",
	  image :ads.img_path,
	  width : "100%",
	  height: ads_height,
	});
	
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
		nav.openWindow(win,{animated:true}); 
	
	});
	/***Set ads items**/
 
	if(items.length > 0 ){
		for (var i=0; i< items.length; i++) {
	
			if(counter%2 == 0){
				row = $.UI.create('View', {classes: ["row"],});
			}
			cell = $.UI.create('View', {classes: ["cell"],});
			
			imagepath = items[i].img_path;
			adImage = Utils.RemoteImage({
				image: imagepath,
				width: Ti.UI.FILL,
				height: Ti.UI.FILL
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

	$.ads_details.addView(adspage);
	
	
	$.activityIndicator.hide();
	$.loadingBar.opacity = "0";
	$.loadingBar.height = "0";
	$.loadingBar.top = "0";	
	
	
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
	
var custom = Ti.UI.createLabel({ 
		    text: currentAds[0].ads_name, 
		    color: '#CE1D1C' 
});
$.ad.titleControl = custom;

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
	nav.closeWindow($.ad); 
}); 

$.ad.addEventListener("close", function(){
	Ti.App.fireEvent('removeNav');
    $.destroy();
});

$.ads_details.addEventListener("scrollend", function(e){
	if (typeof e.view === "undefined") {
		return;
	}
	var label_text = JSON.stringify(e.view.ads_name);
	var m_id_v= JSON.stringify(e.view.m_id);
	var a_id_v = JSON.stringify(e.view.a_id);
	
	var model_favorites = Alloy.createCollection('favorites');
	var exist = model_favorites.checkFavoriteExist(a_id, m_id);
	console.log(exist);
	if(exist){
		$.favorites.visible = false;
	}else{
		$.favorites.visible = true;
	}

	console.log(m_id_v+" "+a_id_v);
	m_id = m_id_v.replace(/"/g, "");
	a_id = a_id_v.replace(/"/g, "");
	
	var custom = Ti.UI.createLabel({
		    text: label_text.replace(/"/g, ""),
		    color: '#CE1D1C' 
	});
	$.ad.titleControl = custom;
	console.log(JSON.stringify(e.view.ads_background).replace(/"/g, ""));
	$.ad.backgroundColor = "#"+JSON.stringify(e.view.ads_background).replace(/"/g, "");

});

$.location.addEventListener('click', function(e){
	var win = Alloy.createController("location",{m_id:m_id,a_id:a_id}).getView(); 
	nav.openWindow(win,{animated:true}); 
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
