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
	init: function() {},

	addObserver: function(observer_) {},

	removeObserver: function(observer_) {},

	notify: function(updatedObj_) {}
});

//The base Class for Observer classes
//
var Observer = Class.extend({
	init: function() {},

	update: function(updatedObj_) {}
});

//The base Class for View classes
//One kind of Observer
//
var View = Observer.extend({
	init: function(model_) {
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
		this._model = view_._model;
		this._view = view_;

		this._model.addObserver(this);
	},

	destroy: function() {
		this._model.removeObserver(this);
	}
});

