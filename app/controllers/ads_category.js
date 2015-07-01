var args = arguments[0] || {};
var cate_id = args.cate_id || "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;
var category_library = Alloy.createCollection('category'); 
var category_info = category_library.getCategoryById(cate_id);
var ads_counter = 0;
var loading = false;
if (Ti.Platform.name === 'iPhone OS'){
  var style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
}
else {
  var style = Ti.UI.ActivityIndicatorStyle.DARK;
}
var activityIndicator = Ti.UI.createActivityIndicator({
  color: '#404041',
  font: {fontFamily:'Helvetica Neue', fontSize:16, fontWeight:'bold'},
  message: 'Loading...',
  style:style,
  bottom: 10,
  height:Ti.UI.SIZE,
  width: Ti.UI.FILL,
  zIndex: 14,
});

/* 0 1 2 3 4 5 6
 * Function
 * */
function buildListing(){
	
	var c_ads_library = Alloy.createCollection('categoryAds'); 
	var ads = c_ads_library.getLatestAdsByCategory(cate_id, ads_counter, 3);
	if(ads.length <= 0){
		console.log("remove indicator");
		activityIndicator.hide();
		$.adsCategory.ads_listing.remove(activityIndicator);
		return;	
	}
	ads_counter += 3;
	var dummy = $.UI.create("View",{
		bottom: 10,
		left: 10,
		right: 10,
	  	width : Ti.UI.FILL,
	  	height: Ti.UI.SIZE,
		backgroundColor: "#F1F1F2",
	});
	$.adsCategory.ads_listing.add(dummy);	
	for(var a = 0; ads.length > a; a++){
		var view_ad = $.UI.create("View",{
			bottom: 10,
			left: 10,
			right: 10,
			layout: "vertical",
			m_id: ads[a].m_id,
		  	a_id: ads[a].a_id,
		  	width : Ti.UI.FILL,
		  	height: Ti.UI.SIZE,
			backgroundColor: "#ffffff",
			borderColor: "#C6C8CA",
			borderRadius:4,
		});
		
		var bannerImage = Ti.UI.createImageView({
	 	  defaultImage: "/images/warm-grey-bg.png",
		  image :ads[a].img_path,
		  width : Ti.UI.FILL,
		  m_id: ads[a].m_id,
		  a_id: ads[a].a_id,
		  height: Ti.UI.SIZE,//ads_height,
		});
		
		var label_merchant = $.UI.create("Label", {
			font: { fontWeight: 'bold', fontSize: 16},
			text: ads[a].merchant,
			top: 10,
			left: 10,
			right: 10,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#404041"
		});
		
		var label_ads_name = $.UI.create("Label", {
			text: ads[a].ads_name,
			left: 10,
			right: 10,
			font: {fontSize: 14},
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#626366"
		});
		
		var dateDescription =ads[a].active_date+" - "+ads[a].expired_date;
		if(ads[a].active_date == "00/00/0000" && ads[a].expired_date =="No Expired"){
			dateDescription = "Start from now!";
		}else if(ads[a].active_date == "00/00/0000" && ads[a].expired_date !="No Expired"){
			dateDescription = "Until "+ads[a].expired_date+"!";
		}else if(ads[a].active_date != "00/00/0000" && ads[a].expired_date =="No Expired"){
			dateDescription = "Start from "+ads[a].active_date+"!";
		} 
		var label_date_period = $.UI.create("Label", {
			text: dateDescription,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			font:{fontSize: 12},
			left: 10,
			right: 10,
			bottom: 10,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#ED1C24"
		});
		
		var line = $.UI.create("View",{
			backgroundColor: "#C6C8CA",
			height: 0.5,
			width: Ti.UI.FILL
		});
		
		view_ad.add(bannerImage);
		view_ad.add(line);
		view_ad.add(label_merchant);
		view_ad.add(label_ads_name);
		view_ad.add(label_date_period);
		$.adsCategory.ads_listing.add(view_ad);
		
		bannerImage.addEventListener('click', function(e) {
		 	goAd(e.source.m_id, e.source.a_id);
		});
		
		bannerImage.addEventListener('load', function(e){
			activityIndicator.hide();
			$.adsCategory.ads_listing.remove(activityIndicator);
		});
		setTimeout(function(e){
			loading = false;
			console.log("remove indicator");
		}, 1000);
	}
	
	
}

/** navigate to Ad **/
var goAd = function(m_id, a_id){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 1000) {
	    return;
	};
	clickTime = currentTime;
	    
	var win = Alloy.createController("ad", {m_id: m_id, from : "home"}).getView(); 
	COMMON.openWindow(win); 
};
/*
 * App Running
 * */
buildListing();

var custom = Ti.UI.createLabel({ 
    text: category_info['categoryName'], 
    color: '#CE1D1C',
    font: { fontWeight: 'bold'},
});

if(Ti.Platform.osname == "android"){ 
	COMMON.removeAllChildren($.pageTitle);
	$.pageTitle.add(custom);   
}else{
	$.ad.titleControl = custom; 
}

/*
 * Event Listener 
 * */

$.adsCategory.ads_listing.addEventListener("scroll", function(e){
	var tolerance = 0;
	/*console.log(e.source.contentOffset);
	console.log(((e.source.getRect().height - tolerance) < e.source.contentOffset.y));
	console.log(!loading);*/
	var cnt = e.source.children.length;
	var lastChild = e.source.children[cnt-1];
	var cHeight = (lastChild.rect.y + (lastChild.getSize().height / 2));
	
	if(((cHeight - tolerance) < e.source.contentOffset.y) && !loading){
		loading = true;
		console.log("add indicator");
		$.adsCategory.ads_listing.add(activityIndicator);
		activityIndicator.show();
		e.source.scrollToBottom();
		buildListing();
	}
	//buildListing()
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.ad); 
}); 