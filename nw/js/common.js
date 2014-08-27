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
	
	push: function(item_) {
		//check last key to find the idle item
		//no need to aquire memory
		var _idx = this._items.length - 1;
		if(_idx < 0 || this._items[_idx] != null) {
			this._items.push(item_);
			return ;
		}
		this._items[_idx] = item_;
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
		this._items[idx_] = null;
		this.order();
	},
	
	before: function(item1_, item2_) {
		if(item1_ == null) return false;
		if(item2_ == null) return true;
		return this._before(item1_, item2_);
	},

	order: function() {}

});
