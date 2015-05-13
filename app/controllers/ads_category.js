var args = arguments[0] || {};
var cate_id = args.cate_id || "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;
var category_library = Alloy.createCollection('category'); 
var category_info = category_library.getCategoryById(cate_id);

/*
 * Function
 * */
function buildListing(){
	var c_ads_library = Alloy.createCollection('categoryAds'); 
	var ads = c_ads_library.getLatestAdsByCategory(cate_id, 0);
	 
	for(var a = 0; ads.length > a; a++){
		var view_ad = $.UI.create("View",{
			top: 10,
			left: 10,
			right: 10,
			bottom: 10,
			layout: "vertical",
			m_id: ads[a].m_id,
		  	a_id: ads[a].a_id,
		  	width : Ti.UI.FILL,
		  	height: Ti.UI.SIZE,
			backgroundColor: "#ffffff"
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
			top: 4,
			left: 4,
			right: 4,
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#000000"
		});
		
		var label_ads_name = $.UI.create("Label", {
			text: ads[a].ads_name,
			left: 4,
			right: 4,
			font: {fontSize: 16},
			textAlign: Titanium.UI.TEXT_ALIGNMENT_LEFT,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#000000"
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
			left: 4,
			right: 4,
			bottom: 4,
			width: Ti.UI.FILL,
			height: Ti.UI.SIZE,
			color: "#ff0000"
		});
		
		view_ad.add(bannerImage);
		view_ad.add(label_merchant);
		view_ad.add(label_ads_name);
		view_ad.add(label_date_period);
		$.adsCategory.ads_listing.add(view_ad);
		
		bannerImage.addEventListener('click', function(e) {
		 	goAd(e.source.m_id, e.source.a_id);
		});
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
    color: '#CE1D1C' 
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
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.ad); 
}); 