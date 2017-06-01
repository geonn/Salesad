var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];
var c_model= Alloy.createCollection("category");
var category = c_model.getCategoryList();
var ads_data = [];
var ads=Alloy.createCollection("ads");
var merchant=Alloy.createCollection("merchants");
var ads_counter = 0, counter = 0, count1=0;
var adsdata=[];
var empty;
var cell_width;
var category_id=empty;
var clickTime;
var xpresscount;
var xpresscount1=0;
var adsdata2=[];
function navTo(e){
	var record = parent({name: "record"}, e.source);
	console.log(e.source.type);
	var type = (typeof e.source.type !="undefined")?e.source.type : 1;
	console.log(type);
	console.log("here is navTo");
	if(type == 3){
		COMMON.openWindow(Alloy.createController("ad", {a_id: record.a_id,from:"home_all"}).getView()); 
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
	data = model.getData({anchor: anchor, last_updated: last_updated, start: start, offset:6 , latest: false, keyword: keyword, category_id: category_id});
	start = start + data.length;
	console.log(data.length+" "+start);
	model=null;
}

function doSearch(){
	ads_data=[];
	start = 0;
	xpresscount1=0;
	count1=0;
	ads_counter=0;	
	anchor = COMMON.todayDateTime();
	keyword = $.searchbar.value;
	filteradsname(keyword);
	getPreviousData({});
	render({clear: true});
}

function filteradsname(key){
	
	var adsdata1=adsdata2;
	adsdata=[];
	var ii = 0;
	for(var i = 0; i<adsdata1.length;i++){
		var k=adsdata1[i].ads_name.toLowerCase();
		var k1=key.toLowerCase();
		console.log(k.indexOf(k1));
		if(k.indexOf(k1) > -1){
			console.log("success");
			adsdata[ii]=adsdata1[i];
			ii++;
		}
	}
}

function popMore(){
	var dialog = Ti.UI.createOptionDialog({
	  cancel: 3,
	  options: ['Add SalesXpress','My Posted SalesXpress','Cancel'],
	  title: 'More'
	});
		
	dialog.show(); 
	dialog.addEventListener("click", function(e){   
		if(e.index == 0){
			var win = Alloy.createController("express_add").getView(); 
			COMMON.openWindow(win); 
		}else if(e.index == 1){
			var win = Alloy.createController("express_personal").getView(); 
			COMMON.openWindow(win); 
		}
	});
	dialog=null;
}
function showAll(e){
	keyword="";
	$.categoryButton.setTitle("Category");
	ads_counter = 0;
	xpresscount1=0;
	counter = 0;
	count1=0;		
	category_id = empty;
	start = 0;
	getAdsData();	
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
		$.loadingBar.height = "0";
		$.loadingBar.top = "0";			
		refresh();					        	
    }, 1000); 			
}	
function popCategory(e){
	console.log("popCategory");
	var options = _.pluck(category, "categoryName");
	options.push("Cancel");
	var dialog = Ti.UI.createOptionDialog({
	  cancel: options.length - 1,
	  options: options,
	  title: 'Categories'
	});
	dialog.show();
	dialog.addEventListener("click", function(e){   
		if(e.index != options.length - 1){
			$.categoryButton.setTitle(category[e.index].categoryName);				
			adsdata=[];
			ads_data=[];
			category_id = category[e.index].id;
			console.log("category name:"+category[e.index].categoryName+" id:"+category[e.index].id);
			start = 0;
			xpresscount1=0;
			count1=0;
			ads_counter=0;
			anchor = COMMON.todayDateTime();
			getPreviousData({keyword:$.searchbar.value});
			getAdsByCategory(category_id);
			render({clear: true});
		}
	});
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
	if(data != null && adsdata !=null){
		var pwidth = Titanium.Platform.displayCaps.platformWidth;	
		if(typeof e.clear != "undefined"){
			$.content.removeAllChildren();
			if(data.length <= 0 && adsdata.length <=0){
				$.content.add($.UI.create("Label", {classes:['wfill','hsize','padding'], textAlign:"center", text: "No Result"}));
			}
		}
		if(OS_ANDROID){	
			cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
		}else{
			cell_width = Math.floor(pwidth / 2) - 15;
		}
		console.log("Count1:"+count1);
		if(data != null){
			
			for (var i=0; i < data.length; i++) {
				//Small pay ads
				xpresscount1++;
				if(counter % 3 == 0 && counter > 0){
					
					if(typeof adsdata[count1] != "undefined" && adsdata[count1].sales_from != null){
						console.log(adsdata[count1].sales_from);
						var merchantdata=merchant.getMerchantsById(adsdata[count1].m_id);					
						merchantdata.img_path = (merchantdata.img_path == "")?"/images/SalesAd_Profile Pic.png":merchantdata.img_path;	
						sales_from= (adsdata[count1].sales_from != "0000-00-00")?convertToHumanFormat(adsdata[count1].sales_from).toString():"Start from now !";
						sales_to = (adsdata[count1].sales_to != "0000-00-00")?convertToHumanFormat(adsdata[count1].sales_to).toString():""; 
						var minus=(adsdata[count1].sales_from !="Start from now !")?"-":"";
						var arr={
							m_img_path:merchantdata.img_path,
							title:adsdata[count1].ads_name,
							img_path:adsdata[count1].img_path,
							record:adsdata[count1],
							sales_from:sales_from,
							sales_to:sales_to,
							merchant_name:adsdata[count1].merchant_name,
							bg_color:"#4d4d4d",
							fg_color:"#fff",
							hr_color:"#fff",
							category:adsdata[count1].categoryName,
							type:3,
							minus:minus			
						};	
						var params={
							a_id:adsdata[count1].a_id,
							type:1,
							from:"home_all",
							u_id:u_id
						};
						API.callByPost({url:"addAdsClick",new:true,params:params},{
						onload:function(res){
							var re=JSON.parse(res);
							console.log("Impression home:"+JSON.stringify(re));
						},onerror:function(err){
							console.log("Impression home:error");
						}});
						console.log("arr:"+arr.sales_from+" "+arr.sales_to);							
						renderSmall(arr);
						count1++;
						counter++;
						merchnatdata=null;
						merchantdata.img_path=null;
						arr=null;	
						sales_from = null;
						sales_to = null;			
					}
				}
		//      big pay ad		
				if(counter % 4 == 0 && counter > 0){
					if(typeof ads_data[ads_counter] != "undefined"){
						var cw = (OS_ANDROID)?Math.floor(pixelToDp(pwidth)-10):pwidth-10;
						var img = (ads_data[ads_counter].img_path != "")? ads_data[ads_counter].img_path:'/images/image_loader_640x640.png';
						var Aarr={
							cw:cw,
							record:ads_data[ads_counter],
							img_path:img,
							type:3
						};
						var params={
							a_id:ads_data[ads_counter].a_id,
							type:1,
							from:"home_all",
							u_id:u_id
						};
						API.callByPost({url:"addAdsClick",new:true,params:params},{
						onload:function(res){
							var re=JSON.parse(res);
							console.log("Impression home:"+JSON.stringify(re));
						},onerror:function(err){
							console.log("Impression home:error");
						}});
						
						renderBig(Aarr);
						ads_counter++;
						cw=null;
						img=null;
						v=null;
					}
				}		
				console.log(category);
				console.log(data[i]);
				var obj_category = _.where(category, {id: data[i].category});
				data[i].sales_from=convertToHumanFormat(data[i].sales_from).toString();	
				data[i].sales_to=convertToHumanFormat(data[i].sales_to).toString();		
				data[i].owner_img_path = (data[i].owner_img_path == "")?"/images/SalesAd_Profile Pic.png":data[i].owner_img_path;	
				_.extend(data[i], {categoryName: obj_category[0].categoryName});
				//data[i].sales_from = (data[i].sales_from != "0000-00-00")?convertToHumanFormat(data[i].sales_from).toString():"Start from now !";
				//data[i].sales_to = (data[i].sales_to != "0000-00-00")?convertToHumanFormat(data[i].sales_to).toString():"";  		
				var Xarr={
					bg_color:"#ffffff",
					fg_color:"#000000",
					hr_color:"#4d4d4d",
					m_img_path:data[i].owner_img_path,
					img_path:data[i].img_path,
					category:obj_category[0].categoryName,
					title: data[i].description,
					merchant_name:data[i].owner_name,
					sales_from:data[i].sales_from,
					sales_to:data[i].sales_to,
					record: data[i],
					type:null,
					minus:"-"
				};
				renderSmall(Xarr);
				counter++;
				Xarr=null;
				obj_category=null;
			};	
			console.log("xpresscount:"+xpresscount+" "+xpresscount1+" count1:"+count1);
			if(xpresscount==xpresscount1){
				console.log("you are the god hahaha");
				if(ads_counter< ads_data.length){
					for(var i=ads_counter; i < ads_data.length; i++){
						if(typeof ads_data[i] != "undefined"){
							var cw = (OS_ANDROID)?Math.floor(pixelToDp(pwidth)-10):pwidth-10;
							var img = (ads_data[i].img_path == "")? ads_data[i].img_path:'/images/image_loader_640x640.png';
							var Aarr={
								cw:cw,
								record:ads_data[i],
								img_path:img,
								type:3
							};
							var params={
								a_id:ads_data[i].a_id,
								type:1,
								from:"home_all",
								u_id:u_id
							};
							API.callByPost({url:"addAdsClick",new:true,params:params},{
							onload:function(res){
								var re=JSON.parse(res);
								console.log("Impression home:"+JSON.stringify(re));
							},onerror:function(err){
								console.log("Impression home:error");
							}});
							
							renderBig(Aarr);
							ads_counter++;
							cw=null;
							img=null;
							v=null;
						}				
					}
				}
				if(count1 < adsdata.length){
					for(var i=count1; i < adsdata.length; i++){
						if(typeof adsdata[i] != "undefined"){
							var merchantdata=merchant.getMerchantsById(adsdata[i].m_id);					
							merchantdata.img_path = (merchantdata.img_path == "")?"/images/SalesAd_Profile Pic.png":merchantdata.img_path;	
							sales_from= (adsdata[count1].sales_from != "0000-00-00")?convertToHumanFormat(adsdata[count1].sales_from).toString():"Start from now !";
							sales_to = (adsdata[count1].sales_to != "0000-00-00")?convertToHumanFormat(adsdata[count1].sales_to).toString():""; 
							var minus=(adsdata[i].sales_from !="Start from now !")?"-":"";				
							var arr={
								m_img_path:merchantdata.img_path,
								title:adsdata[i].ads_name,
								img_path:adsdata[i].img_path,
								record:adsdata[i],
								sales_from:sales_from,
								sales_to:sales_to,
								merchant_name:adsdata[i].merchant_name,
								bg_color:"#4d4d4d",
								fg_color:"#fff",
								hr_color:"#fff",
								category:adsdata[i].categoryName,
								type:3,
								minus:minus	
							};	
							var params={
								a_id:adsdata[i].a_id,
								type:1,
								from:"home_all",
								u_id:u_id
							};
							API.callByPost({url:"addAdsClick",new:true,params:params},{
							onload:function(res){
								var re=JSON.parse(res);
								console.log("Impression home:"+JSON.stringify(re));
							},onerror:function(err){
								console.log("Impression home:error");
							}});					
							console.log("arr:"+arr);							
							renderSmall(arr);
							count1++;
							counter++;
							merchnatdata=null;
							merchantdata.img_path=null;
							arr=null;						
						}
					}
				}
			}
		}
	}
}


