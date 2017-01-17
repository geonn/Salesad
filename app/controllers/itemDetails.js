var args = arguments[0] || {};
var a_id = args.a_id;
var position = args.position || 0;
var isScan = args.isScan;
//$.item_Details.title= args.title;
var BARCODE = require('barcode');
var showBarcode = 1;
/** google analytics**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "ads",
		action: "view",
		label: "ads items",
		value: 1
	}); 
	Alloy.Globals.tracker.trackScreen({
		screenName: "Item Details"
	}); 
}else{ 
	Alloy.Globals.tracker.addEvent({
        category: "ads",
		action: "view",
		label: "ads items",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView('Item Details');
}
//console.log("position : "+position);
//load model 
var i_library = Alloy.createCollection('items'); 

var items  = i_library.getItemByAds(a_id);
 
var getAdsImages = function(){
	
	var counter = 0;
	var imagepath, adImage, row = '';
	var my_page = 0;
	var selectedView;   		
	/***Set ads items***/
	var the_view = []; 
	for (var i=0; i< items.length; i++) { 
		var itemImageView = $.UI.create("View", {classes:['wfill','hsize']});
		adImage = Ti.UI.createImageView({
			defaultImage: "/images/warm-grey-bg.png",
			image: items[i].img_path,
			width:"100%",
			enableZoomControls: true,
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
				//console.log(items[i]['i_id']+"=="+items[i].barcode);
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
		
		var label_caption = $.UI.create("Label", { 
			top: 0,
			text: items[i].caption,
			height: 60,
			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
		});
		
		var label_description = $.UI.create("Label",{
			classes:['wfill','hsize','h5','padding'],
			text: item[i].description
		});
		
		var scrollView = Ti.UI.createScrollView({
			contentWidth: Ti.UI.FILL,
		  	contentHeight: Ti.UI.SIZE,
		   	maxZoomScale: 30,
		    minZoomScale: 1,
		    zoomScale: 1,
		    scrollType: "vertical",
		  	height: Ti.UI.FILL,
		  	width: Ti.UI.FILL
		});
	
		row = $.UI.create('View', {id:"view"+counter, classes:['wfill','hfill','vert']});
		itemImageView.add(adImage); 
	 	if(items[i].barcode != "" && typeof(barCodeView)  != "undefined"){
			if(isScan == "1"){
				//itemImageView.add(barCodeView);
			} 
		}
		row.add(label_caption);
		row.add(label_description);
		row.add(itemImageView);
		if(position == counter){
			selectedView = row;
		}
		scrollView.add(row);
		the_view.push(scrollView); 
		
		counter++;
	}  
	
	$.scrollableView.setViews(the_view); 
	setTimeout(function(){
		$.scrollableView.scrollToView(position);  
	},250);
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
