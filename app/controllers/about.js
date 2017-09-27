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
	var win = Alloy.createController("webview", {url: "http://salesad.my/privacyPolicy"}).getView();  
	COMMON.openWindow(win);
});
$.tou.addEventListener('touchend', function(e){
	var win = Alloy.createController("webview", {url: "http://salesad.my/termsOfService"}).getView();  
	COMMON.openWindow(win);
}); 
$.pay.addEventListener('touchend', function(e){
	var win = Alloy.createController("webview", {url: "http://salesad.my/paymentPolicy"}).getView();  
	COMMON.openWindow(win);
});