var args = arguments[0] || {};

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "settings",
	action: "view",
	label: "text size setting",
	value: 1
});
Alloy.Globals.tracker.trackScreen("Text Size Settings");

var textsize = Ti.App.Properties.getString("fontSizeClasses");
/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'TEXT SIZE', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
  
$.textSizeSetting.titleControl = custom;
var textLabel = $.UI.create('Label', {
	text: "Welcome to SalesAd",
	classes: [textsize],
	color: "#848484",
	width:'auto',
	textAlign:'center',
	top: 20
});
$.titleText.add(textLabel);

function updateLabel(e){
	var text = '';
	switch(Math.round(e.value)){
		case 0:
			$.removeClass(textLabel, "normal_font big_font");  
			$.addClass(textLabel, "small_font");  
			textLabel.color ="#848484";
			Ti.App.Properties.setString("fontSizeClasses", "small_font");
			break;
		case 1: 
		 	$.removeClass(textLabel, "small_font big_font"); 
			$.addClass(textLabel, "normal_font"); 
			textLabel.color ="#848484";
			Ti.App.Properties.setString("fontSizeClasses", "normal_font");
			break;
		case 2: 
			$.removeClass(textLabel, "small_font normal_font"); 
		  	$.addClass(textLabel, "big_font");  
			textLabel.color ="#848484";
			Ti.App.Properties.setString("fontSizeClasses", "big_font");
			break;
	}
		
	//$.label.text = text;
	//textLabel.classes = Ti.App.Properties.getString("fontSizeClasses");
}

function setCurrentValue(){
	
	switch(textsize){
		case "small_font":
			$.slider.value = 0;
			break;
		case 'normal_font':	
			$.slider.value = 1;
			break;
		case 'big_font':
			$.slider.value = 2;
			break;
		default:
			$.slider.value = 1;
	}
}

setCurrentValue();

$.btnBack.addEventListener('click', function(){ 
	var nav = Alloy.Globals.navMenu; 
	nav.closeWindow($.textSizeSetting); 
}); 

$.textSizeSetting.addEventListener("close", function(){
	Ti.App.fireEvent('app:fontReset');
    $.destroy();
    /* release function memory */
    createCustomView = null;
    library          = null;
    details          = null;
});