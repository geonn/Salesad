// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

function init(){
	refresh();
}

init();

function refresh(){
	var u_id = Ti.App.Properties.getString('u_id') || "";
	var checker = Alloy.createCollection('updateChecker'); 
	var isUpdate = checker.getCheckerById("13");
	API.callByPost({
		url: "getNotificationByUser",
		new: true,
		params: {u_id: u_id, last_updated: isUpdate.updated},
	},{onload: function(responseText){
		var model = Alloy.createCollection('notification');
		var res = JSON.parse(responseText);
		model.saveArray(res.data);
		checker.updateModule(13, "getNotificationByUser", res.last_updated);
		console.log("success call api");
		render_list();
	}});
	
}

function render_list(){
	var u_id = Ti.App.Properties.getString('u_id') || "";
	var model = Alloy.createCollection('notification');
	var data = model.getList({u_id: u_id});
	var items = [];
	for (var i=0; i < data.length; i++) {
		items.push({properties :{title: data[i].subject, record: data[i]}});
	};
	console.log(items);
	$.listsection.setItems(items);
}

function navTo(e){
	var item = e.section.getItemAt(e.itemIndex);
	item = item.properties;
	var model = Alloy.createCollection('notification');
	model.setIdAsRead({id: item.record.id});
	console.log(item);
	if(item.record.target != ""){
		COMMON.openWindow(Alloy.createController(item.record.target, item.record.extra || {}).getView()); 
	}
}

function closeWindow(){
	COMMON.closeWindow($.win); 
}

$.win.addEventListener('android:back', function (e) {
	closeWindow();
});

$.btnBack.addEventListener('click', closeWindow); 

$.win.addEventListener("close", function(){
	Ti.App.fireEvent("updateNotificationNumber");
});
