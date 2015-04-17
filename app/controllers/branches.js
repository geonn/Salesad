var args = arguments[0] || {}; 

var m_id = args.m_id;
var from = args.from || "";
var nav = Alloy.Globals.navMenu;
var clickTime = null;

//load model
var m_library = Alloy.createCollection('merchants'); 
var b_library = Alloy.createCollection('branches'); 

//load merchant & branches list
var merchants = m_library.getMerchantsById(m_id);
var branches = b_library.getBranchesByMerchant(m_id);
 
/*** Display merchant info ***/
var mer_loc = merchants.state;
if(merchants.area != ""){
	mer_loc = merchants.area + ", "+merchants.state;
}

/**Set Custom title**/
var custom = Ti.UI.createLabel({ 
    text: merchants.name, 
    color: '#CE1D1C', 
    width: Ti.UI.SIZE 
 });

/** google analytics**/ 
Alloy.Globals.tracker.trackEvent({
	category: "merchants",
	action: "view",
	label: "branches",
	value: 1
}); 
Alloy.Globals.tracker.trackScreen({
	screenName: "Brancehes - " +merchants.name
});

$.branchesWin.titleControl = custom; 
$.merchantThumb.image = merchants.img;
$.merchantName.text = merchants.name;
$.merchantLocation.text = mer_loc;
$.merchantMobile.text = merchants.mobile;
$.merchantView.m_id = m_id;
$.merchantName.m_id = m_id;
$.merchantLocation.m_id = m_id;
$.merchantMobile.m_id = m_id;
$.merchantThumb.m_id = m_id;
$.merchantImageView.m_id = m_id;

/*** FUNCTIONS***/
var goToAds = function(e){
	// double click prevention
	var currentTime = new Date();
	if (currentTime - clickTime < 2000) {
		return;
	};
	clickTime = currentTime;
	var win = Alloy.createController("ad", {m_id: e.source.m_id, a_id: e.source.a_id}).getView(); 
	nav.openWindow(win,{animated:true}); 
};

/*** Display branches**/
var TheTable = Titanium.UI.createTableView({
	width:'100%',
	separatorColor: '#ffffff',
	backgroundColor: '#fffff6'
});


var data=[];

for (var i = 0; i < branches.length; i++) { 
	var row = Titanium.UI.createTableViewRow({
	    touchEnabled: true,
	    height: 65,
	    m_id: branches[i].m_id,
	    a_id: branches[i].b_id,
	    
	    selectedBackgroundColor: "#FFE1E1",
		backgroundGradient: {
	      type: 'linear',
	      colors: ['#FEFEFB','#F7F7F6'],
	      startPoint: {x:0,y:0},
	      endPoint:{x:0,y:65},
	      backFillStart:false},
	  });
	
	
	var branch_name = Titanium.UI.createLabel({
		text: branches[i].name,
		m_id: branches[i].m_id,
		a_id: branches[i].b_id,
		font:{fontSize:16,fontWeight:'bold'},
		color: "#848484",
		width:'auto',
		textAlign:'left',
		top:2,
		left:20,
		height:25
	});
	
	var str_loc = branches[i].state;
	if(branches[i].area != ""){
		str_loc = branches[i].area + ", "+branches[i].state;
	}
	var location =  Titanium.UI.createLabel({
		text:str_loc,
		m_id: branches[i].m_id,
		a_id: branches[i].b_id,
		font:{fontSize:12},
		width:'auto',
		color: "#848484",
		textAlign:'left',
		bottom:23,
		left:20,
		height:12
	});
	
	var mobile =  Titanium.UI.createLabel({
		text:branches[i].mobile,
		m_id: branches[i].m_id,
		a_id: branches[i].b_id,
		font:{fontSize:12},
		width:'auto',
		color: "#848484",
		textAlign:'left',
		bottom:5,
		left:20,
		height:12
	});
	
	var rightForwardBtn =  Titanium.UI.createImageView({
		image:"/images/btn-forward.png",
		width:20,
		height:20,
		right:25,
		top:20
		});			

	row.addEventListener('touchend', function(e) {
		goToAds(e);
	});
 
	
	row.add(branch_name);
 	row.add(location);
 	row.add(mobile);
 	row.add(rightForwardBtn);
	data.push(row);
};

TheTable.setData(data);
$.branchesView.add(TheTable);

/*********************
*** Event Listener ***
**********************/
$.btnBack.addEventListener('click', function(){ 
	nav.closeWindow($.branchesWin); 
}); 

$.branchesWin.addEventListener("close", function(){
	
    $.destroy();
    /* release function memory */
    TheTable = null;
    goToAds          = null;
    merchants          = null;
    branches         = null;
});