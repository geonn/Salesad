var args = arguments[0] || {};
var user = Ti.App.Properties.getString('u_id');
var library = Alloy.createCollection('userState'); 
var details = library.getUserState(user);

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "account",
	action: "view",
	label: "favourite state",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Favourite State"
});
var geo =[];
details.forEach(function(entry) {
	geo.push(entry.state);
});

/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: 'Select Favourite State', 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });
   
if(Ti.Platform.osname == "android"){ 
	$.pageTitle.add(custom);   
}else{
	$.favouriteState.titleControl = custom; 
}  
							
//Draw state table
var stateArr = [
	{ key:'jh',name:'table_jh',  title:"Johor", hasCheck:false },
	{ key:'kd', name:"table_kd", title:"Kedah", hasCheck:false },
	{ key:'kt',  name:"table_kt", title:"Kelantan", hasCheck:false },
	{ key:'kl',  name:"table_kl", title:"Kuala Lumpur", hasCheck:false },
	{ key:'ml',  name:"table_ml", title:"Melacca", hasCheck:false },
	{ key:'ns',  name:"table_ns", title:"Negeri Sembilan", hasCheck:false },
	{ key:'ph',  name:"table_ph", title:"Pahang", hasCheck:false },
	{ key:'pn',  name:"table_pn", title:"Penang", hasCheck:false },
	{ key:'pr',  name:"table_pr", title:"Perak", hasCheck:false },
	{ key:'pl',  name:"table_pl", title:"Perlis", hasCheck:false },
	{ key:'sb',  name:"table_sb", title:"Sabah", hasCheck:false },
	{ key:'sr',  name:"table_sr", title:"Sarawak", hasCheck:false },
	{ key:'sl',  name:"table_sl", title:"Selangor", hasCheck:false },
	{ key:'tr',  name:"table_tr", title:"Terengganu", hasCheck:false },
];
var TheTable = Titanium.UI.createTableView({
		width:'100%',
		separatorColor: '#ffffff',
		backgroundColor: '#fffff6',
	});
	
var stateData=[];
for (var j=0; j< stateArr.length; j++) {
   var isCheck = geo.indexOf(stateArr[j].key);
   
   var isSel = stateArr[j].hasCheck;
   if(isCheck >= 0){
   	isSel = true;
   }
   
   var stateRow = Titanium.UI.createTableViewRow({
	    touchEnabled: true,
	    titles: stateArr[j].title,  
	    key: stateArr[j].key,  
		name: stateArr[j].name, 
		haveCheck:  isSel, 
	    height: 50, 
	    id: stateArr[j].key, 
	    selectedBackgroundColor: "#FFE1E1",
		backgroundGradient: {
	      type: 'linear',
	      colors: ['#FEFEFB','#F7F7F6'],
	      startPoint: {x:0,y:0},
	      endPoint:{x:0,y:50},
	      backFillStart:false},
	  });
	
	
	var title = Titanium.UI.createLabel({
		text: stateArr[j].title,  
		
		font:{fontSize:16 },
		color: "#848484",
		width:'auto',
		textAlign:'left',
		top:15,
		left:20,
		height:25
	});
	

	if(isCheck >= 0){
		var rightRegBtn =  Titanium.UI.createImageView({
			image:"/images/icon-favorites.png",
			id: "selected_"+stateArr[j].key, 
			width:15,
			height:15,
			right:20,
			top:20
		});	
	}else{
		var rightRegBtn =  Titanium.UI.createImageView({
			image:"",
			id: "selected_"+stateArr[j].key, 
			width:15,
			height:15,
			right:20,
			top:20
		});	
	}		
	
	//add events listener	
	stateRow.addEventListener('click', function(e){
		var row = e.row;
		var selected = e.source;
		//console.log(selected.key + "=="+ selected.name +"=="+selected.titles+"=="+row.haveCheck);
		//return;
	 	if((row.haveCheck == "0") || (row.haveCheck == "false")) {
	 		row.haveCheck = true;
	 		var favourite = Alloy.createModel('userState', {
				u_id    : Ti.App.Properties.getString('u_id'),
				state   : selected.key,
				stateName    : selected.titles
			});
			
			favourite.save();
			e.row.children[1].image = '/images/icon-favorites.png';
	    }else  {
	    	row.haveCheck = false;
	    	var favourite = Alloy.createCollection('userState'); 
	    	favourite.removeState(Ti.App.Properties.getString('u_id'),selected.key);
	    	e.row.children[1].image ="";
	    }
	});
	stateRow.add(title);
	stateRow.add(rightRegBtn);
	stateData.push(stateRow);
}
	
TheTable.setData(stateData);
$.favouriteStateView.main.add(TheTable);

//Draw end
$.btnBack.addEventListener('click', function(){  
	COMMON.closeWindow($.favouriteState); 
}); 

$.favouriteState.addEventListener("close", function(){
    $.destroy();
    
    /* release function memory */
    tableState 		  = null;
    rows          	  = null;
    attribute         = null;
    loadSelectedState = null;
});
