/*********************
*** DB VERSION CONTROL ***
* 
* Current Version 1.1
* 
**********************/

// update user device token
exports.checkAndUpdate = function(e){
	var dbVersion = Ti.App.Properties.getString("dbVersion") || 1.2; 
	if (dbVersion == '1.0') {
	  	var panelList = Alloy.createCollection('contest'); 
		panelList.addColumn("preview_url", "TEXT");
		dbVersion = '1.1';
	}
	dbVersion = '1.1';
	if (dbVersion == '1.1') {
	  	var panelList = Alloy.createCollection('ads'); 
		panelList.addColumn("express_date", "DATE");
		panelList.addColumn("tnc", "TEXT");
		dbVersion = '1.2';
	}
	Ti.App.Properties.setString("dbVersion", dbVersion);
};

