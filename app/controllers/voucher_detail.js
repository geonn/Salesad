var args = arguments[0] || {};
var u_id = Ti.App.Properties.getString('u_id') || "";
var turn = 1;

$.win.addEventListener('android:back', function (e) {
	COMMON.closeWindow($.win); 
});

$.btnBack.addEventListener('click', function(){ 
	COMMON.closeWindow($.win);
});

function htr_extend(){
	if(turn == 1){
		$.htr_image.image = "/images/btn-forward2.png";
		var htr = $.UI.create("Label",{
			classes:['wfill','hsize','padding'],
			top:0,
			text:"How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem How to redeem ",
		});
		$.htr.add(htr);
		turn = 0;
		console.log(turn);
	}else if(turn == 0){
		$.htr.removeAllChildren();
		$.htr_image.image = "/images/btn-forward1.png";
		turn = 1;
		console.log(turn);
	}	
}