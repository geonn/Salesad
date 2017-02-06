var args = arguments[0] || {};
var categoryAds = Alloy.createCollection('categoryAds');
var ad_model = Alloy.createCollection("ads"); 
var adsList = ad_model.getData(true); 
var showCurLoc = false;

if(args.id){
	var clinic = library.getPanelListById(args.id);
}
 
var saveCurLoc = function(e) {
	console.log("saveCurLoc");
    if (e.error) {
        alert('Location service is disabled. ');
        COMMON.closeWindow($.location);
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
} else {
    alert('Please enable location services');
} 

function centerMap(e){
	var lat = Ti.App.Properties.getString('latitude');
	var lot = Ti.App.Properties.getString('longitude');
	$.locationView.mapview.region =  {latitude: lat, longitude:lot, latitudeDelta:0.005, longitudeDelta:0.005};
	Ti.Geolocation.removeEventListener('location', centerMap);
}

function render_map(){
	if(showCurLoc == true){
	 	console.log(adsList);
	 	adsList.forEach(function(entry) {
	 		console.log(entry);
			var detBtn =Ti.UI.createButton({
			    backgroundImage: '/images/btn-forward.png',
			    color: "red",
			    height: 20,
				width: 20,
				a_id: entry.a_id
			});
			detBtn.addEventListener('click', function(ex){ 
				console.log(ex.source);
				console.log(ex.source.a_id);
				var win = Alloy.createController("ad", {a_id: ex.source.a_id}).getView(); 
				COMMON.openWindow(win,{animated:true}); 
				return false;
			});       
			var merchantLoc = Alloy.Globals.Map.createAnnotation({
			    latitude:entry.latitude,
			    longitude:entry.longitude,
			    a_id: entry.a_id,
			    title: entry.merchant_name,
			    image: '/images/sales-ad-loc_small.png',
			    animate : true, 
			    subtitle: entry.ads_name,
			   // pincolor: Alloy.Globals.Map.ANNOTATION_RED,
			    rightView: detBtn,
			    myid: entry.INFO// Custom property to uniquely identify this annotation.
			});
			 
			//console.log(name[i] + " :"+latitude[i]+", "+ longitude[i]); 
			console.log("entry latitude"+entry.latitude);  
			if(entry.latitude != ""){
				$.locationView.mapview.addAnnotation(merchantLoc); 
			}
		});
		var lat = Ti.App.Properties.getString('latitude');
		var lot = Ti.App.Properties.getString('longitude');
		$.locationView.mapview.region =  {latitude: lat, longitude:lot,
		                    latitudeDelta:0.05, longitudeDelta:0.05};
	} 
}

$.locationView.mapview.addEventListener('click', function(evt) {
    console.log("Clicked " + evt.clicksource + " on " + evt.latitude + "," + evt.longitude);
});

$.location.addEventListener("close", function(){
	//Ti.Geolocation.removeEventListener('location',saveCurLoc);
    $.destroy();
});

 //console.log(name);
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.location); 
}); 