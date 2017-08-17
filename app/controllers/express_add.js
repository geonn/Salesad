var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var data;
var loading = Alloy.createController("loading");
var checking = true; 

function render_page(){
}

function init(){
	var view_agreement_box = COMMON.CheckboxwithText("I accept the ","Terms of Service and Privacy Policy", {name: "agreets"},"tnc");
	$.tc_area.add(view_agreement_box);
	textarea_hintext();
	$.win.add(loading.getView());
}

function textarea_hintext(){
	var forms_array = $.inner_box.getChildren();
	for (var i=0; i < forms_array.length; i++) {
		if(forms_array[i].form_type == "textarea"){
			forms_array[i].value = forms_array[i].hintText;
			forms_array[i].addEventListener("focus", function(e){
				if(e.source.value == e.source.hintText){
					e.source.color = "#404041";
					e.source.value = "";
				}
			});
			forms_array[i].addEventListener("blur", function(e){
				if(e.source.value == ""){
					e.source.color = "#cccccc";
					e.source.value = e.source.hintText;
				}
			});
		}
	}
}

function hidesoftkeyboard(){
	$.title.blur();
	$.address.blur();
}

init();

function doSubmit(){
if(checking){
	
	var forms_array = $.inner_box.getChildren();
	var params = {u_id: u_id};
	var error = "";
	loading.start();
	var alert_msg = "";
	var tc_child = $.tc_area.getChildren();
	var tc = tc_child[0].children[0].children[0].checked;
	console.log(tc_child);
	if(!tc){
		alert("Please agree the terms and condition.");
		loading.finish();
		return;
	}
	for (var a=0; a < forms_array.length; a++) {
		if(typeof forms_array[a].require != "undefined" && forms_array[a].require){
			if(typeof forms_array[a].model != "undefined"){
				if(typeof forms_array[a].record == "undefined"){
					alert_msg = alert_msg+forms_array[a].hintText+"\n";
				}
			}else{
				if(forms_array[a].value == "" || typeof forms_array[a].value == "undefined" || forms_array[a].value == "undefined,undefined" || forms_array[a].value == "Store Name / Address"){
					alert_msg = alert_msg+forms_array[a].hintText+"\n";
				}
			}
		}
	};
	var contact = Math.floor($.contact.value);
	console.log(typeof contact+" "+contact);
	if(isNaN(contact)){
		alert_msg = alert_msg+"Invalid contact number\n";
	}
	if(alert_msg != ""){
		alert(alert_msg);
		loading.finish();
		return;
	}
	for (var i=0; i < forms_array.length; i++) {
		console.log("beng");
		var form_value = (typeof forms_array[i].model != "undefined")?eval("forms_array[i].record."+forms_array[i].submitColumn):forms_array[i].value;
		eval("_.extend(params, {"+forms_array[i].id+": form_value})");
		console.log(form_value+" "+forms_array[i].id);
		if(typeof forms_array[i].require != "undefined"){
			if(forms_array[i].value == ""){
				error = error + forms_array[i].hintText+" cannot be empty\n"; 
			}
		}
		if(forms_array[i].form_type == "image"){
			console.log(forms_array[i].blob_submit+"heree");
			if(typeof forms_array[i].blob_submit == "undefined"){
				alert("Please upload photo");
				loading.finish();
				return;
			}
			var img_blob = forms_array[i].blob_submit.imageAsResized(640, 640); 
			_.extend(params, {Filedata: img_blob});
		}
	};
	if(error != ""){
		loading.finish();
		return;
	}
	console.log(params);
	API.callByPost({
		url: "addSXItem",
		new: true,
		params: params
	},
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			console.log(res);
			loading.finish();
			Ti.App.fireEvent("home:refresh");
			COMMON.closeWindow($.win);
		},
		onerror: function(err){
			
		}
	}
	);
	checking = false;	
}

}

function popMap(e){
	var v = e.source.children[0].text;
	console.log(e.source);
	console.log(e.source.children[0].text);
	var location = v.split(",");		
	if(v != "Map Location"){
		hidesoftkeyboard();
		if (Ti.Geolocation.locationServicesEnabled) {
			COMMON.openWindow(Alloy.createController("express_location", {lat: location[0], lot: location[1]}).getView());	
		}			
		else{
		    Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
				if(e.success){
					COMMON.openWindow(Alloy.createController("express_location", {lat: location[0], lot: location[1]}).getView());						
				}
				else{
		        	alert("You denied permission.");
				}
		  	});			
		}
	}else{
		
		var win = Alloy.createController("express_location").getView(); 
		hidesoftkeyboard();
		if (Ti.Geolocation.locationServicesEnabled) {
			COMMON.openWindow(win);	
		}			
		else{
		    Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function(e) {
				if(e.success){
					COMMON.openWindow(win);						
				}
				else{
		        	alert("You denied permission.");
				}
		  	});			
		}	
	}
}

