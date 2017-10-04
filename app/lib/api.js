/*********************
*** SETTING / API ***
**********************/
var API_DOMAIN = "salesad.my";
var XHR = require("xhr");
var xhr = new XHR();

// APP authenticate user and key
var USER  = 'salesad';
var KEY   = '06b53047cf294f7207789ff5293ad2dc';


var getMerchantListByType      = "http://"+API_DOMAIN+"/api/getMerchantListByType?user="+USER+"&key="+KEY;

var getAdsByCategoryList  = "http://"+API_DOMAIN+"/api/getAdsByCategoryList?user="+USER+"&key="+KEY;

var searchNearbyMerchant       = "http://"+API_DOMAIN+"/api/searchNearbyMerchant?user="+USER+"&key="+KEY;
var getAdsDetailsById = "http://"+API_DOMAIN+"/api/getAdsDetailsById?user="+USER+"&key="+KEY;
var searchResult               = "http://"+API_DOMAIN+"/api/searchResult?user="+USER+"&key="+KEY;
var updateToken  	     	   = "http://"+API_DOMAIN+"/api/updateToken?user="+USER+"&key="+KEY;
var updateUserFavourite  	   = "http://"+API_DOMAIN+"/api/updateUserFavourite?user="+USER+"&key="+KEY;
var updateUserFromFB  		   = "http://"+API_DOMAIN+"/api/updateUserFromFB?user="+USER+"&key="+KEY;
var dateNow = "http://"+API_DOMAIN+"/api/serverDate?user="+USER+"&key="+KEY;

//API when app loading phase
var getCategoryList            = "http://"+API_DOMAIN+"/api/getCategoryList?user="+USER+"&key="+KEY;
var getFeaturedBanner   	   = "http://"+API_DOMAIN+"/api/getFeaturedBannerList?user="+USER+"&key="+KEY;
var getMerchantList			= "http://"+API_DOMAIN+"/api/getMerchantList?user="+USER+"&key="+KEY;
var getCategoryAds			= "http://"+API_DOMAIN+"/api/getCategoryAds?user="+USER+"&key="+KEY;
var getAdsList			= "http://"+API_DOMAIN+"/api/getAdsList?user="+USER+"&key="+KEY;
var getItemList			= "http://"+API_DOMAIN+"/api/getItemList?user="+USER+"&key="+KEY;
var getVoucherByIdUrl			= "http://"+API_DOMAIN+"/api/getVoucherById?user="+USER+"&key="+KEY;
var getContestListUrl 	= "http://"+API_DOMAIN+"/api/getContestList?user="+USER+"&key="+KEY;
var getMerchantListByCategory  = "http://"+API_DOMAIN+"/api/getMerchantListByCategory?user="+USER+"&key="+KEY;
var getSXItem = "http://"+API_DOMAIN+"/api/getSXItem?user="+USER+"&key="+KEY;
var sendFeedback = "http://"+API_DOMAIN+"/api/sendFeedback?user="+USER+"&key="+KEY;
var getVoucherList = "http://"+API_DOMAIN+"/api/getVoucherList?user="+USER+"&key="+KEY;
var updateUserVoucher = "http://"+API_DOMAIN+"/api/updateUserVoucher";
var pointDescList = "http://"+API_DOMAIN+"/api/pointDescList?user="+USER+"&key="+KEY;
//API that call in sequence 
var APILoadingList = [
	{url: "dateNow", type: "api_function", method: "sync_server_time", checkId: "0"},
	{url: "getCategoryList", type: "cache_json", name: "category_list", checkId: "1"},
];
/*
	{url: "getFeaturedBanner", type: "api_model", model: "banners", checkId: "2"},
	{url: "getMerchantList", type: "api_model", model: "merchants", checkId: "6"},
	{url: "getCategoryAds", type: "api_model", model: "categoryAds", checkId: "7"},
	{url: "getAdsList", type: "api_model", model: "ads", checkId: "8"},
	{url: "getItemList", type: "api_model", model: "items", checkId: "9"},
	{url: "getContestListUrl", type: "api_model", model: "contest", checkId: "10"},
	{url: "getSXItem", type: "api_model", model: "xpress", checkId: "11"},
	{url: "getVoucherList", type:"api_model", model: "voucher" ,checkId: "12"},
 */

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
			console.log(res);
		    if(res.status == "success"){ 
		       	//var member = Alloy.createCollection('member'); 
				//member.updateUserSession(res.data.u_id, res.data.username, res.data.fullname, res.data.email, res.data.session);
				
	         	/** User session**/
	         	Ti.App.Properties.setString('u_id', res.data.u_id);
				Ti.App.Properties.setString('session', res.data.session);
	         	Ti.App.Properties.setString('facebooklogin', 1);
	         	Ti.App.Properties.setString('firstname', res.data.firstname);
	         	Ti.App.Properties.setString('lastname', res.data.lastname);
	         	Ti.App.Properties.setString('email', res.data.email);
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
	 
	var url = updateUserFavourite+"&token="+deviceToken+"&m_id="+e.m_id+"&u_id="+e.u_id+"&status="+e.status;   
	console.log(url);
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

exports.getMerchantListByCategory = function (ex, callback){
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById(100+ex);
	var last_updated ="";
	
	if(isUpdate != "" ){
		last_updated = isUpdate.updated;
	}
	var url = getMerchantListByCategory+"&category_id="+ex+"&last_updated="+last_updated;
	console.log(url);
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	    
	       var res = JSON.parse(this.responseText);

	       if(res.status == "success" || res.status == "Success"){
	       	/**reset current category**/
	       	var categoryAds = Alloy.createCollection('categoryAds'); 
			var merchant = Alloy.createCollection('merchants');
			
			/**load new set of category ads from API**/
	       	var arr = res.data;
	       	for (var i=0; i < arr.length; i++) {
				 arr[i].cate_id = ex;
			   };
			//console.log(arr);
	       	categoryAds.saveArray(arr);
	       	merchant.saveArray(arr);
	       	
			checker.updateModule(100+ex, "getMerchantListByCategory", currentDateTime());
			callback();
			//console.log(ex);
			//Ti.App.fireEvent('app:category_detailCreateGridListing', {cate_id: ex});
	       }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	callback();
	     	//Ti.App.fireEvent('app:category_detailCreateGridListing', {cate_id: ex});
	     },
	     timeout : 7000  // in milliseconds
	 });
	 if(Ti.Platform.osname == "android"){
	 	client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	 }
	 
	 client.open("POST", url);
	 // Send the request.
	client.send();
};

