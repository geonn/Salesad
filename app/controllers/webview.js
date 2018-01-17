var args = arguments[0] || {};
var id = 0;
var loading = Alloy.createController("loading");
var title = "";
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
	console.log(args);
	if(typeof args.web_title != "undefined"){
		if(OS_IOS){
			$.win.title = args.web_title;
		}else{
			$.pageTitle.text = args.web_title;
		}
	}
	if(typeof args.url != "undefined"){
		$.webview.url = args.url;
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
