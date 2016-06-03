var args = arguments[0] || {};
var categoryAds = Alloy.createCollection('categoryAds');
var adsList = categoryAds.getAdsList(); 
var showCurLoc = false;

if(args.id){
	var clinic = library.getPanelListById(args.id);
}
 
if (Ti.Geolocation.locationServicesEnabled) {
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
    //Ti.Geolocation.addEventListener('location', setCurLoc);
    Ti.Geolocation.getCurrentPosition(init);
} else {
    alert('Please enable location services');
} 

function init(e){ 
	var longitude = e.coords.longitude;
    var latitude = e.coords.latitude;
    var altitude = e.coords.altitude;
    var heading = e.coords.heading;
    var accuracy = e.coords.accuracy;
    var speed = e.coords.speed;
    var timestamp = e.coords.timestamp;
    var altitudeAccuracy = e.coords.altitudeAccuracy;
    
	var Map = require('ti.map');
	var mapview = Map.createView({
        mapType: Map.NORMAL_TYPE,
        region: {latitude: latitude, longitude: longitude, latitudeDelta:0.01, longitudeDelta:0.01},
        animate:true,
        regionFit:true,
        userLocation:true
    });
    
	adsList.forEach(function(entry) {
		var detBtn =Ti.UI.createButton({
		    backgroundImage: '/images/btn-forward.png',
		    color: "red",
		    height: 20,
			width: 20,
			m_id: entry.m_id
		});
		detBtn.addEventListener('click', function(ex){ 
			var win = Alloy.createController("ad", {m_id: e.source.m_id}).getView(); 
			COMMON.openWindow(win,{animated:true}); 
			return false;
		});       
		var merchantLoc = Map.createAnnotation({
		    latitude:entry.latitude,
		    longitude:entry.longitude, 
		    title: entry.merchant,
		    image: '/images/sales-ad-loc_small.png',
		    animate : true, 
		    subtitle: entry.ads_name,
		    pincolor: Map.ANNOTATION_RED,
		   // rightView: detBtn,
		    myid: entry.INFO// Custom property to uniquely identify this annotation.
		});
		 
		//console.log(name[i] + " :"+latitude[i]+", "+ longitude[i]);               
		mapview.addAnnotation(merchantLoc); 
	});
	
	//mapview.addAnnotation(mountainView);
	$.locationView.mapview.add(mapview);
	// Handle click events on any annotations on this map.
	mapview.addEventListener('click', function(evt) {
		 
	    //Ti.API.info("Annotation " + evt.title + " clicked, id: " + evt.annotation.myid);
	});

}

function setCurLoc(e){
    var region = {
        latitude: e.coords.latitude, longitude: e.coords.longitude,
        latitudeDelta:0.01, longitudeDelta:0.01
    };
    mapview.setLocation(region);
} 

 //console.log(name);
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.location); 
}); 