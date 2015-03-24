var args = arguments[0] || {};

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "settings",
	action: "view",
	label: "about",
	value: 1
});
Alloy.Globals.tracker.trackScreen("About");

/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'ABOUT', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
  
$.description.titleControl = custom;

$.btnBack.addEventListener('click', function(){ 
	var nav = Alloy.Globals.navMenu; 
	nav.closeWindow($.description); 
}); 