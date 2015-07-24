var mainView = null;

exports.construct = function(mv){
	mainView = mv;
};
exports.deconstruct = function(){  
	mainView = null;
};

function openWindow(win){
	if(Ti.Platform.osname == "android"){
	  	win.open(); //{fullscreen:false, navBarHidden: false}
	}else{ 
		var nav = Alloy.Globals.navMenu;
		nav.openWindow(win,{animated:true});  
	} 
}

function closeWindow(win){
	if(Ti.Platform.osname == "android"){ 
	  	win.close(); 
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

function createAlert (tt,msg){
	var box = Titanium.UI.createAlertDialog({
		title: tt,
		ok: 'OK',
		message: msg
	});
	box.show();
};

exports.openWindow = _.throttle(openWindow, 500, true);
exports.closeWindow = _.debounce(closeWindow, 0, true);
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
		mainView.activityIndicator.style = Ti.UI.iPhone.ActivityIndicatorStyle.BIG;
	}  
};

exports.todayDateTime = function(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();
	
	if(dd<10) {
	    dd='0'+dd;
	} 
	
	if(mm<10) {
	    mm='0'+mm;
	} 
	
	today = yyyy+'-'+mm+'-'+ dd + " "+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	return today;
};