var args = arguments[0] || {};
var a_id = args.a_id;
var from = args.from;
var i_id = args.i_id || "";
var position = args.position || 0;
var isScan = args.isScan;
var m_id = args.m_id;
//$.win.title= args.title;
var BARCODE = require('barcode');
var showBarcode = 1;
var u_id = Ti.App.Properties.getString('u_id') || "";
var tncrule = "Terms and Conditions are a set of rules and guidelines that a user must agree to in order to use your website or mobile app. It acts as a legal contract between you (the company) who has the website or mobile app and the user who access your website and mobile app.\n\nIt’s up to you to set the rules and guidelines that the user must agree to. You can think of your Terms and Conditions agreement as the legal agreement where you maintain your rights to exclude users from your app in the event that they abuse your app, and where you maintain your legal rights against potential app abusers, and so on.\n\nTerms and Conditions are also known as Terms of Service or Terms of Use.\n\nThis type of legal agreement can be used for both your website and your mobile app. It’s not required (it’s not recommended actually) to have separate Terms and Conditions agreements: one for your website and one for your mobile app.";
var SCANNER = require("scanner");

var htr_turn = true;
var tc_turn = true;
var checkingLimit = true;
var checkingForSave = true;
var checkingClaimLimit = true; 
var fristDate = "";
var secondDate = "";
var endsDay = "";

var i_library = Alloy.createCollection('items'); 
var voucher = Alloy.createCollection('voucher');
var items  = i_library.getItemByAds(a_id);


		var params = {
		item_id:i_id,
		type:3,
		from:"itemDetails",
		u_id:u_id
	} ;
	API.callByPost({url:"addAdsClick",new:true,params:params},{
		onload:function(res){
			console.log("Item View ad "+JSON.stringify(res));
		},onerror:function(err){
			console.log("Item View ad error");
	}});	

function set_title_button(){
	var b_title = "";
	var b_color = "";
	var b_enable = true;
	
	var currentPage = $.scrollableView.getCurrentPage();
	console.log(items[currentPage].isExclusive+" Exclusive type");
	
	if(items[currentPage].isExclusive==1){
		
		var model = Alloy.createCollection("MyVoucher");
		var voucher_item = voucher.getDataByI_id(items[currentPage].i_id);
		var voucherLimit = model.getCountByVid(voucher_item.v_id);
		var limit = voucherLimit.count;
		console.log("Voucher limit is "+limit+" by v_id "+voucher_item.v_id);
		console.log(voucher_item.limit);
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
				console.log("v_quan "+voucher_item.left);
				b_title = "Voucher Fully Saved";
				b_color = "#a6a6a6";
				b_enable = false;
			}
			
			if(voucher_item.left==-1){
				console.log("unlimit save this voucher");
				b_title = "Save Voucher";
				b_color = "#ED1C24";
				b_enable = true;
			};
		}
		
		var v_id = voucher_item.v_id;
		console.log("voucher id = "+v_id);
		var model = Alloy.createCollection("MyVoucher");
		var voucherLimit = model.getCountLimitByVid(v_id);
		var limit = voucherLimit.count;
		console.log("Voucher limit is "+limit+" by v_id "+v_id);
		console.log(voucher_item.limit);
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
						console.log("checkingClaimLimit = "+checkingClaimLimit);
						checkingForSave = false;
						var common = require('common');
						common.createAlert('Instant Voucher','Confirm to save this voucher?',function(ee){
							var params = {v_id:voucher_item.v_id, u_id:u_id, quantity:1};
							API.callByPost({
								url:"addUserVoucher",
								new:true,
								params:params
							},{
							onload:function(res){
								var res = JSON.parse(res);
								var arr = res.data || null;
								console.log("Success to save "+JSON.stringify(arr));
								checkingForSave = true;
								setTimeout(function(e){
									alert("Voucher Saved\nYou can view it under\nMy rewards > Saved Vouchers");
								},1000);
								Ti.App.fireEvent("voucher:refresh");
								Ti.App.fireEvent("myvoucher:refresh");
								Ti.App.fireEvent("reward:refresh");
								COMMON.closeWindow($.win);
							},
							onerror:function(e){
								console.log("Save voucher fail!");
							}		
							});
						});
					}else{	
						var box = Titanium.UI.createAlertDialog({
							title: "Whoops!",
							message: "You have exceeded the claim limit per user of this voucher"
						});
						box.show();
					};	
				};
			}
		});
	}else{
		var title = items[currentPage].caption;
		$.pageTitle.setText(title);
		$.submit.removeAllChildren();
	}
}

