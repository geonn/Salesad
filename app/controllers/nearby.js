var args = arguments[0] || {};
var categoryAds = Alloy.createCollection('categoryAds');
var ad_model = Alloy.createCollection("ads"); 
var adsList = ad_model.getData(true); 
var showCurLoc = false;
console.log("adsList1");
console.log(adsList);
if(args.id){
	var clinic = library.getPanelListById(args.id);
}
 
var saveCurLoc = function(e) {
	//console.log(e);
    if (e.error) {
       // alert('Location service is disabled. ');
    } else {
    	//console.log(e);
    	showCurLoc = true;
    	Ti.App.Properties.setString('latitude', e.coords.latitude);
    	Ti.App.Properties.setString('longitude', e.coords.longitude);
       //console.log(Ti.App.Properties.getString('latitude') + "=="+ Ti.App.Properties.getString('longitude'));
    }
}; 
 
if (Ti.Geolocation.locationServicesEnabled) {
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
    Ti.Geolocation.addEventListener('location', saveCurLoc);
} else {
    alert('Please enable location services');
} 

if(showCurLoc == true){
 	
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
		    //image: '/images/sales-ad-loc_small.png',
		    animate : true, 
		    subtitle: entry.ads_name,
		    pincolor: Map.ANNOTATION_RED,
		   // rightView: detBtn,
		    myid: entry.INFO// Custom property to uniquely identify this annotation.
		});
		 
		//console.log(name[i] + " :"+latitude[i]+", "+ longitude[i]); 
		console.log("entry latitude"+entry.latitude);  
		if(entry.latitude != ""){   
			console.log(entry.latitude+" added");
			$.locationView.mapview.addAnnotation(merchantLoc); 
		}
	});
	var lat = i.App.Properties.getString('latitude');
	var lot = Ti.App.Properties.getString('longitude');
	$.locationView.mapview.region =  {latitude: lat, longitude:lot,
	                    latitudeDelta:0.01, longitudeDelta:0.01};
} 

$.location.addEventListener("close", function(){
	Ti.Geolocation.removeEventListener('location',saveCurLoc);
    $.destroy();
});

 //console.log(name);
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.location); 
}); 