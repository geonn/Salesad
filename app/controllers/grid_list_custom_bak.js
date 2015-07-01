var args = arguments[0] || {};
var f_select, s_select = '';
var animationType = [];
var u_id = Ti.App.Properties.getString('u_id') || "";
var nav = Alloy.Globals.navMenu; 
/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'MY FAVOURITE', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
});
  
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);  
	Ti.UI.Android.hideSoftKeyboard();    
}else{
	$.custom.titleControl = custom;
}
/* Event Listener */
$.custom.addEventListener("close", function(){
    $.gridView.destroy();
    Ti.App.fireEvent("app:refreshAdsListing");
    createGridListing = null;
    createAdImageEvent = null;
    switch_position = null;
});

var pWidth = Ti.Platform.displayCaps.platformWidth - 10;
var category_data = [{name: "Mid Valley"},{name: "Leisure Mall"},{name: "Sunway"},{name: "Lowyat "}, {name: "Imbi"}];
var category = {name: "Shopping Mall"};

var cateAdsLibrary = Alloy.createCollection("categoryAds");
var category_data = cateAdsLibrary.getAllCategory();
var library = Alloy.createCollection('category'); 
var category_list = library.getCategoryList();

for (var i=0; i < category_list.length; i++) {
	buildBigBlock(category_list[i]);
	var temp = [];
	for (var a=0; a < category_data.length; a++) {
		if(category_data[a]['cate_id'] == category_list[i]['id']){
			temp.push(category_data[a]);
		}
	}
	buildSmallBlock(temp, category_list[i]['categoryName']);
};
function buildBigBlock(data){
	var row = $.UI.create("View", {
		width: Ti.UI.FILL,
		height: Ti.UI.SIZE,
		left: 10,
		layout: "horizontal"
	});
	
	var box = $.UI.create("View", {
		height : (pWidth / 2),
		width : Ti.UI.FILL
	});
	var adImage = Ti.UI.createImageView({
		defaultImage: "/images/warm-grey-bg.png",
		image: data.image,
		height: Ti.UI.FILL,
		width: "auto",
		top: 10,
		right: 10,
		zIndex: 10,
	});
	
	var label = $.UI.create("Label",{
		text: data.categoryName,
		height: Ti.UI.FILL,
		width: Ti.UI.FILL,
		top: 10,
		right: 10,
		zIndex: 10,
		backgroundImage:  "images/transparent-bg.png",
		textAlign: "center", 
	});
	
	box.add(adImage);
	//box.add(label);
	
	row.add(box);
	$.gridView.main.add(row);
	
	box.addEventListener("click", function(e){
		var category_view = children({name: "cate", value: data.categoryName}, $.gridView.main);
		for (var i=0; i < category_view.children.length; i++) {
			 for (var a=0; a < category_view.children[i].children.length; a++) {
				 	for (var b=0; b < category_view.children[i].children[a].children.length; b++) {
			            var view_selected = category_view.children[i].children[a].children[b];
			            rotate_box(view_selected);
		           }
	          }
		}
	});
}

