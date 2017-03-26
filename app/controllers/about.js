var args = arguments[0] || {};

/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'ABOUT', 
    color: '#ED1C24', 
    width: Ti.UI.SIZE 
 });
  
 
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.description.titleControl = custom; 
} 
$.btnBack.addEventListener('click', function(){  
	COMMON.closeWindow($.description); 
}); 

$.description.addEventListener('android:back', function (e) {
	COMMON.closeWindow($.description); 
});