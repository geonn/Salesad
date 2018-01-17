var args = arguments[0] || {};

function init(){
	var merchantLoc = Alloy.Globals.Map.createAnnotation({
	    latitude: args.latitude,
	    longitude: args.longitude,
	    title: args.owner_name,
	    subtitle: args.address,
	    image: "/images/sales-ad-loc_small.png"
	});
	$.mapview.addAnnotation(merchantLoc);
	$.mapview.region = {latitude: args.latitude, longitude: args.longitude, latitudeDelta:0.01, longitudeDelta:0.01};
	$.name.text = args.owner_name;
	$.address.text = args.address;
	$.contact.text = args.contact;
}

init();
$.button_direction.addEventListener("click", direction2here);

function direction2here(){
	var longitude = args.longitude;
    var latitude = args.latitude;
	var url = 'geo:'+latitude+','+longitude+"?q="+args.owner_name+" (" + args.address+")";
	  if (Ti.Android){
			try {
			   	var waze_url = 'waze://?ll='+latitude+','+longitude+'&navigate=yes';
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

			Titanium.Platform.openURL('Maps://http://maps.google.com/maps?ie=UTF8&t=h&z=16&daddr='+latitude+','+longitude);
			
   	 	}
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

function closeWindow(){
	COMMON.closeWindow($.win); 
}

$.win.addEventListener("close", function(){
    $.destroy();
});
	
$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
