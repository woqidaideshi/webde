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
		this._focused = false;
		
		this._name = id_;
		this._imgPath = undefined;
		this._exec = require('child_process').exec;

		this.PATTERN = "<img draggable='false'/><p>" + this._name + "</p>";
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

		_entry.attachCtxMenu();

		target_.mouseenter(function() {
			$(this).parent().addClass('norhover');
			var $p = $('#' + _entry._id + ' p');
			$p.css('height', $p[0].scrollHeight);
		}).mouseleave(function() {
			$(this).parent().removeClass('norhover');
			$('#' + _entry._id + ' p').css('height', '32px');
		})/* .focus(function(e) { */
			// e.preventDefault();
			// [> if(e.which == 9) <]
				// [> _entry.focus(); <]
		// }).blur(function(e) {
			// e.preventDefault();
			// [> if(e.which == 9) <]
				// [> _entry.blur(); <]
		/* }) */.mousedown(function(e) {
			e.stopPropagation();
		}).mouseup(function(e) { 
			// e.stopPropagation();
			// e.preventDefault(); 
			if(!e.ctrlKey) {
				desktop._selector.releaseSelectedEntries();
				_entry.focus();
			} else {
				if(_entry._focused) {
					for(var i = 0; i < desktop._selector._selectedEntries.length; ++i) {
						if(desktop._selector._selectedEntries[i] != null
							&& _entry._id == desktop._selector._selectedEntries[i]._id) {
								desktop._selector._selectedEntries[i] = null;
								_entry.blur();
								break;
							}
					}
				} else {
					_entry.focus();
				}
			}
		});
	},

	focus: function() {
		this._dEntry/* .parent() */.addClass('focusing');
		if(!desktop._selector._selectedEntries.hasEntry(this._id))
			desktop._selector._selectedEntries.push(this);
		this._focused = true;
		desktop._tabIndex = this._tabIndex - 1;
	},

	blur: function() {
		this._dEntry/* .parent() */.removeClass('focusing');
		this._focused = false;
	},

	getName: function() {return this._name;},

	setName: function(name_) {
		//redraw dentry's name
		this._name = name_;
	},

	drag: function(ev) {
		if(!desktop._selector._selectedEntries.hasEntry(ev.target.id)) {
			desktop._selector.releaseSelectedEntries();
		}
		this.callSuper(ev);
	},

	drop: function(ev) {
		console.log("prevent!!");
		$(this).parent('.grid').removeClass('hovering');
		$(this).parent('.grid').removeClass('norhover');
		ev.preventDefault();
		ev.stopPropagation();
	},

	setTabIdx: function(tabIdx_) {
		this._tabIndex = tabIdx_;
		$('#' + this._id).attr('tabindex', this._tabIndex);
	},

	getTabIdx: function() {
		return this._tabIndex;
	},

	rename: function() {
		desktop._ctxMenu.hide();
		var $p = $('#' + this._id + ' p');
		desktop._inputer.show({
			'left': $p.parent().parent().offset().left,
			'top': $p.offset().top,
			'height': $p.height(),
			'width': $p.parent().parent().width(),
			'oldtext': $p.text(),
			'callback': function(newtext) {
				// entry's name is not changed
				var _entry = desktop.getAWidgetById(desktop._rightObjId);
				if(_entry._name == newtext) return ;
				// entry's name has already existed
				var _entries = desktop._dEntrys._items;
				for(var i = 0; i < _entries.length; ++i) {
					if(_entries[i]._name == newtext) {
						var dialog = require('dialog'); 
						dialog.warningBox(newtext + ' has already existed'); 
						// alert(newtext + ' has already existed');
						return ;
					}
				}

				if(_entry._type == 'app') {
					_entry.rename(newtext);
				} else if(_entry._type == 'theme') {
					_entry.rename(newtext);
				} else {
					var fs = require('fs'); 
					fs.rename(_entry._path
						, desktop._desktopWatch.getBaseDir() + '/' + newtext
						, function(err) {
							if(err) console.log(err);
						});
				}
			}
		});
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
	},

	attachCtxMenu: function() {
		desktop._ctxMenu.attachToMenu('#' + this._id
				, desktop._ctxMenu.getMenuByHeader('app-entry'));
	},

	rename: function(newName_) {
		//TODO: check name with all app entries
		if(typeof newName_ === 'undefined') {
			this.callSuper();
		} else {
			var _match = /(.*)[\.][^\/]*$/.exec(newName_);
			if(_match == null) {//rename from desktop entry
				var _this = this;
				utilIns.entryUtil.parseDesktopFile(_this._path, function(err_, file_) {
					if(err_) {
						console.log(err_);
					} else {
						if(typeof file_['Name[zh_CN]'] !== "undefined") {
							file_['Name[zh_CN]'] = newName_;
						} else {
							file_['Name'] = newName_;
						}
						utilIns.entryUtil.generateADesktopFile(_this._path
							, {'[Desktop Entry]': file_}, function() {
								$('#' + _this._id + ' p').text(newName_);
							});
					}
				});
			} else {//rename from desktop dir
				this._name = _match[1];
				/* var _match = /(.*[\/])([^\/]*)$/.exec(this._path); */
				/* this._path = _match[1] + this._name; */
				$('#' + this._id + ' p').text(this._name);
			}
		}
	}
});

