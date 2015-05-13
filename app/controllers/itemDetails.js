var args = arguments[0] || {};
var a_id = args.a_id;
var position = args.position;
//$.item_Details.title= args.title;

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "ads",
	action: "view",
	label: "ads items",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Item Details"
}); 

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
		console.log( items[i]);
		adImage = Ti.UI.createImageView({
			image: items[i].img_path,
			width:"100%",
			height: Ti.UI.SIZE
		});
		
		var label_caption = Ti.UI.createLabel({
			top: 0,
			text: items[i].caption,
			color: "#ffffff",
			height: 60,
			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
		});
		
		var scrollView = Ti.UI.createScrollView({
			contentWidth: 'auto',
		  	contentHeight: 'auto',
		   	maxZoomScale: 30,
		    minZoomScale: 1,
		    zoomScale: 1,
		    scrollType: "horizontal",
		  	height: Ti.UI.SIZE,
		  	width: '100%'
		});
	
		row = $.UI.create('View', {  id:"view"+counter});
		
		row.add(adImage);
		row.add(label_caption);
		scrollView.add(row);
		the_view.push(scrollView); 
		
		counter++;
	}  
	
	$.scrollableView.setViews(the_view); 
	$.scrollableView.scrollToView(position, true); 
	
		
	$.scrollableView.addEventListener( 'scrollend', function(e) {
		if(($.scrollableView.currentPage+1) === items.length){
			if($.scrollableView.currentPage === my_page){
				$.scrollableView.currentPage=0;
			}
		}
		
		my_page =  $.scrollableView.currentPage;
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
$.item_Details.open();
