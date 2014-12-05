//This file includes base classes and all abstract interfaces used in this project
//

//Base Class for every class in this project
//
/* function Class() {} */

// //Use extend to realize inhrietion
// //
// Class.extend = function extend(props) {
  // var prototype = new this();
  // var _super = this.prototype;

  // for(var name in props) {
    // //if a function of subclass has the same name with super
    // //override it, not overwrite
    // //use this.callSuper to call the super's function
    // //
    // if(typeof props[name] == "function"
        // && typeof _super[name] == "function") {
      // prototype[name] = (function(super_fn, fn) {
        // return function() {
          // var tmp = this.callSuper;
          // this.callSuper = super_fn;
          
          // var ret = fn.apply(this, arguments);

          // this.callSuper = tmp;
          
          // if(!this.callSuper) {
            // delete this.callSuper;
          // }

          // return ret;
        // }
      // })(_super[name], props[name])
    // } else {
      // prototype[name] = props[name];
    // }
  // }

  // var SubClass = function() {};

  // SubClass.prototype = prototype;
  // SubClass.prototype.constructor = SubClass;

  // SubClass.extend = extend;
  // //Use create to replace new
  // //we need give our own init function to do some initialization
  // //
  // SubClass.create = SubClass.prototype.create = function() {
    // var instance = new this();

    // if(instance.init) {
      // instance.init.apply(instance, arguments);
    // }

    // return instance;
  // }

  // return SubClass;
/* } */

//Event base Class
//Inherited from Node.js' EventEmitter
//require('events').EventEmitter.prototype
var Event = Class.extend({
  init: function() {
    this._handlers = [];
  },

  on: function(event_, handler_) {
    if(typeof this._handlers[event_] === 'undefined') {
      this._handlers[event_] = [];
    }
    this._handlers[event_].push(handler_);
    return this;
  },

  off: function(event_, handler_) {
    if(arguments.length == 0) {
      for(var key in this._handlers) {
        this._handlers[key] = null;
        delete this._handlers[key];
      }
      return this;
    }
    if(arguments.length == 1 && typeof this._handlers[event_] !== 'undefined') {
      this._handlers[event_] = null;
      delete this._handlers[event_];
      return this;
    }
    for(var idx = 0; idx < this._handlers[event_].length; ++idx) {
      if(handler_ == this._handlers[event_][idx]) {
        this._handlers[event_].splice(idx, 1);
        break;
      }
    }
    return this;
  },

  emit: function(event_) {
    if(typeof this._handlers[event_] === 'undefined') return ;
    var args = [];
    for(var i = 1; i < arguments.length; ++i)
      args.push(arguments[i]);
    for(var i = 0; i < this._handlers[event_].length; ++i) {
      this._handlers[event_][i].apply(this, args);
    }
    return this;
  }
});

//The base Class for Model classes
//
var Model = Event.extend({
  init: function(id_, parent_) {
    this.callSuper();
    this._id = id_;
    this._parent = parent_;
    this._c = []; // model container
    this._size = 0;
    // this._obList = [];
  },

  release: function() {},

  getID: function() {return this._id;},

  getParent: function() {return this._parent;},

  add: function(component_) {
    if(typeof component_ === 'undefined' || component_ == null) return false;
    if(typeof this._c[component_.getID()] !== "undefined") {
      this.emit('add', 'This component[id: ' + component_.getID() + '] has already existed!!');
      return false;
    }
    this._c[component_.getID()] = component_;
    this.emit('add', null, component_);
    ++this._size;
    return true;
  },

  remove: function(component_) {
    if(typeof component_ === 'undefined' || component_ == null) return false;
    if(typeof this._c[component_.getID()] === 'undefined') {
      this.emit('remove', 'This component[id: ' + component_.getID() + '] is not existed!!');
      return false;
    }
    this.emit('remove', null, component_);
    this._c[component_.getID()] = null;
    delete this._c[component_.getID()];
    --this._size;
    return true;
  },

  getCOMById: function(id_) {
    return this._c[id_];
  },

  getCOMByAttr: function(attr_, value_) {
    for(var key1 in this._c) {
      for(var key2 in this._c[key1]) {
        if(key2 == attr_ && this._c[key1][key2] == value_)
          return this._c[key1];
      }
    }
    return null;
  },

  getAllCOMs: function() {
    return this._c;
  },

  has: function(cID_) {
    return ((typeof this.getCOMById(cID_) === 'undefined') ? false : true);
  },

  size: function() {return this._size;}

  // addObserver: function(observer_) {
    // this._obList[observer_._id] = observer_;
  // },

  // removeObserver: function(observer_) {
    // delete this._obList[observer_._id];
  // },

  // notify: function(updatedObj_) {
    // for(var key in this._obList) {
      // this._obList[key].update(updatedObj_);
    // }
  /* } */
});

//The base Class for Observer classes
//
var Observer = Class.extend({
  init: function(id_) {
    this._id = id_;
  },

  getID: function() {return this._id;},

  registObservers: function() {}
});

//The base Class for View classes
//One kind of Observer
//
var View = Observer.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_);
    this._model = model_;
    this._parent = parent_;
    this.$view = null;
    this._controller = null; // created by subclasses
    // this._ops = []; // this array contains ops to update this view

    // this._model.addObserver(this);
  },

  destroy: function() {
    this.hide();
    for(var key in this.__handlers) {
      this._model.off(key, this.__handlers[key]);
    }
  },

  getModel: function() {
    return this._model;
  },

  getParent: function() {
    return this._parent;
  },

  getView: function() {
    return this.$view;
  },

  getCtrlor: function() {
    return this._controller;
  },

  show: function() {},

  hide: function() {}
});

//The base Class for Controller classes
//One kind of Observer
//
var Controller = Observer.extend({
  init: function(view_) {
    this.callSuper(view_.getID() + '-controller');
    this._model = view_._model;
    this._view = view_;

    // this._model.addObserver(this);
  },

  destroy: function() {
    // this._model.removeObserver(this);
  }
});

