var args = arguments[0] || {};
var loading = Alloy.createController("loading");
$.register.add(loading.getView());
/** include required file**/
var api = require('api');


/** To check if keyboard onfocus or onblur**/
var isKeyboardFocus = 0;
var isSubmit        = 0;

var view_agreement_box = COMMON.CheckboxwithText("I accept the ","Terms of Use and Privacy Policy", {name: "agreets"},"tnc");
$.tc_area.add(view_agreement_box);

/*********************
*******FUNCTION*******
**********************/
var goSignUp = function(){
	loading.start();
	//$.registerButton.hide();
	var tc_child = $.tc_area.getChildren();
	var tc = tc_child[0].children[0].children[0].checked;
	var common = require('common');
	var firstname 		 = $.firstname.value;
	var lastname 		 = $.lastname.value;
	var dob = $.dob.value || "";
	var state = $.state.value || "";
	var mobile = $.mobile.value;
	var gender 		 = (typeof $.gender.record != "undefined")?$.gender.record.id:"";
	var email 		     = $.email.value;
	var salesman_code 		     = $.salesman_code.value;
	var password 		 = $.password.value;
	var password2 		 = $.confirm_password.value;
	var callapi = false;
	console.log(validateEmail(email));
	if(email == ""){
		alert("Email cannot be empty");
		loading.finish();
		return;				
	}	
	else if(password == ""){
		alert("Password cannot be empty");
		loading.finish();	
		return;			
	}	
	else if(password2 == ""){
		alert("Comfirm password cannot be empty");
		loading.finish();
		return;				
	}
	else if(password != password2){
		alert("Password and comfirm password is not match");
		loading.finish();	
		return;			
	}	
	else if(firstname == ""){
		alert("Firstname cannot be empty");
		loading.finish();	
		return;			
	}
	else if(lastname == ""){
		alert("Lastname cannot be empty");
		loading.finish();	
		return;			
	}
	else if(gender == ""){
		alert("Gender cannot be empty");
		loading.finish();	
		return;			
	}
	else if(dob == ""){
		alert("Date of birth cannot be empty");
		loading.finish();	
		return;			
	}
	else if(state == ""){
		alert("State cannot be empty");
		loading.finish();	
		return;			
	}
	else if(mobile == ""){
		alert("Mobile cannot be empty");
		loading.finish();	
		return;			
	}
	else if(isNaN(mobile) == true){
		alert("Mobile wrong format");
		loading.finish();	
		return;
	}
	else if(!tc){
		alert("Please agree the terms and condition.");
		loading.finish();
		return;		
	}else if(!validateEmail(email)){
		alert("Please enter correct email format.");
		loading.finish();
		return;		
	}else if(tc){
		callapi = true;	
	}
	else if(isSubmit == 1){
		return;
	}
    isSubmit = 1;
	if(callapi){
		API.callByPost({
			url: "registerUser",
			new: true,
			params: {
				firstname: firstname,
				lastname: lastname,
				dob: dob,
				state: state,
				mobile: mobile,
				salesman_code: salesman_code,
				gender: gender,
				email: email,
				password: password,
				password2: password2
			}
		},
		{
			onload: function(responseText){
				var res = JSON.parse(responseText);
				var arr = res.data || null;
				if(res.status == "success"){
		         	//save session
		         	Ti.App.Properties.setString('u_id', res.data.u_id);
		         	Ti.App.Properties.setString('firstname', res.data.firstname);
		         	Ti.App.Properties.setString('lastname', res.data.lastname);
		         	Ti.App.Properties.setString('salesman_code', res.data.salesman_code);
		         	Ti.App.Properties.setString('email', res.data.email);
		         	Ti.App.Properties.setString('gender', res.data.gender);
					Ti.App.Properties.setString('session', res.data.session);
		         	/**load new set of category from API**/
			       	
			       	
					common.createAlert('Successfully register', "Thank you sign up with Salesad. Please login to continue.");
					Ti.App.fireEvent("login:close");
					closeWindow();
					isSubmit = 0;
		         }else{
		         	isSubmit = 0;
		         	alert(res.data.join("\r\n"));
		         }
				
			},
			onerror: function(err){
				$.activityIndicator.hide();
		     	$.loadingBar.opacity = "0";
		     	isSubmit = 0;
		        common.createAlert('Network declined','Failed to contact with server. Please make sure your device are connected to internet.');
			},
			timeout : 10000
		});
		loading.finish();
	}
};

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
	/*
	var url = api.registerUser +"&firstname="+firstname+"&lastname="+lastname+"&gender="+gender+"&email="+email+"&password="+password+"&password2="+password2;
	
	var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	     	$.activityIndicator.hide();
	     	$.loadingBar.opacity = "0";
	         var res = JSON.parse(this.responseText);
	         if(res.status == "success"){
	         	 
	         	//save session
	         	Ti.App.Properties.setString('u_id', res.data.u_id);
	         	Ti.App.Properties.setString('firstname', res.data.firstname);
	         	Ti.App.Properties.setString('lastname', res.data.lastname);
	         	Ti.App.Properties.setString('email', res.data.email);
	         	Ti.App.Properties.setString('gender', res.data.gender);
				Ti.App.Properties.setString('session', res.data.session);
	         	/**load new set of category from API*
		       	
		       	
				common.createAlert('Successfully register', "Thank you sign up with Salesad. Please login to continue.");
				closeWindow(e);
				isSubmit = 0;
	         }else{
	         	isSubmit = 0;
	         	common.createAlert('Authentication warning',res.data.error_msg);
	         }
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	     	$.activityIndicator.hide();
	     	$.loadingBar.opacity = "0";
	     	isSubmit = 0;
	        common.createAlert('Network declined','Failed to contact with server. Please make sure your device are connected to internet.');
	     },
	     timeout : 10000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send(); 
};*/

