var args = arguments[0] || {};
var a_id = args.a_id;
var from = args.from;
var i_id = args.i_id || "";
var position = args.position || 0;
var isScan = args.isScan;
var m_id = args.m_id;
var pagecount = -1;
//$.win.title= args.title;
var BARCODE = require('barcode');
var showBarcode = 1;
var u_id = Ti.App.Properties.getString('u_id') || "";
var tncrule = "Terms and Conditions are a set of rules and guidelines that a user must agree to in order to use your website or mobile app. It acts as a legal contract between you (the company) who has the website or mobile app and the user who access your website and mobile app.\n\nIt’s up to you to set the rules and guidelines that the user must agree to. You can think of your Terms and Conditions agreement as the legal agreement where you maintain your rights to exclude users from your app in the event that they abuse your app, and where you maintain your legal rights against potential app abusers, and so on.\n\nTerms and Conditions are also known as Terms of Service or Terms of Use.\n\nThis type of legal agreement can be used for both your website and your mobile app. It’s not required (it’s not recommended actually) to have separate Terms and Conditions agreements: one for your website and one for your mobile app.";
var SCANNER = require("scanner");
var zoomChecker = false;
var htr_turn = true;
var tc_turn = true;
var checkingLimit = true;
var checkingForSave = true;
var checkingClaimLimit = true; 
var fristDate = "";
var secondDate = "";
var endsDay = "";
var transparentView;
var i_library = Alloy.createCollection('items'); 
var voucher = Alloy.createCollection('voucher');
var items  = i_library.getItemByAds(a_id);

function init() {
	$.scrollableView.VI_id = [];
	$.scrollableView.II_id = [];
	$.scrollableView.allVoucherId = [];
	$.scrollableView.allItemId = [];
	var params = {
		item_id:i_id,
		type: (args.isExclusive == 1) ? 4 : 3,
		from:"itemDetails",
		u_id:u_id
	};
	params = null;
	addAdsClick("init", params);
}

function addAdsClick(name, params) {
	API.callByPost({url:"addAdsClick",new:true,params:params},{onload:function(res){},onerror:function(err){}});
	if(name == "init") {
		getAdsImages();
	}else if(name == "sendAPI") {
		sendAPI("Item");
	}
}

