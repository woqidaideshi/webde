//This class is totally for desktop management
//
var Desktop = Class.extend({
	init: function() {
		this._grid = undefined;
		this._ctxMenu = null;
		this._tabIndex = 100;
		this._position = {x:0,y:0};
		this._widgets = [];
		this._dEntrys = OrderedQueue.create(function(entry1_, entry2_) {
			var pos1 = entry1_.getPosition();
			var pos2 = entry2_.getPosition();
			if(pos1.x > pos2.x) {
				return true;
			} else if(pos1.x == pos2.x){
				if(pos1.y < pos2.y) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		});
		this._exec = require('child_process').exec;
		this._fs = require('fs');
		this._xdg_data_home = undefined;
		this._rightMenu = undefined;
		this._rightObjId = undefined;
		this.generateGrid();
		this.initCtxMenu();
		this.bindingEvents();
		this._dock = Dock.create();
		
		var _desktop = this;
		
		this._DESKTOP_DIR = '/桌面';
		this._desktopWatch = Watcher.create(this._DESKTOP_DIR);
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
					,_desktop._position
					),_desktop._position);
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
		
		this._exec("echo $HOME/.local/share/", function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				_desktop._xdg_data_home = stdout.substr(0, stdout.length - 1);
				//add dock div to desktop
				_desktop._dock.bingEvent();
				theme.loadThemeEntry(_desktop);
				_desktop.loadWidgets();
			}
		});
	},

	bindingEvents: function() {
		var _desktop = this;

		win.once('loading', function() {
			_desktop.refresh();
		});
		_desktop._ctxMenu.attachToMenu('html'
				, _desktop._ctxMenu.getMenuByHeader('desktop'));
	},

	shutdown: function() {
		this._desktopWatch.close();
		this.saveWidgets();
	},

	refresh: function() {
		this._desktopWatch.close();
		theme.saveConfig(this);
		this.saveWidgets();
	},

	initCtxMenu: function() {
		this._ctxMenu = ContextMenu.create();

		this._ctxMenu.addCtxMenu([
			{header: 'desktop'},
			{text: 'terminal', action: function(e) {
				e.preventDefault();
				var exec = require('child_process').exec;
				exec("gnome-terminal", function(err, stdout, stderr) {
	      	console.log('stdout: ' + stdout);
	       	console.log('stderr: ' + stderr);
	      });
			}},
			{text:'gedit',action:function(e){
				e.preventDefault();
				var exec = require('child_process').exec;
				exec("gedit",function(err, stdout, stderr){
	   			console.log('stdout: ' + stdout);
	   			console.log('stderr: ' + stderr);
	      });
			}},
			{divider: true},
			{text: 'refresh', action: function(e) {
				location.reload();
			}},
			{text: 'refresh (F5)', action:function(e){
				location.reload(true);
			}},
			{divider: true},
			{text: 'app plugin', subMenu: [
				{header: 'plugin'},
				{text: 'clock', action: function(e) {
					if (typeof $('#clock')[0] == 'undefined') 
						desktop.addAnDPlugin(ClockPlugin.create('clock',undefined,'img/clock.png'));
				}}
			]}
		]);
		this._ctxMenu.addCtxMenu([
			{header: 'plugin'},
			{text: 'zoom in', action: function(e) {
				e.preventDefault();
				desktop._widgets[desktop._rightObjId].zoomIn();
			}},
			{text:'zoom out', action:function(e) {
				e.preventDefault();
				desktop._widgets[desktop._rightObjId].zoomOut();
			}},
			{text:'remove', action:function(e) {
				desktop._widgets[desktop._rightObjId].remove();
				e.preventDefault();
			}}
		]);
		this._ctxMenu.addCtxMenu([
			{header: 'dock'},
			{text: 'property', action:function(){
				var property_ = Property.create(desktop._rightObjId);
				property_.showAppProperty();
				property_.show();
			}}
		]);
		this._ctxMenu.addCtxMenu([
			{header: 'app-entry'}
		]);
		this._ctxMenu.addCtxMenu([
			{header: 'file-entry'}
		]);
		this._ctxMenu.addCtxMenu([
			{header: 'theme-entry'}
		]);
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
		this._grid.setDesktop(this);
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
		var _lastSave = [];
		this._fs.readFile(this._xdg_data_home + "dwidgets/dentries"
				, 'utf-8', function(err, data) {
			if(err) {
				console.log(err);
			} else {
				var lines = data.split('\n');
				for(var i = 0; i < lines.length; ++i) {
					if(lines[i].match('[\s,\t]*#+') != null) continue;
					if(lines[i] == "") continue;
					var attr = lines[i].split('$');
					if(attr.length != 5) continue;
				/*need add a type judge
				*/
					var _plugin = null;
					switch(attr[4]) {
						case "ClockPlugin":
							_plugin = ClockPlugin;
							break;
						case "ImagePlugin":
							_plugin = PicPlugin;
							break;
						default:
							_lastSave[attr[0]] = {
								path: attr[1],
								x: attr[2],
								y: attr[3],
								type: attr[4]
							};	
					}
					if (_plugin != null) {
						_desktop.addAnDPlugin(_plugin.create(attr[0]
							,{x: attr[2], y: attr[3]}
							,attr[1]
							), {x: attr[2], y: attr[3]});
					}
				}
				//handle destop entries
				_desktop.addWidgets(_lastSave, _desktop._desktopWatch.getBaseDir()
						,_desktop._desktopWatch);
				//handle dock entries
				_desktop.addWidgets(_lastSave,_desktop._dock._dockWatch.getBaseDir()
						,_desktop._dock._dockWatch);
			}
		});
	},
	//add entries by argv
	//lastSave_: saved config argv, from <dentries> file
	// dir_: full dir for watch ,such as: /home/user/桌面
	// watch_: watch_ is _desktopWatch or _dockWatch
	addWidgets:function(lastSave_, dir_, watch_){
		var _desktop = this;
		var _newEntry = [];
		_desktop._fs.readdir(dir_
				, function(err, files) {
			var traverse = function(index_) {
				if(index_ == files.length) {
					for(var key in _newEntry) {
						watch_.emit('add'
							, _newEntry[key].filename
							, _newEntry[key].stats);
					}
					return ;
				}
				_desktop._fs.stat(
						dir_ + '/' + files[index_]
						, function(err, stats) {
					var _id = 'id-' + stats.ino.toString();
					if(typeof lastSave_[_id] != 'undefined') {
						var _Entry = null;
						var _DockApp = null
						switch(lastSave_[_id].type) {
							case "dockApp":
								_DockApp = DockApp;
							case "app":
								_Entry = AppEntry;
								break;
							case "dir":
								_Entry = DirEntry;
								break;
							default:
								_Entry = FileEntry;
						}
						_desktop._fs.exists(lastSave_[_id].path,function(exists_){
							if (exists_) {
								if (_DockApp != null) {
									_desktop.addAnAppToDock(_DockApp.create(_id
									,lastSave_[_id].x
									,lastSave_[_id].path));
								} else if (_Entry != null) {
								_desktop.addAnDEntry(_Entry.create(_id
									, _desktop._tabIndex++
									, lastSave_[_id].path
									, {x: lastSave_[_id].x, y: lastSave_[_id].y}
									), {x: lastSave_[_id].x, y: lastSave_[_id].y});
								}
							} else {
								_newEntry[_id] = {
									'filename': files[index_],
									'stats': stats
								};
							}
						});
					} else {
						_newEntry[_id] = {
							'filename': files[index_],
							'stats': stats
						};
					}
					traverse(index_ + 1);
				});
			}
			traverse(0);

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
		if(typeof pos_ === 'undefined' || 
				typeof $('#grid_' + pos_.x + '_' + pos_.y).children('div')[0] != 'undefined') {
			pos_ = this._grid.findAnIdleGrid();
			if(pos_ == null) {
				alert("No room");
				this.unRegistWidget(entry_.getID());
				return ;
			}
		}

		entry_.setPosition(pos_);
		entry_.show();
		this._dEntrys.push(entry_);
		this.resetDEntryTabIdx();
		this._grid._grid[pos_.x][pos_.y].use = true;
	},

	deleteADEntry: function(entry_) {
		this.unRegistWidget(entry_.getID());
		var _pos = entry_.getPosition();
		this._grid._grid[_pos.x][_pos.y].use = false;
		this._tabIndex--;
		this._dEntrys.remove(entry_.getTabIdx() - 1);
		this.resetDEntryTabIdx();
		entry_.hide();
		entry_ = null;
	},

	resetDEntryTabIdx: function() {
		for(var i = 0; i < this._dEntrys.length(); ++i) {
			if(this._dEntrys.get(i) != null)
				this._dEntrys.get(i).setTabIdx(i + 1);
		}
	},

	reOrderDEntry: function() {
		this._dEntrys.order();
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
		//get number of occupy-grid col and row
		this._grid.flagGridOccupy(pos_.x, pos_.y, plugin_._col_num, plugin_._row_num, true);
	},

	addDock:function(){
		this._dock = Dock.create();
	},

	addAnAppToDock:function(dockApp_){
		if(!this.registWidget(dockApp_)) return ;
		dockApp_.show();
	},

	deleteAnAppFromDock:function(dockApp_)
	{
		this.unRegistWidget(dockApp_.getID());
		$('#'+dockApp_.getID()).remove();
		dockApp_ = undefined;
	}
	
});