/*function getScanMerchant(){
	console.log(m_id+" scanMerchant");
	var expire = Ti.App.Properties.getString('sales'+m_id) || "";
	console.log(expire+" got or not");
	if(expire != ""){
		var currentDate = new Date();
		if(OS_ANDROID){
			
		}
		var dat = expire.split(" ");
		var d = dat[0].split("-");
		var t = dat[1].split(":");
		console.log(d);
		console.log(t);
		var new_expire = (OS_ANDROID)? new Date(expire): new Date(d[0], d[1], d[2], t[0], t[1], t[2]);
		//var new_expire = new Date(d[0], d[1], d[2], t[0], t[1], t[2]);
		console.log(new_expire+" >= "+currentDate);
		console.log(typeof new_expire);
		if(expire != null && currentDate <= new_expire){
			console.log("should be here!!!");
			isScan = 1;
		}else{
			console.log("not here!!!");
			isScan = 0;
		}
	}else{
		isScan = 0;
	}
}*/
 
var getAdsImages = function(){
	
	var counter = 0;
	var imagepath, adImage, row = '';
	var my_page = 0;
	var selectedView;   		
	/***Set ads items***/
	var the_view = []; 
	for (var i=0; i< items.length; i++) {
		console.log("item id = "+items[i].i_id);
		var voucher_item = voucher.getDataByI_id(items[i].i_id);
		var itemImageView = $.UI.create("View", {classes:['wfill','hsize']});
		adImage = Ti.UI.createImageView({
			top: 0,
			defaultImage: "/images/image_loader_600x800.png",
			image: items[i].img_path,
			width:"100%",
			enableZoomControls: true,
			height: Ti.UI.SIZE
		});
		
		/*var label_description = $.UI.create("Label",{
			classes:['wfill','hsize','h5','padding'],
			text: items[i].description
		});
		console.log("items description   " + items[i].description);
		var duration = args.date;
		if (items[i].description == null || items[i].description == "") {
			duration = "";
		}
		
		var label_duration = $.UI.create("Label", {
			classes:['wfill', 'hsize', 'h5'],
			left: 10,
			text: duration
		});*/
		
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
		
		/*var view_voucher = $.UI.create("View", {classes:['wfill','hsize','vert', 'padding'], borderWidth: 2, borderColor: "#ED1C24"});
		var label_voucher_title = $.UI.create("Label", {classes: ['wfill','hsize','padding'], textAlign: "center", text: "SalesAd Exclusive Voucher"});
		var view_hr = $.UI.create("View", {classes:['hr']});
		
		view_voucher.add(label_voucher_title);
		view_voucher.add(view_hr);
		console.log(isScan+" is scan");
			if(isScan == "1"){
				var voucher_description = $.UI.create("Label", {classes:['wfill','hsize','padding'], textAlign: "center", text: items[i].voucher_description});
				view_voucher.add(voucher_description);
				if(items[i].barcode != ""){
					var bcwv = BARCODE.generateBarcode(items[i].barcode);
					view_voucher.add(bcwv);
				}
				var label_subtitle = $.UI.create("Label", {classes:['wfill','hsize','padding','grey'], textAlign: "center", text: "Please present this voucher at payment counter to redeem"});
				view_voucher.add(label_subtitle);
			}else{
				var image_button = $.UI.create("ImageView", {classes:['wfill', 'hsize'], top:10, right:10, left:10, image: "/images/Button_ScanQRCode.png"});
				var label_subtitle = $.UI.create("Label", {classes:['wfill','hsize','padding','grey'], textAlign: "center", text: "in participating stores to get Exclusive deals"});
				view_voucher.add(image_button);
				view_voucher.add(label_subtitle);
				image_button.addEventListener("click", QrScan);
			}*/
			
function parseDate(str) {
    var mdy = str.split('-');
    return new Date(mdy[0], mdy[1]-1, mdy[2]);
}

function daydiff(first, second) {
    return Math.round((second-first)/(1000*60*60*24)+1);
}

function getNowDate(){   //calculate the days between two dates
	var fristDate = voucher_item.save_to;
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
	return endsDay;
}
	
////////Voucher Detail////////
function addVoucher(){
	var voucher = $.UI.create('View',{
			classes:['wfill','hsize','vert','padding5'],
			borderWidth:'5',
			borderColor:'#66787878',
			backgroundColor:'#fff',
			bottom:"100"
			});	
		var v_image = $.UI.create('imageView',{
			classes:['wfill','hsize','padding4'],
			id:"image_voucher",
			image: items[i].img_path,
			defaultImage: "/images/image_loader_600x800.png",
		});	
		var v_title = $.UI.create('Label',{
			classes:['wfill','hsize','padding','bold','vTitle'],
			bottom:'5',
			id:'title',
			text:voucher_item.title,
			left:'25'
		});
		var view1 = $.UI.create('View',{
			classes:['wfill','hsize','horz'],
			backgroundColor:'#fff',
		});
		var saved_quan = (voucher_item.quantity==null)?"0":voucher_item.quantity;
		var saved = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding1','bold'],
			top:'5',
			id:'saved',
			bottom:'2',
			text:saved_quan
		});
		var saved1 = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding'],
			top:'5',
			bottom:'2',
			left:'5',
			text:'saved'
		});
		var view3 = $.UI.create('View',{
			classes:['wfill','hsize','horz'],
			backgroundColor:'#fff',
			top:'0'
		});
		var left = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding1','bold'],
			bottom:'2',
			id:'leftV',
			text:(voucher_item.left==-1)?"While Stocks Last":voucher_item.left,
		});
		var left1 = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding2'],
			left:'5',
			text:(voucher_item.left==-1)?" ":"left",
		});
		var view4 = $.UI.create('View',{
			classes:['wfill','hsize','horz'],
			backgroundColor:'#fff',
		});
		var end = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding2'],
			right:'5',
			text:'Ends in',
		});
		var end1 = $.UI.create('Label',{
			classes:['wsize','hsize','h5','bold'],
			top:'0',
			bottom:'2',
			text:getNowDate(),
		});
		var end2 = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding2'],
			left:'5',
			text:'days',
		});
		var desc = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding'],
			top:'0',
			left:'25',
			text:voucher_item.description
		});
		var view5 = $.UI.create('View',{
			classes:['wfill','hsize','horz'],
			backgroundColor:'#fff',
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
			classes:['hr1']
		});
		var hr2 = $.UI.create('View',{
			classes:['hr1']
		});
		var view6 = $.UI.create('View',{     //htr_extend add event!!!
			backgroundColor:'#fff',
			classes:['wfill','hsize','vert']
		});
		
		var htr = $.UI.create('View',{
			classes:['wfill','hsize','horz']
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
			image:"/images/Icon_Down.png"
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
			classes:['wfill','hsize','horz']
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
		var hoverg = $.UI.create("View",{classes:['myView','wfill'],height:"40",zIndex:"10",bottom:"0"});	
		var title1 = $.UI.create("Label",{classes:['wsize','hsize','padding'],text:voucher_item.redeem,top:"0",left:"25"});		
		var title2 = $.UI.create("Label",{classes:['wsize','hsize','padding'],text:voucher_item.tnc,top:"0",left:"25"});
		var readmoreview = $.UI.create("View",{classes:['vert','wfill','hsize']});
		var readmore = $.UI.create("Label",{classes:['wfill','hsize','padding'],top:"0",text:"Read More",left:25});
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
		view4.add(end);
		view4.add(end1);
		view4.add(end2);
		view3.add(left);
		view3.add(left1);
		view1.add(saved);
		view1.add(saved1);
		voucher.add(v_image);
		voucher.add(v_title);
		voucher.add(view1);
		voucher.add(view3);
		voucher.add(view4);
		voucher.add(view5);
		voucher.add(desc);
		voucher.add(hr1);
		voucher.add(view6);
		voucher.add(hr2);
		voucher.add(view7);
		row.add(voucher);
		var click1 = true;
		view6.addEventListener("click",function(e){
			if(click1){
				htr_data.add(title1);
				image_htr.image = "/images/Icon_Up.png";			
				click1 = false;
			}
			else{
				htr_data.removeAllChildren();
				image_htr.image = "/images/Icon_Down.png";
				click1 = true;
			}
		});
		var click2 = true;
		view7.addEventListener("click",function(e){
			if(click2){		
				readmore.text = "Read Less";
				image_tc.image = "/images/Icon_Up.png";
				tc_data.height= Ti.UI.SIZE;
				click2 = false;
				hoverg.setOpacity(0);
			}
			else{
				readmore.text = "Read More";
				image_tc.image = "/images/Icon_Down.png";
				tc_data.height = 100;
				click2 = true;
				hoverg.setOpacity(1);	
			}
		});			
}			
		row = $.UI.create('View', {id:"view"+counter, classes:['wfill','hfill','vert'],backgroundColor:"#e8e8e8"});
		itemImageView.add(adImage); 	
		console.log("items " + items[i]);
		if(items[i].isExclusive == 1){
			addVoucher();
		}else{
			row.add(itemImageView);
		}
		if(position == counter){
			selectedView = row;
		}
		scrollView.add(row);
		the_view.push(scrollView); 
		
		counter++;
	}  
	
	$.scrollableView.setViews(the_view); 
	setTimeout(function(){
		$.scrollableView.scrollToView(position);  
	},250);
};

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

$.btnBack.addEventListener('click', function(e) {
    $.win.close();
});

//Ti.App.addEventListener('afterScan', afterScan);

/*$.win.addEventListener("close", function(e){
	Ti.App.removeEventListener('afterScan', afterScan);
});*/

/************************
*******APP RUNNING*******
*************************/
getAdsImages();
set_title_button();
$.win.open();

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});

$.scrollableView.addEventListener('scrollend',function(e){
	var params = {
		item_id:i_id,
		type:3,
		from:"itemDetails",
		u_id:u_id
	} ;
	API.callByPost({url:"addAdsClick",new:true,params:params},{
		onload:function(res){
			console.log("Item View ad "+JSON.stringify(res));
		},onerror:function(err){
			console.log("Item View ad error");
		}});
	set_title_button();
});


