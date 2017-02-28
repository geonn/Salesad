var args = arguments[0] || {};
var nav = Alloy.Globals.navMenu; 


$.btnBack.addEventListener('click', function(){ 
	nav.closeWindow($.favoriteAd); 
}); 