function renderBig(param){
	var img = $.UI.create("ImageView",{classes: ["padding"], right:0, bottom:0, image: param.img_path,type: param.type, record:param.record});
	img.addEventListener("click", navTo);
	var v = $.UI.create("View", {width: param.cw, height: param.cw});
	v.add(img);
	$.content.add(v);	
	img=null;
	v=null;
}


function renderSmall(param){				
    var container= $.UI.create("View", {classes:['hsize','vert'], backgroundColor: param.bg_color, width: cell_width, left: 9, top:9});			
    var img = $.UI.create("ImageView",{image:param.img_path,defaultImage:'/images/image_loader_640x640.png',width: Ti.UI.FILL,height: Ti.UI.SIZE,type: param.type, record: param.record});			
    var title = (OS_IOS) ? $.UI.create("Label", {classes: ['h6', 'bold', 'wfill'],color:param.fg_color, height:14, top: 3, left: 5, right: 5, bottom: 3, textAlign:"left", text: param.title}) : $.UI.create("Label", {classes: ['h6', 'bold', 'wfill'],color:param.fg_color, height:14, left: 5, right: 5, bottom: 3, ellipsize: true, wordWrap:false, textAlign:"left", text: param.title});
    var subtitle = $.UI.create("Label", {classes: ['h7', 'wfill', 'hsize'], left: 5,color:param.fg_color, right: 5, bottom: 3, textAlign:"left",  text: param.sales_from+" "+param.minus+" "+param.sales_to});
    var hr = $.UI.create("View", {classes:['hr'], backgroundColor: param.hr_color});
    var view_bottom = $.UI.create("View", {classes:['wfill','hsize','small-padding'], backgroundColor: param.bg_color});
    var view_bottom_right = $.UI.create("View", {classes:['wfill','hsize','vert'], left: 36, backgroundColor: param.bg_color});
    var owner_img = $.UI.create("ImageView", {image:param.m_img_path, borderRadius: 15, height:30, width: 30, left:0});
    var owner_name = (OS_IOS) ? $.UI.create("Label", {classes: ['h6', 'bold','wfill'],color:param.fg_color, height:14, top:0, textAlign:"left", text: param.merchant_name}) : $.UI.create("Label", {classes: ['h6', 'bold','wfill'],color:param.fg_color,  height:14, top:0, ellipsize: true, wordWrap: false, textAlign:"left", text: param.merchant_name});
    var label_category = (OS_IOS) ? $.UI.create("Label", {classes: ['h6','wfill'],color:param.fg_color, height:14, textAlign:"left", text: param.category}) : $.UI.create("Label", {classes: ['h6','wfill'],color:param.fg_color, height:14,  ellipsize: true, wordWrap: false, textAlign:"left", text:param.category});			
    container.add(img);
    container.add(title);
    container.add(subtitle);
    container.add(hr);
    view_bottom_right.add(owner_name);
    view_bottom_right.add(label_category);
    view_bottom.add(owner_img);
    view_bottom.add(view_bottom_right);
    container.add(view_bottom);
	img.addEventListener("click", navTo);				    
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
}

