var args = arguments[0] || {};
var nav = Alloy.Globals.navMenu; 

/** google analytics**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "ads",
		action: "view",
		label: "favourite ads",
		value: 1
	}); 
	Alloy.Globals.tracker.trackScreen({
		screenName: "Favourite Ads"
	});
}else{ 
	Alloy.Globals.tracker.addEvent({
        category: "ads",
		action: "view",
		label: "favourite ads",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView("Favourite Ads");
}
$.btnBack.addEventListener('click', function(){ 
	nav.closeWindow($.favoriteAd); 
}); 