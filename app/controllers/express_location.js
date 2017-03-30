var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var loading = Alloy.createController("loading");
var current_lat,current_lot;
var search_data = [];
var merchantLoc;
var saveCurLoc = function(e) {
	console.log("saveCurLoc");
    if (e.error) {
        alert('Location service is disabled. ');
        COMMON.closeWindow($.win);
    } else {
    	//console.log(e);
    	showCurLoc = true;
    	Ti.App.Properties.setString('latitude', e.coords.latitude);
    	Ti.App.Properties.setString('longitude', e.coords.longitude);
    	merchantLoc = Alloy.Globals.Map.createAnnotation({
		    latitude: e.coords.latitude,
		    longitude: e.coords.longitude, 
		    title: "Event Location",
		    draggable: true,
		    image: '/images/Icon_LocationMarker.png',
		   // pincolor: Alloy.Globals.Map.ANNOTATION_RED,
		   // rightView: detBtn,
		});
		$.mapview.addAnnotation(merchantLoc); 
    	Ti.Geolocation.addEventListener('location', centerMap);
       //console.log(Ti.App.Properties.getString('latitude') + "=="+ Ti.App.Properties.getString('longitude'));
    }
    Ti.Geolocation.removeEventListener('location',saveCurLoc);
};

if (Ti.Geolocation.locationServicesEnabled) {
	console.log('2');
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
    console.log('1');
    Ti.Geolocation.addEventListener('location', saveCurLoc);
} else {
    alert('Please enable location services');
}

function centerMap(e){
	var lat = Ti.App.Properties.getString('latitude');
	var lot = Ti.App.Properties.getString('longitude');
	if(typeof e.row != "undefined"){
		console.log(e.row);
		lat = e.row.record.latitude;
		lot = e.row.record.longitude;
		tbl.setData([]);
		$.win.remove(tbl);
	}else{
		Ti.Geolocation.removeEventListener('location', centerMap);
	}
	merchantLoc.latitude = lat;
	merchantLoc.longitude = lot;
	
	$.mapview.region =  {latitude: lat, longitude:lot, latitudeDelta:0.005, longitudeDelta:0.005};
	current_lat = lat;
	current_lot = lot;
} 

function init(){
	$.win.add(loading.getView());
}
var tbl = $.UI.create("TableView", {classes:['wfill','hfill','conthsize','contwfill'], zIndex: 100});
function render_search_list(){
	if(search_data.length <= 0){
		alert("no result found");
		return;
	}
	console.log(search_data.length);
	for (var i=0; i < search_data.length; i++) {
		var row = $.UI.create("TableViewRow", {classes:['vert'], backgroundColor:"#FFFFFF", record: search_data[i]});
		var view = $.UI.create("View", {classes:['vert','wfill','hsize','padding']});
		var label = $.UI.create("Label", {classes:['wfill','hsize','h5'], text: search_data[i].name});
		var sublabel = $.UI.create("Label", {classes:['wfill','hsize','h6'], text: search_data[i].address});
	    view.add(label);
	    view.add(sublabel);
	    row.add(view);
	    tbl.appendRow(row);
	    
	};
	tbl.addEventListener("click", centerMap);
	$.win.add(tbl);
}

function pinchangedragstate(e){
	console.log(e.annotation.latitude);
	lat = e.annotation.latitude;
	lot = e.annotation.longitude;
}

function doSearch(e){
	API.callByPost({
		url: "getPlaceByCoordinate",
		new: true,
		params: {lat: current_lat, long: current_lot, query: e.value}
	},
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			search_data = res.data;
			render_search_list();
			loading.finish();
		},
		onerror: function(err){
			
		}
	});
}

function doSave(){
	Ti.App.fireEvent("set_location", {location: current_lat+","+current_lot});
	closeWindow();
}


function closeWindow(){
	COMMON.closeWindow($.win);
}

// convert pixel to dp.
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

$.mapview.addEventListener("pinchangedragstate", pinchangedragstate);

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
