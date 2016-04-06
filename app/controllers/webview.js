var args = arguments[0] || {};
var id = args.id;
var loading = Alloy.createController("loading");
var title = args.title;
console.log(id);
//load model

function init(){
	$.win.add(loading.getView());
	loading.start();
	$.webview.url = "http://salesad.my/contest/index/"+id;
	$.win.title = title;
}

$.webview.addEventListener("load", function(e){
	loading.finish();
});

init();

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 