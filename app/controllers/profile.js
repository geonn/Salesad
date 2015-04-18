var args = arguments[0] || {}; 

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "account",
	action: "view",
	label: "profile",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Member Profile"
});
/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'MY PROFILE', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
 
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.profile.titleControl = custom; 
}

/** User session**/
var session = Ti.App.Properties.getString('session');

/** load category from Model**/
var library = Alloy.createCollection('member'); 
var details = library.getUserBySession(session);

//$.username.text = details.username;
//$.fullname.text = details.fullname;
//$.email.text    = details.email;

function addRegClickEvent(table){
	table.addEventListener('click', function(e){
		/** User session**/
		var user = Ti.App.Properties.getString('session');
		
		if(e.index > 0){
			var selectedSection = e.source;
			var args = {
				'title'  : selectedSection.titles,
				'module' : selectedSection.mod,
				'fullname'  :details.fullname,
				'email'  :details.email
			};
			var win = Alloy.createController("editProfile",args).getView(); 
			COMMON.openWindow(win); 
		} 
	});
}

function loadTable(){
	details = library.getUserBySession(session);

	var RegArr = [
	{ title:'Username', value:details.username, mod: "username",  hasChild:false  },
	{ title:'Fullname', value:details.fullname, mod:"fullname", hasChild:true },
	{ title:'Email',  value:details.email, mod:"email",hasChild:true },
	];
	
	var RegTable = Titanium.UI.createTableView({
		width:'100%',
		separatorColor: '#ffffff' ,
		scrollable: false
	});
	
	var regData=[];
	for (var j=0; j< RegArr.length; j++) {
	   
	   var regRow = Titanium.UI.createTableViewRow({
	   		titles: RegArr[j].title ,  
		    touchEnabled: true,
		    mod: RegArr[j].mod, 
		    height: 50,  
		    backgroundSelectedColor: "#FFE1E1",
			backgroundColor: "#ffffff",
		  });
		
		var title = Titanium.UI.createLabel({
			titles: RegArr[j].title ,  
			text: RegArr[j].title ,  
			mod: RegArr[j].mod,  
			font:{fontSize:16 },
			color: "#848484",
			width:'auto',
			textAlign:'left',
			left:10
		});
		
		var label = Titanium.UI.createLabel({
			text: RegArr[j].value ,
			titles: RegArr[j].title ,  
			mod: RegArr[j].mod,   
			font:{fontSize:12 },
			color: "#848484",
			width:'auto',
			textAlign:'left',
			right:50
		});
		
		regRow.add(title);
		regRow.add(label);
		var rightRegBtn =[];
		if(RegArr[j].hasChild === true){
			 rightRegBtn =  Titanium.UI.createImageView({
				image:"/images/btn-forward.png",
				titles: RegArr[j].title ,  
				mod: RegArr[j].mod, 
				width:15,
				height:15,
				right:20,
				top:20
			});	
			regRow.add(rightRegBtn);	
		}  
		regData.push(regRow);
	}
 
	RegTable.setData(regData);
	addRegClickEvent(RegTable);
	$.profileView.table1Container.add(RegTable); 
	
	//PASSWORD TABLE
	var passData=[];
	
	var PassTable = Titanium.UI.createTableView({
		width:'100%',
		separatorColor: '#ffffff' ,
		scrollable: false
	});
	var passRow = Titanium.UI.createTableViewRow({
		    touchEnabled: true,
		    height: 50, 
		    id: "profile",
		    backgroundSelectedColor: "#FFE1E1",
			backgroundColor: "#ffffff",
		  });
		var title = Titanium.UI.createLabel({
			text: "Change Password", 
			font:{fontSize:16 },
			color: "#848484",
			width:'auto',
			textAlign:'left',
			left:10
		});
		
		var label = Titanium.UI.createLabel({
			
			font:{fontSize:12 },
			color: "#848484",
			width:'auto',
			textAlign:'left',
			right:50
		});
	
		rightRegBtn =  Titanium.UI.createImageView({
				image:"/images/btn-forward.png",
				width:15,
				height:15,
				right:20,
				top:20
		});	
		
		passRow.addEventListener('click',  function(event){
			var win = Alloy.createController("editPassword",{username: details.username}).getView(); 
			COMMON.openWindow(win); 
		});
		passRow.add(title);
		passRow.add(label);
		passRow.add(rightRegBtn);
		passData.push(passRow);
		PassTable.setData(passData);
		$.profileView.table2Container.add(PassTable); 
	
	
	//PASSWORD TABLE
	var stateData=[];
	
	var stateTable = Titanium.UI.createTableView({
		width:'100%',
		separatorColor: '#ffffff' ,
		scrollable: false
	});
	var stateRow = Titanium.UI.createTableViewRow({
	    touchEnabled: true,
	    height: 50, 
	    backgroundSelectedColor: "#FFE1E1",
		backgroundColor: "#ffffff",
	  });
	var title = Titanium.UI.createLabel({
		text: "State", 
		font:{fontSize:16 },
		color: "#848484",
		width:'auto',
		textAlign:'left',
		left:10
	});
	
	var label = Titanium.UI.createLabel({
		
		font:{fontSize:12 },
		color: "#848484",
		width:'auto',
		textAlign:'left',
		right:50
	});

	rightRegBtn =  Titanium.UI.createImageView({
			image:"/images/btn-forward.png",
			width:15,
			height:15,
			right:20,
			top:20
	});	
	
	stateRow.addEventListener('click',  function(event){
		var win = Alloy.createController("favouriteState").getView(); 
		COMMON.openWindow(win); 
	});
	
	stateRow.add(title);
	stateRow.add(label);
	stateRow.add(rightRegBtn);
	stateData.push(stateRow);
	stateTable.setData(stateData);
	$.profileView.table3Container.add(stateTable); 
	
}


/***FUNCTION***/
var doLogout = function (e) { 
	var dialog = Ti.UI.createAlertDialog({
	    cancel: 1,
	    buttonNames: ['Cancel','Confirm'],
	    message: 'Would you like to logout?',
	    title: 'Logout SalesAd'
	  });
	  dialog.addEventListener('click', function(e){
	    if (e.index === 1){
			var url = API.logoutUser + Ti.App.Properties.getString('session');
			var client = Ti.Network.createHTTPClient({
			     // function called when the response data is available
			     onload : function(e) {
			     	Ti.App.Properties.removeProperty('u_id');
			     	Ti.App.Properties.removeProperty('session');
			     	 var win = Alloy.createController("index").getView(); 
			     	 win.open();
			     },
			     // function called when an error occurs, including a timeout
			     onerror : function(e) {
			        createAlert('Network declined','Failed to contact with server. Please make sure your device are connected to internet.');
			     },
			     timeout : 5000  // in milliseconds
			 });
			 // Prepare the connection.
			 client.open("GET", url);
			 // Send the request.
			 client.send(); 
	    }
	 });

	dialog.show();
};



/**update the details from editProfile**/
var updateProfile = function(e) {
	loadTable();
};

Ti.App.addEventListener('updateProfile', updateProfile);
loadTable();

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.profile); 
}); 

/** close all profile eventListener when close the page**/
$.profile.addEventListener("close", function(){
	$.destroy();
    Ti.App.removeEventListener('updateProfile',updateProfile);
    
    /* release function memory */
    doLogout    = null;
    editProfile = null;
    editPassword = null;
});
