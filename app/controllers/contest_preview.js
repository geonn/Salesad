var args = arguments[0] || {};
var id = 0;
var loading = Alloy.createController("loading");
//load model

function navToWeb(){
	var win = Alloy.createController("webview").getView(); 
	COMMON.openWindow(win);
}

function render_webview(e){
	var res = JSON.parse(e);
	console.log(res.data[0]);
	$.webview.url = res.data[0].preview_url;
}

function windowClose(){
	$.win.close();
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	API.callByPost({url: "getContestListUrl"}, render_webview);
}

init();

$.webview.addEventListener("load", function(e){
	loading.finish();
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener("close", function (e){
	
});
