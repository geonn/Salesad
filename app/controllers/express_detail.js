var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var data;
var loading = Alloy.createController("loading");
var random_color = ['#9ccdce', "#8fd8a0", "#ccd993", "#dccf95", "#da94a1", "#d18fd9"];

function render_page(){
	$.img.image = args.img_path;
	$.xpress_date.text = args.sales_from+" - "+args.sales_to;
	$.xpress_location.text = args.address;
	$.desc.text = args.description;
	$.owner_name.text = args.owner_name;
	$.category.text = args.categoryName;
	$.owner_img_path.image = args.owner_img_path;
}

function refresh(){
	render_page();
	loading.finish();
}

function init(){
	$.win.add(loading.getView());
	loading.start();
	refresh();
}

init();


function popMoreMenu(){
	var picker_list = [{text: 'Report This Ad'}];
	var options = _.pluck(picker_list, "text");
	options.push("Cancel");
	var dialog = Ti.UI.createOptionDialog({
	  cancel: options.length - 1,
	  options: options,
	  title: 'Report'
	});
	dialog.show();
	dialog.addEventListener("click", function(ex){   
		if(ex.index == 0){
			popReport();
		}
	});
}

function popReport(){
	var view = $.UI.create("View", {classes:['wfill','hsize','vert', 'padding', "rounded", "box"], backgroundColor:"#ffffff"});
	var label = $.UI.create("Label", {classes: ['wsize','hsize', 'padding', 'h4'], color: "#000000", text: "Report"});
	var hr = $.UI.create("View", {classes:['hr'], backgroundColor:"#cccccc"});
	var picker_list = [{title: 'This is not a SalesAd'}, {title: 'This Ad is seriously offensive (Sexually explicit, violent, dangerous, hate speech, harassment or bullying)'}, {title: 'This Ad contains incorrect or misleading information'}, {title: 'Others (Please specify)'}, {title:  'Cancel'}];
	var arr = [];
	for (var i=0; i < picker_list.length; i++) {
		var row = $.UI.create("TableViewRow", {error_msg: picker_list[i].title});
		var l = $.UI.create("Label", {classes:['wfill','hsize','padding'], text: picker_list[i].title});
	  	row.add(l);
	  	arr.push(row);
	};
	
	var table = $.UI.create("TableView", {
	  classes:['wfill', "rounded", "hsize", "conthsize"],
	  data: arr,
	  zIndex: 50
	});
	view.add(label);
	view.add(hr);
	view.add(table);
	$.win.add(view);
	table.addEventListener("click", function(e){
		if(e.index != arr.length - 1){
			COMMON.createAlert("Confirmation", "Are you sure you want to report this Ad for the reason below? \n\n"+e.rowData.error_msg, function(){
				submit_report({report_msg: e.rowData.error_msg});
			}, "Yes");
		}
		$.win.remove(view);
	});
}

function submit_report(e){
	loading.start();
	var report_msg = (typeof e.report_msg != "undefined")?e.report_msg:"";
	API.callByPost({url: "submitReportAds", new:true, params:{u_id: u_id, remark: report_msg, category: 2, item_id: args.id}}, {onload: function(responseText){
		var res = JSON.parse(responseText);
		if(res.status == "success"){
			alert("Report Submitted");
		}
		loading.finish();
	}});
}

function getDirection(){
	var win = Alloy.createController("express_direction", args).getView(); 
	COMMON.openWindow(win); 
}

function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));
}

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
}); 

$.win.addEventListener('android:back', function (e) {
 COMMON.closeWindow($.win); 
});
