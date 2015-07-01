var args = arguments[0] || {}; 

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "settings",
	action: "view",
	label: "settings",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Settings Main"
});
/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'SETTINGS', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
   
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.setting.titleControl = custom; 
} 
function generateSettingTable(){
	var tbl_data = [
	    { title: 'About', hasChild:true},
		{ title: 'Help', hasChild:true },
		{ title: 'Privacy and Terms', hasChild:true },
		{ title: 'Text Size', hasChild:true },
		{ title: 'Push Notification', hasChild:true },
	];

	var fontSizeClasses = (Ti.App.Properties.getString("fontSizeClasses"))?Ti.App.Properties.getString("fontSizeClasses"):"normal_font";
 
	var RegTable = Titanium.UI.createTableView({
		width:'100%',
		separatorColor: '#777777' ,
		scrollable: false,
		height: Ti.UI.SIZE,
		scrollable: false,
		top: 0
	});

	var regData=[];
	for (var j=0; j< tbl_data.length; j++) {

	   var regRow = Titanium.UI.createTableViewRow({
		    touchEnabled: true,
		    height: 50, 
		    id: "profile",
		    selectedBackgroundColor: "#FFE1E1",
			backgroundColor: "#FFFFF6",
		  });

		var title = $.UI.create('label', {
			text: tbl_data[j].title , 
			classes: [fontSizeClasses],
			color: "#848484",
			width:'auto',
			textAlign:'left',
			left:20,
		});

		var rightRegBtn =  Titanium.UI.createImageView({
			image:"/images/btn-forward.png",
			width:15,
			height:15,
			right:20,
			top:20
		});		

		regRow.add(title);
		regRow.add(rightRegBtn);
		regData.push(regRow);
	}

	RegTable.setData(regData);
	var regRow = Titanium.UI.createTableViewRow({
		    touchEnabled: true,
		    height: 50, 
		    id: "profile",
		    selectedBackgroundColor: "#FFE1E1",
			backgroundColor: "#FFFFF6",
		  });

	var title = $.UI.create('label', {
		text: "Version" , 
		classes: [fontSizeClasses],
		color: "#848484",
		width:'auto',
		textAlign:'left',
		left:20,
	});
	
	var subtitle = $.UI.create('label', {
		text: Ti.App.version, 
		classes: [fontSizeClasses],
		color: "#848484",
		width:'auto',
		textAlign:'left',
		right:10,
	});
	regRow.add(title);
	regRow.add(subtitle);
	RegTable.appendRow(regRow);
	//$.setting.removeAllChildren();
	$.settingView.settingTable.add(RegTable);
}

/* Event Listener */
$.setting.addEventListener("close", function(){
    $.destroy();
});

$.setting.addEventListener('click', function(e){
	if(e.index == 0){
		var win = Alloy.createController("about").getView();
		COMMON.openWindow(win);  
	}
	if(e.index == 1){
		var win = Alloy.createController("help").getView();  
		COMMON.openWindow(win); 
	}
	if(e.index == 2){
		var win = Alloy.createController("tnc").getView(); 
		COMMON.openWindow(win); 
	}

	if(e.index == 3){
		var win = Alloy.createController("textSizeSetting").getView();  
		COMMON.openWindow(win);
	}

	if(e.index == 4){
		var win = Alloy.createController("pushNotificationSettings").getView();  
		COMMON.openWindow(win); 
	}
	
});


/* Function */
var fontReset = function(){
	$.settingView.settingTable.removeAllChildren();
	generateSettingTable();
};

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.setting); 
}); 

Ti.App.addEventListener('app:fontReset', fontReset);
/* App Running */
// alternatively, you could do
generateSettingTable();
tbl_data = null;
table = null;