function popDatePicker(e){
	hidesoftkeyboard();
	var source = parent({name: "master", value: "1"}, e.source);
	var val_date = (typeof source.date != "undefined")?source.date:new Date();
	var picker = $.UI.create("Picker", {
	  type:Ti.UI.PICKER_TYPE_DATE,
	  value: val_date,
	  zIndex: 50,
	});
	var view_container = $.UI.create("View", {classes:['wfill', 'hfill'], zIndex: 30,});
	var mask = $.UI.create("View", {classes:['wfill','hfill'], backgroundColor: "#F6F6F6"});
	var ok_button = $.UI.create("Button", {classes:['button', 'wsize'], right: 5, title: "Done"});
	var cancel_button = $.UI.create("Button", {classes:['button', 'wsize'], left:5, title: "Cancel"});
	var view_vert = $.UI.create("View", {classes:['wsize','hsize','vert']});
	var button_horz = $.UI.create("View", {classes: ['wfill', 'hsize'], left: 50, right: 50, top: 10});
	cancel_button.addEventListener("click", function(){ 
		$.win.remove(view_container);
	});
	mask.addEventListener("click", function(){ 
		$.win.remove(view_container);
	});
	ok_button.addEventListener("click", function(){
		source.value = picker.value;
		var dd = picker.value.getDate();
		var mm = picker.value.getMonth()+1; 
		var yyyy = picker.value.getFullYear();
		console.log(yyyy+'-'+mm+'-'+dd);
		source.value = yyyy+'-'+mm+'-'+dd;
		source.date = picker.value;
		source.children[0].text = yyyy+'-'+mm+'-'+dd;
		source.children[0].color = "#404041";
		$.win.remove(view_container);
	});
	
	view_container.add(mask);
	view_vert.add(picker);
	button_horz.add(cancel_button);
	button_horz.add(ok_button);
	view_vert.add(button_horz);
	view_container.add(view_vert);
	
	$.win.add(view_container);

}

function popDialogOption(e){
	hidesoftkeyboard();
	var source = parent({name: "master", value: "1"}, e.source);
	eval("var model = Alloy.createCollection('"+source.model+"')");
	var picker_list = model.getPickerList();
	var options = _.pluck(picker_list, source.optionColumn);
	options.push("Cancel");
	var dialog = Ti.UI.createOptionDialog({
	  cancel: options.length - 1,
	  options: options,
	  title: 'Category'
	});
	dialog.show();
	dialog.addEventListener("click", function(ex){   
		if(ex.index != options.length - 1){
			source.record = picker_list[ex.index];
			eval("source.children[0].text = picker_list[ex.index]."+source.optionColumn);
			source.children[0].color = "#404041";
		}
	});
}

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
	        //then we are getting image from camera]
	        if(Ti.Media.hasCameraPermissions()){
        		console.log("Success to open camera");
		        Titanium.Media.showCamera({ 
		            success:function(event) { 
		               image_preview(event);
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
	        }else{
		        Ti.Media.requestCameraPermissions(function(e){
		        	
		        	if(e.success){
		        		console.log("Success to open camera");
				        Titanium.Media.showCamera({ 
				            success:function(event) { 
				               image_preview(event);
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
		        	}
		        	else{
		        		alert("You denied permission.");
		        	}
		        });
	        }
	    } else if(e.index == 1){
	    		//obtain an image from the gallery
	        Titanium.Media.openPhotoGallery({
	            
	            success:function(event) {
	           		image_preview(event);
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

function image_preview(event){
	if (event.mediaType==Ti.Media.MEDIA_TYPE_PHOTO){
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
		var writeFile = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory, filename+'.png');
		if(writeFile.exists()){
			writeFile.deleteFile();
		}
		writeFile.write(image);
		console.log(writeFile.nativePath);
		var win = Alloy.createController("image_preview", {image: writeFile.nativePath}).getView(); 
		COMMON.openWindow(win);	    	
	}
}

function cropped_image(e){
	$.photoLoad.image = Titanium.Utils.base64decode(e.image_callback);
	$.photoLoad.width = Ti.UI.FILL;
	$.photoLoad.height = Ti.UI.SIZE;
	$.photoLoad.left = 40;
	$.photoLoad.right = 40;
	$.photoLoad.blob_submit = Titanium.Utils.base64decode(e.image_callback);
	console.log("cropped_image");
	$.photoLoad.value = 1;
}

function set_location(e){
	$.location.value = e.location;
	$.location.children[0].text = e.location;
	$.location.children[0].color = "#404041";
}

Ti.App.addEventListener("cropped_image", cropped_image);
Ti.App.addEventListener("set_location", set_location);

$.win.addEventListener("close", function(e){
	Ti.App.removeEventListener("cropped_image", cropped_image);
	Ti.App.removeEventListener("set_location", set_location);
});

$.win.addEventListener("android:back", function(e){
	e.cancelBubble = true;
	COMMON.createAlert("Alert", "Are you sure  you want to leave this page? Your post will be discarded.", function(e){
		COMMON.closeWindow($.win);
	});
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.createAlert("Alert", "Are you sure  you want to leave this page? Your post will be discarded.", function(e){
		COMMON.closeWindow($.win);
	});
	
});