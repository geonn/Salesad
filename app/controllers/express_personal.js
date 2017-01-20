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
var anchor = COMMON.todayDateTime();
var last_updated = COMMON.todayDateTime();
var keyword = "";

function getPreviousData(param){
	var model = Alloy.createCollection("xpress");
	data = model.getData({anchor: anchor, u_id: u_id, last_updated: last_updated, start: start, latest: false, keyword: keyword, category_id: category_id});
	start = start + data.length;
	console.log(data.length+" "+start);
}	

function doSearch(){
	start = 0;
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
			anchor = COMMON.todayDateTime();
			getPreviousData({keyword:$.searchbar.value});
			render({clear: true});
		}
	});
}	
	
function refresh(){
	start = 0;
	anchor = COMMON.todayDateTime();
	last_updated = COMMON.todayDateTime();
	getPreviousData({});
	render({});
}	

function render(e){
	var pwidth = Titanium.Platform.displayCaps.platformWidth;
	if(typeof e.clear != "undefined"){
		$.content.removeAllChildren();
	}
	if(OS_ANDROID){
		cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	}else{
		cell_width = Math.floor(pwidth / 2) - 15;
	}
	for (var i=0; i < data.length; i++) {
		var obj_category = _.where(category, {id: data[i].category});
		data[i].owner_img_path = (data[i].owner_img_path == "")?"/images/logo_small.png":data[i].owner_img_path;
		_.extend(data[i], {categoryName: obj_category[0].categoryName});
		var container = $.UI.create("View", {classes:['hsize'], master:1, backgroundColor: "#ffffff", width: cell_width, left: 10, top:10, record: data[i]});
		var inner_view = $.UI.create("View", {classes:['wfill','hsize','vert']});
		var img_close = $.UI.create("ImageView", {image: "/images/Icon_Delete_Round.png", width: 30, height: 30, right:5, top:5, zIndex: 100});
		var img = $.UI.create("ImageView", {image: data[i].img_path, classes:['hsize', 'wfill']});
		var title = $.UI.create("Label", {classes: ['h6', 'bold','wfill','small-padding'], height: 30,ellipsize: true,wordWrap:false,  textAlign:"left",  text: data[i].description});
		var subtitle = $.UI.create("Label", {classes: ['h7','wfill','hsize','small-padding'], top:0, textAlign:"left",  text: data[i].sales_from+" - "+data[i].sales_to});
		var hr = $.UI.create("View", {classes:['hr']});
		var view_bottom = $.UI.create("View", {classes:['wfill','hsize','small-padding']});
		var view_bottom_right = $.UI.create("View", {classes:['wfill','hsize','vert'], left: 45});
		var owner_img = $.UI.create("ImageView", {image: data[i].owner_img_path, defaultImage: "/images/logo_small.png",height:40, width: 40, left:0});
		var owner_name = $.UI.create("Label", {classes: ['h6', 'bold','wfill'], top:0, height: 30,ellipsize: true,wordWrap:false,  textAlign:"left",  text: data[i].owner_name});
		
		var label_category = $.UI.create("Label", {classes: ['h6','wfill'], height: 15, ellipsize: true,wordWrap:false,  textAlign:"left",  text: obj_category[0].categoryName});
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
		$.content.add(container);
	};
}

function popDelete(e){
	console.log('yes');
	COMMON.createAlert("Alert", "Are you sure want to delete it?", function(ex){
		var source = parent({name:"master", value: 1}, e.source);
		alert(source.record.id);
	API.callByPost({
		url: "getAdsStatus",
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

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 