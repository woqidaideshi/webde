//this ui is for reflection for img
var Reflection = Class.extend({
  /**
   * [init init reflection]
   * @param  {[js obj]} img_     [img]
   * @param  {[json]} options_ [include: height ratio and opacity ratio]
   * @return {[type]}          [description]
   */
  init:function(img_, options_){
    if (typeof img_ === 'undefined'|| img_.tagName !== 'IMG') {
      console.log('input img error');
      return ;
    };
   this._options = {
      height : 0.5,
      opacity : 0.5,
      hasParentDiv: false
    };
    this._img = $(img_);

    if (options_) {
      for(var key in options_) {
       this._options[key] = options_[key];
      }
    };
  },

  /**
   * [add add reflection follow this._img and this._options]
   */
  add:function(){
    var _this = this;
    try{
    	  var _parentDiv = _this._img.parent('div');
    	  if (_this._options.hasParentDiv === false || typeof _parentDiv[0] === 'undefined' ) {
    	    _parentDiv = $('<div>', {
    	      'class': 'reflect'
    	    });
    	    _this._img[0].parentNode.replaceChild(_parentDiv[0], _this._img[0]);
    	    _parentDiv.append(_this._img);

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
    	  }else{
    	    if (!_parentDiv.hasClass('reflect')){
    	    	  _parentDiv.addClass('reflect');
    	    } ;
    	  }
    	  //put img's css into img's parentDiv
    	  //_parentDiv[0].style.cssText = _this._img[0].style.cssText;
    	  _parentDiv[0].style.width = _this._img[0].style.width;
    	  //set vertical align
    	  _this._img[0].style.cssText = 'vertical-align: bottom';
    	  //set reflect height and reflect width
    	  var _reflectHeight = Math.floor(_this._img[0].height * _this._options['height']);
    	  var _reflectWidth = _this._img.width();
    	  //if ie 
    	  if (document.all && !window.opera) {
    	    var _reflection = document.createElement('img');
    	    _reflection.src = _this._img[0].src;
    	    _reflection.style.width = _this._img.width() + 'px';
    	    _reflection.style.display = 'inline-block';
    	    _reflection.style.height = _reflectHeight;
    	    _reflection.style.marginBottom = "-"+(p.height-reflectionHeight)+'px';
    	    _reflection.style.filter = 'flipv progid:DXImageTransform.Microsoft.Alpha(opacity='
    	        + (options['opacity']*100)
    	        + ', style=1, finishOpacity=0, startx=0, starty=0, finishx=0, finishy='
    	        + (options['height']*100)+')';
         _parentDiv.append(_reflection);
    	  } else {
    	    var _canvas = document.createElement('canvas');
    	    if (_canvas.getContext) {
    	      var _context = _canvas.getContext('2d');
    	    	  _canvas.style.height = _reflectHeight + 'px';
    	      _canvas.style.width = _this._img.width() + 'px';
    	      _canvas.height = _reflectHeight;
    	      _canvas.width = _this._img.width();
    	      _parentDiv[0].style.width = _reflectWidth + 'px';
    	      //_parentDiv[0].style.height = _this._img.height()+ _reflectHeight + 'px';
    	      _parentDiv.append(_canvas);
    	      _context.save();
    	      _context.translate(0,_this._img.height()-1);
    	      _context.scale(1,-1);
    	      _context.drawImage(_this._img[0], 0, 0, _this._img.width(), _this._img.height());
    	      _context.restore();
    	      _context.globalCompositeOperation = "destination-out";
    	      var _gradient = _context.createLinearGradient(0, 0, 0, _reflectHeight);
    	      _gradient.addColorStop(1, "rgba(255, 255, 255, 1.0)");
    	      _gradient.addColorStop(0, "rgba(255, 255, 255, "+(1-_this._options['opacity'])+")");
    	 
    	      _context.fillStyle = _gradient;
    	      _context.rect(0, 0, _reflectWidth, _reflectHeight*2);
    	      _context.fill();
    	    };
    	  }
    }catch (e){
    	  console.log(e);
    }
  },

  /**
   * [remove remove reflect]
   * @return {[type]} [description]
   */
  remove:function(){
    var _this = this;
    var _parentDiv = $(_this._img[0].parentNode);
    _parentDiv.removeClass('reflect');
    if (document.all && !window.opera) {
    	  var _imgs = _parentDiv.children('div');
    	  _imgs.style.cssText = '';
    	  if (typeof _imgs[1] !== 'undefined') {
    	    _imgs[1].remove();
    	  }
    }else{
    	 var _canvas = _parentDiv.children('canvas');
    	 if (typeof _canvas !== 'undefined') {
    	 	_canvas.remove();
    	 };
    }
  }
});