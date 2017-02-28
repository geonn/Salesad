var args = arguments[0] || {};

var clickTime = null;
/**Set Custom title**/
var custom = $.UI.create("Label", {  
    text: 'PRIVACY & TERMS', 
    color: '#ED1C24', 
    width: Ti.UI.SIZE 
 });
   
$.pageTitle.add(custom);  
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.tnc); 
}); 
