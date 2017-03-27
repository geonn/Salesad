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

function closeWindow(){
	COMMON.closeWindow($.help);
}

$.help.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.help); 
});
