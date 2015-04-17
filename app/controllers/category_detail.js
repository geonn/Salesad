var args = arguments[0] || {};
var cate_id = args.category_id;
var nav = Alloy.Globals.navMenu; 
$.activityIndicator.show();

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "category",
	action: "view",
	label: "category details",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Category Details"
});
/** include required file**/
var API = require('api');

/** load category from Model**/
var library = Alloy.createCollection("category"); 
var details = library.getCategoryById(cate_id);

/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: details.categoryName, 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
  
$.category_details.titleControl = custom;
/*********************
*******FUNCTION*******
**********************/

//dynamic addEventListener for adImage
function createAdImageEvent(adImage, m_id) {
    adImage.addEventListener('click', function(e) {
        goAd(m_id);
    });
}

function createAdBranchEvent(adImage, m_id){
	adImage.addEventListener('click', function(e) {
        goBranch(m_id);
    });
}

var goAd = function(m_id){
	var win = Alloy.createController("ad", {m_id: m_id}).getView(); 
	nav.openWindow(win,{animated:true}); 
};

var goBranch = function(m_id){
	var win = Alloy.createController("branches", {m_id: m_id}).getView(); 
	nav.openWindow(win,{animated:true}); 
};

var createGridListing = function(res){
	var cateAdsLibrary = Alloy.createCollection("categoryAds"); 
	var merchantsLibrary = Alloy.createCollection('merchants'); 
	var branchLibrary = Alloy.createCollection('branches');
 	
 	var details = cateAdsLibrary.getCategoryAds(res.cate_id);
 	var counter = 0;
   	var imagepath, adImage, row, cell = '';
 	var last = details.length-1;
   	
   	//hide loading bar
	$.loadingBar.height = "0";
	$.loadingBar.top = "0";
   	$.scrollview.removeAllChildren();
   	if(details.length < 1){
   		var noRecord = Ti.UI.createLabel({ 
		    text: "No record found", 
		    color: '#CE1D1C', 
		    textAlign: 'center',
		    font:{fontSize:14,fontStyle:'italic'},
		    top: 15,
		    width: Ti.UI.SIZE 
		 });
		$.scrollview.add(noRecord);
   	}else{
   		for(var i=0; i< details.length; i++) {
	   		var m_id = details[i].m_id; 
	   		var branch = branchLibrary.getBranchesByMerchant(m_id); 
	   		var info = merchantsLibrary.getMerchantsById(m_id);
	   		
	   		imagepath = info.img_path;
	   		adImage = Utils.RemoteImage2({
				image: imagepath
			});
	   		if(counter%3 == 0){
	   			row = $.UI.create('View', {classes: ["row"],});
	   		}
	   		cell = $.UI.create('View', {classes: ["cell"], top: 2});
	   		
	   		if(branch == ""){
		   		createAdImageEvent(adImage, m_id);
	   		}else{
	   			createAdBranchEvent(adImage, m_id);
	   		}
			cell.add(adImage);
			row.add(cell);
			if(counter%3 == 2 || last == counter){
	   			$.scrollview.add(row);
	   		}
	   		counter++;
	     }
   	}
};

 
/************************
*******APP RUNNING*******
*************************/
API.loadMerchantListByCategory(cate_id);
var refreshListFromServer = function(){
	var currentTime = new Date().getTime();
	var lastUpdate  =  Ti.App.Properties.getString('refreshTime'+cate_id);
	var timeDifferent = currentTime - lastUpdate;
	/**Will not refresh within 5 min***/
	if (timeDifferent < 300000) {
	     return;
	}
	 
	Ti.App.Properties.setString('refreshTime'+cate_id, currentTime);
	//API.loadMerchantListByCategory(cate_id);
	
};
refreshListFromServer();
createGridListing({cate_id: cate_id});

/*********************
*** Event Listener ***
**********************/

Ti.App.addEventListener('app:category_detailCreateGridListing', createGridListing);

$.btnBack.addEventListener('click', function(){ 
	nav.closeWindow($.category_details); 
}); 

//release memory when close
$.category_details.addEventListener("close", function(){
    $.destroy();
    
    /* release function memory */
    createGridListing = null;
    goAd =null;
    goBranch = null; 
    /* release variable memory */
    API = null;
});
