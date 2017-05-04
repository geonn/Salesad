try{
var args = arguments[0] || {};
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];
var cell_width, category_id;
var model= Alloy.createCollection("category");
var category = model.getCategoryList();
var ads_data = [];
var ads=Alloy.createCollection("ads");
var merchant=Alloy.createCollection("merchants");
var adsdata=ads.getData(true);
var ads_counter = 0, counter = 0, count1=0 ,count2=0;
var empty;
var clickTime;
var pass=true;
var xpresscount;
var xpresscount1=0;
function navTo(e){
	var record = parent({name: "record"}, e.source);
	console.log(e.source.type);
	var type = (typeof e.source.type !="undefined")?e.source.type : 1;
	console.log(type);
	console.log("here is navTo");
	if(type == 3){
		COMMON.openWindow(Alloy.createController("ad", {a_id: record.a_id}).getView()); 
	}else{
		COMMON.openWindow(Alloy.createController("express_detail", record).getView()); 
	}
	record=null;
	type=null;
}

var start = 0;
var anchor = COMMON.todayDateTime();
var last_updated = COMMON.todayDateTime();
var keyword = "";

function getPreviousData(param){
	var model = Alloy.createCollection("xpress");
	xpresscount =model.getCount({anchor: anchor, last_updated: last_updated, start: start, offset:"" , latest: false, keyword: keyword, category_id: category_id});
	console.log(xpresscount);
	console.log("here is get previousdata");
	data = model.getData({anchor: anchor, last_updated: last_updated, start: start, offset:6 , latest: false, keyword: keyword, category_id: category_id});
	start = start + data.length;
	console.log(data.length+" "+start);
	model=null;
}

function doSearch(){
	start = 0;
	anchor = COMMON.todayDateTime();
	keyword = $.searchbar.value;
	getPreviousData({});
	render({clear: true});
}

function popMore(){
	var dialog = Ti.UI.createOptionDialog({
	  cancel: 3,
	  options: ['Categories','Add SalesXpress','My Posted SalesXpress','Cancel'],
	  title: 'More'
	});
		
	dialog.show(); 
	dialog.addEventListener("click", function(e){   
		if(e.index == 0){
			popCategory();
		}else if(e.index == 1){
			var win = Alloy.createController("express_add").getView(); 
			COMMON.openWindow(win); 
		}else if(e.index == 2){
			var win = Alloy.createController("express_personal").getView(); 
			COMMON.openWindow(win); 
		}
	});
	dialog=null;
}
	
function popCategory(){
	var options = _.pluck(category, "categoryName");
	options.push("All");
	options.push("Cancel");
	var dialog = Ti.UI.createOptionDialog({
	  cancel: options.length - 1,
	  options: options,
	  title: 'Categories'
	});
	dialog.show();
	dialog.addEventListener("click", function(e){
		if(e.index ==options.length -2){
			ads_counter = 0;
			pass=true;
			xpresscount1=0;			
			counter = 0;
			count1=0;
			count2=0;
			category_id = empty;
			start = 0;
			anchor = COMMON.todayDateTime();
			getPreviousData({keyword:$.searchbar.value});
			render({clear: true});			
		}		   
		else if(e.index != options.length - 1){
			category_id = category[e.index].id;
			start = 0;
			anchor = COMMON.todayDateTime();
			getPreviousData({keyword:$.searchbar.value});
			render({clear: true});
		}
	});
//	options=null;
//	dialog=null;
// null
}	
	
