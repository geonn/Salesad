var args = arguments[0] || {};

/** include required file**/
var API = require('api');

/** Keep track popUp view**/
var hideWin = 1;

$.typeWindowPopUp.addEventListener('touchend', function(e){
	if(hideWin == 1){
		$.typeWindowPopUp.close({
			curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
			opacity: 0,
			duration: 200
		});
	}
	hideWin = 1;
});

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "category",
	action: "view",
	label: "category popup",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Category Popup"
});
function navByType(evt){
	hideWin =0;
	if(evt.source.source == "nearby"){
		if (Ti.Geolocation.locationServicesEnabled) {
			Titanium.Geolocation.purpose = 'Get Current Location';
		    Ti.Geolocation.getCurrentPosition(function(e){
		    	
		    	if(e.success == 0){
		    		alert('Please enable location services in order to check nearby merchants');
		    		//return;
		    	}else{
		    		Ti.App.fireEvent('showNav');
			    	var win = Alloy.createController("nearbyList",{latitude:e.coords.latitude ,longitude:e.coords.longitude}).getView(); 
					var nav = Alloy.Globals.navMenu;
					nav.openWindow(win,{animated:true}); 
		    	}
		    	
		    	
		    });
		} else {
		    alert('Please enable location services');
		}
	
	}else if(evt.source.source == "feed"){
		var win = Alloy.createController("salesFeed").getView(); 
		var nav = Alloy.Globals.navMenu;
		nav.openWindow(win,{animated:true}); 
	}else{
		 Ti.App.fireEvent('app:triggerAdsType', {
		 	types : evt.source.source,
		 	pullFromServer : true
		 });
		//API.loadMerchantListByType(evt.source.source);
	}
	$.typeWindowPopUp.close({
		curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
		opacity: 0,
		duration: 500
	});
}

$.typeWindowPopUp.addEventListener("close", function(){
    $.destroy();
    hideWin = null;
});


/****** CREATE POP UP TABLE*********/

var TheTable = Titanium.UI.createTableView({
	width:'100%',
	separatorColor: '#ffffff',
	scrollable: false
});

var CustomData = [
{ image:'images/icon-favorites.png', title:"Favourite", source:'favorites' },
{ image:'images/icon-recent.png', title:"Recent", source:'recent' },
{ image:'images/icon-popular.png', title:"Popular",  source:'popular'},
{ image:'images/icon-nearby.png', title:"Nearby",  source:'nearby'},
{ image:'images/icon-favorites.png', title:"Sales Feed",  source:'feed'}
];
 
var data=[];

for (var i = 0; i < CustomData.length; i++) {
	var row = Titanium.UI.createTableViewRow({
	    touchEnabled: true,
	    height: 45,
	    selectedBackgroundColor: "#FFE1E1",
	    source: CustomData[i].source,
		backgroundGradient: {
	      type: 'linear',
	      colors: ['#FEFEFB','#F7F7F6'],
	      startPoint: {x:0,y:0},
	      endPoint:{x:0,y:45},
	      backFillStart:false},
	  });
	
	var leftImage =  Titanium.UI.createImageView({
		image:CustomData[i].image,
		source: CustomData[i].source,
		width:25,
		height:25,
		left:10,
		top:10
	});
 
	var popUpTitle = Titanium.UI.createLabel({
		text:CustomData[i].title,
		source: CustomData[i].source,
		font:{fontSize:16},
		color: "#848484",
		width:'auto',
		textAlign:'left',
		top:8,
		left:40,
		height:25
	});


	row.addEventListener('touchend', function(e) {
	  navByType(e);
	});
 
	row.add(leftImage);
	row.add(popUpTitle);
 
	data.push(row);
};

TheTable.setData(data);
$.popup_view.add(TheTable);
