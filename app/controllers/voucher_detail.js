var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var htr_turn = true;
var tc_turn = true;
var checkingLimit = true;
var checkingForSave = true; 
var checkingClaimLimit = true;
var v_id = args.v_id;
var voucher = Alloy.createCollection("voucher");
var data = voucher.getDataById(v_id);
var left = data.left;
var user_point = [];
var current_point = "";
var fristDate = "";
var secondDate = "";
var endsDay = "";
var loading = Alloy.createController("loading");
var tncrule = "Terms and Conditions are a set of rules and guidelines that a user must agree to in order to use your website or mobile app. It acts as a legal contract between you (the company) who has the website or mobile app and the user who access your website and mobile app.\n\nIt’s up to you to set the rules and guidelines that the user must agree to. You can think of your Terms and Conditions agreement as the legal agreement where you maintain your rights to exclude users from your app in the event that they abuse your app, and where you maintain your legal rights against potential app abusers, and so on.\n\nTerms and Conditions are also known as Terms of Service or Terms of Use.\n\nThis type of legal agreement can be used for both your website and your mobile app. It’s not required (it’s not recommended actually) to have separate Terms and Conditions agreements: one for your website and one for your mobile app.";
console.log("User id = "+u_id+" voucher id "+v_id);
console.log(data.v_limit+"here");
if(data.item_id != null){
	var item = Alloy.createCollection("items");
	var image = item.getImageByI_id(data.item_id);
	data.image = image;
}
function parseDate(str) {
    var mdy = str.split('-');
    return new Date(mdy[0], mdy[1]-1, mdy[2]);
}

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24)+1);
}

function getNowDate(){   //calculate the days between two dates
	var fristDate = data.use_to;
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	if(dd<10) {
	    dd='0'+dd;
	} 
	if(mm<10) {
	    mm='0'+mm;
	} 
	today = yyyy+'-'+mm+'-'+dd;
	secondDate = today;
	console.log(fristDate+" today");
	console.log(secondDate+" voucher date");
	endsDay = daydiff(parseDate(secondDate), parseDate(fristDate));	
	$.days.setText(endsDay);
}

