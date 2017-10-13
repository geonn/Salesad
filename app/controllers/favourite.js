var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];

function unfavourite(e){
		var message = "Are you sure want to remove from favorite";
		var dialog = Ti.UI.createAlertDialog({
		    cancel: 1,
		    buttonNames: ['Cancel','Confirm'],
		    message: message,
		    title: 'Remove from favorite'
		  });
		  dialog.addEventListener('click', function(ex){
		  	if (ex.index == 1){
		  		var favoritesLibrary = Alloy.createCollection('favorites');
		  		var m_id = e.source.m_id;
		     	favoritesLibrary.deleteFavoriteByMid(m_id,u_id);
		     	refresh();
		  	}
		 });
		 dialog.show();
}

function nav_to_merchant(e){
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
	console.log(data);
	if(data.length <=0){
		var img = $.UI.create("ImageView", {image:"/images/Popup_Rewards_Favorite.png", classes:['wfill']});
		var view = $.UI.create("View", {classes:['wfill', 'hsize', 'padding']});
		view.add(img);
		$.inner_box.add(view);
		img.addEventListener("click", function(e){
			COMMON.closeWindow($.win);
		});
	}
	
	for (var i=0; i < data.length; i++) {
		var container = $.UI.create("View", {
			classes:['hsize'],
			 master:1, 
			 backgroundColor: "black",
			 width: cell_width, 
			 left: 10,
			 top:10, 
			 record: data[i]
	    });
			   
		var img_close = $.UI.create("ImageView", {
			image: "/images/Icon_Delete_Round.png", 
			m_id: data[i].m_id,
			width: 30, 
			height: 30, 
			right:3, 
			top:3, 
			zIndex: 100
		});
		
		var cell = $.UI.create("View", {
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
			left:0,
			backgroundColor: random_color[Math.round(Math.random() * 5)],
			classes: ['wfill', 'hsize'],
			touchEnabled: false,
		});
		var image_thumb = $.UI.create("ImageView",{
			width: cell_width,
			classes: ['hsize'],
			left: 0,
			image: (data[i].img_path == "")?"/images/SalesAd_Profile Pic.png":data[i].marchant_thumb,
			touchEnabled: false,
		});
		var text_padd = $.UI.create("View", {
			classes:['wfill','hsize'],
			touchEnabled: false,
		});
		var text_ads = $.UI.create("Label", {
			text: data[i].merchant_name,
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
		container.add(cell);
		container.add(img_close);
		$.inner_box.add(container);
		//cell.addEventListener("click", nav_to_merchant);
		img_close.addEventListener("click", unfavourite);
	};
}

function refresh(){
	$.inner_box.removeAllChildren();
	var favoritesLibrary = Alloy.createCollection('favorites'); 
	data = favoritesLibrary.getFavoritesByUid(u_id); 	
	render_favourite_merchant();
	loading.finish();
}

function init(){
	$.activityIndicator.show();
	$.loadingBar.opacity = "1";
	$.loadingBar.height = "120";
	$.loadingBar.top = "100";	
	setTimeout(function(){
		$.activityIndicator.hide();
		$.loadingBar.opacity = "0";		
		refresh();	
	},1000);
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
