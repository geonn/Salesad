var args = {};

Alloy.Globals.navMenu = $.navMenu;
var listingType = "featured";
var clickTime = null;

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "main",
	action: "view",
	label: "home",
	value: 1
});
Alloy.Globals.tracker.trackScreen("Home");


/** load category from Model**/
var library = Alloy.createCollection('banners'); 
var m_favorites = Alloy.createCollection('favorites'); 
var m_library = Alloy.createCollection('merchants'); 
var f_library = Alloy.createCollection('feeds'); 
var u_id = Ti.App.Properties.getString('u_id') || "";


var feeds = f_library.getSalesFeed();
console.log(feeds);
/** include required file**/
var API = require('api');

/*********************
*******FUNCTION*******
**********************/

var goAd = function(m_id,b_id,isFeed){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	    
	var win = Alloy.createController("ad", {m_id: m_id, from : "home", isFeed: isFeed}).getView(); 
	$.navMenu.openWindow(win,{animated:true}); 
};

var goBranch = function(m_id){
	var win = Alloy.createController("branches", {m_id: m_id, from : "home"}).getView(); 
	$.navMenu.openWindow(win,{animated:true}); 
};

var changeType = function(e) {
	listingType = e.types;
	if(listingType == "favorites"){
		createGridListing({type:e.types});
	}else{
		loadAd(e);
	}
};

function loadAd(e){
	if(e.pullFromServer === true){
		API.loadMerchantListByType(e.types);
	}
	createGridListing({type:e.types});
}

var bannerListing = function(res){
 	var banners = library.getBannerList();
 	 
	var the_view = [];
   	var counter = 0;
	var imagepath, adImage, row = '';
	var my_page = 0;
	 
	var bannerHeight = $.bannerListing.rect.height; 
	
	for (var i=0; i< banners.length; i++) {
		//console.log(banners[i].img);
		adImage = Utils.RemoteImage({
				image: banners[i].img,
				source: banners[i].m_id,
				width:"100%",
				height: bannerHeight
			});
			
			var scrollView = Ti.UI.createScrollView({
				top:"0",
				contentWidth: 'auto',
			  	contentHeight: 'auto',
			   	height:bannerHeight,
			  	width: '100%' 
			});
			
			row = $.UI.create('View', {classes: ["row"],layout:"vertical", height:bannerHeight});
			
			row.add(adImage);
			//row.add(img_caption);
			row.addEventListener('touchend', function(e) {
			 	goAd(e.source.source);
			});
			
			scrollView.add(row);
			the_view.push(scrollView); 
			counter++;			
	}
	
	var scrollableView = Ti.UI.createScrollableView({
			id: "scrollableView",
			views:the_view,
			showPagingControl:true
		});
		scrollableView.setPagingControlColor("transparent");
		$.bannerListing.removeAllChildren();
		$.bannerListing.add(scrollableView);
		
		scrollableView.addEventListener( 'scrollend', function(e) {
			if((scrollableView.currentPage+1) === banners.length){
				if(scrollableView.currentPage === my_page){
					scrollableView.currentPage=0;
				}
			}
					
			my_page =  scrollableView.currentPage;
		});
		
		setInterval(function() {
		    var numPages = banners.length;
		    var page = scrollableView.currentPage;
		    page = page + 1 ;
		    if(page >= numPages){
		    	page =0;
		    }
		    
		    scrollableView.scrollToView(page);
		}, 5000); 
};


/*** Get ads ***/
var createGridListing = function(res){
	var typeLibrary = Alloy.createCollection(res.type); 
	var merchantsLibrary = Alloy.createCollection('merchants'); 
	var branchLibrary = Alloy.createCollection('branches');

	if(res.type == "recent"){
		var details = typeLibrary.getRecentList();
	}else if(res.type == "popular"){
		var details = typeLibrary.getPopularList();
	}else if(res.type == "favorites"){
		var details = typeLibrary.getFavoritesByUid(u_id);
	}else{
		var details = typeLibrary.getFeaturedList();
	}
	
  	var counter = 0;
   	var imagepath, adImage, row, cell = '';
 	var last = details.length-1;
    $.scrollview.removeAllChildren();
    var a_library = Alloy.createCollection('ads');
    for(var i=0; i< details.length; i++) {
   		var m_id = details[i].m_id; 
   		var branch = branchLibrary.getBranchesByMerchant(m_id); 
   		var info = merchantsLibrary.getMerchantsById(m_id);
   		var ads = a_library.getAdsById(m_id,"");
   		if(ads.a_id != "0"){
   			imagepath = info.img;
   			 
	   		adImage = Ti.UI.createImageView({
	   			defaultImage: '/images/home.png',
				image: "sa"+imagepath+"as", 
				height: Ti.UI.FILL
			});
			 
	   		if(counter%3 == 0){
	   			row = $.UI.create('View', {classes: ["row"],textAlign:'center', bottom: 2});
	   		}
	   		cell = $.UI.create('View', {classes: ["cell"], top: 2});
	   		
	   		createAdImageEvent(adImage, m_id);
	   		
	   		cell.add(adImage);
			row.add(cell);
			
			if(counter%3 == 2 || last == counter){
	   			$.scrollview.add(row);
	   		}
	   		// console.log("accepted : "+m_id);
   			// console.log(ads);
	   		counter++;
   		}else{
   			// console.log("rejected : "+m_id);
   			// console.log(ads);
   		}
	 }
};

//dynamic addEventListener for adImage
function createAdImageEvent(adImage, m_id) {
    adImage.addEventListener('click', function(e) {
        goAd(m_id);
    });
}

function createAdBranchEvent(adImage, m_id){
	adImage.addEventListener('click', function(e) {
        goBranch(m_id);
    });
}

function initAdsListing(){
	var res = m_favorites.getFavoritesByUid(u_id);
	if(res == ""){
		loadAd({types: "featured", pullFromServer:true});
	}else{
		listingType = "favorites";
		loadAd({types: "favorites", pullFromServer:false});
	}
}

function refreshAdsListing(){
	createGridListing({type: listingType});
}

/************************
*******APP RUNNING*******
*************************/
$.navMenu.open({fullscreen:true});

/**Load local function**/
bannerListing();
initAdsListing();


/**Call API to update app's data**/
API.loadCategory();
API.bannerListing();

/*********************
*** Event Listener ***
**********************/
$.category_link.addEventListener('click', function(e){
	var win = Alloy.createController("category").getView(); 
	$.navMenu.openWindow(win,{animated:true}); 
	Alloy.Globals.navMenu = $.navMenu;
});

$.arrow_link.addEventListener('click', function(e){
	var page = Alloy.createController('popup').getView();
	page.open();
	page.animate({
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
		opacity: 1,
		duration: 200
	});

});

Ti.App.addEventListener('app:goToAds', function(e){
	 
	goAd(e.m_id,e.a_id,e.isFeed);
});
Ti.App.addEventListener('app:triggerAdsType', changeType);
Ti.App.addEventListener('app:bannerListing', bannerListing);
Ti.App.addEventListener('app:refreshAdsListing', refreshAdsListing);

/** close all login eventListener when close the page**/
$.root.addEventListener("close", function(){
    $.destroy();
  
    /* release function memory */
    Ti.App.removeEventListener('app:goToAds');
    Ti.App.removeEventListener('app:triggerAdsType', changeType);
    Ti.App.removeEventListener('app:bannerListing', bannerListing);
});
