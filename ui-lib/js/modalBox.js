var ModalBox = Class.extend({
  init:function($obj_, options_){
    this._options = {
      width: 'auto',
      height: 'auto',
      left: 'auto',
      top: 'auto',
      overlay: true,
      iconClose: false,
      keyClose: true,
      bodyClose: true,
      iconImg: 'img/close.png',
      onOpen: function () {},
      onClose: function () {}
    }

    this._forbidClose = false;
    this._keydown = undefined;
    if (options_) {
      for(var key in options_)
      	  this._options[key] = options_[key];
    }; 

    this._obj = $obj_;
    this._width = this._obj.width();
    this._height = this._obj.height();
    this._widthOut = this._obj.outerWidth();
    this._heightOut = this._obj.outerHeight();
    this._winWidth = $(window).width();
    this._winHeight = $(window).height();
    this._setWidth = Math.min(this._widthOut, this._winWidth) - (this._widthOut - this._width);
    this._setHeight = Math.min(this._heightOut, this._winHeight) - (this._heightOut - this._height);

    this._obj.addClass('iw-modalBox');
    this.setOptions();
  },

  setOptions:function(){
    var _this = this;
    if (_this._options.width !== 'auto') {
      _this._obj.css('width', _this._options.width);
    } else {
      _this._obj.width(_this._setWidth);
    }
    if (_this._options.height !== 'auto') {
      _this._obj.css('height',_this._options.height);
    } else {
      _this._obj.height(_this._setHeight);
    }

    var top = '50%',
      left = '50%';
      marginLeft = _this._widthOut / 2;
      marginTop = _this._heightOut / 2;

    if (_this._options.left !== 'auto') {
    	left = _this._options.left;
    	marginLeft = 0;
    }
    if (_this._options.top !== 'auto') {
    	top = _this._options.top;
    	marginTop = 0;
    };

    this._obj.css({
      top: top,
      left: left,
      position: 'fixed',
      display: 'block',
      'margin-left': -marginLeft,
      'margin-top': -marginTop,
      'z-index': '99999'
    });

    if (_this._options.overlay) {
    	_this.addOverlay();
    };

    if (_this._options.iconClose) {
      if ((_this._widthOut < (_this._winWidth)) && (_this._heightOut < _this._winHeight)){
        var randId = Math.ceil(Math.random() * 1000) + 'close';
        var img = $('<img src="' + _this._options.iconImg + '" class="iw-closeImg" id="' + randId + '"/>');
        _this._obj.attr('closeImg',randId);
        img.bind('click',function(){
        	_this.close.call(_this);
        });
        $(window).bind('resize.iw-modalBox',{
          img: img,
          obj: _this._obj
        }, _this.resizeEvent);
        $(window).triggerHandler('resize.iw-modalBox');
        $('body').append(img);
      };
    };

    if (_this._options.keyClose) {
      _this.keyEvent();
    };

    if (_this._options.bodyClose) {
      var overlay = $('.iw-modalOverlay');
      if (overlay.length === 0) {
        addOverlay();
        overlay = $('.iw-modalOverlay');
        overlay.css({
          'background':'none'
        });
      };
      overlay.bind('mousedown',function(){
      	  _this.close.call(_this);
      });
    };

    _this._options.onOpen.call(this);
  },

  close:function(){
    var _this = this;
    if(_this._forbidClose){
      return 0;
    }
    if (_this._obj.hasClass('iw-modalBox')) {
      var imgId = _this._obj.attr('closeImg');
      if (imgId) {
        _this._obj.removeAttr('closeImg');
        $('#'+imgId).remove();
      };
      _this._obj.css({
      	  'display': 'none'
      })
      _this._obj.width(_this._width);
      _this._obj.height(_this._height);
      _this._options.onClose.call(_this);
      _this._obj.removeClass('iw-modalBox');
      if ($('.iw-modalBox').length === 0) {
      	  $('.iw-modalOverlay').remove();
      	  $(document).unbind('resize.iw-modalBox');
         $(document).unbind('keydown',_this._keydown);
      };
    };
  },

  keyEvent:function(){
    var _this = this;
    _this._keydown = function(e){
      var key = e.which;
      if(key === 27){
        _this.close.call(_this);
      }
    };
    $(document).bind('keydown',this._keydown);
  },
  
  addOverlay:function(){
    $('body').append('<div class="iw-modalOverlay"></div>');
    $('.iw-modalOverlay').css({
      display: 'block',
      width: '100%',
      height: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      'z-index': '1000'
    });
  },

  resizeEvent:function(e){
    var _img = e.data.img,
      _obj = e.data.obj;
    _img.css({
      top: (_obj.offset().top - $(window).scrollTop() - 8) + 'px',
      left: (_obj.offset().left - $(window).scrollTop() + _obj.width() - 8) + 'px',
      position: 'fixed',
      'z-index': '99999'
    });
  },

  forbidClose:function(isForbid_){
    this._forbidClose = isForbid_;
  }
});