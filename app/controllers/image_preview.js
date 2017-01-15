var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var loading = Alloy.createController("loading");

function init(){
	console.log('yes! init');
	$.win.add(loading.getView());
	console.log(args.image);
	console.log(args.image.nativePath);
	Ti.App.fireEvent("app:fromTitanium", {image: args.image.nativePath});
}

function doSave(){
	Ti.App.fireEvent("cropped_image", {image: $.cropped.toImage()});
}

function closeWindow(){
	console.log("why didnt close one");
	COMMON.closeWindow($.win);
}

Ti.App.addEventListener("image_preview:loadImage", init);

$.btnBack.addEventListener('click', function(){ 
	console.log("why didnt close one");
	COMMON.closeWindow($.win);
});
