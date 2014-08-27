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

						_this._iconSearchPath.push("/usr/share/pixmaps/");
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
			throw "Bad function of callback!!";
		
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
			_this._fs.exists(_this._iconSearchPath[index_] + themeName_, function(exists_) {
				if(exists_) {
					var tmp = 'find ' + _this._iconSearchPath[index_] + themeName_ 
						+ ' -regextype \"posix-egrep\" -regex \".*'
					 	+ size_ + '.*/' +iconName_ + '\.(svg|png|xpm)$\"';
					_this._exec(tmp, function(err, stdout, stderr) {
						if(stdout == '') {
							_this._fs.readFile(_this._iconSearchPath[index_] + themeName_
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

	getMimeType: function(path_, callback_) {
		if(typeof callback_ !== 'function')
			throw 'Bad type of callback!!';
		var _this = this;
		_this._exec('xdg-mime query filetype ' + path_, function(err, stdout, stderr) {
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
	}

});
