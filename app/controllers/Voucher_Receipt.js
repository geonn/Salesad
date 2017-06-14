var args = arguments[0] || {};
var pageTitle;
var barcode = args.barcode || "";
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
	console.log(barcode);
	$.b_code.add(BARCODE.generateBarcode(barcode));	
	console.log("barcode"+barcode);
 	//removeAllChildren($.qrCode);
 	$.qrCode.removeAllChildren();
	$.qrCode.add(qrcodeView);	
}

function getAdDetails(){
	console.log("asdf");
	var custom = $.UI.create("Label", { 
		    text: "Voucher Receipt", 
		    color: '#ED1C24' 
	});	
	if(Ti.Platform.osname == "android"){ 
		$.pageTitle.add(custom);   
	}else{
		$.win.titleControl = custom;
	} 
};


function init(){
	$.win.add(loading.getView());	
	loading.finish();
	getAdDetails();
	genCode();
}

init();
function closeWindow(){
	COMMON.createAlert("Exit","Confirm to exit now?\nThis action is not undoable.",function(ex){
		COMMON.closeWindow($.win); 
		alert("Thanks for using our voucher.");
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


