//base class for varies dentries
//id_: DEntry's Unic ID.
//position_({left, top}): The position of this DEntry.
//path_: file path
//
var DEntry = Widget.extend({
	init: function(id_, tabIndex_, path_, position_) {
		if(typeof id_ === "undefined"
			|| typeof tabIndex_ === "undefined"
			|| typeof path_ === "undefined") {
			console.log("not enough params!! init failed!!");
			return ;
		}

		this.callSuper(id_, position_);
		this._path = path_;
		this._tabIndex = tabIndex_;
		
		this._name = id_;
		this._imgPath = undefined;
		this._exec = require('child_process').exec;

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
		$('#' + this._dEntry + ' img').attr('src', this._imgPath);

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
		this._basePath = "/usr/share/icons/Mint-X/apps/48/";

		this.parseDesktopFile();
	},

	parseDesktopFile: function() {
		var getExecCmd = function(attr_) {
			this._execCmd = attr_['Exec'].split(' ')[0];
		};
		var getImgPath = function(attr_) {
			/*
			this._exec('echo $XDG_DATA_DIRS', function(err, stdout, stderr) {
				if(err !== null) {
					console.log(err);
				} elss {
					var _pathes = stdout.split(':');
				}
			});
			*/
			this._imgPath = this._basePath + attr_['Icon'] + ".png";
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
		this._exec(this._execCmd, function(err, stdout, stderr) {
			if(err !== null) {
				console.log(err);
			}
		});
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