function refresh(){
	anchor = COMMON.todayDateTime();
	last_updated = COMMON.todayDateTime();
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("11");
	console.log(isUpdate.updated+" isUpdate");
	API.callByPost({
		url: "getSXItem",
		new: true,
		params: {last_updated: isUpdate.updated}
	}, 
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			console.log(arr);
			ads_counter = 0, counter = 0, start=0;
			var model = Alloy.createCollection("xpress");
			model.saveArray(arr);
			getPreviousData({});
			render({clear:true});
			res=null;
			arr=null;
			model=null;
		},
		onerror: function(err){
			_.isString(err.message) && alert(err.message);
		},
		onexception: function(){
			COMMON.closeWindow($.win);
		}
	});
	checker=null;
	isUpdate=null;
}	
function render(e){
	
	var pwidth = Titanium.Platform.displayCaps.platformWidth;	
	if(typeof e.clear != "undefined"){
		$.content.removeAllChildren();
		if(data.length <= 0){
			$.content.add($.UI.create("Label", {classes:['wfill','hsize','padding'], textAlign:"center", text: "No Result"}));
		}
	}
	if(OS_ANDROID){
		cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	}else{
		cell_width = Math.floor(pwidth / 2) - 15;
	}
	for (var i=0; i < data.length; i++) {
		//Small pay ads
		xpresscount1++;
		if(counter % 3 == 0 && counter > 0){
			try{
			var merchantdata=merchant.getMerchantsById(adsdata[count1].m_id);					
			merchantdata.img_path = (merchantdata.img_path == "")?"/images/SalesAd_Profile Pic.png":merchantdata.img_path;						
		    var container= $.UI.create("View", {classes:['hsize','vert'], backgroundColor: "#ED1C24", width: cell_width, left: 9, top:9});			
		    var img = $.UI.create("ImageView",{image:adsdata[count1].img_path,defaultImage:'/images/Icon_add_photo.png',width: Ti.UI.FILL,height: Ti.UI.SIZE,type: 3, record: adsdata[count1]});			
		    var title = (OS_IOS) ? $.UI.create("Label", {classes: ['h6', 'bold', 'wfill'],color:'#ffffff', height:14, left: 5, right: 5, bottom: 3, textAlign:"left", text: adsdata[count1].ads_name}) : $.UI.create("Label", {classes: ['h6', 'bold', 'wfill'],color:'#fff', height:14, left: 5, right: 5, bottom: 3, ellipsize: true, wordWrap:false, textAlign:"left", text: adsdata[count1].ads_name});
		    var subtitle = $.UI.create("Label", {classes: ['h7', 'wfill', 'hsize'], left: 5,color:'#ffffff', right: 5, bottom: 3, textAlign:"left",  text: convertToHumanFormat(adsdata[count1].sales_from)+" - "+convertToHumanFormat(adsdata[count1].sales_to)});
		    var hr = $.UI.create("View", {classes:['hr'], backgroundColor: '#E3E5E8'});
		    var view_bottom = $.UI.create("View", {classes:['wfill','hsize','small-padding'], backgroundColor: '#ED1C24'});
		    var view_bottom_right = $.UI.create("View", {classes:['wfill','hsize','vert'], left: 36, backgroundColor: '#ED1C24'});
		    var owner_img = $.UI.create("ImageView", {image:merchantdata.img_path, borderRadius: 15, height:30, width: 30, left:0});
		    var owner_name = (OS_IOS) ? $.UI.create("Label", {classes: ['h6', 'bold','wfill'],color:'#ffffff',  height:14, top:0, textAlign:"left", text: adsdata[count1].merchant_name}) : $.UI.create("Label", {classes: ['h6', 'bold','wfill'],color:'#ffffff',  height:14, top:0, ellipsize: true, wordWrap: false, textAlign:"left", text: adsdata[count1].merchant_name});
		 //   var label_category = (OS_IOS) ? $.UI.create("Label", {classes: ['h6','wfill'],color:'#ffffff', height:14, textAlign:"left"}) : $.UI.create("Label", {classes: ['h6','wfill'],color:'#ffffff', height:14,  ellipsize: true, wordWrap: false, textAlign:"left"});			
		    container.add(img);
		    container.add(title);
		    container.add(subtitle);
		    container.add(hr);
		    view_bottom_right.add(owner_name);
		//    view_bottom_right.add(label_category);
			img.addEventListener("click", navTo);
		    view_bottom.add(owner_img);
		    view_bottom.add(view_bottom_right);
		    container.add(view_bottom);
		    $.content.add(container);
		    obj_category=null;
		    container=null;
		    img=null;
		    title=null;
		    subtitle=null;
		    hr=null;
		    view_bottom=null;
		    view_bottom_right=null;
		    owner_img=null;
		    owner_name=null;
		    label_category=null;
		    latestC=null;		
			count1++;
			counter++;
			}
			catch(e){
				//do nothing 
			}
		}
//      big pay ad		
		if(counter % 4 == 0 && counter > 0){
			if(typeof ads_data[ads_counter] != "undefined"){
				console.log("COUNTER "+counter);
				var cw = (OS_ANDROID)?Math.floor(pixelToDp(pwidth)-10):pwidth-10;
				var img = $.UI.create("ImageView",{classes: ["padding"], right:0, bottom:0, image: ads_data[ads_counter].img_path, defaultImage:'/images/Icon_add_photo.png',type: 3, record: ads_data[ads_counter]});
				img.addEventListener("click", navTo);
				var v = $.UI.create("View", {width: cw, height: cw});
				v.add(img);
				$.content.add(v);
				ads_counter++;
				cw=null;
				img=null;
				v=null;
				count2++;
			}
		}
		Ti.API.warn("This is our Memory" +Ti.Platform.availableMemory);			
		var obj_category = _.where(category, {id: data[i].category});
	
		data[i].owner_img_path = (data[i].owner_img_path == "")?"/images/SalesAd_Profile Pic.png":data[i].owner_img_path;
//		data[i].img_path = "/images/Icon_add_photo.png";		
		_.extend(data[i], {categoryName: obj_category[0].categoryName});
		var container = $.UI.create("View", {classes:['hsize','vert'], backgroundColor: "#ffffff", width: cell_width, left: 9, top:9, type:1, record: data[i]});
		var img = $.UI.create("ImageView",{image: data[i].img_path, defaultImage:'/images/Icon_add_photo.png', classes:['hsize', 'wfill']});
		var title = (OS_IOS) ? $.UI.create("Label", {classes: ['h6', 'bold', 'wfill'], height:14, left: 5, right: 5, bottom: 3, textAlign:"left", text: data[i].description,}) : $.UI.create("Label", {classes: ['h6', 'bold', 'wfill'], height:14, left: 5, right: 5, bottom: 3, ellipsize: true, wordWrap:false, textAlign:"left", text: data[i].description,});
		var subtitle = $.UI.create("Label", {classes: ['h7', 'wfill', 'hsize'], left: 5, right: 5, bottom: 3, textAlign:"left",  text: convertToHumanFormat(data[i].sales_from)+" - "+convertToHumanFormat(data[i].sales_to)});
		var hr = $.UI.create("View", {classes:['hr'], backgroundColor: '#E3E5E8'});
		var view_bottom = $.UI.create("View", {classes:['wfill','hsize','small-padding']});

		var view_bottom_right = $.UI.create("View", {classes:['wfill','hsize','vert'], left: 36});
		var owner_img = $.UI.create("ImageView", {image: data[i].owner_img_path, defaultImage: "/images/SalesAd_Profile Pic.png", borderRadius: 15, height:30, width: 30, left:0});
		var owner_name = (OS_IOS) ? $.UI.create("Label", {classes: ['h6', 'bold','wfill'], height:14, top:0, textAlign:"left", text: data[i].owner_name}) : $.UI.create("Label", {classes: ['h6', 'bold','wfill'], height:14, top:0, ellipsize: true, wordWrap: false, textAlign:"left", text: data[i].owner_name});
		var label_category = (OS_IOS) ? $.UI.create("Label", {classes: ['h6','wfill'], height:14, textAlign:"left",  text: obj_category[0].categoryName}) : $.UI.create("Label", {classes: ['h6','wfill'], height:14,  ellipsize: true, wordWrap: false, textAlign:"left",  text: obj_category[0].categoryName});
		
		container.add(img);
		container.add(title);
		container.add(subtitle);
		container.add(hr);
		view_bottom_right.add(owner_name);
		view_bottom_right.add(label_category);
		view_bottom.add(owner_img);
		view_bottom.add(view_bottom_right);
		container.add(view_bottom);
		container.addEventListener("click", navTo);
		$.content.add(container);
		counter++;
		obj_category=null;
		container=null;
		img=null;
		title=null;
		subtitle=null;
		hr=null;
		view_bottom=null;
		view_bottom_right=null;
		owner_img=null;
		owner_name=null;
		label_category=null;
	};
	console.log("here is render");
	console.log(xpresscount);
	console.log(xpresscount1);
	if(xpresscount==xpresscount1){
		renderads();
	}
}

