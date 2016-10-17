var args = arguments[0] || {};
var action_type = args.action_type;// "1 - popular":"0 - recent";
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];
var action_text = "Recent";
var cell_width;
if(action_type == "1"){
	action_text = "Popular";
}
var custom = $.UI.create("Label", { 
	    text: action_text, 
	    color: '#ED1C24',
	    font: { fontWeight: 'bold'},
});
	
if(Ti.Platform.osname == "android"){ 
		COMMON.removeAllChildren($.pageTitle);
		$.pageTitle.add(custom);   
}

function navTo(e){
	var e_id = parent({name: "e_id"}, e.source);
	console.log(e_id+" ez");
	if(e_id == 3){
		var win = Alloy.createController("ad", {a_id: 315}).getView(); 
		COMMON.openWindow(win); 
	}else{
		var win = Alloy.createController("express_detail", {e_id: e_id}).getView(); 
		COMMON.openWindow(win); 
	}
}
	
function init(){
	$.win.add(loading.getView());
	loading.start();
	
	var pwidth = Titanium.Platform.displayCaps.platformWidth;
	if(OS_ANDROID){
		cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	}else{
		cell_width = Math.floor(pwidth / 2) - 15;
	}
	console.log(cell_width);
	var child = $.content.getChildren();
	for (var i=0; i < child.length; i++) {
		if(child[i].e_id != 3){
			child[i].width = cell_width;
		}
	};
	//setTimeout(function(e){render_listingBytype();}, 1000);
}

function navToAd(e){
	var a_id = parent({name: "a_id"}, e.source);
	var win = Alloy.createController("ad", {a_id: a_id, from : "home_all"}).getView(); 
	COMMON.openWindow(win); 
}

// convert pixel to dp.
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160))+'dp';
}

init();

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 