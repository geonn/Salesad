var args = arguments[0] || {};

/**
 * function to start the loading animation
 */

$.finish = function(_callback) {
	/*$.rocketFlight.opacity = 0.1;
	
	$.rocketFlight.start();
	
	$.rocketFlight.animate({
		opacity: 1,
		duration: 500
	});
	*/
	$.rocketSmoke.stop();
	$.rocketSmoke.animate({
		duration: 500,
		delay: 500,
		right: -500,
		curve: Ti.UI.ANIMATION_CURVE_EASE_IN
	}, function() {
		
		
		/*$.rocketFlight.animate({
			top: -130,
			duration: 750,
			curve: Ti.UI.ANIMATION_CURVE_EASE_IN
		});*/
		console.log("got call stop and callback?");
		Ti.App.fireEvent('loader:closeView');
		$.overlay.animate({
			opacity: 0,
			duration: 750
		}, function() {
			$.rocketFlight.stop();
			console.log('close and callback');
			_callback && _callback();
		});
	});
};

$.start = function() {
	//API.loadAPIBySequence({});
	console.log("start loading api");
	//$.overlay.opacity = 0;
	$.rocketSmoke.opacity = 0.1;
	$.rocketFlight.opacity = 0;
	$.rocketFlight.top = null;
	
	$.rocketFlight.stop();
	$.rocketSmoke.start();
	
	$.overlay.animate({
		opacity: 0.7,
		duration: 250
	});
	
	$.rocketSmoke.animate({
		opacity: 1,
		duration: 500
	});
};

/*
 * exposed function to finish the loading animation. Animates the rocket off the screen.
 */

function windowClose(){
	console.log("rocket window close");
	$.rocket.close();
}
//load API loadAPIBySequence
//API.bannerListing();


Ti.App.addEventListener('app:update_loading_text', update_loading_text);
console.log("loader:closeView ready");
Ti.App.addEventListener('loader:closeView', windowClose);

function update_loading_text(e){
	$.loading_text.text = e.text;
}

$.rocket.addEventListener("close", function(e){
	Ti.App.removeEventListener('app:update_loading_text', update_loading_text);
	Ti.App.removeEventListener('loader:closeView', windowClose);
});

$.rocket.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.rocket); 
});

