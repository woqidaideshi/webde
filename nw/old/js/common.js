//Base Class for every class in this project!!
//
function Class() {}

//Use extend to realize inhrietion
//
Class.extend = function extend(props) {
	var prototype = new this();
	var _super = this.prototype;

	for(var name in props) {
		//if a function of subclass has the same name with super
		//override it, not overwrite
		//use this.callSuper to call the super's function
		//
		if(typeof props[name] == "function"
				&& typeof _super[name] == "function") {
			prototype[name] = (function(super_fn, fn) {
				return function() {
					var tmp = this.callSuper;
					this.callSuper = super_fn;
					
					var ret = fn.apply(this, arguments);

					this.callSuper = tmp;
					
					if(!this.callSuper) {
						delete this.callSuper;
					}

					return ret;
				}
			})(_super[name], props[name])
		} else {
			prototype[name] = props[name];
		}
	}

	var SubClass = function() {};

	SubClass.prototype = prototype;
	SubClass.prototype.constructor = SubClass;

	SubClass.extend = extend;
	//Use create to replace new
	//we need give our own init function to do some initialization
	//
	SubClass.create = SubClass.prototype.create = function() {
		var instance = new this();

		if(instance.init) {
			instance.init.apply(instance, arguments);
		}

		return instance;
	}

	return SubClass;
}

//Event base Class
//Inherited from Node.js' EventEmitter
//
var Event = Class.extend(require('events').EventEmitter.prototype);

//Ordered Queue Class
//constructor:
//  before -> type: function(item1, item2), ret: {true(if item1 is before item2)|false}
//
var OrderedQueue = Class.extend({
	init: function(before_) {
		if(typeof before_ != 'function') throw 'Bad type of before(should be a function)';
		this._items = [];
		this._before = before_;
	},

	length: function() {
		return this._items.length;
	},
	
	push: function(item_) {
		//check last key to find the idle item
		//no need to aquire memory
		var _idx = this._items.length - 1;
		if(_idx < 0 || this._items[_idx] != null) {
			this._items.push(item_);
		} else {
			this._items[_idx] = item_;
		}
		this.order();
	},

	pop: function() {
		var _item = this.get(0);
		this.remove(0);
		return _item;
	},
	
	get: function(idx_) {
		return this._items[idx_];
	},

	remove: function(idx_) {
		if(idx_ >= this._items.length) return ;
		this._items[idx_] = null;
		this.order();
	},
	
	before: function(item1_, item2_) {
		if(item1_ == null) return false;
		if(item2_ == null) return true;
		return this._before(item1_, item2_);
	},

	order: function() {
		var _this = this;
		var start = function(l_) {return (Math.floor(l_ / 2) - 1);};
		var lParent = function(idx_) {return (idx_ * 2 + 1);};
		var rParent = function(idx_) {return (idx_ * 2 + 2);};
		var swap = function(idx1_, idx2_) {
			var tmp = _this._items[idx1_];
			_this._items[idx1_] = _this._items[idx2_];
			_this._items[idx2_] = tmp;
		};
		var heap = function(s_, l_) {
			var lp, rp;
			for(var i = start(l_); i >= s_; --i) {
				lp = lParent(i);
				rp = rParent(i);
				if(rp < l_ && !_this.before(_this._items[rp], _this._items[lp]))
					swap(lp, rp);
				rp = i;
				while(lp < l_ && !_this.before(_this._items[lp], _this._items[rp])) {
					swap(lp, rp);
					rp = lp;
					lp = lParent(lp);
				}
			}
		};

		for(var x = _this._items.length; x > 0; --x) {
			heap(0, x);
			swap(0, x - 1);
		}
	}

});

