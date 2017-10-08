var args = {};
var clickTime = null;
var u_id = Ti.App.Properties.getString('u_id') || "";
var loadingView = Alloy.createController("loader");
loadingView.getView().open();
loadingView.start();
PUSH.registerPush();
var model_category = Alloy.createCollection('category');
var pwidth = Titanium.Platform.displayCaps.platformWidth;
var adsClick = [];
Alloy.Globals.navMenu = $.navMenu;
 
/*********************
*******FUNCTION*******
**********************/

/** create banner slideshow**/
function datedescription(from,to) {
	var dateDescription = convertToHumanFormat(from)+" - "+convertToHumanFormat(to);
	if(from == "0000-00-00" && to =="0000-00-00"){
		dateDescription = "Start from now!";
	}else if(from == "0000-00-00" &&to !="0000-00-00"){
		dateDescription = "Until "+convertToHumanFormat(to)+"!";
	}else if(from != "0000-00-00" && to =="0000-00-00"){
		dateDescription = "Start from "+convertToHumanFormat(from)+"!";
	}
	return dateDescription;
}

var bannerListing = function(){
	var ads_model = Alloy.createCollection('ads'); 
 	var banners = ads_model.getBannerList();
 	if(banners.length <=0 ){
 		$.indexView.bannerListing.height = 0;
 	}else {
 		banners = shuffle(banners);
 	}
	var the_view = [];
   	var counter = 0;
	var imagepath, adImage, row = '';
	var my_page = 0;
	if(OS_ANDROID){
		var cell_width = pixelToDp(pwidth);
	}else{
		var cell_width = pwidth;
	}
	for (var i=0; i< banners.length; i++) {
		adImage = Ti.UI.createImageView({
			image: banners[i].img_thumb,
			a_id: banners[i].a_id,
			m_id: banners[i].m_id,
			merchant_name: banners[i].name,
			bet_date: datedescription(banners[i].sales_from,banners[i].sales_to),
			width: cell_width,
			height: cell_width,
			defaultImage: "/images/image_loader_640x640.png",
		});
		row = $.indexView.UI.create('View', {
			classes: ["row"],layout:"", 
			height: cell_width, 
			backgroundImage: "/images/image_loader_640x640.png",
			width: cell_width,
		});
		row.add(adImage);
		the_view.push(row); 
		adsClick.push(banners[i].a_id);
		counter++;
	}
	var scrollableView = Ti.UI.createScrollableView({
		id: "scrollableView",
		views:the_view,
		height: cell_width, 
		showPagingControl:false,
	});
	scrollableView.addEventListener('click', function(e) {
		goAd(e.source.a_id,e.source.m_id,e.source.merchant_name,e.source.bet_date);	
	});
	$.indexView.bannerListing.add(scrollableView);
	scrollableView.addEventListener('scrollend', function(e) {
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
	var params = {
		a_id:adsClick.join(),
		type:1,
		from:"index",
		u_id:u_id
	} ;
	API.callByPost({url:"addAdsClick",new:true,params:params},{onload:function(res){console.log(JSON.stringify(res));},onerror:function(err){}});
	buildCateogryList();
};

/** create category grid **/
function buildCateogryList(e){
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
			image: "/images/image_loader_640x640.png",
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
		   			defaultImage: "/images/image_loader_640x640.png",
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
		   		adImage=null;
	   		}else{
	   			$.indexView.adListing.remove(cell); 
	   		}
	   		contest=null;
	   		contests=null;
		}else if(typeof e != "undefined" && typeof e != "null"){
			loadLatestImageByCategoryId(pad_cell, category_list[i].id, e.types);
		}else{
			loadLatestImageByCategoryId(pad_cell, category_list[i].id);
		}
	}
	if(OS_ANDROID){
		$.indexView.swipeRefresh.opacity =1;		
	}
	$.indexView.myInstance.hide();		
	cell_width=null;
	cell=null;
	pad_cell=null;
	temp_image=null;
 	pad_categoryLabel=null;
 	categoryLabel=null;
 	category_list=null;	
}

