//This file includes base classes and all abstract interfaces used in this project
//

//Base Class for every class in this project
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

//The base Class for Model classes
//
var Model = Class.extend({
	init: function(id_) {
		this._id = id_;
		this._obList = [];
	},

	addObserver: function(observer_) {
		this._obList[observer_._id] = observer_;
	},

	removeObserver: function(observer_) {
		delete this._obList[observer_._id];
	},

	notify: function(updatedObj_) {
		for(var key in this._obList) {
			this._obList[key].update(updatedObj_);
		}
	}
});

//The base Class for Observer classes
//
var Observer = Class.extend({
	init: function(id_) {
		this._id = id_;
	},

	update: function(updatedObj_) {}
});

//The base Class for View classes
//One kind of Observer
//
var View = Observer.extend({
	init: function(model_) {
		this.callSuper(model_._id + '-view');
		this._model = model_;

		this._model.addObserver(this);
	},
	
	destroy: function() {
		this._model.removeObserver(this);
	}
});

//The base Class for Controller classes
//One kind of Observer
//
var Controller = Observer.extend({
	init: function(view_) {
		this.callSuper(view_._model._id + '-controller');
		this._model = view_._model;
		this._view = view_;

		this._model.addObserver(this);
	},

	destroy: function() {
		this._model.removeObserver(this);
	}
});

