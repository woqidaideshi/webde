//windows lib for create window fastly
//this is relaty font-awesome
var Window = Class.extend({
  init:function(id_, title_ , options_, callback_){
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
      iframe:false,            //是否使用ifram作为内容框口
      maxWindow: false,  //是否初始最大化
      resize: false,           //设置是否可重新调整窗口的大小
      minWidth: 200,            //设置窗口的最小宽度
      minHeight:200,            //设置窗口的最小高度
      fullScreen: false,        //双击内容全屏显示
      z_index: 100,              //层叠深度
      fixed_pos: false,          //是否固定位置
      left_top_color: 'grey',    //标题栏左上角的颜色
      title_align: 'center'      //标题对齐方式，left或者center
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
    this._fullScreen = false;
    this._saveWindowCss = '';
    this._saveWinContentCss = '';
    this._focusCallback = undefined;    //获取聚焦时的回调函数

    this._window = $('<div>',{
      'id': this._id,
      'class': 'window'
    });

    this._titleDiv = $('<div>',{
      'class': 'window-top'
    });
    this._window.append(this._titleDiv);

    this._leftTop = $('<div>', {
      'class': 'window-left-top',
    });
    if (options_ && options_['left_top_color'] !== undefined){
      this._leftTop.css({
        'background-color': options_['left_top_color']
      });
    }
    this._titleDiv.append(this._leftTop);

    this._titleText = $('<div>', {
      'class': 'window-title'
    });
    this._titleText.append(this._title);
    this._titleDiv.append(this._titleText);

    this._titleButton = $('<div>',{
      'class': 'window-title-button'
    }) ;
    this._titleDiv.append(this._titleButton);

    if (this._options.contentDiv) {
      this._windowContent = $('<div>',{
        'class':'window-content window-div'
      });
      this._window.append(this._windowContent);
    } else if (this._options.iframe) {
      this._windowContent = $('<iframe>',{
        'class':'window-content window-iframe',
        'frameborder':'no',
        'border':'none'
      });
      this._window.append(this._windowContent);
    };

    if (this._options.resize == true) {
      this._dragDiv = $('<div>', {
        'class': 'rb-drag-div'
      });
      this._window.append(this._dragDiv);
    }

    $('body').
    append(this._window);
    
    this.setOptions();
    if (options_ && options_['title_align'] !== undefined && options_['title_align'] === 'left'){
      this._titleText.addClass('window-title-left');
      this._titleText.css('padding-left', '68px');
      if (options_['left_top_color']  === undefined){
        this._titleText.css('padding-left', '16px');
      }
    }
    if (this._options.hideWindow === false){
      this.show();
    }else {
      this.hide();
    }
    if(this._options.maxWindow){
      this.maxWindow(this);
    }
    this.bindEvent();

    if (callback_) {
      callback_.call(this);
    };
  },

  /**
   * [setOptions set options by this._options]
   */
  setOptions:function(){
    var _this = this;
    var _count = 0;
    for(var key in _this._options) {
      switch(key){
        case 'close':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-close' class='window-button-close close' href='#'><i class='icon-remove'></i></a>");
            _this.bindButton($(_this._titleButton.children('.window-button-close')[0]),_this.closeWindow, _this);
            _count++;
          }
          break;
        case 'max':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-max' class='window-button-max max' href='#'><i class='icon-plus'></i></a>");
            _this.bindButton($(_this._titleButton.children('.window-button-max')[0]),_this.maxWindow, _this);
            _count++;
          }
          break;
        case 'min':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-min' class='window-button-min min' href='#'><i class='icon-minus'></i></a>");
            _count++;
          }
          break;
        case 'hide':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-hide' class='window-button-hide hide' href='#'><i class='icon-double-angle-up'></i></a>");
            _this.bindButton($(_this._titleButton.children('.window-button-hide')[0]),_this.hideDiv, _this);
            _count++;
          }
          break;
      }
    }
    var title_btn_width = _count * 24;
    _this._titleText.css({
      'padding-left': (title_btn_width + 'px'),
      'right': (title_btn_width + 'px')
    })
    this.setWindowPos(this._options);
    this.resizeWindow(this._options);
  },

  /**
   * [setTitleButton bind eventAction_ to $target_, with argument window obj(this)]
   * @param {[jquery]} $target_     [target for bind obj]
   * @param {[event]} eventAction_ [event when click the target]
   * @param {[this]} windowObj_   [this ]
   */
  bindButton:function($target_, eventAction_, windowObj_){
    $target_.mousedown(function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }).mouseup(function(ev){
      eventAction_(windowObj_);
      ev.stopPropagation();
    }).click(function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }).dblclick(function(ev){
      ev.preventDefault();
      ev.stopPropagation();
    })
  },

  bindCloseButton:function(eventAction_, arg_){
    if (this._options.close)
    this.bindButton(this._titleButton.children('.window-button-close'), eventAction_, arg_);
  },

  bindMinButton:function(eventAction_, arg_){
    if (this._options.min)
    this.bindButton(this._titleButton.children('.window-button-min'), eventAction_, arg_);
  },

  bindMaxButton:function(eventAction_, arg_){
    if (this._options.max)
    this.bindButton(this._titleButton.children('.window-button-max'), eventAction_, arg_);
  },

  bindHideButton:function(eventAction_, arg_){
    if (this._options.hide)
    this.bindButton(this._titleButton.children('.window-button-hide'), eventAction_, arg_);
  },

  gitID:function(){
    return this._id;
  },

  focus:function(){
    this._window.css('z-index' , this._options['z_index'] +1);
  },

  blur:function(){
    this._window.css('z-index' , this._options['z_index']);
  },

  onfocus:function(callback_){
    if (callback_) {
      this._focusCallback = callback_;
    };
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
    this.bindButton(_a, newAction_, this);
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
      ev.preventDefault();
      if (_this._isMax || _this._options.fixed_pos) {
        return ;
      };
      _this._isMouseOnTitleDown = true;
      _this._offsetX = ev.clientX - _this._window.position().left;
      _this._offsetY = ev.clientY - _this._window.position().top;
      _this._window.fadeTo(20, 0.8);
      _this._titleDiv.css('cursor','move');
    }).mouseup(function(ev){
      _this._isMouseOnTitleDown = false;
      _this._window.fadeTo(20, 1);
      _this._titleDiv.css('cursor','default');
    }).dblclick(function(){
      if (_this._options.resize)
        _this.toggleMaxWindow();
    });
    $(document).mousemove(function(ev){
      if(_this._isMouseOnTitleDown){ 
        var x = ev.clientX - _this._offsetX; 
        var y = ev.clientY - _this._offsetY; 
        _this.setWindowPos({left:x, top: y});
        _this._options.top = y;
        _this._options.left = x;
      }
    });

    //resize window
    if (typeof this._dragDiv !== 'undefined') {
      this._dragDiv.mousedown(function(ev){
        if (_this._isMax || _this._ishideDiv || !_this._options.resize) {
          return ;
        };
        _this._isMouseResizeDown = true;
        _this._window.fadeTo(20, 0.9);
      })
      $(document).mouseup(function(ev){
        if (!_this._isMouseResizeDown) {
          return ;
        }
        _this._isMouseResizeDown = false;
        _this._options.width = _this._window.width();
        _this._options.height = _this._window.height();
        _this.resizeWindow(_this._options);
        _this._window.fadeTo(20, 1);
      });
      $(document).mousemove(function(ev){
        ev.stopPropagation();
        ev.preventDefault();
        if (_this._isMouseResizeDown){
          var _width = ev.clientX - _this._window.position().left + 3;
          var _height = ev.clientY - _this._window.position().top + 3;
          if (_width < _this._options.minWidth){
            _width = _this._options.minWidth;
          } 
          if (_height < _this._options.minHeight) {
            _height = _this._options.minHeight;
          }
          _this._options.width = _width;
          _this._options.height = _height;
          _this.resizeWindow(_this._options);
        }
      })
    }

    if (_this._options.fullscreen) {
      _this._windowContent.dblclick(function(ev){
        _this.togglefullScreen();
        ev.stopPropagation();
        ev.preventDefault();
      })
    }

    _this._window.mousedown(function(ev){
      _this.focus();
      if (_this._focusCallback) {
        _this._focusCallback.call(_this);
      };
      ev.stopPropagation();
    }).mouseup(function(ev){
    });
  },
  /**
   * [resizeWindow  resize Window without animate]
   * @param  {[type]} size_ [new size]
   * @return {[type]}       [description]
   */
  resizeWindow:function(size_){
    var _this = this;
    _this._titleDiv.css({'width': size_.width+'px'});
    if(typeof _this._windowContent !== 'undefined')
      _this._windowContent.css({'width': size_.width + 'px', 'height': (size_.height - 34)+'px'});
  },
  /**
   * [resizeWindowWithAnimate resize window with animate]
   * @param  {[type]} size_ [new size]
   * @param  {[type]} pos_  [new position]
   * @return {[type]}       [description]
   */
  resizeWindowWithAnimate:function(size_, pos_){
    var _this = this;
    _this._window.animate({left: pos_.left + 'px', top: pos_.top + 'px'},_this._options.fadeSpeed);
    _this._titleDiv.animate({width: size_.width+'px'},_this._options.fadeSpeed);
    if(typeof _this._windowContent !== 'undefined'){
      _this._windowContent.animate({width:size_.width + 'px', height: (size_.height - 34)+'px'},_this._options.fadeSpeed);
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
    var _winHeight = document.body.clientHeight;
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

  toggleMaxWindow:function(){
    (this._isMax ? this.recoverWindow(this) : this.maxWindow(this) );
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
    if (typeof _this._windowContent !== 'undefined') {
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
    if (typeof _this._windowContent !== 'undefined') {
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
  },
  /**
   * [show show Window]
   * @return {[type]} [description]
   */
  show:function(){
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
  },
  /**
   * [close close window]
   * @return {[type]} [description]
   */
  close:function(){
    var _this = this ;
    if (typeof this._window !== 'undefined'){
      this.closeWindow(_this);
    } 
  },
  /**
   * [hide hide window]
   * @return {[type]} [description]
   */
  hide:function(){
    if (this._options.animate) {
      this._window.fadeOut(this._options.fadeSpeed);
    } else {
      this._window.hide();
    }
  },
  /**
   * [appendHtml append html]
   * @param  {[type]} src_ [description]
   * @return {[type]}      [description]
   */
  appendHtml:function(src_){
    var _this = this ;
    function iframeClick(){
      _this._windowContent.contents().find("body")[0].onclick = function(){
        _this.focus();
        if (_this._options._focusCallback) {
          _this._options._focusCallback.call(_this);
        };
      }
    }
    if(this._options.iframe){
      this._windowContent[0].onload = function(){
        iframeClick();
      }
      this._windowContent[0].src = src_;
    }else {
      return 0;
    }
  },
  /**
   * [fullscreen fullscreen ]
   * @param  {[type]} state_ [fullScreen state]
   * @return {[type]}        [description]
   */
  fullScreen:function(state_){
    if (typeof state_ === 'undefined') state_ = true;
    (state_ ? this._titleDiv.hide() : this._titleDiv.show());
    if (state_ !== this._fullScreen) {
      this._fullScreen = state_;
    }else return ;
    
    if(state_){
      this._saveWinContentCss = this._windowContent[0].style.cssText;
      this._windowContent[0].style.cssText = 'margin: 0;';
    } else {
      this._windowContent[0].style.cssText = this._saveWinContentCss;
      this._saveWinContentCss = '';
    }
    if (state_) {
      this._saveWindowCss = this._window[0].style.cssText;
      this._window[0].style.cssText = 'left: 0px; top: 0px; display: block;'; 
    } else {
      this._window[0].style.cssText = this._saveWindowCss;
      this._saveWindowCss = '';
    }
    this._windowContent[state_ ? 'addClass' : 'removeClass']('fullwindow');
    this._window[state_ ? 'addClass' : 'removeClass']('fullwindow');
  },

  togglefullScreen:function(){
    this.fullScreen(!this._fullScreen);
  },

  setBackGroundImage: function(path_){
    this._window.css({
      'background-image': 'url(' + path_ + ')',
      'background-size': '100% 100%'
    });
    this._windowContent.css('background-color', "transparent");
    this._titleDiv.css('background-color', "transparent");
  }

});
