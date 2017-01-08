var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];
var cell_width;

function navTo(e){
	var e_id = parent({name: "e_id"}, e.source);
	console.log(e_id+" ez");
	if(e_id == 3){
		var win = Alloy.createController("ad", {a_id: 315}).getView(); 
		COMMON.openWindow(win); 
	}else{
		var win = Alloy.createController("express_detail", {e_id: e_id}).getView(); 
		COMMON.openWindow(win); 
	}
}

var start = 0;
//var anchor = COMMON.	

function getPreviousData(param){ 
	start = parseInt(start);
	var model = Alloy.createCollection("helpline");
	data = model.getData(false, start, anchor);
	var estimate_time = Ti.App.Properties.getString('estimate_time');
	console.log(estimate_time+" estimate time");
	console.log(data);
	last_id = (data.length > 0)?_.first(data)['id']:last_id;
	last_uid = (data.length > 0)?_.first(data)['sender_id']:last_uid;
	console.log(last_id+" why");
	if(estimate_time != "0"){
		$.estimate.text = "Our support will serve you soon. Estimate "+estimate_time+" minute left";
		$.estimate.parent.show();
	}else{
		$.estimate.parent.hide();
	}
	render_conversation(false);
	start = start + 10;
	if(typeof param.firsttime != "undefined"){ 
		setTimeout(function(e){scrollToBottom();}, 500);
	}else{
		if(OS_IOS){
			$.chatroom.setContentOffset({y: 1000}, {animated: false});
		} 
	}
 
}	
	
function refresh(){
	API.callByPost({
		url: "getSXItem",
		new: true
	}, 
	{
		onload: function(responseText){
			var res = JSON.parse(responseText);
			var arr = res.data || null;
			console.log('yes!!!onload');
		},
		onerror: function(err){
			console.log("onerror here!!!");
			_.isString(err.message) && alert(err.message);
		},
		onexception: function(){
			COMMON.closeWindow($.win);
		}
	});
}	

function render(){
	var pwidth = Titanium.Platform.displayCaps.platformWidth;
	if(OS_ANDROID){
		cell_width = Math.floor((pixelToDp(pwidth) / 2)) - 15;
	}else{
		cell_width = Math.floor(pwidth / 2) - 15;
	}
	console.log(cell_width);
	var child = $.content.getChildren();
	for (var i=0; i < child.length; i++) {
		if(child[i].e_id != 3){
			child[i].width = cell_width;
		}
	};
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	refresh();
}

// convert pixel to dp.
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160))+'dp';
}

init();

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 