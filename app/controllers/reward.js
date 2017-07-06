var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var loading = Alloy.createController("loading");
var data = [], daily_data = [], point_list=[];
var pwidth = Titanium.Platform.displayCaps.platformWidth;
var SCANNER = require("scanner");
var tabColor = $.tab0;
var tabviewColor = $.tabview0;
var vmodel = Alloy.createCollection("voucher");
var myvmodel = Alloy.createCollection("MyVoucher");
if (OS_IOS){
//iOS only module

var Social = require('dk.napp.social');

// find all Twitter accounts on this phone
if(Social.isRequestTwitterSupported()){ //min iOS6 required
    var accounts = []; 
    Social.addEventListener("accountList", function(e){
    	Ti.API.info("Accounts:");
    	accounts = e.accounts; //accounts
    	Ti.API.info(accounts);
    });
    
    Social.twitterAccountList();
}

console.log(pwidth);
console.log(pixelToDp(pwidth)+"beng");

if (OS_IOS) {
	$.tab2Width.width = "33.5%";
};

Social.addEventListener("complete", function(e){
		Ti.API.info("complete: " + e.success);

		if (e.platform == "activityView" || e.platform == "activityPopover") {
			switch (e.activity) {
				case Social.ACTIVITY_TWITTER:
					Ti.API.info("User is shared on Twitter");
					break;
				case Social.ACTIVITY_FACEBOOK:
					Ti.API.info("User is shared on Facebook");
					break;
				case Social.ACTIVITY_CUSTOM:
					Ti.API.info("This is a customActivity: " + e.activityName);
					break;
			}
		}
	});
	
	Social.addEventListener("error", function(e){
		Ti.API.info("error:");	
		Ti.API.info(e);	
	});
	
	Social.addEventListener("cancelled", function(e){
		Ti.API.info("cancelled:");
		Ti.API.info(e);		
	}); 
	Social.addEventListener("customActivity", function(e){
		Ti.API.info("customActivity");	
		Ti.API.info(e);	
		
	});
}

//if(OS_ANDROID) {
//	$.swiperefresh.addEventListener("refreshing", function (e) {
//		refreshVlist();
//		e.source.setRefreshing(false);
//	});
//}

function refresh(){
	loading.start();
	API.callByPost({
		url: "getMemberPointsRecords",
		new: true,
		params: {u_id: u_id}
	}, 
	{
		onload: function(responseText){
			var model = Alloy.createCollection("points");
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			model.saveArray(arr);
			data = model.getData({u_id: u_id});
			daily_data = model.getData({u_id: u_id, daily: true});
			console.log(data);
			render_current_point();
			render_point_list();
			loading.finish();
		},
		onerror: function(err){
			_.isString(err.message) && alert(err.message);
			loading.finish();
		},
		onexception: function(){
			COMMON.closeWindow($.win);
			loading.finish();
		}
	});
	
	API.callByPost({
		url: "pointDescList",
		new: true,
	}, 
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			point_list = res.data || null;
			point_list.pop();
			console.log(point_list);
			render_point_list();
		},
		onerror: function(err){
			_.isString(err.message) && alert(err.message);
		},
		onexception: function(){
			COMMON.closeWindow($.win);
		}
	});
}

function render_current_point(){
	if(data.length > 0){
		$.current_point.text = data[data.length - 1].balance;
	}else{
		$.current_point.text = "0";
	}
}