exports.getVoucherById = function(v_id, callback){
	var url = getVoucherByIdUrl;//+"&last_updated="+last_updated;
	//console.log(url);
	//console.log(existing_id);
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	    
	       var res = JSON.parse(this.responseText); 
	       //console.log(res);
	       if(res.status == "success"){
			
			/**load new set of category from API**/
	       	var obj = res.data;
	       	callback(obj);
	       }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) { 
	     	console.log('err'+e);
	     },
	     timeout : 7000  // in milliseconds
	 });
	 // Prepare the connection.
	 if(Ti.Platform.osname == "android"){
	 	client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); 
	 }
 
	 client.open("POST", url);
	 // Send the request.
	client.send({v_id: v_id}); 
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

//private function

function fireIndexgrid(e){
	var res = JSON.parse(e.data);
	//console.log(res.status);
	//Ti.App.fireEvent('app:create2GridListing', res);
};

exports.loadAPIBySequence = function (e){ //counter,
	var counter = (typeof e.counter == "undefined")?0:e.counter;
	if(counter >= APILoadingList.length){
		Ti.App.fireEvent('app:loadingViewFinish');
		return false;
	}
	
	var api = APILoadingList[counter];
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById(api['checkId']);
	var params ="";
	var total_item = APILoadingList.length;
	if(isUpdate != "" && last_update_on){
		params = {last_updated: isUpdate.updated};
	}
	
	var url = api['url'];
	console.log(url);
	API.callByPost({
		url: url,
		params: params
	},{
		onload: function(responseText){
			if(api['type'] == "api_function"){
				eval("_.isFunction("+api['method']+") && "+api['method']+"(responseText)");
			}else if(api['type'] == "cache_json"){
				var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, api['name']+'.txt');
				if (f.exists() === false) {
					// you don't need to do this, but you could...
					f.createFile();
				}
				f.write(responseText);
			}else if(api['type'] == "api_model"){
				var res = JSON.parse(responseText);
				var arr = res.data; 
		       	var model = Alloy.createCollection(api['model']);
		        model.saveArray(arr);
		        checker.updateModule(APILoadingList[counter]['checkId'],APILoadingList[counter]['model'],currentDateTime());
			}
			Ti.App.fireEvent('app:update_loading_text', {text: ((counter+1)/total_item*100).toFixed()+"% loading..."});
			counter++;
			API.loadAPIBySequence({counter: counter});
		},
		onerror: function(err){
			Ti.App.fireEvent('app:update_loading_text', {text: ((counter+1)/total_item*100).toFixed()+"% loading..."});
			counter++;
			API.loadAPIBySequence({counter: counter});
		}
	});
};

