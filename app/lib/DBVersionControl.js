/*********************
*** DB VERSION CONTROL ***
* 
* Current Version 1.1
* 
**********************/

// update user device token
exports.checkAndUpdate = function(e){
	var dbVersion = Ti.App.Properties.getString("dbVersion") || 1.4; 
	if (dbVersion == '1.0') {
	  	var panelList = Alloy.createCollection('contest'); 
		panelList.addColumn("preview_url", "TEXT");
		dbVersion = '1.1';
	}
	if (dbVersion == '1.1') {
	  	var panelList = Alloy.createCollection('ads'); 
		panelList.addColumn("express_date", "TEXT");
		panelList.addColumn("tnc", "TEXT");
		dbVersion = '1.2';
	}
	if (dbVersion == "1.2"){
		var model = Alloy.createCollection('ads'); 
		model.addColumn("sales_from", "TEXT");
		model.addColumn("sales_to", "TEXT");
		model.addColumn("featured_date", "TEXT");
		dbVersion = '1.3';
	}
	if (dbVersion == "1.3") {
		console.log("Version 1.3!");
		var model = Alloy.createCollection('xpress');
		model.addColumn("contact", "TEXT");
		dbVersion = '1.4';
		last_update_on = false;
	};
	Ti.App.Properties.setString("dbVersion", dbVersion);
};