function render_point_list(){
	var arr = [];
	for (var i=0; i < point_list.length; i++) {
		console.log(point_list[i].title);
		var found;
		if(point_list[i].daily){
			found = _.where(daily_data, {purpose: point_list[i].id});
		}else{
			found = _.where(data, {purpose: point_list[i].id});
		}
		var task_yes_no_path = (found.length>0)?task_yes = "/images/Icon_Reward_Unlocked.png":"/images/Icon_Reward_Locked.png";
		var checked = (found.length>0)?true:false;
		_.extend(point_list[i], {checked: checked});
		var row = $.UI.create("TableViewRow", {classes:['horz','hsize'], record: point_list[i]});
		var task_yes_no = $.UI.create("ImageView", {image: task_yes_no_path, classes:['hsize'], top:20, left:20, right:20, width: 15});
		var view_mid = $.UI.create("View", {classes:['vert','hsize'], top:10, bottom:10, width: c_percent("63%", pwidth)});
		var label_title = $.UI.create("Label", {classes:['wfill','hsize','h5'], text: point_list[i].title});
		var label_subtitle = $.UI.create("Label", {classes:['wfill','hsize','h6'], text: point_list[i].subtitle});
		var view_last = $.UI.create("View", {classes:['hsize','wsize'], left:10});
		var view_container_point = $.UI.create("View", {classes:['wsize','hsize','horz']});
		var img_icon = $.UI.create("ImageView", {width: 15, top: 5, right: 5, height: 15, image: "/images/Icon_CashPoint_Flat_Medium.png"});
		var label_point = $.UI.create("Label", {classes: ['wsize','hsize','h5'], top:3,  text: point_list[i].points});
		view_container_point.add(img_icon);
		view_container_point.add(label_point);
		view_last.add(view_container_point);
		view_mid.add(label_title);
		view_mid.add(label_subtitle);
		row.add(task_yes_no);
		row.add(view_mid);
		row.add(view_last);
		arr.push(row);
	};
	$.point_list.setData(arr);
	$.point_list.addEventListener("click", navTo);
}

var api_loading = false;
function navTo(e){
	var row = e.row;
	console.log(row.record);
	loading.start();
	if(row.record.id == 2){
		if(!row.record.checked && !api_loading){
			api_loading = true;
			API.callByPost({
				url: "doPointAction",
				new: true,
				params: {u_id: u_id, action: "add", purpose: row.record.id}
			}, 
			{
				onload: function(responseText){
					refresh();
					loading.finish();
					api_loading = false;
				},
				onerror: function(err){
					_.isString(err.message) && alert(err.message);
					loading.finish();
					api_loading = false;
				},
				onexception: function(){
					COMMON.closeWindow($.win);
					loading.finish();
					api_loading = false;
				}
			});
		}
		loading.finish();
	}else if(row.record.id == 3){
		loading.start();
		API.callByPost({
				url: "encrypt_uid",
				new: true,
				params: {u_id: u_id}
			}, 
			{
				onload: function(responseText){
					var res = JSON.parse(responseText);
					var encrypt_code = res.data || null;

					var share_url = "http://salesad.my/users/member_referral?referral="+encrypt_code;
					if(OS_IOS){
						if(Social.isActivityViewSupported()){ //min iOS6 required
					    	Social.activityView({
					        	text: "SalesAd. Please signup via the link : "+share_url,
					        	//url: "http://apple.co/1RtrCZ4"
					     	});
					     } else {
					     	//implement fallback sharing..
					     }
					}else{
					    var text = "SalesAd. Please signup via the link : "+share_url;
					  
					    var intent = Ti.Android.createIntent({
					        action: Ti.Android.ACTION_SEND,
					        type: "text/plain",
					    });
					    intent.putExtra(Ti.Android.EXTRA_TEXT,text);
					    intent.putExtra(Ti.Android.EXTRA_SUBJECT, "Salesad Invite Friend");
					    var share = Ti.Android.createIntentChooser(intent,'Share');
						Ti.Android.currentActivity.startActivity(share);
					}
					
					loading.finish();
				},
				onerror: function(err){
					_.isString(err.message) && alert(err.message);
					loading.finish();
				},
				onexception: function(){
					COMMON.closeWindow($.win);
					loading.finish();
				}
			});
	}else if(row.record.id == 4){
		if(!row.record.checked){
			SCANNER.openScanner("4");
		}
		loading.finish();
	}else if(row.record.id == 1){
		loading.finish();
	}else if(row.record.id == 6){
		if(!row.record.checked){
			var favor_pop_up = $.UI.create("ImageView", {classes:['hsize','wfill','padding'], image: "/images/Popup_Rewards_Favorite.png"});
			$.win.add(favor_pop_up);
			favor_pop_up.addEventListener("click", function(e){
				$.win.remove(e.source);
			});
			loading.finish();
		}
		loading.finish();
	}
}

function init(){
	$.win.add(loading.getView());
	refresh();
	refreshVlist();
	refreshSVlist();
}

init();

function Tab(e) {
	$.scrollview.scrollToView(e.source.num);
}