//Desktop Entry for normal files
//
var FileEntry = DEntry.extend({
	init: function(id_, tabIndex_, path_, position_) {
		this.callSuper(id_, tabIndex_, path_, position_);
		
	 /*  var match = /^.*[\/]([^\/]*)[\.]([^\.]*)$/.exec(path_); */
		/* if(match == null) { */
		var	match = /^.*[\/]([^\/]*)$/.exec(path_);
	 /*    this._type = ''; */
		// } else {
			// this._type = match[2];
	/*   } */
		this._name = match[1];
		this._type = 'file';
		match = this._name.match(/[\.][^\.]*$/);
		if(match != null) this._type = match[0].substr(1);
	},
	
	show: function(rename_) {
		var _this = this;
		if(!rename_) _this.callSuper();
		utilIns.entryUtil.getMimeType(_this._path, function(err_, mimeType_) {
			utilIns.entryUtil.getIconPath(mimeType_.replace('/', '-'), 48
				, function(err_, imgPath_) {
					if(err_) {
						utilIns.entryUtil.getDefaultApp(mimeType_, function(err_, appFile_) {
							if(err_) console.log(err_);
							utilIns.entryUtil.parseDesktopFile(appFile_, function(err_, file_) {
								if(err_) console.log(err_);
								utilIns.entryUtil.getIconPath(file_['Icon'], 48
									, function(err_, imgPath_) {
										if(err_) {
											console.log(err_);
										} else {
											_this._imgPath = imgPath_[0];
											$('#' + _this._id + ' img').attr('src', _this._imgPath);
										}
								});
							});
						});
					} else {
						_this._imgPath = imgPath_[0];
						$('#' + _this._id + ' img').attr('src', _this._imgPath);
					}
				});
			
		});
		/* var _name = (this._type == '' || this._type == 'dir')  */
									/* ? this._name : (this._name + '.' + this._type); */
		$('#' + _this._id + ' p').text(_this._name);
	},

	open: function() {
		//open files with specific app
		this._exec('xdg-open ' + this._path.replace(/ /g, '\\ ')
				, function(err, stdout, stderr) {
					if(err) console.log(err);
				});
	},

	attachCtxMenu: function() {
		desktop._ctxMenu.attachToMenu('#' + this._id
				, desktop._ctxMenu.getMenuByHeader('file-entry'));
	},

	rename: function(newName_) {
		if(typeof newName_ === 'undefined') {
			this.callSuper();
		} else {
			var _match = /(.*[\/])([^\/].*)$/.exec(this._path);
			this._path = _match[1] + newName_;
			_match = /(.*)[\.]([^\.].*)$/.exec(newName_);
			if(_match != null && _match[2] != this._type) {
				this._type = _match[2];
				// reparse the file type
				this.show(true);
			}
			this._name = newName_;
			$('#' + this._id + ' p').text(this._name);
		}
	}
});

//Desktop Entry for directories
//
var DirEntry = FileEntry.extend({
	init: function(id_, tabIndex_, path_, position_) {
		this.callSuper(id_, tabIndex_, path_, position_);
	
		this._type = 'dir';
	},

	drop: function(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		$(this).parent('.grid').removeClass('hovering');
		var _fs = require('fs');

		// handle multi-entry move
		if(desktop._selector._selectedEntries.length > 1) {
			for(var i = 0; i < desktop._selector._selectedEntries.length; ++i) {
				if(desktop._selector._selectedEntries[i] == null) continue;
				var _s_id = desktop._selector._selectedEntries[i]._id;
				if(_s_id == this.id) continue;
				var _s_path = desktop._selector._selectedEntries[i]._path;
				var _name = /^.*[\/]([^\/]*)$/.exec(_s_path);
				_fs.rename(_s_path, desktop._widgets[this.id]._path + '/' + _name[1]
					, function(err) {if(err) console.log(err);});
			}
			return ;
		}

		var _id = ev.dataTransfer.getData('ID');
		if(_id == this.id) return ;
		var _name = /^.*[\/]([^\/]*)$/.exec(desktop._widgets[_id]._path);
		_fs.rename(desktop._widgets[_id]._path
			, desktop._widgets[this.id]._path + '/' + _name[1]
			, function(err) {if(err) console.log(err);});
	},

	rename: function(newName_) {
		if(typeof newName_ === 'undefined') {
			this.callSuper();
		} else {
			//TODO: check name with all dir entries
			this._name = newName_;
			var _match = /(.*[\/])([^\/].*)$/.exec(this._path);
			this._path = _match[1] + this._name;
			$('#' + this._id + ' p').text(this._name);
		}
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
		this._type = 'theme';
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
	},

	attachCtxMenu: function() {
		desktop._ctxMenu.attachToMenu('#' + this._id
				, desktop._ctxMenu.getMenuByHeader('theme-entry'));
	},

	rename: function(newName_) {
		if(typeof newName_ === 'undefined') {
			this.callSuper();
		} else {
			//TODO: check name with all theme entries
			this._name = newName_;
			$('#' + this._id + ' p').text(this._name);
		}
	}
});

