var args = arguments[0] || {};
var e_id = args.e_id;
var u_id = Ti.App.Properties.getString('u_id') || "";
var data;
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];

function render_page(){
	var img_path = (e_id == 1)?"images/dummy/App_Mockup_v3_Detail_Scrub.jpg":"images/dummy/App_Mockup_v3_Detail_Bata.jpg";
	console.log(e_id+" "+img_path);
	$.img.image = img_path;
}

function refresh(){
	render_page();
	loading.finish();
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	refresh();
}

init();

function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160))+'dp';
}

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 
