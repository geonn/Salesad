var args = arguments[0] || {};
var categoryAds = Alloy.createCollection('categoryAds');
var ad_model = Alloy.createCollection("ads"); 
var adsList = ad_model.getData(true); 
var showCurLoc = false;
var cell_width, category_id;
var u_id = Ti.App.Properties.getString('u_id') || "";
var start = 0;
var anchor = COMMON.todayDateTime();
var last_updated = COMMON.todayDateTime();
var keyword = "";
var model = Alloy.createCollection("xpress");
var xpress_data = model.getData({anchor: anchor, offset:100, last_updated: last_updated, start: start, latest: false, keyword: keyword});
if(args.id){
	var clinic = library.getPanelListById(args.id);
}

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
 
var saveCurLoc = function(e) {
    if (e.error) {
        alert('Location service is disabled. ');
    } else {
    	showCurLoc = true;
    	Ti.App.Properties.setString('latitude', e.coords.latitude);
    	Ti.App.Properties.setString('longitude', e.coords.longitude);
    	render_map();
    	Ti.Geolocation.addEventListener('location', centerMap);
    }
    Ti.Geolocation.removeEventListener('location',saveCurLoc);
};

if (Ti.Geolocation.locationServicesEnabled) {
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
    Ti.Geolocation.addEventListener('location', saveCurLoc);
} 

function centerMap(e){
	var lat = Ti.App.Properties.getString('latitude');
	var lot = Ti.App.Properties.getString('longitude');
	$.mapview.region =  {latitude: lat, longitude:lot, latitudeDelta:0.005, longitudeDelta:0.005};
	Ti.Geolocation.removeEventListener('location', centerMap);
}

function render_map(){
	if(showCurLoc == true){	
	 	xpress_data.push({longitude:"testing for longitude",latitude:"testing for latitude"});
	 	adsList.push({longitude:"testing for longitude",latitude:"testing for latitude"});
	 	var ML=[];
		xpress_data.forEach(function(entry) {
		    var longitude1=parseFloat(entry.longitude);
		    var latitude1=parseFloat(entry.latitude);   
		    if(isNaN(longitude1)||isNaN(latitude1)){
		     entry.longitude="";
		     entry.latitude="";
		    }
		    ML.push({id:entry.id,longitude:entry.longitude,latitude:entry.latitude,name:entry.description,subtitle:entry.owner_name,myid:entry.store_name,type:1,record:entry});
		   });
		   //test
		adsList.forEach(function(entry) {
		    var longitude1=parseFloat(entry.longitude);
		    var latitude1=parseFloat(entry.latitude);   
		    if(isNaN(longitude1)||isNaN(latitude1)){
		     entry.longitude="";
		     entry.latitude="";
		    }
		    ML.push({id:entry.a_id,longitude:entry.longitude,latitude:entry.latitude,name:entry.ads_name,subtitle:entry.ads_name,myid:entry.store_INFO,type:2,a_from:entry.sales_from,a_to:entry.sales_to});
		});	
	 	ML.forEach(function(entry) {
			var detBtn =Ti.UI.createButton({
			    backgroundImage: '/images/btn-forward.png',
			    color: "red",
			    height: 20,
				width: 20,
				a_id: entry.id,
				bet_date: datedescription(entry.a_from,entry.a_to),
				name: entry.name,
				type: entry.type,
				record:entry.record
			});
			detBtn.addEventListener('click', function(ex){ 
				if(ex.source.type==2){
					var win = Alloy.createController("ad", {a_id: ex.source.a_id,name: ex.source.name,date: ex.source.bet_date}).getView(); 
					COMMON.openWindow(win,{animated:true});					
				} 
				if(ex.source.type==1){
					COMMON.openWindow(Alloy.createController("express_detail", ex.source.record).getView()); 					
				}
				return true;
			});       
			var merchantLoc = Alloy.Globals.Map.createAnnotation({
			    latitude:entry.latitude,
			    longitude:entry.longitude,
			    title: entry.name,
			    image: '/images/sales-ad-loc_small.png',
			    animate : true, 
			    subtitle: entry.subtitle,
			    pincolor: Alloy.Globals.Map.ANNOTATION_RED,
			    rightView: detBtn,
			    myid: entry.id,// Custom property to uniquely identify this annotation.
			    type: entry.type,
			    record: entry.record
			}); 
			if(entry.latitude != "" &&entry.longitude !=""){
				$.mapview.addAnnotation(merchantLoc); 
			}			
		});	
		var lat = Ti.App.Properties.getString('latitude');
		var lot = Ti.App.Properties.getString('longitude');
		$.mapview.region =  {latitude: lat, longitude:lot,
	                    latitudeDelta:0.05, longitudeDelta:0.05};
	} 
}

$.mapview.addEventListener('click', function(evt) {
    if(OS_ANDROID){
	    if(evt.clicksource=="infoWindow"||evt.clicksource=="subtitle"||evt.clicksource=="rightPane"){
			if(evt.annotation.type==2){
				var win = Alloy.createController("ad", {a_id: evt.annotation.myid}).getView(); 
				COMMON.openWindow(win,{animated:true});					
			} 
			if(evt.annotation.type==1){
				COMMON.openWindow(Alloy.createController("express_detail", evt.annotation.record).getView()); 					
			}			
			win=null;   	
	    }        	
    } 	  
});

$.location.addEventListener("close", function(){
	//Ti.Geolocation.removeEventListener('location',saveCurLoc);
    $.destroy();
});

function closeWindow(){
	COMMON.closeWindow($.location); 

}
Ti.App.addEventListener("ads:close",closeWindow);

$.location.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.location); 
});
