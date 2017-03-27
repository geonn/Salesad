var args = arguments[0] || {};
var id = 0;
var loading = Alloy.createController("loading");
var title = "";
console.log(id);
var params = [];
var pharmacy_code = 0;
//load model

function updatePharmacy_code(e){
	params =  e.params.split(",");
	var contest = Alloy.createCollection('contest'); 
	var ads = contest.getDataById(e.id); 
	title = ads.name;
	id = e.id;
	render_webview();
}

function scanner_cancel(){ 
	$.win.close();
}

function render_webview(){
	loading.start();
	var p = "";
	for (var i=0; i < params.length; i++) {
	  p = p + params[i]+"&";
	};
	$.webview.url = "http://salesad.my/contest/index/"+id+"?"+p; 
	$.win.title = title;
}

function windowClose(){
	$.win.close();
}

function init(){
	if(typeof args.url != "undefined"){
		$.webview.url = args.url;
	}else{
		$.win.add(loading.getView());
		var SCANNER = require("scanner");
		var window = SCANNER.createScannerWindow();
		var button = SCANNER.createScannerButton(); 
		SCANNER.init(window);	
		setTimeout(function(e){SCANNER.openScanner("2");}, 1000);
	}
}

init();

$.webview.addEventListener("load", function(e){
	loading.finish();
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

Ti.App.addEventListener("updatePharmacy_code", updatePharmacy_code);
Ti.App.addEventListener("scanner_cancel", scanner_cancel);

$.win.addEventListener("close", function (e){
	Ti.App.removeEventListener("updatePharmacy_code", updatePharmacy_code);
	Ti.App.removeEventListener("scanner_cancel", scanner_cancel);
});

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
