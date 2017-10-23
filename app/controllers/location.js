var args = arguments[0] || {};
var branches = args.branches || [];
var showCurLoc = false;
var longitude = [];
var latitude  = [];
var name      = [];
var branch	= [];
//load merchant & branches list 
function init(){
	console.log("init");
	m_id = (typeof args.target_m_id != "undefined")?args.target_m_id:0;
	//render_marker();
	var lat = Ti.App.Properties.getString('latitude');
    var lot = Ti.App.Properties.getString('longitude');
	if(branches.length > 0){
		for(var k=0; k < branches.length; k++){
			var dist = countDistanceByKM(branches[k].latitude, branches[k].longitude, lat, lot);
			var dist = 10;
			var obj = {
				dist: dist,
				dist_text: (dist>1)? Math.round(dist)+"km":Math.round(dist*1000)+"m",
				m_id: branches[k].m_id,
				name: branches[k].name,
				longitude: branches[k].longitude,
				latitude: branches[k].latitude,
				address: branches[k].address,
				mobile: branches[k].mobile
			};
			if(branches[k].longitude!="" || branches[k].latitude!=""){
				branch.push(obj);			
			}
		}
		render_also_available(branch);
	}
	if(branch <= 0){
		alert("No location found");
	}else{
		setCurrentLocation();
	}
	
}

function render_also_available(data){
	console.log("render_also_available");
	var dat = [];
	for (var i=0; i < data.length; i++) {
		dat.push({ 
			properties: {
        		m_id: data[i].m_id,	
        		title: data[i].name,
        		color: "#000000",
        		top:5,
        		bottom: 5
        	}
       	});
	};
	var fishSection = Ti.UI.createListSection({ headerTitle: 'Also Available At:'});
	fishSection.setItems(dat);
	$.listing.appendSection(fishSection);
}

function closeWindow(){
	COMMON.closeWindow($.location); 
}
 
function setCustomTitle(title){
	var custom = $.UI.create("Label", { 
		text: title, 
		color: '#ED1C24', 
	    width: Ti.UI.SIZE 
	 });
		   
	if(Ti.Platform.osname == "android"){ 
		$.pageTitle.text = title;   
	}else{
		$.location.title = title; 
	} 
}

var saveCurLoc = function(e) {
	console.log("saveCurLoc");
    if (e.error) {
    	
    } else {
    	showCurLoc = true;	
    	init();
      	render_map();
      	Ti.App.Properties.setString('latitude', e.coords.latitude);
    	Ti.App.Properties.setString('longitude', e.coords.longitude);
       	Ti.Geolocation.removeEventListener('location',saveCurLoc );
    }
};

if (Ti.Geolocation.locationServicesEnabled) {
    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_HIGH;
    Ti.Geolocation.addEventListener('location',saveCurLoc );
} else {
    alert('Please enable location services');
}
		
// API calls to the map module need to use the Alloy.Globals.Map reference
function render_map(){
	for(var i=0; i < branch.length; i++){
		//if((l_id[i] == a_id)){
			var ad_arrow = $.UI.create("Button", {
			    backgroundImage: '/images/btn-forward.png',
			    height: 20,
				width: 20,
				m_id: branch[i].m_id
			});
			ad_arrow.addEventListener('click', function(ex){
				m_id = ex.source.m_id;
				setCurrentLocation();
			});
			var merchantLoc = Alloy.Globals.Map.createAnnotation({
			    latitude:branch[i].latitude,
			    longitude:branch[i].longitude,
			    title: branch[i].name,
			    subtitle: branch[i].address+" "+branch[i].dist_text,
			    rightView: ad_arrow,
			    image: '/images/sales-ad-loc_small.png',
			    myid:i // Custom property to uniquely identify this annotation.
			});
			if(branch[i].latitude!="" && branch[i].longitude!=""){            
				$.mapview.addAnnotation(merchantLoc); 
			}	
		//}
	}
	setCurrentLocation();
}

function switchLocation(e){
	if(typeof e.sectionIndex != "undefined"){
		var section = $.listing.sections[e.sectionIndex];
		// get the clicked item from that section
		var item = section.getItemAt(e.itemIndex);
		m_id = item.properties.m_id;
	}else{
		m_id = e.source.m_id;
	}
	setCurrentLocation();
}

