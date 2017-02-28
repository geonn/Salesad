// load the Scandit SDK module
var scanditsdk = require("com.mirasense.scanditsdk"); 
scanditsdk.appKey = "qt/U+huGEeSG62SYxtngPa7xVDA0BLRMw7gQLH8qAB0"; 
scanditsdk.cameraFacingPreference = 0; 
var picker;
var window;

/***Private function***/
// Stops the scanner, removes it from the window and closes the latter.
var closeScanner = function() {  
	if (picker != null) { 
		picker.stopScanning();
		//window.remove(picker); 
	} 
//	setTimeout(function() {
		window.close();
		window.remove(picker); 
		window.removeEventListener('open', openScannerWindow); 
	//}, 1);
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

function openScannerWindow(){  
		picker.setSize(Ti.Platform.displayCaps.platformWidth,  Ti.Platform.displayCaps.platformHeight);
		picker.startScanning();		// startScanning() has to be called after the window is opened.  
}

function checkExpired(m_id){
	var expire = Ti.App.Properties.getString('sales'+m_id);
	var currentDate = new Date();
	console.log(expire);
	console.log(typeof expire);
	if(expire != null && currentDate > expire){
		return true;
	}else if(expire == null){
		return true;
	}else{
		return false;
	}
}

function checkReward(m_id){
	var u_id = Ti.App.Properties.getString('u_id');
	if(typeof u_id == "undefined"){
		return;
	}
	if(checkExpired(m_id)){
		Ti.App.fireEvent("callbypost", {
			url: "doPointAction",
			new: true,
			params: {u_id: u_id, action: "add", purpose: 4},
			onload: function(ex){Ti.App.fireEvent("reward:refresh");}
		});
	}
}

// Sets up the scanner and starts it in a new window.
/*********
 * 1 - scan and assigned resources and finish goods
 * 2 - scan to check the product info
 * 3 - get contest pharmacy code
 * 4 - homepage scan nav to ad page
 */
exports.openScanner = function(scanType) {
	 
	// Instantiate the Scandit SDK Barcode Picker view
	picker = scanditsdk.createView({
		width:"100%",
		height:"100%"
	});
	 
	// Initialize the barcode picker, remember to paste your own app key here.
	picker.init();

	picker.showSearchBar(false);
	// add a tool bar at the bottom of the scan view with a cancel button (iphone/ipad only)
	picker.showToolBar(true);
	picker.setEan13AndUpc12Enabled(true);
	picker.setEan8Enabled(true);
	picker.setUpceEnabled(true);
	picker.setCode39Enabled(true);
	picker.setCode128Enabled(true);
	picker.setQrEnabled(true);
	picker.setDataMatrixEnabled(true);
	// Set callback functions for when scanning succeedes and for when the 
	// scanning is canceled.
	picker.setSuccessCallback(function(e) { 
		
		// 1 - scan and assigned resources and finish goods 
		var currentDate = new Date();
		currentDate.setDate(currentDate.getDate() + 1);
		if(scanType == "1"){ 
			var barcode = e.barcode; 
			var barRes = barcode.split('||');
			if(typeof barRes[2] != "undefined"){
				var page = Alloy.createController("voucher",{v_id: barRes[2]}).getView(); 
			  	page.open();
			  	page.animate({
					curve: Ti.UI.ANIMATION_CURVE_EASE_IN,
					opacity: 1,
					duration: 300
				});
			} 
			var barStr = 'sales'+barRes[0];
			console.log(barRes[0]);
			checkReward(barRes[0]);
			Ti.App.Properties.setString(barStr, currentDate);
			Ti.App.fireEvent('afterScan', {m_id: barRes[0]});
		}else if(scanType == "2"){
			var barcode = e.barcode; 
			var barRes = barcode.split('?');
			var params = barRes[1].split("&");
			if(typeof barRes[1] != "undefined"){
				Ti.App.fireEvent('updatePharmacy_code', {id: params[0], params: params[1]});
			}
		}else if(scanType == "4"){
			var barcode = e.barcode; 
			var barRes = barcode.split("||");
			if(typeof barRes[0] != "undefined"){
				var barStr = 'sales'+barRes[0];
				console.log(barRes[0]);
				checkReward(barRes[0]);
				Ti.App.Properties.setString(barStr, currentDate); 
			}
			console.log("here is type 4! dont get in");
			setTimeout(function(ex){
				var win = Alloy.createController("branch_ad", {m_id: barRes[0], from : "home"}).getView(); 
				COMMON.openWindow(win);
			}, 500);
		}
		console.log("why ~!");
		picker.stopScanning();
		window.close();
		//window.removeEventListener('open', openScannerWindow);
		//window.removeEventListener('open', openScannerWindow);
		//closeScanner();
		/*
		
		window.close(); 
		window.remove(picker);
		window.removeEventListener('open', openScannerWindow);*/
	});
	picker.setCancelCallback(function(e) { 
		picker.stopScanning();
		window.close(); 
		window.remove(picker);
		window.removeEventListener('open', openScannerWindow); 
		Ti.App.fireEvent('scanner_cancel');  
	});

	window.add(picker);
	window.addEventListener('open', openScannerWindow);
	
	window.addEventListener('android:back', function (e) {
		Ti.App.fireEvent('scanner_cancel'); 
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

 