function vouchers(e) {
	if(OS_ANDROID){
		cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	}else{
		cell_width = Math.floor(pwidth / 2) - 15;
	}
	
	$.voucher_view.removeAllChildren();
	
	e.forEach(function(entry){
		if(entry.item_id != null){
			var item = Alloy.createCollection("items");
			var image = item.getImageByI_id(entry.item_id);
			entry.thumb_image = image;
		}
		var View1 = $.UI.create("View", {
			classes: ['hsize', 'vert'],
			width: cell_width,
			left: 9,
			top: 9
		});
		var viewimg = $.UI.create("View", {
			classes: ['wfill', 'vert'],
			height: cell_width,
			backgroundColor: "#fff"
		});
		var img = $.UI.create("ImageView", {
			classes: ['wfill', 'hsize'],
			image: entry.thumb_image,
			defaultImage: "/images/image_loader_640x640.png",
			v_id: entry.v_id,
			m_id: entry.m_id
		});
		var View2 = $.UI.create("View", {
			classes: ['wfill', 'hsize', 'vert'],
			backgroundColor: "#fff"
		});
		var View3 = $.UI.create("View", {
			classes: ['wfill', 'hsize'],
			left: 5,
			right: 5,
			top: 5
		});
		var VQuantity = (OS_IOS) ? $.UI.create("Label", {
			classes: ['wsize', 'h5'],
			height: 19,
			text: (entry.quantity != null) ? entry.quantity + " saved" : "0 saved",
			color: "#ED1C24",
			left: 0
		}) : $.UI.create("Label", {
			classes: ['wsize', 'h5'],
			height: 19,
			ellipsize: true,
			wordWrap: false,
			text: (entry.quantity != null) ? entry.quantity + " saved" : "0 saved",
			color: "#ED1C24",
			left: 0
		});
		var ViewPoint = $.UI.create("View", {
			classes: ['wsize', 'hsize', 'horz'],
			right: 0
		});
		var VPoint = $.UI.create("Label", {
			classes: ['wsize', 'h5'],
			height: 19,
			text: (entry.point != 0) ? entry.point : "",
			color: "#ED1C24",
			right: 0
		});
		var pointimg = (entry.point != 0 && entry.point != null) ? $.UI.create("ImageView", {
			width: 15,
			height: 15,
			image: "/images/Icon_CashPoint_Flat_Medium.png"
		}) : $.UI.create("ImageView", {
			width: 15,
			height: 15,
			image: ""
		});
		var title = (OS_IOS) ? $.UI.create("Label", {
			classes: ['wsize', 'h5', 'bold'],
			height: 19,
			text: entry.title,
			left: 5,
			right: 5,
			bottom: 5
		}) : $.UI.create("Label", {
			classes: ['wsize', 'h5', 'bold'],
			height: 19,
			ellipsize: true,
			wordWrap: false,
			text: entry.title,
			left: 5,
			right: 5,
			bottom: 5
		});
		
		img.addEventListener("click", toVoucher);
		viewimg.add(img);
		View1.add(viewimg);
		View1.add(View2);
		View2.add(View3);
		View3.add(VQuantity);
		ViewPoint.add(pointimg);
		ViewPoint.add(VPoint);
		View3.add(ViewPoint);
		View2.add(title);
		$.voucher_view.add(View1);
		
		View1 = null;
		viewimg = null;
		img = null;
		View2 = null;
		View3 = null;
		VQuantity = null;
		VPoint = null;
		pointimg = null;
		ViewPoint = null;
		title = null;
	});
	
	var view_height = $.UI.create("View", {
		width:"100%",
		height: 70
	});
	$.voucher_view.add(view_height);
	
	view_height = null;
}

function ins_voucher(e) {
	$.ins_view.setBackgroundColor("#ED1C24");
	$.ins_label.setColor("#fff");
	$.gift_view.setBackgroundColor("#fff");
	$.gift_label.setColor("gray");
	var vdata = vmodel.getInstant(false);
	vouchers(vdata);
}

function gift_voucher(e) {
	$.gift_view.setBackgroundColor("#ED1C24");
	$.gift_label.setColor("#fff");
	$.ins_view.setBackgroundColor("#fff");
	$.ins_label.setColor("gray");
	var vdata = vmodel.getGift(false);
	vouchers(vdata);
}