var ContextMenu = Class.extend({
	init: function(options_) {
		this._options = {
			fadeSpeed: 100,
			filter: function ($obj) {
				// Modify $obj, Do not return
			},
			above: 'auto',
			preventDoubleContext: true,
			compress: false
		};
		this._menus = [];

		for(var key in options_) {
			this._options[key] = options_[key];
		}

		var _this = this;
		$(document).on('mousedown', 'html', function (e) {
			e.preventDefault();
			e.stopPropagation();
			if(e.which == 1)
				_this.hide();
		});
		if(this._options.preventDoubleContext) {
			$(document).on('contextmenu', '.dropdown-context', function (e) {
				e.preventDefault();
			});
		}
		$(document).on('mouseenter', '.dropdown-submenu', function(){
			var $sub = $(this).find('.dropdown-context-sub:first'),
				subWidth = $sub.width(),
				subLeft = $sub.offset().left,
				collision = (subWidth + subLeft) > window.innerWidth;
			if(collision){
				$sub.addClass('drop-left');
			}
		});
	},

	getMenuByHeader: function(header_) {
		return this._menus['dropdown-' + header_];
	},
	
	addItem: function($menu_, item_) {
		var linkTarget = '';
		if (typeof item_.divider !== 'undefined') {
			$menu_.append('<li class="divider"></li>');
		} else if (typeof item_.header !== 'undefined') {//should be added just once!!
			$menu_.append('<li class="nav-header">' + item_.header + '</li>');
		} else {
			if (typeof item_.href == 'undefined') {
				item_.href = '#';
			}
			if (typeof item_.target !== 'undefined') {
				linkTarget = ' target="' + item_.target + '"';
			}
			if (typeof item_.subMenu !== 'undefined') {
				$sub = ('<li class="dropdown-submenu active"><a tabindex="-1" href="' + item_.href + '">' + item_.text + '</a></li>');
			} else {
				$sub = $('<li class="active"><a tabindex="-1" href="' + item_.href + '"' + linkTarget + '>' + item_.text + '</a></li>');
			}
			if (typeof item_.action !== 'undefined') {
				var actiond = new Date(),
					actionID = 'event-' + actiond.getTime() * Math.floor(Math.random()*100000),
					eventAction = item_.action;
				$sub.find('a').attr('id', actionID);
				$('#' + actionID).addClass('context-event');
				$(document).on('mouseup', '#' + actionID, function(e) {
					e.preventDefault();
					e.stopPropagation();
				}).on('mousedown', '#' + actionID, eventAction)
				.on('click', '#' + actionID, function(e) {
					e.preventDefault();
					e.stopPropagation();
				});
			}
			$menu_.append($sub);
			if (typeof item_.subMenu != 'undefined') {
				var subMenuData = this.addCtxMenu(item_.subMenu, true);
				$menu_.find('li:last').append(subMenuData);
			}
		}
		if (typeof this._options.filter == 'function') {
			this._options.filter($menu_.find('li:last'));
		}
	},

	addCtxMenu: function(data, subMenu) {
		var subClass = '';
		var compressed = this._options.compress ? ' compressed-context' : '';
		if(subMenu) {
			subClass = ' dropdown-context-sub';
		} else {
			$('.dropdown-context').fadeOut(this._options.fadeSpeed, function(){
				$('.dropdown-context').css({display:''}).find('.drop-left').removeClass('drop-left');
			});
		}
		var _id = 'dropdown-' + data[0].header;
		var $menu = $('<ul class="dropdown-menu dropdown-context' 
				+ subClass + compressed + '" id="' + _id + '"></ul>');
		for(var i = 0; i < data.length; ++i) {
			this.addItem($menu, data[i]);
		}
		$('body').append($menu);
		this._menus[_id] = $menu;
		return $menu;
	},

	removeMenu: function($menu_) {
		$menu_.remove();
	},

	show: function($menu_, left_, top_) {
		$('.dropdown-context:not(.dropdown-context-sub)').hide();
		
		$menu_.css({
			top: top_,
			left: left_
		}).fadeIn(this._options.fadeSpeed);
	},

	hide: function() {
		$('.dropdown-context').fadeOut(this._options.fadeSpeed, function() {
			$('.dropdown-context').css({display:''}).find('.drop-left').removeClass('drop-left');
		});
	},

	attachToMenu: function(selector_, $menu_) {
		var _this = this;
		$(document).on('contextmenu', selector_, function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (e.target.tagName !== 'HTML') {
				if (e.target.tagName !== 'DIV') {
					if (typeof $(e.target).parent('div')[0] != 'undefined') {
						desktop._rightObjId = $(e.target).parent('div')[0].id;
					}
				}
				else desktop._rightObjId = e.target.id;
			}
			var w = $menu_.width();
			var h = $menu_.height();
			left_ = (document.body.clientWidth < e.clientX + w) 
							? (e.clientX - w) : e.clientX;
			top_ = ($(document).height()< e.clientY + h + 25) 
							? (e.clientY-h-10)  : e.clientY;
			_this.show($menu_, left_, top_);
		});
	},

	detachFromMenu: function(selector_, $menu_) {
		$(document).off('contextmenu', selector_);
	},

	activeItem: function(header_, text_, eventAction_) {
		var _menus = $(desktop._ctxMenu.getMenuByHeader(header_)).children('li');
		for (var i = 0; i < _menus.length; i++) {
			if(_menus[i].textContent == text_){
				var _menuli = $(_menus[i]);
				_menuli.removeClass('disabled');
				_menuli.addClass('active');
				var _aId = $(_menuli).children('a')[0].id;
				if ((typeof _aId !== 'undefined' || _aId !== '') && typeof eventAction_ !== 'undefined') {
					$('#' + _aId).addClass('context-event');
					$(document).off('click', '#' + _aId);
					$(document).on('click', '#' + _aId, eventAction_);
				}
				return ;
			}
		}
	},

	disableItem: function(header_, text_) {
		var _menus = $(desktop._ctxMenu.getMenuByHeader(header_)).children('li');
		for (var i = 0; i < _menus.length; i++) {
			if(_menus[i].textContent == text_){
				var _menuli = $(_menus[i]);
				_menuli.removeClass('active');
				_menuli.addClass('disabled');
				var _aId = $(_menuli).children('a')[0].id;
				$('#' + _aId).removeClass('context-event');
				$(document).off('click', '#' + _aId);
				$(document).on("click", '#' + _aId, function(e){
					e.preventDefault();
				}) ;
				return ;
			}
		}
	}
});

