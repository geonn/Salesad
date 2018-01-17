var args = arguments[0] || {};
var Ads = Alloy.createCollection("ads");
var Items = Alloy.createCollection("items");

/**Set mysalesad and my account table**/
var RegArr = [
	{ leftImage:'/images/icon_my-favourites.png', title:"My Favourite", hasChild:true },
	{ leftImage:'/images/icon_my-profile.png', title:"My Profile", hasChild:true },
	{ leftImage:'/images/icon_my-rewards.png.png', title:"My Rewards", hasChild:true },
];

var clickTime = null;
Alloy.Globals.naviPath.push($.category);
/** google analytics**/ 

/*********************
*******FUNCTION*******
**********************/
var createCustomView = function(title) {
    var view = Ti.UI.createView({
        height: 48,
        backgroundColor: "#FCFBFB"
    });
    var text = $.UI.create("Label", { 
        text: title,
        left: 10,
        color: '#ED1C24',
        font: { fontSize: 18 }
    });
    var line = Ti.UI.createView({
    	height: '1',
    	backgroundColor: '#ccc',
    	bottom: '0',
    	left: 0
    });
    view.add(line);
    view.add(text);
    view.add(line);
    $.headerView.add(view);
};

function addClickEvent(table){
	table.addEventListener('click', function(e){
		// double click prevention
	    var currentTime = new Date();
	    if (currentTime - clickTime < 3000) {
	        return;
	    };
	    clickTime = currentTime;
		var arg = {
	        category_id: e.rowData.id
	    };
		var win = Alloy.createController("category_detail", arg).getView(); 
		COMMON.openWindow(win); 
	});
}

function generateMyProfileTable(RegArr){ 
	var regData=[];
	var RegTable = Titanium.UI.createTableView({
		classes: ['wfill','contwfill','conthsize'],
		height: 150,
		scrollable: false
	});
	var fontSizeClasses = (Ti.App.Properties.getString("fontSizeClasses"))?Ti.App.Properties.getString("fontSizeClasses"):"normal_font";
	
	for (var j=0; j< RegArr.length; j++) {
	   
	   var regRow = Titanium.UI.createTableViewRow({
		    touchEnabled: true,
		    backgroundSelectedColor: "#FFE1E1",
		    height: 50, 
		    id: "profile",
			backgroundColor: "#ffffff",
		  });
		
		var leftImage =  Titanium.UI.createImageView({
			image:RegArr[j].leftImage,
			width:30, 
			height:30,
			left:10,
			defaultImage: "/images/SalesAd_Profile Pic.png"
		});	
		
		var title = $.UI.create('Label', {
			text: RegArr[j].title,
			classes: [fontSizeClasses],
			color: "#88919D",
			width:'auto',
			textAlign:'left',
			left:70,
		});
		
		var rightRegBtn =  Titanium.UI.createImageView({
			image:"/images/btn-forward.png",
			width:15,
			height:15,
			right:20,
			top:20
		});		 
		regRow.add(leftImage);
		regRow.add(title);
		regRow.add(rightRegBtn);
		regData.push(regRow);
	}
	
	RegTable.setData(regData);
	addRegClickEvent(RegTable);
	$.table1Container.add(RegTable); 
}
 
function generateCategoryTable(details){
	var data=[];
	var TheTable = Titanium.UI.createTableView({
		width:'100%', 
		backgroundColor: '#fff',
		//headerView: createCustomView('Categories'),
	});
	var fontSizeClasses = (Ti.App.Properties.getString("fontSizeClasses"))?Ti.App.Properties.getString("fontSizeClasses"):"normal_font";
	
	for (var i=0; i< details.length; i++) {
	   var row = Titanium.UI.createTableViewRow({
		    touchEnabled: true,
		    height: 50,
		    id: details[i].id,
		    backgroundSelectedColor: "#FFE1E1",
			backgroundColor: "#ffffff",
		  });
		
		var leftImage =  Titanium.UI.createImageView({
			image: "http://salesad.my/public/images/category/"+details[i].id+".png",
			width:30, 
			height:30,
			left:10 
		});	
		
		var category_name = $.UI.create('Label', {
			text: details[i].categoryName , 
			id: details[i].id,
			classes: [fontSizeClasses],
			color: "#88919D",
			width:'auto',
			textAlign:'left',
			left:70,
		});
		
		var rightForwardBtn = Titanium.UI.createImageView({
			image:"/images/btn-forward.png",
			width:15,
			height:15,
			right:20,
			top:20
		});		
		row.add(leftImage);
		row.add(category_name);
		row.add(rightForwardBtn);
		data.push(row);
	}
	
	TheTable.setData(data);
	addClickEvent(TheTable);
	
	$.table2Container.add(TheTable); 
}

/************************
*******APP RUNNING*******
*************************/

