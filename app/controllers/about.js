var args = arguments[0] || {};

/** google analytics**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "settings",
		action: "view",
		label: "about",
		value: 1
	});
	Alloy.Globals.tracker.trackScreen({
	    screenName: "About"
	});
}else{ 
	Alloy.Globals.tracker.addEvent({
        category: "settings",
		action: "view",
		label: "about",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView('About');
}
/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'ABOUT', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
  
 
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.description.titleControl = custom; 
} 
$.btnBack.addEventListener('click', function(){  
	COMMON.closeWindow($.description); 
}); 