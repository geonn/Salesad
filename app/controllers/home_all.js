var args = arguments[0] || {};
var action_type = args.action_type;// "1 - popular":"0 - recent";
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];

function init(){
	$.win.add(loading.getView());
	loading.start();
	setTimeout(function(e){render_listingBytype();}, 1000);
}

function render_listingBytype(){
	var model_ads = Alloy.createCollection("ads");
	var data = model_ads.getData();
	var counter = 0;
	console.log(data);
	
	var pwidth = Titanium.Platform.displayCaps.platformWidth;
	var cell_width = Math.floor((pwidth - 30)/2);
	console.log(cell_width);
	for (var i=0; i < data.length; i++) {
		var cell = $.UI.create("View", {
			left: 10,
			bottom: 10,
			width: cell_width,
			a_id: data[i].a_id,
			classes:['hsize']
		});
		var view_container = $.UI.create("View", {
			classes: ['wfill', 'hsize', 'vert'],
			backgroundColor: "#ffffff"
		});
		var view_backgroundColor = $.UI.create("View", {
			backgroundColor: random_color[Math.round(Math.random() * 5)],
			classes: ['wfill', 'hsize']
		});
		var image_thumb = $.UI.create("ImageView",{
			width: "100%",
			height: "auto",
			ads_name: data[i].ads_name,
			image: data[i].img_path,
			opacity: 0
		});
		var text_padd = $.UI.create("View", {
			classes:['wfill','hsize']
		});
		var text_ads = $.UI.create("Label", {
			text: data[i].ads_name,
			classes:['wfill', 'hsize', 'h6'],
			color: "#525152",
			top: 10, right:4, left:4, bottom:10,
		});
		cell.add(view_container);
		text_padd.add(text_ads);
		view_backgroundColor.add(image_thumb);
		view_container.add(view_backgroundColor);
		view_container.add(text_padd);
		if(counter % 2){
			$.col1.add(cell);
		}else{
			$.col2.add(cell);
		}
		cell.addEventListener("click", navToAd);
		image_thumb.addEventListener("load", Imageappear);
		counter ++;
	};
	loading.finish();
}

function navToAd(e){
	var a_id = parent({name: "a_id"}, e.source);
	var win = Alloy.createController("ad", {a_id: a_id, from : "home_all"}).getView(); 
	COMMON.openWindow(win); 
}

function Imageappear(e){
	var img = e.source;
	//var ads_name = parent({name: "ads_name"}, e.source);
	//console.log(ads_name);
	console.log(e.source.ads_name);
	img.animate({opacity: 1, duration: 500});
}

init();

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 