var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var cate_model = Alloy.createCollection("category");
var category = cate_model.getCategoryList();
var u_id = Ti.App.Properties.getString('u_id') || undefined;
var xpressCount=0;
var offcount = 0;
var adsArr = [];
var category_id;
var checking = true;
var indexAds = 0;
var ads_count = 0;
var	ads_model =Alloy.createCollection("ads");
var ads_data = ads_model.getExpressData();
var counter = 0;
var finalChecking = true;
var adsArrC = true;
var pwidth = Titanium.Platform.displayCaps.platformWidth;	
if(OS_ANDROID){	
	cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
}else{
	cell_width = Math.floor(pwidth / 2) - 15;
}
function navTo(e){
	var record = parent({name: "record"}, e.source);
	var type = (typeof e.source.type !="undefined")?e.source.type : 1;
	if(type == 3){
		COMMON.openWindow(Alloy.createController("ad", {a_id:record.a_id,from:"home_all",name:record.merchant_name,date:datedescription(record.sales_from,record.sales_to)}).getView()); 
	}else{
		COMMON.openWindow(Alloy.createController("express_detail", record).getView()); 
	}
	record=null;
	type=null;
}
var cw = (OS_ANDROID)?Math.floor(pixelToDp(pwidth)-10):pwidth-10;
function init(){
	offcount = 0;
	indexAds = 0;
	ads_count = 0;	
	counter = 0;
	checking = true;	
	finalChecking = true;
	$.content.removeAllChildren();
	$.content.opacity = 0;	
	$.noAvailable.opacity = 0;	
	$.myInstance.show('',false)	
	setTimeout(function(){
		getAdsData();
	},1000);
}
init();
function getAdsData(){
	var model = Alloy.createCollection('categoryAds');
	adsArr = model.getLatestAds(0,100,category_id,keyword);
	$.noAvailable.opacity = (adsArr.length != 0&&category_id != undefined)?1:0;
	getExpressDataByServer();	
}
function popMore(){
	var dialog = Ti.UI.createOptionDialog({
	  cancel: 3,
	  options: ['Add SalesXpress','My Posted SalesXpress','Cancel'],
	  title: 'More'
	});
	dialog.show(); 
	dialog.addEventListener("click", function(e){
		if(u_id == undefined){
			COMMON.openWindow(Alloy.createController("signin_signout").getView());
			return;
		}else {
			if(e.index == 0){
				; 
				COMMON.openWindow(Alloy.createController("express_add").getView());
			}else if(e.index == 1){
				COMMON.openWindow(Alloy.createController("express_personal").getView()); 
			}
		}
	});
}
function scrollChecker(e){
	var theEnd = $.content.rect.height;
	var total = (OS_ANDROID)?pixelToDp(e.y)+e.source.rect.height: e.y+e.source.rect.height;
	var nearEnd = theEnd - 200;
	if(total >= nearEnd && checking){
		getExpressData();
	}	
	if(total >= nearEnd && !checking && finalChecking && category_id == undefined){
		finalChecking = false;
		renderBigAds();
	}
}
//final function
function renderBigAds(){
	for(var i=ads_count;i<ads_data.length;i++){
		var img = (ads_data[i].img_path != "")? ads_data[i].img_path:'/images/image_loader_640x640.png';
		var Aarr={cw:cw,record:ads_data[i],img_path:img,type:3};
		// var params={
		// 	a_id:ads_data[ads_count].a_id,
		// 	type:1,
		// 	from:"home_all",
		// 	u_id:u_id
		// };
		// API.callByPost({url:"addAdsClick",new:true,params:params},{
		// onload:function(res){
		// 	var re=JSON.parse(res);
		// },onerror:function(err){
		// }});		
		renderBig(Aarr,ads_data[i]);	
	}
	renderSmallAds();
}
function showAll(){
	category_id = undefined;
	keyword = "";
	$.categoryButton.setTitle("CATEGORY");
	init();
}
function renderSmallAds(){
	for(var i = indexAds; i<adsArr.length;i++){
		var sales_from= (adsArr[i].sales_from != "0000-00-00")?convertToHumanFormat(adsArr[i].sales_from).toString():"Start from now !";
		var sales_to = (adsArr[i].sales_to != "0000-00-00")?convertToHumanFormat(adsArr[i].sales_to).toString():""; 
		var minus=(adsArr[i].sales_from !="Start from now !")?"-":"";								
		_.extend(adsArr[i],{type:3,sales_from:sales_from,sales_to:sales_to,bg_color:"#4d4d4d",fg_color:"#fff",hr_color:"#fff",minus:minus});
		// var params={a_id:adsdata[count1].a_id,type:1,from:"home_all",u_id:u_id};
		// API.callByPost({url:"addAdsClick",new:true,params:params},{
		// onload:function(res){},onerror:function(err){}});					
		renderSmall(adsArr[i],adsArr[i]);			
	}
}
var keyword = "";
function getExpressData(){
	var model = Alloy.createCollection("xpress");

	var data = model.getData({anchor: COMMON.todayDateTime(), start: offcount , latest: false, keyword: keyword, category_id: category_id});
	console.log("data"+JSON.stringify(data));
	checking = (data.length != 0)?true:false;
	$.noAvailable.opacity = (data.length == 0&&category_id != undefined)?1:0;
	render(data);
}
function renderSmall(param,record){
    var container= $.UI.create("View", {classes:['hsize','vert'], backgroundColor: param.bg_color, width: cell_width, left: 9, top:9});			
    var img = $.UI.create("ImageView",{image:param.img_thumb,defaultImage:'/images/image_loader_640x640.png',width: Ti.UI.FILL,height: cell_width,type: param.type, record:record});			
    var title = (OS_IOS) ? $.UI.create("Label", {classes: ['h6', 'bold', 'wfill'],color:param.fg_color, height:14, top: 3, left: 5, right: 5, bottom: 3, textAlign:"left", text: param.title}) : $.UI.create("Label", {classes: ['h6', 'bold', 'wfill'],color:param.fg_color, height:14, left: 5, right: 5, bottom: 3, ellipsize: true, wordWrap:false, textAlign:"left", text: param.title});
    var subtitle = $.UI.create("Label", {classes: ['h7', 'wfill', 'hsize'], left: 5,color:param.fg_color, right: 5, bottom: 3, textAlign:"left",  text: param.sales_from+" "+param.minus+" "+param.sales_to});
    var hr = $.UI.create("View", {classes:['hr'], backgroundColor: "#E3E5E8"});
    var view_bottom = $.UI.create("View", {classes:['wfill','hsize','small-padding'], backgroundColor: param.bg_color});
    var view_bottom_right = $.UI.create("View", {classes:['wfill','hsize','vert'], left: 36, backgroundColor: param.bg_color});
    var owner_img = $.UI.create("ImageView", {image:param.m_img_path, defaultImage:'/images/SalesAd_Profile Pic.png', borderRadius: 15, height:30, width: 30, left:0});
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
function renderBig(param){
	var img = $.UI.create("ImageView",{classes: ["padding"], right:0, bottom:0, image: param.img_path,type: param.type, record:param.record});
	img.addEventListener("click", navTo);
	var v = $.UI.create("View", {width: param.cw, height: param.cw});
	v.add(img);
	$.content.add(v);	
	img=null;
	v=null;
}
function render(xpressArr){
	if(adsArrC){
		if(keyword != "" || category_id != undefined){
			adsArr.forEach(function(entry1){
				if(entry1 != undefined && entry1.sales_from !=(undefined||null||"")){
					var sales_from= (entry1.sales_from != "0000-00-00")?convertToHumanFormat(entry1.sales_from).toString():"Start from now !";
					var sales_to = (entry1.sales_to != "0000-00-00")?convertToHumanFormat(entry1.sales_to).toString():""; 
					var minus=(entry1.sales_from !="Start from now !")?"-":"";								
					_.extend(entry1,{type:3,sales_from:sales_from,sales_to:sales_to,bg_color:"#4d4d4d",fg_color:"#fff",hr_color:"#fff",minus:minus});
					// var params={a_id:adsdata[count1].a_id,type:1,from:"home_all",u_id:u_id};
					// API.callByPost({url:"addAdsClick",new:true,params:params},{
					// onload:function(res){},onerror:function(err){}});
					counter++;					
					renderSmall(entry1,entry1);	
					indexAds++;			
					console.log("asdf");
				}
			});
		}
		adsArrC = false;	
	}
	xpressArr.forEach(function(entry,index){
		//small ads
		if(counter % 3 == 0 && counter > 0 && category_id == undefined&&keyword == ""){
			if(adsArr != undefined && adsArr[indexAds].sales_from !=(undefined||null||"")){
				var sales_from= (adsArr[indexAds].sales_from != "0000-00-00")?convertToHumanFormat(adsArr[indexAds].sales_from).toString():"Start from now !";
				var sales_to = (adsArr[indexAds].sales_to != "0000-00-00")?convertToHumanFormat(adsArr[indexAds].sales_to).toString():""; 
				var minus=(adsArr[indexAds].sales_from !="Start from now !")?"-":"";								
				_.extend(adsArr[indexAds],{type:3,sales_from:sales_from,sales_to:sales_to,bg_color:"#4d4d4d",fg_color:"#fff",hr_color:"#fff",minus:minus});
				// var params={a_id:adsdata[count1].a_id,type:1,from:"home_all",u_id:u_id};
				// API.callByPost({url:"addAdsClick",new:true,params:params},{
				// onload:function(res){},onerror:function(err){}});
				counter++;					
				renderSmall(adsArr[indexAds],adsArr[indexAds]);	
				indexAds++;			
			}
		}
		// big ads
		if(counter % 4 == 0 && counter > 0 && category_id == undefined && keyword == ""){
			if(ads_data[ads_count] != undefined){
				var img = (ads_data[ads_count].img_path != "")? ads_data[ads_count].img_path:'/images/image_loader_640x640.png';
				var Aarr={cw:cw,record:ads_data[ads_count],img_path:img,type:3};
				// var params={
				// 	a_id:ads_data[ads_count].a_id,
				// 	type:1,
				// 	from:"home_all",
				// 	u_id:u_id
				// };
				// API.callByPost({url:"addAdsClick",new:true,params:params},{
				// onload:function(res){
				// 	var re=JSON.parse(res);
				// },onerror:function(err){
				// }});		
				renderBig(Aarr);
				ads_count++;
			}
		}
	
		entry.sales_from=convertToHumanFormat(entry.sales_from).toString();	
		entry.sales_to=convertToHumanFormat(entry.sales_to).toString();		
		entry.owner_img_path = (entry.owner_img_path == "")?"/images/SalesAd_Profile Pic.png":entry.owner_img_path;	
		var Xarr={
			bg_color:"#ffffff",
			fg_color:"#000000",
			hr_color:"#4d4d4d",
			m_img_path:entry.owner_img_path,
			img_path:entry.img_path,
			category:entry.categoryName,
			title: entry.description,
			merchant_name:entry.owner_name,
			sales_from:entry.sales_from,
			sales_to:entry.sales_to,
			img_thumb:entry.img_thumb,
			record: entry,
			type:null,
			minus:"-"
		};		
		counter++;	
		renderSmall(Xarr,entry);		
	});
	firstRun();
	offcount +=8;
	keyword = "";
	$.content.opacity = 1;		
	$.myInstance.hide();	
}
function firstRun(){
	if(category_id == undefined&& $.content.children.length<3){
		finalChecking = false;
		renderBigAds();		
	}
}
function getExpressDataByServer(){
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("11");
	API.callByPost({
		url: "getSXItem",
		new: true,
		params: {last_updated: isUpdate.updated}
	}, 
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			var model = Alloy.createCollection("xpress");
			model.saveArray(arr);
			getExpressData();
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
	checker = undefined;
	isUpdate = undefined;
}
function windowClose(){
	COMMON.closeWindow($.win);
}
function doSearch(e){
	finalChecking = false;	
	keyword = e.source.value || "";
	e.source.value = ""; 
	$.myInstance.hide();		
	init();
}
function popCategory(e){
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
			category_id = category[e.index].id;
			keyword = "";
			adsArrC = true;
			init();
		}
	});
}	
if (OS_ANDROID) {
	$.swipeRefresh.addEventListener('refreshing', function(e) {
		init();
		e.source.setRefreshing(false);		
	});
}
if(OS_IOS){
	var control = Ti.UI.createRefreshControl({
    	tintColor:"#00CB85"
	});
	$.content_scrollview.refreshControl = control;
	control.addEventListener('refreshstart',function(e){
	    Ti.API.info('refreshstart');
	    setTimeout(function(e){
	        Ti.API.debug('Timeout');
	        $.content_scrollview.scrollTo(0,0,true);	
			setTimeout(function(){
				init();
			},500);	        
	        control.endRefreshing();
	    }, 1000);
	});	
}
$.btnBack.addEventListener('click', function(){ 
 	Ti.App.removeEventListener('home:refresh', showAll);	
	$.destroy();	
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener('android:back', function (e) {	
 	Ti.App.removeEventListener('home:refresh', showAll);
 	COMMON.closeWindow($.win); 		
});
Ti.App.addEventListener("ads:close",windowClose);
Ti.App.addEventListener("home:refresh",showAll);
