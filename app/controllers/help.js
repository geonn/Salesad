var args = arguments[0] || {};
var nav = Alloy.Globals.navMenu; 

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "settings",
	action: "view",
	label: "help",
	value: 1
});
Alloy.Globals.tracker.trackScreen("Help");

/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'HELP', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
  
$.help.titleControl = custom;

$.btnBack.addEventListener('click', function(){ 
	nav.closeWindow($.help); 
}); 