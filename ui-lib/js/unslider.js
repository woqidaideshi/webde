var Unslider = Class.extend({
  init:function($obj_, options_){
    this._obj = $obj_;
    this._options = {
      speed: false,
      delay: 3000,
      complete: false,
      begin:false,
      keys: true,
      dots: false,
      fluid: false
    };
    this._sizes = [],
    this._max = [this._obj.outerWidth(),this._obj.outerHeight()],
    this._current = 0;
    this._interval = false;

    if (options_) {
      for(var key in options_) {
        this._options[key] = options_[key];
      }
    };
    this._ul = this._obj.children('ul');
    this._items = this._ul.children('li');
    this.calculate();

    this.setup();
  },

  calculate: function(){
    var _this = this;
    for (var i = 0; i < _this._items.length; i++) {
      var width = $(_this._items[i]).outerWidth();
      var height = $(_this._items[i]).outerHeight();
      _this._sizes[i] = [width,height];
      if (width > _this._max[0]) {_this._max[0] = width};
      if (height > _this._max[1]) {_this._max[1] = height};
    }
  },

  setup:function(){
    var _this = this;
    this._obj.css({
      overflow: 'hidden',
      width: '100%',
      height: '100%'
    });

    _this._ul.css({
      width: (_this._items.length * 100) + '%',
      height:'100%',
      position: 'relative'
    });
    _this._items.css({
      width: (100 / _this._items.length)+'%',
      height:'100%'
    })
    if (this._options.delay !== false) {
      _this.start();
      _this._obj.hover(function(){
        _this.stop(_this);
      },function(){
        _this.start(_this);
      });
    };
    _this._options.keys && _this.keys();
    _this._options.dots && _this.dots();

    if (this._options.fluid) {
      var resize = function(){
        _this._obj.css('width',Math.min(Math.round((_this._obj.outerWidth() / _this._obj.parent().outerWidth()) * 100), 100) + '%');
      };
      resize();
      $(window).resize(resize);
    }

    if (window.jQuery.event.swipe) {
      _this._obj.on('swipeleft', _this.prev)
        .on('swiperight',_this.next);
    }
  },

  move:function(index_, cb_){
    var _this = this;
    if (!_this._items.eq(index_).length) {index_ = 0};
    if (index_ < 0) { index_ = (_this._items.length -1 ) };
    var _target = _this._items.eq(index_);
    var _hobj = {height: '100%'};
    var speed = cb_ ? 5 :_this._options.speed;
    if(_this._options.begin){
      _this._options.begin(index_);
    }
    if (!this._ul.is(':animated')) {
      _this._obj.find('.dot:eq(' + index_ + ')').addClass('active').siblings().removeClass('active');
      _this._obj.animate(_hobj, speed);
      _this._ul.animate({left: '-' + index_ + '00%', height: '100%'}, speed, function(data){
        _this._current = index_;
        if (_this._options.complete) {
          _this._options.complete(index_);
        };
      });
    };
  },

  start:function(this_){
    var _this = this;
    if (this_) {
      _this = this_;
    };
    _this._interval = setInterval(function(){
      _this.move(_this._current +1);
    }, _this._options.delay);
  },

  stop:function(this_){
    var _this = this;
    if (this_) {
      _this = this_;
    };
    _this._interval = clearInterval(_this._interval);
  },

  keys:function(){
    var _this = this ;
    $(document).keydown(function(e){
      var key = e.which;
      switch(key){
        case 39: _this.next();
            break;
        case 37: _this.prev();
            break;
        case 27: _this.stop();
            break; 
      }
    });
  },

  next:function(){
    var _this = this;
    _this.stop();
    _this.move(_this._current +1);
  },
  prev:function(){
    var _this = this;
    _this.stop();
    _this.move(_this._current -1);
  },
  dots:function(){
    var _this = this;
    var html = '<ol class="dots">'
    for (var i = 0; i < _this._items.length; i++) {
       html += '<li class="dot' + (i < 1 ? ' active' : '') + '">' + (i + 1) + '</li>'; 
    };
    html += '</ol>'
    _this._obj.addClass('has-dots')
      .append(html)
      .find('.dot').click(function(){
      	  _this.move($(this).index());
      });
  }
});