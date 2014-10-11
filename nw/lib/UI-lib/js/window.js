var Window = Class.extend({
	init:function(id_, title_ , options_){
		this._options = {
			close: true,
			max: true,
			min: false,
			hide: true,
			fadeSpeed: 100,
			hideWindow: false,
			width: 600,
			height: 600,
			left: 0,
			top: 0,
			contentDiv: true,
			resize: false,
			minWidth: 200,
			minHeight:200
		};

		//set options
		if (options_) {
			for(var key in options_) {
				this._options[key] = options_[key];
			}
		};

		this._isMouseDown = false;
		this._offsetX = 0;
		this._offsetY = 0;
		this._title = title_;
		this._id = id_;

		this._window = $('<div>',{
			'id': 'window-'+this._id,
			'class': 'window',
			'left': '100px'
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
		}) 
		this._titleDiv.append(this._titleButton);

		this._titleButton.append("<a id='window-"+this._id+"-hide' class='window-button-hide' href='#'><i class='icon-double-angle-up'></i></a>");
		this._titleButton.append("<a id='window-"+this._id+"-min' class='window-button-min' href='#'><i class='icon-minus'></i></a>");
		this._titleButton.append("<a id='window-"+this._id+"-max' class='window-button-max' href='#'><i class='icon-resize-full'></i></a>");
		this._titleButton.append("<a id='window-"+this._id+"-close' class='window-button-close' href='#'><i class='icon-remove'></i></a>");

		if (this._options.contentDiv) {
			this._windowContent = $('<div>',{
				'class':'window-content'
			});
			this._window.append(this._windowContent);
		}

		$('body').append(this._window);
		
		this.setOptions();
		if (this._options.hideWindow === false)
			this._window.show(this._options.fadeSpeed);
		this.bindEvent();
	},

	setOptions:function(){
		var _this = this;
		for(var key in this._options) {
			switch(key){
				case 'close':
				case 'max':
				case 'hide':
				case 'min':
					if (this._options[key] === true) {
						$('.window-button-'+key).addClass('active');
					}else{
						$('.window-button-'+key).addClass('disable');
					}
					break;
			}
		}
		this.setWindowPos(this._options);
		this.resizeWindow(this._options);
	},

	setTitleButton:function($target_, eventAction_, windowObj_){
		$target_.mousedown(function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
		}).mouseup(function(){
			eventAction_(windowObj_);
		})
		.click(function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
		});
	},

	changeIcon:function(aClass_, oldIcon_, newIcon_, newAction_){
		var _a = $(this._titleButton.children('.'+aClass_)[0]);
		var _icon = $(_a.children('.'+oldIcon_)[0]);
		_icon.removeClass(oldIcon_);
		_icon.addClass(newIcon_);
		_a.unbind();
		this.setTitleButton(_a, newAction_, this);
	},

	bindEvent:function(){
		var _this = this;

		this._titleButton.mousedown(function(ev){
			ev.preventDefault();
			ev.stopPropagation();
		});

		this._titleDiv.mousedown(function(ev){
			ev.stopPropagation();
			_this._isMouseDown = true;
			_this._offsetX = ev.offsetX;
			_this._offsetY = ev.offsetY;
			_this._window.fadeTo(20, 0.5);
		}).mouseup(function(ev){
			ev.stopPropagation();
			_this._isMouseDown = false;
			_this._window.fadeTo(20, 1);
		});

		$(document).mousemove(function(ev){
			if(!_this._isMouseDown) return ;
			var x = ev.clientX - _this._offsetX; 
			var y = ev.clientY - _this._offsetY; 
			_this._window.css("left", x);
			_this._window.css("top", y-1);
			_this._titleDiv.css('cursor','move');
		});	

		//bind event to icon
		_this.setTitleButton($(_this._titleButton.children('.window-button-hide')[0]),_this.hideDiv, _this);
		_this.setTitleButton($(_this._titleButton.children('.window-button-max')[0]),_this.maxWindow, _this);
		_this.setTitleButton($(_this._titleButton.children('.window-button-close')[0]),_this.closeWindow, _this);

	},

	resizeWindow:function(size_){
		var _this = this;
		var _tmp = size_.width-2;
		_this._titleDiv.css({'width': _tmp+'px'});
		_tmp = size_.width-130;
		_this._titleText.css({'width': _tmp+'px'});
		if (this._options.contentDiv) {
			_tmp = size_.width -8;
			var _tmp1 = size_.height - 50;
			_this._windowContent.css({'width':_tmp+'px', 'height': _tmp1+'px'});
		}
	},

	maxWindow:function(windowObj_){
		var _this = windowObj_;
		var _winWidth = document.body.clientWidth;
		var _winHeight = $(document).height();
		var _dockBottom = $('#dock').attr('bottom');
		_this._options.top = _this._window.position().top;
		_this._options.left = _this._window.position().left;
		_this._options.width = _this._window[0].offsetWidth;
		_this._options.height= _this._window[0].offsetHeight;
		var _pos = {
			left: 0,
			top: 0
		};
		var _size = {
			width: _winWidth,
			height: _winHeight
		};
		_this.setWindowPos(_pos);
		_this.resizeWindow(_size);
		_this.changeIcon('window-button-max', 'icon-resize-full', 'icon-resize-small', _this.recoverWindow);
	},

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
		_this.setWindowPos(_pos);
		_this.resizeWindow(_size);
		_this.changeIcon('window-button-max', 'icon-resize-small', 'icon-resize-full', _this.maxWindow);
	},

	closeWindow:function(windowObj_){
		var _this = windowObj_;
		_this._window.fadeOut(500,function(){
			_this._window.remove();
		});
	},

	hideDiv:function(windowObj_){
		var _this = windowObj_;
		if (_this._options.contentDiv) {
			_this._windowContent.slideUp(500);
		}
		console.log('hide window');
		_this.changeIcon('window-button-hide'
			, 'icon-double-angle-up'
			, 'icon-double-angle-down'
			,  _this.showDiv
		);
	},

	showDiv:function(windowObj_){
		var _this = windowObj_;
		if (_this._options.contentDiv) {
			_this._windowContent.slideDown(500);
		}
		_this.changeIcon('window-button-hide'
			, 'icon-double-angle-down'
			, 'icon-double-angle-up'
			,  _this.hideDiv
		);
	},

	setWindowPos:function(pos_){
		this._window.css('left', pos_['left'] + 'px');
		this._window.css('top', pos_['top'] + 'px');
	}

});