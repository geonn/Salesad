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
		var view = $.UI.create("View", {classes:['hsize','rounded','padding'], bottom: 30, backgroundColor: "#f6f6f6", width: 200, right:0, left:10});
		
		var img_banner = $.UI.create("ImageView", {classes:['wfill','hsize'], image: e.data[i].img_path, target: "ad", record: e.data[i]});
		var label_name = $.UI.create("Label", {classes:['wfill','hsize','h6','small-padding'], maxLines:2, bottom:"0", color: "#fff", text: e.data[i].name});
		var view_label = $.UI.create("View", {classes:['wfill','hsize'], bottom:0, backgroundColor: "#80000000"});
		view_label.add(label_name);
		view.add(img_banner);
		img_banner.addEventListener("click", navTo);
		//view.add(view_label);
		$.feature_banner.add(view);
	};
}

function navTo(e){
	console.log(e.source.record);
	COMMON.openWindow(Alloy.createController(e.source.target, e.source.record).getView()); 
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

function popCategory(e){
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
	}});
}

function init(){
	refresh({url: "getLatestAdList"});
}

init();
var menu_top = 0;
$.win.addEventListener("postlayout", function(e){
	menu_top = $.feature_banner.rect.height + 30;
	$.menu.top = menu_top;
});

$.feature_banner.addEventListener("dragend", function(e){
	var x = this.contentOffset.x;
	var index = Math.floor((105+x)/210);
	console.log(index+" index");
	$.feature_banner.scrollTo((index*210),0);
});

$.container.addEventListener("scroll", function(e){
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
