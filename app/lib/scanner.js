// load the Scandit SDK module
var scanditsdk = require("com.mirasense.scanditsdk"); 
if(Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
	Titanium.UI.iPhone.statusBarHidden = true;
}
scanditsdk.appKey = "qt/U+huGEeSG62SYxtngPa7xVDA0BLRMw7gQLH8qAB0"; 
scanditsdk.cameraFacingPreference = 0; 

exports.openScanner = function(scanType) {
	// First set the app key and which direction the camera should face.

	// Only after setting the app key instantiate the Scandit SDK Barcode Picker view
	var picker = scanditsdk.createView({
		width:"100%",
		height:"100%"
	});
	// Before calling any other functions on the picker you have to call init()
	picker.init();

	// add a tool bar at the bottom of the scan view with a cancel button (iphone/ipad only)
	picker.showToolBar(true);

	// Create a window to add the picker to and display it. 
	var window = Titanium.UI.createWindow({  
			title:'Scandit SDK',
			navBarHidden:true
	});
	
	// Set callback functions for when scanning succeeds and for when the 
	// scanning is canceled. This callback is called on the scan engine's
	// thread to allow you to synchronously call stopScanning or
	// pauseScanning. Any UI specific calls from within this function 
	// have to be issued through setTimeout to switch to the UI thread
	// first.
	picker.setSuccessCallback(function(e) {
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
			console.log(barRes[0]+" scanner mid");
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
				console.log(barRes[0]+" barRes[0]");
				var win = Alloy.createController("branch_ad", {m_id: barRes[0], from : "home"}).getView(); 
				COMMON.openWindow(win);
			}, 500);
		}
		picker.stopScanning();
		
		setTimeout(function() {
			window.close();
			window.remove(picker);
			console.log("success (" + e.symbology + "): " + e.barcode);
		}, 1);
	});
	picker.setCancelCallback(function(e) {
		picker.stopScanning();
		window.close();
		window.remove(picker);
	});

	window.add(picker);
	window.addEventListener('open', function(e) {
		picker.startScanning();		// startScanning() has to be called after the window is opened. 
	});
	window.open();
};

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