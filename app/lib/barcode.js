var mainView = null;

exports.construct = function(mv){
	mainView = mv;
};
exports.deconstruct = function(){  
	mainView = null;
};


exports.generateBarcode = function(code){
	
	var str = '<html  style=" overflow: hidden;">';
		str += '<head>';
		str += '<meta name="viewport" content="user-scalable=0">';
	 	str += '<script src="./jquery.min.jsf"></script>';
	 	str += '<script src="./jquery-barcode.jsf"></script>';
	 	str += '<script> ';
	 	str += 'var bCode="'+code.trim()+'"; ';
		str += '$(document).ready(function(){'; 
		str += '$("#barcode").barcode(bCode, "ean13",{barWidth:2, barHeight:30});';
		str += 'var contentHeight = $( "div" ).height();';
		str += '$("html").css("height", contentHeight + 10);';
		str += ' $("body").css("height", contentHeight);';	 
		str += '});';
		
		str += '</script>'; 
		str += '</head>';
		str += '<body style="overflow: hidden;font-size:14px;display: flex;font-family:arial;">';
		str += '<div id="barcode"style="height:50px;" ></div>';   
		str += '</body>';
		str += '</html>'; 
		
		if (Ti.Platform.osname == 'iphone') {
			return Ti.UI.createWebView({ 
				html: str,
				width : 250,
				height: 50,  
			}) ;  
		}else{
			return Ti.UI.createWebView({ 
				html: str,
				enableZoomControls : false,
				overScrollMode : Titanium.UI.Android.OVER_SCROLL_IF_CONTENT_SCROLLS,
				width : 250,
				height: 50,
			}) ; 
		}
	
};