function renderads(){

console.log("here is renderads");
	if(pass){
		if(ads_data.length>count1){
			for(var i1=count2;i1<ads_data.length;i1++){			
				console.log("COUNTER "+counter);
				var cw = (OS_ANDROID)?Math.floor(pixelToDp(pwidth)-10):pwidth-10;
				var img = $.UI.create("ImageView",{classes: ["padding"], right:0, bottom:0, image: ads_data[i1].img_path, defaultImage:'/images/Icon_add_photo.png',type: 3, record: ads_data[i1]});
				img.addEventListener("click", navTo);
				var v = $.UI.create("View", {width: cw, height: cw});
				v.add(img);
				$.content.add(v);
				ads_counter++;
				cw=null;
				img=null;
				v=null;		
			}
		}
		if(adsdata.length > count1){
			for(var i1=count1;i1<adsdata.length;i1++){
				var merchantdata=merchant.getMerchantsById(adsdata[i1].m_id);
				merchantdata.img_path = (merchantdata.img_path == "")?"/images/SalesAd_Profile Pic.png":merchantdata.img_path;					
			    var container= $.UI.create("View", {classes:['hsize','vert'], backgroundColor: "#ED1C24", width: cell_width, left: 9, top:9});			
			    var img = $.UI.create("ImageView",{image:adsdata[i1].img_path,defaultImage:'/images/Icon_add_photo.png',width: Ti.UI.FILL,height: Ti.UI.SIZE,type: 3, record: adsdata[i1]});			
			    var title = (OS_IOS) ? $.UI.create("Label", {classes: ['h6', 'bold', 'wfill'],color:'#ffffff', height:14, left: 5, right: 5, bottom: 3, textAlign:"left", text: adsdata[i1].ads_name}) : $.UI.create("Label", {classes: ['h6', 'bold', 'wfill'],color:'#fff', height:14, left: 5, right: 5, bottom: 3, ellipsize: true, wordWrap:false, textAlign:"left", text: adsdata[i1].ads_name});
			    var subtitle = $.UI.create("Label", {classes: ['h7', 'wfill', 'hsize'], left: 5,color:'#ffffff', right: 5, bottom: 3, textAlign:"left",  text: convertToHumanFormat(adsdata[i1].sales_from)+" - "+convertToHumanFormat(adsdata[i1].sales_to)});
			    var hr = $.UI.create("View", {classes:['hr'], backgroundColor: '#E3E5E8'});
			    var view_bottom = $.UI.create("View", {classes:['wfill','hsize','small-padding'], backgroundColor: '#ED1C24'});
			    var view_bottom_right = $.UI.create("View", {classes:['wfill','hsize','vert'], left: 36, backgroundColor: '#ED1C24'});
			    var owner_img = $.UI.create("ImageView", {image:merchantdata.img_path, borderRadius: 15, height:30, width: 30, left:0});
			    var owner_name = (OS_IOS) ? $.UI.create("Label", {classes: ['h6', 'bold','wfill'],color:'#ffffff',  height:14, top:0, textAlign:"left", text: adsdata[i1].merchant_name}) : $.UI.create("Label", {classes: ['h6', 'bold','wfill'],color:'#ffffff',  height:14, top:0, ellipsize: true, wordWrap: false, textAlign:"left", text: adsdata[i1].merchant_name});
			  //  var label_category = (OS_IOS) ? $.UI.create("Label", {classes: ['h6','wfill'],color:'#ffffff', height:14, textAlign:"left"}) : $.UI.create("Label", {classes: ['h6','wfill'],color:'#ffffff', height:14,  ellipsize: true, wordWrap: false, textAlign:"left"});			
			    container.add(img);
			    container.add(title);
			    container.add(subtitle);
			    container.add(hr);
			    view_bottom_right.add(owner_name);
			//    view_bottom_right.add(label_category);
			    view_bottom.add(owner_img);
			    view_bottom.add(view_bottom_right);
			    container.add(view_bottom);
				img.addEventListener("click", navTo);				    
			    $.content.add(container);	
			    console.log(adsdata[i1].merchant_name0);
			    			    	    
			    obj_category=null;
			    container=null;
			    img=null;
			    title=null;
			    subtitle=null;
			    hr=null;
			    view_bottom=null;
			    view_bottom_right=null;
			    owner_img=null;
			    owner_name=null;
			    label_category=null;
			    latestC=null;		
			}	
			pass=false;	
		}
		pass=false;
	}	
}

