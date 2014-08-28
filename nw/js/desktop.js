//This class is totally for desktop management
//
var Desktop = Class.extend({
	init: function() {
		this._grid = undefined;
		this._tabIndex = 1;
		this._widgets = [];
		this._exec = require('child_process').exec;
		this._fs = require('fs');
		this._xdg_data_home = undefined;
		this._dock = undefined;
		this._rightMenu = undefined;
		this._rightObjId = undefined;
		this.generateGrid();
		this.bindingEvents();
		
		var _desktop = this;
		this._exec("echo $HOME/.local/share/", function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				_desktop._xdg_data_home = stdout.substr(0, stdout.length - 1);
				theme.loadThemeEntry(_desktop);
				_desktop.loadWidgets();
			}
		});

		//add dock div to desktop
		this.addDock();
		
		this._desktopWatch = DesktopWatcher.create();
		this._desktopWatch.on('add', function(filename, stats) {
			//console.log('add:', filename, stats);
			var _filenames = filename.split('.');
			var _Entry;
			
			if(_filenames[0] == '') {
				return ;//ignore hidden files
			}
			if(stats.isDirectory()) {
				_Entry = DirEntry;
			} else {
				if(_filenames[_filenames.length - 1] == 'desktop') {
					_Entry = AppEntry;
				} else {
					_Entry = FileEntry;
				}
			}

			_desktop.addAnDEntry(_Entry.create('id-' + stats.ino.toString()
					, _desktop._tabIndex++
					, _desktop._desktopWatch.getBaseDir() + '/' + filename
					));
		});
		this._desktopWatch.on('delete', function(filename) {
			//console.log('delete:', filename);
			//find entry object by path
			var _path = _desktop._desktopWatch.getBaseDir() + '/' + filename;
			var _entry = _desktop.getAWidgetByAttr('_path', _path);
			if(_entry == null) {
				console.log('Can not find this widget');
				return ;
			}
			_desktop.deleteADEntry(_entry);
		});
		this._desktopWatch.on('rename', function(oldName, newName) {
			console.log('rename:', oldName, '->', newName);
		});
	},

	bindingEvents: function() {
		var _desktop = this;

		win.once('loading', function() {
			_desktop.refresh();
		});
	},

	shutdown: function() {
		this.saveWidgets();
	},

	refresh: function() {
		theme.saveConfig(this);
		this.saveWidgets();
	},
	
	registWidget: function(widget_) {
		if(typeof this._widgets[widget_.getID()] !== "undefined") {
			alert("This widget has been registed!!");
			return false;
		}
		this._widgets[widget_.getID()] = widget_;
		return true;
	},

	unRegistWidget: function(id_) {
		this._widgets[id_] = undefined;
		delete this._widgets[id_];
	},

	generateGrid: function() {
		this._grid = Grid.create('grids');
		this._grid.show();
	},

	getGrid:function(){
		return this._grid;
	},

	getAWidgetById: function(id_) {
		return this._widgets[id_];
	},

	getAWidgetByAttr: function(attr_, value_) {
		for(var key1 in this._widgets) {
			for(var key2 in this._widgets[key1]) {
				if(key2 == attr_ && this._widgets[key1][key2] == value_)
					return this._widgets[key1];
			}
		}
		return null;
	},

	loadWidgets: function() {
		var _desktop = this;
		this._fs.readFile(this._xdg_data_home + "dwidgets/dentries"
				, 'utf-8', function(err, data) {
			if(err) {
				console.log(err);
			} else {
				var lines = data.split('\n');
				for(var i = 0; i < lines.length; ++i) {
					if(lines[i].match('[\s,\t]*#+') != null) continue;  //??????????????????????
					if(lines[i] == "") continue;
					var attr = lines[i].split('$');
					if(attr.length != 5) continue;
				/*need add a type judge
				*/
				var _Entry = null;
				var _Plugin = null;
				var _dockApp = null;
					switch(attr[4]) {
						case "ClockPlugin":
							_Plugin = ClockPlugin;
							break;
						case "ImagePlugin":
							_Plugin = PicPlugin;
							break;
						case "dockApp":
							_dockApp = DockApp;
							break;
						case "app": 
							_Entry = AppEntry;
							break;
						case "dir":
							_Entry = DirEntry;
							break;
						default:
							_Entry = FileEntry;
					}

					if (_Entry != null ) {
						_desktop.addAnDEntry(_Entry.create(attr[0]
							, _desktop._tabIndex++
							, attr[1]
							, {x: attr[2], y: attr[3]}
							), {x: attr[2], y: attr[3]});
					} else if (_Plugin != null) {
						_desktop.addAnDPlugin(_Plugin.create(attr[0]
								,{x: attr[2], y: attr[3]}
								,attr[1]
								), {x: attr[2], y: attr[3]});
					}else if(_dockApp != null){
						_desktop.addAnAppToDock(_dockApp.create(attr[0]
							,attr[2]
							,attr[1]));
					}
				}
				_desktop._rightMenu = RightMenu();
			}
		});
	},

	saveWidgets: function() {
		var data = "";
		for(var key in this._widgets) {
			if(typeof theme._theme[key] !== 'undefined') continue;
			data += key + "$" + this._widgets[key]._path + "$"
			 	+ this._widgets[key]._position.x + "$"
			 	+ this._widgets[key]._position.y + "$"
				+ this._widgets[key]._type + '\n';
		}
		//console.log(data);

		this._fs.writeFile(this._xdg_data_home + "dwidgets/dentries"
				, data, function(err) {
			if(err) {
				console.log(err);
			}
		});
	},

	addAnDEntry: function(entry_, pos_) {
		if(!this.registWidget(entry_)) return ;
		if(typeof pos_ === 'undefined') {
			pos_ = this._grid.findAnIdleGrid();
			if(pos_ == null) {
				alert("No room");
				this.unRegistWidget(entry_.getID());
				return ;
			}
		}

		entry_.setPosition(pos_);
		entry_.show();
		this._grid._grid[pos_.x][pos_.y].use = true;
	},

	deleteADEntry: function(entry_) {
		this.unRegistWidget(entry_.getID());
		var _pos = entry_.getPosition();
		this._grid._grid[_pos.x][_pos.y].use = false;
		this._tabIndex--;
		entry_.hide();
		entry_ = null;
	},

	addAnDPlugin: function(plugin_, pos_,  path_) {
		if(!this.registWidget(plugin_)) return ;
		if(typeof pos_ === 'undefined') {
			pos_ = this._grid.findAnIdleGridFromRight();
			if(pos_ == null) {
				alert("No room");
				this.unRegistWidget(plugin_.getID());
				return ;
			}
		}

		plugin_.setPosition(pos_);
		plugin_.show();
		plugin_.setPanel(path_);
		//this._grid._grid[pos_.x][pos_.y].use = true;
		//get number of occupy-grid col and row
		var col_num = parseInt($('.plugin-div').width()/this._grid._col-0.00001)+1;
		var row_num =  parseInt($('.plugin-div').height()/this._grid._row-0.00001)+1;
		this._grid.flagGridOccupy(pos_.x, pos_.y, col_num, row_num, true);
	},

	addDock:function(position_ ){
		this._dock = Dock.create(position_);
		this._dock.setPosition();
		this._dock.show();
	},

	addAnAppToDock:function(dockApp_){
		if(!this.registWidget(dockApp_)) return ;
		dockApp_.show();
	}
	
});

