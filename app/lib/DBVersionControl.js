/*********************
*** DB VERSION CONTROL ***
* 
* Current Version 1.0
* 
**********************/

// update user device token
exports.checkAndUpdate = function(e){
	var dbVersion = Ti.App.Properties.getString("dbVersion");
	if (dbVersion = '1.0') {
	  // do 1.1 upgrade
	  /*var banner_model = Alloy.createCollection('banners'); 
	  banner_model.dropTable();
	  banner_model.createTable();*/
	  //dbVersion = '1.1';
	}
	Ti.App.Properties.setString("dbVersion", dbVersion);
};

