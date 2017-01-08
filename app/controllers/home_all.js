var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];
var cell_width;

function navTo(e){
	var e_id = parent({name: "e_id"}, e.source);
	console.log(e_id+" ez");
	if(e_id == 3){
		var win = Alloy.createController("ad", {a_id: 315}).getView(); 
		COMMON.openWindow(win); 
	}else{
		var win = Alloy.createController("express_detail", {e_id: e_id}).getView(); 
		COMMON.openWindow(win); 
	}
}

var start = 0;
var anchor = COMMON.todayDateTime();
var last_updated = COMMON.todayDateTime();
var keyword = "";

function getPreviousData(param){
	keyword = (typeof param.keyword != "undefined")?param.keyword:keyword;
	var model = Alloy.createCollection("xpress");
	data = model.getData({anchor: anchor, last_updated: last_updated, start: start, latest: false, keyword: keyword});
	start = start + data.length;
	console.log(data.length+" "+start);
}	

function doSearch(){
	start = 0;
	anchor = COMMON.todayDateTime();
	getPreviousData({keyword:$.searchbar.value});
	render({clear: true});
}
	
function refresh(){
	API.callByPost({
		url: "getSXItem",
		new: true
	}, 
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			getPreviousData({});
			render({});
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
	}
	if(OS_ANDROID){
		cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	}else{
		cell_width = Math.floor(pwidth / 2) - 15;
	}
	for (var i=0; i < data.length; i++) {
		var container = $.UI.create("View", {classes:['hsize'], width: cell_width, left: 10, top:10});
		var img = $.UI.create("ImageView", {image: data[i].img_path, classes:['hsize', 'wfill']});
		container.add(img);
		$.content.add(container);
	};
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	refresh();
}

// convert pixel to dp.
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160))+'dp';
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