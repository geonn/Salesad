var args = arguments[0] || {};
var my_vid = args.My_vid || "";
var pageTitle;
var use  = args.use || false;
var model = Alloy.createCollection("MyVoucher"); 
var res = model.getVoucherByMy_vid(my_vid);
console.log("res :"+JSON.stringify(res));
Alloy.Globals.naviPath.push($.win);
var loading = Alloy.createController("loading");
if(res.item_id != null){
	var item = Alloy.createCollection("items");
	var image = item.getImageByI_id(res.item_id);
	res.image = image;
}
function setData(){
	$.title.setText(res.title);
	$.date.setText(res.use_from + " - " + res.use_to);
	$.description.setText(res.description);
}
function render_banner(){
 	var bannerImage = Ti.UI.createImageView({
 		defaultImage: "/images/image_loader_640x640.png",
 		image:res.image,
		width : "100%",
		height: Ti.UI.SIZE,//ads_height,
	});
	
	var app_background = "#fff";
	$.win.backgroundColor = app_background;
	$.banner.add(bannerImage);
	
	bannerImage.addEventListener('click',function(e){
		var Zv = Ti.UI.createView({
			width :Ti.UI.FILL,
			height :Ti.UI.FILL, 
			backgroundColor: "#66000000",
			zIndex :100
		});
		var Z = Ti.UI.createView({
			width :"95%",
			height :Ti.UI.SIZE,
			backgroundColor :"transparent",
			zIndex :100
		});
		var Ziv = Ti.UI.createScrollView({
			width :Ti.UI.SIZE, 
			height :Ti.UI.SIZE,        
            showHorizontalScrollIndicator:false,
            showVerticalScrollIndicator:false,
            maxZoomScale:10,
            minZoomScale:1.0,
            borderWidth :1, 
      		backgroundColor :"transparent",
      		zIndex :100
		});
		var Zimage = Ti.UI.createImageView({
			defaultImage :"/images/image_loader_640x640.png",
			image: res.image,
			width :"100%",
			height :Ti.UI.SIZE,
			zIndex :101,
			enableZoomControls :"true"
		});
		var close = Ti.UI.createImageView({
			image :"/images/Icon_Delete_Round.png",
			width : 30, 
			height : 30, 
			top : 3,
			right : 3,  
			zIndex : 102
		});
		Ziv.add(Zimage);
		Z.add(Ziv);
		Z.add(close);
		Zv.add(Z);
		$.win.add(Zv);
		close.addEventListener('click',function(e){
			Zv.removeAllChildren();
			Zv.height = 0;
		});
});
}
var checking = true;
function useVoucher(e){
	if(checking && use){
		checking = false;
		COMMON.createAlert("Use Voucher","Confirm to use this voucher now?\nThis action is not undoable.",function(ex){
			API.callByPost({url:"updateUserVoucher",params:{id:my_vid,status:0}},{
				onload:function(responseText){
					COMMON.closeWindow($.win);
					Ti.App.fireEvent('myvoucher:refresh');							
					COMMON.openWindow(Alloy.createController("Voucher_Receipt",{barcode:res.barcode}).getView());
				},
				onerror: function(err){
					_.isString(err.message) && alert(err.message);
				},
				onexception: function(){
					COMMON.closeWindow($.win);
				}
			});
		});
		checking = true;		
	}
}
function getAdDetails(){
	console.log("asdf");
	var custom = $.UI.create("Label", { 
		    text: "Saved Voucher", 
		    color: '#ED1C24' 
	});	
	if(Ti.Platform.osname == "android"){ 
		$.pageTitle.add(custom);   
	}else{
		$.win.titleControl = custom;
	} 
};


function init(){
	$.win.add(loading.getView());	
	loading.finish();
	getAdDetails();
	render_banner();
	setData();
}

init();
function closeWindow(){
	COMMON.closeWindow($.win); 
}

$.btnBack.addEventListener('click', closeWindow); 

$.win.addEventListener("close", function(){
	Ti.App.fireEvent('removeNav');
    $.destroy();
});
    
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}    
var c1 = true;
function showredeem(e){
	if(c1){
		$.bt1.image = "/images/Icon_Up.png";
		var title = $.UI.create("Label",{classes:['wsize','hsize'],text:res.redeem,left:0});
		$.redeem.add(title);
		c1 = false;	
	}
	else{
		$.bt1.image = "/images/Icon_Down.png";		
		$.redeem.removeAllChildren();
		c1 = true;
	}
}
var c2 = true;
function showtnc(e){
	if(c2){
		$.bt2.image = "/images/Icon_Up.png";		
		var title = $.UI.create("Label",{classes:['wsize','hsize'],text:res.tnc,left:0});
		$.tnc.add(title);
		c2 = false;
	}
	else{
		$.bt2.image = "/images/Icon_Down.png";			
		$.tnc.removeAllChildren();
		c2 = true;
	}
}

$.win.addEventListener('android:back', function (e) {
 	COMMON.closeWindow($.win); 
});


