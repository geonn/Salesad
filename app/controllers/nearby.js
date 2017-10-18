var args = arguments[0] || {};
var showCurLoc = false;
var cell_width, category_id;
var u_id = Ti.App.Properties.getString('u_id') || "";
var start = 0;
var anchor = COMMON.todayDateTime();
var last_updated = COMMON.todayDateTime();
var keyword = "";

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
    }
    $.mapview.region =  {latitude: e.coords.latitude, longitude:e.coords.longitude, zoom: 12, latitudeDelta: 0.01, longitudeDelta: 0.01};
    Ti.Geolocation.removeEventListener('location',saveCurLoc);
};

if (Ti.Geolocation.locationServicesEnabled) {
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
    Ti.Geolocation.addEventListener('location', saveCurLoc);
} 

var skip = 1;
function centerMap(){
	console.log("centerMap");
	if(skip <= 0){
		skip++;
		return;
	}
	var lat = Ti.App.Properties.getString('latitude');
	var lot = Ti.App.Properties.getString('longitude');
	
	var bounds = getMapBounds($.mapview.region);
	
	API.callByPost({url: "searchNearbyAds", params: {nw_latitude: bounds.northWest.lat, nw_longitude: bounds.northWest.lng, se_latitude: bounds.southEast.lat, se_longitude: bounds.southEast.lng}, new:true}, {
		onload: function(responseText){
			var res = JSON.parse(responseText);
			var data = res.data;
			var annotations = [];
			console.log(data);
			render_map(data);
		}
	});
}

function getMapBounds(region) {
    var b = {};
    console.log("getMapBounds");
    b.northWest = {}; b.northEast = {};
    b.southWest = {}; b.southEast = {};

    b.northWest.lat = parseFloat(region.latitude) + 
        parseFloat(region.latitudeDelta) / 2.0;
    b.northWest.lng = parseFloat(region.longitude) - 
        parseFloat(region.longitudeDelta) / 2.0;

    b.southWest.lat = parseFloat(region.latitude) - 
        parseFloat(region.latitudeDelta) / 2.0;
    b.southWest.lng = parseFloat(region.longitude) - 
        parseFloat(region.longitudeDelta) / 2.0;

    b.northEast.lat = parseFloat(region.latitude) + 
        parseFloat(region.latitudeDelta) / 2.0;
    b.northEast.lng = parseFloat(region.longitude) + 
        parseFloat(region.longitudeDelta) / 2.0;

    b.southEast.lat = parseFloat(region.latitude) - 
        parseFloat(region.latitudeDelta) / 2.0;
    b.southEast.lng = parseFloat(region.longitude) + 
        parseFloat(region.longitudeDelta) / 2.0;

    return b;
}

function render_map(adsList){
	$.mapview.removeAllAnnotations();
	for (var i=0; i < adsList.length; i++) {
		var ad_arrow = $.UI.create("Button", {
		    backgroundImage: '/images/btn-forward.png',
		    height: 20,
			width: 20,
			record: adsList[i]
		});
		ad_arrow.addEventListener('click', function(ex){
			var record = ex.source.record;
			console.log(record);
			var win = Alloy.createController("ad", {a_id: record.a_id, name: record.name, m_id: record.m_id}).getView(); 
			COMMON.openWindow(win,{animated:true});		
		});
		var merchantLoc = Alloy.Globals.Map.createAnnotation({
		    latitude: adsList[i].latitude,
		    longitude: adsList[i].longitude,
		    title: adsList[i].name,
		    subtitle: adsList[i].merchant_name,
		    rightView: ad_arrow,
		    image: '/images/sales-ad-loc_small.png'
		});
		if(adsList[i].latitude!="" || adsList[i].longitude!=""){            
			$.mapview.addAnnotation(merchantLoc); 
		}	
	};
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

function closeWindow(){
	COMMON.closeWindow($.location); 

}
Ti.App.addEventListener("ads:close",closeWindow);
$.mapview.addEventListener("regionchanged", centerMap);

$.location.addEventListener("close", function(){
	//Ti.Geolocation.removeEventListener('location',saveCurLoc);
	Ti.App.removeEventListener("ads:close",closeWindow);
    $.destroy();
});

$.location.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.location); 
});
