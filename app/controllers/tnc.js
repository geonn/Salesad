var args = arguments[0] || {};

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "settings",
	action: "view",
	label: "privacy and terms",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Privacy and Terms"
}); 
var clickTime = null;
/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'PRIVACY & TERMS', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
   
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);    
}else{
	$.tnc.titleControl = custom;
} 
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.tnc); 
}); 
