var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var htr_turn = true;
var tc_turn = true;
var checking = true;
var checkingForSave = true; 
var v_id = args.v_id;
var voucher = Alloy.createCollection("voucher");
var data = voucher.getDataById(v_id);
var quantity = data.quantity;
var user_point = [];
var current_point = "";
console.log("User id = "+u_id+" voucher id "+v_id);

function userCurrentPoint(){
	var model = Alloy.createCollection("points");
	user_point = model.getData({u_id: u_id});
	current_point = user_point[user_point.length - 1].balance;
	console.log("User current point = "+current_point);
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

set_data();
userCurrentPoint();

function htr_extend(){
	if(htr_turn){
		$.htr_image.image = "/images/btn-forward2.png";
		var htr = $.UI.create("Label",{
			classes:['wfill','hsize','padding'],
			top:0,
			text:data.redeem,
		});
		$.htr.add(htr);
		htr_turn = false;
	}else if(!htr_turn){
		$.htr.removeAllChildren();
		$.htr_image.image = "/images/btn-forward1.png";
		htr_turn = true;
	}	
}

function tc_extend(){
	if(tc_turn){
		$.tc_image.image = "/images/btn-forward2.png";
		var tc = $.UI.create("Label",{
			classes:['wfill','hsize','padding'],
			top:0,
			text:data.tnc,
		});
		$.tc.add(tc);
		tc_turn = false;
	}else if(!tc_turn){
		$.tc.removeAllChildren();
		$.tc_image.image = "/images/btn-forward1.png";
		tc_turn = true;
	}	
}

if(!checking){
	$.save.setTitle("Saved Voucher");   //check voucher limit
	$.save.setEnabled(false);
}else if(checking){
	$.save.setTitle("Save Voucher");   //check voucher limit
	$.save.setEnabled(true);
}else if(quantity<=0){
	$.save.setTitle("Out of Stock");   //check voucher left
	$.save.setEnabled(false);
}

function doSave(){
	if(checkingForSave){   //avoid double click 
		if(data.point<=current_point){   //check user point
			console.log("voucher point "+data.point+" <= "+" user point "+current_point);
			checkingForSave = false;
			var params = {v_id: v_id,u_id: u_id,quantity: 1};
			API.callByPost({
				url: "addUserVoucher",
				new: true,
				params: params
			},{
			onload: function(res){
				var res = JSON.parse(res);
				var arr = res.data || null;
				console.log("Success to save "+arr);
				checkingForSave = true;
				alert("Success to save!");
			},
			onerror: function(err){
				console.log("Save voucher fail!");
			}});	
		}else{
			alert("Your points not enough!");
		}	
	}
}
$.win.addEventListener('android:back', function (e) {
	COMMON.closeWindow($.win); 
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
});