var DesktopWatcher = Event.extend({
	init: function(ignoreInitial_) {
		this._prev = 0;
		this._baseDir = undefined;
		this._oldName = null;

		this._ignoreInitial = ignoreInitial_ || true;

		this._fs = require('fs');
		this._exec = require('child_process').exec;

		var _this = this;
		this._exec('echo $HOME', function(err, stdout, stderr) {
			if(err) throw err;
			_this._baseDir = stdout.substr(0, stdout.length - 1);
			_this._fs.readdir(_this._baseDir + '/桌面', function(err, files) {
				for(var i = 0; i < files.length; ++i) {
					if(!_this._ignoreInitial) //do sth
						;
					_this._prev++;
				}

				_this._fs.watch(_this._baseDir + '/桌面', function(event, filename) {
					if(event == 'change') return ;
					_this._fs.readdir(_this._baseDir + '/桌面', function(err, files) {
						var cur = 0;
						for(var i = 0; i < files.length; ++i) {
							cur++;
						}

						if(_this._prev < cur) {
							_this._fs.stat(_this._baseDir + '/桌面/' + filename, function(err, stats) {
								_this.emit('add', filename, stats);
							});
						} else if(_this._prev > cur) {
							_this.emit('delete', filename);
						} else {
							if(_this._oldName == null) {
								_this._oldName = filename;
								return ;
							}
							if(_this.oldName == filename) {
								_this._oldName = null;
								return ;
							}
							_this.emit('rename', _this._oldName, filename);
							_this._oldName = null;
						}
						_this._prev = cur;
					});
				});
			});
		});
	},

	getBaseDir: function() {
		return this._baseDir + '/桌面';
	}

});
