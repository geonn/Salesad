var args = arguments[0] || {};

/**Set Custom title**/
if(Ti.Platform.osname == "android"){ 
	var custom = $.UI.create("Label", { 
	    text: 'About', 
	    color: '#ED1C24', 
	    width: Ti.UI.SIZE 
	 });
	$.pageTitle.add(custom);   
}else{
	$.win.title = 'About'; 
}

function closeWindow(){
	COMMON.closeWindow($.win); 
}

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});

$.policy.addEventListener('touchend', function(e){
	var win = Alloy.createController("webview", {url: "http://salesad.my/privacyPolicy", web_title: "Privacy & Policy"}).getView();  
	COMMON.openWindow(win);
});
$.tou.addEventListener('touchend', function(e){
	var win = Alloy.createController("webview", {url: "http://salesad.my/termsOfService", web_title: "Terms of Service"}).getView();  
	COMMON.openWindow(win);
}); 
$.pay.addEventListener('touchend', function(e){
	var win = Alloy.createController("webview", {url: "http://salesad.my/paymentPolicy", web_title: "Payment Policy"}).getView();  
	COMMON.openWindow(win);
});