var args = arguments[0] || {};
var type = args.type || "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;
var ads_counter = 0;
var loading = false;
var type = args.type;
var data;

Alloy.Globals.naviPath.push($.win);

init();


function init(){
	var win = Alloy.createController("_ad_listing", {m_id: args.m_id, type: "branch"}).getView(); 
	$.content.add(win);
}

$.btnBack.addEventListener('touchend', function(){ 
	COMMON.closeWindow($.win);  
}); 