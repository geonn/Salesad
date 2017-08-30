// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

var _ = require('underscore')._;
Alloy.Globals.Map =  (OS_IOS || OS_ANDROID) ? require('ti.map') : Ti.Map;

 
Alloy.Globals.naviPath = [];
/** include required file**/
var API = require('api');
var COMMON = require('common'); 
var PUSH = require('push');
var DBVersionControl = require('DBVersionControl');

var last_update_on = true;
DBVersionControl.checkAndUpdate();
var isNotification = Ti.App.Properties.getString('notification'); 
if(isNotification === null){
	Ti.App.Properties.setString('notification', "1");
}

/***Facebook Library***/ 
var FACEBOOK = require('facebook');
FACEBOOK.appid = "1593197804284763";
FACEBOOK.permissions = ['email','public_profile','user_friends']; // Permissions your app needs
FACEBOOK.initialize(1000); 
FACEBOOK.forceDialogAuth = true; 

if(Ti.Platform.osname != "android"){
	Titanium.UI.iPhone.setAppBadge("0");
}
function shuffle(array) {
  var tmp, current, top = array.length;
  if(top) while(--top) {
    current = Math.floor(Math.random() * (top + 1));
    tmp = array[current];
    array[current] = array[top];
    array[top] = tmp;
  }
  return array;
}

function datedescription(from,to) {
	var dateDescription = convertToHumanFormat(from)+" - "+convertToHumanFormat(to);
	if(from == "0000-00-00" && to =="0000-00-00"){
		dateDescription = "Start from now!";
	}else if(from == "0000-00-00" &&to !="0000-00-00"){
		dateDescription = "Until "+convertToHumanFormat(to)+"!";
	}else if(from != "0000-00-00" && to =="0000-00-00"){
		dateDescription = "Start from "+convertToHumanFormat(from)+"!";
	}
	return dateDescription;
}
function pixelToDp(px) {
    return ( parseInt(px) / (Titanium.Platform.displayCaps.dpi / 160));				
}
var Utils = {
  /* modified version of https://gist.github.com/1243697 */
  _getExtension: function(fn) {
    // from http://stackoverflow.com/a/680982/292947
    var re = /(?:\.([^.]+))?$/;
    var tmpext = re.exec(fn)[1];
    return (tmpext) ? tmpext : '';
  },
  RemoteImage: function(a){
    a = a || {};
     a.defaultImage = "";
    var md5;
    var needsToSave = false;
    var savedFile;
    if(a.image){
      md5 = Ti.Utils.md5HexDigest(a.image)+this._getExtension(a.image);
      savedFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,md5);
      if(savedFile.exists()){
        a.image = savedFile;
      } else {
        needsToSave = true;
      }
    }
    var image = Ti.UI.createImageView(a);
    if(needsToSave === true){
      function saveImage(e){
        image.removeEventListener('load',saveImage);
        savedFile.write(
          Ti.UI.createImageView({image:image.image,width:'auto',height:'auto'}).toImage()
        );
      }
      image.addEventListener('load',saveImage);
    }
    return image;
  },
  RemoteImage2: function(a){
	var activityIndicator = Ti.UI.createActivityIndicator({
	  color: 'green',
	  style: Ti.UI.ActivityIndicatorStyle.DARK,
	  top:10,
	  left:10,
	  height:Ti.UI.SIZE,
	  width:Ti.UI.SIZE,
	  zIndex: 11,
	});
	var view = Ti.UI.createView({
		width: Ti.UI.FILL, 
		height:Ti.UI.FILL,
		backgroundColor: "#eae7e1"
	});
	view.add(activityIndicator);
    a = a || {};
    a.defaultImage = "";
    var md5;
    var needsToSave = false;
    var savedFile;
    if(a.image){
      md5 = Ti.Utils.md5HexDigest(a.image)+this._getExtension(a.image);
      savedFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,md5);
      if(savedFile.exists()){
        a.image = savedFile;
        view.backgroundColor = "";
        activityIndicator.hide();
      } else {
      	activityIndicator.show();
        needsToSave = true;
      }
    }
    var image = Ti.UI.createImageView(a);
    view.add(image);
    if(needsToSave === true){
      function saveImage(e){
        image.removeEventListener('load',saveImage);
        image.getParent().children[0].hide();
        image.getParent().backgroundColor = "";
        savedFile.write(
          Ti.UI.createImageView({image:image.image,width:'auto',height:'auto'}).toImage()
        );
      }
      image.addEventListener('load',saveImage);
    }
    return view;
  }
};
 
