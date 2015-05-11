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
		var bannerImage = Ti.UI.createImageView({
	 	  defaultImage: "/images/warm-grey-bg.png",
		  image :ads[a].img_path,
		  width : Ti.UI.FILL,
		  m_id: ads[a].m_id,
		  height: Ti.UI.SIZE,//ads_height,
		  top: 10,
		  left: 10,
		  right: 10
		});
		$.adsCategory.ads_listing.add(bannerImage);
		
		bannerImage.addEventListener('click', function(e) {
		 	goAd(e.source.m_id);
		});
	}
}

/** navigate to Ad **/
var goAd = function(m_id){
	console.log(m_id);
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