function init(){
	$.activityIndicator.show();
	$.loadingBar.opacity = "1";
	$.loadingBar.height = "120";
	$.loadingBar.top = "100";		
	setTimeout(function(){
		$.activityIndicator.hide();
		$.loadingBar.opacity = "0";
		$.loadingBar.height = "0";
		$.loadingBar.top = "0";			
		ads_data = ads.getExpressData();
		refresh();
		getAdsData();		
		ads_model=null;				
	},1000);
}
function getAdsByCategory(c_id){
	var adsdata1;
	var adscount= 0;	
	adsdata2=[];	
	var c_ads_library = Alloy.createCollection("categoryAds");
	var c=c_model.getCategoryById(c_id);	
	adsdata1 = c_ads_library.getLatestAdsByCategory(c_id,0,100);
	console.log("c_id:"+c_id);
	console.log("Latest ads:"+JSON.stringify(adsdata1));
	adsdata1.forEach(function(param){
		adsdata[adscount]={
			m_id:param.m_id,
			merchant_name:param.merchant_name,
			ads_name:param.ads_name,
			sales_from:param.sales_from,
			sales_to:param.sales_to,
			img_path:param.img_path,
			a_id:param.a_id,
			categoryName:c.categoryName,
			c_id:c_id	
		};	
		adsdata2[adscount]=adsdata[adscount];		
		adscount++;
	});
}
function getAdsData(){
	var adsdata1;
	var adscount= 0;
	adsdata2=[];
	var c_ads_library = Alloy.createCollection('categoryAds');
	var b_ramdom = [];
	var ramdom = [];
	var ramdom_n;
	if(category != null){
		for(var i = 0;i < category.length;i++){
			b_ramdom.push(i);
		}
	}
	ramdom=	shuffle(b_ramdom) ;
	console.log("zzz:"+JSON.stringify(ramdom)+" "+ramdom[1]);
	if(category != null){ 	
		for(var i=0;i<category.length;i++){
			do{
				ramdom_n = ramdom[i];
				console.log("cc"+ramdom_n);
				adsdata1=c_ads_library.getLatestAdsByCategory(category[ramdom_n].id,0,100);
				if(adsdata1.length == 0){
					++i;
				}		
			}while(adsdata1.length == 0);
			adsdata1.forEach(function(param){
				console.log("ineach:"+i);
				var catename=category[ramdom_n].categoryName;
				console.log("ramdom_n"+ramdom_n);
				console.log("category id"+category[ramdom_n].id+" "+category_id);		
				adsdata[adscount]={
					m_id:param.m_id,
					merchant_name:param.merchant_name,
					ads_name:param.ads_name,
					sales_from:param.sales_from,
					sales_to:param.sales_to,
					img_path:param.img_path,
					a_id:param.a_id,
					categoryName:catename,
					c_id:category[ramdom_n].id	
				};
				adsdata2[adscount]=adsdata[adscount];
				adscount++;				
			});		
		}
	}
}
function shuffle(array) {
  var tmp, current, top = array.length;
  if(top) while(--top) {
    current = Math.floor(Math.random() * (top + 1));
    tmp = array[current];
    array[current] = array[top];
    array[top] = tmp;
  }
  return array;
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
	var svtop = -50;
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
	if(OS_IOS){
		if (e.y <= svtop && !refreshing) {
			$.content.removeAllChildren();	
			$.content_scrollview.scrollingEnabled=false;	
			$.activityIndicator.show();
			$.loadingBar.opacity = "1";
			$.loadingBar.height = "120";
			$.loadingBar.top = "100";	
			ads_counter = 0;
			xpresscount1=0;
			counter = 0;
			count1=0;				
	        setTimeout(function(){
	        	$.content_scrollview.scrollingEnabled=true;
				$.activityIndicator.hide();
				$.loadingBar.opacity = "0";
				$.loadingBar.height = "0";
				$.loadingBar.top = "0";			
				refreshing = true;
				if(category_id != empty){
					console.log("category_id"+category_id);
			 		getAdsByCategory(category_id);		
				}
				else{
					console.log("ALL");
					getAdsData();
				}				
				refresh();					        	
	        	refreshing = false;
	        }, 1000);   
	    }
		theEnd=null;
		total=null;
		distance=null;
	}	
});

if (OS_ANDROID) {
	$.swipeRefresh.addEventListener('refreshing', function(e) {
	ads_counter = 0;
	xpresscount1=0;
	counter = 0;
	count1=0;	
	console.log(category_id);
	if(typeof category_id != "undefined"){
		console.log("category_id"+category_id);
 		getAdsByCategory(category_id);		
	}
	else{
		console.log("ALL");
		getAdsData();
	}
	refresh();
	e.source.setRefreshing(false);		
});
};

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
    ads_counter = null;
    counter = null;  	
	COMMON.closeWindow($.win);
}
Ti.App.addEventListener("ads:close",windowClose);

