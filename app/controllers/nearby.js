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

var skip = 0;
function centerMap(){
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
			for (var i=0; i < data.length; i++) {
				var found = _.where(annotations, {id: data[i].id});
				console.log(typeof found+" typeof found");
				console.log(found.length);
				if(found.length <= 0){
					annotations.push({id: data[i].id, latitude: data[i].latitude, longitude: data[i].longitude, icon: "images/icons/pin_"+data[i].store_type+".png", title: data[i].name, subtitle: data[i].address, img_path: data[i].img_path, rating: data[i].rating, voucher: data[i].voucher});
				}
			};
		render_map(annotations);
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
	if(showCurLoc == true){	
	 	var ML=[];
		
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
