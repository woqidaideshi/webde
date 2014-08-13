//base class for varies dentries
//id_: DEntry's Unic ID.
//position_({left, top}): The position of this DEntry.
//path_: file path
//
var DEntry = Class.extend({
	init: function(id_, position_, path_) {
		this._id = id_;
		this._position = position_;
		this._path = path_;
		this._name = id_;

		this.PATTERN = "<img draggable='true'/>" + "<p>" + this._name + "</p>";
		this._dEntry = $('<div>', {
			'class': 'icon',
			'id': this._id,
			'draggable': 'true'
		});
	},

	show: function() {
		if(typeof this._position === 'undefined') {
			alert("no position!!");
			return ;
		}

		this._dEntry.html(this.PATTERN);
		$('#grid' + this._position.x + this._position.y).append(this._dEntry);

		var target = document.getElementById(this._id);
		target.ondragstart = drag;
		target.onclick = function() {alert(id);}
	},

	getPosition: function() {return	this._position;},

	setPosition: function(position_) {
		//redraw it with new position
		//$('#' + id).attr();
		this._position = position_;
	},

	getID: function() {return this._id;},

	setID: function(id_) {this._id = id_;},//needed?

	getName:function() {return this._name;},

	setName: function(name_) {
		//redraw dentry's name
		this._name = name_;
	}
});
/*
function DEntry(id_, position_, path_) {
	var id = id_;
	var position = position_;
	var path = path_;
	var name = id_;

	var PATTERN = "<img draggable='true'/>" + "<p>" + name + "</p>"; 
	var dEntry = $('<div>', {
			'class': 'icon',
			'id': id,
			'draggable': 'true'
		});

	//public interfaces
		
	this.constructor.prototype.show = function() {
		if(typeof position === 'undefined') {
			alert("no position!!");
			return ;
		}

		dEntry.html(PATTERN);
		$('#grid' + position.x + position.y).append(dEntry);

		var target = document.getElementById(id);
		target.ondragstart = drag;
		target.onclick = function() {alert(id);}
	}

	this.constructor.prototype.getPosition = function() {return position;},

	this.constructor.prototype.setPosition = function(position_) {
		//redraw it with new position
		//$('#' + id).attr();
		position = position_;
	}

	this.constructor.prototype.getID = function() {return id;}

	this.constructor.prototype.setID = function(id_) {id = id_;}//needed?

	this.constructor.prototype.getName = function() {return name;}

	this.constructor.prototype.setName = function(name_) {
		//redraw dentry's name
		name = name_;
	}
}*/

//Desktop Entry for application files (a.k.a .desktop)
//
var AppEntry = DEntry.extend({
	init: function(id_, position_, path_) {
		this.callSuper(id_, position_, path_);
	},
	
	open: function() {
		//launch app
	}
});
/*
function AppEntry(id_, position_, path_) {
	this.constructor.prototype = new DEntry(id_, position_, path_);
	//_extends(this, new DEntry(id_, position_, path_));

	//self public interface
	this.open = function() {
		//launch app
	}
}
*/

//Desktop Entry for directories
//
function DirEntry(id_, position_, path_) {
	var super_ = new DEntry(id_, position_, path_);
	this.constructor.prototype = super_.constructor.prototype;

	//self public interface
	this.constructor.prototype.open = function() {
		//open dir
	}
}

//Desktop Entry for normal files
//
function FileEntry(id_, position_, path_) {
	var super_ = new DEntry(id_, position_, path_);
	this.constructor.prototype = super_.constructor.prototype;
	var type = undefined;
	
	function parseType(path__) {
		//get file type from path__
		console.log("type is " + type);
	}

	//constructor
	(function () {
		type = parseType(path_);
	})();

	//self public interface
	this.constructor.prototype.open = function() {
		//open files with specific app
	}
}