function buildSmallBlock(data, category_name){
	var odd = (data.length % 2);
	var lastrow = (odd)?data.length - 3 : data.length - 2;
	var lastbox = (odd)?data.length - 2 : data.length - 1;
	var lastLabel = (odd)?data.length - 2: data.length;
	var favoritesLibrary = Alloy.createCollection('favorites'); 
	var favorites = favoritesLibrary.getFavoritesByUid(u_id);
	
	var smallBlockView = $.UI.create("View",{
		cate: category_name,
		width: Ti.UI.FILL,
		height: Ti.UI.SIZE,
		layout: "vertical"
	});
	
	for (var i=0; i < data.length; i++) {
		//create row to contain box
		if(i%2 == 0 && lastrow >= i){
			console.log("create row");
			var row = $.UI.create("View", {
				width: Ti.UI.FILL,
				height: Ti.UI.SIZE,
				left: 10,
				layout: "horizontal"
			});
		}
		// create box to contain the icon / label
		if(lastbox >= i){
			console.log("create box");
			var box = $.UI.create("View", {
				height : Ti.UI.SIZE,
				width : "50%",
				layout: "vertical",
			});
		}
		var favourite_checked = false;
		for(c = 0; favorites.length > c; c++){
			if(favorites[c].m_id == data[i]['m_id']){
				favourite_checked = true;
			}
		}
			
		if(lastLabel > i){
			var adImage = Ti.UI.createImageView({
				defaultImage: "/images/warm-grey-bg.png",
				image: data[i]['img_path'],
				height: "auto",
				width: Ti.UI.FILL,
			});
			var view = $.UI.create("View",{
				height: Ti.UI.SIZE,
				width: Ti.UI.FILL,
				top: 10,
				right: 10,
				backgroundColor: "#cccccc",
				textAlign: "center",
				borderRadius: 2,
				borderColor: "#C6C8CA",
				zIndex: 10,
				mod: "box",
				m_id: data[i]['m_id'],
				favourite: favourite_checked,
			});
			
			var pad_categoryLabel = Ti.UI.createView({top:0, width: Ti.UI.FILL, height: Ti.UI.SIZE,  backgroundImage:  "images/transparent-bg.png", zIndex: 10});
			var label = $.UI.create("Label",{
				text: data[i]['name'],
				height: Ti.UI.SIZE,
				width: Ti.UI.FILL,
			   color: "#fff",
				textAlign: "center",
				font:{
					fontSize: 14
				}, 
				top: 4, right:4, left:4, bottom:20
			});
		}else{
			var adImage = Ti.UI.createImageView({
				defaultImage: "/images/warm-grey-bg.png",
				image: data[i]['img_path'],
				height: Ti.UI.FILL,
				width: "auto",
			});
			console.log("box < label2");
			var view = $.UI.create("View",{
				height: ((pWidth / 2) - 20) / 2,
				width: Ti.UI.FILL,
				top: 10,
				right: 10,
				backgroundColor: "#cccccc",
				textAlign: "center",
				borderRadius: 2,
				borderColor: "#C6C8CA",
				zIndex: 10,
				mod: "box",
				m_id: data[i]['m_id'],
				favourite: favourite_checked,
			});
			var pad_categoryLabel = Ti.UI.createView({top:0, width: Ti.UI.FILL, height: Ti.UI.FILL,  backgroundImage:  "images/transparent-bg.png", zIndex: 10});
			var label = $.UI.create("Label",{
				text: data[i]['name'],
				height: Ti.UI.FILL,
				width: Ti.UI.FILL,
			     color: "#fff",
				textAlign: Titanium.UI.TEXT_ALIGNMENT_CENTER,
				font:{
					fontSize: 14
				},
				top: 4, right:4, left:4, bottom:20
			});
		}
		
		var favourite_images = Ti.UI.createImageView({
			image: "images/favorite-status.png",
			height: Ti.UI.FILL,
			width: "auto"
		});
			
		adImage.addEventListener("load", function(e){
			  var a = Ti.UI.createAnimation({
			  	height: Ti.UI.SIZE,
			  	width: Ti.UI.SIZE,
			    duration : 1000,
			  });
			  var b = Ti.UI.createAnimation({
			  	height: Ti.UI.SIZE,
			    duration : 2000,
			  });
			  //e.source.parent.children[1].children[0].textAlign = Titanium.UI.TEXT_ALIGNMENT_LEFT;
			  e.source.parent.children[1].height = Ti.UI.SIZE;
			  e.source.parent.children[1].children[0].animate(a);
			  //e.source.parent.children[1].animate(b);
		});
		
		view.addEventListener("click", function(e){
			var view_selected = parent({name: "mod", value: "box"}, e.source);
			rotate_box(view_selected);
		});
		
		pad_categoryLabel.add(label);
		view.add(adImage);
		view.add(pad_categoryLabel);
		if(favourite_checked){
			view.add(favourite_images);
		}
		box.add(view);
		
		if(i == lastbox && odd){
			console.log('dont add to row'); 
		}else{
			console.log("row < box");
			row.add(box);
			if((i%2 && i > 0) || (i == data.length - 1 && odd)){
				console.log("main < row");
				smallBlockView.add(row);
			}
		}
	};
	$.gridView.main.add(smallBlockView);
}

