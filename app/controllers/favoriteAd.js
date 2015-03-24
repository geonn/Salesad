var args = arguments[0] || {};
var nav = Alloy.Globals.navMenu; 

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "ads",
	action: "view",
	label: "favourite ads",
	value: 1
});
Alloy.Globals.tracker.trackScreen("Favourite Ads");

$.btnBack.addEventListener('click', function(){ 
	nav.closeWindow($.favoriteAd); 
}); 