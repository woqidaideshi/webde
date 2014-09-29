//This file includes all model classes used in this project
//

//This class contains all theme relevant data and service.
//TODO: replace the nodejs apis to ourselves.
//
var ThemeModel = Model.extend({
	init: function(callback_) {
		this._theme = [];
		this._themePath = _global.$home + "/.local/share/themeConf";
		this.getCurThemeConfig(callback_);
	},
		
	getCurThemeConfig: function(callback_) {
		var theme = this;

		_global._fs.readFile(this._themePath, 'utf-8', function(err, data) {
			if(err) {
				console.log(err);
				callback_.call(this, err);
			} else {
				var lines = data.split('\n');
				for(var i = 0; i < lines.length; ++i) {
					if(lines[i] == "") continue;
					var attr = lines[i].split(':');
					// theme._keys = attr[0];
					var attrs = attr[1].split(' ');
					theme._theme[attr[0]] = {
						'name': attrs[0],
						'active': attrs[1],
						'icon': attrs[2],
						'path': attrs[3],
						'id': attrs[4],
						'pos': {x: attrs[5], y: attrs[6]}
					};
				}
				callback_.call(this, null);
			}
		});
	},

	saveConfig: function(desktop_) {
		var data = "";
		for(var key in this._theme) {
			data += key + ":" 
				+ ((this._theme[key]['active'] == 'true') ?
					desktop_._widgets[key]._name : this._theme[key]['name']) + ' '
				+ this._theme[key]['active'] + ' '
				+ this._theme[key]['icon'] + ' '
				+ this._theme[key]['path'] + ' '
				+ this._theme[key]['id'] + ' '
				+ ((this._theme[key]['active'] == 'true') ?
					desktop_._widgets[key]._position.x : this._theme[key]['pos'].x) + ' '
				+ ((this._theme[key]['active'] == 'true') ?
					desktop_._widgets[key]._position.y : this._theme[key]['pos'].y) + '\n';
		}
		// for(var i = 0; i < this._keys.length; ++i) {
			// data += this._keys[i] + this._theme[this._keys[i]] + '\n';
		// }
		_global._fs.writeFile(this._themePath, data, 'utf-8', function(err) {
			if(err) {
				console.log(err);
			} 
		});
	},

	loadThemeEntry: function(desktop_) {
		/* if(!this.inited) { */
			// this.req = desktop_;
			// this.once('inited', this.loadThemeEntry);
			// return ;
		/* } */
		for(var key in this._theme) {
			if(key == 'icontheme') continue;
			if(this._theme[key]['active'] == 'false') continue;
			desktop_.addAnDEntry(ThemeEntry.create(
						this._theme[key]['id'],
						desktop_._tabIndex++,
						this._theme[key]['path'],
						this._theme[key]['icon'],
						this._theme[key]['name']
						), ((typeof this._theme[key]['pos'].x === 'undefined' 
									|| typeof this._theme[key]['pos'].y === 'undefined')
									? undefined : this._theme[key]['pos']));
		}
	},

	getIconTheme: function() {
		return this._theme['icontheme']['name'];
	},

	setIconTheme: function(iconTheme_) {
		this._theme['icontheme']['name'] = iconTheme_;
		this.emit('IconTheme', null, iconTheme_);
	},

	getComputer: function() {
		this._theme['computer']['active'];
	},

	setComputer: function(active_) {
		this._theme['computer']['active'] = active_;
		this.emit('Computer', null, active_);
	},
	
	getTrash: function() {
		this._theme['trash']['active'];
	},

	setTrash: function(active_) {
		this._theme['trash']['active'] = active_;
		this.emit('Trash', null, active_);
	},
	
	getNetwork: function() {
		this._theme['network']['active'];
	},

	setNetwork: function(active_) {
		this._theme['network']['active'] = active_;
		this.emit('Network', null, active_);
	},
	
	getDocument: function() {
		this._theme['document']['active'];
	},

	setDocument: function(active_) {
		this._theme['document']['active'] = active_;
		this.emit('Document', null, active_);
	}
});

