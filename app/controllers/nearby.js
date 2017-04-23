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
console.log(xpress_data.length);
if(args.id){
	var clinic = library.getPanelListById(args.id);
}
 
var saveCurLoc = function(e) {
	console.log("saveCurLoc");
    if (e.error) {
        alert('Location service is disabled. ');
        //COMMON.closeWindow($.location);
    } else {
    	//console.log(e);
    	showCurLoc = true;
    	Ti.App.Properties.setString('latitude', e.coords.latitude);
    	Ti.App.Properties.setString('longitude', e.coords.longitude);
    	render_map();
    	Ti.Geolocation.addEventListener('location', centerMap);
       //console.log(Ti.App.Properties.getString('latitude') + "=="+ Ti.App.Properties.getString('longitude'));
    }
    Ti.Geolocation.removeEventListener('location',saveCurLoc);
}; 

console.log(Ti.Geolocation.locationServicesEnabled+" Ti.Geolocation.locationServicesEnabled");

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
	 	xpress_data.push({longitude:"asdf",latitude:"asdf"});
	 	adsList.push({longitude:"asdf",latitude:"asdf"});
	 	console.log(xpress_data);
	 	xpress_data.forEach(function(entry) {
	 		var longitude1=parseFloat(entry.longitude);
	 		var latitude1=parseFloat(entry.latitude); 		
	 		if(isNaN(longitude1)||isNaN(latitude1)){
	 			entry.longitude="";
	 			entry.latitude="";
	 		}
	 	});
	 	adsList.forEach(function(entry) {
	 		var longitude1=parseFloat(entry.longitude);
	 		var latitude1=parseFloat(entry.latitude); 		
	 		if(isNaN(longitude1)||isNaN(latitude1)){
	 			entry.longitude="";
	 			entry.latitude="";
	 		}
	 	});	 	
	 	xpress_data.forEach(function(entry) {
	 		console.log(entry);
	 		console.log("end");
			var detBtn =Ti.UI.createButton({
			    backgroundImage: '/images/btn-forward.png',
			    color: "red",
			    height: 20,
				width: 20,
				a_id: entry.id
			});
			detBtn.addEventListener('click', function(ex){ 
				console.log(ex.source);
				console.log("xpress");
				console.log(ex.source.a_id);
				var win = Alloy.createController("ad", {a_id: ex.source.a_id}).getView(); 
				COMMON.openWindow(win,{animated:true}); 
				return true;
			});       
			var merchantLoc = Alloy.Globals.Map.createAnnotation({
			    latitude:entry.latitude,
			    longitude:entry.longitude,
			    a_id: entry.id,
			    title: entry.name,
			    image: '/images/sales-ad-loc_small.png',
			    animate : true, 
			    subtitle: entry.description,
			    pincolor: Alloy.Globals.Map.ANNOTATION_RED,
			    rightButton: detBtn,
			    myid: entry.store_name// Custom property to uniquely identify this annotation.
			});
			 
			//console.log(name[i] + " :"+latitude[i]+", "+ longitude[i]); 
			console.log("entry latitude"+entry.latitude);  
			if(entry.latitude != "" &&entry.longitude !=""){
				$.mapview.addAnnotation(merchantLoc); 
			}
//-----------------------------------------------------------------------------			
			adsList.forEach(function(entry1){
				var detBtn1 =Ti.UI.createButton({
				    backgroundImage: '/images/btn-forward.png',
				    color: "red",
				    height: 20,
					width: 20,
					a_id: entry1.a_id
				});	
				detBtn1.addEventListener('click', function(ex){ 
					console.log(ex.source);
					console.log("AdsList");
					console.log(ex.source.a_id);
					var win = Alloy.createController("ad", {a_id: ex.source.a_id}).getView(); 
					COMMON.openWindow(win,{animated:true}); 
					return true;
				});  											
				var merchantLoc1 = Alloy.Globals.Map.createAnnotation({
				    latitude:entry1.latitude,
				    longitude:entry1.longitude,
				    a_id: entry1.a_id,
				    title: entry1.merchant_name,
				    image: '/images/sales-ad-loc_small.png',
				    animate : true, 
				    subtitle: entry1.ads_name,
				    pincolor: Alloy.Globals.Map.ANNOTATION_RED,
				    rightButton: detBtn1,
				    myid: entry1.store_INFO// Custom property to uniquely identify this annotation.
				});	
				if(entry1.latitude != "" && entry1.longitude !=""){
					$.mapview.addAnnotation(merchantLoc1); 		
				}
			});			
		});	
		var lat = Ti.App.Properties.getString('latitude');
		var lot = Ti.App.Properties.getString('longitude');
		$.mapview.region =  {latitude: lat, longitude:lot,
		                    latitudeDelta:0.05, longitudeDelta:0.05};
	} 
}

$.mapview.addEventListener('click', function(evt) {
	
    console.log("Clicked " + evt.clicksource + " on " + evt.latitude + "," + evt.longitude);
    console.log(evt.a_id);
    if(evt.clicksource=="rightPane"){
		var win = Alloy.createController("ad", {a_id: evt.a_id}).getView(); 
	//	COMMON.openWindow(win,{animated:true});    	
    }     
});

$.location.addEventListener("close", function(){
	//Ti.Geolocation.removeEventListener('location',saveCurLoc);
    $.destroy();
});

 //console.log(name);
function closeWindow(){
	COMMON.closeWindow($.location); 

}

$.location.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.location); 
});
