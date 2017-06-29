var FileLoader = require(WPATH('file_loader'));
var args = arguments[0] || {},
onError = null,
onDone = null,
isLoaded = false,
activity = null,
destroyed = false;
args = _.extend({
  'autoload': true,
  'gethires': false
}, args);

// convert children to args based on role
if (args.children) {

	_.each(args.children, function(child) {

		// fix: https://jira.appcelerator.org/browse/TC-3583
		if (!child) {
			return;
		}

		var role = child.role;

		if (role) {
			args[role] = child;
		}
	});
}

// delete irrelevant args
delete args.id;
delete args.__parentSymbol;
delete args.children;
applyProperties(args);

if( args.autoload ){
  load();
}

if( _.has(args,'activityindicator') && args.activityindicator ){
  activity = args.activityindicator;
  $.RemoteImage.add( activity );
}

//Launch garbage collection
gc();

function load(){

  var url = getImageURL( args.image );

  if( !url || isLoaded ){
  	$.ImageContainer.image = args.image;
    return;
  }

  if( activity ){
    activity.show();
  }

	FileLoader.download( url )
    .then(_display)
    .fail(_error)
    .done();

}


function _retry(e){

  e.cancelBubble = true;

  if( _.has(args,'loadingerror') ){
    $.RemoteImage.remove( args.loadingerror );
    args.loadingerror.removeEventListener('singletap',_retry);
  }

  load();

}


function _error( error ){

  if( destroyed ){
    return;
  }

  if( activity ){
    activity.hide();
  }

  Ti.API.error('Image Load Error: ' + error);

  if( _.has(args,'loadingerror') ){
    args.loadingerror.addEventListener('singletap',_retry);
    $.RemoteImage.add( args.loadingerror );
  }

	if( onError ){
		onError(error);
	}

}


function _display( file ){
	i_path = file.getFile();
  if( destroyed ){
    return;
  }

  if( activity ){
    activity.hide();
  }

	if( _.isObject(file) ){

    $.ImageContainer.image = file.getFile();
		$.ImageContainer.opacity = 1;

    isLoaded = true;

		if( onDone ){
			onDone();
		}

	}
	else{
		_error('Unable to find image');
	}

}


function applyProperties(properties) {
	console.log("default image"+properties.default_img);
	if(typeof properties.default_img != "undefined"){
		$.ImageContainer.setImage(properties.default_img);
	}		
  properties = properties || {};
  if( _.has(properties,'onDone') && _.isFunction( properties.onDone ) ){
    onDone = properties.onDone;
    delete args.onDone;
  }

  if( _.has(properties,'onError') && _.isFunction( properties.onError ) ){
    onError = properties.onError;
    delete args.onError;
  }

  var newImage = false;
  if( _.has(properties,'image') && properties.image != args.image ){
    newImage = true;
  }

  args = _.extend(args, properties);

  _applyOuterProperties(args);

  if( newImage && args.autoload ){
    isLoaded = false;
    load();
  }
  else if( !newImage && args.autoload ){
    if( onDone ){
      _.delay(onDone, 1000);
    }
  }

}


function _applyOuterProperties( properties ) {

  var apply = _.pick(properties,
    'width', 'height',
    'top', 'right', 'bottom', 'left', 'center',
    'backgroundColor', 'backgroundGradient', 'backgroundImage', 'backgroundLeftCap', 'backgroundTopCap', 'backgroundRepeat',
    'borderColor', 'borderWidth', 'borderRadius',
    'opacity', 'visible',
    'bubbleParent', 'zIndex'
  );

  if (_.size(apply)) {
    $.RemoteImage.applyProperties(apply);
  }

}


function getImage() {

  return args.image;

}


function setImage( image ) {

  args.image = image;
  isLoaded = false;
	load();

}
function setDefaultImg(image){
	$.ImageContainer.setImage(image);
}

function getImageCachePath(){

  return $.ImageContainer.image;

}

function ValidURL(str) {
  var pattern = new RegExp('^(https?:\/\/)?'+ // protocol
    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
    '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
    '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
    '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
    '(\#[-a-z\d_]*)?$','i'); // fragment locater
  if(!pattern.test(str)) {
    alert("Please enter a valid URL.");
    return false;
  } else {
    return true;
  }
}

function getImageURL( url ){

  if( !args.gethires ){
		return url;
	}
  
  var image = url;
  var basename = image.replace(/\\/g,'/').replace( /.*\//, '' );
  var segment = basename.split('.');

  // replace with hires filename
  return image.replace(basename, segment[0]+'@2x.'+segment[1]);

}


function gc(){

  FileLoader.gc();

}


function wipeCache(){

  FileLoader.gc(true);

}


function clean(){

  destroyed = true;

  if( _.has(args,'loadingerror') ){
    args.loadingerror.removeEventListener('singletap',_retry);
  }
  activity.hide();

  $.destroy();

}


Object.defineProperty($, "image", {
	get: getImage,
	set: setImage
});

exports.setImage = setImage;
exports.getImage = getImage;
exports.getImageCachePath = getImageCachePath;
exports.applyProperties = applyProperties;
exports.load = load;
exports.gc = gc;
exports.wipeCache = wipeCache;
exports.clean = clean;
exports.setDefaultImg = setDefaultImg;

// EVENTS
exports.on = exports.addEventListener = function(name, callback) {
	return $.RemoteImage.addEventListener(name, callback);
};

exports.off = exports.removeEventListener = function(name, callback) {
	return $.RemoteImage.removeEventListener(name, callback);
};

exports.trigger = exports.fireEvent = function(name, e) {
	return $.RemoteImage.fireEvent(name, e);
};
