var args = {};
var clickTime = null;
var u_id = Ti.App.Properties.getString('u_id') || "";
var category_sync_counter = 0; 

var loadingView = Alloy.createController("loader");
loadingView.getView().open();
loadingView.start();

/** add new column for ads **/
var ads = Alloy.createCollection('ads');
var model_merchants = Alloy.createCollection('merchants'); 
var model_category = Alloy.createCollection('category');
var items = Alloy.createCollection('items');

/** Google Analytic**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "main",
		action: "view",
		label: "home",
		value: 1
	});
	Alloy.Globals.tracker.trackScreen({
	    screenName: "Home"
	});
}else{ 
	Alloy.Globals.tracker.addEvent({
        category: "main",
		action: "view",
		label: "home",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView('Home');
}


//Global Variable Set Navigation Menu
Alloy.Globals.navMenu = $.navMenu;
 
/*********************
*******FUNCTION*******
**********************/

/** create banner slideshow**/
var bannerListing = function(){
	
	var banner_model = Alloy.createCollection('banners'); 
 	var banners = banner_model.getBannerList(); 
	var the_view = [];
   	var counter = 0;
	var imagepath, adImage, row = '';
	var my_page = 0;
	//var Ti.UI.SIZE = $.indexView.bannerListing.rect.height;
	for (var i=0; i< banners.length; i++) {
			adImage = Ti.UI.createImageView({
				image: banners[i].img_path,
				m_id: banners[i].m_id,
				width: Ti.UI.FILL,
				height: Ti.UI.FILL,
				defaultImage: "/images/warm-grey-bg.png",
			});
			var curActivity = '';
			if(Ti.Platform.osname == "android"){
				curActivity = Titanium.Android.currentActivity;
			}
			
			//if (curActivity != null || Ti.Platform.name === 'iPhone OS') { 
			
			var activityIndicator = Ti.UI.createActivityIndicator({
			  color: 'green', 
			  top:10,
			  left:10,
			  style: Ti.UI.ActivityIndicatorStyle.DARK,
			  height:Ti.UI.SIZE,
			  width:Ti.UI.SIZE,
			  zIndex: 11,
			});
			/**
			activityIndicator.show();
			**/
			bannerAdIamgeLoadEvent(adImage);
			var scrollView = Ti.UI.createScrollView({
				top:"0",
				scrollType: "horizontal",
				contentWidth: 'auto',
			  	contentHeight: 'auto',
			   	height:Ti.UI.SIZE,
			   	backgroundImage: "/images/warm-grey-bg.png",
			  	width: '100%' 
			});
			
			row = $.indexView.UI.create('View', {classes: ["row"],layout:"", height:Ti.UI.SIZE});
			
			
			//row.add(activityIndicator);
			row.add(adImage);
			//row.add(img_caption);
			
			
			//scrollView.add(row);
			the_view.push(row); 
			counter++;			
	}
	
			
	
	var scrollableView = Ti.UI.createScrollableView({
			id: "scrollableView",
			views:the_view,
			showPagingControl:false,
		});
		
		scrollableView.addEventListener('click', function(e) { 
			goAd(e.source.m_id);
		});
		//scrollableView.setPagingControlColor("transparent");
		$.indexView.bannerListing.removeAllChildren();
		$.indexView.bannerListing.add(scrollableView);
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

/** create category grid **/
function buildCateogryList(e){
	
	while($.indexView.adListing.children.length>0){
	    $.indexView.adListing.remove($.indexView.adListing.children[0]);
	};
	var model_category = Alloy.createCollection('category');
	var category_list = model_category.getCategoryList();
	if(!category_list.length){ 
		API.loadCategory();
		return;
	}
	var contest = {categoryName: "Contest", id: 0};
	category_list.push(contest);
	for (var i=0; i< category_list.length; i++) {
		var cell = $.indexView.UI.create('View', {classes: ["cell"], id: category_list[i].id});
		var pad_cell = $.indexView.UI.create('View', {top: 4, right:4, width: Ti.UI.FILL, height:Ti.UI.SIZE}); 
		var temp_image = $.indexView.UI.create('ImageView',{
			image: "/images/warm-grey-bg.png",
			height: "auto",
			width: Ti.UI.FILL,                           
		});
		
		var pad_categoryLabel = $.indexView.UI.create('View', {top:0, width: Ti.UI.FILL, height:Ti.UI.SIZE, backgroundImage:  "images/transparent-bg.png", zIndex: 10});
		var categoryLabel = Ti.UI.createLabel({
			text: category_list[i].categoryName,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			top: 0,
			zIndex: 10,
			font:{
				fontSize: 14
			},
			color: "#ffffff",
			top: 4, right:4, left:4, bottom:20,
		});
		 
		var activityIndicator = Ti.UI.createActivityIndicator({
		  color: 'green', 
		  bottom:10,
		  right:10,
		  height:Ti.UI.SIZE,
		  width:Ti.UI.SIZE
		});
		 
		activityIndicator.show();
		
		pad_categoryLabel.add(categoryLabel);
		pad_cell.add(temp_image);
		pad_cell.add(pad_categoryLabel);
		pad_cell.add(activityIndicator);
		cell.add(pad_cell);
		$.indexView.adListing.add(cell); 
		if(!category_list[i].id){
			var contest = Alloy.createCollection("contest");
			var contests = contest.getData(0,1);
			if(contests.length){
				var adImage = Ti.UI.createImageView({
		   			defaultImage: "/images/warm-grey-bg.png",
					image: contests[0].img_path,
					width: Ti.UI.FILL,
					height: Ti.UI.SIZE,
				});
		   		adIamgeLoadEvent(adImage, activityIndicator);
		   		pad_cell.add(adImage);
		   		adImage.addEventListener('click', function(e){
		   			//goAds("", contests[0].id);
		   			var win = Alloy.createController("contest_preview").getView(); 
					COMMON.openWindow(win); 
		   		});
	   		}else{
	   			$.indexView.adListing.remove(cell); 
	   		}
		}else if(typeof e != "undefined" && typeof e != "null"){
		//	console.log("aaa");
			loadLatestImageByCategoryId(pad_cell, activityIndicator, category_list[i].id, e.types);
		}else{
		//	console.log("bbb");
			loadLatestImageByCategoryId(pad_cell, activityIndicator, category_list[i].id);
		}
		//syncCategory(category_list[i].id);
	}
}

/** Sync Merchant by category from Server **/
function syncCategory(){
	var model_category = Alloy.createCollection('category'); 
	var category_list = model_category.getCategoryList();
	
	for (var i=0; i< category_list.length; i++) {
		var API = require('api');
		API.getMerchantListByCategory(category_list[i].id);
	}
}
/** Load Latest Ads by Category **/
function loadLatestImageByCategoryId(cell, activityIndicator, cate_id, types){
	var c_ads_library = Alloy.createCollection('categoryAds');
	 
	if(types == "popular"){
		var latestc = c_ads_library.getPopularAdsByCategory(cate_id, 1);
	}else{
		var latestc = c_ads_library.getLatestAdsByCategory(cate_id, 0, 1);
	}
	
	if(typeof latestc[0] == 'object'){
		var adImage = Ti.UI.createImageView({
   			defaultImage: "/images/warm-grey-bg.png",
			image: latestc[0].img_path,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE
		});
   		createAdImageEvent(adImage, cate_id);
   		adIamgeLoadEvent(adImage, activityIndicator);
   		cell.add(adImage);
   	}
}

/** navigate to Ad **/
var goAd = function(m_id, isFeed){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	    
	var win = Alloy.createController("ad", {m_id: m_id, from : "home", isFeed: isFeed}).getView(); 
	COMMON.openWindow(win); 
};

/** navigate to Ads **/
function goAds(cate_id, contest_id){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	if(typeof contest_id != "undefined"){
		var win = Alloy.createController("ads_category", {contest_id: contest_id}).getView();
	}else{
		var win = Alloy.createController("ads_category", {cate_id: cate_id}).getView(); 
	}
	COMMON.openWindow(win); 
};

//var goAds = _.debounce(eventAds, 1000, true);

/** Bind GoAds Event to Image **/
function createAdImageEvent(adImage, cate_id) {
    adImage.addEventListener('click', function(e) {
        goAds(cate_id);
    });
}

/** Bind Indicator to Banner Image **/
function bannerAdIamgeLoadEvent(adImage){
	//activityIndicator.hide(); 
	adImage.addEventListener('load', function(e) { 
		if(!category_sync_counter){
			if(Ti.Platform.osname != "android"){
				$.indexView.scrollview.setDisableBounce(false);
			}
      		$.indexView.scrollview.animate({top:0, duration: 500});
		}
	});
}

/** Bind Indicator to Ad Image **/
function adIamgeLoadEvent(adImage, activityIndicator){
	adImage.addEventListener('load', function(e) {
		category_sync_counter--; 
		activityIndicator.hide();
		if(!category_sync_counter){
			if(Ti.Platform.osname != "android"){
				$.indexView.scrollview.setDisableBounce(false);
			}else{
				/** IOS trigger when all category image loaded **/
			}
      		$.indexView.scrollview.animate({top:0, duration: 500});
      		
		}
	});
}

function updateCategoryList(e){
	for (var c = $.indexView.adListing.children.length - 1; c >= 0; c--) {
		var activityIndicator = $.indexView.adListing.children[c].children[0].children[2];
		var cell = $.indexView.adListing.children[c].children[0]; 
		if(typeof e != "undefined" && typeof e != "null"){
			loadLatestImageByCategoryId(cell, activityIndicator, $.indexView.adListing.children[c].id, e.types);
		}else{
			loadLatestImageByCategoryId(cell, activityIndicator, $.indexView.adListing.children[c].id);
		}
	}
}

function loadingViewFinish(){
	loadingView.finish(function(){
		if(OS_IOS){
			$.navMenu.open({fullscreen:true});
			loadingView.getView().close();
		}else{
			$.indexView.root.open();
		} 
		init();
		loadingView = null;
	});
}

function init(){
	//API.loadMerchantListByType("all");
	 
	bannerListing();
	buildCateogryList();
	cmd = Ti.App.getArguments();
	console.log(cmd);
	if ( (typeof(cmd) == 'object') && cmd.hasOwnProperty('url') ) {
	    if ( cmd.url != Ti.App.pauseURL ) {
	        Ti.App.launchURL = cmd.url;
	        var details = cmd.url;
	        var arg = details.split("://"); 
	        var ads = arg[1].split("?");
	       
	        var win = Alloy.createController( ads[0] , {a_id:  ads[1], from : "home"}).getView(); 
			COMMON.openWindow(win); 
	        Ti.API.info( 'Resumed with url = ' + Ti.App.launchURL );
	    }
	}
}
/************************
*******APP RUNNING*******
*************************/
/*
var loadingView = Alloy.createController("loader");
loadingView.getView().open();
loadingView.start(); 

setTimeout(function(){
	loadingView.finish(function(){
		
		if(OS_IOS){
			$.nav.open()
		}
		else if(OS_MOBILEWEB){
			$.index.open();
		}
		else{
			$.index.getView().open();
		} 
		
		loadingView.getView().close();
		loadingView = null;
	});
}, 1500);
*/

/*if(Ti.Platform.osname == "android"){ 
	$.indexView.root.open(); 
}else{ 
	$.navMenu.open({fullscreen:true});
} 

var API = require('api');
/** 
 * Banner Flow 
 * index.js API.bannerListing() 
 * > api.js Ti.App.fireEvent('app:bannerListing') 
 * > index.js bannerListing()
 **/
//API.bannerListing();

/** 
 * Category Flow 
 * index.js API.loadCategory() > api.js fireEvent('app:loadCategory')  // sync category from server
 * > index.js buildCateogryList() 
 * > index.js syncCategory() 
 * > index.js API.loadMerchantListByCategory(cate_id) > api.js fireEvent('app:category_detailCreateGridListing') // sync merchant from server
 * > index.js API.loadAdsByCategory(e.cate_id); > api.js fireEvent('app:adsUpdated', {cate_id: cate_id}); // sync ads from server
 * > index.js loadLatestImageByCategoryId();
 * > index.js categorAds.getLatestAdsByCategory(cate_id, 1);
 **/
//buildCateogryList();
//API.loadCategory();

/*********************
*** Event Listener ***
**********************/

Ti.App.addEventListener('app:triggerAdsType', updateCategoryList);

$.indexView.more.addEventListener("click", function(e){
	var win = Alloy.createController("category").getView();  
	COMMON.openWindow(win);
});

$.indexView.nearby.addEventListener("click", function(e){
	var win = Alloy.createController("nearby").getView();  
	COMMON.openWindow(win);
});

function goToAds(e){
	goAd(e.m_id, e.isFeed);
}

function category_detailCreateGridListing(e){
	API.loadAdsByCategory(e.cate_id);
}

function adsUpdated(e){
	if(!$.indexView.adListing.children.length){ 
		buildCateogryList();
	}
	for (var c = $.indexView.adListing.children.length - 1; c >= 0; c--) {
		if($.indexView.adListing.children[c].id == e.cate_id){
			var activityIndicator = $.indexView.adListing.children[c].children[0].children[2];
			var cell = $.indexView.adListing.children[c].children[0];
			loadLatestImageByCategoryId(cell, activityIndicator, e.cate_id);
		}
    }
}

function loadCategory(e){
	var model_category = Alloy.createCollection('category'); 
	var category_list = model_category.getCategoryList();
	
	for (var i=0; i< category_list.length; i++) {
		var API = require('api');
		API.getMerchantListByCategory(category_list[i].id);
	}
}

/** EventListerner for notification **/
Ti.App.addEventListener('app:goToAds', goToAds);

/** EventListner for after API.loadMerchantListByCategory success
 * function ready to remove.
 * **/
Ti.App.addEventListener('app:category_detailCreateGridListing', category_detailCreateGridListing);

/** EventListner for after API.loadAdsByCategory success**/
Ti.App.addEventListener('app:adsUpdated', adsUpdated);

Ti.App.addEventListener('app:loadingViewFinish', loadingViewFinish);
/** EventListner for after API.bannerListing success**/
Ti.App.addEventListener('app:bannerListing', bannerListing);

/** EventListner for after API.loadCategory success**/
Ti.App.addEventListener('app:loadCategory', loadCategory);

$.indexView.favorite.addEventListener('click', function(e){
	var win = Alloy.createController("favourite", {cate_id: 7}).getView();  
	COMMON.openWindow(win);
});

$.indexView.home.addEventListener('click', function(e){
	var dialog = Ti.UI.createOptionDialog({
	  cancel: 2,
	  options: ['Recent', 'Popular', 'Cancel'],
	  selectedIndex: 2,
	  title: 'View All'
	});
	
	dialog.show();
	
	dialog.addEventListener("click", function(e){
		if(e.index != 2){
			var win = Alloy.createController("home_all", {action_type: e.index}).getView();  
			COMMON.openWindow(win);
		}
	});
});

/** Android Click to refresh **/
if(Ti.Platform.osname == "android"){
	// trigger if user click back
	$.indexView.root.addEventListener('android:back', function (e) {
		var dialog = Ti.UI.createAlertDialog({
			    cancel: 1,
			    buttonNames: ['Cancel','Confirm'],
			    message: 'Would you like to exit SalesAd?',
			    title: 'Exit app'
		});
		dialog.addEventListener('click', function(e){
			 	if(e.button === false){
			  		return e.button;
			  	}
		    	if (e.index === e.source.cancel){
			      //Do nothing
			    }
			    if (e.index === 1){ 
			    	var activity = Titanium.Android.currentActivity;
					activity.finish();
			    }
		});
		dialog.show(); 
	});
}else{
	$.indexView.salesad_logo.addEventListener('click', function(e){
		buildCateogryList();
	});
}

/** close all login eventListener when close the page**/
$.indexView.root.addEventListener("close", function(){ 
	Ti.App.removeEventListener('app:triggerAdsType', updateCategoryList);
	Ti.App.removeEventListener('app:goToAds', goToAds);
	Ti.App.removeEventListener('app:category_detailCreateGridListing', category_detailCreateGridListing);
	Ti.App.removeEventListener('app:adsUpdated', adsUpdated);
	Ti.App.removeEventListener('app:loadingViewFinish', loadingViewFinish);
	Ti.App.removeEventListener('app:bannerListing', bannerListing);
	Ti.App.removeEventListener('app:loadCategory', loadCategory);
    $.indexView.destroy();
});