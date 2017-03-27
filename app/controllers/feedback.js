var args = arguments[0] || {};
var id = 0;
var loading = Alloy.createController("loading");
//load model

function clearHintText(e){
	if(e.source.value == e.source._hintText){
        e.source.value = "";
    }
}

function setHintText(e){
	if(e.source.value==""){
        e.source.value = e.source._hintText;
    }
}

function submit(){
	var form = $.inner_box.getChildren();
	var params = {};
	for (var i=0; i < form.length; i++) {
		if(form[i].required){
			if(form[i].value == ""){
				alert(form[i].id+" cannot be empty");
				return ;
			}
		}
		eval("_.extend(params, {"+form[i].id+": form[i].value})");
	};
	API.callByPost({url: "sendFeedback", params:params}, {onload: function(responseText){
		var res = JSON.parse(responseText);
		if(res.status == "success"){
			COMMON.createAlert("Notification", "Successfully", windowClose);
		}else{
			COMMON.createAlert("Notification", res.data);
		}
	}});
}

function windowClose(){
	$.win.close();
}

function init(){
	$.win.add(loading.getView());
	loading.start();
}

init();

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener("close", function (e){
	
});

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
