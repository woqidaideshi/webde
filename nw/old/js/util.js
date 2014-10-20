//could be seen as a util-box
//
var Util = Class.extend({
	init: function() {
		this.entryUtil = EntryUtil.create();
	}
});

var EntryUtil = Event.extend({
	init: function() {
		this._fs = require('fs');
		this._exec = require('child_process').exec;

		this.$home = undefined;
		this.$xdg_data_dirs = undefined;
		this._iconSearchPath = null;

		var _this = this;
		this._exec('echo $HOME', function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				_this.$home = stdout.substr(0, stdout.length - 1);
				_this._exec('echo $XDG_DATA_DIRS', function(err, stdout, stderr) {
					if(err) {
						console.log(err);
					} else {
						_this._iconSearchPath = [];
						_this._iconSearchPath.push(_this.$home + "/.local/share/icons/");
		
						_this.$xdg_data_dirs = stdout.substr(0, stdout.length - 1).split(':');
						for(var i = 0; i < _this.$xdg_data_dirs.length; ++i) {
							_this.$xdg_data_dirs[i] 
								= _this.$xdg_data_dirs[i].replace(/[\/]$/, '');
							_this._iconSearchPath.push(_this.$xdg_data_dirs[i] + "/icons/");
						}

						_this._iconSearchPath.push("/usr/share/pixmaps");
					}
				});
			}
		});
	},
	
	getIconPath: function(iconName_, size_, callback_) {
		//get theme config file
		//get the name of current icon-theme
		//1. search $HOME/.icons/icon-theme_name/subdir(get from index.theme)
		//2. if not found, search $XDG_DATA_DIRS/icons/icon-theme_name
		//   /subdir(get from index.theme)
		//3. if not found, search /usr/share/pixmaps/subdir(get from index.theme)
		//4. if not found, change name to current theme's parents' recursively 
		//   and repeat from step 1 to 4
		//5. if not found, return default icon file path(hicolor)
		//
		if(typeof callback_ !== "function")
			throw "Bad type of callback!!";
		
		var _this = this;
		var iconTheme = theme.getIconTheme();
		_this.getIconPathWithTheme(iconName_, size_, iconTheme, function(err_, iconPath_) {
			if(err_) {
				_this.getIconPathWithTheme(iconName_, size_, "hicolor"
					, function(err_, iconPath_) {
						if(err_) {
							callback_.call(this, 'Not found');
						} else {
							callback_.call(this, null, iconPath_);
						}
					});
			} else {
				callback_.call(this, null, iconPath_);
			}
		});
	},

	getIconPathWithTheme: function(iconName_, size_, themeName_, callback_) {
		if(typeof callback_ != 'function')
			throw 'Bad type of function';
		
		var _this = this;
		var findIcon = function(index_) {
			if(index_ == _this._iconSearchPath.length) {
				callback_.call(this, 'Not found');
				return ;
			}
			var _path = _this._iconSearchPath[index_];
			if(index_ < _this._iconSearchPath.length - 1) _path += themeName_;
			_this._fs.exists(_path, function(exists_) {
				if(exists_) {
					var tmp = 'find ' + _path
						+ ' -regextype \"posix-egrep\" -regex \".*'
					 	+ ((index_ < _this._iconSearchPath.length - 1)
						? size_ : '') + '.*/' +iconName_ + '\.(svg|png|xpm)$\"';
					_this._exec(tmp, function(err, stdout, stderr) {
						if(stdout == '') {
							_this._fs.readFile(_path + '/index.theme'
								, 'utf-8', function(err, data) {
									var _parents = [];
									if(err) {
										console.log(err);
									} else {
										var lines = data.split('\n');
										for(var i = 0; i < lines.length; ++i) {
											if(lines[i].substr(0, 7) == "Inherits") {
												attr = lines[i].split('=');
												_parents = attr[1].split(',');
											}
										}
									}
									//recursive try to find from parents
									var findFromParent = function(index__) {
										if(index__ == _parents.length) return ;
										_this.getIconPathWithTheme(iconName_, size_, _parents[index__]
											, function(err_, iconPath_) {
												if(err_) {
													findFromParent(index__ + 1);
												} else {
													callback_.call(this, null, iconPath_);
												}
											});
									};
									findFromParent(0);
									//if not fonud
									findIcon(index_ + 1);
								});
						} else {
							callback_.call(this, null, stdout.split('\n'));
						}
					});
				} else {
					findIcon(index_ + 1);
				} 
			});
		};
		findIcon(0);
	},

	parseDesktopFile: function(path_, callback_) {
		if(typeof callback_ !== 'function')
			throw 'Bad type of callback!!';
		
		var fs = require('fs');
		fs.readFile(path_, 'utf-8', function(err, data) {
			if(err) {
				callback_.call(this, null);
			} else {
				data = data.replace(/[\[]{1}[a-z, ,A-Z]*\]{1}\n/g, '$').split('$');
				var lines = data[1].split('\n');
				var attr = [];
				for(var i = 0; i < lines.length - 1; ++i) {
					var tmp = lines[i].split('=');
					attr[tmp[0]] = tmp[1];
					for(var j = 2; j < tmp.length; j++)
						attr[tmp[0]] += '=' + tmp[j];
				}
				console.log("Get desktop file successfully");
				callback_.call(this, null, attr);
			}
		});
	},

	generateADesktopFile: function(path_, data_, callback_) {
		var _cb = callback_ || function() {};
		var _data = "";
		for(var key in data_) {
			_data += key + '\n';
			for(var key2 in data_[key]) {
				if(typeof data_[key][key2] === 'undefined') continue;
				_data += key2 + '=' + data_[key][key2] + '\n';
			}
		}
		this._fs.writeFile(path_, _data, function(err) {
			if(err) throw err;
			_cb.call(this);
		});
	},

	getMimeType: function(path_, callback_) {
		if(typeof callback_ !== 'function')
			throw 'Bad type of callback!!';
		var _this = this;
		_this._exec('xdg-mime query filetype ' + path_.replace(/ /g, '\\ ')
				, function(err, stdout, stderr) {
					if(err) {
						console.log(err);
						callback_.call(this, 'Unknown mime-type!');
					} else {
						callback_.call(this, null, stdout.replace('\n', ''));
					}
				});
	},

	getDefaultApp: function(mimeType_, callback_) {
		if(typeof callback_ !== 'function')
			throw 'Bad type for callback!!';
		var _this = this;
		_this._exec('xdg-mime query default ' + mimeType_
			, function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				if(stdout == '') {
					//default to major type
				}
				_this.findDesktopFile(stdout.replace('\n', ''), function(err, filePath_) {
					callback_.call(this, err, filePath_);
				});
			}
		});
	},

	findDesktopFile: function(fileName_, callback_) {
		var _this = this;
		
		if(typeof callback_ !== 'function')
			throw 'Bad type for callback';
	
		var tryInThisPath = function(index_) {
			if(index_ == _this.$xdg_data_dirs.length) {
				callback_.call(this, 'Not found');
				return ;
			}
			_this._exec('find ' + _this.$xdg_data_dirs[index_] + ' -name ' + fileName_
					, function(err, stdout, stderr) {
						if(stdout == '') {//err || 
							tryInThisPath(index_ + 1);
						} else {
							_this.emit('findDFile', null, stdout.replace('\n', ''));
							callback_.call(this, null, stdout.replace('\n', ''));
						}
					});
		};
		tryInThisPath(0);
	},

	//get property information of filename_
	//filename_: full file path;
	//callback_: callback function;
	getProperty:function(filename_,callback_){
		var _this = this;
		if(typeof callback_ !== 'function')
			throw 'Bad type for callback';
		_this._exec('stat '+ filename_,function(err,stdout,stderr){
				if(stdout == '') {//err 
					throw 'Bad filename_';
				} else {
					var attrs = stdout.split('\n');
					var attr_  = attrs[1].replace(/(\s+$)|(^\s+)/g,"");
					var size_ = attr_.split(' ')[1];
					attr_  = attrs[3].replace(/(\s+$)|(^\s+)/g,"");
					attr_ = attr_.replace(/\s+/g," ");
					var access_ = attr_.split(' ')[1].substr(6,10);
					var attr_s = attr_.split(' ');
					var uid_ = attr_s[5].substr(0,attr_s[5].length -1);
					var gid_ = attr_s[9].substr(0,attr_s[9].length -1);
					attr_ = attrs[4].split(' ');
					var access_time = attr_[1]+' ' + attr_[2].substr(0,8);
					attr_ = attrs[5].split(' ');
					var modify_time = attr_[1]+' ' + attr_[2].substr(0,8);
					var attr = [];

					attr['size'] = size_;
					attr['access'] = access_;
					attr['access_time'] = access_time;
					attr['modify_time'] = modify_time;
					attr['uid'] = uid_;
					attr['gid'] = gid_;

					callback_.call(this, null ,attr);
				}
		});
	},
	// copy file ;
	// from : fromPath_,
	// to : outPath_.
	copyFile:function(fromPath_, outPath_){
		var _fs = require('fs');
		_fs.readFile(fromPath_, function(err, data){
			_fs.writeFile(outPath_, data, function(err){
				if (err) {
					console.log(err);
				}
			});
		});
	},
	//rm file 
	//path_: file Path_
	removeFile:function(path_){
		this._exec('rm '+path_, function(err, out ,stderr){
			if(err) throw 'util.js-rmFile: bad path';
		});
	}
});
