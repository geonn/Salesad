var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var htr_turn = true;
var tc_turn = true;
var checkingLimit = true;
var checkingForSave = true; 
var v_id = args.v_id;
var voucher = Alloy.createCollection("voucher");
var data = voucher.getDataById(v_id);
var quantity = data.quantity;
var user_point = [];
var current_point = "";
var fristDate = "";
var secondDate = "";
var endsDay = "";
console.log("User id = "+u_id+" voucher id "+v_id);
console.log(data.v_limit+"here");

function parseDate(str) {
    var mdy = str.split('-');
    return new Date(mdy[0], mdy[1]-1, mdy[2]);
}

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24)+1);
}

function getNowDate(){   //calculate the days between 2 dates
	console.log("hi hai");
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

if(data.point==0){
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

function createWhoops(){
	var box = Titanium.UI.createAlertDialog({
		title: "Whoops!",
		message: "Sorry, you don't have enough CP points to save this voucher."
	});
	box.show();
};

function checkVoucherLimit(){
	var model = Alloy.createCollection("MyVoucher");
	var voucherLimit = model.getCountByVid(v_id);
	var limit = voucherLimit.count;
	console.log("Voucher limit is "+limit+" by v_id "+v_id);
	console.log(data.limit);
	if(limit>=data.limit){
		checkingLimit = false;
	}
	checkingVoucher();
}

function set_data(){
	$.image_voucher.setImage(data.image);
	$.title.setText(data.title);
	$.leftV.setText(quantity);
	$.point.setText(data.point);
	$.valid_from.setText(data.use_from);
	$.valid_to.setText(data.use_to);
	$.desc.setText(data.description);
}

function htr_extend(){
	if(htr_turn){
		$.htr_image.image = "/images/Icon_Up.png";
		var htr = $.UI.create("Label",{
			classes:['wfill','hsize','padding'],
			top:0,
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
		var tc = $.UI.create("Label",{
			classes:['wfill','hsize','padding'],
			top:0,
			text:data.tnc,
		});
		$.tc.add(tc);
		tc_turn = false;
	}else if(!tc_turn){
		$.tc.removeAllChildren();
		$.tc_image.image = "/images/Icon_Down.png";
		tc_turn = true;
	}	
}

function checkingVoucher(){
	if(!checkingLimit){
		$.save.setTitle("Voucher Saved");   //check voucher limit
		$.save.setBackgroundColor("#a6a6a6");
		$.save.setEnabled(false);
	}
	if(checkingLimit){
		$.save.setTitle("Save Voucher");   //check voucher limit
		$.save.setEnabled(true);
	}
	if(data.limit == -1){
		$.save.setTitle("Save Voucher");   //unlimit voucher
		$.save.setEnabled(true);
		$.save.setBackgroundColor("#ED1C24");
	}
	if(quantity<=0){
		$.save.setTitle("Out of Stock");   //check voucher left
		$.save.setEnabled(false);
	}	
}

set_data();
userCurrentPoint();
checkVoucherLimit();
getNowDate();

function doSave(){
	if(checkingForSave){   //avoid double click 
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
					alert("Voucher Saved!\nYou can view it under\nMy rewards > Saved Vouchers");
					Ti.App.fireEvent("voucher:refresh");
					COMMON.closeWindow($.win); 
				},
				onerror: function(err){
					console.log("Save voucher fail!");
				}});				
			});	
		}else{
			createWhoops();
		}	
	}
}
$.win.addEventListener('android:back', function (e) {
	COMMON.closeWindow($.win); 
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
});