var args = arguments[0] || {};
var loading = Alloy.createController("loading");
var current_tab = "point";

function switchListing(e){
	var tab = parent({name: "tab"}, e.source);
	var text = children({name: "v", value:"label"}, $.firstTab);
	var secondtext = children({name: "v", value:"label"}, $.secondTab);
	
	if(tab == 1){
		current_tab = "point";
		//$.firstTab.backgroundColor = "#75d0cb";
		text.color = "#ffffff";
		$.firstTab.backgroundColor = "#484848";
		$.secondTab.backgroundColor = "transparent";
		secondtext.color = "#484848";
		$.point.show();
		$.reward.hide();
	}else if(tab == 2){
		current_tab = "reward";
		//$.secondTab.backgroundColor = "#75d0cb";
		secondtext.color = "#ffffff";
		$.firstTab.backgroundColor = "transparent";
		$.secondTab.backgroundColor = "#484848";
		text.color = "#484848";
		$.point.hide();
		$.reward.show();
	}
	//refresh();
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	setTimeout(function(e){$.horz_reward_list.scrollTo(50,0);}, 500);
	$.reward.hide();
}

init();

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