function refreshAds(){
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("8");
	API.callByPost({
		url: "getAdsList",
		new: true,
		params: {last_updated: isUpdate.updated}
	},{onload: function(responseText){
		var res = JSON.parse(responseText);
		var arr = res.data || null;
		var model = Alloy.createCollection("ads");
		model.saveArray(arr);
		bannerListing();
		res=null;
		arr=null;
		model=null;
	},onerror: function(err){
		_.isString(err.message) && alert(err.message);
	},onexception: function(){
		COMMON.closeWindow($.win);
	}
	});
	checker=null;
	isUpdate=null; 
}

/** Load Latest Ads by Category **/
function loadLatestImageByCategoryId(cell, cate_id, types){
	var c_ads_library = Alloy.createCollection('categoryAds');
	if(types == "popular"){
		var latestc = c_ads_library.getPopularAdsByCategory(cate_id, 1);
		c_ads_library=null;
	}else{
		var latestc = c_ads_library.getLatestAdsByCategory(cate_id, 0, 1);
		c_ads_library=null;
	}
	if(latestc.length > 0){
		var adImage = Ti.UI.createImageView({
   			defaultImage: "/images/image_loader_640x640.png",
			image: latestc[0].img_thumb,
			cate_id: cate_id,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE
		});
		adImage.addEventListener("click", goAds);
   		cell.add(adImage);
   		adImage=null;
   	}else{
   		var adImage = Ti.UI.createImageView({
   			image: "/images/ComingSoon_2.png",
			cate_id: cate_id,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE
		});
   		cell.add(adImage);
   		adImage=null;
   	}
}

/** navigate to Ad **/
var current_post_id = 0;
function goToAds(e){
	current_post_id = Ti.App.Properties.getString('current_post_id') || 0;
	console.log(e.target+" target");
	if(e.target == "voucher"){
		var win = Alloy.createController("reward").getView();
		COMMON.openWindow(win);
		return;
	}
	if(current_post_id != e.a_id && e.a_id != ""){
		Ti.App.Properties.setString('current_post_id', e.a_id);
		console.log(e.a_id+" "+current_post_id+" e.a_id");
		var dialog = Ti.UI.createAlertDialog({
			cancel: 1,
			buttonNames: ['Cancel','OK'],
			message: 'Got a new Ad. Do you want to read now?',
			title: 'New Notification'
		});
		dialog.addEventListener('click', function(ex){
			if (ex.index === 1){
				goAd(e.a_id, e.m_id);
			}
		});
		dialog.show();
		
	}else{
		
	}
}
//scrollableView click event
var goAd = function(a_id, m_id, name, date, isFeed){
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	var win = Alloy.createController("ad", {a_id: a_id, m_id:m_id,  from: "home", isFeed: isFeed, name:name, date:date}).getView();
	COMMON.openWindow(win);
};

/** navigate to Ads **/
//category ad
function goAds(e){
	var cate_id = parent({name: "cate_id"}, e.source);
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	if(typeof contest_id != "undefined"){
		COMMON.openWindow(Alloy.createController("ads_category", {contest_id: contest_id}).getView());
	}else{
		COMMON.openWindow(Alloy.createController("ads_category", {cate_id: cate_id}).getView()); 
	}
	cate_id=null;
	currentTime=null;
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
	});
}

function init(){
	bannerListing();
	var url = "";
	if(OS_IOS){
		cmd = Ti.App.getArguments();
		url = cmd.url;
	}else{
		if(global_url != null && global_url != ""){
			url = global_url;
		}
	}
	if (url != "" && typeof(url) != "undefined") {
        var details = url;
        var arg = details.split("://"); 
        var ads = arg[1].split("?");
        var win = Alloy.createController(ads[0], {a_id:  ads[1], from : "home"}).getView();
		COMMON.openWindow(win);
        Ti.API.info('Resumed with url = ' + Ti.App.launchURL );
	    Ti.App.Properties.setString('global_url', "");
	}
	setTimeout(function(){
		PUSH.setInApp();
	},2000);
}