function init(){
	$.activityIndicator.show();
	$.loadingBar.opacity = "1";
	$.loadingBar.height = "120";
	$.loadingBar.top = "100";		
	setTimeout(function(){
		$.activityIndicator.hide();
		$.loadingBar.opacity = "0";
		var ads_model = Alloy.createCollection("ads");
		ads_data = ads_model.getExpressData();
		refresh();
		ads_model=null;				
	},1000);
}

// convert pixel to dp.
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

init();

var load = false;
var lastDistance = 0;
var refreshing = false;
$.content_scrollview.addEventListener("scroll", function(e){
	var theEnd = $.content.rect.height;
	var total = (OS_ANDROID)?pixelToDp(e.y)+e.source.rect.height: e.y+e.source.rect.height;
	var distance = theEnd - total;
	var svtop = (OS_ANDROID)?1:-50;
	if (distance < lastDistance){
		var nearEnd = theEnd * 1;
		if (!load && (total >= nearEnd)){
			load = true;
			getPreviousData({});
			render({});
			load = false;
		}
		nearEnd=null;
	}
	lastDistance = distance;
	
	if (e.y <= svtop && !refreshing) {
		$.content.removeAllChildren();	
		$.content_scrollview.scrollingEnabled=false;	
		$.activityIndicator.show();
		$.loadingBar.opacity = "1";
		$.loadingBar.height = "120";
		$.loadingBar.top = "100";			
        setTimeout(function(){
        	$.content_scrollview.scrollingEnabled=true;
			$.activityIndicator.hide();
			$.loadingBar.opacity = "0";
			ads_counter = 0;
			pass=true;
			xpresscount1=0;			
			counter = 0;
			count1=0;
			count2=0;
			refreshing = true;
			refresh();					        	
        	refreshing = false;
        }, 1000);   
    }
	theEnd=null;
	total=null;
	distance=null;
});

