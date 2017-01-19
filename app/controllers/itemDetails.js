var args = arguments[0] || {};
var a_id = args.a_id;
var position = args.position || 0;
var isScan = args.isScan;
//$.item_Details.title= args.title;
var BARCODE = require('barcode');
var showBarcode = 1;

var SCANNER = require("scanner");

// Create a window to add the picker to and display it. 
var window = SCANNER.createScannerWindow();

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
		
		var label_caption = $.UI.create("Label", { 
			top: 0,
			text: items[i].caption,
			height: 60,
			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
		});
		
		var header = $.UI.create("View", {classes:['wfill','hsize']});
		var img_back = $.UI.create("ImageView", {width: 20, height: 20, left: 10, zIndex: 100, image: "/images/btn-back.png"});
		header.add(img_back);
		header.add(label_caption);
		img_back.addEventListener("click", closeWindow);
		var label_description = $.UI.create("Label",{
			classes:['wfill','hsize','h5','padding'],
			text: items[i].description
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
		
		var view_voucher = $.UI.create("View", {classes:['wfill','hsize','vert', 'padding'], borderWidth: 2, borderColor: "#ED1C24"});
		var label_voucher_title = $.UI.create("Label", {classes: ['wfill','hsize','padding'], textAlign: "center", text: "SalesAd Exclusive Voucher"});
		var view_hr = $.UI.create("View", {classes:['hr']});
		
		view_voucher.add(label_voucher_title);
		view_voucher.add(view_hr);
		console.log(isScan+" is scan");
			if(isScan == "1"){
				var voucher_description = $.UI.create("Label", {classes:['wfill','hsize','padding'], textAlign: "center", text: items[i].voucher_description});
				view_voucher.add(voucher_description);
				if(items[i].barcode != ""){
					var bcwv = BARCODE.generateBarcode(items[i].barcode);
					view_voucher.add(bcwv);
				}
				var label_subtitle = $.UI.create("Label", {classes:['wfill','hsize','padding','grey'], textAlign: "center", text: "Please present this voucher at payment counter to redeem"});
				view_voucher.add(label_subtitle);
			}else{
				var image_button = $.UI.create("ImageView", {classes:['wfill', 'hsize','padding'], image: "/images/Button_ScanQRCode.png"});
				var label_subtitle = $.UI.create("Label", {classes:['wfill','hsize','padding','grey'], textAlign: "center", text: "in participating stores to get Exclusive deals"});
				view_voucher.add(image_button);
				view_voucher.add(label_subtitle);
				image_button.addEventListener("click", QrScan);
			}

		row = $.UI.create('View', {id:"view"+counter, classes:['wfill','hfill','vert']});
		itemImageView.add(adImage); 
	 	
		row.add(header);
		row.add(itemImageView);
		row.add(label_description);
		console.log(items[i]);
		if(items[i].isExclusive == 1){
			var exclusive_icon = $.UI.create("ImageView", {classes:['hsize'], width: 40, right: 10, top:0, image:"/images/SalesAd Exclusive_Logo(Smaller).png"});
			itemImageView.add(exclusive_icon);
			row.add(view_voucher);
		}
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

function QrScan(){
	SCANNER.openScanner("1");
}

function closeWindow(){
	$.item_Details.close();
}

 
/************************
*******APP RUNNING*******
*************************/
getAdsImages();
$.item_Details.open();
