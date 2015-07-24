/*********************
*** SETTING / API ***
**********************/
var API_DOMAIN = "salesad.freejini.com.my";
var XHR = require("xhr");
var xhr = new XHR();

// APP authenticate user and key
var USER  = 'salesad';
var KEY   = '06b53047cf294f7207789ff5293ad2dc';
var getCategoryList            = "http://"+API_DOMAIN+"/api/getCategoryList?user="+USER+"&key="+KEY;
var getFeaturedBanner   	   = "http://"+API_DOMAIN+"/api/getFeaturedBannerList?user="+USER+"&key="+KEY;
var getMerchantListByType      = "http://"+API_DOMAIN+"/api/getMerchantListByType?user="+USER+"&key="+KEY;
var getMerchantListByCategory  = "http://"+API_DOMAIN+"/api/getMerchantListByCategory?user="+USER+"&key="+KEY;
var getAdsByCategoryList  = "http://"+API_DOMAIN+"/api/getAdsByCategoryList?user="+USER+"&key="+KEY;

var searchNearbyMerchant       = "http://"+API_DOMAIN+"/api/searchNearbyMerchant?user="+USER+"&key="+KEY;
var getAdsDetailsById = "http://"+API_DOMAIN+"/api/getAdsDetailsById?user="+USER+"&key="+KEY;
var searchResult               = "http://"+API_DOMAIN+"/api/searchResult?user="+USER+"&key="+KEY;
var updateToken  	     	   = "http://"+API_DOMAIN+"/api/updateToken?user="+USER+"&key="+KEY;
var updateUserFavourite  	   = "http://"+API_DOMAIN+"/api/updateUserFavourite?user="+USER+"&key="+KEY;
var updateUserFromFB  		   = "http://"+API_DOMAIN+"/api/updateUserFromFB?user="+USER+"&key="+KEY;
exports.getUserList       = "http://"+API_DOMAIN+"/api/getUserList?user="+USER+"&key="+KEY;
exports.getCategoryList   = getCategoryList;
//exports.getMerchantListByCategory      = "http://"+API_DOMAIN+"/api/getMerchantListByType?user="+USER+"&key="+KEY+"type=category";

exports.forgotPassword    = "http://"+API_DOMAIN+"/api/doForgotPassword?user="+USER+"&key="+KEY;
exports.registerUser      = "http://"+API_DOMAIN+"/api/registerUser?user="+USER+"&key="+KEY;
exports.loginUser         = "http://"+API_DOMAIN+"/api/loginUser?user="+USER+"&key="+KEY;
exports.logoutUser        = "http://"+API_DOMAIN+"/api/logoutUser?user="+USER+"&key="+KEY;
exports.updateUserProfile = "http://"+API_DOMAIN+"/api/updateUserProfile?user="+USER+"&key="+KEY;
exports.updateUserPassword= "http://"+API_DOMAIN+"/api/updateUserPassword?user="+USER+"&key="+KEY;
exports.getImagesByAds    = "http://"+API_DOMAIN+"/api/getImagesByAds?user="+USER+"&key="+KEY;
/*********************
**** API FUNCTION*****
**********************/
exports.updateUserFromFB = function(e, mainView){ 
	var url = updateUserFromFB+"&email="+e.email+"&fbid="+e.fbid+"&link="+e.link+"&name="+e.name+"&gender="+e.gender;
	//console.log(url);
	var client = Ti.Network.createHTTPClient({
		// function called when the response data is available
		onload : function(e) {
			var res = JSON.parse(this.responseText);
	
		    if(res.status == "success"){ 
		       	var member = Alloy.createCollection('member'); 
				member.updateUserSession(res.data.u_id, res.data.username, res.data.fullname, res.data.email, res.data.session);
	          
	         	/** User session**/
	         	Ti.App.Properties.setString('u_id', res.data.u_id);
				Ti.App.Properties.setString('session', res.data.session);
	         	Ti.App.Properties.setString('facebooklogin', 1);
	         	 
	         	//API.updateNotificationToken(); 
				COMMON.closeWindow(mainView.login); 
	         	 
	         	var win = Alloy.createController("profile").getView(); 
				COMMON.openWindow(win); 
				COMMON.hideLoading();
				 
		    }
		},
		// function called when an error occurs, including a timeout
		onerror : function(e) {
		},
		timeout : 7000  // in milliseconds
	});
	// Prepare the connection.
	client.open("GET", url);
	 // Send the request.
	client.send();  
};

