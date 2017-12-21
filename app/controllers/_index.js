var args = arguments[0] || {};
var pwidth = (OS_ANDROID)?pixelToDp(Titanium.Platform.displayCaps.platformWidth):Titanium.Platform.displayCaps.platformWidth;
// 0 220
var category_id = 0, category_name;
var banner_width = Math.ceil(pwidth * 70 / 100);
var back_enable = false;
var number_feature = 0;
var hold = false;
var interval;

function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

function render_banner(e){
	
	console.log(e.data.length+" e.data.length");
	if(e.data.length <=0){
		$.feature_banner.height = 0;
		return;
	}else{
		$.feature_banner.height = banner_width + 20;
	}
	console.log(e.data);
	$.feature_banner.removeAllChildren();
	var banner_data = _.shuffle(e.data);
	for (var i=0; i < banner_data.length; i++) {
		console.log(banner_width+" banner_width");
		var view = $.UI.create("View", {classes:['rounded','padding'], bottom: 30, width: banner_width, height: banner_width, right:0, left:15});
		
		var img_banner = $.UI.create("ImageView", {classes:['wfill','hsize'], width: banner_width, height: banner_width, image: banner_data[i].img_path, target: "ad", record: banner_data[i]});
		var label_name = $.UI.create("Label", {classes:['wfill','hsize','h6','small-padding'], maxLines:2, bottom:"0", color: "#fff", text: banner_data[i].name});
		var view_label = $.UI.create("View", {classes:['wfill','hsize'], bottom:0, backgroundColor: "#80000000"});
		view_label.add(label_name);
		view.add(img_banner);
		img_banner.addEventListener("click", navTo);
		//view.add(view_label);
		$.feature_banner.add(view);
	};
	$.feature_banner.add($.UI.create("View", {width: banner_width, height: banner_width}));
	postLayoutForWindow();
	auto_rotate();
	postLayoutForWindow();
}

function auto_rotate(){
	var no_banner = $.feature_banner.getChildren();
	interval = setInterval(function(e){
		number_feature = (number_feature + 1 >= no_banner.length - 1)?0:number_feature + 1;
		feature_banner_scrollTo();
	}, 3000);
}

function navTo(e){
	COMMON.openWindow(Alloy.createController(e.source.target, e.source.record || {}).getView()); 
}

function render_latest_ad(e){
	var cell_width = Math.floor((pwidth - 15) / 2) - 16;
	$.ad_list.removeAllChildren();
	for (var i=0; i < e.data.length; i++) {
		var view = $.UI.create("View", {classes:['hsize','vert'], top: 15, right:14, left:1, backgroundColor: "#f6f6f6", width: cell_width, target: "ad", record: e.data[i]});
		
		var img_banner = $.UI.create("ImageView", {classes:['wfill','hsize','rounded'], touchEnabled: false, image: e.data[i].img_thumb});
		var label_name = $.UI.create("Label", {classes:['wfill','hsize','h6','small-padding'], touchEnabled: false, maxLines:2, bottom:"0", color: "#000000", text: e.data[i].name});
		var view_label = $.UI.create("View", {classes:['wfill','hsize'], touchEnabled: false, bottom:0});
		view_label.add(label_name);
		view.add(img_banner);
		view.add(view_label);
		view.addEventListener("click", navTo);
		$.ad_list.add(view);
	};
}

function filterByKeyword(e){
	var value = $.keyword.value;
	$.keyword.blur();
	if(value == "Search SalesAd"){
		return;
	}
	$.manage_btn.hide();
	var keyword = value;
	$.main_title.text = "Search result for '"+keyword+"'";
	console.log("keyword for search"+keyword);
	refresh({url: "getAdByKeyword", params: {keyword: keyword, u_id: Ti.App.Properties.getString('u_id') || ""}, onEmpty: function(){
		console.log(keyword);
		console.log('onempty add imageview');
		$.ad_list.add($.UI.create("Label", {text: "We couldn't find any results for '"+keyword+"'", classes:['wfill','hsize','padding']}));
	}});
}

function homeQR(e){
	$.manage_btn.hide();
	var m_id = e.m_id || 0;
	console.log(m_id+" see what m_id");
	$.main_title.text = e.merchant_name;
	refresh({url: "getAdByMid", params: {m_id: m_id, u_id: Ti.App.Properties.getString('u_id') || ""}, onEmpty: function(){
		console.log('onempty add imageview');
		$.ad_list.add($.UI.create("Label", {text: "We couldn't find any ad for "+e.merchant_name, classes:['wfill','hfill','padding']}));
	}});
}