function sync_server_time(responseText){
	var res = JSON.parse(responseText);
	if(res.status != "error"){
		COMMON.sync_time(res.data);
	}
}

Ti.App.addEventListener("callbypost", function(e){
	API.callByPost({
			url: e.url,
			new: e.new,
			params: e.params,
		}, {onload: e.onload});
});

// call API by post method
exports.callByPost = function(e, handler){
	
	var deviceToken = Ti.App.Properties.getString('deviceToken');
	if(deviceToken != ""){ 
		var url = (typeof e.new != "undefined")?"http://"+API_DOMAIN+"/api/"+e.url+"?user="+USER+"&key="+KEY:eval(e.url);
		console.log(url);
		var _result = contactServerByPost(url, e.params || {});   
		_result.onload = function(ex) { 
			try{
				JSON.parse(this.responseText);
			}
			catch(e){
				console.log(this.responseText);
				// console.log('callbypost JSON exception');
				console.log(e);
				COMMON.createAlert("Error", e.message, handler.onexception);
				return;
			}
			_.isFunction(handler.onload) && handler.onload(this.responseText); 
		};
		
		_result.onerror = function(ex) {
			//-1001	The request timed out.
			if(ex.code == "-1009"){		//The Internet connection appears to be offline.
				//COMMON.createAlert("Error", ex.error, handler.onerror);
				return;
			}
			if(_.isNumber(e.retry_times)){
				//console.log(e.retry_times);
				e.retry_times --;
				if(e.retry_times > 0){
					API.callByPost(e, handler);
				}else{
				//	console.log('onerror msg');
					console.log(ex);
					//COMMON.createAlert("Error", ex.error, handler.onerror);
				}
			}else{
				//console.log('onerror msg without no');
				console.log(ex);
				e.retry_times = 2;
				API.callByPost(e, handler);
			}
		};
	}
};

// call API by post method
exports.callByPostWithJson = function(e, onload, onerror){
	
	var deviceToken = Ti.App.Properties.getString('deviceToken');
	if(deviceToken != ""){  
		var url = eval(e.url);
		console.log(url);
		var _result = contactServerByPostWithJson(url, e.params || {});   
		_result.onload = function(ex) { 
			//console.log('success callByPost');
			console.log(this.responseText);
			onload && onload(this.responseText); 
		};
		
		_result.onerror = function(ex) {
			//console.log('failure callByPost');
			console.log(ex);
			//API.callByPost(e, onload, onerror); 
		};
	}
};

// call API by post method
exports.callByPostImage = function(e, onload, onerror) { 
	var client = Ti.Network.createHTTPClient({
		timeout : 50000
	});
	var url = eval(e.url);
	var _result = contactServerByPostImage(url+"&u_id="+e.params.u_id,e.img);
	_result.onload = function(e) { 
		//console.log('success');
		onload && onload(this.responseText); 
	};
	
	_result.onerror = function(ex) { 
		//console.log("onerror");
		API.callByPostImage(e, onload);
		//onerror && onerror();
	};
};

/*********************
 * Private function***
 *********************/
function contactServerByGet(url) { 
	var client = Ti.Network.createHTTPClient({
		timeout : 50000
	});
	client.open("GET", url);
	client.send(); 
	return client;
};

function contactServerByPost(url,records) { 
	var client = Ti.Network.createHTTPClient({
		timeout : 10000
	});
	//console.log(client);
	if(OS_ANDROID){
	 	client.setRequestHeader('ContentType', 'application/x-www-form-urlencoded'); 
	 }
	console.log(records);
	
	client.open("POST", url);
	client.send(records);
	return client;
};

function contactServerByPostWithJson(url,records) { 
	var client = Ti.Network.createHTTPClient({
		timeout : 50000
	});
	
	client.setRequestHeader('ContentType', 'application/json');
	//client.setRequestHeader('processData', false);
	console.log(records);
	client.open("POST", url);
	client.send(records);
	return client;
};

function contactServerByPostImage(url, img) { 
 
	var client = Ti.Network.createHTTPClient({
		timeout : 50000
	});
	 
	//client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	client.open("POST", url);
	client.send({Filedata: img.photo}); 
	return client;
	
};
