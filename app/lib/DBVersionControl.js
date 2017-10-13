/*********************
*** DB VERSION CONTROL ***
* 
* Current Version 1.1
* 
**********************/

// update user device token
exports.checkAndUpdate = function(e){
	var dbVersion = Ti.App.Properties.getString("dbVersion") || 1.9; 
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
		var model = Alloy.createCollection('xpress');
		model.addColumn("contact", "TEXT");
		dbVersion = '1.4';
	}
	if (dbVersion == "1.4") {
		var model = Alloy.createCollection('voucher');
		model.addColumn("left", "INTEGER");
		model.addColumn("thumb_image", "");
		var model_ads = Alloy.createCollection('ads');
		model_ads.addColumn("category", "INTEGER");
		dbVersion = '1.5';
	}
	if(dbVersion == "1.5") {
		var model = Alloy.createCollection('voucher');
		model.addColumn("a_id", "INTEGER");
		model.addColumn("position", "INTEGER");
		dbVersion = '1.6';
	}
	if(dbVersion == "1.6") {
		var model = Alloy.createCollection('ads');
		model.addColumn("img_thumb", "TEXT");
		dbVersion = "1.7";
	}
	if(dbVersion == "1.7") {
		var model = Alloy.createCollection('items');
		model.addColumn("img_thumb", "TEXT");
		dbVersion = "1.8";
		last_update_on = false;
	}
	dbVersion = "1.8";
	if(dbVersion == "1.8") {
		var model = Alloy.createCollection('favorites');
		model.addColumn("merchant_name", "TEXT");
		model.addColumn("marchant_thumb", "TEXT");
		
		dbVersion = "1.9";
		last_update_on = false;
	}
	Ti.App.Properties.setString("dbVersion", dbVersion);
};

