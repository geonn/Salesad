var args = arguments[0] || {};
/** google analytics**/ 

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
	var u_id = Ti.App.Properties.getString('u_id');
 	var firstname = Ti.App.Properties.getString('firstname');
 	var lastname = Ti.App.Properties.getString('lastname');
 	var email = Ti.App.Properties.getString('email');
 	var gender = Ti.App.Properties.getString('gender');
	var session = Ti.App.Properties.getString('session');
	var img_path = Ti.App.Properties.getString('img_path');
	$.photoLoad.image = img_path;
	console.log(firstname+"firstname");
	var RegArr = [
	{ title:'Firstname', value:firstname, mod: "firstname",  hasChild:true  },
	{ title:'Lastname', value:lastname, mod:"lastname", hasChild:true },
	{ title:'Email',  value:email, mod:"email",hasChild:true },
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
		    selectedBackgroundColor: "#FFE1E1",
			backgroundColor: "#ffffff",
		  });
		
		var title = $.UI.create("Label", {
			titles: RegArr[j].title ,  
			text: RegArr[j].title ,  
			mod: RegArr[j].mod,  
			font:{fontSize:16 },
			color: "#848484",
			width:'auto',
			textAlign:'left',
			left:10
		});
		
		var label = $.UI.create("Label", {
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
	$.table1Container.add(RegTable); 
	
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
		    selectedBackgroundColor: "#FFE1E1",
			backgroundColor: "#ffffff",
		  });
		var title = $.UI.create("Label", {
			text: "Change Password", 
			font:{fontSize:16 },
			color: "#848484",
			width:'auto',
			textAlign:'left',
			left:10
		});
		
		var label = $.UI.create("Label", {
			
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
		$.table2Container.add(PassTable); 
	
	
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
	    selectedBackgroundColor: "#FFE1E1",
		backgroundColor: "#ffffff",
	  });
	var title = $.UI.create("Label", {
		text: "State", 
		font:{fontSize:16 },
		color: "#848484",
		width:'auto',
		textAlign:'left',
		left:10
	});
	
	var label = $.UI.create("Label", {
		
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
	//$.table3Container.add(stateTable); 
	
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
	  	if(e.button === false){
	  		return e.button;
	  	}
	  	
	    if (e.index === 1){
	    	//fb logout
	    	if(Ti.App.Properties.getString('facebooklogin') == "1"){
	    		FACEBOOK.logout();
	   		}
	   		
			var url = API.logoutUser + Ti.App.Properties.getString('session');
			var client = Ti.Network.createHTTPClient({
			     // function called when the response data is available
			     onload : function(e) {
			     	Ti.App.Properties.removeProperty('u_id');
		         	Ti.App.Properties.removeProperty('firstname');
		         	Ti.App.Properties.removeProperty('lastname');
		         	Ti.App.Properties.removeProperty('email');
		         	Ti.App.Properties.removeProperty('gender');
					Ti.App.Properties.removeProperty('session');
			     	COMMON.closeWindow($.win);
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

$.button.addEventListener('click', doLogout);
Ti.App.addEventListener('updateProfile', updateProfile);
loadTable();

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win); 
}); 


function popCamera(e){
	var dialog = Titanium.UI.createOptionDialog({ 
	    title: 'Choose an image source...', 
	    options: ['Camera','Photo Gallery', 'Cancel'], 
	    cancel:2 //index of cancel button
	});
	var pWidth = Ti.Platform.displayCaps.platformWidth;
    var pHeight = Ti.Platform.displayCaps.platformHeight;
     
	dialog.addEventListener('click', function(e) { 
	    
	    if(e.index == 0) { //if first option was selected
	        //then we are getting image from camera
	        Titanium.Media.showCamera({ 
	            success:function(event) { 
	               var image = event.media;
        		   if(image.width > image.height){
	        			var newWidth = 640;
	        			var ratio =   640 / image.width;
	        			var newHeight = image.height * ratio;
	        		}else{
	        			var newHeight = 640;
	        			var ratio =   640 / image.height;
	        			var newWidth = image.width * ratio;
	        		} 
	        		 
					image = image.imageAsResized(newWidth, newHeight); 
					var filename = Math.floor(Date.now() /1000);
		            	console.log(filename+" check");
	                if(event.media.nativePath == null){
		            		var writeFile = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory, filename+'.png');
		            		if(writeFile.exists()){
		            			writeFile.deleteFile();
		            		}
		            		writeFile.write(image);
		            		console.log(writeFile.nativePath);
		            		var win = Alloy.createController("image_preview", {image: writeFile.nativePath}).getView(); 
					    	COMMON.openWindow(win);
		            	}else{
		            		console.log(event.media.nativePath+" yes");
		            		var win = Alloy.createController("image_preview", {image: event.media.nativePath}).getView(); 
					    	COMMON.openWindow(win);
		            	}
	            },
	            cancel:function(){
	                //do somehting if user cancels operation
	            },
	            error:function(error) {
	                //error happend, create alert
	                var a = Titanium.UI.createAlertDialog({title:'Camera'});
	                //set message
	                if (error.code == Titanium.Media.NO_CAMERA){
	                    a.setMessage('Device does not have camera');
	                }else{
	                    a.setMessage('Unexpected error: ' + error.code);
	                }
	 
	                // show alert
	                a.show();
	            },
	            allowImageEditing:true,
	            mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
	            saveToPhotoGallery:true
	        });
	    } else if(e.index == 1){
	    		//obtain an image from the gallery
	        Titanium.Media.openPhotoGallery({
	            
	            success:function(event) {
					// called when media returned from the camera
					console.log(JSON.stringify(event.media));
					if (event.mediaType==Ti.Media.MEDIA_TYPE_PHOTO){
						var filename = Math.floor(Date.now() /1000);
		            	console.log(filename+" check");
	                	if(event.media.nativePath == null){
		            		var writeFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename+'.png');
		            		if(writeFile.exists()){
		            			writeFile.deleteFile();
		            		}
		            		writeFile.write(event.media);
							console.log(writeFile.nativePath+" this is media");
						//var img = $.UI.create("ImageView", {image: event.media});
						$.photoLoad.image = event.media;
						var win = Alloy.createController("image_preview", {image: writeFile.nativePath}).getView(); 
				    	COMMON.openWindow(win);
				    	}
				    }
				},
				cancel:function() {
					// called when user cancels taking a picture
				},
				error:function(error) {
					// called when there's an error
					var a = Titanium.UI.createAlertDialog({title:'Camera'});
					if (error.code == Titanium.Media.NO_CAMERA) {
						a.setMessage('Please run this test on device');
					} else {
						a.setMessage('Unexpected error: ' + error.code);
					}
					a.show();
				},
			    // allowEditing and mediaTypes are iOS-only settings
				allowEditing: true,
	            mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
	        });
	    	
	    } else {
	        
	    }
	});
	 
	//show dialog
	dialog.show();
}

function cropped_image(e){
	$.photoLoad.image = Titanium.Utils.base64decode(e.image_callback);
	$.photoLoad.blob_submit = Titanium.Utils.base64decode(e.image_callback);
	$.photoLoad.value = 1;
	doSubmit();
}

function doSubmit(){
	var img_blob = $.photoLoad.blob_submit.imageAsResized(640, 640); 
	var u_id = Ti.App.Properties.getString('u_id');
	var params = {photoLoad: $.photoLoad.value, u_id: u_id};
	_.extend(params, {Filedata: img_blob});
	API.callByPost({
		url: "addUserThumb",
		new: true,
		params: params
	},
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			console.log(arr.img_path+" img_path");
			Ti.App.Properties.setString('img_path', arr.img_path);
		},
		onerror: function(err){
			
		}
	});
}

Ti.App.addEventListener("cropped_image", cropped_image);

$.win.addEventListener("close", function(e){
	Ti.App.removeEventListener("cropped_image", cropped_image);
	Ti.App.removeEventListener('updateProfile',updateProfile);
    
    /* release function memory */
    doLogout    = null;
    editProfile = null;
    editPassword = null;
});