var args = arguments[0] || {};
var a_id = args.a_id || "";
var m_id = args.m_id || "";
var ads;
var from = args.from || "";
var isFeed = args.isFeed || "";
var isScan = "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;
var isAdsAvailable  = false; 
var u_id = Ti.App.Properties.getString('u_id') || "";
var items;

Alloy.Globals.naviPath.push($.win);
var BARCODE = require('barcode');

//load model
var m_library = Alloy.createCollection('merchants'); 
var a_library = Alloy.createCollection('ads'); 
var i_library = Alloy.createCollection('items');
var loading = Alloy.createController("loading");

function getAdData(){
	ads = a_library.getAdsById(a_id);
}

function getItemData(){
	items = i_library.getItemByAds(ads.a_id);
}

/** google analytics**/
var lib_feeds = Alloy.createCollection('feeds');
if(isFeed == 1){ 
	lib_feeds.updateUserFeeds(m_id,a_id);		
}

function getScanMerchant(){
	var expire = Ti.App.Properties.getString('sales'+ads.m_id);
	var currentDate = new Date();
	console.log(expire);
	console.log(typeof expire);
	if(expire != null && currentDate > expire){
		isScan = 1;
	}else{
		isScan = 0;
	}
	console.log('sales'+ads.m_id);
	console.log(isScan+" why got value one");
	Ti.App.removeEventListener('getScanMerchant', getScanMerchant);	
}

function checkFavorite(){
	var model_favorites = Alloy.createCollection('favorites');
	console.log(m_id+" m_id");
	var exist = model_favorites.checkFavoriteExist(m_id);
	 //console.log("m_id : "+m_id);
	var fav_img = (exist)?"/images/SalesAd_Favorited.png":"/images/SalesAd_Favorite.png";
	$.favorites.image = fav_img;
}

function render_banner(){
	/***Set ads template***/
 	var ads_height = "100%";
 	if(ads.template_id == "1"){
 		ads_height = "33%";
 	}
 	if(ads.template_id == "2"){
 		ads_height = "66%";
 	}
 	
 	/***Add ads banner***/
 	var bannerImage = Ti.UI.createImageView({
 		defaultImage: "/images/warm-grey-bg.png",
		image :ads.img_path,
		width : "100%",
		height: Ti.UI.SIZE,//ads_height,
	});
	
	var app_background = (ads.app_background !== undefined)?"#"+ads.app_background:"#fffff6";
	$.win.backgroundColor = app_background;
	console.log(bannerImage);
	$.banner.add(bannerImage);
}

