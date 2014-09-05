//This class is totally for desktop management
//
var Desktop = Class.extend({
	init: function() {
		this._grid = undefined;
		this._ctxMenu = null;
		this._inputer = DesktopInputer.create('d-inputer');
		this._tabIndex = 100;
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
		this._selectedEntries = [];
		this._ctrlKey = false;
		this._exec = require('child_process').exec;
		this._fs = require('fs');
		this._xdg_data_home = undefined;
		this._dock = undefined;
		this._rightMenu = undefined;
		this._rightObjId = undefined;
		this.generateGrid();
		this.initCtxMenu();
		this.bindingEvents();
		
		var _desktop = this;
		
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
			var _path = _desktop._desktopWatch.getBaseDir() + '/' + oldName;
			var _entry = _desktop.getAWidgetByAttr('_path', _path);
			if(_entry == null) {
				console.log('Can not find this widget');
				return ;
			}
			_entry.rename(newName);
		});
		
		this._exec("echo $HOME/.local/share/", function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				_desktop._xdg_data_home = stdout.substr(0, stdout.length - 1);
				//add dock div to desktop
				_desktop.addDock();
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
		
		$(document).on('keydown', 'html', function(e) {
			switch(e.which) {
				case 9:		// tab
					if(!e.ctrlKey) {
						_desktop.releaseSelectedEntries();
					} else {
						console.log('Combination Key: Ctrl + Tab');
					}
					break;
				case 17:	// ctrl
					_desktop._ctrlKey = true;
					break;
				case 65:	// a/A
					if(e.ctrlKey) {
						console.log('Combination Key: Ctrl + a/A');
						for(var key in _desktop._dEntrys._items) {
							_desktop._dEntrys._items[key].focus();
						}
					}
					break;
				default:
			}
		}).on('keyup', 'html', function(e) {
			switch(e.which) {
				case 17:	// ctrl
					_desktop._ctrlKey = false;
					break;
			}
		}).on('mouseup', 'html', function(e) {
			e.stopPropagation();
			// e.preventDefault();
			if(e.ctrlKey) {
				console.log('Combination Key: Ctrl + left-click');
			} else {
			}
			_desktop.releaseSelectedEntries();
		});
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
		$(document).on('mouseover', '.me-codesta', function(){
			$('.finale h1:first').css({opacity:0});
			$('.finale h1:last').css({opacity:1});
		});
		$(document).on('mouseout', '.me-codesta', function(){
			$('.finale h1:last').css({opacity:0});
			$('.finale h1:first').css({opacity:1});
		});
		
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
				var w = $('#'+desktop._rightObjId).width();
				if(w >= 180) {
					alert('the plugin has been max size!!');
				} else {
					desktop._widgets[desktop._rightObjId].resize(w+20,w+20);
					var col_num = parseInt($('#'+desktop._rightObjId).width()/desktop._grid._col-0.00001)+1;
					var row_num =  parseInt($('#'+desktop._rightObjId).height()/desktop._grid._row-0.00001)+1;
					var parent_id = $('#'+ desktop._rightObjId).parent('.grid')[0].id;
					var arr = parent_id.split('_');
					var col = parseInt(arr[1]);
					var row = parseInt(arr[2]);
					desktop._grid.flagGridOccupy(col, row, col_num, row_num, true);
				}
			}},
			{text: 'zoom out', action: function(e) {
				e.preventDefault();
				var w = $('#'+desktop._rightObjId).width();
				if (w<=60) {
					alert('the plugin has been min size!!');
				} else {
					desktop._widgets[desktop._rightObjId].resize(w-20,w-20);
					var col_num_old = parseInt(w/desktop._grid._col-0.00001)+1;
					var row_num_old =  parseInt(w/desktop._grid._row-0.00001)+1;
					var col_num = parseInt($('#'+desktop._rightObjId).width()/desktop._grid._col-0.00001)+1;
					var row_num =  parseInt($('#'+desktop._rightObjId).height()/desktop._grid._row-0.00001)+1;
					var parent_id = $('#'+ desktop._rightObjId).parent('.grid')[0].id;
					var arr = parent_id.split('_');
					var col = parseInt(arr[1]);
					var row = parseInt(arr[2]);
					desktop._grid.flagGridOccupy(col, row, col_num_old, row_num_old, false);
					desktop._grid.flagGridOccupy(col, row, col_num, row_num, true);
				}
			}},
			{text: 'remove', action: function(e) {
				desktop.unRegistWidget(desktop._rightObjId);
				var col_num = parseInt($('#'+desktop._rightObjId).width()/desktop._grid._col-0.00001)+1;
				var row_num =  parseInt($('#'+desktop._rightObjId).height()/desktop._grid._row-0.00001)+1;
				var parent_id = $('#'+ desktop._rightObjId).parent('.grid')[0].id;
				var arr = parent_id.split('_');
				var col = parseInt(arr[1]);
				var row = parseInt(arr[2]);
				desktop._grid.flagGridOccupy(col, row, col_num, row_num, false);
				$('#'+desktop._rightObjId).remove();
				e.preventDefault();
			}}
		]);
		this._ctxMenu.addCtxMenu([
			{header: 'dock'},
			{text: 'set'}
		]);
		this._ctxMenu.addCtxMenu([
			{header: 'app-entry'},
			{text: 'Open', action: function(e) {
				e.preventDefault();
				desktop.getAWidgetById(desktop._rightObjId).open();
			}},
			{text: 'Rename', action: function(e) {
				e.preventDefault();
				e.stopPropagation();
				desktop.getAWidgetById(desktop._rightObjId).rename();
			}}
		]);
		this._ctxMenu.addCtxMenu([
			{header: 'file-entry'},
			{text: 'Open', action: function(e) {
				e.preventDefault();
				desktop.getAWidgetById(desktop._rightObjId).open();
			}},
			{text: 'Rename', action: function(e) {
				e.preventDefault();
				e.stopPropagation();
				desktop.getAWidgetById(desktop._rightObjId).rename();
			}}
		]);
		this._ctxMenu.addCtxMenu([
			{header: 'theme-entry'},
			{text: 'Open', action: function(e) {
				e.preventDefault();
				desktop.getAWidgetById(desktop._rightObjId).open();
			}},
			{text: 'Rename', action: function(e) {
				e.preventDefault();
				e.stopPropagation();
				desktop.getAWidgetById(desktop._rightObjId).rename();
			}}
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
						default:
							_lastSave[attr[0]] = {
								path: attr[1],
								x: attr[2],
								y: attr[3],
								type: attr[4]
							};
						
					}

					if (_Plugin != null) {
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
				// _desktop._rightMenu = RightMenu();
				//handle destop entries
				var _newEntry = [];
				_desktop._fs.readdir(_desktop._desktopWatch.getBaseDir()
						, function(err, files) {
							var traverse = function(idx_) {
								if(idx_ == files.length) {
									for(var key in _newEntry) {
										_desktop._desktopWatch.emit('add'
											, _newEntry[key].filename
											, _newEntry[key].stats);
									}
									return ;
								}
								_desktop._fs.stat(
									_desktop._desktopWatch.getBaseDir() + '/' + files[idx_]
									, function(err, stats) {
										var _id = 'id-' + stats.ino.toString();
										if(typeof _lastSave[_id] != 'undefined'
											&& _lastSave[_id].path.match(/[^\/]*$/) == files[idx_]) {
											var _Entry = null;
											switch(_lastSave[_id].type) {
												case "app":
													_Entry = AppEntry;
													break;
												case "dir":
													_Entry = DirEntry;
													break;
												default:
													_Entry = FileEntry;
											}

										_desktop.addAnDEntry(_Entry.create(_id
											, _desktop._tabIndex++
											, _lastSave[_id].path
											, {x: _lastSave[_id].x, y: _lastSave[_id].y}
											), {x: _lastSave[_id].x, y: _lastSave[_id].y});
										} else {
											_newEntry[_id] = {
												'filename': files[idx_],
												'stats': stats
											};
										}
										traverse(idx_ + 1);
									});
							}
							traverse(0);
						});
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

	releaseSelectedEntries: function() {
		while(this._selectedEntries.length > 0) {
			var _entry = this._selectedEntries.pop();
			if(_entry) _entry.blur();
		}
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
	init: function(ignore_) {
		this._prev = 0;
		this._baseDir = undefined;
		this._oldName = null;
		this._watcher = null;
		this._evQueue = [];
		this._timer = null;
		this._ignore = ignore_ || /^\./;

		this._fs = require('fs');
		this._exec = require('child_process').exec;

		var _this = this;
		this._exec('echo $HOME', function(err, stdout, stderr) {
			if(err) throw err;
			_this._baseDir = stdout.substr(0, stdout.length - 1);
			_this._fs.readdir(_this._baseDir + '/桌面', function(err, files) {
				for(var i = 0; i < files.length; ++i) {
					_this._prev++;
				}
				var evHandler = function() {
					var filename = _this._evQueue.shift();//.pop();
					_this._fs.readdir(_this._baseDir + '/桌面', function(err, files) {
						var cur = 0;
						for(var i = 0; i < files.length; ++i) {
							cur++;
						}

						if(_this._prev < cur) {
							_this._fs.stat(_this._baseDir + '/桌面/' + filename
								, function(err, stats) {
									_this.emit('add', filename, stats);
								});
							_this._prev++;
						} else if(_this._prev > cur) {
							_this.emit('delete', filename);
							_this._prev--;
						} else {
							if(_this._oldName == null) {
								_this._oldName = filename;
								return ;
							}
							if(_this.oldName == filename) {
								return ;
							}
							_this.emit('rename', _this._oldName, filename);
							_this._oldName = null;
						}
						if(_this._evQueue.length != 0) evHandler();
					});
				};
				_this._timer = setInterval(function() {
					if(_this._evQueue.length != 0) {
						// _this._evQueue.reverse();
						evHandler();
					} else {
						_this._oldName = null;
					}
				}, 200);

				_this._watcher = _this._fs.watch(_this._baseDir + '/桌面'
					, function(event, filename) {
						if(event == 'change' || filename.match(_this._ignore) != null) return ;
						_this._evQueue.push(filename);
					});
			});
		});
	},

	getBaseDir: function() {
		return this._baseDir + '/桌面';
	},

	close: function() {
		this._watcher.close();
		clearInterval(this._timer);
	}
});
