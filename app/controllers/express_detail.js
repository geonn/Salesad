var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var data;
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];

function zoom(e){	
	var TiTouchImageView = require('org.iotashan.TiTouchImageView');
	var container = Ti.UI.createView({width:Ti.UI.FILL,height:Ti.UI.FILL,backgroundColor:"#66000000",zIndex:"100"});
	var close = Ti.UI.createLabel({width:Ti.UI.SIZE,height:Ti.UI.SIZE,right:"10",top:"10",color:"#fff",text:"Close"});
	var image = (typeof e.source.image != "undefined" && typeof e.source.image.nativePath != "undefined")?e.source.image.nativePath: "/images/image_loader_640x640.png";
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
function render_page(){
	if(OS_IOS){
		$.img.image = args.img_path;
		$.img.addEventListener('click',function(e){
			var Zv = Ti.UI.createView({
				width :Ti.UI.FILL,
				height :Ti.UI.FILL, 
				backgroundColor: "#ccffffff",
				zIndex :100
			});
			var Z = Ti.UI.createView({
				width :"95%",
				height :Ti.UI.SIZE,
				backgroundColor :"transparent",
				zindex :101
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
	      		zindex :101
			});
			var Zimage = Ti.UI.createImageView({
				image :args.img_path,
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
	if(OS_ANDROID && args.img_path != null){
		$.RemoteImage.applyProperties({
		 	autoload: true,
		    backgroundColor: 'black',
		    image:args.img_path,
		    default_img : "/images/image_loader_640x640.png"
		});	
		$.RemoteImage.addEventListener("click",zoom);				
	}
	else{
		if (OS_ANDROID) {
			$.RemoteImage.setDefaultImg("/images/image_loader_640x640.png");
		};
	}
	$.xpress_date.text = args.sales_from+" - "+args.sales_to;
	$.xpress_location.text = args.address;
	$.xpress_contact.text = args.contact;
	$.desc.text = args.description;
	$.owner_name.text = args.owner_name;
	$.category.text = args.categoryName;
	$.owner_img_path.image = args.owner_img_path;
}

function refresh(){
	render_page();
	loading.finish();
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	refresh();
}

init();


function popMoreMenu(){
	var picker_list = [{text: 'Report This Ad'}];
	var options = _.pluck(picker_list, "text");
	options.push("Cancel");
	var dialog = Ti.UI.createOptionDialog({
	  cancel: options.length - 1,
	  options: options,
	  title: 'Report'
	});
	dialog.show();
	dialog.addEventListener("click", function(ex){   
		if(ex.index == 0){
			popReport();
		}
	});
}

function popReport(){
	var view = $.UI.create("View", {classes:['wfill','hsize','vert', 'padding', "rounded", "box"], backgroundColor:"#ffffff"});
	var label = $.UI.create("Label", {classes: ['wsize','hsize', 'padding', 'h4'], color: "#000000", text: "Report"});
	var hr = $.UI.create("View", {classes:['hr'], backgroundColor:"#cccccc"});
	var picker_list = [{title: 'This is not a SalesAd'}, {title: 'This Ad is seriously offensive (Sexually explicit, violent, dangerous, hate speech, harassment or bullying)'}, {title: 'This Ad contains incorrect or misleading information'}, {title: 'Others (Please specify)'}, {title:  'Cancel'}];
	var arr = [];
	for (var i=0; i < picker_list.length; i++) {
		var row = $.UI.create("TableViewRow", {error_msg: picker_list[i].title});
		var l = $.UI.create("Label", {classes:['wfill','hsize','padding'], text: picker_list[i].title});
	  	row.add(l);
	  	arr.push(row);
	};
	
	var table = $.UI.create("TableView", {
	  classes:['wfill', "rounded", "hsize", "conthsize"],
	  data: arr,
	  zIndex: 50
	});
	view.add(label);
	view.add(hr);
	view.add(table);
	$.win.add(view);
	table.addEventListener("click", function(e){
		if(e.index != arr.length - 1 && e.index != arr.length - 2){
			COMMON.createAlert("Confirmation", "Are you sure you want to report this Ad for the reason below? \n\n"+e.rowData.error_msg, function(){
				submit_report({report_msg: e.rowData.error_msg});
			}, "Yes");
		}else if(e.index == 3) {
			var ViewAlert = $.UI.create("View", {classes:['vert', 'hsize', 'wfill', 'padding', 'rounded', 'box'], zIndex: 60, backgroundColor: 'white'});
			var LabelTitle = $.UI.create("Label", {classes:['hsize', 'wfill', 'padding'], bottom: 0, text: 'Confirmation\n\nAre you sure you want to report this Ad for the reason below?'});
			var TextField = $.UI.create("TextField", {classes:['hsize', 'wfill', 'padding', 'textfield'], color: "#000", hintText: e.rowData.error_msg});
			var viewbutton = $.UI.create("View", {classes:['wfill', 'hsize', 'padding'], top: 0});
			var ButtonCancel = $.UI.create("Button", {classes:['hsize', 'wsize'], left: 0, title: 'Cancel'});
			var ButtonYes = $.UI.create("Button", {classes:['wsize', 'hsize'], right: 0, title: 'Ok'});
			
			ViewAlert.add(LabelTitle);
			ViewAlert.add(TextField);
			ViewAlert.add(viewbutton);
			viewbutton.add(ButtonCancel);
			viewbutton.add(ButtonYes);
			$.win.add(ViewAlert);
			
			ButtonCancel.addEventListener('click', clickreport);
			ButtonYes.addEventListener('click', clickreport);
			
			function clickreport(e) {
				if(e.source.title == "Cancel") {
					$.win.remove(ViewAlert);
				}else if(e.source.title == "Ok") {
					if(TextField.value != "") {
						submit_report({report_msg: TextField.value});
						$.win.remove(ViewAlert);
					}else {
						alert("Please insert your report message!");
					}
				}
			}
		}
		$.win.remove(view);
	});
}

function submit_report(e){
	loading.start();
	var report_msg = (typeof e.report_msg != "undefined")?e.report_msg:"";
	API.callByPost({url: "submitReportAds", new:true, params:{u_id: u_id, remark: report_msg, category: 2, item_id: args.id}}, {onload: function(responseText){
		var res = JSON.parse(responseText);
		if(res.status == "success"){
			alert("Report Submitted");
		}
		loading.finish();
	}});
}

function getDirection(){
	if (Ti.Geolocation.locationServicesEnabled) {
		COMMON.openWindow(Alloy.createController("express_direction", args).getView());
	}			
	else{
		alert("Please enable GPS on your phone.");
	    Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
			if(e.success){
				COMMON.openWindow(Alloy.createController("express_direction", args).getView());					
			}
			else{
	        	alert("You denied permission.");
			}
	  	});			
	}	
}

function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

function callContact(){
		var the_number = args.contact;
		Ti.Platform.openURL('tel:'+the_number);
}

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