var getAdDetails = function(){
	var counter = 0;
	var imagepath, adImage, row, cell = '';
	  
	var last = items.length-1;
	var pwidth = Titanium.Platform.displayCaps.platformWidth;
	if(OS_ANDROID){
		var cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 2;
	}else{
		var cell_width = Math.floor(pwidth / 2) - 2;
	}
	console.log(items.length+" how many items");
	if(items.length > 0 ){
		for (var i=0; i< items.length; i++) {
			if(counter%2 == 0){
				row = $.UI.create('View', {classes: ["rowAd"],});
			}
			cell = $.UI.create('View', {classes: ["cellAd"], width: cell_width});
			
			imagepath = items[i].img_path;
			
			var itemImageView = Ti.UI.createView({
				height: Ti.UI.SIZE,
				width: Ti.UI.SIZE
			});
			adImage = Ti.UI.createImageView({
				defaultImage: "/images/warm-grey-bg.png",
				image: imagepath,
				left: 4,
				width: Ti.UI.FILL,
				height: "auto",
			});
			itemImageView.add(adImage);
			
			//itemImageView.add(BARCODE.generateBarcode("686068606860")); 
			
			createAdImageEvent(itemImageView,ads.a_id,counter,ads.name, items[i].description, items[i].isExclusive);
			
			cell.add(itemImageView);
			row.add(cell);
			
			if(counter%2 == 1 || last == counter){
				$.ads_details.add(row);
			}
			counter++;
		} 
		
		isAdsAvailable = true;
	}else{
		var noAvailableLabel = $.UI.create("Label", { 
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
		$.ads_details.add(default_image);
	}

	var custom = $.UI.create("Label", { 
		    text: pageTitle, 
		    font: { fontWeight: 'bold'},
		    color: '#ED1C24' 
	});
	
	//var ads_title = textCounter(pageTitle , 14);
	if(Ti.Platform.osname == "android"){ 
		$.pageTitle.add(custom);   
	}else{
		$.win.titleControl = custom;
	} 
	
	loading.finish();
};

function init(){
	$.win.add(loading.getView());
	getAdData();
	var merchant = m_library.getMerchantsById(ads.m_id);
	
	m_id = (merchant.parent != 0 && merchant.parent != null)?merchant.parent:ads.m_id;
	
	getScanMerchant();
	checkFavorite();
	refresh();
	pageTitle = ads.name;	// set Page Title
}

init();

//dynamic addEventListener for adImage
function createAdImageEvent(adImage,a_id,position, title, description, isExclusive) {
    adImage.addEventListener('click', function(e) {
    	// double click prevention
	    var currentTime = new Date();
	    if (currentTime - clickTime < 1000) {
	        return;
	    };
	    clickTime = currentTime;
	    var page = Alloy.createController("itemDetails",{a_id:a_id,position:position, title:title, isExclusive: isExclusive, isScan: isScan, description: description}).getView(); 
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

/*********************
*** Event Listener ***
**********************/

//Add your favorite event
$.favorites.addEventListener("click", function(){ 
	var model_favorites = Alloy.createCollection('favorites');
	var exist = model_favorites.checkFavoriteExist(m_id);
 
	if(exist){
		var message = "Are you sure want to remove from favorite";
		var dialog = Ti.UI.createAlertDialog({
		    cancel: 1,
		    buttonNames: ['Cancel','Confirm'],
		    message: message,
		    title: 'Remove from favorite'
		  });
		  dialog.addEventListener('click', function(ex){
		  	if (ex.index == 1){
		     	var model_favorites = Alloy.createCollection('favorites');
				model_favorites.deleteFavorite(exist); 
				$.favorites.image = "/images/SalesAd_Favorite.png";
				//$.favorites.visible = false;
				
				API.updateUserFavourite({
					m_id   : m_id,
					a_id     : a_id,
					u_id	 : u_id,
					status : 2
				});
				Ti.App.fireEvent("app:refreshAdsListing");
				return;
		  	}
		 });
		 dialog.show();
	}else{
		var favorite = Alloy.createModel('favorites', {
			    m_id   : m_id,
			    u_id	 : u_id,
			    position : 0
			});
		favorite.save();
		$.favorites.image = "/images/SalesAd_Favorited.png";
		//$.favorites.visible = false;
		
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

function refresh(e){
	loading.start();
	API.callByPost({url: "getItemList", params:{a_id: a_id}}, {onload: function(responseText){
		var model = Alloy.createCollection("items");
		var res = JSON.parse(responseText);
		var arr = res.data || null;
		model.saveArray(arr);
		getItemData();
		render_banner();
		getAdDetails();
		loading.finish();
	}});
}

function closeWindow(){
	COMMON.closeWindow($.win); 
}

$.btnBack.addEventListener('click', closeWindow); 

$.win.addEventListener("close", function(){
	Ti.App.fireEvent('removeNav');
	Ti.App.removeEventListener('app:loadAdsDetails', refresh);
	Ti.App.removeEventListener('getScanMerchant', getScanMerchant);
    $.destroy();
});


Ti.App.addEventListener('app:loadAdsDetails', refresh);
Ti.App.addEventListener('getScanMerchant', getScanMerchant);	

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
	        	//text: ads.description + ". Download SalesAd : http://apple.co/1RtrCZ4",
	        	text: ads.name + ". For more detail : http://salesad.my/main/adsDetails/"+args.a_id,
	        	//url: "http://apple.co/1RtrCZ4",",
	        
	        	image: ads.img_path
	     	});
	     } else {
	     	//implement fallback sharing..
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

$.home.addEventListener("click", function(e){
	var naviPath = Alloy.Globals.naviPath;
	if(naviPath == ""){
		
		closeWindow();
	}else{
		
		for (var i=0; i< naviPath.length; i++) { 
			COMMON.closeWindow(naviPath[i]);  
		} 
	}
});
    
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}    

function createShareOptions(){
 
    var subject = pageTitle;
    var text = ads.name + ". For more detail : http://salesad.my/main/adsDetails/"+args.a_id;
   // var text = ads.description + ". Download SalesAd : http://apple.co/1RtrCZ4";
  
    var intent = Ti.Android.createIntent({
        action: Ti.Android.ACTION_SEND,
        type: "text/plain",
    });
    intent.putExtra(Ti.Android.EXTRA_TEXT,text);
    intent.putExtra(Ti.Android.EXTRA_SUBJECT,subject);
 	intent.putExtraUri(Ti.Android.EXTRA_STREAM, ads.img_path);
    var share = Ti.Android.createIntentChooser(intent,'Share');
 
    return share;
}

var SCANNER = require("scanner");

// Create a window to add the picker to and display it. 
var window = SCANNER.createScannerWindow();

$.scanner.addEventListener('click', QrScan);
	 
SCANNER.init(window); 
//$.scanner.add(button);
function QrScan(){
	SCANNER.openScanner("1");
}