/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'Search',
    color: '#ED1C24',
    font:{
    	fontSize: 15,
    },
    width: Ti.UI.SIZE 
 });

if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
	//$.searchItem.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
}else{
	$.category.titleControl = custom;
} 

/**Set Category table**/
createCustomView('Categories');

var library = Alloy.createCollection('category'); 
var details = library.getCategoryList();

generateCategoryTable(details);

/*********************
*** Event Listener ***
**********************/
 
function addRegClickEvent(table){
	table.addEventListener('click', function(e){
		/** User session**/
		var user = Ti.App.Properties.getString('session');
		
		if(e.index == 0){
			var win = Alloy.createController("favourite").getView(); 
			COMMON.openWindow(win); 
		}else if(e.index == 1){
			if(user === null){
				var win = Alloy.createController("login").getView();
				if(Ti.Platform.osname == "android"){
					win.fbProxy = FACEBOOK.createActivityWorker({lifecycleContainer: win});
				}
				COMMON.openWindow(win);  
			}else{
				var win = Alloy.createController("profile").getView(); 
				COMMON.openWindow(win); 
			}
		}else if(e.index == 2){
			var win = Alloy.createController("reward").getView(); 
			COMMON.openWindow(win);
		}
	});
}

$.searchItem.addEventListener('focus', function f(e){
	$.searchItem.showCancel =  true; 
	if(Ti.Platform.osname == "android"){
		$.searchItem.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS;
	}
	//$.searchContainer.opacity = 1;
	//$.searchContainer.height = "auto";
	//$.searchItem.blur();
	$.searchItem.removeEventListener('focus', f);
});

$.searchItem.addEventListener('blur', function(e){
	$.searchItem.showCancel =  false;
});

$.searchItem.addEventListener('cancel', function(e){
	$.searchItem.blur();
	$.searchContainer.removeAllChildren();
	$.searchContainer.opacity = 0;
	$.searchContainer.height = 0;
});

var searchResult = function(){
	
	$.activityIndicator.show();
	$.loadingBar.opacity = "1";
	$.loadingBar.height = "120";
	$.loadingBar.top = "100";
	$.searchItem.blur();
	var str = $.searchItem.getValue();
	$.searchContainer.opacity = 1;
	$.searchContainer.height = "auto";
	var arrAds = Ads.searchAds(str);
	var arrItems = Items.searchItems(str);
	Ti.App.fireEvent('app:searchRes', {result1: arrAds, result2: arrItems});
};

var goAd = function(a_id,name,date){
	var win = Alloy.createController("ad", {a_id: a_id,name: name,date: date}).getView(); 
	COMMON.openWindow(win);  
};

function datedescription(from,to) {
	var dateDescription = convertToHumanFormat(from)+" - "+convertToHumanFormat(to);
	if(from == "0000-00-00" && to =="0000-00-00"){
		dateDescription = "Start from now!";
	}else if(from == "0000-00-00" &&to !="0000-00-00"){
		dateDescription = "Until "+convertToHumanFormat(to)+"!";
	}else if(from != "0000-00-00" && to =="0000-00-00"){
		dateDescription = "Start from "+convertToHumanFormat(from)+"!";
	}
	return dateDescription;
}

var fontReset = function(){
	
	generateMyProfileTable(RegArr);
	
	var library = Alloy.createCollection('category'); 
	var details = library.getCategoryList();
	
	generateCategoryTable(details);
};

