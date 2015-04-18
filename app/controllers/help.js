var args = arguments[0] || {}; 

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "settings",
	action: "view",
	label: "help",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Help"
});
/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'HELP', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });

if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);    
}else{
	$.help.titleControl = custom;
}    

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.help); 
}); 