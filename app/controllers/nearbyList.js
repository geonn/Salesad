var args = arguments[0] || {};
/** include required file**/
var API = require('api');
var nav = Alloy.Globals.navMenu;
API.searchNearbyMerchant(args.latitude, args.longitude);
$.activityIndicator.show();
/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'MERCHANTS NEARBY', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
  
$.nearbyWin.titleControl = custom;

/** google analytics**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "merchants",
		action: "view",
		label: "nearby list",
		value: 1
	}); 
	Alloy.Globals.tracker.trackScreen({
		screenName: "Nearby List"
	});
}else{ 
	Alloy.Globals.tracker.addEvent({
        category: "merchants",
		action: "view",
		label: "nearby list",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView('Nearby List');
}
var goAd = function(res){
	 
	var win = Alloy.createController("ad", {m_id: res.source.source}).getView(); 
	nav.openWindow(win,{animated:true}); 
};

var nearbyMerchantResult = function(res){
	 
	var TheTable = Titanium.UI.createTableView({
		width:'100%',
		separatorColor: '#ffffff'
	});
	
	var data=[];
	if(res.status == "success"){
		//hide loading bar
		$.loadingBar.height = "0";
		$.loadingBar.top = "0";

   		var arr = res.data;
   		var counter = 0;
   		
   		if(arr.length < 1){
			var noRecord = Ti.UI.createLabel({ 
			    text: "No record found", 
			    color: '#CE1D1C', 
			    textAlign: 'center',
			    font:{fontSize:14,fontStyle:'italic'},
			    top: 15,
			    width: Ti.UI.SIZE 
			 });
			$.nearbyView.add(noRecord);
		}else{

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
					bottom:23,
					left:80,
					height:12
				});
				
				var distance =  Titanium.UI.createLabel({
					text:entry.distance,
					source: entry.m_id,
					font:{fontSize:12,fontWeight:'bold'},
					width:'auto',
					color: "#848484",
					textAlign:'left',
					bottom:5,
					left:80,
					height:12
				});
				
				var rightForwardBtn =  Titanium.UI.createImageView({
					image:"/images/btn-forward.png",
					source: entry.m_id,
					width:15,
					right:20 
				});		
				
				row.addEventListener('touchend', function(e) {
				 	goAd(e);
				});
			 
				row.add(leftImage);
				row.add(popUpTitle);
				row.add(category);
			 	row.add(distance);
			 	row.add(rightForwardBtn);
				data.push(row);
	   		});
	   		
	   		TheTable.setData(data);
			$.nearbyView.add(TheTable);
		}
   	}
};

$.btnBack.addEventListener('click', function(){ 
	var nav = Alloy.Globals.navMenu; 
	nav.closeWindow($.nearbyWin); 
}); 

$.nearbyWin.addEventListener("close", function(){
	Ti.App.removeEventListener('app:nearbyMerchantResult', nearbyMerchantResult);
    $.destroy();
    /* release function memory */
    nearbyMerchantResult = null;
});

Ti.App.addEventListener('app:nearbyMerchantResult', nearbyMerchantResult);