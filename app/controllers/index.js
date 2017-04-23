var args = {};
var clickTime = null;
var u_id = Ti.App.Properties.getString('u_id') || "";

var loadingView = Alloy.createController("loader");
loadingView.getView().open();
loadingView.start();

var model_category = Alloy.createCollection('category');

Alloy.Globals.navMenu = $.navMenu;
 
/*********************
*******FUNCTION*******
**********************/

/** create banner slideshow**/
var bannerListing = function(){
	
	var ads_model = Alloy.createCollection('ads'); 
 	var banners = ads_model.getBannerList();
	var the_view = [];
   	var counter = 0;
	var imagepath, adImage, row = '';
	var my_page = 0;
	var pwidth = Titanium.Platform.displayCaps.platformWidth;
	if(OS_ANDROID){
		var cell_width = pixelToDp(pwidth);
	}else{
		var cell_width = pwidth;
	}
	for (var i=0; i< banners.length; i++) {
		adImage = Ti.UI.createImageView({
			image: banners[i].img_path,
			a_id: banners[i].a_id,
			width: cell_width,
			height: cell_width,
			defaultImage: "/images/warm-grey-bg.png",
		});

		row = $.indexView.UI.create('View', {
			classes: ["row"],layout:"", 
			height: cell_width, 
			backgroundImage: "/images/warm-grey-bg.png",
			width: cell_width,
		});
		
		row.add(adImage);
		the_view.push(row); 
		counter++;			
	}
	
	var scrollableView = Ti.UI.createScrollableView({
			id: "scrollableView",
			views:the_view,
			height: cell_width, 
			showPagingControl:false,
		});
		
		scrollableView.addEventListener('click', function(e) { 
			goAd(e.source.a_id);			// tomorrow kill you.
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
	$.indexView.adListing.removeAllChildren();
	var pwidth = Titanium.Platform.displayCaps.platformWidth;
	
	if(OS_ANDROID){
		var cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 2;
	}else{
		var cell_width = Math.floor(pwidth / 2) - 2;
	}
	
	var category_list = model_category.getCategoryList();
	
	var contest = {categoryName: "Contest", id: 0};
	category_list.push(contest);
	for (var i=0; i< category_list.length; i++) {
		
		var cell = $.indexView.UI.create('View', {classes:['hsize'], width: cell_width, id: category_list[i].id});
		var pad_cell = $.indexView.UI.create('View', {top: 4, right:4, width: Ti.UI.FILL, height:Ti.UI.SIZE}); 
		var temp_image = $.indexView.UI.create('ImageView',{
			image: "/images/warm-grey-bg.png",
			height: "auto",
			width: Ti.UI.FILL,                           
		});
		
		var pad_categoryLabel = $.indexView.UI.create('View', {top:0, width: Ti.UI.FILL, height:Ti.UI.SIZE, backgroundImage:  "/images/transparent-bg.png", zIndex: 10});
		var categoryLabel = $.UI.create("Label", {
			classes:['bold'],
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
		
		pad_categoryLabel.add(categoryLabel);
		pad_cell.add(temp_image);
		pad_cell.add(pad_categoryLabel);
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
			loadLatestImageByCategoryId(pad_cell, category_list[i].id, e.types);
		}else{
			loadLatestImageByCategoryId(pad_cell, category_list[i].id);
		}
	}
}

/** Load Latest Ads by Category **/
function loadLatestImageByCategoryId(cell, cate_id, types){
	var c_ads_library = Alloy.createCollection('categoryAds');
	 
	if(types == "popular"){
		var latestc = c_ads_library.getPopularAdsByCategory(cate_id, 1);
	}else{
		var latestc = c_ads_library.getLatestAdsByCategory(cate_id, 0, 1);
	}
	console.log(latestc.length+" latestc");
	if(latestc.length > 0){
		var adImage = Ti.UI.createImageView({
   			defaultImage: "/images/warm-grey-bg.png",
			image: latestc[0].img_path,
			cate_id: cate_id,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE
		});
		adImage.addEventListener("click", goAds);
   		cell.add(adImage);
   	}else{
   		var adImage = Ti.UI.createImageView({
   			image: "/images/ComingSoon_2.png",
			cate_id: cate_id,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE
		});
   		cell.add(adImage);
   	}
}

/** navigate to Ad **/
var goAd = function(a_id, isFeed){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	    
	var win = Alloy.createController("ad", {a_id: a_id, from : "home", isFeed: isFeed}).getView(); 
	COMMON.openWindow(win);
};

/** navigate to Ads **/
function goAds(e){
	var cate_id = parent({name: "cate_id"}, e.source);
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

function loadingViewFinish(){
	loadingView.finish(function(){
		if(OS_IOS){
			$.navMenu.open({fullscreen:true});
			loadingView.getView().close();
		}else{
			$.indexView.root.open();
		} 
		init();
		//loadingView = null;
	});
}

function init(){
	
	bannerListing();
	buildCateogryList();
	var url = "";
	
	if(OS_IOS){
		cmd = Ti.App.getArguments();
		url = cmd.url;
	}else{
		if(global_url != null && global_url!=""){
			url = global_url;
		}
	}
	if ( url != "" && typeof(url)!="undefined") {
        var details = url;
        var arg = details.split("://"); 
        var ads = arg[1].split("?");
       
        var win = Alloy.createController( ads[0] , {a_id:  ads[1], from : "home"}).getView(); 
		COMMON.openWindow(win); 
        Ti.API.info( 'Resumed with url = ' + Ti.App.launchURL );
	     Ti.App.Properties.setString('global_url', "");
	}
}

// convert pixel to dp.
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

/*********************
*** Event Listener ***
**********************/

$.indexView.more.addEventListener("click", function(e){
	var win = Alloy.createController("more").getView();  
	COMMON.openWindow(win);
});

$.indexView.nearby.addEventListener("click", function(e){
	
	var win = Alloy.createController("nearby").getView();  
	if (Ti.Geolocation.locationServicesEnabled) {
		COMMON.openWindow(win);	
	}			
	else{
	    Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
			if(e.success){
				COMMON.openWindow(win);						
			}
			else{
	        	alert("You denied permission.");
			}
	  	});			
	}	
});

function goToAds(e){
	goAd(e.m_id, e.isFeed);
}

/** EventListerner for notification **/
Ti.App.addEventListener('app:goToAds', goToAds);

Ti.App.addEventListener('app:loadingViewFinish', loadingViewFinish);

$.indexView.favorite.addEventListener('click', function(e){
	var win = Alloy.createController("favourite", {cate_id: 7}).getView();  
	COMMON.openWindow(win);
});

$.indexView.home.addEventListener('click', function(e){
	var u_id = Ti.App.Properties.getString('u_id') || "";
	if(u_id == ""){
		var win = Alloy.createController("login").getView(); 
		COMMON.openWindow(win);
		return;
	}
	var win = Alloy.createController("home_all", {action_type: e.index}).getView();  
	COMMON.openWindow(win);
	
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
	Ti.App.removeEventListener('app:goToAds', goToAds);
	Ti.App.removeEventListener('app:loadingViewFinish', loadingViewFinish);
    $.indexView.destroy();
});

var SCANNER = require("scanner");

$.indexView.scanner.addEventListener('click', QrScan);

function QrScan(){
    if(Ti.Media.hasCameraPermissions()){
		SCANNER.openScanner("4");
    }else{
        Ti.Media.requestCameraPermissions(function(e) {
        	if(e.success){
				SCANNER.openScanner("4");				       
	        }
        	else{
        		alert("You denied permission.");
        	}			        
        });	        	
    }	
}
