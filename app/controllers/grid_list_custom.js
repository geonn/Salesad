var args = arguments[0] || {};
var f_select, s_select = '';
var animationType = [];
var u_id = Ti.App.Properties.getString('u_id') || "";
var nav = Alloy.Globals.navMenu; 
/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'MY SALESAD', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
  

if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);  
	Ti.UI.Android.hideSoftKeyboard();    
}else{
	$.custom.titleControl = custom;
}
/* Event Listener */
$.custom.addEventListener("close", function(){
    $.gridView.destroy();
    Ti.App.fireEvent("app:refreshAdsListing");
    createGridListing = null;
    createAdImageEvent = null;
    switch_position = null;
});

/*** Get ads ***/
var createGridListing = function(res){

	var favoritesLibrary = Alloy.createCollection('favorites'); 
	var merchantsLibrary = Alloy.createCollection('merchants'); 
	var cateAdsLibrary = Alloy.createCollection("categoryAds");
	var branchLibrary = Alloy.createCollection('branches');
	
	var details = favoritesLibrary.getFavoritesByUid(u_id);
  	var counter = 0;
   	var imagepath, adImage, row, cell = '';
 	var last = details.length-1;
 	var tableData = [];
 	
    $.gridView.category_tv.removeAllChildren();
    
    if(details.length < 1){
   		var noRecord = Ti.UI.createLabel({ 
		    text: "No record found", 
		    color: '#CE1D1C', 
		    textAlign: 'center',
		    font:{fontSize:14,fontStyle:'italic'},
		    top: 15,
		    width: Ti.UI.SIZE 
		 });
		$.gridView.category_tv.add(noRecord);
   	}else{
   		for(var i=0; i< details.length; i++) {
   			var m_id = details[i].m_id; 
	   		var branch = branchLibrary.getBranchesByMerchant(m_id); 
	   		var info = merchantsLibrary.getMerchantsById(m_id);
	   		var row = $.gridView.UI.create("TableViewRow",{
	   			height: Ti.UI.SIZE,
	   			width: Ti.UI.FILL,
	   			touchEnabled: true,
	   		});
	   		var view  = $.gridView.UI.create("View",{
	   			layout: "horizontal",
	   			objName: 'enabledWrapperView',
	   			rowID: i,
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
				objName: 'disabledWarpperView',
				touchEnabled: false,
			});
			 
	   		var category_label = $.gridView.UI.create("Label",{
	   			height: Ti.UI.SIZE,
	   			text: info.name,
	   			left: 10,
	   			objName: 'label',
	   			touchEnabled: false,
	   		});
	   		
	   		view.add(adImage);
	   		view.add(category_label);
			row.add(view);
			if(branch == ""){
		   		createAdImageEvent(row, m_id);
	   		}else{
	   			createAdBranchEvent(row, m_id);
	   		}
			tableData.push(row);
			
			table.addEventListener('swipe', function(e){
              if (e.source && e.source.objName !== 'table'){
                Ti.API.info('Row swiped: ' + e.source);
                Ti.API.info('Row swiped: ' + e.source.objName);
                Ti.API.info('Row ID : ' + e.source.rowID);
              }
            });
   		}
   		$.gridView.category_tv.setData(tableData);
   		/*
	    for(var i=0; i< details.length; i++) {
	    	favoritesLibrary.updatePosition(details[i].id, i);
	   		var m_id = details[i].m_id;
	   		var info = merchantsLibrary.getMerchantsById(m_id);
	   		imagepath = info.img_path;
	   		adImage = Utils.RemoteImage({
				image: imagepath
			});
			
	   		if(counter%3 == 0){
	   			row = $.gridView.UI.create('View', {classes: ["row"],});
	   		}
	   		cell = $.gridView.UI.create('View', {
	   			classes: ["cell"], 
	   			top: 2, 
	   			position: counter,
	   			id: details[i].id,
	   			pos: i
	   			});
	   		
	   		createAdImageEvent(cell);
	   		var close = Ti.UI.createImageView({
	   			image: '/images/btn-close.png',
	   			width: 30,
	   			top: 0,
	   			right: 0
	   		});
	   		createCloseEvent(close, cell, details[i].id);
			cell.add(adImage);
			cell.add(close);
			row.add(cell);
			if(counter%3 == 2 || last == counter){
	   			$.gridView.scrollview.add(row);
	   		}
	   		counter++;
		 }
		 */
	 }
};

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
	COMMON.openWindow(win); 
};

var goBranch = function(m_id){
	var win = Alloy.createController("branches", {m_id: m_id}).getView(); 
	COMMON.openWindow(win); 
};
/*
var createAdImageEvent = function(cell) {
    cell.addEventListener('click', function(e) {
        switch_position(cell, e);
    });
};
*/
//dynamic addEventListener for adImage
var createCloseEvent = function(close, cell, id) {
    close.addEventListener('click', function(e) {
        var favoritesLibrary = Alloy.createCollection('favorites');
        
        var message = "Are you sure want to remove from favorite list";
		var dialog = Ti.UI.createAlertDialog({
		    cancel: 1,
		    buttonNames: ['Cancel','Confirm'],
		    message: message,
		    title: 'Remove Favorite'
		});
		dialog.addEventListener('click', function(ex){
		  	if (ex.index == 1){
	  			favoritesLibrary.deleteFavorite(id);
	  			createGridListing();
		  	}
		});
		dialog.show();
	});
};

var switch_position = function(cell, e){
	var favoritesLibrary = Alloy.createCollection('favorites');
	
	if(!f_select){
		var a = $.gridView.UI.create('view', {
		    backgroundColor : '#03FFF2',
		    width : Titanium.UI.FILL,
		    height : Titanium.UI.FILL,
		    opacity : 0.4
		  });
		  cell.add(a);
		f_select = cell;
		animationType.push({ name: 'first', view: cell, shadow: a });
	}else{
		s_select = cell;
		animationType.push({ name: 'second',  view: cell });
		
		var f_image = animationType[0].view.getChildren();
		var s_image = animationType[1].view.getChildren();
		var f_id = animationType[0].view.id;
		var s_id = animationType[1].view.id;
		var f_pos = animationType[0].view.pos;
		var s_pos = animationType[1].view.pos;
		
		favoritesLibrary.updatePosition(f_id, s_pos);
		favoritesLibrary.updatePosition(s_id, f_pos);
		f_select.removeAllChildren();
		s_select.removeAllChildren();
		f_select.add(s_image);
		f_select.id = s_id;
		s_select.add(f_image);
		s_select.id = f_id;
		s_select.remove(animationType[0].shadow);
		//animationType[0].view.add(e.source);
		//animationType[1].view.removeAllChildren();
		
		f_select = '';
		s_select = '';
		animationType = [];
	}
	
};

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.custom); 
}); 

/* App Running */
createGridListing();