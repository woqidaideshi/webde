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
		target.ondragstart = this.drag;
		target.onclick = function() {alert(id);}
	},

	getName: function() {return this._name;},

	setName: function(name_) {
		//redraw dentry's name
		this._name = name_;
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

