var args = arguments[0] || {};
var cate_id = args.category_id;
var nav = Alloy.Globals.navMenu; 
var loading = Alloy.createController("loading");
Alloy.Globals.naviPath.push($.category_details);
/** google analytics**/ 

/** load category from Model**/
var library = Alloy.createCollection("category"); 
var category_data = library.getCategoryById(cate_id);

/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: category_data.categoryName, 
    color: '#ED1C24', 
    width: Ti.UI.SIZE 
 });

var category_banner = Ti.UI.createImageView({
	defaultImage: "/images/warm-grey-bg.png",
	image: category_data.image,
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
    	}else{
    		console.log(m_id+" "+e.source.m_id);
    		var win = Alloy.createController("location", {m_id: e.source.m_id, a_id: "", showAll: true}).getView(); 
			COMMON.openWindow(win,{animated:true}); 
    	}
        
    });
}

function createAdBranchEvent(adImage, m_id){
	adImage.addEventListener('click', function(e) {
        goBranch(m_id);
    });
}

var goAd = function(m_id){
	var win = Alloy.createController("branch_or_ad", {m_id: m_id}).getView(); 
	//var win = Alloy.createController("ad", {m_id: m_id}).getView(); 
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
 	
 	var details = cateAdsLibrary.getCategoryAds(cate_id);
 	var counter = 0;
   	var imagepath, adImage, row, cell = '';
 	var last = details.length-1;
   	var tableData = [];
   	//hide loading bar
   	$.categoryDetailsView.category_tv.removeAllChildren();
   	
   	if(details.length < 1){
   		var noRecord = $.UI.create("Label", { 
		    text: "No record found", 
		    color: '#ED1C24', 
		    textAlign: 'center',
		    font:{fontSize:14,fontStyle:'italic'},
		    top: 15,
		    width: Ti.UI.SIZE 
		 });
		$.categoryDetailsView.category_tv.add(noRecord);
   	}else{
   		 
   		for(var i=0; i< details.length; i++) {
   			console.log(i+" category merchant");
	   		var m_id = details[i].m_id; 
	   		
	   		//console.log(info);
	   		
	   			 
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
		   		if(!details[i].img_path){
		   			imagepath = "icon_mySalesAd.png";
		   		}else{
		   			imagepath = details[i].img_path;
		   		}
				adImage = Ti.UI.createImageView({
					image: imagepath,
					defaultImage: "/images/warm-grey-bg.png",
					height: 50,
					width: 50,
					left: 10,
				});
				
				var mn =details[i].merchant_name;
				mn = mn.replace(/&quot;/g, "'"); 
		   		var category_label = $.categoryDetailsView.UI.create("Label",{
		   			height: Ti.UI.SIZE,
		   			text: mn,
		   			left: 70,
		   		});
		   		
		   		
		   		view.add(adImage);
		   		view.add(category_label);
		   		
				row.add(view);
		   		createAdImageEvent(row, m_id);
				tableData.push(row);
			}
	     $.categoryDetailsView.category_tv.setData(tableData);
   	}
   	loading.finish();
};

 
/************************
*******APP RUNNING*******
*************************/
$.categoryDetailsView.container.add(loading.getView());
loading.start();
API.getMerchantListByCategory(cate_id, createGridListing);


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