function filterByFavorite(e){
	var u_id = Ti.App.Properties.getString('u_id') || "";
	if(u_id == ""){
		var win = Alloy.createController("signin_signout", {callback: filterByFavorite}).getView(); 
		COMMON.openWindow(win);
		return;
	}
	$.manage_btn.text = "Manage";
	$.manage_btn.show();
	$.main_title.text = "Favorites";
	refresh({url: "getAdByFavorite", params: {u_id: u_id}, onEmpty: function(){
		console.log('onempty add imageview');
		$.ad_list.add($.UI.create("Label", {text: "Whoops, there are no ads to show from your favorite stores right now.", classes:['wfill','hsize','padding'], top:30,bottom:30}));
	}});
}

function doManage(e){
	if(e.source.text == "Manage"){
		navTo(e);
	}else if(e.source.text == "Refresh"){
		refresh({url: (category_id == 0)?"getLatestAdList":"getAdByCategory", params: {category: category_id, u_id: Ti.App.Properties.getString('u_id') || ""}, 
		onEmpty: function(){
			var text_message = (category_id == 0)?"Whoops, there are no ads to show right now.":"Whoops, there's no ads to show from "+category_name+" right now.";
			$.ad_list.add($.UI.create("Label", {text: text_message, classes:['wfill','hsize','padding'], top:30,bottom:30}));
		}});
	}
}

function popCategory(e){
	$.manage_btn.text = "Refresh";
	$.manage_btn.show();
	if(back_enable){
		$.main_title.text = "New Sales";
		refresh({url: "getLatestAdList", params: {category: 0, u_id: Ti.App.Properties.getString('u_id') || ""}});
		return;
	}
	
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, 'category_list.txt');
	var contents = f.read();
	var res = JSON.parse(contents);
	var category = res.data;
	category.push({categoryName: "New Sales", id: 0});
	category.reverse();
	console.log(category);
	var options = _.pluck(category, "categoryName");
	options.push("Cancel");
	var dialog = Ti.UI.createOptionDialog({
	  cancel: options.length - 1,
	  options: options,
	  title: 'Categories'
	});
	dialog.show();
	dialog.addEventListener("click", function(e){   
		if(e.index != options.length - 1){			
			category_id = category[e.index].id;
			console.log(category_id+" "+category[e.index].categoryName);
			$.main_title.text = category[e.index].categoryName;
			category_name = category[e.index].categoryName;
			refresh({url: (category_id == 0)?"getLatestAdList":"getAdByCategory", params: {category: category[e.index].id, u_id: Ti.App.Properties.getString('u_id') || ""}, 
			onEmpty: function(){
				$.ad_list.add($.UI.create("Label", {text: "Whoops, there's no ads to show from "+category[e.index].categoryName+" right now.", classes:['wfill','hsize','padding'], top:30,bottom:30}));
			}});
		}
	});
}

function refresh_notification(){
	var u_id = Ti.App.Properties.getString('u_id') || "";
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("13");
	API.callByPost({
		url: "getNotificationByUser",
		new: true,
		params: {u_id: u_id, last_updated: isUpdate.updated},
	},{onload: function(responseText){
		var model = Alloy.createCollection('notification');
		var res = JSON.parse(responseText);
		model.saveArray(res.data);
		checker.updateModule(13, "getNotificationByUser", res.last_updated);
		console.log("success call api");
		updateNotificationNumber();
	}});
}

function updateNotificationNumber(){
	console.log("updateNotificationNumber");
	var model = Alloy.createCollection('notification');
	var total = model.getCountUnread();
	console.log(total+"total here");
	if(total <= 0){
		$.notification_unread.parent.hide();
	}else{
		$.notification_unread.parent.show();
	}
	$.notification_unread.text = total;
}
var refreshing = false;
function refresh(e){
	if(refreshing){
		return;
	}
	refreshing = true;
	clearInterval(interval);
	if(e.url != "getLatestAdList"){
		$.category_button.image = "/images/icons/Icon_Menu_Home.png";
		back_enable = true;
	}else{
		category_id = 0;
		category_name = "";
		$.category_button.image = "/images/icons/Icon_Menu_Categories.png";
		back_enable = false;
	}
	API.callByPost({
		url: e.url,
		new: true,
		params: e.params
	},{onload: function(responseText){
		var res = JSON.parse(responseText);
		var ad_list = res.data || [];
		var banner_list = res.featured || [];
		if(banner_list.length > 0){
			console.log(banner_list.length+" banner_list.length");
			render_banner({data: banner_list});
		}
		render_latest_ad({data: ad_list});
		console.log(ad_list);
		console.log(ad_list.length);
		if(ad_list.length <= 0){
			console.log(typeof e.onEmpty);
			if(typeof e.onEmpty != 'undefined'){
				e.onEmpty();
			}
			
		}
		console.log('ending');
		refreshing = false;
	}});
}

