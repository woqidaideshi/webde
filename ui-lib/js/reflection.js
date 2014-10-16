var Reflection = Class.extend({
  init:function(img_, options_){
    if (typeof img_ === 'undefined'|| img_.tagName !== 'img') {
      console.log('input img error');
      return ;
    };
   this._options{
      height : 0.5,
      opacity : 0.5
    };
    this._img = $(img_);

    if (options_) {
      for(var key in options_) {
       this._options[key] = options_[key];
      }
    };


  },

  add:function(){
    var _this = this;
    try{
    	  var _parentDiv = _this._img.parent('div');
    	  if (_parentDiv[0] !== null || _parentDiv.hasClass('reflect')) {
    	    _parentDiv = $('<div>', {
    	      'class': 'reflect'
    	    });

    	   	_this._img[0].parentNode.replaceChild(_parentDiv,_this._img[0]);
    	   	_parentDiv.append(_this._img);
    	  };

    	  //put img's css into img's parentDiv
    	  var _classes = _this._img[0].className.split(' '); 
    	  var _newClasses = '';
    	  for (var i = _classes.length - 1; i >= 0; i--) {
    	  	if(_classes[i] !== 'reflect'){
    	  		if (_newClasses) {
    	  			_newClasses += ' ';
    	  		};
    	  		_newClasses += _classes[i];
    	  	}
    	  };

    	  if (_newClasses) {
    	  	_parentDiv.addClass(_newClasses);
    	  };

    	  _parentDiv[0].style.cssText = _this._img[0].style.cssText;
    	  _this.style.cssText = 'vertical-align: bottom';

    	  var _reflectHeight = Math.floor(_this._img[0].height * _this._options['height']);
    	  var _reflectWidth = _this._img.width();

    	  if (document.all && !window.opera) {
    	    
    	    var _reflection = document.createElement('img');
    	    _reflection.src = _this._img[0].src;
    	    _reflection.style.width = _this._img.width() + 'px';
    	    _reflection.style.display = 'block';
    	    _reflection.style.height = _reflectHeight;

    	    _reflection.style.marginBottom = "-"+(p.height-reflectionHeight)+'px';
    	    _reflection.style.filter = 'flipv progid:DXImageTransform.Microsoft.Alpha(opacity='
    	        + (options['opacity']*100)
    	        + ', style=1, finishOpacity=0, startx=0, starty=0, finishx=0, finishy='
    	        + (options['height']*100)+')';
         
         _parentDiv.append(_reflection);
    	  } else {
    	    var _canvas = document.createElement('canvas');
    	    if (canvas.getContext) {
    	      var _context = _canvas.getContext('2d');

    	    	  _canvas.style.height = _reflectHeight;
    	      _canvas.style.width = _this._img.width() + 'px';
    	      _canvas.height = _reflectHeight;
    	      _canvas.width = _this._img.width();

    	      _parentDiv[0].style.width = _this._img.width() + 'px';
    	      _parentDiv[0].style.height = _this._img.height()+ _reflectHeight + 'px';

    	      _parentDiv.append(_canvas);
	
    	      _context.save();

    	      _context.translate(0,_this._img.height()-1);
    	      _context.scale(1,-1);
    	      
    	      _context.drawImage(image, 0, 0, _this._img.width(), _this._img.height());
    	      
    	      _context.restore();
    	      
    	      _context.globalCompositeOperation = "destination-out";
    	      var _gradient = _context.createLinearGradient(0, 0, 0, _reflectHeight);
    	      
    	      _gradient.addColorStop(1, "rgba(255, 255, 255, 1.0)");
    	      _gradient.addColorStop(0, "rgba(255, 255, 255, "+(1-options['opacity'])+")");
    	      
    	      _context.fillStyle = _gradient;
    	      _context.rect(0, 0, reflectionWidth, _reflectHeight*2);
    	      _context.fill();
    	    };
    	  }


    }
  }
  
  show:function(){

  }
});