var args = arguments[0] || {};

/** google analytics**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "settings",
		action: "view",
		label: "privacy and terms",
		value: 1
	}); 
	Alloy.Globals.tracker.trackScreen({
		screenName: "Privacy and Terms"
	}); 
}else{
	Alloy.Globals.tracker.addEvent({
        category: "settings",
		action: "view",
		label: "privacy and terms",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView('Privacy and Terms');
}
var clickTime = null;
/**Set Custom title**/
var custom = $.UI.create("Label", {  
    text: 'PRIVACY & TERMS', 
    color: '#ED1C24', 
    width: Ti.UI.SIZE 
 });
   
$.pageTitle.add(custom);  
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.tnc); 
}); 