function rotate_box(view_selected){
	var favoritesLibrary = Alloy.createCollection('favorites');
	var m_front_to_back = Ti.UI.create3DMatrix();
	m_front_to_back = m_front_to_back.rotate(-180, 0, 1, 0);
	var a_front_to_back = Ti.UI.createAnimation({
        transform: m_front_to_back,
        duration: 200,
        box: view_selected
    });
     view_selected.animate(a_front_to_back);
    
    a_front_to_back.addEventListener('complete', function() {
        Ti.API.info('showFront: Animating the back to the front.');
		a_front_to_back.removeEventListener('complete',function(){});
		
        var m_back_to_front = Ti.UI.create3DMatrix();
        m_back_to_front = m_back_to_front.rotate(0, 0, 1, 0);
        var a_back_to_front = Ti.UI.createAnimation({
            transform: m_back_to_front,
            duration: 200,
            curve: Ti.UI.ANIMATION_CURVE_EASE_OUT
        });
		var favourite_images = Ti.UI.createImageView({
			image: "images/favorite-status.png",
			height: Ti.UI.FILL,
			width: "auto"
		});
		if(view_selected.favourite){
			view_selected.favourite = false;
			view_selected.remove(view_selected.children[2]);
			favoritesLibrary.deleteFavoriteByMid(view_selected.m_id); 
			API.updateUserFavourite({
				m_id   : view_selected.m_id,
				u_id	 : u_id,
				status : 2
			});
		}else{
			view_selected.add(favourite_images);
			view_selected.favourite = true;
			var favorite = Alloy.createModel('favorites', {
				    m_id   : view_selected.m_id,
				    u_id	 : u_id,
				    position : 0
				});
			favorite.save();
			API.updateUserFavourite({
				m_id   : view_selected.m_id,
				u_id	 : u_id,
				status : 1
			});
		}
        view_selected.animate(a_back_to_front);
    });
}

function parent(key, e){
	if(eval("e."+key.name+"") != key.value){
		if(eval("e.parent."+key.name+"") != key.value){
			if(eval("e.parent.parent."+key.name+"") != key.value){
    			console.log("box not found");
    		}else{
    			return e.parent.parent;
    		}
    	}else{
    		return e.parent;
    	}
    }else{
    		return e;
    }
}

function children(key, e){
	if(eval("e."+key.name+"") != key.value){
		for (var i=0; i < e.children.length; i++) {
			if(eval("e.children[i]."+key.name+"") == key.value){
		  		return e.children[i];
		 	}
			for (var a=0; a < e.children[i].children.length; a++) {
			  if(eval("e.children[i].children[a]."+key.name+"") == key.value){
			  	return e.children[i].children[a];
			  }
			};
		};
    }else{
		return e;
    }
}

/*** Get ads ***/
var createGridListing = function(res){

	var favoritesLibrary = Alloy.createCollection('favorites'); 
	var merchantsLibrary = Alloy.createCollection('merchants'); 
	var cateAdsLibrary = Alloy.createCollection("categoryAds");
	var branchLibrary = Alloy.createCollection('branches');
	
	var details = favoritesLibrary.getFavoritesByUid(u_id);
  	var counter = 0;
   	var imagepath, adImage, row, cell = '';
 	var last = details.length-1;
 	var tableData = [];
 	
    $.gridView.category_tv.removeAllChildren();
    
    if(details.length < 1){
   		var noRecord = Ti.UI.createLabel({ 
		    text: "No record found", 
		    color: '#CE1D1C', 
		    textAlign: 'center',
		    font:{fontSize:14,fontStyle:'italic'},
		    top: 15,
		    width: Ti.UI.SIZE 
		 });
		$.gridView.category_tv.add(noRecord);
   	}else{
   		for(var i=0; i< details.length; i++) {
   			var m_id = details[i].m_id; 
	   		var branch = branchLibrary.getBranchesByMerchant(m_id); 
	   		var info = merchantsLibrary.getMerchantsById(m_id);
	   		var row = $.gridView.UI.create("TableViewRow",{
	   			height: Ti.UI.SIZE,
	   			width: Ti.UI.FILL,
	   			touchEnabled: true,
	   		});
	   		var view  = $.gridView.UI.create("View",{
	   			layout: "horizontal",
	   			objName: 'enabledWrapperView',
	   			rowID: i,
	   			width: Ti.UI.FILL,
	   			height: Ti.UI.SIZE,
	   			top: 10,
	   			bottom: 10,
	   			left: 10,
	   			right: 10,
	   		});
	   		
	   		var imagepath='';
	   		if(!info.img_path){
	   			imagepath = "icon_mySalesAd.png";
	   		}else{
	   			imagepath = info.img_path;
	   		}
			
			adImage = Ti.UI.createImageView({
				image: imagepath,
				defaultImage: "/images/warm-grey-bg.png",
				height: 50,
				width: 50,
				objName: 'disabledWarpperView',
				touchEnabled: false,
			});
			 
	   		var category_label = $.gridView.UI.create("Label",{
	   			height: Ti.UI.SIZE,
	   			text: info.name,
	   			left: 10,
	   			objName: 'label',
	   			touchEnabled: false,
	   		});
	   		
	   		view.add(adImage);
	   		view.add(category_label);
			row.add(view);
			if(branch == ""){
		   		createAdImageEvent(row, m_id);
	   		}else{
	   			createAdBranchEvent(row, m_id);
	   		}
			tableData.push(row);
			
			table.addEventListener('swipe', function(e){
              if (e.source && e.source.objName !== 'table'){
                Ti.API.info('Row swiped: ' + e.source);
                Ti.API.info('Row swiped: ' + e.source.objName);
                Ti.API.info('Row ID : ' + e.source.rowID);
              }
            });
   		}
   		$.gridView.category_tv.setData(tableData);
   		/*
	    for(var i=0; i< details.length; i++) {
	    	favoritesLibrary.updatePosition(details[i].id, i);
	   		var m_id = details[i].m_id;
	   		var info = merchantsLibrary.getMerchantsById(m_id);
	   		imagepath = info.img_path;
	   		adImage = Utils.RemoteImage({
				image: imagepath
			});
			
	   		if(counter%3 == 0){
	   			row = $.gridView.UI.create('View', {classes: ["row"],});
	   		}
	   		cell = $.gridView.UI.create('View', {
	   			classes: ["cell"], 
	   			top: 2, 
	   			position: counter,
	   			id: details[i].id,
	   			pos: i
	   			});
	   		
	   		createAdImageEvent(cell);
	   		var close = Ti.UI.createImageView({
	   			image: '/images/btn-close.png',
	   			width: 30,
	   			top: 0,
	   			right: 0
	   		});
	   		createCloseEvent(close, cell, details[i].id);
			cell.add(adImage);
			cell.add(close);
			row.add(cell);
			if(counter%3 == 2 || last == counter){
	   			$.gridView.scrollview.add(row);
	   		}
	   		counter++;
		 }
		 */
	 }
};