// update user device token
exports.updateNotificationToken = function(e){
	var deviceToken = Ti.App.Properties.getString('deviceToken');
	var u_id = Ti.App.Properties.getString('u_id');
	var notification = Ti.App.Properties.getString('notification'); 
	if(deviceToken != ""){
		
		var url = updateToken+"&token="+deviceToken+"&u_id="+u_id+"&status="+notification;
		//console.log(url);
		var client = Ti.Network.createHTTPClient({
		     // function called when the response data is available
		     onload : function(e) {
		    
		       var res = JSON.parse(this.responseText);
	
		       if(res.status == "success"){
		       	
		       }
		     },
		     // function called when an error occurs, including a timeout
		     onerror : function(e) {
		     },
		     timeout : 7000  // in milliseconds
		 });
		 // Prepare the connection.
		 client.open("GET", url);
		 // Send the request.
		 client.send(); 
	}
	
};

// update user favourite list
exports.updateUserFavourite = function(e){
	/** User session**/
	var deviceToken = Ti.App.Properties.getString('deviceToken');
	 
	var url = updateUserFavourite+"&token="+deviceToken+"&m_id="+e.m_id+"&a_id="+e.a_id+"&status="+e.status;   
	var client = Ti.Network.createHTTPClient({
	    // function called when the response data is available
	    onload : function(e) {
	   
	      var res = JSON.parse(this.responseText);
	
	      if(res.status == "success"){
	      	
	      }
	    },
	    // function called when an error occurs, including a timeout
	    onerror : function(e) {
	    },
	    timeout : 7000  // in milliseconds
	});
	// Prepare the connection.
	client.open("GET", url);
	// Send the request.
	client.send(); 
	
	
};

exports.loadMerchantListByCategory = function (ex){
	//console.log("load merchant by category"+ex);
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById(100+ex);
	var last_updated ="";
	
	var library = Alloy.createCollection('categoryAds'); 
	var existing_id = library.getExistingId();
	
	if(isUpdate != "" ){
		last_updated = isUpdate.updated;
	} 
	var url = getMerchantListByCategory+"&category_id="+ex+"&last_updated="+last_updated;
	//console.log(url);
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	    
	       var res = JSON.parse(this.responseText);

	       if(res.status == "success"){
	       	/**reset current category**/
	       	var library = Alloy.createCollection('categoryAds'); 
			library.resetCategoryAds(ex);
			
			/**load new set of category ads from API**/
	       	var arr = res.data;
	       	arr.forEach(function(entry) {
	       		//console.log(entry);
				var categoryAds = Alloy.createModel('categoryAds', {
			        m_id    : entry.m_id,
			        cate_id   : ex
			    });
			    categoryAds.save();
			    
			    //Save merchant info
	       		var merchant = Alloy.createCollection('merchants');
				merchant.saveMerchants(entry.m_id, entry.u_id, entry.parent, entry.merchant_name, entry.mobile, entry.area, entry.state_key, entry.state_name, entry.img_path, entry.longitude, entry.latitude);
	         	
			});
			
			if(res.remove){
				library.removeCategoryAds(res.remove); 
			}
			
			checker.updateModule(100+ex,"loadMerchantListByCategory",currentDateTime());
			//console.log(ex);
			Ti.App.fireEvent('app:category_detailCreateGridListing', {cate_id: ex});
	       }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	//console.log("API loadMerchantListByCategory fail, skip sync with server");
	     	Ti.App.fireEvent('app:category_detailCreateGridListing', {cate_id: ex});
	     },
	     timeout : 7000  // in milliseconds
	 });
	 if(Ti.Platform.osname == "android"){
	 	client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	 }
	 
	 client.open("POST", url);
	 // Send the request.
	client.send({list: existing_id});
};

