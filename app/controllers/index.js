var args = {};
var clickTime = null;
var u_id = Ti.App.Properties.getString('u_id') || "";
var category_sync_counter = 0;

/** Global Variable **/ 
Alloy.Globals.tracker.trackEvent({
	category: "main",
	action: "view",
	label: "home",
	value: 1
});
Alloy.Globals.tracker.trackScreen({
    screenName: "Home"
});
Alloy.Globals.navMenu = $.navMenu;
 
/*********************
*******FUNCTION*******
**********************/
function buildCateogryList(){
	while($.indexView.adListing.children.length>0){
	    $.indexView.adListing.remove($.indexView.adListing.children[0]);
	};
	var model_category = Alloy.createCollection('category'); 
	var category_list = model_category.getCategoryList();
	category_sync_counter = category_list.length;
	for (var i=0; i< category_list.length; i++) {
		var cell = $.indexView.UI.create('View', {classes: ["cell"], id: category_list[i].id});
		var pad_cell = $.indexView.UI.create('View', {top: 4, right:4, width: Ti.UI.FILL, height:Ti.UI.SIZE}); 
		var temp_image = $.indexView.UI.create('ImageView',{
			image: "/images/warm-grey-bg.png",
			height: "auto",
			width: Ti.UI.FILL,                           
		});
		
		var pad_categoryLabel = $.indexView.UI.create('View', {top:0, width: Ti.UI.FILL, height:Ti.UI.SIZE, backgroundColor: '#000000',opacity:0.5,  zIndex: 10}); 
		var categoryLabel = Ti.UI.createLabel({
			text: category_list[i].categoryName,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			top: 0,
			zIndex: 10,
			color: "#ffffff",
			top: 4, right:4, left:4, bottom:4,
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
			activityIndicator.style = Ti.UI.iPhone.ActivityIndicatorStyle.LIGHT;
		}
		activityIndicator.show();
		pad_categoryLabel.add(categoryLabel);
		pad_cell.add(temp_image);
		pad_cell.add(pad_categoryLabel);
		pad_cell.add(activityIndicator);
		cell.add(pad_cell);
		$.indexView.adListing.add(cell);
		
		syncCategory(category_list[i].id);
		
		//var latestc = c_ads_library.getLatestAdsByCategory(category_list[i].id);
	}
}

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
   	category_sync_counter--;
}

function syncCategory(cate_id){
	var API = require('api');
	API.loadMerchantListByCategory(cate_id);
}

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

var goAds = function(m_id, a_id,cate_id){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	
	var win = Alloy.createController("ads", {m_id:m_id, a_id: a_id, cate_id: cate_id}).getView(); 
	COMMON.openWindow(win); 
};

var bannerListing = function(){
	
	var banner_model = Alloy.createCollection('banners'); 
 	var banners = banner_model.getBannerList(); 
	var the_view = [];
   	var counter = 0;
	var imagepath, adImage, row = '';
	var my_page = 0;
	 
	var bannerHeight = $.indexView.bannerListing.rect.height; 
	
	for (var i=0; i< banners.length; i++) { 
		adImage = Ti.UI.createImageView({
				image: banners[i].img,
				source: banners[i].m_id,
				width:"100%",
				height: bannerHeight,
				defaultImage: "/images/warm-grey-bg.png",
			});
			 
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
				activityIndicator.style = Ti.UI.iPhone.ActivityIndicatorStyle.LIGHT;
			}
			activityIndicator.show();
			adIamgeLoadEvent(adImage, activityIndicator);
			var scrollView = Ti.UI.createScrollView({
				top:"0",
				scrollType: "horizontal",
				contentWidth: 'auto',
			  	contentHeight: 'auto',
			   	height:bannerHeight,
			  	width: '100%' 
			});
			
			row = $.indexView.UI.create('View', {classes: ["row"],layout:"", height:bannerHeight});
			row.add(activityIndicator);
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

//dynamic addEventListener for adImage
function createAdImageEvent(adImage,m_id, a_id, cate_id) {
    adImage.addEventListener('click', function(e) {
        goAds(m_id, a_id, cate_id);
    });
}

function adIamgeLoadEvent(adImage, activityIndicator){
	adImage.addEventListener('load', function(e) {
		activityIndicator.hide();
		if(!category_sync_counter){
			if(Ti.Platform.osname != "android"){
				$.indexView.scrollview.setDisableBounce(false);
			}
      		$.indexView.scrollview.animate({top:0, duration: 500});
		}
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
API.bannerListing();
API.loadCategory();

/**Call API to update app's data**/

/*********************
*** Event Listener ***
**********************/
$.indexView.category_link.addEventListener('click', function(e){
	var win = Alloy.createController("category").getView();  
	COMMON.openWindow(win);  
});

$.indexView.arrow_link.addEventListener('click', function(e){
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

Ti.App.addEventListener('app:category_detailCreateGridListing', function(e){
	
	API.loadAdsByCategory(e.cate_id);
});

Ti.App.addEventListener('app:adsUpdated', function(e){
	
	for (var c = $.indexView.adListing.children.length - 1; c >= 0; c--) {
		if($.indexView.adListing.children[c].id == e.cate_id){
			var activityIndicator = $.indexView.adListing.children[c].children[0].children[2];
			var cell = $.indexView.adListing.children[c].children[0];
			loadLatestImageByCategoryId(cell, activityIndicator, e.cate_id);
		}
    }
});

Ti.App.addEventListener('app:bannerListing', bannerListing);

Ti.App.addEventListener('app:loadCategory', function(e){
	buildCateogryList();
});

$.indexView.scrollview.addEventListener('scroll', function (e) {
    //Ti.API.info('scroll', JSON.stringify(e));
    if (e.y <= -50 && !category_sync_counter) {
       category_sync_counter = $.indexView.adListing.children.length;
       if(Ti.Platform.osname != "android"){
       	$.indexView.scrollview.setDisableBounce(true);
       }
       $.indexView.scrollview.setTop(30);
       console.log('Pulled', JSON.stringify(e));
       buildCateogryList();
    }
});

/** close all login eventListener when close the page**/
$.indexView.root.addEventListener("close", function(){
    $.indexView.destroy();
});
