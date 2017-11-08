var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var htr_turn = true;
var tc_turn = true;
var checkingLimit = false;
var checkingForSave = true; 
var checkingClaimLimit = true;
var v_id = args.v_id;
//var voucher = Alloy.createCollection("voucher");
var data;// = args; //voucher.getDataById(v_id);
var user_point = [];
var current_point = 0;
var fristDate = "";
var secondDate = "";
var endsDay = "";
var loading = Alloy.createController("loading");
var pwidth = (OS_ANDROID)?pixelToDp(Titanium.Platform.displayCaps.platformWidth):Titanium.Platform.displayCaps.platformWidth;


function parseDate(str) {
    var mdy = str.split('-');
    return new Date(mdy[0], mdy[1]-1, mdy[2]);
}

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24)+1);
}

function getNowDate(){   //calculate the days between two dates
	var fristDate = data.save_to;
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
	endsDay = daydiff(parseDate(secondDate), parseDate(fristDate));	
	//$.days.setText(endsDay);
}

function zoom(url){
	transparentView = $.UI.create("View",{classes:['wfill','hfill'],backgroundColor:"#99000000",zIndex:10});
	var closeButton = $.UI.create("Label",{classes:['wsize','hsize'],color:"#fff",text:"Close",top:10,right:10,zIndex:10});
	var zoomImage = $.UI.create("WebView",{url:url,classes:['wfill','hsize'],backgroundColor:"transparent"});
	transparentView.add(zoomImage);
	transparentView.add(closeButton);
	closeButton.addEventListener("click",function(){
		$.win.remove(transparentView);
		zoomChecker = false;
	});
	zoomChecker = true;
	$.win.add(transparentView);	
}

