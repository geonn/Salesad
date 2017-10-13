var args = arguments[0] || {};
var page = args.page;
var callback = args.callback || "";
console.log(typeof callback);
function login(e) {
	var win = Alloy.createController("login", {page: page, callback: callback}).getView();
	COMMON.openWindow(win);
}

function register(e) {
	var win = Alloy.createController("register", {page: page, callback: callback}).getView();
	COMMON.openWindow(win);
}

$.policy.addEventListener('touchend', function(e) {
	var win = Alloy.createController("webview", {url: "http://salesad.my/privacyPolicy"}).getView();
	COMMON.openWindow(win);
});
$.tou.addEventListener('touchend', function(e) {
	var win = Alloy.createController("webview", {url: "http://salesad.my/termsOfService"}).getView();
	COMMON.openWindow(win);
});

$.btnBack.addEventListener('click', function() {
	COMMON.closeWindow($.signin_out);
    try{
	    if(page != "") {
	        Ti.App.fireEvent("login_cancel:reward");
	    }    	
    }
    catch(e){
    	
    }
});

function closeWindow() {
	Ti.App.removeEventListener('sign:close',closeWindow);
	console.log("close signin window");
	COMMON.closeWindow($.signin_out);
	console.log(callback);
	console.log(typeof callback);
	if(callback != ""){
		setTimeout(function(){callback();}, 1000);
	}
}

$.signin_out.addEventListener("close", function(e){
	
});

Ti.App.addEventListener("sign:close", closeWindow);

$.signin_out.addEventListener('android:back', function (e) {
    COMMON.closeWindow($.signin_out);
    try{
	    if(page != "") {
	        Ti.App.fireEvent("login_cancel:reward");
	    }    	 
    }
    catch(e){
    	 
    }
});