//dynamic addEventListener for adImage
function createAdImageEvent(adImage, m_id) {
    adImage.addEventListener('click', function(e) {
        goAd(m_id);
    });
}

function createAdBranchEvent(adImage, m_id){
	adImage.addEventListener('click', function(e) {
        goBranch(m_id);
    });
}

var goAd = function(m_id){
	var win = Alloy.createController("ad", {m_id: m_id}).getView(); 
	COMMON.openWindow(win); 
};

var goBranch = function(m_id){
	var win = Alloy.createController("branches", {m_id: m_id}).getView(); 
	COMMON.openWindow(win); 
};
/*
var createAdImageEvent = function(cell) {
    cell.addEventListener('click', function(e) {
        switch_position(cell, e);
    });
};
*/
//dynamic addEventListener for adImage
var createCloseEvent = function(close, cell, id) {
    close.addEventListener('click', function(e) {
        var favoritesLibrary = Alloy.createCollection('favorites');
        
        var message = "Are you sure want to remove from favorite list";
		var dialog = Ti.UI.createAlertDialog({
		    cancel: 1,
		    buttonNames: ['Cancel','Confirm'],
		    message: message,
		    title: 'Remove Favorite'
		});
		dialog.addEventListener('click', function(ex){
		  	if (ex.index == 1){
	  			favoritesLibrary.deleteFavorite(id);
	  			createGridListing();
		  	}
		});
		dialog.show();
	});
};

var switch_position = function(cell, e){
	var favoritesLibrary = Alloy.createCollection('favorites');
	
	if(!f_select){
		var a = $.gridView.UI.create('view', {
		    backgroundColor : '#03FFF2',
		    width : Titanium.UI.FILL,
		    height : Titanium.UI.FILL,
		    opacity : 0.4
		  });
		  cell.add(a);
		f_select = cell;
		animationType.push({ name: 'first', view: cell, shadow: a });
	}else{
		s_select = cell;
		animationType.push({ name: 'second',  view: cell });
		
		var f_image = animationType[0].view.getChildren();
		var s_image = animationType[1].view.getChildren();
		var f_id = animationType[0].view.id;
		var s_id = animationType[1].view.id;
		var f_pos = animationType[0].view.pos;
		var s_pos = animationType[1].view.pos;
		
		favoritesLibrary.updatePosition(f_id, s_pos);
		favoritesLibrary.updatePosition(s_id, f_pos);
		f_select.removeAllChildren();
		s_select.removeAllChildren();
		f_select.add(s_image);
		f_select.id = s_id;
		s_select.add(f_image);
		s_select.id = f_id;
		s_select.remove(animationType[0].shadow);
		//animationType[0].view.add(e.source);
		//animationType[1].view.removeAllChildren();
		
		f_select = '';
		s_select = '';
		animationType = [];
	}
	
};

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.custom); 
}); 

/* App Running */
//createGridListing();