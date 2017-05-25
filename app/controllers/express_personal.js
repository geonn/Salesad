var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];
var cell_width, category_id;
var model = Alloy.createCollection("category");
var category = model.getCategoryList();
var u_id = Ti.App.Properties.getString('u_id') || "";

function navTo(e){
	var record = parent({name: "record"}, e.source);
	var type = 1;
	if(type == 3){
		var win = Alloy.createController("ad", {a_id: 315}).getView(); 
		COMMON.openWindow(win); 
	}else{
		var win = Alloy.createController("express_detail", record).getView(); 
		COMMON.openWindow(win); 
	}
}

var start = 0;
var start2 = 0;
var anchor = COMMON.todayDateTime();
var last_updated = COMMON.todayDateTime();
var keyword = "";

function getPreviousData(param){
	var model = Alloy.createCollection("xpress");
	data = model.ongoingpost({anchor: anchor, u_id: u_id, last_updated: last_updated, start: start, latest: false, keyword: keyword, category_id: category_id});
	data2 = model.expiredpost({anchor: anchor, u_id: u_id, last_updated: last_updated, start: start2, latest: false, keyword: keyword, category_id: category_id});
	console.log("data  "+data);
	console.log("data2  "+data2);
	start = start + data.length;
	start2 += data2.length;
}	

function doSearch(){
	start = 0;
	start2 = 0;
	anchor = COMMON.todayDateTime();
	keyword = $.searchbar.value;
	getPreviousData({});
	render({clear: true});
}

function popMore(){
	var dialog = Ti.UI.createOptionDialog({
	  cancel: 3,
	  options: ['Categories','Add SalesXpress','My Posted SalesXpress','Cancel'],
	  title: 'More'
	});
		
	dialog.show(); 
	dialog.addEventListener("click", function(e){   
		if(e.index == 0){
			popCategory();
		}else if(e.index == 1){
			var win = Alloy.createController("express_add").getView(); 
			COMMON.openWindow(win); 
		}
	});
}
	
function popCategory(){
	var options = _.pluck(category, "categoryName");
	options.push("Cancel");
	var dialog = Ti.UI.createOptionDialog({
	  cancel: options.length - 1,
	  options: options,
	  title: 'Category'
	});
	dialog.show();
	dialog.addEventListener("click", function(e){   
		if(e.index != options.length - 1){
			category_id = category[e.index].id;
			start = 0;
			start2 = 0;
			anchor = COMMON.todayDateTime();
			getPreviousData({keyword:$.searchbar.value});
			render({clear: true});
		}
	});
}	
	
function refresh(){
	start = 0;
	start2 = 0;
	anchor = COMMON.todayDateTime();
	last_updated = COMMON.todayDateTime();
	getPreviousData({});
	$.content.removeAllChildren();
	render({});
}

