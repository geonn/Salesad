var args = arguments[0] || {};

var textsize = Ti.App.Properties.getString("fontSizeClasses");
/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'TEXT SIZE', 
    color: '#ED1C24', 
    width: Ti.UI.SIZE 
 });
 
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.textSizeSetting.titleControl = custom; 
}   
 
var textLabel = $.UI.create('Label', {
	text: "Welcome to SalesAd",
	classes: [textsize],
	color: "#848484",
	width:'auto',
	textAlign:'center',
	top: 20
});
$.textSizeSettingView.titleText.add(textLabel);

function updateLabel(e){
	var text = '';
	switch(Math.round(e.value)){
		case 0:
			$.textSizeSettingView.removeClass(textLabel, "normal_font big_font");  
			$.textSizeSettingView.addClass(textLabel, "small_font");  
			textLabel.color ="#848484";
			Ti.App.Properties.setString("fontSizeClasses", "small_font");
			break;
		case 1: 
		 	$.textSizeSettingView.removeClass(textLabel, "small_font big_font"); 
			$.textSizeSettingView.addClass(textLabel, "normal_font"); 
			textLabel.color ="#848484";
			Ti.App.Properties.setString("fontSizeClasses", "normal_font");
			break;
		case 2: 
			$.textSizeSettingView.removeClass(textLabel, "small_font normal_font"); 
		  	$.textSizeSettingView.addClass(textLabel, "big_font");  
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
			$.textSizeSettingView.slider.value = 0;
			break;
		case 'normal_font':	
			$.textSizeSettingView.slider.value = 1;
			break;
		case 'big_font':
			$.textSizeSettingView.slider.value = 2;
			break;
		default:
			$.textSizeSettingView.slider.value = 1;
	}
}

setCurrentValue();
$.textSizeSettingView.slider.addEventListener('change',updateLabel);
function closeWindow(){
	COMMON.closeWindow($.textSizeSetting); 
} 

$.textSizeSetting.addEventListener("close", function(){
	Ti.App.fireEvent('app:fontReset');
    $.textSizeSettingView.destroy();
    /* release function memory */
    createCustomView = null;
    library          = null;
    details          = null;
});

$.textSizeSetting.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.textSizeSetting); 
});