function render_banner(){
 	var bannerImage = Ti.UI.createImageView({
 		defaultImage: "/images/image_loader_640x640.png",
 		image:data.image,
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
			image: data.image,
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

if(data.point==0 || data.point==null){
	$.pointView.opacity = 0;
	if(OS_IOS){
		$.win.setTitle("Instant Voucher");
	}else{
		$.pageTitle.setText("Instant Voucher");
	}
}else{
	if(OS_IOS){
		$.win.setTitle("Gift Voucher");
	}else{
		$.pageTitle.setText("Gift Voucher");
	}
}

function userCurrentPoint(){
	var model = Alloy.createCollection("points");
	user_point = model.getData({u_id: u_id});
	current_point = user_point[user_point.length - 1].balance;
	console.log("User current point = "+current_point);
}

function createWhoops(e){
	var box = Titanium.UI.createAlertDialog({
		title: "Whoops!",
		message: e
	});
	box.show();
};

function checkVoucherStatus(){
	var model = Alloy.createCollection("MyVoucher");
	var voucherStatus = model.getCountByVid(v_id);
	var limit = voucherStatus.count;
	console.log("Voucher status is "+limit+" by v_id "+v_id);
	if(limit>=1){
		checkingLimit = false;
	}
	checkingVoucher();
}

function checkVoucherLimit(){
	var model = Alloy.createCollection("MyVoucher");
	var voucherLimit = model.getCountLimitByVid(v_id);
	var limit = voucherLimit.count;
	console.log("Voucher limit is "+limit+" by v_id "+v_id);
	console.log(data.limit);
	if(data.limit==-1){
		checkingClaimLimit = true;
	}else if(limit>=data.limit){
		checkingClaimLimit = false;
	}
}

function set_data(){
	var dateUseFrom = convertToHumanFormat(data.use_from);
	var dateUseTo = convertToHumanFormat(data.use_to);
	$.title.setText(data.title);
	if(data.left==-1){
		$.leftV2.setText(" ");
		$.leftV.setText("While Stocks Last");
	}else{
		$.leftV.setText(left);
	}
	$.point.setText(data.point);
	$.valid_from.setText(dateUseFrom);
	$.valid_to.setText(dateUseTo);
	$.desc.setText(data.description);
	$.saved.setText(eval(data.quantity));
	var tc = $.UI.create("Label",{
		classes:['wfill','hsize','padding'],
		top:0,
		left:20,
		text:data.tnc,
	});
	$.tc.add(tc);	
}

function htr_extend(){
	if(htr_turn){
		$.htr_image.image = "/images/Icon_Up.png";
		var htr = $.UI.create("Label",{
			classes:['wfill','hsize','padding'],
			top:0,
			left:25,
			text:data.redeem,
		});
		$.htr.add(htr);
		htr_turn = false;
	}else if(!htr_turn){
		$.htr.removeAllChildren();
		$.htr_image.image = "/images/Icon_Down.png";
		htr_turn = true;
	}	
}

function tc_extend(){
	if(tc_turn){
		$.tc_image.image = "/images/Icon_Up.png";
		$.tc.setHeight(Ti.UI.SIZE);
		$.hoverg.setOpacity(0);
		$.smallball.setText("Read Less");					
		tc_turn = false;
	}else if(!tc_turn){
		$.tc_image.image = "/images/Icon_Down.png";
		$.tc.setHeight(52);	
		$.hoverg.setOpacity(1);	
		$.smallball.setText("Read More");					
		tc_turn = true;
	}	
}

function checkingVoucher(){
	if(!checkingLimit){
		$.save.setTitle("Voucher Saved");   //check voucher limit
		$.save.setBackgroundColor("#a6a6a6");
		$.save.setEnabled(false);
	}else if(checkingLimit){
		$.save.setTitle("Save Voucher");   //check voucher limit
		$.save.setEnabled(true);
	}
	/*if(data.limit == -1){
		$.save.setTitle("Save Voucher");   //unlimit voucher
		$.save.setEnabled(true);
		$.save.setBackgroundColor("#ED1C24");
	}*/
	if(left==0){
		$.save.setTitle("Voucher Fully Saved");   //check voucher left
		$.save.setEnabled(false);
		$.save.setBackgroundColor("#a6a6a6");
	}	
}

function init(){
	$.win.add(loading.getView());	
	loading.finish();
	set_data();
	userCurrentPoint();
	checkVoucherStatus();
	checkVoucherLimit();
	getNowDate();
	render_banner();
}
init();
	

function doSave(){
	if(checkingForSave){   //avoid double click 
		if(checkingClaimLimit){
			if(data.point<=current_point){   //check user point
			console.log("voucher point "+data.point+" <= "+" user point "+current_point);
			checkingForSave = false;
			var common = require('common');
			var title_voucher = (data.point!=0)?"Gift Voucher":"Instant Voucher";
			var cpPoint = (data.point!=0)?"\nfor "+data.point+" CP points?":"?";
			common.createAlert(title_voucher,'Confirm to save this voucher'+cpPoint,function(ee){
				var params = {v_id: v_id,u_id: u_id,quantity: 1};
				API.callByPost({
					url: "addUserVoucher",
					new: true,
					params: params
				},{
				onload: function(res){
					var res = JSON.parse(res);
					var arr = res.data || null;
					console.log("Success to save "+JSON.stringify(arr));
					checkingForSave = true;
					setTimeout(function(e){
						alert("Voucher Saved!\nYou can view it under\nMy rewards > Saved Vouchers");
					},1000);
					Ti.App.fireEvent("voucher:refresh");
					Ti.App.fireEvent("myvoucher:refresh");
					COMMON.closeWindow($.win); 
				},
				onerror: function(err){
					console.log("Save voucher fail!");
				}});				
			});	
		}else{
			createWhoops("Sorry, you don't have enough CP points to save this voucher.");
		}	
		}else{
			createWhoops("You have exceeded the limit of this voucher");
		}
	}
}
$.win.addEventListener('android:back', function (e) {
	COMMON.closeWindow($.win); 
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
});