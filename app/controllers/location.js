var args = arguments[0] || {};
var m_id = args.m_id;
var a_id = args.a_id; 
var showAll = args.showAll || true;
var showCurLoc = false;
var longitude = [];
var latitude  = [];
var name      = [];
var l_id      = [];
var mer_loc   = [];
var branch	= [];
//load model
var a_library = Alloy.createCollection('ads'); 
var m_library = Alloy.createCollection('merchants');

var ads = a_library.getAdsById(a_id);
console.log(typeof ads);
var id_sql = (typeof ads == "undefined")?m_id:ads.branch+", "+m_id;
console.log(id_sql);
var all_branches = m_library.getBranchesById(id_sql);
var merchants = m_library.getMerchantsById(m_id);

console.log(m_id+" mid here");

//load merchant & branches list 
function init(){
	var lat = Ti.App.Properties.getString('latitude');
    var lot = Ti.App.Properties.getString('longitude');
    console.log("init");
	if(all_branches.length > 0){
		for(var k=0; k < all_branches.length; k++){
			var dist = countDistanceByKM(all_branches[k].latitude, all_branches[k].longitude, lat, lot);
			var obj = {
				dist: dist,
				dist_text: (dist>1)? Math.round(dist)+"km":Math.round(dist*1000)+"m",
				m_id: all_branches[k].m_id,
				name: all_branches[k].merchant_name,
				longitude: all_branches[k].longitude,
				latitude: all_branches[k].latitude,
				address: all_branches[k].address,
				mobile: all_branches[k].mobile,
				mer_loc: all_branches[k].area + ", "+all_branches[k].state_name
			};
			branch.push(obj);
		}
		render_also_available(branch);
	}
}

function render_also_available(data){
	var dat = [];
	for (var i=0; i < data.length; i++) {
		dat.push({ 
			properties: {
        		m_id: data[i].m_id,	
        		title: data[i].name,
        		color: "#000000",
        		top: 5,
        		bottom: 5
        	}
       	});
	};
	var fishSection = Ti.UI.createListSection({ headerTitle: 'Also Available At:'});
	fishSection.setItems(dat);
	$.locationView.listing.appendSection(fishSection);
}

 //console.log(name);
$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.location); 
}); 

function setCustomTitle(title){
	console.log(title+" set custom title");
	var custom = $.UI.create("Label", { 
		text: title, 
		color: '#ED1C24', 
	    width: Ti.UI.SIZE 
	 });
		   
	if(Ti.Platform.osname == "android"){ 
		$.pageTitle.text = title;   
	}else{
		$.location.titleControl = custom; 
	} 
}

var saveCurLoc = function(e) {
	//console.log(e);
    if (e.error) {
        alert('Location service is disabled. '+e.error);
    } else {
    	//console.log(e);
    	showCurLoc = true;
    	Ti.App.Properties.setString('latitude', e.coords.latitude);
    	Ti.App.Properties.setString('longitude', e.coords.longitude);
    	init();
       //console.log(Ti.App.Properties.getString('latitude') + "=="+ Ti.App.Properties.getString('longitude'));
       render_map();
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
	console.log("render_map");
	for(var i=0; i < branch.length; i++){
		
		//if((l_id[i] == a_id)){
			var ad_arrow = $.UI.create("Button", {
			    backgroundImage: '/images/btn-forward.png',
			    height: 20,
				width: 20,
				m_id: branch[i].m_id
			});
			ad_arrow.addEventListener('click', function(ex){ 
				console.log(ex.source);
				console.log(ex.source.m_id);
				m_id = ex.source.m_id;
				setCurrentLocation();
			});
			
			var merchantLoc = Alloy.Globals.Map.createAnnotation({
			    latitude:branch[i].latitude,
			    longitude:branch[i].longitude,
			    title: branch[i].name,
			    subtitle: branch[i].mer_loc+" "+branch[i].dist_text,
			    rightView: ad_arrow,
			    image: '/images/sales-ad-loc_small.png',
			    myid:i // Custom property to uniquely identify this annotation.
			});
			            
			$.locationView.mapview.addAnnotation(merchantLoc); 
		//}
	}
	setCurrentLocation();
}

function switchLocation(e){
	if(typeof e.sectionIndex != "undefined"){
		var section = $.locationView.listing.sections[e.sectionIndex];
		// get the clicked item from that section
		var item = section.getItemAt(e.itemIndex);
		m_id = item.properties.m_id;
		console.log("item properties");
		console.log(item.properties);
	}else{
		m_id = e.source.m_id;
		console.log(e.source.m_id+" m_id swtich");
	}
	setCurrentLocation();
}

function setCurrentLocation(){
	console.log(branch);
	if(m_id != ""){
		var cur = _.where(branch, {m_id: m_id});
		cur = cur[0];
	}else{
		var after_sort = _.sortBy(branch, 'dist');
		var cur = after_sort[0];
	}
	console.log(m_id+" here m_id");
	console.log(cur);
	$.locationView.mapview.region = {latitude: cur.latitude, longitude: cur.longitude, latitudeDelta:0.01, longitudeDelta:0.01};
	setCustomTitle(cur.name);
	$.locationView.name.text = cur.name;
	$.locationView.address.text = cur.address;
	$.locationView.mobile.text = cur.mobile;
}


if(merchants.longitude == ""){
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
	$.locationView.mapview.region =  {latitude: merchants.latitude, longitude:merchants.longitude,
	                    latitudeDelta:0.01, longitudeDelta:0.01};
	merchantLoc.addEventListener('click', function(evt){
	       var win = Alloy.createController("ad", {m_id: m_id, a_id: a_id}).getView(); 
			COMMON.openWindow(win);
	});
	//console.log(name[i] + " :"+latitude[i]+", "+ longitude[i]);               
	$.locationView.mapview.addAnnotation(merchantLoc); 

}

$.locationView.button_direction.addEventListener("click", direction2here);

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
	    var longitude = e.coords.longitude;
	    var latitude = e.coords.latitude; 
	 	 console.log('http://maps.google.com/maps?saddr='+latitude+','+longitude+'&daddr='+details.latitude+','+details.longitude);
	    var add2 =details.add2;
		if(add2!= ""){
			add2 = add2  +"\r\n";
		} 
		var url = 'geo:'+latitude+','+longitude+"?q="+details.clinicName+" (" + details.add1 + "\r\n"+ add2 +  details.postcode +", " + details.city +"\r\n"+  details.state + ")";
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

				Titanium.Platform.openURL('Maps://http://maps.google.com/maps?ie=UTF8&t=h&z=16&saddr='+latitude+','+longitude+'&daddr='+details.latitude+','+details.longitude);
				
	   	 	}
				
				
	    
	   	Titanium.Geolocation.removeEventListener('location', locationCallback); 
	};
	
	console.log("geo location");
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

$.locationView.listing.addEventListener("itemclick", switchLocation);

$.location.addEventListener("close", function(){
    $.destroy();
});
	