// load featured banner
exports.bannerListing = function (type){
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("2");
	var library = Alloy.createCollection('banners'); 
	var existing_id = library.getExistingId();
	var last_updated ="";
	if(isUpdate != "" ){
		last_updated = isUpdate.updated;
	} 
	var url = getFeaturedBanner;//+"&last_updated="+last_updated;
	//console.log(url);
	
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	    
	       var res = JSON.parse(this.responseText); 
	       //console.log(res);
	       if(res.status == "success"){
	       	/**reset current category**/
			library.resetBanner();
			
			/**load new set of category from API**/
	       	var arr = res.data;
	       	arr.forEach(function(entry) {
	       		library.saveBanner(entry); 
			});
			
			if(res.remove){
				library.removeBanner(res.remove); 
			}
			
			checker.updateModule("2","getFeaturedBanner",currentDateTime());
			Ti.App.fireEvent('app:bannerListing');
	       }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) { 
	     	Ti.App.fireEvent('app:bannerListing');
	     },
	     timeout : 7000  // in milliseconds
	 });
	 // Prepare the connection.
	 if(Ti.Platform.osname == "android"){
	 	client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	 }
 
	 client.open("POST", url);
	 // Send the request.
	client.send({list: existing_id});  
};

//abandoned function
exports.loadMerchantListByType = function (type){
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("3");
	var last_updated ="";
	if(isUpdate != "" ){
		last_updated = isUpdate.updated;
	} 
	var url = getMerchantListByType+"&type="+type+"&last_updated="+last_updated;
	
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	    
	       var res = JSON.parse(this.responseText);
	       var arr = res.data;
	       if(res.status == "success"){
	       	
	       	if(type == "featured"){
	       		/**reset**/
		       	var library = Alloy.createCollection("featured"); 
		       	library.resetFeatured();
	       	}
	       	
	       	if(type == "recent"){
	       		/**reset**/
		       	var library = Alloy.createCollection("recent"); 
		       	library.resetRecent();
	       	}
	       
			if(type == "popular"){
	       		/**reset**/
		       	var library = Alloy.createCollection("popular"); 
		       	library.resetPopular();
	       	}
	       	
	       	if(type == "favoriteAd"){
	       		/**reset**/
		       	//var library = Alloy.createCollection("popular"); 
		       	//library.resetPopular();
	       	}
	       
			/**load new set of category from API**/
	       	var arr = res.data;
	       	arr.forEach(function(entry) {
	       		
	       		//Save Type List
	       		var typeList = Alloy.createModel(type, {
					m_id    : entry.m_id
				});
				typeList.save();
					
	       		//Save merchant info
	       		var merchant = Alloy.createCollection('merchants'); 
				merchant.saveMerchants(entry.m_id, entry.u_id, entry.parent, entry.merchant_name, entry.mobile, entry.area, entry.state_key, entry.state_name, entry.img_path, entry.longitude, entry.latitude);
	         	
				//Save branches info
			    var branches = entry.branch; 
			    
			    if(branches.length > 0){
			    	branches.forEach(function(branch) {
			    		var br = Alloy.createCollection('branches'); 
						br.saveBranches( branch.b_id, branch.m_id, branch.name,branch.mobile, branch.area, branch.state_key,branch.state, branch.longitude, branch.latitude);
			    	});
			    }
			});
			checker.updateModule("3","getMerchantListByType",currentDateTime());
			Ti.App.fireEvent('app:triggerAdsType', {types : type, pullFromServer : false});
	       }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     },
	     timeout : 7000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
};

//search user nearby
exports.searchNearbyMerchant = function(lat,long){
	
	var url = searchNearbyMerchant+"&longitude="+long+"&latitude="+lat+"&dist=8";

	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	       var res = JSON.parse(this.responseText);
	       var arr = res.data;
	       if(res.status == "success"){
			Ti.App.fireEvent('app:nearbyMerchantResult', res);
	       }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     },
	     timeout : 7000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
};


//load ads & item search
exports.searchAdsItems = function(str){
	var url = searchResult+"&search="+str;
	
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	    
	       var res = JSON.parse(this.responseText);
	       var arr = res.data;
	       var search = [];
	       if(res.status == "success"){
	       	
			/**load new set of category from API**/
	       	var arr = res.data;
	       
			Ti.App.fireEvent('app:searchRes', {result : arr});
	       }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     },
	     timeout : 7000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
	
};

