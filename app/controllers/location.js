var args = arguments[0] || {};
var m_id = args.m_id;
var a_id = args.a_id; 

var showCurLoc = false;
var longitude = [];
var latitude  = [];
var name      = [];
var l_id      = [];
var mer_loc   = [];
//load model
var a_library = Alloy.createCollection('ads'); 
var m_library = Alloy.createCollection('merchants'); 
var b_library = Alloy.createCollection('branches'); 

var all_branches = b_library.getBranchesByMerchant(m_id);

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "merchants",
	action: "view",
	label: "merchant location",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Merchant Location"
});
//load merchant & branches list
for(var k=0; k < all_branches.length; k++){
	if(all_branches[k].b_id != ""){
		var branch = b_library.getBranchById(all_branches[k].b_id);
		l_id[k]      = all_branches[k].b_id; 
		name[k]      = branch.name;
		longitude[k] = branch.longitude;
		latitude[k]  = branch.latitude;
		/*** Display branch info ***/
		mer_loc[k] = branch.state;
		if(branch.area != ""){
			mer_loc[k] = branch.area + ", "+branch.state;
		}
		
	}
}
 //console.log(name);
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.location); 
}); 

/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: "LOCATION", 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
   
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.location.titleControl = custom; 
} 
function report(evt) {
    Ti.API.info("Annotation " + evt.title + " clicked, id: " + evt.annotation.myid);
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
    
    Ti.Geolocation.addEventListener('location',saveCurLoc );
} else {
    alert('Please enable location services');
}
		
// API calls to the map module need to use the Alloy.Globals.Map reference
if(showCurLoc == true){
	 var currenLocation = Alloy.Globals.Map.createAnnotation({
	    latitude:Ti.App.Properties.getString('latitude'),
	    longitude:Ti.App.Properties.getString('longitude'),
	    title:"Current Location",
	    subtitle:"",
	    pincolor:Alloy.Globals.Map.ANNOTATION_GREEN,
	    myid:99 // Custom property to uniquely identify this annotation.
	}); 
	currenLocation.addEventListener('click', function(evt){
       var win = Alloy.createController("ad", {m_id: m_id, a_id: a_id}).getView(); 
		COMMON.openWindow(win);   
	});

	$.locationView.mapview.addAnnotation(currenLocation);    
}
 

if(a_id != ""){
	for(var i=0; i < name.length; i++){
		if((l_id[i] == a_id)){
			var merchantLoc = Alloy.Globals.Map.createAnnotation({
			    latitude:latitude[i],
			    longitude:longitude[i],
			    title: name[i],
			    subtitle:mer_loc[i],
			    pincolor:Alloy.Globals.Map.ANNOTATION_RED,
			    myid:i // Custom property to uniquely identify this annotation.
			});
			$.locationView.mapview.region = {latitude: latitude[i], longitude:longitude[i],
			                    latitudeDelta:0.01, longitudeDelta:0.01};
			merchantLoc.addEventListener('click', function(evt){
			       var win = Alloy.createController("ad", {m_id: m_id, a_id: a_id}).getView(); 
					COMMON.openWindow(win);   
			    
			});
			//console.log(name[i] + " :"+latitude[i]+", "+ longitude[i]);               
			$.locationView.mapview.addAnnotation(merchantLoc); 
		}
	}
	
}else{
	for(var i=0; i < name.length; i++){ 
		var merchantLoc = Alloy.Globals.Map.createAnnotation({
		    latitude:latitude[i],
		    longitude:longitude[i],
		    title: name[i],
		    subtitle:mer_loc[i],
		    pincolor:Alloy.Globals.Map.ANNOTATION_RED,
		    myid:i // Custom property to uniquely identify this annotation.
		});
		$.locationView.mapview.region = {latitude: latitude[i], longitude:longitude[i],
		                    latitudeDelta:2, longitudeDelta:2};
		merchantLoc.addEventListener('click', function(evt){
			       var win = Alloy.createController("ad", {m_id: m_id, a_id: a_id}).getView(); 
					COMMON.openWindow(win);   
			    
			});
	          
		$.locationView.mapview.addAnnotation(merchantLoc); 
	}
}
$.locationView.mapview.addEventListener('click',report);
$.location.addEventListener("close", function(){
	Ti.Geolocation.removeEventListener('location',saveCurLoc);
    $.destroy();
});
	