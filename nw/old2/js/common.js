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
//before -> type: function(item1, item2), ret: {true(if item1 is before item2)|false}
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