function feature_banner_scrollTo(){
	var x = (OS_ANDROID)?dpToPixel(number_feature*(banner_width+15)):(number_feature*(banner_width+15));
	$.feature_banner.scrollTo(x, 0, {animated: true});
}


function init(){
	$.manage_btn.show();
	refresh_notification();
	refresh({url: "getLatestAdList", u_id: Ti.App.Properties.getString('u_id') || ""});
	var AppVersionControl = require('AppVersionControl');
	AppVersionControl.checkAndUpdate();
}

init();
var menu_top = 0;

function postLayoutForWindow(){
	if($.feature_banner.children.length > 0){
		menu_top = banner_width + 60;
	}else{
		menu_top = 60;
	}
	$.menu.top = menu_top;
	//$.win.removeEventListener("postlayout", postLayoutForWindow);
}

//$.win.addEventListener("postlayout", postLayoutForWindow);
$.win.addEventListener("close", function(){
	Ti.App.removeEventListener("filterByFavorite", filterByFavorite);
	Ti.App.removeEventListener("refresh_notification", refresh_notification);
	Ti.App.removeEventListener("updateNotificationNumber", updateNotificationNumber);
	Ti.App.removeEventListener("homeQR", homeQR);
});

Ti.App.addEventListener("filterByFavorite", filterByFavorite);
Ti.App.addEventListener("refresh_notification", refresh_notification);
Ti.App.addEventListener("updateNotificationNumber", updateNotificationNumber);
Ti.App.addEventListener("homeQR", homeQR);

$.feature_banner.addEventListener("dragstart", function(e){
	e.cancelBubble = true;
	clearInterval(interval);
	$.container.scrollingEnabled = false;
	//hold = true;
});

$.feature_banner.addEventListener("dragend", function(e){
	e.cancelBubble = true;
	var x = (OS_IOS)?this.contentOffset.x:pixelToDp(this.contentOffset.x);
	number_feature = Math.floor((((banner_width+15)/2)+x)/(banner_width+15));
	//hold = false;
	auto_rotate();
	feature_banner_scrollTo();
	$.container.scrollingEnabled = true;
});

$.container.addEventListener("scroll", function(e){
	//console.log(e.x+" "+Math.ceil(pixelToDp(e.y))+" "+menu_top);
	if(e.x > 0){
		return;
	}
	console.log(e.x+' '+e.y);
	var y = (OS_IOS)?e.y:Math.ceil(pixelToDp(e.y));
	if(y <= menu_top){
		//$.menu.top = menu_top - e.y;
		console.log(menu_top - y);
		$.menu.animate({top: menu_top - y, duration: 0});
	}else{
		$.menu.animate({top: 0, duration: 0});
	}
});

function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

var SCANNER = require("scanner");

function QrScan(){
    if(Ti.Media.hasCameraPermissions()){
		SCANNER.openScanner("4");
    }else{
        Ti.Media.requestCameraPermissions(function(e) {
        	if(e.success){
				SCANNER.openScanner("4");				       
	        }
        	else{
        		alert("You denied permission.");
        	}			        
        });	        	
    }	
}

function nearMe(){
	var win = Alloy.createController("nearby").getView();
	if(OS_ANDROID) {
		var hasLocationPermissions = Ti.Geolocation.hasLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE);
	    if (hasLocationPermissions) {
			if (Ti.Geolocation.locationServicesEnabled) {
				COMMON.openWindow(win);
			}else {
				alert("Please open your GPS.");
			}
	    }else{
	    	Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
				if(e.success) {
					if (Ti.Geolocation.locationServicesEnabled) {
						COMMON.openWindow(win);
					}else {
						alert("Please open your GPS.");
					}
				}else {
					alert("You denied permission for now, forever or the dialog did not show at all because it you denied forever before.");
				}
			});
	    }
	}else {
		Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
			if(e.success) {
				if (Ti.Geolocation.locationServicesEnabled) {
					COMMON.openWindow(win);
				}else {
					alert("Please open your GPS.");
				}
			}else {
				alert("You denied permission for now, forever or the dialog did not show at all because it you denied forever before.");
			}
		});
	}
}

function dpToPixel(dp) {
    return ( parseInt(dp) * (Titanium.Platform.displayCaps.dpi / 160));
}