var args = arguments[0] || {};
var a_id = args.a_id;
var position = args.position;
$.item_Details.title= args.title;

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "ads",
	action: "view",
	label: "ads items",
	value: 1
});
Alloy.Globals.tracker.trackScreen("Item Details");

var common = require('common');

//load model 
var i_library = Alloy.createCollection('items'); 

var items  = i_library.getItemByAds(a_id);
 
var getAdsImages = function(){
	
	var counter = 0;
	var imagepath, adImage, row = '';
	var my_page = 0;
	   		
	/***Set ads items***/
	var the_view = [];
	
	for (var i=0; i< items.length; i++) {
		
		adImage = Utils.RemoteImage({
			image: items[i].img_path,
			width:"100%"
		});
		
		var scrollView = Ti.UI.createScrollView({
			contentWidth: 'auto',
		  	contentHeight: 'auto',
		   	maxZoomScale: 30,
		    minZoomScale: 1,
		    zoomScale: 1,
		  	height: Ti.UI.SIZE,
		  	width: '100%'
		});
	
		row = $.UI.create('View', {classes: ["row"], id:"view"+counter});
		
		$.item_Details.title=items[i].caption;
		row.add(adImage);
		//row.add(img_caption);
		scrollView.add(row);
		the_view.push(scrollView); 
		
		counter++;
	} 

	var scrollableView = Ti.UI.createScrollableView({
		  id: "scrollableView",
		  views:the_view,
		  showPagingControl:true
	});
	
	$.item_Details.add(scrollableView);
	
	scrollableView.scrollToView(position, true); 
	
		
	scrollableView.addEventListener( 'scrollend', function(e) {
		if((scrollableView.currentPage+1) === items.length){
			if(scrollableView.currentPage === my_page){
				scrollableView.currentPage=0;
			}
		}
		
		my_page =  scrollableView.currentPage;
	});
};

/*********************
*** Event Listener ***
**********************/
$.item_Details.addEventListener('click', function(e){
	$.item_Details.close({
			curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
			opacity: 0,
			duration: 200
		});
});

 
/************************
*******APP RUNNING*******
*************************/
getAdsImages();
