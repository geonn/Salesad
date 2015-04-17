var args = arguments[0] || {};

var nav = Alloy.Globals.navMenu;
var clickTime = null;

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "category",
	action: "view",
	label: "category listing",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Category Main"
});
/** include required file**/
var API = require('api');

/*********************
*******FUNCTION*******
**********************/
var createCustomView = function(title) {
    var view = Ti.UI.createView({
        height: 48,
        backgroundColor: "#FCFBFB"
    });
    var text = Ti.UI.createLabel({
        text: title,
        left: 10,
        color: '#CE1D1C',
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
		nav.openWindow(win,{animated:true}); 
	});
}

function generateMyProfileTable(RegArr){
	var regData=[];
	var RegTable = Titanium.UI.createTableView({
		width:'100%',
		separatorColor: '#ffffff' ,
		scrollable: false
	});
	var fontSizeClasses = (Ti.App.Properties.getString("fontSizeClasses"))?Ti.App.Properties.getString("fontSizeClasses"):"normal_font";
	
	for (var j=0; j< RegArr.length; j++) {
	   
	   var regRow = Titanium.UI.createTableViewRow({
		    touchEnabled: true,
		    selectedBackgroundColor: "#FFE1E1",
		    height: 50, 
		    id: "profile",
			backgroundGradient: {
		      type: 'linear',
		      colors: ['#FEFEFB','#F7F7F6'],
		      startPoint: {x:0,y:0},
		      endPoint:{x:0,y:50},
		      backFillStart:false},
		  });
		
		var leftImage =  Titanium.UI.createImageView({
			image:RegArr[j].leftImage,
			width:50,
			height:50,
			left:10,
			top:0
		});	
		
		var title = $.UI.create('Label', {
			text: RegArr[j].title,
			classes: [fontSizeClasses],
			color: "#848484",
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
		separatorColor: '#ffffff',
		backgroundColor: '#fffff6',
		//headerView: createCustomView('Categories'),
	});
	var fontSizeClasses = (Ti.App.Properties.getString("fontSizeClasses"))?Ti.App.Properties.getString("fontSizeClasses"):"normal_font";
	
	for (var i=0; i< details.length; i++) {
		
	   var row = Titanium.UI.createTableViewRow({
		    touchEnabled: true,
		    height: 50,
		    id: details[i].id,
		    selectedBackgroundColor: "#FFE1E1",
			backgroundGradient: {
		      type: 'linear',
		      colors: ['#FEFEFB','#F7F7F6'],
		      startPoint: {x:0,y:0},
		      endPoint:{x:0,y:50},
		      backFillStart:false},
		  });
		
		var category_name = $.UI.create('Label', {
			text: details[i].categoryName , 
			id: details[i].id,
			classes: [fontSizeClasses],
			color: "#848484",
			width:'auto',
			textAlign:'left',
			left:20,
		});
		
		var rightForwardBtn = Titanium.UI.createImageView({
			image:"/images/btn-forward.png",
			width:15,
			height:15,
			right:20,
			top:20
		});		
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
var custom = Ti.UI.createLabel({ 
    text: 'CONTENTS', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
  
$.category.titleControl = custom;

/**Set mysalesad and my account table**/
var RegArr = [
{ leftImage:'/images/icon_mySalesAd.png', title:"My SalesAd", hasChild:true },
{ leftImage:'/images/icon_accounts.png', title:"Accounts", hasChild:true } 
];

generateMyProfileTable(RegArr);

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
			var win = Alloy.createController("grid_list_custom").getView(); 
			nav.openWindow(win,{animated:true}); 
		}
		if(e.index == 1){
			
			if(user === null){
				var win = Alloy.createController("login").getView(); 
				nav.openWindow(win,{animated:true});	
			}else{
				var win = Alloy.createController("profile").getView(); 
				nav.openWindow(win,{animated:true}); 
			}
			
		} 
	});
}
$.setting.addEventListener('click', function(e){
	var win = Alloy.createController("setting").getView(); 
	nav.openWindow(win,{animated:true}); 
});

$.searchItem.addEventListener('focus', function(e){
	$.searchItem.showCancel =  true; 
	$.searchContainer.opacity = 1;
	$.searchContainer.height = "auto";
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
	API.searchAdsItems(str);		
};

var goAd = function(m_id){
	var win = Alloy.createController("ad", {m_id: m_id}).getView(); 
	nav.openWindow(win,{animated:true}); 
};

var fontReset = function(){
	var RegArr = [
	{ leftImage:'/images/icon_mySalesAd.png', title:"My SalesAd", hasChild:true },
	{ leftImage:'/images/icon_accounts.png', title:"Accounts", hasChild:true } 
	];
	
	generateMyProfileTable(RegArr);
	
	var library = Alloy.createCollection('category'); 
	var details = library.getCategoryList();
	
	generateCategoryTable(details);
};

var searchRes = function(res){
	
	var arr = res.result;
	
	if(arr.length < 1){
		//hide loading bar
		$.loadingBar.height = "0";
		$.loadingBar.top = "0";
		$.loadingBar.opacity = "0";
		
		$.searchContainer.removeAllChildren();
		var noRecord = Ti.UI.createLabel({ 
		    text: "No record found", 
		    color: '#CE1D1C', 
		    textAlign: 'center',
		    font:{fontSize:14,fontStyle:'italic'},
		    top: 15,
		    width: Ti.UI.SIZE 
		 });
		$.searchContainer.add(noRecord);
	}else{

		var TheTable = Titanium.UI.createTableView({
			width:'100%',
			separatorColor: '#ffffff'
		});
		
		var data=[];
		arr.forEach(function(entry) {
		      var row = Titanium.UI.createTableViewRow({
			    touchEnabled: true,
			    height: 70,
			    source: entry.m_id,
			    selectedBackgroundColor: "#FFE1E1",
				backgroundGradient: {
			      type: 'linear',
			      colors: ['#FEFEFB','#F7F7F6'],
			      startPoint: {x:0,y:0},
			      endPoint:{x:0,y:70},
			      backFillStart:false},
			   });
			
				var leftImage =  Titanium.UI.createImageView({
					image:entry.img_path,
					source: entry.m_id,
					width:50,
					height:50,
					left:10,
					top:10
				});	
		 
				var popUpTitle = Titanium.UI.createLabel({
					text:entry.merchant_name,
					font:{fontSize:16},
					source: entry.m_id,
					color: "#848484",
					width:'65%',
					textAlign:'left',
					top:8,
					left:80,
					height:25
				});
				
				var category =  Titanium.UI.createLabel({
					text:entry.category,
					source: entry.m_id,
					font:{fontSize:12,fontWeight:'bold'},
					width:'auto',
					color: "#848484",
					textAlign:'left',
					width:'65%',
					bottom:15,
					left:80,
					height:12
				});
				
				
				var rightForwardBtn =  Titanium.UI.createImageView({
					image:"/images/btn-forward.png",
					source: entry.m_id,
					width:15,
					height:15,
					right:20,
					top:20
				});		
				
				row.addEventListener('touchend', function(e) {
				 	goAd(entry.m_id);
				});
			 
				row.add(leftImage);
				row.add(popUpTitle);
				row.add(category);
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

$.btnBack.addEventListener('click', function(){  
	nav.closeWindow($.category); 
}); 

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