function setCurrentLocation(){
	if(m_id != ""){
		var cur = _.where(branch, {m_id: m_id});
		cur = cur[0];
	}else{
		var after_sort = _.sortBy(branch, 'dist');
		var cur = after_sort[0];
	}
	$.mapview.region = {latitude: cur.latitude, longitude: cur.longitude, latitudeDelta:0.01, longitudeDelta:0.01};
	setCustomTitle(cur.name);
	$.name.text = cur.name;
	$.address.text = cur.address;
	$.mobile.text = cur.mobile;
}

function render_marker(){
	if(merchants.longitude == "" || merchants.latitude == ""){
		alert("No location found");
		COMMON.closeWindow($.location);
	}else{
		var merchantLoc = Alloy.Globals.Map.createAnnotation({
		    latitude:merchants.latitude,
		    longitude:merchants.longitude,
		    title: merchants.merchant_name,
		    subtitle:merchants.mobile,
		    image: "/images/sales-ad-loc_small.png",
		    pincolor:Alloy.Globals.Map.ANNOTATION_RED,
		    myid:merchants.m_id // Custom property to uniquely identify this annotation.
		});
		$.mapview.region =  {latitude: merchants.latitude, longitude:merchants.longitude,
		                    latitudeDelta:0.01, longitudeDelta:0.01};
		merchantLoc.addEventListener('click', function(evt){
		       var win = Alloy.createController("ad", {target_m_id: m_id, a_id: a_id}).getView(); 
				COMMON.openWindow(win);
		});
		$.mapview.addAnnotation(merchantLoc); 
	}
}

$.button_direction.addEventListener("click", direction2here);

function direction2here(){
	 
	if(m_id != ""){
		var cur = _.where(branch, {m_id: m_id});
		details = cur[0];
	}else{
		var after_sort = _.sortBy(branch, 'dist');
		var details = after_sort[0];
	} 
	 
	var locationCallback = function(e) {
	    if(!e.success || e.error) {
	    	alert("Please enable location services");
	        Ti.API.info('error:' + JSON.stringify(e.error));
	        return;
	    } 
	    var longitudee = e.coords.longitude;
	    var latitudee = e.coords.latitude;
	    var add2 =details.add2;
		if(add2!= ""){
			add2 = add2  +"\r\n";
		} 
		var url = 'geo:'+latitudee+','+longitudee+"?q="+details.clinicName+" (" + details.add1 + "\r\n"+ add2 +  details.postcode +", " + details.city +"\r\n"+  details.state + ")";
		  if (Ti.Android){
				try {
				   	var waze_url = 'waze://?ll='+details.latitude+','+details.longitude+'&navigate=yes';
				   	var intent = Ti.Android.createIntent({
						action: Ti.Android.ACTION_VIEW,
						data: waze_url
					});
					Ti.Android.currentActivity.startActivity(intent); 
				} catch (ex) { 
				  	try {
						Ti.API.info('Trying to Launch via Intent');
						var intent = Ti.Android.createIntent({
							action: Ti.Android.ACTION_VIEW,
							data: url
						});
						Ti.Android.currentActivity.startActivity(intent);
					} catch (e){
						Ti.API.info('Caught Error launching intent: '+e);
						exports.Install();
					}
				} 
			}else{

				Titanium.Platform.openURL('Maps://http://maps.google.com/maps?ie=UTF8&t=h&z=16&saddr='+latitudee+','+longitudee+'&daddr='+details.latitude+','+details.longitude);
				
	   	 	}
				
				
	    
	   	Titanium.Geolocation.removeEventListener('location', locationCallback); 
	};
	Titanium.Geolocation.addEventListener('location', locationCallback); 
}

var countDistanceByKM = function(lat1,lon1,lat2,lon2) {
    var R = 6371; // km (change this constant to get miles)
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    
    return d;
};

$.listing.addEventListener("itemclick", switchLocation);

$.location.addEventListener("close", function(){
    $.destroy();
});
	
$.location.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.location); 
});