var getAdsImages = function() {
	var counter = 0;
	var imagepath;
	var row;
	var my_page = 0;
	var selectedView;
	var the_view = [];
	var v_view;
	
	for (var i=0; i< items.length; i++) {
		if(items[i].isExclusive == 1) {
			$.scrollableView.VI_id[i] = items[i].i_id;
		}else {
			$.scrollableView.II_id[i] = items[i].i_id;
		}
		var itemImageView = $.UI.create("View", {classes:['wfill','hfill','vert']});
		
		var adImage = $.UI.create('ImageView',{
			classes:['wfill','hsize'],
			image: items[i].img_path,
			top: 0,
			defaultImage: "/images/image_loader_640x640.png",
		});
		adImage.addEventListener("click",function(event1){
			zoomImageView(event1.source.image);					
		});
		var label_description = $.UI.create("Label",{
			classes:['wfill','hsize','h5','padding'],
			text: items[i].description
		});
		
		var scrollView = Ti.UI.createScrollView({
			contentWidth: Ti.UI.FILL,
		  	contentHeight: Ti.UI.SIZE,
		   	maxZoomScale: 30,
		    minZoomScale: 1,
		    zoomScale: 1,
		    scrollType: "vertical",
			height: Ti.UI.FILL,
			width: Ti.UI.FILL
		});
		
		row = $.UI.create('View', {id:"view"+counter, classes:['wfill','hfill','vert'],backgroundColor:"#e8e8e8"});
		itemImageView.add(adImage); 
		itemImageView.add(label_description);
		if(items[i].isExclusive == 1){
			v_view = addVoucher(items[i]);
			row.add(v_view);
		}else{
			row.add(itemImageView);
		}
		if(position == counter){
			selectedView = row;
		}
		scrollView.add(row);
		the_view.push(scrollView); 
		
		counter++;
		
		itemImageView = null;
		adImage = null;
		label_description = null;
		scrollView = null;
	}  
	
	$.scrollableView.setViews(the_view); 
	setTimeout(function(){
		$.scrollableView.scrollToView(position);  
	},50);
	
	counter = null;
	imagepath = null;
	row = null;
	my_page = null;
	selectedView = null;
	the_view = null;
	
	set_title_button();
};
function zoomImageView(url){
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
function addVoucher(e) {
	var voucher_item = voucher.getDataByI_id(e.i_id);
	var vvv;
	var vv;
	
	var v_view = $.UI.create('View',{
		classes:['wfill','hsize','vert','padding5'],
		borderWidth:'5',
		borderColor:'#66787878',
		backgroundColor:'#fff',
		bottom:"100"
	});
	var v_image = $.UI.create('imageView',{
		classes:['wfill','hsize'],
		image: e.img_path,
		defaultImage: "/images/image_loader_640x640.png",
	});
	v_image.addEventListener("click",function(e){
		zoomImageView(e.source.image);		
	});
	var v_title = $.UI.create('Label',{
		classes:['wfill','hsize','padding','bold','vTitle'],
		bottom:'5',
		text:voucher_item.title,
		left:'25'
	});
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
		text: (voucher_item.quantity==null)?"0":voucher_item.quantity,
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
		text: (voucher_item.left==-1)?"While Stock\nLast":voucher_item.left,
		textAlign: "center",
		classes: (voucher_item.left==-1)?["wsize","hsize","h5","bold"]:["wsize","hsize","h3","bold"]
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
		text: getNowDate(voucher_item.save_to),
		classes:["wsize","hsize","h3","bold"]
	});
	var info = $.UI.create("View",{
		classes:["wfill","hsize"]
	});
	if (voucher_item.quantity==null || voucher_item.quantity==0 || voucher_item.quantity==1) {
		vv = "Voucher";
	}else{
		vv = "Vouchers";
	};
	var space1 = $.UI.create("Label",{
		text: vv,
		classes:["wsize","hsize","h5"],
		color: "#a6a6a6"
	});
	var space2 = $.UI.create("Label",{
		text: (getNowDate(voucher_item.save_to)==1?"Day":"Days"),
		classes:["wsize","hsize","h5"],
		color: "#a6a6a6"
	});
	if (voucher_item.left==0 || voucher_item.left==1) {
		vvv = "Voucher";
	}else{
		vvv = "Vouchers";
	};
	var space4 = $.UI.create("Label",{
		text: vvv,
		classes:["wsize","hsize","h5"],
		color: "#a6a6a6"
	});
	var desc = $.UI.create('Label',{
		classes:['wsize','hsize','h5','padding'],
		top:'10',
		left:'25',
		text:voucher_item.description
	});
	var view5 = $.UI.create('View',{
		classes:['wfill','hsize','horz'],
		backgroundColor:'#fff',
		top: '10'
	});
	var valid = $.UI.create('Label',{
		classes:['wsize','hsize','h5','padding'],
		right:'5',
		top:'0',
		text:'Valid from',
		left:'25'
	});
	var dateUseFrom = convertToHumanFormat(voucher_item.use_from);  // parse date format
	var dateUseTo = convertToHumanFormat(voucher_item.use_to);
	var valid1 = $.UI.create('Label',{
		classes:['wsize','hsize','h5','bold'],
		top:'0',
		text:dateUseFrom
	});
	var valid2 = $.UI.create('Label',{
		classes:['wsize','hsize','h5','padding'],
		top:'0',
		left:'5',
		right:'5',
		text:'to',
	});
	var valid3 = $.UI.create('Label',{
		classes:['wsize','hsize','h5','bold'],
		top:'0',
		text:dateUseTo
	});
	var hr1 = $.UI.create('View',{
		classes:['hr1'],
		top:'5'
	});
	var hr2 = $.UI.create('View',{
		classes:['hr1']
	});
	var hr3 = $.UI.create('View',{
		classes:['hr1']
	});
	var hr4 = $.UI.create('View',{
		classes:['hr1']
	});
	var hr5 = $.UI.create('View',{
		classes:['hr1']
	});
	var view6 = $.UI.create('View',{
		backgroundColor:'#fff',
		classes:['wfill','hsize','vert']
	});
	var htr = $.UI.create('View',{
		classes:['wfill','hsize','horz'],
		click: true,
		name: "htr",
		redeem: voucher_item.redeem
	});
	var label_htr = $.UI.create('Label',{
		classes:['wsize','hsize','h5','padding'],
		text:'How to Redeem',
		left:'25'
	});
	var image_htr = $.UI.create('imageView',{
		width:'15',
		height:'15',
		id:'htr_image',
		image:"/images/Icon_Down.png",
		name:"image_htr"
	});
	var htr_data = $.UI.create('view',{
		classes:['wfill','hsize','vert'],
		id:'htr'
	});
	var view7 = $.UI.create('View',{     //tc_extend add event!!!
		backgroundColor:'#fff',
		classes:['wfill','vert','hsize']
	});
	
	var tc = $.UI.create('View',{
		classes:['wfill','hsize','horz'],
		name: "tc",
		click: true
	});
	var label_tc = $.UI.create('Label',{
		classes:['wsize','hsize','h5','padding'],
		text:'Terms & Conditions',
		left:'25'
	});
	var image_tc = $.UI.create('imageView',{
		width:'15',
		height:'15',
		id:'tc_image',
		image:"/images/Icon_Down.png"
	});
	var tc_data = $.UI.create('view',{
		classes:['wfill'],
		height:"65",
	});
	var hoverg = $.UI.create("View",{classes:['myView','wfill'],height:"40",zIndex:"10",bottom:"0",name:"hoverg"});	
	var title1 = $.UI.create("Label",{classes:['wsize','hsize','padding'],text:voucher_item.redeem,top:"0",left:"25"});		
	var title2 = $.UI.create("Label",{classes:['wsize','hsize','padding'],text:voucher_item.tnc,top:"0",left:"25",name:"title2"});
	var readmoreview = $.UI.create("View",{classes:['vert','wfill','hsize']});
	var readmore = $.UI.create("Label",{classes:['wfill','hsize','padding'],top:"0",text:"Read More",left:25,name:"readmore"});
	readmoreview.add(readmore);
	htr.add(label_htr);
	htr.add(image_htr);
	view6.add(htr);
	view6.add(htr_data);
	tc.add(label_tc);
	tc.add(image_tc);
	view7.add(tc);
	tc_data.add(hoverg);
	tc_data.add(title2);
	view7.add(tc_data);
	view7.add(readmoreview);
	view5.add(valid);
	view5.add(valid1);
	view5.add(valid2);
	view5.add(valid3);
	ssaved.add(saved_title);	
	ssaved.add(saved_data);
	ssaved.add(space1);
	leftt.add(left_title);
	leftt.add(left_data);
	if (voucher_item.left!=-1) {
		leftt.add(space4);
	}
	ends.add(ends_title);
	ends.add(ends_data);
	ends.add(space2);
	info.add(ssaved);
	info.add(leftt);
	info.add(ends);
	v_view.add(v_image);
	v_view.add(v_title);
	v_view.add(hr5);
	v_view.add(info);
	v_view.add(hr1);
	v_view.add(view5);
	v_view.add(hr2);
	v_view.add(desc);
	v_view.add(hr3);
	v_view.add(view6);
	v_view.add(hr4);
	v_view.add(view7);
	
	view6.addEventListener("click",function(e) {
		var htr_cr = "";
		if(e.source.name == "image_htr") {
			htr_cr = e.source.parent.parent.getChildren();
		}else if(e.source.name == "htr") {
			htr_cr = e.source.parent.getChildren();
		}
		
		if(htr_cr != "") {
			if(htr_cr[0].click){
				var title1 = $.UI.create("Label",{classes:['wsize','hsize','padding'],text:htr_cr[0].redeem,top:"0",left:"25"});
				htr_cr[1].add(title1);
				htr_cr[0].getChildren()[1].image = "/images/Icon_Up.png";
				htr_cr[0].click = false;
				title1 = null;
			}else {
				htr_cr[1].removeAllChildren();
				htr_cr[0].getChildren()[1].image = "/images/Icon_Down.png";
				htr_cr[0].click = true;
			}
		}
		htr_cr = null;
	});
	
	view7.addEventListener("click",function(e){
		var view7_cr = "";
		if(e.source.name == "image_tc" || e.source.name == "hoverg" || e.source.name == "title2" || e.source.name == "readmore") {
			view7_cr = e.source.parent.parent.getChildren();
		}else if(e.source.name == "tc") {
			var view7_cr = e.source.parent.getChildren();
		}
		
		if(view7_cr != "") {
			if(view7_cr[0].click) {
				view7_cr[2].getChildren()[0].text = "Read Less";
				view7_cr[0].getChildren()[1].image = "/images/Icon_Up.png";
				view7_cr[1].height = Ti.UI.SIZE;
				view7_cr[1].getChildren()[0].setOpacity(0);
				view7_cr[0].click = false;
			}else {
				view7_cr[2].getChildren()[0].text = "Read More";
				view7_cr[0].getChildren()[1].image = "/images/Icon_Down.png";
				view7_cr[1].height = 100;
				view7_cr[1].getChildren()[0].setOpacity(1);
				view7_cr[0].click = true;
			}
		}
		view7_cr = null;
	});
	
	voucher_item = null;
	vvv = null;
	vv = null;
	v_image = null;
	v_title = null;
	ssaved = null;
	saved_title = null;
	saved_data = null;
	leftt = null;
	left_title = null;
	left_data = null;
	ends = null;
	ends_title = null;
	ends_data = null;
	info = null;
	space1 = null;
	space2 = null;
	space4 = null;
	desc = null;
	view5 = null;
	valid = null;
	dateUseFrom = null;
	dateUseTo = null;
	valid1 = null;
	valid2 = null;
	valid3 = null;
	hr1 = null;
	hr2 = null;
	hr3 = null;
	hr4 = null;
	hr5 = null;
	view6 = null;
	htr = null;
	label_htr = null;
	image_htr = null;
	htr_data = null;
	view7 = null;
	tc = null;
	label_tc = null;
	image_tc = null;
	tc_data = null;
	hoverg = null;
	title1 = null;
	title2 = null;
	readmoreview = null;
	readmore = null;
	
	return v_view;
	v_view = null;
}

