// load the Scandit SDK module
var scanditsdk = require("com.mirasense.scanditsdk"); 
 
var picker;
var window;

/***Private function***/
// Stops the scanner, removes it from the window and closes the latter.
var closeScanner = function() { 
	if (picker != null) {
		picker.stopScanning();
		//window.remove(picker);
	}
	window.close();
};


/***Public function***/
exports.closeScanner = function(){
	closeScanner();
};

exports.createScannerWindow = function(){
	return Titanium.UI.createWindow({   
		navBarHidden:true,
		fullscreen : true,
	});
};

exports.createScannerButton = function(){
	return Titanium.UI.createButton({
		width:200,
		height: 80,
		image: '/images/scan.png' 
	});
};
// Sets up the scanner and starts it in a new window.
/*********
 * 1 - scan and assigned resources and finish goods
 * 2 - scan to check the product info
 */
exports.openScanner = function(scanType) {
	 
	// Instantiate the Scandit SDK Barcode Picker view
	picker = scanditsdk.createView({
		width:"100%",
		height:"100%"
	});
	// Initialize the barcode picker, remember to paste your own app key here.
	picker.init("qt/U+huGEeSG62SYxtngPa7xVDA0BLRMw7gQLH8qAB0", 0);

	picker.showSearchBar(false);
	// add a tool bar at the bottom of the scan view with a cancel button (iphone/ipad only)
	picker.showToolBar(true);

	// Set callback functions for when scanning succeedes and for when the 
	// scanning is canceled.
	picker.setSuccessCallback(function(e) { 
		// 1 - scan and assigned resources and finish goods
		if(scanType == "1"){ 
			var barcode = e.barcode;
			var barRes = barcode.split('||');
			Ti.App.Properties.setString('sales'+barRes[0], '1'); 
			setTimeout(function(){ Ti.App.Properties.removeProperty('sales'+barRes[0]); }, 60000);
			Ti.App.fireEvent('getScanMerchant');
		}
		closeScanner();
	});
	picker.setCancelCallback(function(e) { 
		closeScanner();
	});

	window.add(picker);
	window.addEventListener('open', function(e) {
		// Adjust to the current orientation.
		// since window.orientation returns 'undefined' on ios devices 
		// we are using Ti.UI.orientation (which is deprecated and no longer 
	    // working on Android devices.)
		if(Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
    		//picker.setOrientation(Ti.UI.orientation);
		}	
		else {
			picker.setOrientation(window.orientation);
		}
// 		
		picker.setSize(Ti.Platform.displayCaps.platformWidth,  Ti.Platform.displayCaps.platformHeight);
		picker.startScanning();		// startScanning() has to be called after the window is opened. 
	});
	
	window.addEventListener('android:back', function (e) { 
		closeScanner(); 
	});

	window.open();
};

exports.init = function(win){
	window = win;
};

// disable the status bar for the camera view on the iphone and ipad
if(Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
	Titanium.UI.iPhone.statusBarHidden = true;
}


// Changes the picker dimensions and the video feed orientation when the
// orientation of the device changes.
Ti.Gesture.addEventListener('orientationchange', function(e) {
	window.orientationModes = [Titanium.UI.PORTRAIT, Titanium.UI.UPSIDE_PORTRAIT, 
				   Titanium.UI.LANDSCAPE_LEFT, Titanium.UI.LANDSCAPE_RIGHT];
	if (picker != null) {
		picker.setOrientation(e.orientation);
		picker.setSize(Ti.Platform.displayCaps.platformWidth, 
				Ti.Platform.displayCaps.platformHeight);
		// You can also adjust the interface here if landscape should look
		// different than portrait.
	}
});