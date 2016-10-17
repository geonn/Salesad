/*********************
*** DB VERSION CONTROL ***
* 
* Current Version 1.1
* 
**********************/

// update user device token
exports.checkAndUpdate = function(e){
	var dbVersion = Ti.App.Properties.getString("dbVersion") || 1.1; 
	if (dbVersion == '1.0') {
	  	var panelList = Alloy.createCollection('contest'); 
		panelList.addColumn("preview_url", "TEXT");
		dbVersion = '1.1';
	}
	dbVersion = '1.1';
	if (dbVersion == '1.1') {
	  	var panelList = Alloy.createCollection('items'); 
		panelList.addColumn("isExclusive", "INTEGER");
		
		var merchant = Alloy.createCollection('merchants'); 
		merchant.addColumn("address", "TEXT");
		
		var ads = Alloy.createCollection('ads'); 
		ads.addColumn("recommended", "INTEGER");
		ads.addColumn("branch", "TEXT");
		dbVersion = '1.2';
	}
	Ti.App.Properties.setString("dbVersion", dbVersion);
};