function savedvoucher(e) {
	if(OS_ANDROID){
		cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	}else{
		cell_width = Math.floor(pwidth / 2) - 15;
	}
	
	$.ongoingV.removeAllChildren();
	$.expiredV.removeAllChildren();
	
	$.ongoingV.add($.UI.create("Label", {classes: ['wfill', 'hsize'], bottom: 5, color: "black", text: "Ongoing Vouchers", textAlign: "center"}));
	$.ongoingV.add($.UI.create("View", {classes:['hr'], backgroundColor: "#000"}));
	$.ongoingV.add($.UI.create("Label", {classes: ['wfill', 'hsize'], id: "T1", top: 90, bottom: 90, textAlign: "center", text: "You have no ongion vouchers at this moment."}));
	
	$.expiredV.add($.UI.create("Label", {classes: ['wfill', 'hsize'], bottom: 5, color: "black", text: "Expired Vouchers", textAlign: "center"}));
	$.expiredV.add($.UI.create("View", {classes:['hr'], backgroundColor: "#000"}));
	$.expiredV.add($.UI.create("Label", {classes: ['wfill', 'hsize'], id: "T2", top: 90, bottom: 90, textAlign: "center", text: "You have no expired vouchers at this moment."}));
	
	var ongiongVC = myvmodel.ongoingvoucher(true);
	var expireVC = myvmodel.expirevoucher(true);
	
	ongiongVC.forEach(function (entry) {
		if(entry.item_id != null){
			var item = Alloy.createCollection("items");
			var image = item.getImageByI_id(entry.item_id);
			entry.image = image;
		}
		var container = $.UI.create("View", {
			classes: ['hsize'],
			width: cell_width,
			left: 9,
			top: 9
		});
		var delBT = $.UI.create("ImageView", {
			width: 30,
			height: 30,
			image: "/images/Icon_Delete_Round.png",
			My_vid: entry.My_vid,
			top: 2,
			right: 2,
			zIndex: 10
		});
		var View1 = $.UI.create("View", {
			classes: ['wfill', 'hsize', 'vert']
		});
		var viewimg = $.UI.create("View", {
			classes: ['wfill', 'vert'],
			height: cell_width,
			backgroundColor: "#fff"
		});
		var img = $.UI.create("ImageView", {
			classes: ['wfill', 'hsize'],
			image: entry.image,
			defaultImage: "/images/image_loader_640x640.png",
			My_vid: entry.My_vid,
			v_id: entry.v_id,
			m_id: entry.m_id,
			use: true
		});
		var View2 = $.UI.create("View", {
			classes: ['wfill', 'hsize', 'vert'],
			backgroundColor: "#fff"
		});
		var View3 = $.UI.create("View", {
			classes: ['wfill', 'hsize'],
			left: 5,
			right: 5,
			top: 5
		});
		var VQuantity = (OS_IOS) ? $.UI.create("Label", {
			classes: ['wsize', 'h5'],
			height: 19,
			text: entry.quantity + " saved",
			color: "#ED1C24",
			left: 0
		}) : $.UI.create("Label", {
			classes: ['wsize', 'h5'],
			height: 19,
			text: entry.quantity + " saved",
			color: "#ED1C24",
			left: 0
		});
		var ViewPoint = $.UI.create("View", {
			classes: ['wsize', 'hsize', 'horz'],
			right: 0
		});
		var VPoint = $.UI.create("Label", {
			classes: ['wsize', 'h5'],
			height: 19,
			text: (entry.point != 0) ? entry.point : "",
			color: "#ED1C24",
			right: 0
		});
		var pointimg = (entry.point != 0 && entry.point != null) ? $.UI.create("ImageView", {
			width: 15,
			height: 15,
			image: "/images/Icon_CashPoint_Flat_Medium.png"
		}) : $.UI.create("ImageView", {
			width: 15,
			height: 15,
			image: ""
		});
		var title = (OS_IOS) ? $.UI.create("Label", {
			classes: ['wsize', 'h5', 'bold'],
			height: 19,
			text: entry.title,
			left: 5,
			right: 5,
			bottom: 5
		}) : $.UI.create("Label", {
			classes: ['wsize', 'h5', 'bold'],
			height: 19,
			ellipsize: true,
			wordWrap: false,
			text: entry.title,
			left: 5,
			right: 5,
			bottom: 5
		});
		
		delBT.addEventListener("click", delvoucher);
		img.addEventListener("click", toSaveVoucher);
		container.add(View1);
		container.add(delBT);
		View1.add(viewimg);
		viewimg.add(img);
		View1.add(View2);
		//View2.add(View3);
		View3.add(VQuantity);
		ViewPoint.add(pointimg);
		ViewPoint.add(VPoint);
		View3.add(ViewPoint);
		View2.add(title);
		$.ongoingV.add(container);
		
		View1 = null;
		viewimg = null;
		img = null;
		View2 = null;
		View3 = null;
		VQuantity = null;
		VPoint = null;
		pointimg = null;
		ViewPoint = null;
		title = null;
	});
	
	expireVC.forEach(function (entry) {
		if(entry.item_id != null){
			var item = Alloy.createCollection("items");
			var image = item.getImageByI_id(entry.item_id);
			entry.image = image;
		}		
		var container = $.UI.create("View", {
			classes: ['hsize'],
			width: cell_width,
			left: 9,
			top: 9
		});
		var delBT = $.UI.create("ImageView", {
			width: 30,
			height: 30,
			image: "/images/Icon_Delete_Round.png",
			My_vid: entry.My_vid,
			top: 2,
			right: 2,
			zIndex: 10
		});
		var View1 = $.UI.create("View", {
			classes: ['wfill', 'hsize', 'vert']
		});
		var viewimg = $.UI.create("View", {
			classes: ['wfill', 'vert'],
			height: cell_width,
			backgroundColor: "#fff"
		});
		var img = $.UI.create("ImageView", {
			classes: ['wfill', 'hsize'],
			image: entry.image,
			defaultImage: "/images/image_loader_600x800.png",
			My_vid: entry.My_vid,
			v_id: entry.v_id,
			m_id: entry.m_id,
			use: false
		});
		var View2 = $.UI.create("View", {
			classes: ['wfill', 'hsize', 'vert'],
			backgroundColor: "#fff"
		});
		var View3 = $.UI.create("View", {
			classes: ['wfill', 'hsize'],
			left: 5,
			right: 5,
			top: 5
		});
		var VQuantity = (OS_IOS) ? $.UI.create("Label", {
			classes: ['wsize', 'h5'],
			height: 19,
			text: entry.quantity + " saved",
			color: "#ED1C24",
			left: 0
		}) : $.UI.create("Label", {
			classes: ['wsize', 'h5'],
			height: 19,
			ellipsize: true,
			wordWrap: false,
			text: entry.quantity + " saved",
			color: "#ED1C24",
			left: 0
		});
		var ViewPoint = $.UI.create("View", {
			classes: ['wsize', 'hsize', 'horz'],
			right: 0
		});
		var VPoint = $.UI.create("Label", {
			classes: ['wsize', 'h5'],
			height: 19,
			text: (entry.point != 0) ? entry.point : "",
			color: "#ED1C24",
			right: 0
		});
		var pointimg = (entry.point == 0 || entry.point == null) ? $.UI.create("ImageView", {
			width: 15,
			height: 15,
			image: ""
		}) : $.UI.create("ImageView", {
			width: 15,
			height: 15,
			image: "/images/Icon_CashPoint_Flat_Medium.png"
		});
		var title = (OS_IOS) ? $.UI.create("Label", {
			classes: ['wsize', 'h5', 'bold'],
			height: 19,
			text: entry.title,
			left: 5,
			right: 5,
			bottom: 5
		}) : $.UI.create("Label", {
			classes: ['wsize', 'h5', 'bold'],
			height: 19,
			ellipsize: true,
			wordWrap: false,
			text: entry.title,
			left: 5,
			right: 5,
			bottom: 5
		});
		
		delBT.addEventListener("click", delvoucher);
		img.addEventListener("click", toSaveVoucher);
		container.add(View1);
		container.add(delBT);
		View1.add(viewimg);
		viewimg.add(img);
		View1.add(View2);
		//View2.add(View3);
		View3.add(VQuantity);
		ViewPoint.add(pointimg);
		ViewPoint.add(VPoint);
		View3.add(ViewPoint);
		View2.add(title);
		$.expiredV.add(container);
		
		View1 = null;
		viewimg = null;
		img = null;
		View2 = null;
		View3 = null;
		VQuantity = null;
		VPoint = null;
		pointimg = null;
		ViewPoint = null;
		title = null;
	});
	
	if($.ongoingV.children.length > 3) {
		$.ongoingV.remove($.ongoingV.children[2]);
	}
	if($.expiredV.children.length > 3) {
		$.expiredV.remove($.expiredV.children[2]);
	}
}

