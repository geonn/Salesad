var args = arguments[0] || {};
var pageTitle;
var barcode = args.barcode || "";
var display = args.display_type || "1";
var qrcode = require('qrcode');
var BARCODE = require('barcode');
Alloy.Globals.naviPath.push($.win);
var loading = Alloy.createController("loading");

var checking = true;
function genCode(){
	var dateTimeNow = currentDateTime();
	var userQR = qrcode.QRCode({
		typeNumber: 10,
		errorCorrectLevel: 'M'
	});
	
	var qrcodeView = userQR.createQRCodeView({
		width: 200,
		height: 200,
		margin: 4, 
		text: barcode
	}); 
	var title = $.UI.create("Label",{classes:['wsize','hsize','h1'],text:barcode});
	var title1 = $.UI.create("Label",{classes:['wsize','hsize','h5'],text:barcode});
 	if(display == "1"){
 		$.b_code.add(title);	
 	}
 	if(display == "2"){
 		if(isNaN(barcode)){
  			$.b_code.add(title);						
 		}
 		else{
 			$.b_code.add(title1);
  			$.b_code.add(BARCODE.generateBarcode(barcode));	
 		}
 	} 	
 	if(display == "3"){
	  	$.qrCode.removeAllChildren();
		$.qrCode.add(qrcodeView);			
 	}	
 	if(display == "2,3"){	
 		if(isNaN(barcode)){		
  			$.b_code.add(title);						
 		}
 		else{
  			$.b_code.add(title1);			
  			$.b_code.add(BARCODE.generateBarcode(barcode));	
 		}
 	  	$.qrCode.removeAllChildren();
		$.qrCode.add(qrcodeView);			
 	}
}

function getAdDetails(){
	var custom = $.UI.create("Label", { 
		    text: "Voucher Code", 
		    color: '#ED1C24' 
	});	
	if(Ti.Platform.osname == "android"){ 
		$.pageTitle.add(custom);   
	}else{
		$.win.titleControl = custom;
	} 
};

function createWhoops(t,e){
	var box = Titanium.UI.createAlertDialog({
		title: t,
		message: e,
		ok: "ok"
	});
	box.show();
};

function init(){
	$.win.add(loading.getView());	
	loading.finish();
	getAdDetails();
	genCode();
}

init();
function closeWindow(){
	COMMON.createAlert("Exit","Confirm to exit now?\nYou can't undo this action.",function(ex){
		COMMON.closeWindow($.win); 
		createWhoops("Deal Redeemed!","Thanks for using our voucher.");
	});	
}
$.btnBack.addEventListener('click', closeWindow); 

$.win.addEventListener("close", function(){
	Ti.App.fireEvent('removeNav');
    $.destroy();
});
    
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}    

$.win.addEventListener('android:back', function (e) {
 	closeWindow();
});


