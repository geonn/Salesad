var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var loading = Alloy.createController("loading");
var pwidth = Titanium.Platform.displayCaps.platformWidth;
if(OS_ANDROID){
	$.cropped.width = pixelToDp(pwidth)-60;
	$.cropped.height = pixelToDp(pwidth)-60;
}else{
	$.cropped.width = pwidth-60;
	$.cropped.height = pwidth-60;
}
function init(){
	$.win.add(loading.getView());
	console.log("args image   " + args.image);
	Ti.App.fireEvent("html:loadImage", {image: args.image});
}

function doSave(){
	console.log("doSave");
	var encode = Titanium.Utils.base64encode($.cropped.toImage());
	Ti.App.fireEvent("cropped_image", {image_callback: String(encode), abc: "asd"});
	closeWindow();
}

function closeWindow(){
	console.log("why didnt close one");
	Ti.App.removeEventListener("image_preview:loadImage", init);
	COMMON.closeWindow($.win);
}

// convert pixel to dp.
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

Ti.App.addEventListener("image_preview:loadImage", init);

$.win.addEventListener('android:back', function (e) {
	Ti.App.removeEventListener("image_preview:loadImage", init);	
 	COMMON.closeWindow($.win); 
});

