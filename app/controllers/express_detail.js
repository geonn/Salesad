var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var data;
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];

function render_page(){
	$.img.image = args.img_path;
	$.xpress_date.text = args.sales_from+" - "+args.sales_to;
	$.xpress_location.text = args.address;
	$.desc.text = args.description;
	$.owner_name.text = args.owner_name;
	$.category.text = args.categoryName;
	$.owner_img_path.image = args.owner_img_path;
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