function getNowDate(e){   //calculate the days between two dates
	var fristDate = e;
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
	return endsDay;
}

function parseDate(str) {
    var mdy = str.split('-');
    return new Date(mdy[0], mdy[1]-1, mdy[2]);
}

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24)+1);
}

function set_title_button(e) {
	var b_title = "";
	var b_color = "";
	var b_enable = true;
	var currentPage = $.scrollableView.getCurrentPage();
	
	if(items[currentPage].isExclusive==1){
		var model = Alloy.createCollection("MyVoucher");
		var voucher_item = voucher.getDataByI_id(items[currentPage].i_id);
		var voucherLimit = model.getCountByVid(voucher_item.v_id);
		var limit = voucherLimit.count;
		if(limit>=1){
			checkingLimit = false;
		}else{
			checkingLimit = true;
		}
		
		if(!checkingLimit){   // avoid double save
			b_title = "Voucher Saved";
			b_color = "#a6a6a6";
			b_enable = false;
		}
		if(checkingLimit){   // available to save and unlimit save
			b_title = "Save Voucher";
			b_color = "#ED1C24";
			b_enable = true;
			
			if(voucher_item.left<=0){   // check voucher stock
				b_title = "Voucher Fully Saved";
				b_color = "#a6a6a6";
				b_enable = false;
			}
			
			if(voucher_item.left==-1){
				b_title = "Save Voucher";
				b_color = "#ED1C24";
				b_enable = true;
			};
		}
		
		var v_id = voucher_item.v_id;
		var model = Alloy.createCollection("MyVoucher");
		var voucherLimit = model.getCountLimitByVid(v_id);
		var limit = voucherLimit.count;
		if(voucher_item.limit==-1){
			checkingClaimLimit = true;
		}else if(limit>=voucher_item.limit){
			checkingClaimLimit = false;
		}
		
		$.submit.removeAllChildren();
		var buttonS = $.UI.create('Button',{
			classes:['wfill','h4','save_button'],
			height:'40',
			title:b_title,
			backgroundColor:b_color
		});
		var hr3 = $.UI.create('View',{
			classes:['hr'],
			backgroundColor:'#e8e8e8'
		});
		$.pageTitle.setText("Instant Voucher");
		$.submit.add(hr3);
		$.submit.add(buttonS);
		
		buttonS.addEventListener('click',function(e){
			if(b_enable){
				if(checkingForSave){
					if(checkingClaimLimit){
						checkingForSave = false;
						var common = require('common');
						common.createAlert('Instant Voucher','Confirm to save this voucher?',function(ee){
							
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
							onerror: function(err){}});
							
							var params = {v_id:voucher_item.v_id, u_id:u_id, quantity:1};
							API.callByPost({
								url:"addUserVoucher",
								new:true,
								params:params
							},{
							onload:function(res){
								var res = JSON.parse(res);
								var arr = res.data || null;
								checkingForSave = true;
								setTimeout(function(e){
									alert("Voucher saved", "You can view it under\nMore > My Rewards > Saved Vouchers");
								},1000);
								Ti.App.fireEvent("voucher:refresh");
								Ti.App.fireEvent("myvoucher:refresh");
								Ti.App.fireEvent("reward:refresh");
								COMMON.closeWindow($.win);
							},
							onerror:function(e){}});
						},undefined,function(e) {
							checkingForSave = true;
						});
					}else{
						alert("Whoops!", "You have exceeded the claim limit per user of this voucher");
					};
				};
			}
		});
	}else{
		var title = items[currentPage].caption;
		$.pageTitle.setText(title);
		$.submit.removeAllChildren();
	}
	$.scrollableView.setScrollingEnabled(true);
}

