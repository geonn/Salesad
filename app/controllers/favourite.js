var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var data;
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];

function unfavourite(){
	
}

function nav_to_merchant(e){
	console.log('a');
	var m_id = parent({name: "m_id"}, e.source);
	var win = Alloy.createController("branch_or_ad", {m_id: m_id, from : "favourite"}).getView(); 
	COMMON.openWindow(win); 
}

function render_favourite_merchant(){
	var pwidth = Titanium.Platform.displayCaps.platformWidth;
	if(OS_ANDROID){
		var cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	}else{
		var cell_width = Math.floor(pwidth / 2) - 15;
	}
	
	if(data.length <=0){
		var img = $.UI.create("ImageView", {image:"/images/Popup_Rewards_Favorite.png", classes:['wfill','hsize','padding']});
		$.inner_box.add(img);
		img.addEventListener("click", function(e){
			COMMON.closeWindow($.win);
		});
	}
	
	for (var i=0; i < data.length; i++) {
		console.log("m_id: "+data[i].m_id);
		var cell = $.UI.create("View", {
			left: 10,
			bottom: 10,
			width: cell_width,
			m_id: data[i].m_id,
			classes:['hsize']
		});
		
		var view_container = $.UI.create("View", {
			classes: ['wfill', 'hsize', 'vert'],
			m_id: data[i].m_id,
			backgroundColor: "#ffffff",
			touchEnabled: false,
		});
		var view_backgroundColor = $.UI.create("View", {
			backgroundColor: random_color[Math.round(Math.random() * 5)],
			classes: ['wfill', 'hsize'],
			touchEnabled: false,
		});
		var image_thumb = $.UI.create("ImageView",{
			width: cell_width,
			classes: ['hsize'],
			image: data[i].img_path,
			touchEnabled: false,
		});
		var text_padd = $.UI.create("View", {
			classes:['wfill','hsize'],
			touchEnabled: false,
		});
		var text_ads = $.UI.create("Label", {
			text: data[i].name,
			classes:['wfill', 'hsize', 'h6'],
			color: "#525152",
			touchEnabled: false,
			top: 10, right:4, left:4, bottom:10,
		});
		
		cell.add(view_container);
		text_padd.add(text_ads);
		view_backgroundColor.add(image_thumb);
		view_container.add(view_backgroundColor);
		view_container.add(text_padd);
		$.inner_box.add(cell);
		cell.addEventListener("click", nav_to_merchant);
	};
}

function refresh(){
	var favoritesLibrary = Alloy.createCollection('favorites'); 
	data = favoritesLibrary.getFavoritesByUid(u_id); 
	render_favourite_merchant();
	loading.finish();
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	refresh();
}

function windowClose(){
	COMMON.closeWindow($.win);
}
Ti.App.addEventListener("ads:close",windowClose);
init();

function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