exports.loadAdsByCategory = function(cate_id){
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById(200+cate_id);
	var last_updated ="";
	if(isUpdate != "" ){
		last_updated = isUpdate.updated;
	}
	var url = getAdsByCategoryList+"&category_id="+cate_id+"&last_updated="+last_updated;
	console.log(url);
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	    
	       var res = JSON.parse(this.responseText);
			
	       var arr = res.data;
	       
	       if(res.status == "success"){
	       	/**reset current category**/
	       
	       	var arr = res.data;
	       	arr.forEach(function(entry) {
			     var ads = Alloy.createCollection('ads'); 
				 var needRefresh = ads.saveAds(entry.a_id, entry.m_id, entry.name, entry.template_id, entry.description,entry.app_background,entry.youtube, entry.img_path, entry.status, entry.activate_date, entry.expired_date, entry.created, entry.updated);
			         	
			     //Save item info
				 var items = entry.item;
				 var it = Alloy.createCollection('items'); 
				 it.resetItem(entry.a_id);	    
				 if(items.length > 0){
					items.forEach(function(item) {
						it.saveItem( item.i_id, item.a_id, item.price,item.barcode,item.caption, item.img_path);
					});
				 }		
			});
			checker.updateModule(200+cate_id,"getAdsByCategoryList",currentDateTime());
			//console.log("ads updated"+cate_id);
			setTimeout(function () {
				Ti.App.fireEvent('app:adsUpdated', {cate_id: cate_id});
			}, 1000);
	       }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	//console.log("API getAdsByCategoryList fail, skip sync with server");
	     	Ti.App.fireEvent('app:adsUpdated', {cate_id: cate_id});
	     },
	     timeout : 7000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
	
};

//load Ads details and items
exports.loadAdsDetails = function(m_id, a_id){
    var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("4");
	var last_updated ="";
	if(isUpdate != "" ){
		last_updated = isUpdate.updated;
	} 
	
	var deviceToken = Ti.App.Properties.getString('deviceToken');
	
	if(a_id != ""){
		var url =  getAdsDetailsById +"&m_id="+m_id+"&a_id="+a_id+"&token="+deviceToken+"&last_updated="+last_updated;
	}else{
		var url =  getAdsDetailsById +"&m_id="+m_id+"&token="+deviceToken+"&last_updated="+last_updated;
	}
 	//console.log(url);
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	        var res = JSON.parse(this.responseText);
	       
	       var arr = res.data;
	       if(res.status == "success"){
	       		 var arr = res.data;
	       		 
	       		 if(arr == ""){
	       		 	//return;
	       		 }
	       		 /**
			     var ads = Alloy.createCollection('ads'); 
				 var needRefresh = ads.saveAds(arr.a_id, arr.m_id, arr.name, arr.template_id, arr.description,arr.app_background, arr.img_path);
			         	
			     //Save item info
				 var items = arr.item; 
				 var it = Alloy.createCollection('items'); 
				 it.resetItem(arr.a_id);	    
				 if(items.length > 0){
					items.forEach(function(item) {
						it.saveItem( item.i_id, item.a_id, item.price,item.caption, item.img_path);
					});
				 }		
		      checker.updateModule("4","getAdsDetailsById",currentDateTime());
		     
		      Ti.App.fireEvent('app:loadAdsDetails',{needRefresh: needRefresh}); **/
	       }
	       
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	
	      },
	     timeout : 10000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
};

//load category to db
exports.loadCategory = function (ex){ 
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("5");
	var last_updated ="";
	var library = Alloy.createCollection('category'); 
	var existing_id = library.getExistingId();
	
	if(isUpdate != "" ){
		last_updated = isUpdate.updated;
	} 
	 var url = getCategoryList+"&last_updated="+last_updated;
	 //console.log(url);
	 var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	     	  
	       var res = JSON.parse(this.responseText);
	       if(res.status == "Success"){
	       	/**reset current category**/
			//library.resetCategory();
			/**load new set of category from API**/
	       	var arr = res.data;
	       //	console.log(res);
	       	arr.forEach(function(entry) {
	       		library.saveCategory(entry.id, entry.categoryName, entry.image);
			});
			
			if(res.remove){
				library.removeCategory(res.remove); 
			}
			
			checker.updateModule("5","getCategoryList",currentDateTime());
			Ti.App.fireEvent('app:loadCategory', ex);
	       }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	//console.log("API getCategoryList fail, skip sync with server");
	     	Ti.App.fireEvent('app:loadCategory');
	     },
	     timeout : 7000  // in milliseconds
	 });
	 if(Ti.Platform.osname == "android"){
	 	client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	 }
 
	 client.open("POST", url);
	 // Send the request.
	client.send({list: existing_id});
};

//private function

function fireIndexgrid(e){
	var res = JSON.parse(e.data);
	//console.log(res.status);
	//Ti.App.fireEvent('app:create2GridListing', res);
};

function onErrorCallback(e) {
	var common = require('common');
	// Handle your errors in here
	common.createAlert("Error", e);
};
