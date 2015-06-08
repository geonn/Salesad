var args = {};
var clickTime = null;
var u_id = Ti.App.Properties.getString('u_id') || "";
/** add new column for ads **/
var ads = Alloy.createCollection('ads'); 
ads.addColumn("status", "INTEGER");
ads.addColumn("active_date", "TEXT");
ads.addColumn("expired_date", "TEXT");
ads.addColumn("created", "TEXT");
ads.addColumn("updated", "TEXT");
/** Google Analytic**/ 
Alloy.Globals.tracker.trackEvent({
	category: "main",
	action: "view",
	label: "home",
	value: 1
});
Alloy.Globals.tracker.trackScreen({
    screenName: "Home"
});

//Global Variable Set Navigation Menu
Alloy.Globals.navMenu = $.navMenu;
 
/*********************
*******FUNCTION*******
**********************/

/** create banner slideshow**/
var bannerListing = function(){
	
	var banner_model = Alloy.createCollection('banners'); 
 	var banners = banner_model.getBannerList(); 
 	if(!banners.length){
	 	API.bannerListing();
	 	return;
 	}
	var the_view = [];
   	var counter = 0;
	var imagepath, adImage, row = '';
	var my_page = 0;
	 
	//var bannerHeight = $.indexView.bannerListing.rect.height;
	for (var i=0; i< banners.length; i++) {
			adImage = Ti.UI.createImageView({
				image: banners[i].img,
				source: banners[i].m_id,
				width: Ti.UI.FILL,
				height: Ti.UI.FILL,
				defaultImage: "/images/warm-grey-bg.png",
			});
			var curActivity = '';
			if(Ti.Platform.osname == "android"){
				curActivity = Titanium.Android.currentActivity;
			}
			if (curActivity != null || Ti.Platform.name === 'iPhone OS') { 
				var activityIndicator = Ti.UI.createActivityIndicator({
				  color: 'green', 
				  top:10,
				  left:10,
				  height:Ti.UI.SIZE,
				  width:Ti.UI.SIZE,
				  zIndex: 11,
				});
			
			if(Ti.Platform.osname == "android"){
				activityIndicator.style = Ti.UI.ActivityIndicatorStyle.DARK;
				//mainView.activityIndicator.top = 0; 
			}else if (Ti.Platform.name === 'iPhone OS'){
				activityIndicator.style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
			}
			activityIndicator.show();
			}
			bannerAdIamgeLoadEvent(adImage, activityIndicator);
			var scrollView = Ti.UI.createScrollView({
				top:"0",
				scrollType: "horizontal",
				contentWidth: 'auto',
			  	contentHeight: 'auto',
			   	backgroundImage: "/images/warm-grey-bg.png",
			  	width: Ti.UI.FILL,
			  	height: Ti.UI.FILL 
			});
			
			row = $.indexView.UI.create('View', {classes: ["row"],layout:"", height: Ti.UI.FILL});
			//row.add(activityIndicator);
			row.add(adImage);
			//row.add(img_caption);
			row.addEventListener('touchend', function(e) {
			 	goAd(e.source.source);
			});
			
			//scrollView.add(row);
			the_view.push(row); 
			counter++;			
	}

	var scrollableView = Ti.UI.createScrollableView({
			id: "scrollableView",
			views:the_view,
			showPagingControl:true,
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
function buildCateogryList(){
	while($.indexView.adListing.children.length>0){
	    $.indexView.adListing.remove($.indexView.adListing.children[0]);
	};
	var model_category = Alloy.createCollection('category'); 
	var category_list = model_category.getCategoryList();
	if(!category_list.length){
		API.loadCategory();
		return;
	}
	
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
		if(Ti.Platform.osname == "android"){
			activityIndicator.style = Ti.UI.ActivityIndicatorStyle.DARK; 
		}else if (Ti.Platform.name === 'iPhone OS'){
			activityIndicator.style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
		}
		activityIndicator.show();
		
		pad_categoryLabel.add(categoryLabel);
		pad_cell.add(temp_image);
		pad_cell.add(pad_categoryLabel);
		pad_cell.add(activityIndicator);
		cell.add(pad_cell);
		$.indexView.adListing.add(cell);
		loadLatestImageByCategoryId(pad_cell, activityIndicator, category_list[i].id);
		//syncCategory(category_list[i].id);
	}
}

function syncCategory(){
	var model_category = Alloy.createCollection('category'); 
	var category_list = model_category.getCategoryList();
	
	for (var i=0; i< category_list.length; i++) {
		var API = require('api');
		API.loadMerchantListByCategory(category_list[i].id);
	}
}

/** Load Latest Ads by Category **/
function loadLatestImageByCategoryId(cell, activityIndicator, cate_id){
	var c_ads_library = Alloy.createCollection('categoryAds');
	var latestc = c_ads_library.getLatestAdsByCategory(cate_id, 1);
	if(typeof latestc[0] == 'object' && latestc[0].a_id != 0 && typeof latestc[0].a_id != 'object'){

		var adImage = Ti.UI.createImageView({
   			defaultImage: "/images/warm-grey-bg.png",
			image: latestc[0].img_path,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE
		});
   		createAdImageEvent(adImage, latestc[0].m_id, latestc[0].a_id, cate_id);
   		adIamgeLoadEvent(adImage, activityIndicator);
   		cell.add(adImage);
   	}
}

/** navigate to Ad **/
var goAd = function(m_id,b_id,isFeed){
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
var goAds = function(m_id, a_id,cate_id){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	
	var win = Alloy.createController("ads_category", {m_id:m_id, a_id: a_id, cate_id: cate_id}).getView(); 
	COMMON.openWindow(win); 
};

/** Bind GoAds Event to Image **/
function createAdImageEvent(adImage,m_id, a_id, cate_id) {
    adImage.addEventListener('click', function(e) {
        goAds(m_id, a_id, cate_id);
    });
}

/** Bind Indicator to Banner Image **/
function bannerAdIamgeLoadEvent(adImage, activityIndicator){
	adImage.addEventListener('load', function(e) {
		activityIndicator.hide();
	});
}

/** Bind Indicator to Ad Image **/
function adIamgeLoadEvent(adImage, activityIndicator){
	adImage.addEventListener('load', function(e) {
		activityIndicator.hide();
	});
}

/************************
*******APP RUNNING*******
*************************/

if(Ti.Platform.osname == "android"){ 
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

bannerListing();
//API.bannerListing();

/** 
 * New Category Flow 
 * 
 * > index.js buildCateogryList() 
 * > index.js loadLatestImageByCategoryId();
 * > index.js categorAds.getLatestAdsByCategory(cate_id, 1);
 * 
 * Grab Category data from server 
 * index.js API.loadCategory() > api.js fireEvent('app:loadCategory')  // sync category from server
 * index.js syncCategory() 
 * index.js API.loadMerchantListByCategory(cate_id) > api.js fireEvent('app:category_detailCreateGridListing') // sync merchant from server
 * index.js API.loadAdsByCategory(e.cate_id); > api.js fireEvent('app:adsUpdated', {cate_id: cate_id}); // sync ads from server
 **/

buildCateogryList();
API.loadCategory();
/*********************
*** Event Listener ***
**********************/

/** navigate to category page **/
$.indexView.category_link.addEventListener('click', function(e){
	var win = Alloy.createController("category").getView();  
	COMMON.openWindow(win);  
});

/** EventListerner for notification **/
Ti.App.addEventListener('app:goToAds', function(e){
	goAd(e.m_id,e.a_id,e.isFeed);
});

/** EventListner for after API.loadMerchantListByCategory success**/
Ti.App.addEventListener('app:category_detailCreateGridListing', function(e){
	API.loadAdsByCategory(e.cate_id);
});

/** EventListner for after API.loadAdsByCategory success**/
Ti.App.addEventListener('app:adsUpdated', function(e){
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
});

/** EventListner for after API.bannerListing success**/
Ti.App.addEventListener('app:bannerListing', bannerListing);

/** EventListner for after API.loadCategory success**/
Ti.App.addEventListener('app:loadCategory', function(e){
	//buildCateogryList();
	syncCategory();
});

/** Android Click to refresh **/
if(Ti.Platform.osname == "android"){
	$.indexView.arrow_link.addEventListener('click', function(e){
		//Create the transformation
		var imgTransform = Ti.UI.create2DMatrix().rotate(0, 360);
				
		var myAnimation = Ti.UI.createAnimation({
		   transform   :   imgTransform,      //Transform property to change during animation
		   duration     :  3000,         //Duration for the animation in millisecond
		   repeat: 0
		});

		$.indexView.arrow_link.animate(myAnimation); 
		
		//buildCateogryList();
		API.loadCategory();
	});
	
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
		//buildCateogryList();
		API.loadCategory();
	});
}

/** close all login eventListener when close the page**/
$.indexView.root.addEventListener("close", function(){
    $.indexView.destroy();
});
