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
		this.callSuper();
		this._watchDir = dir_ || _global.$xdg_data_home;
		this._prev = 0;
		this._oldName = null;
		this._watcher = null;
		this._evQueue = [];
		this._timer = null;
		this._ignore = ignore_ || /^\./;

		var _this = this;
		_global._fs.readdir(_this._watchDir, function(err, files) {
			for(var i = 0; i < files.length; ++i) {
				_this._prev++;
			}

			var evHandler = function() {
				var filename = _this._evQueue.shift();
				_global._fs.readdir(_this._watchDir, function(err, files) {
					var cur = 0;
					for(var i = 0; i < files.length; ++i) {
						cur++;
					}

					if(_this._prev < cur) {
						_global._fs.stat(_this._watchDir + '/' + filename
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
					evHandler();
				}
			}, 200);

			_this._watcher = _global._fs.watch(_this._watchDir
				, function(event, filename) {
					if(event == 'change' || filename.match(_this._ignore) != null) return ;
					_this._evQueue.push(filename);
				});
		});
	},

	//get dir 
	getBaseDir: function() {
		return this._watchDir;
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
	//			}
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
	init: function(callback_) {
		this.Series = Serialize.prototype;
		this.$home = undefined;
		this.$xdg_data_dirs = undefined;
		this.$xdg_data_home = undefined;
		this.objects = [];
		
		var _this = this;
		this.Series.series([
			{
				fn: function(pera_, cb_) {
					//TODO: change the nodejs'API to ourselves
					_this._fs = require('fs');
					_this._exec = require('child_process').exec;
					WDC.requireAPI(['device'], function(dev) {
						_this._device = dev;
						cb_(null);
					});
				}
			},
			{
				fn: function(pera_, cb_) {
					_this._exec('echo $HOME', function(err, stdout, stderr) {
						if(err) {
							console.log(err);
							callback_(err);
						} else {
							_this.$home = stdout.substr(0, stdout.length - 1);
							_this.$xdg_data_home = _this.$home + '/.local/share/cdos';
							_this._exec('echo $XDG_DATA_DIRS', function(err, stdout, stderr) {
								if(err) {
									console.log(err);
									callback_(err);
								} else {
									_this.$xdg_data_dirs = stdout.substr(0, stdout.length - 1).split(':');
									for(var i = 0; i < _this.$xdg_data_dirs.length; ++i) {
										_this.$xdg_data_dirs[i] 
											= _this.$xdg_data_dirs[i].replace(/[\/]$/, '');
									}
			
									cb_(null);
								}
							});
						}
					});
				}
			}
		], function(err_, rets_) {
			if(err_)
				callback_(err_);
			else
				callback_(null);
		});
		
	},

	addGObjects: function() {
		var tasks = [];
		var cb = arguments[arguments.length - 1];
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
				this.objects[arguments[i].name] = arguments[i].class.create.apply(arguments[i].class, args);
			}
		}
		var _this = this;
		this.Series.series1(tasks, function(pera_, callback_) {
			pera_.args.push(function(err_) {
				callback_(err_);
			});
			_this.objects[pera_.name] = pera_.class.create.apply(pera_.class, pera_.args);
		});
	},

	removeAGObject: function(objName_) {
		delete this.objects[objName_];
	},

	get: function(objName_) {
		return this.objects[objName_];
	}
});

// Could be seen as a util-box
//
var Util = Class.extend({
	init: function(callback_) {
		this.entryUtil = EntryUtil.create(callback_);
	}
});

