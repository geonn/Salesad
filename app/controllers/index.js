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
Alloy.Globals.tracker.trackScreen("Home");
Alloy.Globals.navMenu = $.navMenu;

/*********************
*******FUNCTION*******
**********************/
function buildCateogryList(){
	while($.adListing.children.length>0){
	    $.adListing.remove($.adListing.children[0]);
	};
	var model_category = Alloy.createCollection('category'); 
	var category_list = model_category.getCategoryList();
	category_sync_counter = category_list.length;
	for (var i=0; i< category_list.length; i++) {
		var cell = $.UI.create('View', {classes: ["cell"], id: category_list[i].id});
		var pad_cell = $.UI.create('View', {top: 4, right:4, width: Ti.UI.FILL, height:Ti.UI.SIZE}); 
		var temp_image = $.UI.create('ImageView',{
			image: "/images/warm-grey-bg.png",
			height: "auto",
			width: Ti.UI.FILL,                           
		});
		
		var pad_categoryLabel = $.UI.create('View', {top:0, width: Ti.UI.FILL, height:Ti.UI.SIZE, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10}); 
		var categoryLabel = Ti.UI.createLabel({
			text: category_list[i].categoryName,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			top: 0,
			zIndex: 10,
			color: "#ffffff",
			top: 4, right:4, left:4, bottom:4,
		});
		
		var style = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
		var activityIndicator = Ti.UI.createActivityIndicator({
		  color: 'green',
		  style:style,
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
		$.adListing.add(cell);
		
		syncCategory(category_list[i].id);
		
		//var latestc = c_ads_library.getLatestAdsByCategory(category_list[i].id);
	}
}

function loadLatestImageByCategoryId(cell, activityIndicator, cate_id){
	var c_ads_library = Alloy.createCollection('categoryAds'); 
	var latestc = c_ads_library.getLatestAdsByCategory(cate_id);
	if(typeof latestc[0] == 'object' && latestc[0].a_id != 0 && typeof latestc[0].a_id != 'object'){
		var adImage = Ti.UI.createImageView({
   			defaultImage: "/images/warm-grey-bg.png",
			image: latestc[0].img_path,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE
		});
   		createAdImageEvent(adImage, latestc[0].m_id);
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
	$.navMenu.openWindow(win,{animated:true}); 
};

var bannerListing = function(res){
	var banner_model = Alloy.createCollection('banners'); 
 	var banners = banner_model.getBannerList();
 	 
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
				height: bannerHeight,
				defaultImage: "/images/warm-grey-bg.png",
			});
			var style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
			var activityIndicator = Ti.UI.createActivityIndicator({
			  color: 'green',
			  style:style,
			  top:10,
			  left:10,
			  height:Ti.UI.SIZE,
			  width:Ti.UI.SIZE,
			  zIndex: 11,
			});
			activityIndicator.show();
			adIamgeLoadEvent(adImage, activityIndicator);
			var scrollView = Ti.UI.createScrollView({
				top:"0",
				contentWidth: 'auto',
			  	contentHeight: 'auto',
			   	height:bannerHeight,
			  	width: '100%' 
			});
			
			row = $.UI.create('View', {classes: ["row"],layout:"", height:bannerHeight});
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

//dynamic addEventListener for adImage
function createAdImageEvent(adImage, m_id, inicator) {
    adImage.addEventListener('click', function(e) {
        goAd(m_id);
    });
}

function adIamgeLoadEvent(adImage, activityIndicator){
	adImage.addEventListener('load', function(e) {
		activityIndicator.hide();
		if(!category_sync_counter){
			$.scrollview.setDisableBounce(false);
      		$.scrollview.animate({top:0, duration: 500});
		}
	});
}

/************************
*******APP RUNNING*******
*************************/
$.navMenu.open({fullscreen:true});
var API = require('api');
API.bannerListing();
API.loadCategory();

/**Load local function**/
bannerListing();
buildCateogryList();

/**Call API to update app's data**/

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

Ti.App.addEventListener('app:category_detailCreateGridListing', function(e){
	API.loadAdsByCategory(e.cate_id);
	Ti.App.fireEvent('app:adsUpdated', {cate_id: e.cate_id});
});

Ti.App.addEventListener('app:adsUpdated', function(e){
	for (var c = $.adListing.children.length - 1; c >= 0; c--) {
		if($.adListing.children[c].id == e.cate_id){
			var activityIndicator = $.adListing.children[c].children[0].children[2];
			var cell = $.adListing.children[c].children[0];
			loadLatestImageByCategoryId(cell, activityIndicator, e.cate_id);
		}	
    }
});

$.scrollview.addEventListener('scroll', function (e) {
    //Ti.API.info('scroll', JSON.stringify(e));
    if (e.y <= -50 && !category_sync_counter) {
       category_sync_counter = $.adListing.children.length;
       $.scrollview.setDisableBounce(true);
       $.scrollview.setTop(30);
       console.log('Pulled', JSON.stringify(e));
       buildCateogryList();
    }
});
/** close all login eventListener when close the page**/
$.root.addEventListener("close", function(){
    $.destroy();
});
