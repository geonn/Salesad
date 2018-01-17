var args = arguments[0] || {};
/** include required file**/
var API = require('api');
var nav = Alloy.Globals.navMenu;
API.searchNearbyMerchant(args.latitude, args.longitude);
$.activityIndicator.show();
/**Set Custom title**/
var custom = $.UI.create("Label", { 
    text: 'MERCHANTS NEARBY', 
    color: '#ED1C24', 
    width: Ti.UI.SIZE 
 });
  
$.nearbyWin.titleControl = custom;

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
			var noRecord = $.UI.create("Label", {  
			    text: "No record found", 
			    color: '#ED1C24', 
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
		 
				var popUpTitle = $.UI.create("Label", {
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
				
				var category =  $.UI.create("Label", {
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
				
				var distance =  $.UI.create("Label", {
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
function windowClose(){
	COMMON.closeWindow($.nearbyWin);
}
Ti.App.addEventListener("ads:close",windowClose);
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

$.nearbyWin.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.nearbyWin); 
});