function toVoucher(e) {
	COMMON.openWindow(Alloy.createController("voucher_detail",{v_id: e.source.v_id}).getView());
}

function toSaveVoucher(e) {
	COMMON.openWindow(Alloy.createController("saved_voucher",{My_vid: e.source.My_vid,use:e.source.use}).getView());	
}

function delvoucher(e) {
	COMMON.createAlert("Alert", "Are you sure want to delete it?", function(ex){
		API.callByPost({
			url: "updateUserVoucher",
			new: true,
			params: {
				id: e.source.My_vid,
				status: 0
			}
		}, {
			onload: function(responseText) {
				var model = Alloy.createCollection("MyVoucher");
				var res = JSON.parse(responseText);
				var arr = res.data || null;
				model.resetRecord();
				refreshSVlist();
			},onerror: function(err) {
				_.isString(err.message) && alert(err.message);
			},onexception: function() {
				COMMON.closeWindow($.win);
			}
		});
	});
}

function refreshVlist(e) {
	var checker = Alloy.createCollection('updateChecker');
	var isUpdate = checker.getCheckerById("12");
	
	API.callByPost({
		url: "getVoucherList",
		new: true,
		params: {last_updated: isUpdate.update}
	},{
		onload: function(responseText) {
			var model = Alloy.createCollection("voucher");
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			model.saveArray(arr);
			ins_voucher();
			loading.finish();
		},onerror: function(err) {
			_.isString(err.message) && alert(err.message);
			loading.finish();
		},onexception: function() {
			COMMON.closeWindow($.win);
			loading.finish();
		}
	});
}

