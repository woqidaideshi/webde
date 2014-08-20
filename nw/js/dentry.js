//base class for varies dentries
//id_: DEntry's Unic ID.
//position_({left, top}): The position of this DEntry.
//path_: file path
//
var DEntry = Widget.extend({
	init: function(id_, path_, position_) {
		this.callSuper(id_, position_);
		this._path = path_;
		this._name = id_;

		this.PATTERN = "<img draggable='true'/>" + "<p>" + this._name + "</p>";
		this._dEntry = $('<div>', {
			'class': 'icon',
			'id': this._id,
			'draggable': 'true',
			'onselectstart': 'return false'
		});
	},

	show: function() {
		if(typeof this._position === 'undefined') {
			alert("no position!!");
			return ;
		}

		this._dEntry.html(this.PATTERN);
		$('#grid_' + this._position.x +'_'+ this._position.y).append(this._dEntry);

		var target = document.getElementById(this._id);
		this.bindDrag(target);
	},

	getName: function() {return this._name;},

	setName: function(name_) {
		//redraw dentry's name
		this._name = name_;
	},

	drop: function(ev) {
		console.log("prevent!!");
		ev.preventDefault();
		ev.stopPropagation();
	}
});

//Desktop Entry for application files (a.k.a .desktop)
//
var AppEntry = DEntry.extend({
	init: function(id_, path_, position_) {
		this.callSuper(id_, path_, position_);
	},
	
	open: function() {
		//launch app
	}
});

//Desktop Entry for directories
//
var DirEntry = DEntry.extend({
	init: function(id_, path_, position_) {
		this.callSuper(id_, path_, position_);
	},

	open: function() {
		//open dir
	}
});

//Desktop Entry for normal files
//
var FileEntry = DEntry.extend({
	init: function(id_, path_, position_) {
		this.callSuper(id_, path_, position_);
		this._type = this.parseType(path_);
	},
	
	parseType: function(path__) {
		//get file type from path__
		console.log("type is " + this.type);
	},
	
	open: function() {
		//open files with specific app
	}
});

