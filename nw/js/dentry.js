//base class for varies dentries
//id_: DEntry's Unic ID.
//position_({left, top}): The position of this DEntry.
//path_: file path
//
var DEntry = Widget.extend({
	init: function(id_, tabIndex_, path_, position_) {
		this.callSuper(id_, position_);
		this._path = path_;
		this._tabIndex = tabIndex_;
		
		this._name = id_;
		this._imgPath = undefined;

		this.PATTERN = "<img draggable='true'/>" + "<p>" + this._name + "</p>";
		this._dEntry = $('<div>', {
			'class': 'icon',
			'id': this._id,
			'draggable': 'true',
			'tabindex': this._tabIndex
		});
	},

	show: function() {
		if(typeof this._position === 'undefined') {
			alert("no position!!");
			return ;
		}

		this._dEntry.html(this.PATTERN);
		$('#grid' + this._position.x + this._position.y).append(this._dEntry);

		//var target = document.getElementById(this._id);
		//this.bindDrag(target);
		this.bindEvents();
	},

	bindEvents: function() {
		var _entry = this;
		var target_ = $('#' + this._id)

		_entry.bindDrag(target_[0]);

		target_.dblclick(function() {
			_entry.open();
		});
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
	init: function(id_, tabIndex_, path_, position_) {
		this.callSuper(id_, tabIndex_, path_, position_);
		this._execCmd = undefined;
	},

	parseDesktopFile: function() {
		var getExecCmd = function(attr_) {
			this._execCmd = attr_['Exec'].split(' ')[0];
		};
		var getImgPath = function(attr_) {
		};
		var getEntryName = function(attr_) {
			this._name = attr_['Name[zh_CN]'];
		};
		var fs = require('fs');

		fs.readFile(this._path, 'utf-8', function(err, data) {
			if(err) {
				console.log(err);
			} else {
				var lines = data.split('\n');
				var attr = [];
				for(var i = 1; i < lines.length - 1; ++i) {
					var tmp = lines[i].split('=');
					attr[tmp[0]] = tmp[1];
				}
				console.log("Get desktop file successfully");

				getExecCmd();
				getImgPath();
				getEntryName();
			}
		});
	},
	
	open: function() {
		//launch app
	}
});

//Desktop Entry for directories
//
var DirEntry = DEntry.extend({
	init: function(id_, tabIndex_, path_, position_) {
		this.callSuper(id_, tabIndex_, path_, position_);
	},

	open: function() {
		//open dir
	}
});

//Desktop Entry for normal files
//
var FileEntry = DEntry.extend({
	init: function(id_, tabIndex_, path_, position_) {
		this.callSuper(id_, tabIndex_, path_, position_);
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

