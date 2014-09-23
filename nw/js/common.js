//This file includes all common help classes.
//

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

//TODO: change to MVC style
//
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

//TODO: change to nodejs independent
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

// This class is used for serialize tasks running
//
var Serialize = Class.extend({
	init: function() {},

	// fnArr_: [
	//	{
	//		fn: function(pera_, callback_) (type: Funciton, callback_ -> function(err_, ret_))
	//		pera: {} (type: Object)
	//	},
	//	...
	// ],
	// callback_: function(err_, rets_) (rets_ -> [ret1, ret2, ...])
	//
	// example:
	//	Serialize.series([
	//		{
	//			fn: function(pera_, callback_) {
	//				// do something
	//				callback_(null, ret); // should be the last sentence
	//			},
	//			pera: {}
	//		},
	//		{
	//			fn: function(pera_, callback_) {
	//				// do something
	//				callback_(null, ret); // should be the last sentence
	//			},
	//		},
	//		...
	//	], function(err_, rets_) {
	//		//rets_[i] = fnArr_[i]'s ret
	//	});
	//
	series: function(fnArr_, callback_) {
		if(!Array.isArray(fnArr_)) {
			console.log('bad type for series, should be an array');
			return ;
		}
		var cb = callback_ || function() {};
		var complete = 0, rets = [];
		var doSeries = function(iterator_) {
			var iterate = function() {
				iterator_(fnArr_[complete], function(err_) {
					if(err_) {
						callback_(err_);
					} else {
						complete += 1;
						if(complete >= fnArr_.length) {
							cb(null, rets);
						} else {
							iterate();
						}
					}
				});
			};
			iterate();
		};
		doSeries(function(fn_, callback_) {
			fn_.fn(fn_.pera, function(err_, ret_) {
				rets[complete] = ret_;
				callback_(err_, ret_);
			});
		});
	},

	// peraArr_: [
	//	{
	//		arg1: value,
	//		arg2: value,
	//		...
	//	},
	//	...
	// ],
	// fn_: function(pera_, callback_) (type: Funciton, callback_ -> function(err_, ret_))
	// callback_: function(err_, rets_) (rets_ -> [ret1, ret2, ...])
	//
	// example:
	//	Serialize.series1([
	//		{
	//			arg1: value,
	//			arg2: value,
	//			...
	//		},
	//		...
	//	], function(pera_, callback_) {
	//		// do something
	//		callback_(null, ret); // should be the last sentence
	//	}, function(err_, rets_) {
	//		//rets_[i] = fnArr_[i]'s ret
	//	});
	//
	series1: function(peraArr_, fn_, callback_) {
		var fnArr = [];
		for(var i = 0; i < peraArr_.length; ++i) {
			fnArr[i] = {
				'fn': fn_,
				'pera': peraArr_[i]
			};
		}
		this.series(fnArr, callback_);
	},
});

// This class includes all global objects used in this project
//
var Global = Class.extend({
	// g_objects: [
	//	{
	//		name: obj_name(String),
	//		class: class_name(Object),
	//		args: init_args(Array),
	//		serialize: (Bool) // should be inited serialized?
	//	},
	//	{...}
	// ]
	init: function() {
		this.Series = Serialize.prototype;
		this.objects = [];
		addGObjects(arguments);
	},

	addGObjects: function() {
		var tasks = [];
		for(var i = 0; i < arguments.length; ++i) {
			var isSerialize = arguments[i].serialize || false;
			var args = arguments[i].args || [];
			if(isSerialize) {
				tasks.push({
					'name': arguments[i].name,
					'class': arguments[i].class,
					'args': args
				});
			} else {
				this.objects[arguments.name] = arguments.class.create.apply(this, args);
			}
		}
		var _this = this;
		this.Series.series1(tasks, function(pera_, callback_) {
			var args = pera_.args.push(function(err_) {
				callback_(err_);
			});
			_this.objects[pera_.name] = pera_.class.create.apply(this, args);
		});
	},

	removeAGObject: function(objName_) {
		delete this.objects[objName_];
	},

	get: function(objName_) {
		return this.objects[objName_];
	}
});