function alert(t,e){
	var alert = Titanium.UI.createAlertDialog({
		title: t,
		message: e,
		ok: "ok"
	});
	alert.show();
};

/*function getScanMerchant(){
	var expire = Ti.App.Properties.getString('sales'+m_id) || "";
	if(expire != ""){
		var currentDate = new Date();
		if(OS_ANDROID){
			
		}
		var dat = expire.split(" ");
		var d = dat[0].split("-");
		var t = dat[1].split(":");
		var new_expire = (OS_ANDROID)? new Date(expire): new Date(d[0], d[1], d[2], t[0], t[1], t[2]);
		//var new_expire = new Date(d[0], d[1], d[2], t[0], t[1], t[2]);
		if(expire != null && currentDate <= new_expire){
			isScan = 1;
		}else{
			isScan = 0;
		}
	}else{
		isScan = 0;
	}
}*/

/*function afterScan(e){
	if(e.m_id != m_id){
		var win = Alloy.createController("branch_ad", {m_id: e.m_id}).getView(); 
		COMMON.openWindow(win);
		Ti.App.removeEventListener('afterScan', afterScan);
	}else{
		getScanMerchant();
		getAdsImages();
		Ti.App.removeEventListener('afterScan', afterScan);
	}
}

function QrScan(){
	SCANNER.openScanner("1");
}*/

