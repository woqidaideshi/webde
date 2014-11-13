var Video = Class.extend({
  init: function(sections_) {
    this._sections = {
      controls: true,
      width: '100%',
      height: '100%',
      src: '',
      contextMenu: true
    };
    if (sections_) {
      for (var key in sections_) {
        this._sections[key] = sections_[key];
      }
    };
    this._section = $("<section id='player'></section>");
    this._video = $("<video width='" + this._sections.width + "' height='" + this._sections.height + "' controls></video>");
    this._section.append(this._video);
    this._ctxMenu = ContextMenu.create();
    this._source = $("<source src=''></source>");
    this._video.append(this._source);
    this._video.append($("<p>The browser doesn't support html5</p>"));
    if (this._sections.controls) {
      this._video[0].style.cssText = "controls='controls'";
    };
    if (this._sections.src !== '') {
      this.setSrc(this._sections.src);
    };
    if (this._sections.contextMenu) {
      this.setContextMenu();
    };
  },

  setSrc: function(src_) {
    this._source[0].src = src_;
  },

  injectParent: function($parent_) {
    $parent_.append(this._section);
  },

  setMenu:function(this_){
    var _this = this_;
    if (_this._video[0].paused) {
      _this._ctxMenu.activeItem('video','Play',function(){
        if (_this._video[0].paused) {
          _this._video[0].play();
        };
      });
      _this._ctxMenu.disableItem('video','Pause');
    } else {
      _this._ctxMenu.disableItem('video','Play');
      _this._ctxMenu.activeItem('video','Pause',function(){
        _this._video[0].pause();
      });
    }
    if (_this._video[0].loop) {
      _this._ctxMenu.activeItem('video','Order play',function(){
      _this._video[0].loop = false;
        });
      _this._ctxMenu.disableItem('video','Loop play');
    } else {
      _this._ctxMenu.activeItem('video','Loop play',function(){
        _this._video[0].loop = true;
      });
      _this._ctxMenu.disableItem('video','Order play');
    }
    if (_this._video[0].fullScreen) {
      _this._ctxMenu.disableItem('video','Full screen')
    } else {
      _this._ctxMenu.activeItem('video','Full screen',function(){
        if (typeof _this._video[0].mozRequestFullScreen !== 'undefined') {
          _this._video[0].mozRequestFullScreen();
        }
        if (typeof _this._video[0].webkitRequestFullScreen !== 'undefined') {
          _this._video[0].webkitRequestFullScreen();
        };
        if (typeof _this._video[0].requestFullscreen !== 'undefined') {
          _this._video[0].requestFullscreen();
        };
      });
    }
  },

  setContextMenu: function() {
    var _this = this;
    this._ctxMenu.addCtxMenu([
    {header: 'video'},
    { text: 'Play',
      icon: 'icon-play',
      action: function() {
        if (_this._video[0].paused) {
          _this._video[0].play();
        };
      }
    },
    {text: 'Pause',
      icon: 'icon-pause',
      action: function() {
        _this._video[0].pause();
      }
    },
    { text: 'Loop play',
      icon: 'icon-repeat',
      action: function() {
        _this._video[0].loop = true;
      }
    },
    { text: 'Order play',
      icon: 'icon-reorder',
      action: function() {
        _this._video[0].loop = false;
      }
    },
    { text: 'Full screen',
      icon: 'icon-fullscreen',
      action: function() {
      }
    }
    ]);
    _this._ctxMenu.attachToMenu('video'
      , _this._ctxMenu.getMenuByHeader('video')
      ,function() {
        _this.setMenu(_this);
      });
  }

});