function render(e){
	var pwidth = Titanium.Platform.displayCaps.platformWidth;
	$.content.removeAllChildren();
	$.history.removeAllChildren();
	var view1 = $.UI.create("View", {classes:['wfill','hsize','vert'], bottom: "10"});
	var view2 = $.UI.create("View", {classes:['wfill','hsize','vert'], bottom: "10"});
	view1.add($.UI.create("Label", {classes: ['wfill', 'hsize'], bottom: 5, color: "black", text: "Ongoing Posts", textAlign: "center"}));
	view1.add($.UI.create("View", {classes:['hr'], backgroundColor: "#000"}));
	view1.add($.UI.create("Label", {classes: ['wfill', 'hsize'], id: "T1", top: 90, bottom: 90, textAlign: "center", text: "You have no expired posts at this moment."}));
	$.content.add(view1);
	view2.add($.UI.create("Label", {classes: ['wfill', 'hsize'], bottom: 5, color: "black", text: "Expired Posts", textAlign: "center"}));
	view2.add($.UI.create("View", {classes:['hr'], backgroundColor: "#000"}));
	view2.add($.UI.create("Label", {classes: ['wfill', 'hsize'], id: "T2", top: 90, bottom: 90, textAlign: "center", text: "You have no expired posts at this moment."}));
	$.history.add(view2);
	
	if(OS_ANDROID){
		cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	}else{
		cell_width = Math.floor(pwidth / 2) - 15;
	}
	
	for (var i=0; i < data.length; i++) {
		var obj_category = _.where(category, {id: data[i].category});
		data[i].owner_img_path = (data[i].owner_img_path == "")?"/images/SalesAd_Profile Pic.png":data[i].owner_img_path;
		_.extend(data[i], {categoryName: obj_category[0].categoryName});
		var container = $.UI.create("View", {classes:['hsize'], master:1, backgroundColor: "#ffffff", width: cell_width, left: 10, top:10, record: data[i]});
		var inner_view = $.UI.create("View", {classes:['wfill','hsize','vert']});
		var img_close = $.UI.create("ImageView", {image: "/images/Icon_Delete_Round.png", width: 30, height: 30, right:5, top:5, zIndex: 100});
		var img = $.UI.create("ImageView", {image: data[i].img_path, classes:['hsize', 'wfill']});
		var title = $.UI.create("Label", {classes: ['h6', 'bold','wfill', 'hsize'], left: 5, right: 5, bottom: 3, ellipsize: true,wordWrap:false,  textAlign:"left",  text: data[i].description});
		var subtitle = $.UI.create("Label", {classes: ['h7','wfill','hsize'], left: 5, right: 5, bottom: 3, textAlign:"left",  text: data[i].sales_from+" - "+data[i].sales_to});
		var hr = $.UI.create("View", {classes:['hr'], backgroundColor: "#E3E5E8"});
		var view_bottom = $.UI.create("View", {classes:['wfill','hsize','small-padding']});
		var view_bottom_right = $.UI.create("View", {classes:['wfill','hsize','vert'], left: 45});
		var owner_img = $.UI.create("ImageView", {image: data[i].owner_img_path, defaultImage: "/images/logo_small.png",height:30, width: 30, left:0, borderRadius: 20});
		var owner_name = $.UI.create("Label", {classes: ['h6', 'bold','wfill', 'hsize'], top:0, ellipsize: true,wordWrap:false,  textAlign:"left",  text: data[i].owner_name});
		var label_category = $.UI.create("Label", {classes: ['h6','wfill', 'hsize'], ellipsize: true,wordWrap:false,  textAlign:"left",  text: obj_category[0].categoryName});
		inner_view.add(img);
		inner_view.add(title);
		inner_view.add(subtitle);
		inner_view.add(hr);
		view_bottom_right.add(owner_name);
		view_bottom_right.add(label_category);
		view_bottom.add(owner_img);
		view_bottom.add(view_bottom_right);
		inner_view.add(view_bottom);
		inner_view.addEventListener("click", navTo);
		img_close.addEventListener("click", popDelete);
		container.add(img_close);
		container.add(inner_view);
		view1.add(container);
		
	}
	for (var i=0; i < data2.length; i++) {
		var obj_category = _.where(category, {id: data2[i].category});
		data2[i].owner_img_path = (data2[i].owner_img_path == "")?"/images/SalesAd_Profile Pic.png":data2[i].owner_img_path;
		_.extend(data2[i], {categoryName: obj_category[0].categoryName});
		var container = $.UI.create("View", {classes:['hsize'], master:1, backgroundColor: "#ffffff", width: cell_width, left: 10, top:10, record: data2[i]});
		var inner_view = $.UI.create("View", {classes:['wfill','hsize','vert']});
		var img_close = $.UI.create("ImageView", {image: "/images/Icon_Delete_Round.png", width: 30, height: 30, right:5, top:5, zIndex: 100});
		var img = $.UI.create("ImageView", {image: data2[i].img_path, classes:['hsize', 'wfill']});
		var title = $.UI.create("Label", {classes: ['h6', 'bold','wfill', 'hsize'], left: 5, right: 5, bottom: 3, ellipsize: true,wordWrap:false,  textAlign:"left",  text: data2[i].description});
		var subtitle = $.UI.create("Label", {classes: ['h7','wfill','hsize'], left: 5, right: 5, bottom: 3, textAlign:"left",  text: data2[i].sales_from+" - "+data2[i].sales_to});
		var hr = $.UI.create("View", {classes:['hr'], backgroundColor: "#E3E5E8"});
		var view_bottom = $.UI.create("View", {classes:['wfill','hsize','small-padding']});
		var view_bottom_right = $.UI.create("View", {classes:['wfill','hsize','vert'], left: 45});
		var owner_img = $.UI.create("ImageView", {image: data2[i].owner_img_path, defaultImage: "/images/logo_small.png",height:30, width: 30, left:0, borderRadius: 20});
		var owner_name = $.UI.create("Label", {classes: ['h6', 'bold','wfill', 'hsize'], top:0, ellipsize: true,wordWrap:false,  textAlign:"left",  text: data2[i].owner_name});
		var label_category = $.UI.create("Label", {classes: ['h6','wfill', 'hsize'], ellipsize: true,wordWrap:false,  textAlign:"left",  text: obj_category[0].categoryName});
		inner_view.add(img);
		inner_view.add(title);
		inner_view.add(subtitle);
		inner_view.add(hr);
		view_bottom_right.add(owner_name);
		view_bottom_right.add(label_category);
		view_bottom.add(owner_img);
		view_bottom.add(view_bottom_right);
		inner_view.add(view_bottom);
		inner_view.addEventListener("click", navTo);
		img_close.addEventListener("click", popDelete);
		container.add(img_close);
		container.add(inner_view);
		view2.add(container);
	}
	
	if(view1.children.length > 3) {
		view1.remove(view1.children[2]);
	}
	if(view2.children.length > 3) {
		view2.remove(view2.children[2]);
	}
}

function popDelete(e){
	console.log('yes');
	COMMON.createAlert("Alert", "Are you sure want to delete it?", function(ex){
		var source = parent({name:"master", value: 1}, e.source);
	API.callByPost({
		url: "updateSXStatus",
		new: true,
		params: {
			id: source.record.id,
			status: 3
		}
	}, 
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			var xp = Alloy.createCollection("xpress");
			xp.saveArray(arr);
			refresh();
		},
		onerror: function(err){
			_.isString(err.message) && alert(err.message);
		},
		onexception: function(){
			COMMON.closeWindow($.win);
		}
	});
	});
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	refresh();
}

// convert pixel to dp.
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

init();

var load = false;
var lastDistance = 0;
$.content_scrollview.addEventListener("scroll", function(e){
	var theEnd = $.content.rect.height;
	var total = e.y+e.source.rect.height;
	var distance = theEnd - total;
	if (distance < lastDistance){
		var nearEnd = theEnd * .75;
		if (!load && (total >= nearEnd)){
			console.log(nearEnd+" "+total);
			//console.log(e.y+e.source.rect.height+" "+$.content.rect.height);
			load = true;
			getPreviousData({});
			render({});
		}
	}
	lastDistance = distance;
	//
});

$.win.addEventListener("close", function(e){
	Ti.App.fireEvent("home:refresh");
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener('android:back', function (e) {
	COMMON.closeWindow($.win); 
});