Ti.App.addEventListener("home:refresh", refresh);

$.btnBack.addEventListener('click', function(){ 
 	load=null;
 	adsdata=null;
 	lastDistance=null;
 	refreshing=null;
	args = null;
	loading = null;
	random_color = null;
    cell_width=null;
    category_id=null;
	model = null;
    category =null;
	ads_data =null;
    ads_counter = null;
    counter = null; 
 	Ti.App.removeEventListener('home:refresh', refresh);		
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener('android:back', function (e) {
 	load=null;
 	adsdata=null;
 	lastDistance=null;
 	refreshing=null;
	args = null;
	random_color = null;
    cell_width=null;
    category_id=null;
	model = null;
    category =null;
	ads_data =null;
    ads_counter = null;
    counter = null;  	
 	Ti.App.removeEventListener('home:refresh', refresh);
 	COMMON.closeWindow($.win); 		
});
function windowClose(){
 	load=null;
 	lastDistance=null;
 	refreshing=null;
	args = null;
	random_color = null;
    cell_width=null;
    category_id=null;
	model = null;
    category =null;
	ads_data =null;
    ads_counter = null;
    counter = null;  	
	COMMON.closeWindow($.win);
}
Ti.App.addEventListener("ads:close",windowClose);
}
catch(e){
	//do nothing avoid error message popup
}