// TODO: replace nodejs' apis to ourselvs.
//
var EntryUtil = Event.extend({
	init: function(callback_) {
		var cb = callback_ || function() {};
		this._iconSearchPath = [];
		this._iconSearchPath.push(_global.$home + "/.local/share/icons/");
		for(var i = 0; i < _global.$xdg_data_dirs.length; ++i) {
			this._iconSearchPath.push(_global.$xdg_data_dirs[i] + "/icons/");
		}
		this._iconSearchPath.push("/usr/share/pixmaps");
		
		cb.call(this, null);
	},
	
	getIconPath: function(iconName_, size_, callback_) {
		//get theme config file
		//get the name of current icon-theme
		//1. search $HOME/.icons/icon-theme_name/subdir(get from index.theme)
		//2. if not found, search $XDG_DATA_DIRS/icons/icon-theme_name
		//   /subdir(get from index.theme)
		//3. if not found, search /usr/share/pixmaps/subdir(get from index.theme)
		//4. if not found, change name to current theme's parents' recursively 
		//   and repeat from step 1 to 4
		//5. if not found, return default icon file path(hicolor)
		//
		if(typeof callback_ !== "function")
			throw "Bad type of callback!!";
		
		var _this = this;
		var iconTheme = _global.get('theme').getIconTheme();
		_this.getIconPathWithTheme(iconName_, size_, iconTheme, function(err_, iconPath_) {
			if(err_) {
				_this.getIconPathWithTheme(iconName_, size_, "hicolor"
					, function(err_, iconPath_) {
						if(err_) {
							callback_.call(this, 'Not found');
						} else {
							callback_.call(this, null, iconPath_);
						}
					});
			} else {
				callback_.call(this, null, iconPath_);
			}
		});
	},

	getIconPathWithTheme: function(iconName_, size_, themeName_, callback_) {
		if(typeof callback_ != 'function')
			throw 'Bad type of function';
		
		var _this = this;
		var findIcon = function(index_) {
			if(index_ == _this._iconSearchPath.length) {
				callback_.call(this, 'Not found');
				return ;
			}
			var _path = _this._iconSearchPath[index_];
			if(index_ < _this._iconSearchPath.length - 1) _path += themeName_;
			_global._fs.exists(_path, function(exists_) {
				if(exists_) {
					var tmp = 'find ' + _path
						+ ' -regextype \"posix-egrep\" -regex \".*'
					 	+ ((index_ < _this._iconSearchPath.length - 1)
						? size_ : '') + '.*/' +iconName_ + '\.(svg|png|xpm)$\"';
					_global._exec(tmp, function(err, stdout, stderr) {
						if(stdout == '') {
							_global._fs.readFile(_path + '/index.theme'
								, 'utf-8', function(err, data) {
									var _parents = [];
									if(err) {
										console.log(err);
									} else {
										var lines = data.split('\n');
										for(var i = 0; i < lines.length; ++i) {
											if(lines[i].substr(0, 7) == "Inherits") {
												attr = lines[i].split('=');
												_parents = attr[1].split(',');
											}
										}
									}
									//recursive try to find from parents
									var findFromParent = function(index__) {
										if(index__ == _parents.length) return ;
										_this.getIconPathWithTheme(iconName_, size_, _parents[index__]
											, function(err_, iconPath_) {
												if(err_) {
													findFromParent(index__ + 1);
												} else {
													callback_.call(this, null, iconPath_);
												}
											});
									};
									findFromParent(0);
									//if not fonud
									findIcon(index_ + 1);
								});
						} else {
							callback_.call(this, null, stdout.split('\n'));
						}
					});
				} else {
					findIcon(index_ + 1);
				} 
			});
		};
		findIcon(0);
	},

	parseDesktopFile: function(path_, callback_) {
		if(typeof callback_ !== 'function')
			throw 'Bad type of callback!!';
		
		var fs = require('fs');
		fs.readFile(path_, 'utf-8', function(err, data) {
			if(err) {
				callback_.call(this, null);
			} else {
				data = data.replace(/[\[]{1}[a-z, ,A-Z]*\]{1}\n/g, '$').split('$');
				var lines = data[1].split('\n');
				var attr = [];
				for(var i = 0; i < lines.length - 1; ++i) {
					var tmp = lines[i].split('=');
					attr[tmp[0]] = tmp[1];
					for(var j = 2; j < tmp.length; j++)
						attr[tmp[0]] += '=' + tmp[j];
				}
				console.log("Get desktop file successfully");
				callback_.call(this, null, attr);
			}
		});
	},

	generateADesktopFile: function(path_, data_, callback_) {
		var _cb = callback_ || function() {};
		var _data = "";
		for(var key in data_) {
			_data += key + '\n';
			for(var key2 in data_[key]) {
				if(typeof data_[key][key2] === 'undefined') continue;
				_data += key2 + '=' + data_[key][key2] + '\n';
			}
		}
		_global._fs.writeFile(path_, _data, function(err) {
			if(err) throw err;
			_cb.call(this);
		});
	},

	getMimeType: function(path_, callback_) {
		if(typeof callback_ !== 'function')
			throw 'Bad type of callback!!';
		var _this = this;
		_global._exec('xdg-mime query filetype ' + path_.replace(/ /g, '\\ ')
				, function(err, stdout, stderr) {
					if(err) {
						console.log(err);
						callback_.call(this, 'Unknown mime-type!');
					} else {
						callback_.call(this, null, stdout.replace('\n', ''));
					}
				});
	},

	getDefaultApp: function(mimeType_, callback_) {
		if(typeof callback_ !== 'function')
			throw 'Bad type for callback!!';
		var _this = this;
		_global._exec('xdg-mime query default ' + mimeType_
			, function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				if(stdout == '') {
					//default to major type
				}
				_this.findDesktopFile(stdout.replace('\n', ''), function(err, filePath_) {
					callback_.call(this, err, filePath_);
				});
			}
		});
	},

	findDesktopFile: function(fileName_, callback_) {
		var _this = this;
		
		if(typeof callback_ !== 'function')
			throw 'Bad type for callback';
	
		var tryInThisPath = function(index_) {
			if(index_ == _this.$xdg_data_dirs.length) {
				callback_.call(this, 'Not found');
				return ;
			}
			_global._exec('find ' + _this.$xdg_data_dirs[index_] + ' -name ' + fileName_
					, function(err, stdout, stderr) {
						if(stdout == '') {//err || 
							tryInThisPath(index_ + 1);
						} else {
							_this.emit('findDFile', null, stdout.replace('\n', ''));
							callback_.call(this, null, stdout.replace('\n', ''));
						}
					});
		};
		tryInThisPath(0);
	},

	//get property information of filename_
	//filename_: full file path;
	//callback_: callback function;
	getProperty:function(filename_,callback_){
		var _this = this;
		if(typeof callback_ !== 'function')
			throw 'Bad type for callback';
		_global._exec('stat ' + filename_, function(err, stdout, stderr){
				if(stdout == '') {//err 
					throw 'Bad filename_';
				} else {
					var attrs = stdout.split('\n');
					var attr_ = attrs[1].replace(/(\s+$)|(^\s+)/g, "");
					var size_ = attr_.split(' ')[1];
					attr_  = attrs[3].replace(/(\s+$)|(^\s+)/g, "");
					attr_ = attr_.replace(/\s+/g," ");
					var access_ = attr_.split(' ')[1].substr(6, 10);
					var attr_s = attr_.split(' ');
					var uid_ = attr_s[5].substr(0,attr_s[5].length -1);
					var gid_ = attr_s[9].substr(0,attr_s[9].length -1);
					attr_ = attrs[4].split(' ');
					var access_time = attr_[1] + ' ' + attr_[2].substr(0,8);
					attr_ = attrs[5].split(' ');
					var modify_time = attr_[1] + ' ' + attr_[2].substr(0,8);
					var attr = [];

					attr['size'] = size_;
					attr['access'] = access_;
					attr['access_time'] = access_time;
					attr['modify_time'] = modify_time;
					attr['uid'] = uid_;
					attr['gid'] = gid_;

					callback_.call(this, null ,attr);
				}
		});
	},

	// copy file ;
	// from : fromPath_,
	// to : outPath_.
	copyFile:function(fromPath_, outPath_){
		// var _fs = require('fs');
		_global._fs.readFile(fromPath_, function(err, data){
			_global._fs.writeFile(outPath_, data, function(err){
				if (err) {
					console.log(err);
				}
			});
		});
	},
	//rm file 
	//path_: file Path_
	removeFile:function(path_){
		_global._exec('rm '+path_, function(err, out ,stderr){
			if(err) throw 'util.js-rmFile: bad path';
		});
	}
});

