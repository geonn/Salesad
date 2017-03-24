var args = arguments[0] || {};

/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'About', 
    color: '#ED1C24', 
    width: Ti.UI.SIZE 
 });
  
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.win.titleControl = custom; 
}

function closeWindow(){
	COMMON.closeWindow($.win); 
}

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
