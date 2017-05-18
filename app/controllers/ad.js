var args = arguments[0] || {};
var a_id = args.a_id || "";
var name = args.name || "";
var date = args.date || "";
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

var params = {
		a_id:a_id,
		type:2,
		from:"ad",
		u_id:u_id
	} ;
	API.callByPost({url:"addAdsClick",new:true,params:params},{
		onload:function(res){
			console.log("View ad "+JSON.stringify(res));
		},onerror:function(err){
			console.log("View ad error");
		}});	

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
	var expire = Ti.App.Properties.getString('sales'+args.target_m_id) || "";
	console.log('sales'+args.target_m_id);
	console.log(expire+" got or not");
	if(expire != ""){
		var currentDate = new Date();
		if(OS_ANDROID){
			
		}
		var dat = expire.split(" ");
		var d = dat[0].split("-");
		var t = dat[1].split(":");
		console.log(d);
		console.log(t);
		var new_expire = (OS_ANDROID)? new Date(expire): new Date(d[0], d[1], d[2], t[0], t[1], t[2]);
		//var new_expire = new Date(d[0], d[1], d[2], t[0], t[1], t[2]);
		console.log(new_expire+" >= "+currentDate);
		console.log(typeof new_expire);
		if(expire != null && currentDate <= new_expire){
			console.log("should be here!!!");
			isScan = 1;
		}else{
			console.log("not here!!!");
			isScan = 0;
		}
	}else{
		isScan = 0;
	}
	console.log('sales'+args.target_m_id);
	console.log(isScan+" why got value one");
}

function checkFavorite(){
	var model_favorites = Alloy.createCollection('favorites');
	console.log(m_id+" m_id");
	var exist = model_favorites.checkFavoriteExist(m_id, u_id);
	console.log("m_id : "+m_id);
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
 		defaultImage: "/images/image_loader_640x640.png",
		image :ads.img_path,
		width : "100%",
		height: Ti.UI.SIZE,//ads_height,
	});
	
	var app_background = (ads.app_background !== undefined)?"#"+ads.app_background:"#fff";
	$.win.backgroundColor = app_background;
	console.log(bannerImage);
	$.banner.add(bannerImage);
	
	bannerImage.addEventListener('click',function(e){
		var Zv = Ti.UI.createView({
			width :Ti.UI.FILL,
			height :Ti.UI.FILL, 
			backgroundColor: "#ccffffff",
			zIndex :100
		});
		var Z = Ti.UI.createView({
			width :"95%",
			height :Ti.UI.SIZE,
			backgroundColor :"transparent",
			zIndex :100
		});
		var Ziv = Ti.UI.createScrollView({
			width :Ti.UI.SIZE, 
			height :Ti.UI.SIZE,        
            showHorizontalScrollIndicator:false,
            showVerticalScrollIndicator:false,
            maxZoomScale:10,
            minZoomScale:1.0,
            borderWidth :1, 
      		backgroundColor :"transparent",
      		zIndex :100
		});
		var Zimage = Ti.UI.createImageView({
			image :ads.img_path,
			width :"100%",
			height :Ti.UI.SIZE,
			zIndex :101,
			enableZoomControls :"true"
		});
		var close = Ti.UI.createImageView({
			image :"/images/Icon_Delete_Round.png",
			width : 30, 
			height : 30, 
			top : 3,
			right : 3,  
			zIndex : 102
		});
		Ziv.add(Zimage);
		Z.add(Ziv);
		Z.add(close);
		Zv.add(Z);
		$.win.add(Zv);
		close.addEventListener('click',function(e){
			Zv.removeAllChildren();
			Zv.height = 0;
		});
});
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
			var exclusive_icon = $.UI.create("ImageView", {classes:['hsize'], width: 30, right: 10, top:0, image:"/images/Icon_Exclusive_Gold_Long@0,25x.png"});
			
			adImage = Ti.UI.createImageView({
				defaultImage: "/images/image_loader_600x800.png",
				image: imagepath,
				left: 4,
				width: Ti.UI.FILL,
				height: "auto",
			});
			itemImageView.add(adImage);
			
			//itemImageView.add(BARCODE.generateBarcode("686068606860")); 
			
			createAdImageEvent(itemImageView,ads.a_id,counter,ads.name, items[i].description, items[i].isExclusive);
			
			cell.add(itemImageView);
			if(items[i].isExclusive == 1){
				cell.add(exclusive_icon);
			}
			row.add(cell);
			
			if(counter%2 == 1 || last == counter){
				$.ads_details.add(row);
			}
			counter++;
		} 
		console.log("ads data");
		console.log(ads.description);
		var ads_tnc = (ads.tnc != null) ? ads.tnc : "";
		var ad_name = $.UI.create("Label", {classes:['wfill', 'hsize', 'h5', 'small-padding', 'bold'], text : name});
		var ad_date = $.UI.create("Label", {classes:['wfill', 'hsize', 'h5', 'small-padding', 'bold'], text : date});
		var tnc = $.UI.create("Label", {classes:['wfill', 'hsize','h5','small-padding','bold'], text :ads.description+"\n\nTerms and Conditions\n\n"+ ads_tnc});
		$.ads_details.add(ad_name);
		$.ads_details.add(ad_date);
		if(ads.description != "" || ads_tnc != "") {
			$.ads_details.add(tnc);
		}
		isAdsAvailable = true;
	}else{
		/*
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
		$.ads_details.add(default_image);*/
	}

	var custom = $.UI.create("Label", { 
		    text: pageTitle, 
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

function addAdsClick(){
	API.callByPost({url: "addAdsClick", new:true, params:{a_id: a_id}}, {onload: function(responseText){
		console.log(responseText);
	}});
}

function init(){
	$.win.add(loading.getView());
	getAdData();
	var merchant = m_library.getMerchantsById(ads.m_id);
	addAdsClick();
	console.log("check here ad");
	console.log(merchant.parent);
	console.log(ads.m_id);
	m_id = (merchant.parent != 0 && merchant.parent != null)?merchant.parent:ads.m_id;
	console.log(m_id+" here mid");
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
	    var page = Alloy.createController("itemDetails",{m_id: args.target_m_id, a_id:a_id, position:position, title:title, isExclusive: isExclusive, isScan: isScan, description: description, date: date, from: from}).getView(); 
	  	page.open();
	  	page.animate({
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
			opacity: 1,
			duration: 300
		});
    });
}

 
$.location.addEventListener('click', function(e){ 
	if(Ti.Geolocation.locationServicesEnabled){
		console.log("Here is locaiton eventlistener");
		console.log(args.target_m_id+" "+m_id+" "+a_id);		
		COMMON.openWindow(Alloy.createController("location",{target_m_id: args.target_m_id, m_id: m_id, a_id:a_id}).getView());
	}
	else{
	    Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
			if(e.success){
				COMMON.openWindow(Alloy.createController("location",{target_m_id: args.target_m_id, m_id: m_id, a_id:a_id}).getView());				
			}
			else{
	        	alert("You denied permission.");
			}
	  	});	
	} 
});