// The manager of Widgets
//
var WidgetManager = Model.extend({
	init: function() {
		this._widgets = [];
	},

	add: function(widget_) {
		this._widgets[widget_.getID()] = widget_;
	},

	remove: function(widget_) {
		this._widgets[widget_.getID()] = null;
		delete this._widgets[widget_.getID()];
	},

	getById: function(id_) {
		return this._widgets[id_];
	},

	getByAttr: function(attr_, value_) {
		for(var key1 in this._widgets) {
			for(var key2 in this._widgets[key1]) {
				if(key2 == attr_ && this._widgets[key1][key2] == value_)
					return this._widgets[key1];
			}
		}
		return null;
	},

	loadWidgets: function() {
		var _lastSave = [],
				lines = this._USER_CONFIG.split('\n');
		for(var i = 0; i < lines.length; ++i) {
			if(lines[i].match('[\s,\t]*#+') != null) continue;
			if(lines[i] == "") continue;
			var attr = lines[i].split('$');
			if(attr.length != 5) continue;
			var _plugin = null;
			switch(attr[4]) {
				case "ClockPlugin":
					// _plugin = ClockPlugin;
					break;
				case "ImagePlugin":
					// _plugin = PicPlugin;
					break;
				default:
					_lastSave[attr[0]] = {
						path: attr[1],
						x: attr[2],
						y: attr[3],
						type: attr[4]
					};	
			}
			/* if (_plugin != null) { */
				// _desktop.addAnDPlugin(_plugin.create(attr[0]
					// ,{x: attr[2], y: attr[3]}
					// ,attr[1]
					// ), {x: attr[2], y: attr[3]});
			/* } */
		}
		//handle destop entries
		this.addWidgets(_lastSave, this._desktopWatch.getBaseDir()
				,this._desktopWatch);
		//handle dock entries
	 /*  _desktop.addWidgets(_lastSave,_desktop._dock._dockWatch.getBaseDir() */
				/* ,_desktop._dock._dockWatch); */
	},

	//add entries by argv
	//lastSave_: saved config argv, from <dentries> file
	// dir_: full dir for watch ,such as: /home/user/桌面
	// watch_: watch_ is _desktopWatch or _dockWatch
	addWidgets:function(lastSave_, dir_, watch_) {
		var _this = this,
				desktop = global.get('desktop'),
				_newEntry = [];
		_global._fs.readdir(dir_, function(err, files) {
			_global.Series.series1(files, function(file_, cb_) {
				_global._fs.stat(dir_ + '/' + file_, function(err, stats) {
					var _id = 'id-' + stats.ino.toString();
					if(typeof lastSave_[_id] != 'undefined'
						&& lastSave_[_id].path.match(/[^\/]*$/) == file_) {
						// var _EntryView = null;
						var _DockAppView = null;
						var _model = null;
						switch(lastSave_[_id].type) {
							case "dockApp":
								// _DockApp = DockApp;
							case "app":
								_Entry = AppEntry;
								try {
									_model = desktop._launcher.get(_id);
								} catch(e) {
									_model = AppEntryModel.create(_id
										, lastSave_[_id].path
										, {x: lastSave_[_id].x, y: lastSave_[_id].y});
									desktop._launcher.set(_model);
								}
								break;
							case "dir":
								// _Entry = DirEntry;
								break;
							default:
								// _Entry = FileEntry;
						}
						if(_DockAppView) {
						} else {
							desktop.addAnDEntry(EntryView.create(_model), _model.getPosition());
						}
						/* if (_DockApp != null) { */
							// desktop.addAnAppToDock(_DockApp.create(_id
							// ,lastSave_[_id].x
							// ,lastSave_[_id].path));
						// } else if (_Entry != null) {
						// desktop.addAnDEntry(_Entry.create(_id
							// , 100 + desktop._tabIndex++
							// , lastSave_[_id].path
							// , {x: lastSave_[_id].x, y: lastSave_[_id].y}
							// ), {x: lastSave_[_id].x, y: lastSave_[_id].y});
						/* } */
					} else {
						_newEntry[_id] = {
							'filename': files[index_],
							'stats': stats
						};
					}
					cb_(null);
				});
			}, function() {
				for(var key in _newEntry) {
					watch_.emit('add'
						, _newEntry[key].filename
						, _newEntry[key].stats);
				}
			});
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
	}
});

// The model of Desktop
//
var DesktopModel = Model.extend({
	init: function(callback_) {
		this.callSuper('desktop');

		var _this = this;
		_global.Series.series([
			{
				fn: function(pera_, cb_) {
					_this.preStart(cb_);
				}
			},
			{
				fn: function(pera_, cb_) {
					_this.start(cb_);
				}
			},
			{
				fn: function(pera_, cb_) {
					callback_.call(this, null);
					cb_(null);
				}
			},
			{
				fn: function(pera_, cb_) {
					_this.postStart(cb_);
				}
			}
		]);
		
		// this._grid;
		/* this._ctxMenu = null; // TODO: put to Global? */
		// this._inputer = DesktopInputer.create('d-inputer');
		// this._selector = DesktopSelector.create();
		// this._position = undefined;
		// this._tabIndex = -1;
		// this._widgets = [];
		// this._dEntrys = OrderedQueue.create(function(entry1_, entry2_) {
			// var pos1 = entry1_.getPosition();
			// var pos2 = entry2_.getPosition();
			// if(pos1.x > pos2.x) {
				// return true;
			// } else if(pos1.x == pos2.x) {
				// if(pos1.y < pos2.y) {
					// return true;
				// } else {
					// return false;
				// }
			// } else {
				// return false;
			// }
		// });
		// this._ctrlKey = false;
		// this._xdg_data_home = undefined; // TODO: put to Global
		// this._rightMenu = undefined;
		// this._rightObjId = undefined;
		// this.generateGrid();
		// this.initCtxMenu();
		// this.initDesktopWatcher();
		// this.bindingEvents();
		// this._dock = Dock.create();
		
		// var _desktop = this;
		// _global._exec("echo $HOME/.local/share/", function(err, stdout, stderr) {
			// if(err) {
				// console.log(err);
				// callback_.call(this, err);
			// } else {
				// _desktop._xdg_data_home = stdout.substr(0, stdout.length - 1);
				// //add dock div to desktop
				// _desktop._dock.bingEvent();
				// theme.loadThemeEntry(_desktop);
				// _desktop.loadWidgets();
				// callback_.call(this, null);
			// }
		/* }); */
	},

	// Put codes needed run before starting in this function
	preStart: function(cb_) {
		console.log('pre start');
		// TODO: get user config data, init all components
		this._launcher = LauncherModel.create();
		var _this = this;
		_global._fs.readFile(_global._xdg_data_home + "/dwidgets/dentries"
			, 'utf-8', function(err, data) {
				if(err) {
					console.log(err);
					cb_(err);
				} else {
					_this._USER_CONFIG = data;
					cb_(null);
				}
			});
	},

	start: function(cb_) {
		console.log('starting');
		this._view = DesktopView.create(this);
		// TODO: Get the config first, load model of Desktop widgets
		//	, and then init the layout of them base of the config
		// TODO: Create a app launcher view
		this._layout; // the model of entry layout
		this.initLayout();
		cb_(null);
	},

	// Put codes needed run afert started in this function
	postStart: function(cb_) {
		console.log('post start');
		cb_(null);
	},

	initLayout: function() {
		this._layoutModel = LayoutModel.create('layout');
		// TODO: check config of layout
		this.setLayoutType('grid');
	},

	getLayoutType: function() {return this._layoutType;},

	setLayoutType: function(layoutType_) {
		this._layoutType = layoutType_;
		// TODO: 
		//	1. notify all entry models
		//	2. reset desktop layout
		switch(this._layoutType) {
			case 'grid':
				this._layoutView = GridView.create(this._layoutModel);
				this._layoutView.show();
				break;
			default:
				break;
		}
	}
});

// Base Class for all widget models
//
var WidgetModel = Model.extend({
	init: function(id_, position_) {
		this.callSuper(id_);
		this._position = position_;
	},
	
	getPosition: function() {return	this._position;},

	setPosition: function(position_) {
		this._position = position_;
		this.emit('position', null, this._position);
	},

	getID: function() {return this._id;},

	setID: function(id_) {this._id = id_;}
});

// The model of Entry
//
var EntryModel = WidgetModel.extend({
	init: function(id_, path_, position_) {
		if(typeof id_ === "undefined"
			|| typeof path_ === "undefined") {
			throw "Not enough params!! Init failed!!";
		}
		this.callSuper(id_, position_);
		this._path = path_;
		this._name = id_;
		this._imgPath = '';
		this._tabIdx = 0;
	},

	getPath: function() {return this._path;},

	setPath: function(path_) {
		this._path = path_;
		// TODO: notify
		this.emit('path', null, this._path);
	},

	getName: function() {return this._name;},

	setName: function(name_) {
		this._name = name_;
		// TODO: notify
		this.emit('name', null, this._name);
	},

	getImgPath: function() {return this._imgPath;},

	setImgPath: function(imgPath_) {
		this._imgPath = imgPath_;
		// TODO: notify
		this.emit('imgPath', null, this._imgPath);
	},

	getTabIdx: function() {return this._tabIdx;},

	setTabIdx: function(tabIdx_) {
		this._tabIdx = tabIdx_;
		this.emit('tabIdx', null, this._tabIdx);
	}
});

// The model of App Entry
// callback_: function(err)
// events provided: {'position', 'name', 'path', 'imgPath', 'cmd', 'type'}
//
var AppEntryModel = EntryModel.extend({
	init: function(id_, path_, position_, callback_) {
		this.callSuper(id_, path_, position_);
		this._execCmd = null;
		this._type = 'app';
		this.realInit(callback_);
	},

	realInit: function(callback_) {
		var _this = this;
		_global.get('utilIns').entryUtil.parseDesktopFile(_this._path, function(err_, file_) {
			if(err_) {
				console.log(err_);
				callback_.call(this, err_);
			}
			//get launch commad
			_this.setCmd(file_['Exec'].replace(/%(f|F|u|U|d|D|n|N|i|c|k|v|m)/g, '')
				.replace(/\\\\/g, '\\'));
			//get icon
			// TODO: change to get icon path from catch
			utilIns.entryUtil.getIconPath(file_['Icon'], 48, function(err_, imgPath_) {
				if(err_) {
					console.log(err_);
					callback_.call(this, err_);
				} else {
					_this.setImgPath(imgPath_[0]);
					callback_.call(this, null);
				}
			});
			//get name
			if(typeof file_['Name[zh_CN]'] !== "undefined") {
				_this.setName(file_['Name[zh_CN]']);
			} else {
				_this.setName(file_['Name']);
			}
		});
	},

	getCmd: function() {return this._execCmd;},

	setCmd: function(cmd_) {
		this._execCmd = cmd_;
		this.emit('cmd', null, this._execCmd);
	},

	getType: function() {return this._type;},

	setType: function(type_) {
		this._type = type_;
		this.emit('type', null, this._type);
	}
});

// The model class of Launcher
// Use lazy stratagy
//
var LauncherModel = Model.extend({
	init: function() {
		this.callSuper('launcher');
		this._appCache = Cache.create(); // caches app models
	},

	get: function(id_) {
		var ret = this._appCache.get(id_);
		if(typeof ret === 'undefined') {
			// catch this exception and get app model from FS
			throw 'Not in catch!';
			// this._appCache.set(ret.getID(), ret);
		}
		return ret;
	},

	set: function(id_, app_) {
		this._appCache[id_] = app_;
	}
});

// The model class of Layout
//
var LayoutModel = WidgetModel.extend({
	init: function(id_) {
		this.callSuper(id_);

		this._width = $(document).width() * 0.92;
		this._height = $(document).height() * 0.9;
		
		this._col = 80 + 20;
		this._row = 80 + 20;
		this._col_num = Math.floor(this._width / this._col);
		this._row_num = Math.floor(this._height / this._row);
		this._grid = [];
	},

	getSize: function() {
		return {
			'width': this._width,
			'height': this._height
		};
	},

	setSize: function(size_) {
		this._width = size_.width || this._width;
		this._height = size_.height || this._height;
		// TODO: check if the size is different, recalculate the col_num and row_num
		//	and then notify to redraw the view of layout
	},
	
	getGridSize: function() {
		return {
			'gridWidth': this._col,
			'gridHeight': this._row
		};
	},

	setGridSize: function(gridSize_) {
		this._col = gridSize_.gridWidth || this._col;
		this._row = gridSize_.gridHeight || this._row;
		// TODO: check if the size is different, recalculate the col_num and row_num
		//	and then notify to redraw the view of layout
	},
	
	getColNum: function() {return this._col_num;},

	getRowNum: function() {return this._row_num;},

	findAnIdleGrid: function() {
		for(var i = parseInt(this._col_num - 1); i >= 0; --i) {
			for(var j = 0; j < this._row_num; ++j) {
				if(this._grid[i][j].use == false) {
					return {x: i, y: j};
				}
			}
		}
		return null;
	},

	findAnIdleGridFromRight: function() {
		var col_add = parseInt($('.plugin-div').width()/this._col-0.00001)+1;
		var row_add =  parseInt($('.plugin-div').height()/this._row-0.00001)+1;
		//console.log(col_add+" "+row_add+" "+ this._col + " "+ $('.plugin-div').height());
		for(var i =0; i < this._col_num; i=i+col_add) {
			for(var j = 0; j < this._row_num; j=j+row_add) {
				if(this._grid[i][j].use == false) {
					return {x: i, y: j};
				}
			}
		}
		return null;
	},

	//check grid is occupy return true
	// if grid is Idle or null  return false
	isIdleGrid: function(col,row, col_l, row_l){
		if(col >= 0 && col < this._col_num && row >= 0 && row < this._row_num)
		{
			for (var i = col; i >= 0; i--) {
				if (col - i >=  col_l) {break};
				for(var j = row; j< this._row_num ;j++){
						if(j-row >= row_l) break;
						if(this._grid[i][j].use == true) return false;
				}
			}
			return true;
		}
		else return false;
	},
	// col_l , row_l <= 2
	// power of 2*2 grid as follow :
	//  ------------------
	//  |  1   |   2   |
	//  ------------------
	//  |  4   |   8   |
	//  ------------------
	findIdleGrid: function(col,row,col_l,row_l){
		var sum = 0;
		for (var i = col; i >= 0; i--) {
			if (col - i >=  col_l) {break};
			for(var j = row; j< this._row_num ;j++)
			{
				if(j-row >= row_l) break;
				if(this._grid[i][j].use == true)
				{
					sum += (col-i+1)*(j-row+1)*(j-row+1);
				}
			}
		}
		switch(sum){
			case 0:
			return {x:col,y:row};					
			case 8: 
				if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};                 //left
				else if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};		// top
				else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};		//left-top
				break;
			case 4 :
				if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};				//right
				else if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};		//top
				else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};		//right-top
				break;
			case 2:
				if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};				//left 
				else if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};		//down
				else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};	//left-down
				break;
			case 1:
				if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};				//right
				else if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};		//down
				else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};		//right-down
				break;
			case 3:
				if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};				//down
				else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};	//left-down
				else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};		//right-down
				break;
			case 12:
				if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};				//top
				else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};		//left-top
				else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};		//right-top
				break;
			case 10:
				if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};				//left
				else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};		//left-top
				else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};	//left-down
				break;
			case 5:
				if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};				//right
				else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};		//right-top
				else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};		//right-down
				break;
			case 6:
				if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};		//left-top
				else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};		//right-down
				break;
			case 14:
				if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};		//left-top
				break;
			case 9:
				if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};			//right-top
				else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};	//left-down
				break;
			case 13:
				if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};			//right-top
				break;
			case 7:
				if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};		//right-down
				break;
			case 11:
				if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};		//left-down
				break;
			default:
				return null;									//no Idle grid;
		}
		return null;											// can't find grid is Idel
	},

	//flag grid_x_y is occupied or not 
	// width=col_l height = row_l  
	//occupy_ = true or false(occupy or not) ;  brother_ is nomber of all the brother grids 
	flagGridOccupy : function(col,row,col_l,row_l,occupy_){
		for (var i = col; i >= 0; i--) {
			if (col - i >=  col_l) {break};
			for(var j = row; j< this._row_num ;j++)
			{
				if(j-row >= row_l) break;
				this._grid[i][j].use=occupy_;
			}
		}
	},

	findALegalNearingIdleGrid: function(t_pos_) {
		for(var i = t_pos_.x, firstX = true
			; i != t_pos_.x || firstX
			; i = (i + this._col_num - 1) % this._col_num) {
			firstX = false;
			for(var j = t_pos_.y, firstY = true
				; j != t_pos_.y || firstY
				; j = (j + 1) % this._row_num) {
				firstY = false;
				if(this._grid[i][j].use == false) {
					return {x: i, y: j};
				}
			}
			t_pos_.y = 0;
		}
		return null;
	},

	// TODO: implement a funtion for PlaneView to judge whether two entries are overlap.
	isOverlap: function(entry1_, entry2_) {}
});
