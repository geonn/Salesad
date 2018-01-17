var args = arguments[0] || {};
var v_id = args.v_id || 0; 
var BARCODE = require('barcode');

function render_voucher(e){
	var bcwv = BARCODE.generateBarcode(e.barcode);
	$.discount.text = e.discount;
	$.title.text = e.title;
	$.description.text = e.description;
	//var bcwv = BARCODE.generateBarcode("123123123123");
	$.inner_box.add(bcwv);
}

function refresh(){
	API.getVoucherById(v_id, render_voucher);
	//API.getVoucherById(v_id, render_voucher);
}

function init(){
	refresh();
}

init();

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

$.item_Details.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.item_Details); 
});
