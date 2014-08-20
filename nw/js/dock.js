//dock.js  for dock 
 var Dock = Class.extend({
	init: function(position_){
		this._id = "dock";
 		this._position = position_;
 		this._class = "dock";
 		this._name = "dock";

 		this._dock = $('<div>', {
			'class': this._class,
			'id': this._id,
			'title': this._name,
			'onselectstart': 'return false'
		});
	},
 	show: function() {
		//add dock to body
		$('body').append(this._dock);
	},

	getPosition: function() {return	this._position;},

	setPosition: function(position_) {
		//redraw it with new position
		//$('#' + id).attr();
		this._position = position_;
	},

	getID: function() {return this._id;},

	setID: function(id_) {this._id = id_;},//needed?

	getName: function() {return this._name;},

	setName: function(name_) {
		//redraw dentry's name
		this._name = name_;
	},
});