// The base class for all command classes
//
var Command = Class.extend({
	doIt: function() {},
	undo: function() {}
});

// NormalCommand which is allowed to undo should be inited with two
// handlers, get_ and set_.
//
var NormalCommand = Command.extend({
	init: function(ctx_, get_, set_, newVal_) {
		this._cType = 0;
		this._ctx = ctx_;
		this._get = get_;
		this._set = set_;
		this._newVal = newVal_;
	},

	doIt: function() {
		this._oldVal = this._get.apply(this._ctx);
		this._set.apply(this._ctx, this._newVal);
	},

	undo: function() {
		this._set.apply(this._ctx, this._oldVal);
	}
});

// NoUndoCommand which is not allowed to undo should be inited with only one handler
//
var NoUndoCommand = Command.extend({
	init: function(ctx_, cType_, handler_/* , args_ */) {
		this._ctx = ctx_;
		this._cType = cType_;
		this._handler = handler_;
		this._args = [];
		for(var i = 2; i < arguments.length; ++i)
			this._args.push(arguments[i]);
	},

	doIt: function() {
		this._handler.apply(this._ctx, this._args);
	}
})

// The center processor of command
//
var CommandProcessor = Class.extend({
	init: function() {
		this._size = 20;
		this._cmdList = new Array(this._size);
		this._idx = -1;
	},
		
	perform: function(cmd_) {
		if(cmd_._cType == 0) {
			if(this._idx == this._size - 1) {
				this._cmdList.shift();
			} else {
				this._idx++;
			}
			this._cmdList[this._idx] = cmd_;
		}
		cmd_.doIt();
	},

	undo: function() {
		if(this._idx < 0) return ;
		this._cmdList[this._idx--].undo();
	},

	redo: function() {
		if(this._idx == this._cmdList.length - 1) return ;
		this._cmdList[++this._idx].doIt();
	}
});

// The base Class for Cache classes
//
var Cache = Class.extend({
	// The unit of timeout_ is second
	// 0 means no timeout
	//
	init: function(timeout_) {
		this.to = timeout_ || 0;
		this._cacheList = [];

		if(this.to != 0) {
			this._t = new Array(this.to);
			for(var i = 0; i < this._t.length; ++i) this._t = [];
			this._ti = 0;
			var _this = this;
			this._timer = setInterval(function() {
				var tmp;
				while(typeof (tmp = _this._t[_this._ti].pop()) !== 'undefined') {
					delete _this._cacheList[tmp];
				}
				_this._ti = (_this._ti + 1) % this.to;
			}, 1000);
		}
	},

	destroy: function() {
		clearInterval(this._timer);
	},

	// If the return is 'undefined', some functions should be implemented
	// in client classes to handle this situation.
	get: function(key_) {
		return this._cacheList[key_].val;
	},
	
	set: function(key_, val_) {
		this._cacheList[key_] = val_;

		if(this.to != 0) {
			var idx = (this._ti + this.to - 1) % this.to;
			this._t[idx].push(key_);
		}
	}
});

