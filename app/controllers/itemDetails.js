var args = arguments[0] || {};
var a_id = args.a_id;
var position = args.position;
var isScan = args.isScan;
//$.item_Details.title= args.title;
var BARCODE = require('barcode');
var showBarcode = 1;
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
	console.log("isScan : "+isScan);
	for (var i=0; i< items.length; i++) { 
		
		
		var itemImageView = Ti.UI.createView({
			height: Ti.UI.SIZE,
			width: Ti.UI.SIZE
		});
			
		adImage = Ti.UI.createImageView({
			defaultImage: "/images/warm-grey-bg.png",
			image: items[i].img_path,
			width:"100%",
			height: Ti.UI.SIZE
		});
		
		
		
		if(items[i].barcode != ""){
			if(isScan == "1"){ 
				//BARCODE
				var barCodeView = Ti.UI.createView({ 
					height:Ti.UI.SIZE,
					width:Ti.UI.SIZE ,
					layout: "horizontal",
					bottom: 0
				});
				console.log(items[i]['i_id']+"=="+items[i].barcode);
				var bcwv = BARCODE.generateBarcode(items[i].barcode);
				barCodeView.add(bcwv);
				
				var saIcon =Ti.UI.createImageView({
					image : "/images/icon_mySalesAd.png",
					width: 35,
					height: 35,
					right:0,
					bottom:0,
					id:"barCodeControl",
					borderRadius : 10
				});
				saIcon.addEventListener('click',function(){
					if(showBarcode == 1){
						showBarcode = 0;
						bcwv.opacity = 0;
					}else{
						showBarcode = 1;
						bcwv.opacity = 1;
					}
				});
				barCodeView.add(saIcon);
			}
			
			
		}
		
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
		itemImageView.add(adImage);
		if(items[i].barcode != ""){
			itemImageView.add(barCodeView);
		}
		row.add(itemImageView);
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
	var elbl = JSON.stringify(e.source); 
	var res = JSON.parse(elbl); 
	if(res.id == "barCodeControl"){
		return false;
	}else{
		$.item_Details.close({
			curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
			opacity: 0,
			duration: 200
		});
	}
	
});

 
/************************
*******APP RUNNING*******
*************************/
getAdsImages();
$.item_Details.open();
