var args = arguments[0] || {};
/** include required file**/
var API = require('api');
var nav = Alloy.Globals.navMenu;

var lib_feeds = Alloy.createCollection('feeds');  
var lib_ads = Alloy.createCollection('ads');  
var lib_mer = Alloy.createCollection('merchants');  
var details = lib_feeds.getSalesFeed();	  

$.activityIndicator.show();
/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'Sales Feed', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
  
$.feedWin.titleControl = custom;

/** google analytics**/ 
if(OS_IOS){
	Alloy.Globals.tracker.trackEvent({
		category: "merchants",
		action: "view",
		label: "feed list",
		value: 1
	}); 
	Alloy.Globals.tracker.trackScreen({
		screenName: "Feed List"
	});
}else{ 
	Alloy.Globals.tracker.addEvent({
        category: "merchants",
		action: "view",
		label: "feed list",
		value: 1
    }); 
	Alloy.Globals.tracker.addScreenView('Feed List');
}
var goAd = function(res){
	 
	var win = Alloy.createController("ad", {m_id: res.source.source}).getView(); 
	nav.openWindow(win,{animated:true}); 
};

var feedResult = function(res){
	 
	var TheTable = Titanium.UI.createTableView({
		width:'100%',
		separatorColor: '#ffffff'
	});
	
	var data=[];
 
		//hide loading bar
		$.loadingBar.height = "0";
		$.loadingBar.top = "0";

   		var arr = details;
   		var counter = 0;
   		
   		if(arr.length < 1){
			var noRecord = $.UI.create("Label", { 
			    text: "No record found", 
			    color: '#CE1D1C', 
			    textAlign: 'center',
			    font:{fontSize:14,fontStyle:'italic'},
			    top: 15,
			    width: Ti.UI.SIZE 
			 });
			$.feedView.add(noRecord);
		}else{

	   		arr.forEach(function(entry) {
	   			var a_det = lib_ads.getAdsByMerchantAndAds(entry.m_id);
	   			var m_det = lib_mer.getMerchantsById(entry.m_id ); 
	   			var row = Titanium.UI.createTableViewRow({
			    touchEnabled: true,
			    height: 70,
			    source: a_det.m_id,
			    selectedBackgroundColor: "#FFE1E1",
				backgroundGradient: {
			      type: 'linear',
			      colors: ['#FEFEFB','#F7F7F6'],
			      startPoint: {x:0,y:0},
			      endPoint:{x:0,y:70},
			      backFillStart:false},
			   });
			
				var leftImage =  Titanium.UI.createImageView({
					image:a_det.img_path,
					source: a_det.m_id,
					width:50,
					height:50,
					left:10,
					top:10
				});	
		 
				var popUpTitle = $.UI.create("Label", {
					text:m_det.merchant_name,
					font:{fontSize:16},
					source: entry.m_id,
					color: "#848484",
					width:'65%',
					textAlign:'left',
					top:8,
					left:80,
					height:25
				});
				
				var category =  $.UI.create("Label", {
					text:m_det.state_name,
					source: a_det.m_id,
					font:{fontSize:12,fontWeight:'bold'},
					width:'auto',
					color: "#848484",
					textAlign:'left',
					width:'65%',
					bottom:23,
					left:80,
					height:12
				});
				
				 
				var rightForwardBtn =  Titanium.UI.createImageView({
					image:"/images/btn-forward.png",
					source: a_det.m_id,
					width:15,
					right:20 
				});		
				
				row.addEventListener('touchend', function(e) {
				 	goAd(e);
				});
			 
				row.add(leftImage);
				row.add(popUpTitle);
				row.add(category); 
			 	row.add(rightForwardBtn);
				data.push(row);
	   		});
	   		
	   		TheTable.setData(data);
			$.feedView.add(TheTable);
		}
    
};

$.btnBack.addEventListener('click', function(){ 
	var nav = Alloy.Globals.navMenu; 
	nav.closeWindow($.feedWin); 
}); 

$.feedWin.addEventListener("close", function(){
	Ti.App.removeEventListener('app:feedResult', feedResult);
    $.destroy();
    /* release function memory */
    feedResult = null;
});
feedResult();
Ti.App.addEventListener('app:feedResult', feedResult);