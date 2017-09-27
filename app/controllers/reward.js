var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var loading = Alloy.createController("loading");
var data = [], daily_data = [], point_list=[];
var pwidth = Titanium.Platform.displayCaps.platformWidth;
var SCANNER = require("scanner");
var tabColor = $.tab0;
var tabviewColor = $.tabview0;
var myvmodel = Alloy.createCollection("MyVoucher");
var boll = true;
var add_impression = [];

if(OS_ANDROID){
	cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	$.swipeRefresh.addEventListener('refreshing', function(e) {
		if($.voucher_scrollview.voucherrefreshing) {
			e.source.setRefreshing(false);
			$.voucher_scrollview.voucherrefreshing = false;
			$.voucher_scrollview.ins_vouchercount = 0;
			$.voucher_scrollview.gift_vouchercount = 0;
			$.voucher_view.alltitle = [];
			refreshVlist();
		}
	});
}else{
	cell_width = Math.floor(pwidth / 2) - 15;
	var control = Ti.UI.createRefreshControl({
    	tintColor:"#00CB85"
	});
	$.voucher_scrollview.refreshControl = control;
	control.addEventListener('refreshstart',function(e){
	    Ti.API.info('refreshstart');
	    setTimeout(function(e){
	        Ti.API.debug('Timeout');
	        $.voucher_scrollview.scrollTo(0,0,true);	
			setTimeout(function(){
				$.voucher_scrollview.voucherrefreshing = false;
				$.voucher_scrollview.ins_vouchercount = 0;
				$.voucher_scrollview.gift_vouchercount = 0;
				$.voucher_view.alltitle = [];
				refreshVlist();
			},500);	        
	        control.endRefreshing();
	    }, 1000);
	});
}

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
	u_id = Ti.App.Properties.getString('u_id') || "";	
	loading.start();
	API.callByPost({
		url: "getMemberPointsRecords",
		new: true,
		params: {u_id: u_id}
	}, 
	{
		onload: function(responseText){
			console.log("asdf");
			var model = Alloy.createCollection("points");
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			model.saveArray(arr);
			data = model.getData({u_id: u_id});
			daily_data = model.getData({u_id: u_id, daily: true});
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

var bol = true;
function render_point_list(){
	var arr = [];
	for (var i=0; i < point_list.length; i++) {
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
	if(bol) {
		bol = false;
		$.point_list.addEventListener("click", navTo);
	}
}

var api_loading = false;
function navTo(e){
	var row = e.row;
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
		createWhoops1("Invite a friend","Send an invitation to a friend to download SalesAd app.\nOnce your friend signed up as a user, you will get 30 points.\n\nNote: Your friend will need to key in the same email address in the invitation link and in the sign up process for you to get points.","Invite Now",function(){
				COMMON.openWindow(Alloy.createController("friend_invite").getView());
				loading.finish();
		});
	}else if(row.record.id == 4){
		if(!row.record.checked){
			SCANNER.openScanner("4");
		}
		loading.finish();
	}else if(row.record.id == 1){
		createWhoops1("Sign Up","Get 50 points when you sign up a SalesAd account for yourself.","ok");
		loading.finish();
	}else if(row.record.id == 6){
		//if(!row.record.checked){
			createWhoops1("Favorite a store","To “favorite” a store, visit any ad and tap on the Favorite icon at the bottom of the screen.\nYou can get up to 30 points per day for this goal.","ok");
			loading.finish();
		//}
		loading.finish();	
	}else if(row.record.id == 7){
		createWhoops1("Daily ad view","Tap into an ad to get 5 points.\nYou can only get points once per day for this goal.","ok");
		loading.finish();
	}else if(row.record.id == 8){
		createWhoops1("Save a voucher","Save a voucher to get 5 points.\nYou can get up to 15 points per day for this goal.","ok");
		loading.finish();
	}
	bol = true;
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	$.voucher_scrollview.vouchertype = "ins_voucher";
	$.voucher_scrollview.ins_vouchercount = 0;
	$.voucher_scrollview.gift_vouchercount = 0;
	$.voucher_scrollview.voucherrefreshing = true;
	$.voucher_scrollview.scrollcheck = true;
	$.voucher_scrollview.scrolldata = 1;
	$.voucher_view.alltitle = [];
	refreshVlist("refreshSVlist");
	
	if(args.savedvoucher != undefined) {
		refreshSVlist();
		$.scrollview.scrollToView(1);
	}
}

init();

function Tab(e) {
	$.scrollview.scrollToView(e.source.num);
}
function chk_array(arr,value){
	return arr.every(function(e){
		return e != value; 
	});
}
function vouchers(e, str) {
	var params = [];
	for(key in e) {
		var parent = $.UI.create("View", {
			classes: ['wfill', 'hsize', 'vert'],
			top: 10
		});
		
		var child = $.UI.create("View", {
			classes: ['wfill', 'hsize', 'horz']
		});
		
		var hr = $.UI.create("View", {
			classes: ['hr']
		});
		
		var title = $.UI.create("Label", {
			classes: ['wfill', 'hsize', 'small-padding', 'bold'],
			color: "#000",
			left: 10,
			bottom: 5,
			text: e[key].title
		});
		$.voucher_view.alltitle.push(e[key].title);
		$.voucher_view.bol = true;
		
		e[key].child.forEach(function(entry) {
			var count = 0;
			if(params.length > 0) {
				if(params.every(function(currentValue, index, arr) {
					count = index;
					return currentValue != entry.a_id;
				}) || count == params.length) {
					params.push(entry.a_id);
				}
			}else {
				params.push(entry.a_id);
			}
			if (chk_array(add_impression,entry.a_id)) {
				add_impression.push(entry.a_id);
				console.log(add_impression.join()+" added");
			};
			count = null;
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
			child.add(View1);
			
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
		if($.voucher_scrollview.ins_vouchercount > 0) {
			var bol = false;
			var count = 0;
			for(var i = 0; i < $.voucher_view.alltitle.length - 1; i++) {
				count = i;
				if($.voucher_view.alltitle[i] == e[key].title) {//console.log("set true");
					bol = true;
					break;
				}else if(count == $.voucher_view.alltitle.length - 1) {//console.log("set false");
					bol = false;
				}
			}
			if(bol) {//console.log("in true child add");
				$.voucher_view.childadd = true;
			}else {//console.log("in false child add");
				$.voucher_view.childadd = false;
				parent.add(title);
				parent.add(hr);
			}
			count = null;
		}else {
			$.voucher_view.childadd = false;
			parent.add(title);
			parent.add(hr);
		}
		parent.add(child);
		if($.voucher_view.getChildren().length > 0) {//console.log("voucher length biger then 0");
			if($.voucher_view.childadd) {
				for(var i = 0; i < child.getChildren().length; i++) {
					$.voucher_view.lastchild.add(child.getChildren()[i]);
					$.voucher_view.changechild = false;
				}
			}else {//console.log("else in");
				$.voucher_view.add(parent);
				$.voucher_view.changechild = true;
			}
		}else {
			$.voucher_view.add(parent);
			$.voucher_view.changechild = true;
		}
		if($.voucher_view.changechild) {//console.log("change child");
			$.voucher_view.lastchild = child;
		}
		
		parent = null;
		title = null;
		hr = null;
		child = null;
	}
	if(str == "refreshSVlist") {
		refreshSVlist(params);
	}
	loading.finish();
	boll = true;
	$.voucher_scrollview.voucherrefreshing = true;
	$.voucher_scrollview.scrollcheck = true;
	$.voucher_scrollview.ins_vouchercount += 8;
	params = null;
}

function to_ins_voucher(e) {
	$.voucher_scrollview.ins_vouchercount = 0;
	ins_voucher();
}

function ins_voucher(str) {
	if(boll) {
		loading.start();
		boll = false;
		$.voucher_scrollview.vouchertype = "ins_voucher";
		$.ins_view.setBackgroundColor("#ED1C24");
		$.ins_label.setColor("#fff");
		$.gift_view.setBackgroundColor("#fff");
		$.gift_label.setColor("gray");
		var vmodel = Alloy.createCollection("voucher");
		var vdata = vmodel.getInstant(false, $.voucher_scrollview.ins_vouchercount);
		var arr = [];
		vdata.forEach(function(e) {
			var key = (e.name != "" || e.name !=  null) ? e.name : "Others";
			arr[key] = arr[key] || {};
			arr[key].title = key;
			arr[key].child = arr[key].child || [];
			arr[key].child.push(e);
		});
		if($.voucher_scrollview.ins_vouchercount == 0) {
			$.voucher_view.removeAllChildren();
		}
		$.voucher_scrollview.scrolldata = vdata.length;
		console.log("length:"+vdata.length+" asdf:"+JSON.stringify(vdata));
		scrollChecker = (vdata.length == 0) ? false :true;
		$.nothingText.text = (vdata.length == 0 && $.voucher_view.children.length == 0)?"Sorry, we don't have any instant vouchers to show right now":"";			
		vouchers(arr, str);
		vmodel = null;
		vdata = null;
		arr = null;
	}
}

function toGiftvoucher(e){
	$.voucher_scrollview.gift_vouchercount = 0;
	gift_voucher();
}

function gift_voucher(e) {
	if(boll) {
		loading.start();
		boll = false;
		$.voucher_scrollview.vouchertype = "gift_voucher";
		$.gift_view.setBackgroundColor("#ED1C24");
		$.gift_label.setColor("#fff");
		$.ins_view.setBackgroundColor("#fff");
		$.ins_label.setColor("gray");
		
		var vmodel = Alloy.createCollection("voucher");
		var vdata = vmodel.getGift(false, $.voucher_scrollview.gift_vouchercount);
		if($.voucher_scrollview.gift_vouchercount == 0) {
			$.voucher_view.removeAllChildren();
		}
		if(vdata.length > 0) {
			$.voucher_scrollview.scrolldata = vdata.length;
			list_voucher(vdata, "gift");
		}else {
			scrollChecker = (vdata.length == 0) ? false :true;
			$.nothingText.text = (vdata.length == 0)?"Sorry, we don't have any CP vouchers to show right now":"";							
			loading.finish();
			boll = true;
		}
	}
}

function savedvoucher(params) {
	$.ongoingVoucher.removeAllChildren();
	$.expiredVoucher.removeAllChildren();
// 	
	// $.ongoingV.add($.UI.create("Label", {classes: ['wfill', 'hsize'], bottom: 5, color: "black", text: "Ongoing Vouchers", textAlign: "center"}));
	// $.ongoingV.add($.UI.create("View", {classes:['hr', 'wfill'], backgroundColor: "#000"}));
	// $.ongoingV.add($.UI.create("Label", {classes: ['wfill'], id: "T1", height: 180, textAlign: "center", text: "You have no ongoing vouchers at this moment."}));
// 	
	// $.expiredV.add($.UI.create("Label", {classes: ['wfill', 'hsize'], bottom: 5, color: "black", text: "Expired Vouchers", textAlign: "center"}));
	// $.expiredV.add($.UI.create("View", {classes:['hr', 'wfill'], backgroundColor: "#000"}));
	// $.expiredV.add($.UI.create("Label", {classes: ['wfill'], id: "T2", height: 180, textAlign: "center", text: "You have no expired vouchers at this moment."}));
	
	var ongoingVC = myvmodel.ongoingvoucher(true);
	list_voucher(ongoingVC, "ongoing");
	var expireVC = myvmodel.expirevoucher(true);
	list_voucher(expireVC, "expire", params);
	if($.ongoingVoucher.children.length > 0) {
		$.t1.setHeight(0);
		$.t1.hide();
	}else{
		$.t1.setHeight(180);
		$.t1.show();
	}
	if($.expiredVoucher.children.length > 0) {
		$.t2.setHeight(0);
		$.t1.hide();
	}else{
		$.t2.setHeight(180);
		$.t1.show();
	}
}

function list_voucher(e, name, params) {
	var parent = $.UI.create("View", {
		classes: ['wfill', 'hsize', 'horz']
	});
	e.forEach(function (entry) {
		if(entry.item_id != null){
			var item = Alloy.createCollection("items");
			var image = item.getImageByI_id(entry.item_id);
			if(name == "ongoing" || name == "expire") {
				entry.image = image;
			}else {
				entry.thumb_image = image;
			}
		}
		var container = (name == "ongoing" || name == "expire") ? $.UI.create("View", {
			classes: ['hsize'],
			width: cell_width,
			left: 9,
			top: 9
		}) : $.UI.create("View", {
			classes: ['hsize', 'vert'],
			width: cell_width,
			left: 9,
			top: 9
		});
		var delBT = (name == "ongoing" || name == "expire") ? $.UI.create("ImageView", {
			width: 30,
			height: 30,
			image: "/images/Icon_Delete_Round.png",
			My_vid: entry.My_vid,
			top: 2,
			right: 2,
			zIndex: 10
		}) : $.UI.create("ImageView", {
			width: 0,
			height: 0,
			image: "",
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
			image: (name == "ongoing" || name == "expire") ? entry.image : entry.thumb_image ,
			defaultImage: "/images/image_loader_640x640.png",
			My_vid: entry.My_vid,
			v_id: entry.v_id,
			m_id: entry.m_id,
			use: (name == "ongoing") ? true : (name == "expire") ? false : ""
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
			text: (name == "ongoing" || name == "expire") ? entry.quantity + " saved" : (entry.quantity != null) ? entry.quantity + " saved" : "0 saved",
			color: "#ED1C24",
			left: 0
		}) : $.UI.create("Label", {
			classes: ['wsize', 'h5'],
			height: 19,
			text: (name == "ongoing" || name == "expire") ? entry.quantity + " saved" : (entry.quantity != null) ? entry.quantity + " saved" : "0 saved",
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
			right: 5,
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
		container.add(View1);
		container.add(delBT);
		View1.add(viewimg);
		viewimg.add(img);
		View1.add(View2);
		if(name == "gift") {
			View2.add(View3);
		}
		View3.add(VQuantity);
		ViewPoint.add(pointimg);
		ViewPoint.add(VPoint);
		View3.add(ViewPoint);
		View2.add(title);
		parent.add(container);
		if(name == "ongoing") {
			$.ongoingVoucher.add(container);
			img.addEventListener("click", toSaveVoucher);
		}else if(name == "expire") {
			$.expiredVoucher.add(container);
			img.addEventListener("click", toSaveVoucher);
		}else {
			img.addEventListener("click", toVoucher);
		}
		
		container = null;
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
	if(name == "gift") {
		$.voucher_view.add(parent);
	}
	parent = null;
	boll = true;
	loading.finish();
	$.voucher_scrollview.voucherrefreshing = true;
	$.voucher_scrollview.scrollcheck = true;
	$.voucher_scrollview.gift_vouchercount += 8;
}

function toVoucher(e) {
	if(u_id == ""){
		var win = Alloy.createController("signin_signout", {page: "refresh"}).getView(); 
		COMMON.openWindow(win);
	}else {
		COMMON.openWindow(Alloy.createController("voucher_detail",{v_id: e.source.v_id}).getView());
	}
}

function toSaveVoucher(e) {
	COMMON.openWindow(Alloy.createController("saved_voucher",{My_vid: e.source.My_vid,use:e.source.use}).getView());	
}

function delvoucher(e) {
	COMMON.createAlert("Alert", "Are you sure want to delete this voucher?", function(ex){
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

function refreshVlist(str) {
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
			checker.updateModule("12","getVoucherList",currentDateTime());
			if($.voucher_scrollview.vouchertype == "ins_voucher") {
				ins_voucher(str);
			}else {
				gift_voucher();
			}
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

function refreshSVlist(params) {
	// u_id = Ti.App.Properties.getString('u_id') || "";
	// var checker = Alloy.createCollection('updateChecker');
	// var isUpdate = checker.getCheckerById("13");
	
	API.callByPost({
		url:"getUserVoucherList",
		new: true,
		params: {u_id: u_id}
	},{
		onload:function(responseText){
			var model = Alloy.createCollection("MyVoucher");
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			model.resetRecord();
			model.saveArray(arr);
			if(u_id != "") {
				savedvoucher(params);
			}
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
    return (OS_ANDROID)?pixelToDp(Math.round(percentInt * (relative / 100))):Math.round(percentInt * (relative / 100));
};

function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

$.scrollview.addEventListener("scrollend", function(e) {
	if(e.currentPage != undefined) {
		if(e.currentPage != 0) {
			var u_id = Ti.App.Properties.getString('u_id') || "";
			if(u_id == ""){
				var win = Alloy.createController("signin_signout", {page: "refresh"}).getView(); 
				COMMON.openWindow(win);
			}else if(e.currentPage == 1) {
				refreshVlist();
			}else if(e.currentPage == 1) {
				savedvoucher();
			}else if(e.currentPage == 2) {
				refresh();
			}
		}
		tabColor.setColor("gray");
		tabviewColor.setBackgroundColor("#fff");
		var tabid = eval("$.tab" + e.currentPage);
		var tabviewid = eval("$.tabview" + e.currentPage);
		tabColor = tabid;
		tabviewColor = tabviewid;
		tabColor.setColor("#fff");
		tabviewColor.setBackgroundColor("#ED1C24");
	}
});

function createWhoops1(t,e,b,callback){
	var box = Titanium.UI.createAlertDialog({
		title: t,
		message: e,
		ok: b
	});
	box.show();
	_.isFunction(callback) && box.addEventListener('click', function(e){
		if(typeof callback != "undefined"){
			callback();	
		};
	});
};

function impression(a_id) {
	console.log("impression send "+a_id.join());
	var params = {
		a_id:a_id.join(),
		type:1,
		from:"reward",
		u_id:u_id
	};
	API.callByPost({url:"addAdsClick",new:true,params:params},{onload:function(res){},onerror:function(err){}});
}
var scrollCheck = true;
function scrollChecker(e) {
	var theEnd = $.voucher_view.rect.height;
	var nearEnd = theEnd - 200;
	var total = (OS_ANDROID) ? pixelToDp(e.y) + e.source.rect.height : e.y + e.source.rect.height;
	if(total >= nearEnd&& scrollCheck && $.voucher_scrollview.scrollcheck && $.voucher_scrollview.scrolldata > 0){
		$.voucher_scrollview.scrollcheck = false;
		eval($.voucher_scrollview.vouchertype+"()");
	}
	theEnd = null;
	nearEnd = null;
	total = null;
}
function login_cancel(e) {
	console.log("asdf");
    $.scrollview.scrollToView(0);
}
Ti.App.addEventListener('login_cancel:reward', login_cancel);
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener("close", function(){
	impression(add_impression);
	add_impression = undefined;
	Ti.App.removeEventListener('reward:refresh', refresh);
	Ti.App.removeEventListener('login_cancel:reward',login_cancel);
});

$.win.addEventListener('android:back', function (e) {
	COMMON.closeWindow($.win); 
});