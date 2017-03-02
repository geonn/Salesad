var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];
var cell_width, category_id;
var model = Alloy.createCollection("category");
var category = model.getCategoryList();
var ads_data = [];
var ads_counter = 0, counter = 0;

function navTo(e){
	var record = parent({name: "record"}, e.source);
	var type = (typeof e.source.type !="undefined")?e.source.type : 1;
	if(type == 3){
		var win = Alloy.createController("ad", {a_id: record.a_id}).getView(); 
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
	data = model.getData({anchor: anchor, last_updated: last_updated, start: start, latest: false, keyword: keyword, category_id: category_id});
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
		}else if(e.index == 2){
			var win = Alloy.createController("express_personal").getView(); 
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
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("11");
	
	API.callByPost({
		url: "getSXItem",
		new: true,
		params: {last_updated: isUpdate.updated}
	}, 
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			console.log(arr);
			ads_counter = 0, counter = 0, start=0;
			getPreviousData({});
			render({clear:true});
		},
		onerror: function(err){
			_.isString(err.message) && alert(err.message);
		},
		onexception: function(){
			COMMON.closeWindow($.win);
		}
	});
}	

function render(e){
	var pwidth = Titanium.Platform.displayCaps.platformWidth;
	if(typeof e.clear != "undefined"){
		$.content.removeAllChildren();
		if(data.length <= 0){
			$.content.add($.UI.create("Label", {classes:['wfill','hsize','padding'], textAlign:"center", text: "No Result"}));
		}
	}
	if(OS_ANDROID){
		cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	}else{
		cell_width = Math.floor(pwidth / 2) - 15;
	}
	for (var i=0; i < data.length; i++) {
		if(counter % 4 == 0 && counter > 0){
			if(typeof ads_data[ads_counter] != "undefined"){
				var cw = Math.floor(pixelToDp(pwidth)-10);
				var img = $.UI.create("ImageView", {classes: ["padding"], right:0, bottom:0, image: ads_data[ads_counter].img_path, type: 3, record: ads_data[ads_counter]});
				img.addEventListener("click", navTo);
				var v = $.UI.create("View", {width: cw, height: cw});
				v.add(img);
				$.content.add(v);
				ads_counter++;
			}
		}
		var obj_category = _.where(category, {id: data[i].category});
		data[i].owner_img_path = (data[i].owner_img_path == "")?"/images/logo_small.png":data[i].owner_img_path;
		_.extend(data[i], {categoryName: obj_category[0].categoryName});
		var container = $.UI.create("View", {classes:['hsize','vert'], backgroundColor: "#ffffff", width: cell_width, left: 10, top:10, record: data[i]});
		var img = $.UI.create("ImageView", {image: data[i].img_path, classes:['hsize', 'wfill']});
		var title = $.UI.create("Label", {classes: ['h6', 'bold','wfill','small-padding'], height: 30,ellipsize: true,wordWrap:false,  textAlign:"left",  text: data[i].description});
		var subtitle = $.UI.create("Label", {classes: ['h7','wfill','hsize','small-padding'], top:0, textAlign:"left",  text: convertToHumanFormat(data[i].sales_from)+" - "+convertToHumanFormat(data[i].sales_to)});
		var hr = $.UI.create("View", {classes:['hr'], backgroundColor: '#E3E5E8'});
		var view_bottom = $.UI.create("View", {classes:['wfill','hsize','small-padding']});
		var view_bottom_right = $.UI.create("View", {classes:['wfill','hsize','vert'], left: 45});
		var owner_img = $.UI.create("ImageView", {image: data[i].owner_img_path, defaultImage: "/images/logo_small.png", borderRadius: 20, height:40, width: 40, left:0});
		var owner_name = $.UI.create("Label", {classes: ['h6', 'bold','wfill'], top:0, height: 30,ellipsize: true,wordWrap:false,  textAlign:"left",  text: data[i].owner_name});
		
		var label_category = $.UI.create("Label", {classes: ['h6','wfill'], height: 15, ellipsize: true, wordWrap:false,  textAlign:"left",  text: obj_category[0].categoryName});
		container.add(img);
		container.add(title);
		container.add(subtitle);
		container.add(hr);
		view_bottom_right.add(owner_name);
		view_bottom_right.add(label_category);
		view_bottom.add(owner_img);
		view_bottom.add(view_bottom_right);
		container.add(view_bottom);
		container.addEventListener("click", navTo);
		$.content.add(container);
		counter++;
	};
}

function init(){
	$.win.add(loading.getView());
	var ads_model = Alloy.createCollection("ads");
	ads_data = ads_model.getExpressData();
	console.log(ads_data);
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
	var total = (OS_ANDROID)?pixelToDp(e.y)+e.source.rect.height: e.y+e.source.rect.height;
	var distance = theEnd - total;
	
	if (distance < lastDistance){
		var nearEnd = theEnd * 0.8;
		console.log(nearEnd+" "+total);
		if (!load && (total >= nearEnd)){
			load = true;
			getPreviousData({});
			render({});
			load = false;
		}
	}
	lastDistance = distance;
	//
});

Ti.App.addEventListener("home:refresh", refresh);

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 