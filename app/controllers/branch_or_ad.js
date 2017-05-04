var args = arguments[0] || {};
var m_id = args.m_id;
var loading = Alloy.createController("loading");
var current_tab = "branch";
var lat = 0, lon = 0;

function switchListing(e){
	var tab = parent({name: "tab"}, e.source);
	var text = children({name: "v", value:"label"}, $.firstTab);
	var secondtext = children({name: "v", value:"label"}, $.secondTab);
	
	if(tab == 2){
		current_tab = "branch";
		text.color = "#ffffff";
		$.firstTab.backgroundColor = "#484848";
		$.secondTab.backgroundColor = "transparent";
		secondtext.color = "#484848";
		$.point.hide();
		$.sales.show();
	}else if(tab == 1){
		current_tab = "ad";
		secondtext.color = "#ffffff";
		$.firstTab.backgroundColor = "transparent";
		$.secondTab.backgroundColor = "#484848";
		text.color = "#484848";
		$.point.show();
		$.sales.hide();
	}
}

function nav_ad_listing(e){
	//var ads_model = Alloy.createCollection('ads'); 
	//var data = ads_model.getDataBym_id(e.rowData.m_id);
	console.log(e.rowData.m_id);
	var win = Alloy.createController("branch_ad", {m_id: e.rowData.m_id, type: "branch"}).getView(); 
	COMMON.openWindow(win); 
}

function render_merchant(){
	var merchants = Alloy.createCollection('merchants');
	var data = merchants.getMerchantsById(m_id);
	var branch_data = [data];
	branch_data = _.union(branch_data, merchants.getBranchesByMerchant(data.u_id, true));
	if(OS_IOS){
		$.win.title = data.merchant_name;
	}else{
		$.title.text = data.merchant_name;
	}
	$.merchant_name.text = data.merchant_name;
	$.merchant_logo.image = data.img_path;
	$.numbers_branch.text = "Number of Branches: "+branch_data.length;
	render_branches(branch_data);
}

function render_branches(dat){
	var arr = [];
	console.log("data branches");
	console.log(dat);
	for (var i=0; i < dat.length; i++) {
	  var dist = countDistanceByKM(dat[i].latitude, dat[i].longitude, lat, lon);
	  var row = $.UI.create("TableViewRow", {classes:['horz', 'hsize'], m_id: dat[i].m_id});
	  var view_container = $.UI.create("View", {classes: ['hsize', 'horz', 'padding'], width: "auto"});
	  var view_left_coloumn = $.UI.create("View", {classes: ['vert', 'hsize'], width: "78%"});
	  var view_right_coloumn = $.UI.create("View", {classes: ['vert', 'hsize'], width: "22%"});
	  var label_branch_name = $.UI.create("Label", {classes: ['wfill', 'hsize', 'h5'], text: dat[i].merchant_name});
	  var label_location = $.UI.create("Label", {classes: ['wfill', 'hsize', 'h6'], text: dat[i].state_name+" "+dat[i].area});
	  var label_distance = $.UI.create("Label", {classes: ['wfill', 'hsize', 'h5'], text: dist}); 
	  
	  view_left_coloumn.add(label_branch_name);
	  view_left_coloumn.add(label_location);
	  view_right_coloumn.add(label_distance);
	  view_container.add(view_left_coloumn);
	  view_container.add(view_right_coloumn);
	  row.add(view_container);
	  arr.push(row);
	};
	$.branch_table.setData(arr);
}

function render_sales(){
	var win = Alloy.createController("_ad_listing", {m_id: args.m_id, type: "store"}).getView(); 
	$.sales.add(win);
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	render_sales();
	get_current_location();
	$.point.hide();
}

function get_current_location(){
	if (Ti.Geolocation.locationServicesEnabled) {
			Titanium.Geolocation.purpose = 'Get Current Location';
		    Ti.Geolocation.getCurrentPosition(function(e){
		    	if(e.success == 0){
		    		alert('Please enable location services in order to check store distance');
		    		//return;
		    	}else{
		    		lat = e.coords.latitude;
		    		lon = e.coords.longitude;
		    	}
		    	render_merchant();
		   });
	}else{
		alert('Please enable location services in order to check store distance');
		render_merchant();
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
    if (d>1) return Math.round(d)+"km";//+"km";
    else if (d<=1) return Math.round(d*1000)+"m";
    return d;
};
function closeWindow(){
	COMMON.closeWindow($.win); 
}
Ti.App.addEventListener("ads:close",closeWindow);
init();

$.branch_table.addEventListener("click", nav_ad_listing);

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
