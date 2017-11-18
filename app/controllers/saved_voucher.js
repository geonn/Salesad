var args = arguments[0] || {};
var pageTitle;
var use  = args.use || false;
console.log(args); 
var res = args.record;
Alloy.Globals.naviPath.push($.win);
var loading = Alloy.createController("loading");
var tncrule = "Terms and Conditions are a set of rules and guidelines that a user must agree to in order to use your website or mobile app. It acts as a legal contract between you (the company) who has the website or mobile app and the user who access your website and mobile app.\n\nIt’s up to you to set the rules and guidelines that the user must agree to. You can think of your Terms and Conditions agreement as the legal agreement where you maintain your rights to exclude users from your app in the event that they abuse your app, and where you maintain your legal rights against potential app abusers, and so on.\n\nTerms and Conditions are also known as Terms of Service or Terms of Use.\n\nThis type of legal agreement can be used for both your website and your mobile app. It’s not required (it’s not recommended actually) to have separate Terms and Conditions agreements: one for your website and one for your mobile app.";

function zoom(e){
	var TiTouchImageView = require('org.iotashan.TiTouchImageView');
	var container = Ti.UI.createView({width:Ti.UI.FILL,height:Ti.UI.FILL,backgroundColor:"#66000000",zIndex:"100"});
	var close = Ti.UI.createLabel({width:Ti.UI.SIZE,height:Ti.UI.SIZE,right:"10",top:"10",color:"#fff",text:"Close"});
	var image = (typeof e.source.image.nativePath != undefined)?e.source.image.nativePath: "/images/image_loader_640x640.png";
	var imageView = TiTouchImageView.createView({
		image:image,
		maxZoom:5,
		minZoom:1,
 	}); 	
 	container.add(imageView);
 	container.add(close);
 	close.addEventListener("click",function(){
  		$.win.remove(container);
 	}); 
 	$.win.add(container);
}
function setData(){
	$.title.setText(res.title);
	$.date.setText(convertToHumanFormat(res.use_from));
	$.date1.setText(convertToHumanFormat(res.use_to));
	$.description.setText(res.description);	
	var title = $.UI.create("Label",{classes:['wsize','hsize'],text:res.tnc,left:20,top:10});
	$.tnc.add(title);	
}
function createWhoops(t,e){
	var box = Titanium.UI.createAlertDialog({
		title: t,
		message: e
	});
	box.show();
};
function render_banner(){
	if(OS_ANDROID && res.image != null){
		$.RemoteImage.applyProperties({
		 	autoload: true,
		    backgroundColor: 'black',
		    image: res.image,
		    default_img : "/images/image_loader_640x640.png"
		});		
		$.RemoteImage.addEventListener("click",zoom);		
	}else{
		if (OS_ANDROID) {
			$.RemoteImage.setDefaultImg("/images/image_loader_640x640.png");
		};
	}		
	if(OS_IOS){
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
				//enableZoomControls :"true"
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
}
var checking = true;
function useVoucher(e){
	if(checking && use){
		checking = false;
		COMMON.createAlert("Use Voucher","Confirm to use the voucher now?\nYou can't undo this action.",function(ex){
			if(res.need_scan){
				var SCANNER = require("scanner");
				if(Ti.Media.hasCameraPermissions()){
					SCANNER.openScanner("2");
			    }else{
			        Ti.Media.requestCameraPermissions(function(e) {
			        	if(e.success){
							SCANNER.openScanner("2");				       
				        }
			        	else{
			        		alert("You denied permission.");
			        	}			        
			        });	        	
			    }
			}else{
				updateuserVoucher();
			}
			
		},undefined,function(){
			checking = true;
		});
		checking = true;		
	}
}

function updateuserVoucher(e){
	console.log("call function updateuserVoucher");
	var params = (typeof e.m_id != "undefined")?{m_id: e.m_id, id:res.id, status:0}: {id:res.id, status:0};
	console.log(params);
	API.callByPost({url:"updateUserVoucher",params:params},{
		onload:function(responseText){
			COMMON.closeWindow($.win);
			Ti.App.fireEvent('myvoucher:refresh');							
			COMMON.openWindow(Alloy.createController("Voucher_Receipt",{barcode:res.barcode,display_type:res.display_type, v_code: res.v_code}).getView());
		},
		onerror: function(err){
			_.isString(err.message) && alert(err.message);
		},
		onexception: function(){
			COMMON.closeWindow($.win);
		}
	});
}

function getAdDetails(){
	var custom = $.UI.create("Label", { 
		    text: "Saved Voucher", 
		    color: '#ED1C24' 
	});	
	if(Ti.Platform.osname == "android"){ 
		$.pageTitle.add(custom);   
	}else{
		$.win.title = "Saved Voucher";
	} 
};


function init(){
	$.win.add(loading.getView());	
	loading.finish();
	getAdDetails();
	render_banner();
	setData();
	if(!use){
		$.useV.setTitle("Voucher Expired");   //check voucher limit
		$.useV.setBackgroundColor("#a6a6a6");		
	}
	var now = new Date();
	var expired = false;
	now.setHours(8,0,0,0);
	var use_from = new Date(res.use_from);

	
	if(use_from.getTime() > now.getTime()){
		$.useV.setTitle("Voucher Start From "+convertToHumanFormat(res.use_from));   //check voucher limit
		$.useV.setBackgroundColor("#a6a6a6");
		$.useV.setEnabled(false);
		use = false;
	}
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
		var title = $.UI.create("Label",{classes:['wsize','hsize'],text:res.redeem,left:20});
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
		$.tnc.setHeight(Titanium.UI.SIZE);
		$.smallball.setText("Read Less");
		$.hoverg.setOpacity(0);
		c2 = false;
	}
	else{
		$.bt2.image = "/images/Icon_Down.png";
		$.smallball.setText("Read More");					
		$.tnc.setHeight(65);
		$.hoverg.setOpacity(1);
		c2 = true;
	}
}

Ti.App.addEventListener("getMid", updateuserVoucher);

$.win.addEventListener("close", function(e){
	Ti.App.removeEventListener("getMid", updateuserVoucher);
});

$.win.addEventListener('android:back', function (e) {
 	COMMON.closeWindow($.win); 
});