function refreshSVlist(e) {
	var checker = Alloy.createCollection('updateChecker');
	var isUpdate = checker.getCheckerById("13");
	
	API.callByPost({
		url:"getUserVoucherList",
		new: true,
		params: {u_id: u_id,last_updated:isUpdate.update}
	},{
		onload:function(responseText){
			var model = Alloy.createCollection("MyVoucher");
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			model.resetRecord();
			model.saveArray(arr);
			savedvoucher();
			loading.finish();
		},onerror:function(err){
			_.isString(err.message) && alert(err.message);
			loading.finish();
		},onexception:function(){
			COMMON.closeWindow($.win);
			loading.finish();
		}
	});
}

//event listener
Ti.App.addEventListener('reward:refresh', refresh);
Ti.App.addEventListener('voucher:refresh', refreshVlist);
Ti.App.addEventListener('myvoucher:refresh', refreshSVlist);

function c_percent(percent, relative) {
    var percentInt = percent.replace("%", "");
    var percentInt = parseInt(percentInt);
    console.log(Math.round(percentInt * (relative / 100)));
    return (OS_ANDROID)?pixelToDp(Math.round(percentInt * (relative / 100))):Math.round(percentInt * (relative / 100));
};

function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

$.scrollview.addEventListener("scrollend", function(e) {
	if(e.currentPage != undefined) {
		try{
			tabColor.setColor("gray");
			tabviewColor.setBackgroundColor("#fff");
			var tabid = eval("$.tab" + e.currentPage);
			var tabviewid = eval("$.tabview" + e.currentPage);
			tabColor = tabid;
			tabviewColor = tabviewid;
			tabColor.setColor("#fff");
			tabviewColor.setBackgroundColor("#ED1C24");
		}catch(e){
			console.log("Error catched");
		}
	}
});

$.voucher_scrollview.addEventListener("scroll", function(e) {
	var scrollEnd = $.voucher_view.rect.height;console.log("scrollend " + scrollEnd);
	var total = (OS_ANDROID)?pixelToDp(e.y)+e.source.rect.height: e.y+e.source.rect.height;console.log("total " + total);
	var distance = scrollEnd - total;console.log("dstance " + distance);
	
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener("close", function(){
	Ti.App.removeEventListener('reward:refresh', refresh);
});

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});