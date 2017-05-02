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
	var m_library = Alloy.createCollection('merchants');
	var merchant = m_library.getMerchantsById(args.m_id);
	if(OS_IOS){
		$.win.title = merchant.merchant_name;
	}else{
		$.pageTitle.text = merchant.merchant_name;
	}
	
	var win = Alloy.createController("_ad_listing", {m_id: args.m_id, type: "branch"}).getView(); 
	$.content.add(win);
}
function closeWindow(){
	COMMON.closeWindow($.location); 

}
Ti.App.addEventListener("ads:close",closeWindow);
$.btnBack.addEventListener('touchend', function(){ 
	COMMON.closeWindow($.win);  
}); 

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
