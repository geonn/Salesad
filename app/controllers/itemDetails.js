var args = arguments[0] || {};
var a_id = args.a_id;
var from = args.from;
var i_id = args.i_id || "";
var position = args.position || 0;
var isScan = args.isScan;
var m_id = args.m_id;
//$.item_Details.title= args.title;
var BARCODE = require('barcode');
var showBarcode = 1;
var u_id = Ti.App.Properties.getString('u_id') || "";

var SCANNER = require("scanner");


//console.log("position : "+position);
//load model 
var i_library = Alloy.createCollection('items'); 

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
		var itemImageView = $.UI.create("View", {classes:['wfill','hsize']});
		adImage = Ti.UI.createImageView({
			defaultImage: "/images/image_loader_600x800.png",
			image: items[i].img_path,
			width:"100%",
			enableZoomControls: true,
			height: Ti.UI.SIZE
		});
		
		var label_caption = $.UI.create("Label", { 
			top: 0,
			text: items[i].caption,
			height: 40,
			verticalAlign: Titanium.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
		});
		
		var header = $.UI.create("View", {classes:['wfill'],height: 50});
		var redline = $.UI.create("View", {classes:['hr']});
		var img_back = $.UI.create("ImageView", {width: 30, height: 30, left: 10, zIndex: 100, image: "/images/btn-back.png"});
		header.add(img_back);
		header.add(label_caption);
		img_back.addEventListener("click", closeWindow);
		
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
			
////////Voucher Detail////////
function addVoucher(){
	var voucher = $.UI.create('View',{
			classes:['wfill','hsize','vert','padding4'],
			top:'20',
			borderWidth:'5',
			borderColor:'#66787878'
			});		
		var v_image = $.UI.create('imageView',{
			classes:['wfill','hsize','padding4'],
			id:"image_voucher",
			image: "/images/image_loader_600x800.png",
			defaultImage: "/images/image_loader_600x800.png",
		});	
		var v_title = $.UI.create('Label',{
			classes:['wfill','hsize','padding','bold','vTitle'],
			bottom:'5',
			id:'title',
			text:'Voucher Title',
		});
		var view1 = $.UI.create('View',{
			classes:['wfill','hsize','horz']
		});
		var saved = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding1','bold'],
			top:'5',
			id:'saved',
			bottom:'2',
			text:'XX'
		});
		var saved1 = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding'],
			top:'5',
			bottom:'2',
			text:'saved'
		});
		var point_view = $.UI.create('View',{
			classes:['wfill','hsize'],
			id:'pointView'
		});
		var view2 = $.UI.create('View',{
			classes:['wsize','hsize','horz'],
			right:'10',
			borderColor:'#ED1C24',
			borderWidth:'1',
			borderRadius:'10'
		});
		var coin = $.UI.create('imageView',{
			height:'20',
			width:'20',
			left:'10',
			image:"/images/Icon_CashPoint_Flat_Medium.png"
		});
		var point = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding1','bold'],
			top:'3',
			bottom:'2',
			left:'5',
			color:'#ED1C24',
			id:'point',
			text:'XX',
		});
		var point1 = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding','bold'],
			top:'3',
			bottom:'2',
			left:'5',
			color:'#ED1C24',
			text:'Point',
		});
		var view3 = $.UI.create('View',{
			classes:['wfill','hsize','horz'],
			top:'0'
		});
		var left = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding1','bold'],
			bottom:'2',
			id:'leftV',
			text:'0',
		});
		var left1 = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding2'],
			left:'5',
			text:'left',
		});
		var view4 = $.UI.create('View',{
			classes:['wfill','hsize','horz'],
		});
		var end = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding2'],
			right:'5',
			text:'Ends in',
		});
		var end1 = $.UI.create('Label',{
			classes:['wsize','hsize','h5','bold'],
			id:'days',
			top:'0',
			bottom:'2',
			text:'0',
		});
		var end2 = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding2'],
			left:'5',
			text:'days',
		});
		var view5 = $.UI.create('View',{
			classes:['wfill','hsize','horz'],
		});
		var valid = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding'],
			right:'5',
			top:'0',
			text:'Valid from',
		});
		var valid1 = $.UI.create('Label',{
			classes:['wsize','hsize','h5','bold'],
			id:'valid_from',
			top:'0',
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
			id:'valid_to',
			top:'0',
		});
		var hr1 = $.UI.create('View',{
			classes:['hr1']
		});
		var hr2 = $.UI.create('View',{
			classes:['hr1']
		});
		var view6 = $.UI.create('View',{     //htr_extend add event!!!
			classes:['wfill','hsize','vert']
		});
		var htr = $.UI.create('View',{
			classes:['wfill','hsize','horz']
		});
		var label_htr = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding'],
			text:'How to redeem'
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
			classes:['wfill','hsize','vert'],
		});
		var tc = $.UI.create('View',{
			classes:['wfill','hsize','horz']
		});
		var label_tc = $.UI.create('Label',{
			classes:['wsize','hsize','h5','padding'],
			text:'Terms & Conditions'
		});
		var image_tc = $.UI.create('imageView',{
			width:'15',
			height:'15',
			id:'tc_image',
			image:"/images/Icon_Down.png"
		});
		var tc_data = $.UI.create('view',{
			classes:['wfill','hsize','vert'],
			id:'tc'
		});
		var submit = $.UI.create('button',{   // submit add event
			classes:['wfill','h4','save_button'],
			height:'40',
			title:"Save Voucher",
			id:'save'
		});
		htr.add(label_htr);
		htr.add(image_htr);
		view6.add(htr);
		view6.add(htr_data);
		tc.add(label_tc);
		tc.add(image_tc);
		view7.add(tc);
		view7.add(tc_data);	
		view5.add(valid);
		view5.add(valid1);
		view5.add(valid2);
		view5.add(valid3);
		view4.add(end);
		view4.add(end1);
		view4.add(end2);
		view3.add(left);
		view3.add(left1);
		view2.add(coin);
		view2.add(point);
		view2.add(point1);
		point_view.add(view2);
		view1.add(saved);
		view1.add(saved1);
		view1.add(point_view);
		voucher.add(v_image);
		voucher.add(v_title);
		voucher.add(view1);
		voucher.add(view3);
		voucher.add(view4);
		voucher.add(view5);
		voucher.add(hr1);
		voucher.add(view6);
		voucher.add(hr2);
		voucher.add(view7);
		voucher.add(submit);
		row.add(voucher);
}			

		row = $.UI.create('View', {id:"view"+counter, classes:['wfill','hfill','vert']});
		itemImageView.add(adImage); 
	 	
		row.add(header);
		row.add(redline);
		row.add(itemImageView);
		//row.add(label_description);
		//row.add(label_duration);
		console.log("items " + items[i]);
		if(items[i].isExclusive == 1){
			var exclusive_icon = $.UI.create("ImageView", {classes:['hsize'], width: 40, right: 10, top:0, image:"/images/Icon_Exclusive_Gold_Long@0,25x.png"});
			itemImageView.add(exclusive_icon);
			addVoucher();
			//row.add(view_voucher);
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

function closeWindow(){
	$.item_Details.close();
}

//Ti.App.addEventListener('afterScan', afterScan);

/*$.item_Details.addEventListener("close", function(e){
	Ti.App.removeEventListener('afterScan', afterScan);
});*/

/************************
*******APP RUNNING*******
*************************/
getAdsImages();
$.item_Details.open();

$.item_Details.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.item_Details); 
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
});