function PixelsToDPUnits(ThePixels){
  return (ThePixels / (Titanium.Platform.displayCaps.dpi / 160));
}

function DPUnitsToPixels(TheDPUnits){
  return (TheDPUnits * (Titanium.Platform.displayCaps.dpi / 160));
}

function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}

function currentDateTime(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();
	
	var hours = today.getHours();
	var minutes = today.getMinutes();
	var sec = today.getSeconds();
	if (minutes < 10){
		minutes = "0" + minutes;
	} 
	if (sec < 10){
		sec = "0" + sec;
	} 
	if(dd<10) {
	    dd='0'+dd;
	} 
	
	if(mm<10) {
	    mm='0'+mm;
	} 
	
	datetime = yyyy+'-'+mm+'-'+dd + " "+ hours+":"+minutes+":"+sec;
	return datetime ;
}

global_url = "";
if (OS_ANDROID) {
    // Somehow, only in alloy.js we can get the data (URL) that opened the app
    global_url = Ti.Android.currentActivity.intent.data;
}

function parent(key, e){
	// if key.value undefined mean it look for key only
	console.log(typeof key.value);
	console.log(key.value);
	if(typeof key.value != "undefined"){
		
		if(eval("e."+key.name+"") != key.value){
			console.log(e.parent);
			if(eval("e.parent."+key.name+"") != key.value){
				console.log(e.parent.parent);
				if(eval("e.parent.parent."+key.name+"") != key.value){
	    			console.log(e.parent.parent);
	    			if(eval("e.parent.parent.parent."+key.name+"") != key.value){
	    				console.log(e.parent.parent.parent);
	    				if(eval("e.parent.parent.parent.parent."+key.name+"") != key.value){
	    					console.log(e.parent.parent.parent.parent);
		    				console.log("box not found");
			    		}else{
			    			return e.parent.parent.parent.parent;
			    		}
		    		}else{
		    			return e.parent.parent.parent;
		    		}
	    		}else{
	    			return e.parent.parent;
	    		}
	    	}else{
	    		return e.parent;
	    	}
	    }else{
	    		return e;
	    }
	}else{
		if(eval("typeof e."+key.name) == "undefined"){
			if(eval("typeof e.parent."+key.name+"") == "undefined"){
				if(eval("typeof e.parent.parent."+key.name+"") == "undefined"){
	    			if(eval("typeof e.parent.parent.parent."+key.name+"") == "undefined"){
		    			console.log("box not found");
		    		}else{
		    			return eval("e.parent.parent.parent."+key.name);
		    		}
	    		}else{
	    			return eval("e.parent.parent."+key.name);
	    		}
	    	}else{
	    		return eval("e.parent."+key.name);
	    	}
	    }else{
	    		return eval("e."+key.name);
	    }
	}
}

function children(key, e){
	console.log("find children");
	console.log(key);
	console.log(e);
	
	if(eval("e."+key.name+"") != key.value){
		for (var i=0; i < e.children.length; i++) {
			if(eval("e.children[i]."+key.name+"") == key.value){
		  		return e.children[i];
		 	}
		 	console.log(e.children[i].zIndex);
			for (var a=0; a < e.children[i].children.length; a++) {
			  if(eval("e.children[i].children[a]."+key.name+"") == key.value){
			  	return e.children[i].children[a];
			  }
			  console.log(e.children[i].children[a].zIndex);
			  for (var c=0; c < e.children[i].children[a].children.length; c++) {
			  	  console.log(e.children[i].children[a].children[c].zIndex);
				  if(eval("e.children[i].children[a].children[c]."+key.name+"") == key.value){
				  	return e.children[i].children[a].children[c];
				  }
				};
			};
		};
    }else{
		return e;
    }
}

function convertToHumanFormat(datetime){
	if(datetime == null){return "";}
	var timeStamp = datetime.split("-");
	return timeStamp[2]+"-"+timeStamp[1]+"-"+timeStamp[0];
}

function convertToDBDateFormat(datetime){
	var timeStamp = datetime.split(" ");  
	var newFormat;
	 
	var date = timeStamp[0].split("/");  
	if(timeStamp.length == 1){
		newFormat = date[2]+"-"+date[1]+"-"+date[0] ;
	}else{
		var time = timeStamp[1].split(":");
		var hour = (timeStamp[2] == "pm")?12 + parseInt(time[0]):time[0];
		var min = time[1] || "00";
		var sec = time[2] || "00";
		
		newFormat = date[2]+"-"+date[1]+"-"+date[0] + " "+hour+":"+min+":"+sec;
	}
	
	return newFormat;
}