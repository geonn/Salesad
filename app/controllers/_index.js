var args = arguments[0] || {};
var pwidth = (OS_ANDROID)?pixelToDp(Titanium.Platform.displayCaps.platformWidth):Titanium.Platform.displayCaps.platformWidth;
// 0 220
var category_id;

function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

function render_banner(e){
	if(e.data.length <=0){
		$.feature_banner.height = 0;
		return;
	}
	for (var i=0; i < e.data.length; i++) {
		var view = $.UI.create("View", {classes:['hsize','rounded','padding'], bottom: 30, width: 200, right:0, left:10});
		
		var img_banner = $.UI.create("ImageView", {classes:['wfill','hsize'], width: 200, height: 200, image: e.data[i].img_path, target: "ad", record: e.data[i]});
		var label_name = $.UI.create("Label", {classes:['wfill','hsize','h6','small-padding'], maxLines:2, bottom:"0", color: "#fff", text: e.data[i].name});
		var view_label = $.UI.create("View", {classes:['wfill','hsize'], bottom:0, backgroundColor: "#80000000"});
		view_label.add(label_name);
		view.add(img_banner);
		img_banner.addEventListener("click", navTo);
		//view.add(view_label);
		$.feature_banner.add(view);
	};
	$.feature_banner.add($.UI.create("View", {width: 210, height: 210}));
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
	if(value == "Search SalesAd"){
		return;
	}
	$.manage_btn.hide();
	var keyword = value;
	$.main_title.text = "Search result for '"+keyword+"'";
	refresh({url: "getAdByKeyword", params: {keyword: keyword}, onEmpty: function(){
		console.log('onempty add imageview');
		$.ad_list.add($.UI.create("Label", {text: "We couldn't find any results for '"+keyword+"'", classes:['wfill','hsize','padding']}));
	}});
}

function homeQR(e){
	$.manage_btn.hide();
	var m_id = e.m_id || 0;
	console.log(m_id+" see what m_id");
	$.main_title.text = e.merchant_name;
	refresh({url: "getAdByMid", params: {m_id: m_id}, onEmpty: function(){
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
	$.manage_btn.show();
	$.main_title.text = "Favorites";
	refresh({url: "getAdByFavorite", params: {u_id: u_id}, onEmpty: function(){
		console.log('onempty add imageview');
		$.ad_list.add($.UI.create("ImageView", {image: "/images/Popup_Rewards_Favorite.png", classes:['wfill','hsize','padding']}));
	}});
}

function popCategory(e){
	$.manage_btn.hide();
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'category_list.txt');
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
			refresh({url: (category_id == 0)?"getLatestAdList":"getAdByCategory", params: {category: category[e.index].id}});
		}
	});
}

function refresh(e){
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
	}});
}

function init(){
	$.manage_btn.hide();
	refresh({url: "getLatestAdList"});
}

init();
var menu_top = 0;

function postLayoutForWindow(){
	menu_top = $.feature_banner.rect.height + 30;
	$.menu.top = menu_top;
	$.win.removeEventListener("postlayout", postLayoutForWindow);
}
$.win.addEventListener("postlayout", postLayoutForWindow);

Ti.App.addEventListener("homeQR", homeQR);

$.feature_banner.addEventListener("dragend", function(e){
	var x = this.contentOffset.x;
	var index = Math.floor((105+x)/210);
	console.log(index+" index");
	$.feature_banner.scrollTo((index*210),0);
});

$.container.addEventListener("scroll", function(e){
	console.log(e.x+" "+e.y+" "+menu_top);
	if(e.x > 0){
		return;
	}
	if(e.y <= menu_top){
		//$.menu.top = menu_top - e.y;
		$.menu.animate({top: menu_top - e.y, duration: 0});
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
		var hasLocationPermissions = Ti.Geolocation.hasLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS);
	    if (hasLocationPermissions) {
			if (Ti.Geolocation.locationServicesEnabled) {
				COMMON.openWindow(win);
			}else {
				alert("Please open your GPS.");
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
