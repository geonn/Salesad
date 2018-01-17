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
		str += '<meta name="viewport" content="initial-scale=1.0, width=device-width, minimum-scale=1.0, maximum-scale=2.0, user-scalable=no" />';
	 	str += '<script src="./jquery.min.jsf"></script>';
	 	str += '<script src="./jquery-barcode.jsf"></script>';
	 	str += '<script> ';
	 	str += 'var bCode="'+code+'"; ';
		str += '$(document).ready(function(){'; 
		str += '$("#barcode").barcode(bCode, "code128",{barWidth:1, barHeight:60});';
		str += 'var contentHeight = $( "div" ).height();';
		str += '$("html").css("height", contentHeight + 10);';
		str += ' $("body").css("height", contentHeight);';	 
		str += '});';
		
		str += '</script>'; 
		str += '</head>';
		str += '<body style="overflow: hidden;font-size:14px; font-family:arial;">';
		str += '<div id="barcode"style="height:80px; margin:0 auto; display:block" ></div>';   
		str += '</body>';
		str += '</html>'; 
		
		if (Ti.Platform.osname == 'iphone') {
			return Ti.UI.createWebView({ 
				html: str,
				width : 250,
				height: 80,  
			}) ;  
		}else{
			return Ti.UI.createWebView({ 
				html: str,
				//enableZoomControls : false,
				//overScrollMode : Titanium.UI.Android.OVER_SCROLL_IF_CONTENT_SCROLLS,
				width : 250,
				height: 80,
			}) ; 
		}
	
};
