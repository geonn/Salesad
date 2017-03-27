var args = arguments[0] || {};

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
    $.categoryView.headerView.add(view);
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
			left:10 
		});	
		
		var title = $.categoryView.UI.create('Label', {
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
	$.categoryView.table1Container.add(RegTable); 
}
 
function generateCategoryTable(details){
	var data=[];
	var TheTable = Titanium.UI.createTableView({
		width:'100%', 
		backgroundColor: '#fffff6',
		//headerView: createCustomView('Categories'),
	});
	var fontSizeClasses = (Ti.App.Properties.getString("fontSizeClasses"))?Ti.App.Properties.getString("fontSizeClasses"):"normal_font";
	
	for (var i=0; i< details.length; i++) {
		console.log(details);
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
		
		var category_name = $.categoryView.UI.create('Label', {
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
	
	$.categoryView.table2Container.add(TheTable); 
}

/************************
*******APP RUNNING*******
*************************/

/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'Categories', 
    color: '#ED1C24',
    font:{
    	fontSize: 15,
    	fontWeight: "bold"
    },
    width: Ti.UI.SIZE 
 });

if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
	//$.categoryView.searchItem.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
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

$.categoryView.searchItem.addEventListener('focus', function f(e){
	$.categoryView.searchItem.showCancel =  true; 
	if(Ti.Platform.osname == "android"){
		$.categoryView.searchItem.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS;
	}
	//$.categoryView.searchContainer.opacity = 1;
	//$.categoryView.searchContainer.height = "auto";
	//$.categoryView.searchItem.blur();
	$.categoryView.searchItem.removeEventListener('focus', f);
});

$.categoryView.searchItem.addEventListener('blur', function(e){
	$.categoryView.searchItem.showCancel =  false;
});

$.categoryView.searchItem.addEventListener('cancel', function(e){
	$.categoryView.searchItem.blur();
	$.categoryView.searchContainer.removeAllChildren();
	$.categoryView.searchContainer.opacity = 0;
	$.categoryView.searchContainer.height = 0;
});

var searchResult = function(){
	
	$.categoryView.activityIndicator.show();
	$.categoryView.loadingBar.opacity = "1";
	$.categoryView.loadingBar.height = "120";
	$.categoryView.loadingBar.top = "100";
	$.categoryView.searchItem.blur();
	var str = $.categoryView.searchItem.getValue(); 
	$.categoryView.searchContainer.opacity = 1;
	$.categoryView.searchContainer.height = "auto";
	API.searchAdsItems(str);		
};

var goAd = function(a_id){
	console.log(a_id);
	var win = Alloy.createController("ad", {a_id: a_id}).getView(); 
	COMMON.openWindow(win);  
};

var fontReset = function(){
	
	generateMyProfileTable(RegArr);
	
	var library = Alloy.createCollection('category'); 
	var details = library.getCategoryList();
	
	generateCategoryTable(details);
};

var searchRes = function(res){
	
	var arr = res.result;
	console.log(arr);
	//hide loading bar
	$.categoryView.loadingBar.height = "0";
	$.categoryView.loadingBar.top = "0";
	$.categoryView.loadingBar.opacity = "0";
	if(arr.length < 1){
		$.categoryView.searchContainer.removeAllChildren();
		var noRecord = $.UI.create("Label", { 
		    text: "No record found", 
		    color: '#ED1C24', 
		    textAlign: 'center',
		    font:{fontSize:14},
		    top: 15,
		    width: Ti.UI.SIZE 
		 });
		$.categoryView.searchContainer.add(noRecord);
	}else{

		var TheTable = Titanium.UI.createTableView({
			width:'100%' 
		});
		
		var data=[];
		arr.forEach(function(entry) {
		      var row = Titanium.UI.createTableViewRow({
			    touchEnabled: true,
			    height: 70,
			    source: entry.a_id,
			    backgroundSelectedColor: "#FFE1E1",
				backgroundColor: "#ffffff",
			   });
			
				var leftImage =  Titanium.UI.createImageView({
					image:entry.img_path,
					source: entry.a_id,
					width:50,
					height:50,
					left:10,
					top:10
				});	
		 
				var popUpTitle = $.UI.create("Label", {
					text:entry.merchant_name,
					font:{fontSize:16},
					source: entry.a_id,
					color: "#88919D",
					width:'65%',
					textAlign:'left',
					top:8,
					left:80,
					height:25
				});
				
				var category =  $.UI.create("Label", {
					text:entry.category,
					source: entry.a_id,
					font:{fontSize:12,fontWeight:'bold'},
					width:'auto',
					color: "#88919D",
					textAlign:'left',
					width:'65%',
					bottom:15,
					left:80,
					height:18
				});
				
				
				var rightForwardBtn =  Titanium.UI.createImageView({
					image:"/images/btn-forward.png",
					source: entry.a_id,
					width:15,
					height:15,
					right:20,
					top:20
				});		
				
				row.addEventListener('touchend', function(e) {
					console.log(e.source);
				 	goAd(e.source.source);
				});
			 
				row.add(leftImage);
				row.add(popUpTitle);
				row.add(category);
			 	row.add(rightForwardBtn);
				data.push(row);
		});
		
		TheTable.setData(data);
		$.categoryView.searchContainer.add(TheTable);
		$.categoryView.searchContainer.height = "auto";
	}
};

$.categoryView.searchItem.addEventListener("return", searchResult);

$.categoryView.searchContainer.addEventListener('click',function(e){
	$.categoryView.searchItem.blur();
	$.categoryView.searchContainer.removeAllChildren();
	$.categoryView.searchContainer.opacity = 0;
	$.categoryView.searchContainer.height = 0;
});

$.btnBack.addEventListener('click', function(){  
	COMMON.closeWindow($.category); 
}); 

setTimeout(function(){
	if(Ti.Platform.osname == "android"){  
		Ti.UI.Android.hideSoftKeyboard();  
		$.categoryView.searchItem.blur();
		$.categoryView.searchItem.hide();
        $.categoryView.searchItem.show();
        if(Ti.Platform.osname == "android"){
			$.categoryView.searchItem.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS;
		}
	}
},100);
 
$.category.addEventListener("close", function(){
	
    $.categoryView.destroy();
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