/*********************
*** Event Listener ***
**********************/

//Add your favorite event
$.favorites.addEventListener("click", function(){ 
	var model_favorites = Alloy.createCollection('favorites');
	var exist = model_favorites.checkFavoriteExist(m_id, u_id);
 console.log(exist+" exist");
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
				model_favorites.deleteFavorite(exist, u_id); 
				$.favorites.image = "/images/SalesAd_Favorite.png";
				//$.favorites.visible = false;
				
				API.updateUserFavourite({
					m_id   : exist,
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

function afterScan(e){
	console.log(e.m_id+"!="+ m_id);
	if(e.m_id != m_id){
		console.log(e.m_id+"!="+ m_id);
		var win = Alloy.createController("branch_ad", {m_id: e.m_id}).getView(); 
		COMMON.openWindow(win);
		Ti.App.removeEventListener('afterScan', afterScan);
	}else{
		console.log('should be here');
		getScanMerchant();
	}
}

function popMoreMenu(){
	var picker_list = [{text: 'Report This Ad'}];
	var options = _.pluck(picker_list, "text");
	options.push("Cancel");
	var dialog = Ti.UI.createOptionDialog({
	  cancel: options.length - 1,
	  options: options,
	  title: 'Report'
	});
	dialog.show();
	dialog.addEventListener("click", function(ex){   
		if(ex.index == 0){
			popReport();
		}
	});
}

function popReport(){
	var view = $.UI.create("View", {classes:['wfill','hsize','vert', 'padding', "rounded","box"], backgroundColor:"#ffffff"});
	var label = $.UI.create("Label", {classes: ['wsize','hsize', 'padding', 'h4'], color: "#000000", text: "Report"});
	var hr = $.UI.create("View", {classes:['hr'], backgroundColor:"#cccccc"});
	var picker_list = [{title: 'This is not a SalesAd'}, {title: 'This Ad is seriously offensive (Sexually explicit, violent, dangerous, hate speech, harassment or bullying)'}, {title: 'This Ad contains incorrect or misleading information'}, {title: 'Others (Please specify)'},  {title:  'Cancel'}];
	var arr = [];
	for (var i=0; i < picker_list.length; i++) {
		var row = $.UI.create("TableViewRow", {error_msg: picker_list[i].title});
		var l = $.UI.create("Label", {classes:['wfill','hsize','padding'], text: picker_list[i].title});
	  	row.add(l);
	  	arr.push(row);
	};
	var table = $.UI.create("TableView", {
	  classes:['wfill', "rounded", "hsize", "conthsize"],
	  data: arr,
	  zIndex: 50
	});
	view.add(label);
	view.add(hr);
	view.add(table);
	$.win.add(view);
	table.addEventListener("click", function(e){
		if(e.index != arr.length - 1 && e.index != arr.length - 2){
			COMMON.createAlert("Confirmation", "Are you sure you want to report this Ad for the reason below? \n\n"+e.rowData.error_msg, function(){
				submit_report({report_msg: e.rowData.error_msg});
			}, "Yes");
		}else if(e.index == 3) {
			var ViewAlert = $.UI.create("View", {classes:['vert', 'hsize', 'wfill', 'padding', 'rounded', 'box'], zIndex: 60, backgroundColor: 'white'});
			var LabelTitle = $.UI.create("Label", {classes:['hsize', 'wfill', 'padding'], bottom: 0, text: 'Confirmation\n\nAre you sure you want to report this Ad for the reason below?\n'+e.rowData.error_msg});
			var TextField = $.UI.create("TextField", {classes:['hsize', 'wfill', 'padding', 'textfield']});
			var viewbutton = $.UI.create("View", {classes:['wfill', 'hsize', 'padding'], top: 0});
			var ButtonCancel = $.UI.create("Button", {classes:['hsize', 'wsize'], left: 0, title: 'Cancel'});
			var ButtonYes = $.UI.create("Button", {classes:['wsize', 'hsize'], right: 0, title: 'Ok'});
			
			ViewAlert.add(LabelTitle);
			ViewAlert.add(TextField);
			ViewAlert.add(viewbutton);
			viewbutton.add(ButtonCancel);
			viewbutton.add(ButtonYes);
			$.win.add(ViewAlert);
			
			ButtonCancel.addEventListener('click', clickreport);
			ButtonYes.addEventListener('click', clickreport);
			
			function clickreport(e) {
				if(e.source.title == "Cancel") {
					$.win.remove(ViewAlert);
				}else if(e.source.title == "Ok") {
					if(TextField.value != "") {
						submit_report({report_msg: TextField.value});
					}else {
						alert("Please insert your report message!");
					}
				}
			}
		}
		$.win.remove(view);
	});
}

function submit_report(e){
	loading.start();
	var report_msg = (typeof e.report_msg != "undefined")?e.report_msg:"";
	API.callByPost({url: "submitReportAds", new:true, params:{u_id: u_id, remark: report_msg, category: 1, item_id: a_id}}, {onload: function(responseText){
		var res = JSON.parse(responseText);
		if(res.status == "success"){
			alert("Report Submitted");
		}
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
	Ti.App.removeEventListener('afterScan', afterScan);
    $.destroy();
});


Ti.App.addEventListener('app:loadAdsDetails', refresh);
Ti.App.addEventListener('afterScan', afterScan);	

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
	        	//title: ads.description + ". Download SalesAd : http://apple.co/1RtrCZ4",
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
	console.log("naviPath here");
	console.log(naviPath.length);
	console.log(typeof naviPath+"naviPath here");
	if(naviPath == ""){		
		closeWindow();
	}else{		
		/*for (var i=0; i< naviPath.length; i++) { 
			console.log(typeof naviPath[i]);
			console.log(naviPath[i]);
			COMMON.closeWindow(naviPath[i]);  
		}*/
		Ti.App.fireEvent("ads:close"); 
 		COMMON.closeWindow($.win); 		
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

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});


