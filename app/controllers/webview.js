var args = arguments[0] || {};
var id = 0;
var loading = Alloy.createController("loading");
var title = "";
console.log(id);
var pharmacy_code = 0;
//load model

function updatePharmacy_code(e){
	console.log(e.pharmacy_code+" "+e.id);
	pharmacy_code = e.pharmacy_code;
	var contest = Alloy.createCollection('contest'); 
	var ads = contest.getDataById(e.id);
	console.log(ads.name+" contest name");
	title = ads.name;
	id = e.id;
	init();
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	$.webview.url = "http://salesad.my/contest/index/"+id+"?pharmacy_code="+pharmacy_code;
	console.log("http://salesad.my/contest/index/"+id+"?pharmacy_code="+pharmacy_code);
	$.win.title = title;
}

$.webview.addEventListener("load", function(e){
	loading.finish();
});

var SCANNER = require("scanner");
var window = SCANNER.createScannerWindow();
var button = SCANNER.createScannerButton(); 
SCANNER.init(window);	
SCANNER.openScanner("2");

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

Ti.App.addEventListener("updatePharmacy_code", updatePharmacy_code);

$.win.addEventListener("close", function (e){
	Ti.App.removeEventListener("updatePharmacy_code", updatePharmacy_code);
});