// convert pixel to dp.
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

/*********************
*** Event Listener ***
**********************/
//more page
$.indexView.more.addEventListener("click", function(e){
	var win = Alloy.createController("more").getView();  
	COMMON.openWindow(win);
});
//map page
$.indexView.nearby.addEventListener("click", function(e){
	var win = Alloy.createController("nearby").getView();
	if(OS_ANDROID) {
		var hasLocationPermissions = Ti.Geolocation.hasLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS);
	    if (hasLocationPermissions) {
			if (Ti.Geolocation.locationServicesEnabled) {
				COMMON.openWindow(win);
			}else {
				alert("Please open your GPS.");
			}
	    }else {
	    	Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
				if(e.success) {
					if (Ti.Geolocation.locationServicesEnabled) {
						COMMON.openWindow(win);
					}else {
						alert("Please open your GPS.");
					}
				}else {
					alert("You denied permission for now, forever or the dialog did not show at all because it you denied forever before.");
				}
			});
	    }
	}else {
		Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
			if(e.success) {
				if (Ti.Geolocation.locationServicesEnabled) {
					COMMON.openWindow(win);
				}else {
					alert("Please open your GPS.");
				}
			}else {
				alert("You denied permission for now, forever or the dialog did not show at all because it you denied forever before.");
			}
		});
	}
});
//favourite page
$.indexView.favorite.addEventListener('click', function(e){
	var u_id = Ti.App.Properties.getString('u_id') || "";
		if(u_id == ""){
			var win = Alloy.createController("signin_signout").getView(); 
			COMMON.openWindow(win);
		}else{
			var win = Alloy.createController("favourite", {cate_id: 7}).getView();  
			COMMON.openWindow(win);
		}	
});
//xpress page
$.indexView.home.addEventListener('click', function(e){
	var win = Alloy.createController("home_all", {action_type: e.index}).getView();  
	COMMON.openWindow(win);
});

/** EventListerner for notification **/
Ti.App.addEventListener('app:goToAds', goToAds);
Ti.App.addEventListener('app:loadingViewFinish', loadingViewFinish);

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
// var load = false;
// var lastDistance = 0;
// var refreshing = false;

if(OS_ANDROID){
	$.indexView.homescrollview.setOverScrollMode(Titanium.UI.Android.OVER_SCROLL_ALWAYS);
	$.indexView.swipeRefresh.addEventListener('refreshing', function(e) {
		$.indexView.swipeRefresh.opacity =0;				
		$.indexView.myInstance.show('',false);
		$.indexView.adListing.removeAllChildren();	
		$.indexView.bannerListing.removeAllChildren();
		setTimeout(function(){
			refreshAds();			
		},1000);		
		e.source.setRefreshing(false);
	});
}else{
	var control = Ti.UI.createRefreshControl({
    	tintColor:"#00CB85"
	});
	$.indexView.homescrollview.refreshControl = control;
	control.addEventListener('refreshstart',function(e){
	    Ti.API.info('refreshstart');
	    setTimeout(function(e){
	        Ti.API.debug('Timeout');
	        $.indexView.homescrollview.scrollTo(0,0,true);	
			setTimeout(function(){				
				$.indexView.myInstance.show('',false);
				$.indexView.adListing.removeAllChildren();	
				$.indexView.bannerListing.removeAllChildren();
				setTimeout(function(){
					refreshAds();			
				},1000);	
			},500);	        
	        control.endRefreshing();
	    }, 1000);
	});
}

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

function shuffle(array) {
  var tmp, current, top = array.length;
  if(top) while(--top) {
    current = Math.floor(Math.random() * (top + 1));
    tmp = array[current];
    array[current] = array[top];
    array[top] = tmp;
  }
  return array;
}