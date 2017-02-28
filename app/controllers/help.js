var args = arguments[0] || {}; 

/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'HELP', 
    color: '#ED1C24', 
    width: Ti.UI.SIZE 
 });

if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);    
}else{
	$.help.titleControl = custom;
}    

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.help); 
}); 