function render_banner(){
	console.log((pwidth-20)+" how much");
		$.banner.image = data.thumb_image;
		if(OS_ANDROID){
			$.banner.addEventListener('click',function(e){
				zoom(e.source.image);
			});
		}else{
			$.banner.addEventListener('click',function(e){
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
					image: data.thumb_image,
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

function userCurrentPoint(){
	var model = Alloy.createCollection("points");
	user_point = model.getData({u_id: u_id});
	if(typeof user_point != "undefined"){
		current_point = user_point[user_point.length - 1].balance;
	}else{
		refresh();
	}
}

function createWhoops(t,e){
	var box = Titanium.UI.createAlertDialog({
		title: t,
		message: e,
		ok: "ok"
	});
	box.show();
};

function checkVoucherStatus(){
	API.callByPost({url:"checkHasValidVoucher",new:true,params:{u_id: u_id,v_id: v_id}},{onload:function(res){
		var r = JSON.parse(res);
		checkingLimit = r.data;
		console.log(checkingLimit+" checkingLimit");
		checkingVoucher();
	},onerror:function(err){}});
}

function checkVoucherLimit(){
	var model = Alloy.createCollection("MyVoucherV2");
	var voucherLimit = model.getCountLimitByVid(v_id);
	var limit = voucherLimit.count;
	console.log("number of voucher saved "+limit);
	if(data.limit==-1){
		checkingClaimLimit = true;
	}else if(limit>=data.limit){
		checkingClaimLimit = false;
		$.save.setTitle("Voucher Not Available");
		createWhoops("Whoops","You have reached the voucher save limit per user of this voucher, Please refer to the T&C.");
	}
}

function set_data(){
	var dateUseFrom = convertToHumanFormat(data.use_from);
	var dateUseTo = convertToHumanFormat(data.use_to);
	console.log(data.title+" title here!");
	$.title.setText(data.title);
	//if(left==-1){
		//$.leftV2.setText(" ");
		//$.leftV.setText("While Stocks Last");
	//}else{
		//$.leftV.setText(left);
	//}
	//$.point.setText(data.point);
	$.valid_date.text = "Valid from "+dateUseFrom+" to "+dateUseTo;
	$.desc.setText(data.description);
	//$.saved.setText((data.quantity==null)?"0":data.quantity);
	var tc = $.UI.create("Label",{
		classes:['wfill','hsize','padding'],
		top:0,
		left:20,
		text:data.tnc,
	});
	$.tc.add(tc);
	console.log(data.point+" check what cp");
	if (data.point==0) {
		//$.info.removeAllChildren();
		var ssaved = $.UI.create("View",{
			width: "33%",
			classes:["hsize","vert"],
			left: 0,
			zIndex: 1,
		});
		var saved_title = $.UI.create("Label",{
			text: "Saved",
			classes:["wsize","hsize","h5"],
			top: 5,
			color: "#a6a6a6"
		});
		var saved_data = $.UI.create("Label",{
			text: (data.quantity==null)?"0":data.quantity,
			classes:["wsize","hsize","h3","bold"]
		});
		var leftt = $.UI.create("View",{
			classes:["wfill","hsize","vert"],
			top: 0
		});
		var left_title = $.UI.create("Label",{
			text: "Left",
			classes:["wsize","hsize","h5"],
			top: 5,
			color: "#a6a6a6"
		});
		var left_data = $.UI.create("Label",{
			text: (data.left==-1)?"While Stock\nLast":data.left,
			textAlign: "center",
			classes: (data.left==-1)?["wsize","hsize","h5","bold"]:["wsize","hsize","h3","bold"]
		});
		var ends = $.UI.create("View",{
			width: "33%",
			classes:["hsize","vert"],
			right: 0,
			zIndex: 1,
		});
		var ends_title = $.UI.create("Label",{
			text: "Ends in",
			classes:["wsize","hsize","h5"],
			top: 5,
			color: "#a6a6a6"
		});
		var ends_data = $.UI.create("Label",{
			text: endsDay,
			classes:["wsize","hsize","h3","bold"]
		});
		var info = $.UI.create("View",{
			classes:["wfill","hsize"]
		});
		if (data.quantity==null || data.quantity==0 || data.quantity==1) {
			var vv = "Voucher";
		}else{
			var vv = "Vouchers";
		};
		var space1 = $.UI.create("Label",{
			text: vv,
			classes:["wsize","hsize","h5"],
			color: "#a6a6a6"
		});
		var space2 = $.UI.create("Label",{
			text: (endsDay==1?"Day":"Days"),
			classes:["wsize","hsize","h5"],
			color: "#a6a6a6"
		});
		if (data.left==0 || data.left==1) {
			var vvv = "Voucher";
		}else{
			var vvv = "Vouchers";
		};
		var space4 = $.UI.create("Label",{
			text: vvv,
			classes:["wsize","hsize","h5"],
			color: "#a6a6a6"
		});
		ssaved.add(saved_title);	
		ssaved.add(saved_data);
		ssaved.add(space1);
		leftt.add(left_title);
		leftt.add(left_data);
		if (data.left!=-1) {
			leftt.add(space4);
		}
		ends.add(ends_title);
		ends.add(ends_data);
		ends.add(space2);
		info.add(ssaved);
		info.add(leftt);
		info.add(ends);
		$.info.add(info);
		console.log("should be here, no point");
	}else{
		var ssaved = $.UI.create("View",{
			width: "25%",
			classes:["hsize","vert"],
			left: 0,
			backgroundColor:"#fff"
		});
		var saved_title = $.UI.create("Label",{
			text: "Saved",
			classes:["wsize","hsize","h5"],
			top: 5,
			color: "#a6a6a6"
		});
		var saved_data = $.UI.create("Label",{
			text: (data.quantity==null)?"0":data.quantity,
			classes:["wsize","hsize","h3","bold"]
		});
		var leftt = $.UI.create("View",{
			width: "25%",
			classes:["hsize","vert"],
			left: "25%",
			top: 0,
			backgroundColor:"#fff"
		});
		var left_title = $.UI.create("Label",{
			text: "Left",
			classes:["wsize","hsize","h5"],
			top: 5,
			color: "#a6a6a6"
		});
		var left_data = $.UI.create("Label",{
			text: (data.left==-1)?"While Stock\nLast":data.left,
			textAlign: "center",
			classes: (data.left==-1)?["wsize","hsize","h5","bold"]:["wsize","hsize","h3","bold"]
		});
		var ends = $.UI.create("View",{
			width: "25%",
			classes:["hsize","vert"],
			right: "25%",
			backgroundColor:"#fff"
		});
		var ends_title = $.UI.create("Label",{
			text: "Ends in",
			classes:["wsize","hsize","h5"],
			top: 5,
			color: "#a6a6a6"
		});
		var ends_data = $.UI.create("Label",{
			text: endsDay,
			classes:["wsize","hsize","h3","bold"]
		});
		var point = $.UI.create("View",{
			width: "25%",
			classes:["hsize","vert"],
			right: 0,
			backgroundColor:"#fff"
		});
		var point_title = $.UI.create("Label",{
			text: "CP",
			classes:["wsize","hsize","h5"],
			top: 5,
			color: "#a6a6a6"
		});
		var point_data = $.UI.create("Label",{
			text: data.point,
			classes:["wsize","hsize","h3","bold"]
		});
		var info = $.UI.create("View",{
			classes:["wfill","hsize"]
		});
		if (data.quantity==null || data.quantity==0 || data.quantity==1) {
			var vv = "Voucher";
		}else{
			var vv = "Vouchers";
		};
		var space1 = $.UI.create("Label",{
			text: vv,
			classes:["wsize","hsize","h5"],
			color: "#a6a6a6"
		});
		var space2 = $.UI.create("Label",{
			text: (endsDay==1?"Day":"Days"),
			classes:["wsize","hsize","h5"],
			color: "#a6a6a6"
		});
		var space3 = $.UI.create("Label",{
			text: "Points",
			classes:["wsize","hsize","h5"],
			color: "#a6a6a6"
		});
		if (data.left==0 || data.left==1) {
			var vvv = "Voucher";
		}else{
			var vvv = "Vouchers";
		};
		var space4 = $.UI.create("Label",{
			text: vvv,
			classes:["wsize","hsize","h5"],
			color: "#a6a6a6"
		});
		point.add(point_title);
		point.add(point_data);
		point.add(space3);
		ssaved.add(saved_title);	
		ssaved.add(saved_data);
		ssaved.add(space1);
		leftt.add(left_title);
		leftt.add(left_data);
		if (data.left!=-1) {
			leftt.add(space4);
		}
		ends.add(ends_title);
		ends.add(ends_data);
		ends.add(space2);
		info.add(point);
		info.add(ssaved);
		info.add(leftt);
		info.add(ends);
		$.info.add(info);
	};
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
		$.tc.height = Ti.UI.SIZE;
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
	if(checkingLimit){
		$.save.setTitle("Voucher Saved");   //check voucher limit
		$.save.setBackgroundColor("#a6a6a6");
		$.save.setEnabled(false);
	}else if(checkingLimit){
		$.save.setTitle("Save Voucher");   //check voucher limit
		$.save.setEnabled(true);
	}
	
	var now = new Date();
	var expired = false;
	now.setHours(8,0,0,0);
	var save_from = new Date(data.save_from);
	var save_to = new Date(data.save_to);
	console.log(data.save_from+" "+data.save_to+" "+now.toString());
	console.log(save_from.getTime()+" "+save_to.getTime()+" "+now.getTime());
	if(save_from.getTime() > now.getTime() && save_to.getTime() <= now.getTime()){
		console.log(save_from+" > "+now.getTime());
		console.log(save_to+" < ="+now);
		$.save.setTitle("Voucher Not Available");   //check voucher limit
		$.save.setBackgroundColor("#a6a6a6");
		$.save.setEnabled(false);
	}
	
	if(data.left==0){
		$.save.setTitle("Voucher Fully Saved");   //check voucher left
		$.save.setEnabled(false);
		$.save.setBackgroundColor("#a6a6a6");
	}	
}

function init(){
	$.win.add(loading.getView());
	refresh();
}
init();
	
function refresh(){
	loading.start();
	console.log(args.v_id+" vid here");
	API.callByPost({url: "getVoucherById",new: true, params:{v_id: args.v_id}}, {
		onload: function(responseText){
			var res = JSON.parse(responseText);
			if(res.status == "error"){
				alert(res.data);
			}else{
				data = res.data;
				getNowDate();
				set_data();
				if(u_id != ""){
					userCurrentPoint();
				}
				checkVoucherStatus();
				render_banner();
				setWindowTitle();
				addAdsClick();
			}
			loading.finish();
		}
	});	
}

function setWindowTitle(){
	if(data.point==0 || data.point==null){
		//$.pointView.opacity = 0;
		if(OS_IOS){
			$.win.setTitle("Instant Voucher");
		}else{
			$.pageTitle.setText("Instant Voucher");
		}
	}else{
		if(OS_IOS){
			$.win.setTitle("CP Voucher");
		}else{
			$.pageTitle.setText("CP Voucher");
		}
	}
}
	
function addAdsClick() {
	var params = {
		v_id:v_id,
		type:4,
		from:"reward",
		u_id:u_id
	};
	API.callByPost({url:"addAdsClick",new:true,params:params},{onload:function(res){},onerror:function(err){}});
}

function doSave(){
	if ($.save.getEnabled() != false) {
	if(checkingForSave){   //avoid double click 
		if(checkingClaimLimit){
			if(data.point<=current_point){   //check user point
			checkingForSave = false;
			var common = require('common');
			var title_voucher = (data.point!=0)?"CP Voucher":"Instant Voucher";
			var cpPoint = (data.point!=0)?"\nfor "+data.point+" CP points?":"?";
			common.createAlert(title_voucher,'Confirm to save this voucher'+cpPoint,function(ee){
				
				//save a voucher for earn point in daily
				var paramss = {u_id:u_id, action:'add', purpose:'8'};
				API.callByPost({
					url: "doPointAction",
					new: true,
					params: paramss
				},{
				onload: function(res){
					var res = JSON.parse(res);
					var arr = res.data || null;
				},
				onerror: function(err){
				}});
				
				//add voucher to saved voucher
				var params = {v_id: v_id,u_id: u_id,quantity: 1};
				API.callByPost({
					url: "addUserVoucher",
					new: true,
					params: params
				},{
				onload: function(res){
					var res = JSON.parse(res);
					var arr = res.data || null;
					checkingForSave = true;
					setTimeout(function(e){
						createWhoops("Voucher saved","You can view it under\nMy Rewards > Saved Vouchers");
					},1000);
					Ti.App.fireEvent("voucher:refresh");
					Ti.App.fireEvent("myvoucher:refresh");
					Ti.App.fireEvent("reward:refresh");
					COMMON.closeWindow($.win);
				},
				onerror: function(err){
				}});				
			},undefined,function(){
				checkingForSave = true;
			});	
		}else{
			createWhoops("Whoops","Sorry, you don't have enough CP points to save this voucher.");
		}	
		}else{
			createWhoops("Whoops","You have reached the voucher save limit per user of this voucher, Please refer to the T&C.");
		}
	}
	}else{
	}
}
$.win.addEventListener('android:back', function (e) {
	COMMON.closeWindow($.win); 
});
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
});