//watch  dir :Default is desktop
//dir_: dir is watched 
// ignoreInitial_:
var Watcher = Event.extend({
	init: function(dir_, ignore_) {
		if (typeof dir_ == 'undefined') {
			dir_ = '/桌面';
		};
		this._prev = 0;
		this._baseDir = undefined;
		this._watchDir = dir_;
		this._oldName = null;
		this._watcher = null;
		this._evQueue = [];
		this._timer = null;
		this._ignore = ignore_ || /^\./;

		this._fs = require('fs');
		this._exec = require('child_process').exec;

		var _this = this;
		this._exec('echo $HOME', function(err, stdout, stderr) {
			if(err) throw err;
			_this._baseDir = stdout.substr(0, stdout.length - 1);
			_this._fs.readdir(_this._baseDir+_this._watchDir, function(err, files) {
				for(var i = 0; i < files.length; ++i) {
					_this._prev++;
				}
				var evHandler = function() {
					var filename = _this._evQueue.shift();
					_this._fs.readdir(_this._baseDir +_this._watchDir, function(err, files) {
						var cur = 0;
						for(var i = 0; i < files.length; ++i) {
							cur++;
						}

						if(_this._prev < cur) {
							_this._fs.stat(_this._baseDir +_this._watchDir+'/' + filename
								, function(err, stats) {
									_this.emit('add', filename, stats);
								});
							_this._prev++;
						} else if(_this._prev > cur) {
							_this.emit('delete', filename);
							_this._prev--;
						} else {
							if(_this._oldName == null) {
								_this._oldName = filename;
								return ;
							}
							if(_this._oldName == filename) {
								return ;
							}
							_this.emit('rename', _this._oldName, filename);
							_this._oldName = null;
						}
						if(_this._evQueue.length != 0) evHandler();
					});
				};
				_this._timer = setInterval(function() {
					if(_this._evQueue.length != 0) {
						// _this._evQueue.reverse();
						evHandler();
					}
				}, 200);

				_this._watcher = _this._fs.watch(_this._baseDir+_this._watchDir
					, function(event, filename) {
						if(event == 'change' || filename.match(_this._ignore) != null) return ;
						_this._evQueue.push(filename);
					});
			});
		});
	},

	//get dir 
	getBaseDir: function() {
		return this._baseDir + this._watchDir;
	},

	//close watch()
	close: function() {
		this._watcher.close();
		clearInterval(this._timer);
	}
});

