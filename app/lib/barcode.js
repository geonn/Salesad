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
	 	str += '<script src="jquery.min.js"></script>';
	 	str += '<script src="jquery-barcode.js"></script>';
	 	str += '<script> ';
	 	str += 'var bCode="'+code.trim()+'"; ';
		str += '$(document).ready(function(){'; 
		str += '$("#barcode").barcode(bCode, "ean13");';
		str += 'var contentHeight = $( "div" ).height();';
		str += '$("html").css("height", contentHeight + 10);';
		str += ' $("body").css("height", contentHeight);';	 
		str += '});';
		
		str += '</script>'; 
		str += '</head>';
		str += '<body style="overflow: hidden;font-size:14px;display: flex;font-family:arial;">';
		str += '<div id="barcode" ></div>';   
		str += '</body>';
		str += '</html>'; 
	return Ti.UI.createWebView({ 
			html: str,
			width : 250,
			height: Ti.UI.SIZE,  
		}) ; 
};
