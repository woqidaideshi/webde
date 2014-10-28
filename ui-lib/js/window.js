//windows lib for create window fastly
//this is relaty font-awesome
var Window = Class.extend({
  init:function(id_, title_ , options_){
    this._options = {
      animate: true,             //动画效果
      contentDiv: true,     //包含放置内容的div
      hide: true,                  //右上角隐藏内容按钮，可点击
      min: false,                  //右上角最小化按钮，可点击
      max: true,                     //右上角最大化按钮，可点击
      close: true,                //右上角关闭按钮，可点击
      fadeSpeed: 100,          //打开窗口速度
      hideWindow: false,  //是否直接显示窗口
      width: 600,                   //宽
      height: 600,                //高
      left: 0,                         //位置x坐标
      top: 0,                           //位置y坐标
      contentDiv: true,    //是否新建div窗口
      resize: false,           //设置是否可重新调整窗口的大小
      minWidth: 200,            //设置窗口的最小宽度
      minHeight:200            //设置窗口的最小高度
    };

    //set options
    if (options_) {
      for(var key in options_) {
        this._options[key] = options_[key];
      }
    };

    this._isMouseOnTitleDown = false;       //is mouse down on title
    this._isMouseResizeDown = false;         //is mouse down on resize div
    this._ishideDiv = false;                           //is content div hide
    this._offsetX = 0;                                         //record mouse offset x relate window
    this._offsetY = 0;                                         //record mouse offset y relate window
    this._title = title_;                                   //record title
    this._id = id_;                                                // record id
    this._isMax = false;                                    // record window is maxsize or not

    this._window = $('<div>',{
      'id': 'window-'+this._id,
      'class': 'window'
    });

    this._titleDiv = $('<div>',{
      'class': 'window-top'
    });
    this._window.append(this._titleDiv);

    this._titleText= '<div class="window-title">'+this._title+'</div>';
    this._titleDiv.append(this._titleText);
    this._titleText = $(this._titleDiv.children('.window-title')[0]);

    this._titleButton = $('<div>',{
      'class': 'window-title-button'
    }) ;
    this._titleDiv.append(this._titleButton);

    if (this._options.contentDiv) {
      this._windowContent = $('<div>',{
        'class':'window-content'
      });
      this._window.append(this._windowContent);
    }

    if (this._options.resize == true) {
      this._dragDiv = $('<div>', {
        'class': 'rb-drag-div'
      });
      this._window.append(this._dragDiv);
    }
    $('body').
    append(this._window);
    
    this.setOptions();
    if (this._options.hideWindow === false){
      this.showWindow();
    }
    this.bindEvent();
  },

  /**
   * [setOptions set options by this._options]
   */
  setOptions:function(){
    var _this = this;
    for(var key in _this._options) {
      switch(key){
        case 'close':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-close' class='window-button-close' href='#'><i class='icon-remove'></i></a>");
            _this.setTitleButton($(_this._titleButton.children('.window-button-close')[0]),_this.closeWindow, _this);
            $('.window-button-'+key).addClass('active');
          }
          break;
        case 'max':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-max' class='window-button-max' href='#'><i class='icon-resize-full'></i></a>");
            _this.setTitleButton($(_this._titleButton.children('.window-button-max')[0]),_this.maxWindow, _this);
            $('.window-button-'+key).addClass('active');
          }
          break;
        case 'min':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-min' class='window-button-min' href='#'><i class='icon-minus'></i></a>");
            $('.window-button-'+key).addClass('active');
          }
          break;
        case 'hide':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-hide' class='window-button-hide' href='#'><i class='icon-double-angle-up'></i></a>");
            _this.setTitleButton($(_this._titleButton.children('.window-button-hide')[0]),_this.hideDiv, _this);
            $('.window-button-'+key).addClass('active');
          }
          break;
      }
    }
    this.setWindowPos(this._options);
    this.resizeWindow(this._options);
  },

  /**
   * [setTitleButton bind eventAction_ to $target_, with argument window obj(this)]
   * @param {[jquery]} $target_     [target for bind obj]
   * @param {[event]} eventAction_ [event when click the target]
   * @param {[this]} windowObj_   [this ]
   */
  setTitleButton:function($target_, eventAction_, windowObj_){
    $target_.mousedown(function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }).mouseup(function(ev){
      eventAction_(windowObj_);
      ev.stopPropagation();
    })
    .click(function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    });
  },

  /**
   * [changeIcon change icon by class]
   * @param  {[string]} aClass_    [class name of a]
   * @param  {[string]} oldIcon_   [old icon index class]
   * @param  {[string]} newIcon_   [new icon index class]
   * @param  {[string]} newAction_ [event when click this a]
   * @return {[null]}            [description]
   */
  changeIcon:function(aClass_, oldIcon_, newIcon_, newAction_){
    var _a = $(this._titleButton.children('.'+aClass_)[0]);
    var _icon = $(_a.children('.'+oldIcon_)[0]);
    _icon.removeClass(oldIcon_);
    _icon.addClass(newIcon_);
    _a.unbind();
    this.setTitleButton(_a, newAction_, this);
  },

  /**
   * [bindEvent bind dragWindow Event and resizeWindow Event]
   * @return {[type]} [description]
   */
  bindEvent:function(){
    var _this = this;

    //forbid context menu
    $(document).on('contextmenu','#'+_this._window[0].id, function(ev){
      ev.stopPropagation();
      ev.preventDefault();
    });

    //drag window
    this._titleDiv.mousedown(function(ev){
      ev.stopPropagation();
      ev.preventDefault();
      if (_this._isMax) {
        return ;
      };
      _this._isMouseOnTitleDown = true;
      _this._offsetX = ev.clientX - _this._window.position().left;
      _this._offsetY = ev.clientY - _this._window.position().top;
      _this._window.fadeTo(20, 0.5);
    }).mouseup(function(ev){
      ev.stopPropagation();
      _this._isMouseOnTitleDown = false;
      _this._window.fadeTo(20, 1);
    });

    //resize window
    if (typeof this._dragDiv !== 'undefined') {
      this._dragDiv.mousedown(function(ev){
        ev.stopPropagation();
        if (_this._isMax || _this._ishideDiv || !_this._options.resize) {
          return ;
        };
        _this._isMouseResizeDown = true;
        _this._window.fadeTo(20, 0.9);
      }).mouseup(function(ev){
        ev.stopPropagation();
        if (!_this._isMouseResizeDown) {
          return ;
        }
        _this._isMouseResizeDown = false;
        _this._options.width = _this._window.width();
        _this._options.height = _this._window.height();
        _this._window.fadeTo(20, 1);
      });
    }
    $(document).mousemove(function(ev){
      if(_this._isMouseOnTitleDown){ 
        var x = ev.clientX - _this._offsetX; 
        var y = ev.clientY - _this._offsetY; 
        _this.setWindowPos({left:x, top: y});
        _this._options.top = y;
        _this._options.left = x;
        _this._titleDiv.css('cursor','move');
      }else if (_this._isMouseResizeDown && _this._options.resize) {
        var _width = ev.clientX - _this._window.position().left + 5;
        var _height = ev.clientY - _this._window.position().top + 5;
        if (_width < _this._options.minWidth){
          _width = _this._options.minWidth;
        } 
        if (_height < _this._options.minHeight) {
          _height = _this._options.minHeight;
        }
        _this._options.width = _width;
        _this._options.height = _height;
        _this.resizeWindow(_this._options);
        _this._dragDiv.css('cursor', 'se-resie');
      };
    });
  },
  /**
   * [resizeWindow  resize Window without animate]
   * @param  {[type]} size_ [new size]
   * @return {[type]}       [description]
   */
  resizeWindow:function(size_){
    var _this = this;
    var _tmp = size_.width-2;
    _this._titleDiv.css({'width': _tmp+'px'});
    _tmp = size_.width-130;
    _this._titleText.css({'width': _tmp+'px'});
    if (this._options.contentDiv) {
      _tmp = size_.width -10;
      var _tmp1 = size_.height - 50;
      _this._windowContent.css({'width':_tmp+'px', 'height': _tmp1+'px'});
    }
  },
  /**
   * [resizeWindowWithAnimate resize window with animate]
   * @param  {[type]} size_ [new size ]
   * @param  {[type]} pos_  [new position]
   * @return {[type]}       [description]
   */
  resizeWindowWithAnimate:function(size_, pos_){
    var _this = this;
    _this._window.animate({left: pos_.left + 'px', top: pos_.top + 'px'},_this._options.fadeSpeed);
    var _tmp = size_.width-2;
    _this._titleDiv.animate({width: _tmp+'px'},_this._options.fadeSpeed);
    _tmp = size_.width-130;
    _this._titleText.animate({width: _tmp+'px'}, _this._options.fadeSpeed);
    if (this._options.contentDiv) {
      _tmp = size_.width -10;
      var _tmp1 = size_.height - 50;
      _this._windowContent.animate({width:_tmp+'px', height: _tmp1+'px'},_this._options.fadeSpeed);
    }
  },
  /**
   * [maxWindow max window]
   * @param  {[this]} windowObj_ [this obj]
   * @return {[type]}            [description]
   */
  maxWindow:function(windowObj_){
    var _this = windowObj_;
    var _winWidth = document.body.clientWidth;
    var _winHeight = $(document).height();
    var _dockBottom = $('#dock').attr('bottom');
    var _pos = {
      left: 0,
      top: 0
    };
    var _size = {
      width: _winWidth,
      height: _winHeight
    };
    if(_this._options.animate){
      _this.resizeWindowWithAnimate(_size, _pos);
    } else {
      _this.setWindowPos(_pos);
      _this.resizeWindow(_size);
    } 

    _this._isMax = true;
    _this._isMouseResizeDown = false;
    _this._window.fadeTo(20,1);
    _this.changeIcon('window-button-max', 'icon-resize-full', 'icon-resize-small', _this.recoverWindow);
  },
  /**
   * [recoverWindow recover window positon and size before max window]
   * @param  {[this]} windowObj_ [this obj]
   * @return {[type]}            [description]
   */
  recoverWindow:function(windowObj_){
    var _this = windowObj_;
    var _pos = {
      left: _this._options.left,
      top: _this._options.top
    };
    var _size= {
      width: _this._options.width,
      height:_this._options.height
    }
    if(_this._options.animate){
      _this.resizeWindowWithAnimate(_size, _pos);
    } else {
      _this.setWindowPos(_pos);
      _this.resizeWindow(_size);
    } 
    _this._isMax = false;
    _this.changeIcon('window-button-max', 'icon-resize-small', 'icon-resize-full', _this.maxWindow);
  },

  /**
   * [closeWindow close window]
   * @param  {[this ]} windowObj_ [this obj]
   * @return {[type]}            [description]
   */
  closeWindow:function(windowObj_){
    var _this = windowObj_;
    if (_this._options.animate) {
      _this._window.fadeOut(_this._options.fadeSpeed,function(){
        _this._window.remove();
      });
    } else {
      _this._window.remove();
    }
  },

  /**
   * [hideDiv hide content div ]
   * @param  {[this]} windowObj_ [this]
   * @return {[type]}            [description]
   */
  hideDiv:function(windowObj_){
    var _this = windowObj_;
    if (_this._options.contentDiv) {
      if (_this._options.animate) {
        _this._windowContent.slideUp(_this._options.fadeSpeed);
      } else {
        _this._windowContent.hide();
      }
    }
    console.log('hide window');
    _this._ishideDiv = true;
    _this._isMouseResizeDown = false;
    _this.changeIcon('window-button-hide'
      , 'icon-double-angle-up'
      , 'icon-double-angle-down'
      ,  _this.showDiv
    );
  },
  /**
   * [showDiv show content div]
   * @param  {[this]} windowObj_ [this]
   * @return {[type]}            [description]
   */
  showDiv:function(windowObj_){
    var _this = windowObj_;
    _this._ishide = false;
    if (_this._options.contentDiv) {
      if (_this._options.animate) {
        _this._windowContent.slideDown(_this._options.fadeSpeed);
      } else {
        _this._windowContent.show();
      }
    }
    _this._ishideDiv = false;
    _this.changeIcon('window-button-hide'
      , 'icon-double-angle-down'
      , 'icon-double-angle-up'
      ,  _this.hideDiv
    );
  },
  /**
   * [setWindowPos set position of window]
   * @param {[type]} pos_ [description]
   */
  setWindowPos:function(pos_){
    this._window.css('left', pos_['left'] + 'px');
    this._window.css('top', pos_['top'] + 'px');
    if (typeof this._dragDiv !== 'undefined') {
      this._dragDiv.css('left',pos_['left']+this._options._winWidth -10 + 'px');
      this._dragDiv.css('top', pos_['pos']+this._options._winHeight-10 + 'px');
    }
  },
  /**
   * [showWindow show Window]
   * @return {[type]} [description]
   */
  showWindow:function(){
    if (this._options.animate) {
      this._window.fadeIn(this._options.fadeSpeed);
    } else {
      this._window.show();
    }
  },
  /**
   * [append appent content]
   * @param  {[type]} content_ [append content]
   * @return {[type]}          [description]
   */
  append:function(content_){
    if (content_) {
      this._windowContent.append(content_);
    }
  }

});