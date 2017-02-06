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

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 
