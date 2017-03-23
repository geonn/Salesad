var mainView = null;
var time_offset = 0;

exports.construct = function(mv){
	mainView = mv;
};
exports.deconstruct = function(){  
	mainView = null;
};

function openWindow(win){
	if(Ti.Platform.osname == "android"){
	  	win.open(); //{fullscreen:false, navBarHidden: false}
	  	Alloy.Globals.naviPath.push(win);
	}else{ 
		var nav = Alloy.Globals.navMenu;
		nav.openWindow(win,{animated:true});  
	} 
}


//function closeWindow(win){
exports.closeWindow = function(win){
	if(Ti.Platform.osname == "android"){ 
		console.log('a');
	  	win.close(); 
	  	console.log('b');
	}else{ 
		var nav = Alloy.Globals.navMenu;
		nav.closeWindow(win,{animated:true});  
	} 
};

function removeAllChildren (viewObject){
    //copy array of child object references because view's "children" property is live collection of child object references
    var children = viewObject.children.slice(0);
 
    for (var i = 0; i < children.length; ++i) {
        viewObject.remove(children[i]);
    }
};

function createAlert (tt,msg, callback, yes){
	console.log('a');
	var y = (typeof yes != "undefined")?yes:"ok";
	var box = Titanium.UI.createAlertDialog({
		title: tt,
		ok: y,
		cancel: 1,
		buttonNames: ['Ok','Cancel'],
		message: msg
	});
	console.log('b');
	box.show();
	_.isFunction(callback) && box.addEventListener('click', function(e){
		console.log(e.index+" "+e.source.cancel);
		if(e.index === e.source.cancel){
			
		}else{
			callback();
		}
	});
};

exports.openWindow = _.throttle(openWindow, 500, true);
//exports.closeWindow = _.debounce(closeWindow, 0, true);
exports.removeAllChildren = _.debounce(removeAllChildren, 0, true);
exports.createAlert = _.throttle(createAlert, 500, true);

exports.hideLoading = function(){
	mainView.activityIndicator.hide();
	mainView.loadingBar.opacity = "0";
	mainView.loadingBar.height = "0";
	mainView.loadingBar.top = "0"; 
};

exports.showLoading = function(){ 
	mainView.activityIndicator.show();
	mainView.loadingBar.opacity = 1;
	mainView.loadingBar.zIndex = 100;
	mainView.loadingBar.height = 120;
	 
	if(Ti.Platform.osname == "android"){
		mainView.loadingBar.top =  (DPUnitsToPixels(Ti.Platform.displayCaps.platformHeight) / 2) -50; 
		mainView.activityIndicator.style = Ti.UI.ActivityIndicatorStyle.BIG;
		//mainView.activityIndicator.top = 0; 
	}else if (Ti.Platform.name === 'iPhone OS'){
		mainView.loadingBar.top = (Ti.Platform.displayCaps.platformHeight / 2) -50; 
		mainView.activityIndicator.style = Ti.UI.ActivityIndicatorStyle.BIG;
	}  
};

exports.sync_time = function(time){ 
	var a = time.trim();
	a = a.replace("  ", " ");
	var b = a.split(" ");
	var date = b[0].split("-");
	var time = b[1].split(":"); 
	var s_date = new Date(date[0], date[1]-1, date[2],time[0],time[1],time[2]);
	var now = new Date();
	var s = Date.parse(s_date.toUTCString());
	var l = Date.parse(now.toUTCString());
	
	time_offset = s-l; 
};

exports.todayDateTime = function(){
	var today = new Date(Date.now()+time_offset);
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();
	
	var hours = today.getHours();
	var minutes = today.getMinutes();
	var sec = today.getSeconds();
	if (minutes < 10){
		minutes = "0" + minutes;
	} 
	if (sec < 10){
		sec = "0" + sec;
	} 
	if (hours < 10){
		hours = "0" + hours;
	} 
	
	if(dd<10) {
	    dd='0'+dd;
	} 
	
	if(mm<10) {
	    mm='0'+mm;
	} 
	
	datetime = yyyy+'-'+mm+'-'+dd + " "+ hours+":"+minutes+":"+sec;
 
	return datetime ;
};

exports.CheckboxwithText = function(text,highlightText, checkboxspecs, urlLink){
	var checkbox = this.createCheckbox({}, checkboxspecs);
	var label_sms = Titanium.UI.createLabel({
		text: text,
		width: "auto",
		height: Ti.UI.SIZE,
		font:{
			fontSize: 12
		}
	});
	var label_service = Titanium.UI.createLabel({
		text: "Terms of Service and",
		width: Ti.UI.SIZE,
		height: Ti.UI.SIZE,
		color: "#ED1C24",
		font:{
			fontWeight: "bold",
			fontSize: 12
		}
	});
	var label_privacy = Titanium.UI.createLabel({
		text: "Privacy Policy",
		left: 20,
		width:  Ti.UI.SIZE,
		height: Ti.UI.SIZE,
		color: "#ED1C24",
		font:{
			fontWeight: "bold",
			fontSize: 12
		}
	});
	var view_sms_box =  Titanium.UI.createView({
		width: Ti.UI.FILL,
		height: Ti.UI.SIZE,
		layout: "horizontal"
	});
	view_sms_box.add(checkbox);
	view_sms_box.add(label_sms);
	view_sms_box.add(label_service);
	view_sms_box.add(label_privacy);
	label_privacy.addEventListener('touchend',function(){  
		var win = Alloy.createController("webview", {url: "http://salesad.my/privacyPolicy"}).getView();  
		COMMON.openWindow(win);
	});
	label_service.addEventListener('touchend',function(){  
		var win = Alloy.createController("webview", {url: "http://salesad.my/termsOfService"}).getView();  
		COMMON.openWindow(win);
	});
	return view_sms_box;
};

exports.createCheckbox = function(specs,checkboxspecs,image) {

    if(typeof checkboxspecs != "object")
        checkboxspecs = {};
    checkboxspecs.id = "checkbox";
    checkboxspecs.width = checkboxspecs.width || 25;
    checkboxspecs.backgroundColor = checkboxspecs.unCheckedColor || "white";
    checkboxspecs.height = checkboxspecs.height || 25;
    checkboxspecs.border = checkboxspecs.border || 1;
    checkboxspecs.borderColor = checkboxspecs.borderColor || "silver";
    checkboxspecs.checked = false;
    var imageView = Ti.UI.createImageView({
        image:"/images/checkbox.gif",
        height:checkboxspecs.height * 1.5,
        bottom:3 + checkboxspecs.height * 0.5,
        left:3 + checkboxspecs.width * 0.5,
        opacity:0
    }) ;

    var viw = Ti.UI.createView(checkboxspecs);
    specs.width =  checkboxspecs.width * 1.5;
    specs.height = checkboxspecs.height * 1.5;

    var outerview = Ti.UI.createView({
        width: specs.width * 1.5,
        height: specs.height * 1.5,
    });
    var clickview = Ti.UI.createView({
        width:checkboxspecs.width,
        height:checkboxspecs.height
    });
    outerview.add(viw);
    outerview.add(imageView);
    outerview.add(clickview);

    function togglecheck () {
        if(!viw.checked) {
            viw.checked = true;
            imageView.opacity = 1; 
        }
        else {
            viw.checked = false;
            imageView.opacity = 0; 
        }           
    }
    clickview.addEventListener("click",togglecheck);
    return outerview;
};