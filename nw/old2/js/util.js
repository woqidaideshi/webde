//could be seen as a util-box
//
var Util = Class.extend({
	init: function() {
		this.entryUtil = EntryUtil.create();
		this.trashUtil = TrashUtil.create();
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
							//_this.emit('findDFile', null, stdout.replace('\n', ''));
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
		this._exec('rm -r '+path_, function(err, out ,stderr){
			if(err) console.log('util.js-rmFile: bad path. '+ err) ;
		});
	},
	/**
	 * [getRelevantAppName : get relevant app's name ]
	 * @param  {string} mimeTypes_: xdg type
	 * @param  {function} callback_(err, name);
	 * @return {callbask_}
	 */
	getRelevantAppName:function(mimeTypes_, callback_){
		var _path = '/usr/share/applications/';
		utilIns.entryUtil.parseDesktopFile(_path + 'mimeinfo.cache', function(err_, file_) {
			if(err_){ 
				console.log(err_);
				return ;
			}
			var _relevantAppNames = [];
			for (var i = 0; i < mimeTypes_.length; i++) {
				if (typeof file_[mimeTypes_[i]] !== 'undefined') {
					var _appNames = file_[mimeTypes_[i]].split(';');
					$.merge(_relevantAppNames, _appNames);
				}
			};
			$.unique(_relevantAppNames);
			if (_relevantAppNames.length == 0) 
				return callback_.call(this, 'Unknown relevant App!');
			return callback_.call(this, null, _relevantAppNames);
		});
	},
/**
 * [isTextFile : check file is text or not]
 * @param  {string}  path_
 * @param  {function}  callback_(err, isText)
 * @return {callbask_}
 */
	isTextFile:function(path_, callback_){
		this._exec('file '+ path_ + " | grep -E 'text|empty'",function(err_, out_ ,stderr_){
			if (out_ !== '' ) {
				return callback_.call(this, null , true);
			}else {
				return callback_.call(this,null, false);
			}
		});
	},
/**
 * [getItemFromApp : read .desktop then  get name and exec to build Item]
 * @param  {string} path_
 * @param  {function} callback_(err, Item);
 * @return {callback_}
 */
	getItemFromApp:function(path_, callback_){
		utilIns.entryUtil.parseDesktopFile(path_, function(err_, file_){
			if(err_) throw err_;
			//get launch commad
			var _execCmd = undefined;
			if (typeof desktop._widgets[desktop._rightObjId] !== 'undefined') {
				_execCmd = file_['Exec']
					.replace(/%(f|F|u|U|d|D|n|N|i|c|k|v|m)/g
						, '\''+desktop._widgets[desktop._rightObjId]._path+'\'')
					.replace(/\\\\/g, '\\');
			}else{
				_execCmd = file_['Exec']
					.replace(/%(f|F|u|U|d|D|n|N|i|c|k|v|m)/g, '')
					.replace(/\\\\/g, '\\');
			}
			var _name = undefined; 
			if(typeof file_['Name[zh_CN]'] !== "undefined") {
				_name = file_['Name[zh_CN]'];
			} else {
				_name = file_['Name'];
			}
			if (typeof _name == 'undefined' || typeof _execCmd == 'undefined') {
				return callback_.call(this, 'Unknown name or cmd!');
			};
						
			var _item = {text:_name,action:function(e){
				e.preventDefault();
				desktop._exec(_execCmd ,function(err){
				console.log(err);
				});
			}};
			return callback_.call(this, null, _item);
		});
	}
});

var TrashUtil =  Event.extend({
	init:function(){
		this._xdg_data_home = undefined;
		this._TRASH = undefined;
		this._exec = require('child_process').exec;
		this._fs = require('fs');
		var  _trash = this;
		this._exec("echo $HOME/.local/share", function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				_trash._xdg_data_home = stdout.substr(0, stdout.length - 1);
				_trash._TRASH = _trash._xdg_data_home + '/Trash';
			}
		});
	},

	writeInfoFile:function(path_, filename_){
		var _this = this;
		var _data = '[Trash Info]\n';
		_data += 'Path=' + path_ + '\n';
		var _now = new Date(); 
		_data += 'DeletionDate=' + _now.toLocaleString();
		console.log(_data);
		var iconv = require('iconv-lite');
		var buf = iconv.encode(_data,'ucs2');
		var str = iconv.decode(buf,'ucs2');
		this._fs.writeFile(_this._TRASH + '/info/' + filename_ + '.trashinfo'
			, str
			,function(err) {
				if (err) console.log(err);
		});
	},

	moveToTrash:function(id_){
		var _this = this;
		var _obj = desktop._widgets[id_];
		var _path = _obj._path;
		var _num = 1;
		var _filename =  _path.split('/')[_path.split('/').length -1];
		//get filename and suffix
		var _names = _filename.split('.');
		var _preName = '';
		var _lastName = '.'+_names[_names.length - 1]; 
		for (var i = 0; i < _names.length-1; i++) {
				 _preName += _names[i] + '.';
		};
		if (_preName == ''){
			_preName = _names[_names.length - 1] + '.';
			_lastName = '';
		}
		//check filename exist or not , if (exists) then rename  
		if (_this._fs.existsSync(_this._TRASH + '/files/' + _filename)) {
			while(_this._fs.existsSync(_this._TRASH + '/files/' + _preName+_num.toString()+_lastName)){
				_num++;
			}
			_filename =  _preName + _num.toString() + _lastName;
		};
		//check is dir or file 
		_this._exec('mv \''+_path + '\' \'' + _this._TRASH + '/files/'+_filename+'\'', function(err_,out_){
			if (err_) console.log(err_);
			if (out_) console.log(out_);
		});
		_this.writeInfoFile(_path, _filename);
	}

});
