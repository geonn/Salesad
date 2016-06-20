var args = arguments[0] || {};
var cate_id = args.category_id;
var nav = Alloy.Globals.navMenu; 
$.categoryDetailsView.activityIndicator.show();
Alloy.Globals.naviPath.push($.category_details);
/** google analytics**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "category",
		action: "view",
		label: "category details",
		value: 1
	});
	Alloy.Globals.tracker.trackScreen({
		screenName: "Category Details"
	}); 
}else{ 
	Alloy.Globals.tracker.addEvent({
        category: "category",
		action: "view",
		label: "category details",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView('Category Details');
}
/** load category from Model**/
var library = Alloy.createCollection("category"); 
var details = library.getCategoryById(cate_id);

/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: details.categoryName, 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });

var category_banner = Ti.UI.createImageView({
	defaultImage: "/images/warm-grey-bg.png",
	image: details.image,
	height: "auto",
	width: Ti.UI.FILL,
	zIndex: 10,
});

$.categoryDetailsView.category_banner.add(category_banner);

if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);  
	Ti.UI.Android.hideSoftKeyboard();   
}else{
	$.category_details.titleControl = custom;
} 

/*********************
*******FUNCTION*******
**********************/

//dynamic addEventListener for adImage
function createAdImageEvent(adImage, m_id) {
    adImage.addEventListener('click', function(e) { 
    	if(e.source.action != "locationIcon"){
    		goAd(m_id);
    	}
        
    });
}

function createAdBranchEvent(adImage, m_id){
	adImage.addEventListener('click', function(e) {
        goBranch(m_id);
    });
}

var goAd = function(m_id){
	var win = Alloy.createController("ad", {m_id: m_id}).getView(); 
	COMMON.openWindow(win); 
};

var goBranch = function(m_id){
	var win = Alloy.createController("branches", {m_id: m_id}).getView(); 
	COMMON.openWindow(win); 
};

var createGridListing = function(res){
	var cateAdsLibrary = Alloy.createCollection("categoryAds"); 
	var merchantsLibrary = Alloy.createCollection('merchants'); 
	var branchLibrary = Alloy.createCollection('branches');
 	
 	var details = cateAdsLibrary.getCategoryAds(res.cate_id);
 	var counter = 0;
   	var imagepath, adImage, row, cell = '';
 	var last = details.length-1;
   	var tableData = [];
   	
   	//hide loading bar
	$.categoryDetailsView.loadingBar.height = "0";
	$.categoryDetailsView.loadingBar.top = "0";
   	$.categoryDetailsView.category_tv.removeAllChildren();
   	
   	if(details.length < 1){
   		var noRecord = Ti.UI.createLabel({ 
		    text: "No record found", 
		    color: '#CE1D1C', 
		    textAlign: 'center',
		    font:{fontSize:14,fontStyle:'italic'},
		    top: 15,
		    width: Ti.UI.SIZE 
		 });
		$.categoryDetailsView.category_tv.add(noRecord);
   	}else{
   		 
   		for(var i=0; i< details.length; i++) {
	   		var m_id = details[i].m_id; 
	   		var branch = branchLibrary.getBranchesByMerchant(m_id); 
	   		var info = merchantsLibrary.getMerchantsById(m_id); 
	   		//console.log(info);
	   		if(info != "" && (info.parent == "0" || info.parent == null)){
	   			 
		   		var row = $.categoryDetailsView.UI.create("TableViewRow",{
		   			height: Ti.UI.SIZE,
		   			width: Ti.UI.FILL,
		   			backgroundSelectedColor: "#FFE1E1",
		   		});
		   		var view  = $.categoryDetailsView.UI.create("View",{
		   			//layout: "horizontal",
		   			width: Ti.UI.FILL,
		   			height: Ti.UI.SIZE,
		   			top: 10,
		   			bottom: 10,
		   			left: 10,
		   			right: 10,
		   		});
		   		
		   		var imagepath='';
		   		if(!info.img_path){
		   			imagepath = "icon_mySalesAd.png";
		   		}else{
		   			imagepath = info.img_path;
		   		}
				
				adImage = Ti.UI.createImageView({
					image: imagepath,
					defaultImage: "/images/warm-grey-bg.png",
					height: 50,
					width: 50,
					left: 10,
				});
				
				var mn =info.merchant_name;
				mn = mn.replace(/&quot;/g, "'"); 
		   		var category_label = $.categoryDetailsView.UI.create("Label",{
		   			height: Ti.UI.SIZE,
		   			text: mn,
		   			left: 70,
		   		});
		   		
		   		var rightRegBtn =  Titanium.UI.createImageView({
					image:"/images/sales-ad-loc_small.png",
					width:20, 
					m_id:m_id,
					right:20,
					action: "locationIcon",
					top:20
				});		 
				
		   		view.add(adImage);
		   		view.add(category_label);
		   		view.add(rightRegBtn);
		   		view.addEventListener('click', function(e){
					var win = Alloy.createController("location", {m_id: e.source.m_id, a_id: "", showAll: true}).getView(); 
					COMMON.openWindow(win,{animated:true}); 
					return false;
				});
				row.add(view);
				//if(branch == ""){
			   		createAdImageEvent(row, m_id);
		   		//}else{
		   		//	createAdBranchEvent(row, m_id);
		   		//}
				tableData.push(row);
			}
	     }
	     $.categoryDetailsView.category_tv.setData(tableData);
   	}
};

 
/************************
*******APP RUNNING*******
*************************/
API.getMerchantListByCategory(cate_id);
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

//Ti.App.addEventListener('app:category_detailCreateGridListing', createGridListing);

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.category_details); 
}); 

//release memory when close
$.category_details.addEventListener("close", function(){
    $.categoryDetailsView.destroy();
    //Ti.App.removeEventListener('app:category_detailCreateGridListing', createGridListing);
    /* release function memory */
    createGridListing = null;
    goAd =null;
    goBranch = null;  
});
