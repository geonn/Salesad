var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var data;
var loading = Alloy.createController("loading");

function render_page(){
}

function init(){
	$.win.add(loading.getView());
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
		            	console.log(event.media.nativePath+" whyyyy!");
			            var win = Alloy.createController("image_preview", {image: image.nativePath}).getView(); 
					    COMMON.openWindow(win);
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
	$.photoLoad.image = e.image;
	$.photoLoad.value = 1;
}

Ti.App.addEventListener("cropped_image", cropped_image);

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 