var searchRes = function(res1){
	
	var arr1 = res1.result1;
	var arr2 = res1.result2;
	$.loadingBar.height = "0";
	$.loadingBar.top = "0";
	$.loadingBar.opacity = "0";
	if(arr1.length < 1 && arr2.length < 1){
		$.searchContainer.removeAllChildren();
		var noRecord = $.UI.create("Label", { 
		    text: "No record found", 
		    color: '#ED1C24', 
		    textAlign: 'center',
		    font:{fontSize:14},
		    top: 15,
		    width: Ti.UI.SIZE 
		 });
		$.searchContainer.add(noRecord);
	}else{
		var TheTable = Titanium.UI.createTableView({
			width:'100%' 
		});
		
		var data=[];
		
		arr1.forEach(function(entry) {
		      var row = Titanium.UI.createTableViewRow({
			    touchEnabled: true,
			    height: 80,
			    source: entry.a_id,
			    name: entry.name,
			    date: datedescription(entry.sales_from,entry.sales_to),
			    backgroundSelectedColor: "#FFE1E1",
				backgroundColor: "#ffffff",
			   });
			
				var leftImage =  Titanium.UI.createImageView({
					image:entry.img_path,
					source: entry.a_id,
					name: entry.name,
					date: datedescription(entry.sales_from,entry.sales_to),
					width:60,
					height:60,
					left:10,
					top:10
				});
				
				var viewlabel = $.UI.create("View", {
					source: entry.a_id,
					name: entry.name,
					date: datedescription(entry.sales_from,entry.sales_to),
					width: '65%',
					height: '100%',
					classes: ['vert']
				});
		 
				var popUpTitle = $.UI.create("Label", {
					text:entry.name,
					font:{fontSize:16},
					source: entry.a_id,
					name: entry.name,
					date: datedescription(entry.sales_from,entry.sales_to),
					color: "#88919D",
					textAlign:'left',
					top:8,
					left:15
				});
				
				var merchant_name =  $.UI.create("Label", {
					text:entry.merchant_name,
					source: entry.a_id,
					name: entry.name,
					date: datedescription(entry.sales_from,entry.sales_to),
					font:{fontSize:12},
					color: "#88919D",
					textAlign:'left',
					left:15,
					backgroundColor: "000"
				});
				
				var rightForwardBtn =  Titanium.UI.createImageView({
					image:"/images/btn-forward.png",
					source: entry.a_id,
					name: entry.name,
					date: datedescription(entry.sales_from,entry.sales_to),
					width:40,
					height:40,
					right:10,
					top:15
				});		
				
				row.addEventListener('touchend', function(e) {
				 	goAd(e.source.source,e.source.name,e.source.date);
				});
			 
				row.add(leftImage);
				viewlabel.add(popUpTitle);
				viewlabel.add(merchant_name);
				row.add(viewlabel);
			 	row.add(rightForwardBtn);
				data.push(row);
		});
		
		arr2.forEach(function (entry) {
			var row = Titanium.UI.createTableViewRow({
				touchEnabled: true,
				height: 80,
				source: entry.a_id,
				name: entry.name,
				date: datedescription(entry.sales_from,entry.sales_to),
				backgroundSelectedColor: "#FFE1E1",
				backgroundColor: "#FFF"
			});
			
			var leftImage = Titanium.UI.createImageView({
				image: entry.img_path,
				source: entry.a_id,
				name: entry.name,
				date: datedescription(entry.sales_from,entry.sales_to),
				width: 60, 
				height: 60,
				left: 10,
				top: 10
			});
			
			var viewlabel = $.UI.create("View", {
				source: entry.a_id,
				name: entry.name,
				date: datedescription(entry.sales_from,entry.sales_to),
				width: '65%',
				height: '100%',
				classes: ['vert']
			});
			
			var popUpTitle = $.UI.create('Label', {
				text: entry.name,
				font: {
					fontSize: 16
				},
				source: entry.a_id,
				name: entry.name,
				date: datedescription(entry.sales_from,entry.sales_to),
				color: "#88919D",
				textAlign: 'left',
				top: 8,
				left: 15,
			});
			
			var merchant_name = $.UI.create('Label', {
				text: entry.merchant_name,
				source: entry.a_id,
				name: entry.name,
				date: datedescription(entry.sales_from,entry.sales_to),
				font: {
					fontSize: 12
				},
				color: "88919D",
				textAlign: 'left',
				left: 15,
			});
			
			var rightForwardBtn = Titanium.UI.createImageView({
				image: "/images/btn-forward.png",
				source: entry.a_id,
				name: entry.name,
				date: datedescription(entry.sales_from,entry.sales_to),
				width: 40,
				height: 40,
				right: 10,
				top: 15
			});
			
			row.addEventListener('touchend', function(e) {
				goAd(e.source.source,e.source.name,e.source.date);
			});
			
			row.add(leftImage);
			viewlabel.add(popUpTitle);
			viewlabel.add(merchant_name);
			row.add(viewlabel);
			row.add(rightForwardBtn);
			data.push(row);
		});
		
		TheTable.setData(data);
		$.searchContainer.add(TheTable);
		$.searchContainer.height = "auto";
	}
};

$.searchItem.addEventListener("return", searchResult);

$.searchContainer.addEventListener('click',function(e){
	$.searchItem.blur();
	$.searchContainer.removeAllChildren();
	$.searchContainer.opacity = 0;
	$.searchContainer.height = 0;
});

function closeWindow() {
	COMMON.closeWindow($.category);
}
Ti.App.addEventListener("ads:close",closeWindow);
setTimeout(function(){
	if(Ti.Platform.osname == "android"){  
		Ti.UI.Android.hideSoftKeyboard();  
		$.searchItem.blur();
		$.searchItem.hide();
        $.searchItem.show();
        if(Ti.Platform.osname == "android"){
			$.searchItem.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
		}
	}
},100);
 
$.category.addEventListener("close", function(){
	
    $.destroy();
    Ti.App.removeEventListener('app:searchRes', searchRes);
	Ti.App.removeEventListener('app:fontReset', fontReset);
    /* release function memory */
    createCustomView = null;
    library          = null;
    details          = null;
});

Ti.App.addEventListener('app:searchRes', searchRes);
Ti.App.addEventListener('app:fontReset', fontReset);

$.category.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.category); 
});
