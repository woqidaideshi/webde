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
			//console.log("not enough params!! init failed!!");
			//return ;
			throw "Not enough params!! Init failed!!";
		}

		this.callSuper(id_, position_);
		this._path = path_;
		this._tabIndex = tabIndex_;
		
		this._name = id_;
		this._imgPath = undefined;
		this._exec = require('child_process').exec;

		this.PATTERN = "<img/>" + "<p>" + this._name + "</p>";// draggable='true'
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

		$('#grid_' + this._position.x + '_' + this._position.y).append(this._dEntry);
		//var target = document.getElementById(this._id);
		//this.bindDrag(target);
		this.bindEvents();
	},

	hide: function() {
		$('#grid_' + this._position.x + '_' + this._position.y).empty();
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
/*
	drag: function(ev) {
		if(ev.target.id != "") {
			this.callSuper(ev);
		}
	},
*/
	drop: function(ev) {
		console.log("prevent!!");
		ev.preventDefault();
		ev.stopPropagation();
	}
});

//Desktop Entry for application files (a.k.a .desktop)
//
var AppEntry = DEntry.extend({
	//id_: AppEntry's id
	//tabIndex_: the teb squence of this AppEntry
	//path_: the path of corresponding .desktop file
	//position_(option): the positon to show in destop's grid{x, y}
	//
	init: function(id_, tabIndex_, path_, position_) {
		this.callSuper(id_, tabIndex_, path_, position_);
		this._execCmd = undefined;
		this._type = 'app';
	},

	show: function() {
		var _this = this;
		_this.callSuper();
		utilIns.entryUtil.parseDesktopFile(_this._path, function(err_, file_) {
			if(err_) console.log(err_);
			//get launch commad
			_this._execCmd = file_['Exec'].replace(/%(f|F|u|U|d|D|n|N|i|c|k|v|m)/g, '')
				.replace(/\\\\/g, '\\');
			//get icon
			utilIns.entryUtil.getIconPath(file_['Icon'], 48, function(err_, imgPath_) {
				if(err_) {
					console.log(err_);
				} else {
					_this._imgPath = imgPath_[0];
					$('#' + _this._id + ' img').attr('src', _this._imgPath);
				}
			});
			//get name
			if(typeof file_['Name[zh_CN]'] !== "undefined") {
				_this._name = file_['Name[zh_CN]'];
			} else {
				_this._name = file_['Name'];
			}
			$('#' + _this._id + ' p').text(_this._name);
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

//Desktop Entry for normal files
//
var FileEntry = DEntry.extend({
	init: function(id_, tabIndex_, path_, position_) {
		this.callSuper(id_, tabIndex_, path_, position_);
		
		var match = /^.*[\/]([^\/]*)[\.]([^\.]*)$/.exec(path_);
		if(match == null) {
			match = /^.*[\/]([^\/]*)$/.exec(path_);
			this._type = '';
		} else {
			this._type = match[2];
		}
		this._name = match[1];
	},
	
	show: function() {
		var _this = this;
		_this.callSuper();
		utilIns.entryUtil.getMimeType(_this._path, function(err_, mimeType_) {
			utilIns.entryUtil.getDefaultApp(mimeType_, function(err_, appFile_) {
				if(err_) console.log(err_);
				utilIns.entryUtil.parseDesktopFile(appFile_, function(err_, file_) {
					if(err_) console.log(err_);
					utilIns.entryUtil.getIconPath(file_['Icon'], 48, function(err_, imgPath_) {
						if(err_) {
							console.log(err_);
						} else {
							_this._imgPath = imgPath_[0];
							$('#' + _this._id + ' img').attr('src', _this._imgPath);
						}
					});
				});
			});
		});
		var _name = (this._type == '' || this._type == 'dir') 
									? this._name : (this._name + '.' + this._type);
		$('#' + _this._id + ' p').text(_name);
	},

	open: function() {
		//open files with specific app
		this._exec('xdg-open ' + this._path.replace(' ', '\\ ')
				, function(err, stdout, stderr) {
					if(err) console.log(err);
				});
	}
});

//Desktop Entry for directories
//
var DirEntry = FileEntry.extend({
	init: function(id_, tabIndex_, path_, position_) {
		this.callSuper(id_, tabIndex_, path_, position_);
	
		this._type = 'dir';
	}
});

//Theme Entry
//
var ThemeEntry = DEntry.extend({
	//id_: ThemeEntry's id
	//tabIndex_: the teb squence of this AppEntry
	//path_: the path of corresponding .desktop file
	//iconName_: the name of the icon image
	//name_: the name of this entry to show
	//position_(option): the positon to show in destop's grid{x, y}
	//
	init: function(id_, tabIndex_, path_, iconName_, name_, position_) {
		this.callSuper(id_, tabIndex_, path_, position_);
		this._iconName = iconName_;
		this._name = name_;
	},

	show: function() {
		this.callSuper();
		
		var self = this;
		utilIns.entryUtil.getIconPath(this._iconName, 48, function(err_, iconPath_) {
			if(err_) {
				console.log(err_);
			} else {
				$('#' + self._id + ' img').attr('src', iconPath_[0]);
			}
		});
		$('#' + self._id + ' p').text(self._name);
	},

	open: function() {
		this._exec('xdg-open ' + this._path, function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			}
		});
	}
});