var closeWindow = function(e){
	$.register.close({
			curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
			opacity: 0,
			duration: 300
	});
};

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
	var ok_button = $.UI.create("Button", {classes:['button', 'wfill'], left: 10, right:10, title: "Done"});
	var cancel_button = $.UI.create("Button", {classes:['button',  'wfill'], left: 10, right:10, title: "Cancel"});
	var view_vert = $.UI.create("View", {classes:['wsize','hsize','vert']});
	cancel_button.addEventListener("click", function(){ 
		$.register.remove(view_container);
	});
	img_mask.addEventListener("click", function(){ 
		$.register.remove(view_container);
	});
	ok_button.addEventListener("click", function(){
		source.value = picker.value;
		var dd = picker.value.getDate();
		var mm = picker.value.getMonth()+1; 
		var yyyy = picker.value.getFullYear();
		source.value = yyyy+'-'+mm+'-'+dd;
		source.date = picker.value;
		source.children[0].text = yyyy+'-'+mm+'-'+dd;
		source.children[0].color = "#404041";
		$.register.remove(view_container);
	});
	
	view_container.add(img_mask);
	view_vert.add(picker);
	view_vert.add(ok_button);
	view_vert.add(cancel_button);
	view_container.add(view_vert);
	
	$.register.add(view_container);

}

function popStateDialogOption(e){
	var source = parent({name: "master", value: "1"}, e.source);
	var picker_list = [{name: "Kuala Lumpur"}, {name: "Johor"}, {name: "Kedah"}, {name: "Kelantan"}, {name: "Malacca"}, {name: "Negeri Sembilan"}, {name: "Pahang"}, {name: "Perak"}, {name: "Perlis"}, {name: "Penang"}, {name: "Sabah"}, {name: "Sarawak"}, {name: "Selangor"}, {name: "Terengganu"}];
	var options = _.pluck(picker_list, "name");
	options.push("Cancel");
	var dialog = Ti.UI.createOptionDialog({
	  cancel: options.length - 1,
	  options: options,
	  title: 'Category'
	});
	dialog.show();
	dialog.addEventListener("click", function(ex){   
		if(ex.index != options.length - 1){
			source.value = picker_list[ex.index].name;
			source.children[0].text = picker_list[ex.index].name;
			source.children[0].color = "#404041";
		}
	});
}

function popDialogOption(e){
	var source = parent({name: "master", value: "1"}, e.source);
	var picker_list = [{name: "Male", id: 1}, {name: "Female", id: 2}, {name: "Other", id: 3}];
	var options = _.pluck(picker_list, "name");
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
			source.children[0].text = picker_list[ex.index].name;
			source.children[0].color = "#404041";
		}
	});
}

/*********************
*** Event Listener ***
**********************/
$.confirm_password.addEventListener("return", function(){
	goSignUp();
});
/** close all register eventListener when close the page**/
$.register.addEventListener("close", function(){
    $.destroy();
    
    /* release function memory */
    isKeyboardFocus = null;
    goSignUp    = null;
    closeWindow = null;
});

$.register.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.register); 
});
