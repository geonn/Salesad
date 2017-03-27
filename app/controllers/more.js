var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var data;
var loading = Alloy.createController("loading");

function render_page(){
}

function navTo(e){
	var target = parent({name: "target"}, e.source);
	
	if(target == "profile"){
		var user = Ti.App.Properties.getString('session');
		if(user === null){
			var win = Alloy.createController("login").getView();
			if(Ti.Platform.osname == "android"){
				win.fbProxy = FACEBOOK.createActivityWorker({lifecycleContainer: win});
			}
			COMMON.openWindow(win);  
		}else{
			var win = Alloy.createController("profile").getView(); 
			COMMON.openWindow(win); 
		} 
	}else if(target == "webview"){
		var url = parent({name: "url"}, e.source);
		var win = Alloy.createController("webview", {url:url}).getView(); 
		COMMON.openWindow(win);
	}else if(target != ""){
		if(target=="reward"){
			var u_id = Ti.App.Properties.getString('u_id') || "";
			if(u_id == ""){
				var win = Alloy.createController("login").getView(); 
				COMMON.openWindow(win);
				return;
			}
		}
		var win = Alloy.createController(target).getView();  
		COMMON.openWindow(win);
	}
}

function init(){
	$.win.add(loading.getView());
}

init();


var doLogout = function (e) { 
	var dialog = Ti.UI.createAlertDialog({
	    cancel: 1,
	    buttonNames: ['Cancel','Confirm'],
	    message: 'Would you like to logout?',
	    title: 'Logout SalesAd'
	  });
	  dialog.addEventListener('click', function(e){
	  	if(e.button === false){
	  		return e.button;
	  	}
	  	
	    if (e.index === 1){
	    	//fb logout
	    	if(Ti.App.Properties.getString('facebooklogin') == "1"){
	    		FACEBOOK.logout();
	   		}
	   		
			var url = API.logoutUser + Ti.App.Properties.getString('session');
			var client = Ti.Network.createHTTPClient({
			     // function called when the response data is available
			     onload : function(e) {
			     	Ti.App.Properties.removeProperty('u_id');
		         	Ti.App.Properties.removeProperty('firstname');
		         	Ti.App.Properties.removeProperty('lastname');
		         	Ti.App.Properties.removeProperty('email');
		         	Ti.App.Properties.removeProperty('gender');
					Ti.App.Properties.removeProperty('session');
			     	COMMON.closeWindow($.win);
			     },
			     // function called when an error occurs, including a timeout
			     onerror : function(e) {
			        createAlert('Network declined','Failed to contact with server. Please make sure your device are connected to internet.');
			     },
			     timeout : 5000  // in milliseconds
			 });
			 // Prepare the connection.
			 client.open("GET", url);
			 // Send the request.
			 client.send(); 
	    }
	 });

	dialog.show();
};

$.button.addEventListener('click', doLogout);

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
