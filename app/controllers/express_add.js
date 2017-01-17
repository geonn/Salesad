var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var data;
var loading = Alloy.createController("loading");

function render_page(){
}

function init(){
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

init();

function doSubmit(){
	var forms_array = $.inner_box.getChildren();
	var params = {u_id: u_id};
	var error = "";
	loading.start();
	for (var i=0; i < forms_array.length; i++) {
		var form_value = (typeof forms_array[i].model != "undefined")?eval("forms_array[i].record."+forms_array[i].submitColumn):forms_array[i].value;
		eval("_.extend(params, {"+forms_array[i].id+": form_value})");
		if(typeof forms_array[i].require != "undefined"){
			if(forms_array[i].value == ""){
				error = error + forms_array[i].hintText+" cannot be empty\n"; 
			}
		}
		if(forms_array[i].form_type == "image"){
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
			loading.finish();
		},
		onerror: function(err){
			
		}
	}
	);
}

function popMap(e){
	var win = Alloy.createController("express_location").getView(); 
	COMMON.openWindow(win);
}

function popDatePicker(e){
	var source = parent({name: "master", value: "1"}, e.source);
	var val_date = (typeof source.date != "undefined")?source.date:new Date();
	var picker = $.UI.create("Picker", {
	  type:Ti.UI.PICKER_TYPE_DATE,
	  value: val_date,
	  zIndex: 50,
	});
	var view_container = $.UI.create("View", {classes:['wfill', 'hfill'], zIndex: 30,});
	var img_mask = $.UI.create("ImageView", {classes:['wfill','hfill'], image: "/images/warm-grey-bg.png"});
	var ok_button = $.UI.create("Button", {classes:['button'], left: 10, right:10, title: "Done"});
	var cancel_button = $.UI.create("Button", {classes:['button'], left: 10, right:10, title: "Cancel"});
	var view_vert = $.UI.create("View", {classes:['wsize','hsize','vert']});
	cancel_button.addEventListener("click", function(){ 
		$.win.remove(view_container);
	});
	img_mask.addEventListener("click", function(){ 
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
	
	view_container.add(img_mask);
	view_vert.add(picker);
	view_vert.add(ok_button);
	view_vert.add(cancel_button);
	view_container.add(view_vert);
	
	$.win.add(view_container);

}

function popDialogOption(e){
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
	                if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
	                   //var nativePath = event.media.nativePath;  
					  var win = Alloy.createController("preview", {image: image}).getView(); 
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
	        Ti.Media.openPhotoGallery({
	            success:function(event){
	            	// set image view
	            	var image = event.media;
            		if (event.mediaType==Ti.Media.MEDIA_TYPE_PHOTO){
            			console.log(JSON.stringify(event));
		            	console.log(event.media.nativePath+" whyyyy!");
		            	if(event.media.nativePath == null){
		            		var writeFile = Ti.Filesystem.getFile(Ti.Filesystem.tempDirectory, 'default.png');
		            		if(writeFile.exists()){
		            			writeFile.deleteFile();
		            		}
		            		writeFile.write(image);
		            		var win = Alloy.createController("image_preview", {image: writeFile.nativePath}).getView(); 
					    	COMMON.openWindow(win);
		            	}else{
		            		 var win = Alloy.createController("image_preview", {image: event.media.nativePath}).getView(); 
					    	COMMON.openWindow(win);
		            	}
				    }
	            },
	            cancel:function() {
	               
	            },
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

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 