//Ti.App.addEventListener('afterScan', afterScan);

/*$.win.addEventListener("close", function(e){
	Ti.App.removeEventListener('afterScan', afterScan);
});*/

//event listener
$.scrollableView.addEventListener('scrollend',function(e) {
	if(e.source.currentPage != pagecount) {
		$.scrollableView.setScrollingEnabled(false);
		if($.scrollableView.VI_id[e.source.currentPage] != (undefined || null || "")) {
			$.scrollableView.allVoucherId.push($.scrollableView.VI_id[e.source.currentPage]);
		}else if($.scrollableView.II_id[e.source.currentPage] != (undefined || null || "")) {
			$.scrollableView.allItemId.push($.scrollableView.VI_id[e.source.currentPage]);
		}
		pagecount = e.source.currentPage;
		set_title_button();
	}
});

$.btnBack.addEventListener('click', closeWindow);
$.win.addEventListener('android:back', closeWindow);

$.win.addEventListener('close', function(e) {
	sendAPI("Voucher");
});

function sendAPI(e) {
	var param = "";
	if($.scrollableView.allVoucherId != [] && e == "Voucher") {
		param = {
			v_id:$.scrollableView.allVoucherId.join(),
			type:4,
			from:"itemDetails",
			u_id:u_id
		};//console.log("voucher "+JSON.stringify(param));
		addAdsClick("sendAPI", param);
	}else if($.scrollableView.allItemId != [] && e == "Item") {
		param = {
			item_id:$.scrollableView.allItemId.join(),
			type:3,
			from:"itemDetails",
			u_id:u_id
		};//console.log("item "+JSON.stringify(param));
		addAdsClick("", param);
	}
}

function closeWindow(e) {
	if(zoomChecker){
		zoomChecker = false;
		$.win.remove(transparentView);
	}else{
		COMMON.closeWindow($.win);		
	}
}

init();