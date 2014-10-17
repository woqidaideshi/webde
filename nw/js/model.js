//This file includes all model classes used in this project
//

//This class contains all theme relevant data and service.
//TODO: replace the nodejs apis to ourselves.
//
var ThemeModel = Model.extend({
  init: function(callback_) {
    this._theme = [];
    this._themePath = _global.$xdg_data_home + "/theme.conf";
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
          desktop_._c[key]._name : this._theme[key]['name']) + ' '
        + this._theme[key]['active'] + ' '
        + this._theme[key]['icon'] + ' '
        + this._theme[key]['path'] + ' '
        + this._theme[key]['id'] + ' '
        + ((this._theme[key]['active'] == 'true') ?
          desktop_._c[key]._position.x : this._theme[key]['pos'].x) + ' '
        + ((this._theme[key]['active'] == 'true') ?
          desktop_._c[key]._position.y : this._theme[key]['pos'].y) + '\n';
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
      this.addAThemeEntry(key);
      /* desktop_.addAnDEntry(ThemeEntry.create( */
            // this._theme[key]['id'],
            // desktop_._tabIndex++,
            // this._theme[key]['path'],
            // this._theme[key]['icon'],
            // this._theme[key]['name']
            // ), ((typeof this._theme[key]['pos'].x === 'undefined' 
                  // || typeof this._theme[key]['pos'].y === 'undefined')
                  /* ? undefined : this._theme[key]['pos'])); */
    }
  },

  addAThemeEntry: function(key_) {
    _global.get('desktop').getCOMById('layout').add(ThemeEntryModel.create(
      this._theme[key_]['id'],
      this._theme[key_]['path'],
      this._theme[key_]['icon'],
      this._theme[key_]['name'],
      ((typeof this._theme[key_]['pos'].x === 'undefined' 
        || typeof this._theme[key_]['pos'].y === 'undefined')
        ? undefined : this._theme[key_]['pos'])
    ));
  },

  removeAThemeEntry: function(key_) {
    var layout = _global.get('desktop').getCOMById('layout'),
        entry = layout.getWidgetById(key_);
    layout.remove(entry);
  },

  getIconTheme: function() {
    return this._theme['icontheme']['name'];
  },

  setIconTheme: function(iconTheme_) {
    if(this._theme['icontheme']['name'] != iconTheme_) {
      this.emit('IconTheme', null, iconTheme_);
      this._theme['icontheme']['name'] = iconTheme_;
    }
  },

  getComputer: function() {
    this._theme['computer']['active'];
  },

  setComputer: function(active_) {
    if(this._theme['computer']['active'] != active_) {
      this.emit('Computer', null, active_);
      this._theme['computer']['active'] = active_;
      if(active_) {
        this.addAThemeEntry('computer');
      } else {
        this.removeAThemeEntry('computer');
      }
    }    
  },
  
  getTrash: function() {
    this._theme['trash']['active'];
  },

  setTrash: function(active_) {
    if(this._theme['trash']['active'] != active_) {
      this.emit('Trash', null, active_);
      this._theme['trash']['active'] = active_;
      if(active_) {
        this.addAThemeEntry('trash');
      } else {
        this.removeAThemeEntry('trash');
      }
    }
  },
  
  getNetwork: function() {
    this._theme['network']['active'];
  },

  setNetwork: function(active_) {
    if(this._theme['network']['active'] != active_) {
      this.emit('Network', null, active_);
      this._theme['network']['active'] = active_;
      if(active_) {
        this.addAThemeEntry('network');
      } else {
        this.removeAThemeEntry('network');
      }
    }
  },
  
  getDocument: function() {
    this._theme['document']['active'];
  },

  setDocument: function(active_) {
    if(this._theme['document']['active'] != active_) {
      this.emit('Document', null, active_);
      this._theme['document']['active'] = active_;
      if(active_) {
        this.addAThemeEntry('document');
      } else {
        this.removeAThemeEntry('document');
      }
    }
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
    
    /* this._ctxMenu = null; // TODO: put to Global? */
    // this._inputer = DesktopInputer.create('d-inputer');
    // this._selector = DesktopSelector.create();
    // this._position = undefined;
    // this._tabIndex = -1;
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
    // this._rightMenu = undefined;
    // this._rightObjId = undefined;
    // this.generateGrid();
    // this.initCtxMenu();
    // this.bindingEvents();
    // this._dock = Dock.create();
    
    // var _desktop = this;
    // _global._exec("echo $HOME/.local/share/", function(err, stdout, stderr) {
      // if(err) {
        // console.log(err);
        // callback_.call(this, err);
      // } else {
        // //add dock div to desktop
        // _desktop._dock.bingEvent();
        // callback_.call(this, null);
      // }
    /* }); */
  },

  release: function() {
    for(var key in this._c) {
      this._c[key].release();
    }
    this._desktopWatch.close();
  },

  // Put codes needed run before starting in this function
  // The cb_ should be called at the end of this function
  //
  preStart: function(cb_) {
    console.log('pre start');
    this._view = DesktopView.create(this);
    // TODO: get user config data, create all components(Launcher, Layout, Dock, DeviceList)
    this.add(LauncherModel.create());
    this.initLayout();
    this.add(DeviceListModel.create());
    this.add(DockModel.create());
    this.initDesktopWatcher();
    var _this = this;
    _global._fs.readFile(_global.$xdg_data_home + "/widget.conf"
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

  // The cb_ should be called at the end of this function
  //
  start: function(cb_) {
    console.log('starting');
    // TODO: Load contents to all components EXCEPT Launcher and DeciceList
    _global.get('theme').loadThemeEntry(this);
    this.getCOMById('layout').load();
    this.getCOMById('dock').load();
    cb_(null);
  },

  // Put codes needed run afert started in this function
  // The cb_ should be called at the end of this function
  //
  postStart: function(cb_) {
    console.log('post start');
    // TODO: Load contents of Launcher and DeviceList
    this.getCOMById('device-list').start();
    cb_(null);
  },

  initLayout: function() {
    this.add(LayoutModel.create('layout'));
    // TODO: check config of layout
    this.setLayoutType('grid');
  },

  getLayoutType: function() {return this._layoutType;},

  setLayoutType: function(layoutType_) {
    if(this._layoutType != layoutType_) {
      this._layoutType = layoutType_;
      this.emit('layout', null, this._layoutType, this.getCOMById('layout'));
    }
  },

  getGrid: function() {
    if(this._layoutType == 'grid') {
      return this.getCOMById('layout');
    }
    return null;
  },

  initDesktopWatcher: function() {
    var _desktop = this;
    this._DESKTOP_DIR = _global.$xdg_data_home + '/desktop';
    this._desktopWatch = Watcher.create(this._DESKTOP_DIR);
    this._desktopWatch.on('add', function(filename, stats) {
      //console.log('add:', filename, stats);
      var _filenames = filename.split('.'),
          _model = null,
          _id = 'id-' + stats.ino.toString();
      
      if(_filenames[0] == '') {
        return ;//ignore hidden files
      }
      if(stats.isDirectory()) {
        _model = DirEntryModel.create(_id
              , _desktop._desktopWatch.getBaseDir() + '/' + filename
              , _desktop._position);
      } else {
        if(_filenames[_filenames.length - 1] == 'desktop') {
          try {
            _model = _desktop.getCOMById('launcher').get(_id);
          } catch(e) {
            var linkPath = _desktop._desktopWatch.getBaseDir() + '/' + filename;
            /* _global._fs.readlink(linkPath, function(err_, path_) { */
              // if(err_) {
                // _model = AppEntryModel.create(_id
                  // , linkPath
                  // , _desktop._position);
              // } else {
                // _model = AppEntryModel.create(_id
                  // , path_
                  // , _desktop._position);
              // }
              // _desktop.getCOMById('launcher').set(_model);
              // _desktop.getCOMById('layout').add(_model);
            /* }); */
            _model = AppEntryModel.create(_id
                , linkPath
                , _desktop._position);
            _desktop.getCOMById('launcher').set(_model);
          } 
        } else {
          _model = FileEntryModel.create(_id
              , _desktop._desktopWatch.getBaseDir() + '/' + filename
              , _desktop._position);
        }
      }

      if(_model != null)
        _desktop.getCOMById('layout').add(_model);
      // _desktop.addAnDEntry(EntryView.create(_id + '-entry-view', _model), _model.getPosition());
    });
    this._desktopWatch.on('delete', function(filename) {
      //console.log('delete:', filename);
      //find entry object by path
      var /* _path = _desktop._desktopWatch.getBaseDir() + '/' + filename, */
          _layout = _desktop.getCOMById('layout'),
          _entry = _layout.getWidgetByAttr('_filename', filename);
      if(_entry == null) {
        console.log('Can not find this widget');
        return ;
      }
      _layout.remove(_entry);
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
  }
});

// Dock component of Desktop
//
var DockModel = Model.extend({
  init: function() {
    this.callSuper('dock');
    this._index = 0;
    this.initWatcher();
  },

  load: function() {
    // TODO: load dock apps from configure file
    var _this = this;
    _global._fs.readFile(_this._DOCK_DIR + '/.info', 'utf-8', function(err, data) {
      if(err) {
        console.log(err);
        return ;
      }
      var lines = data.split('\n'),
          lastSave = [];
      for(var i = 0; i < lines.length; ++i) {
        if(lines[i].match('[\s,\t]*#+') != null) continue;
        if(lines[i] == '') continue;
        var attr = lines[i].split('$');
        if(attr.length != 5) continue;
        lastSave[attr[0]] = {
          path: attr[1],
          x: attr[2],
          y: attr[3],
          type: attr[4]
        };
      }
      _global.get('utilIns').entryUtil.loadEntrys(lastSave, _this._dockWatch.getBaseDir()
        , _this._dockWatch, _this);
    });
  },

  release: function() {
    this._dockWatch.close();
  },

  initWatcher: function() {
    this._DOCK_DIR = _global.$xdg_data_home + '/dock';
    this._dockWatch = Watcher.create(this._DOCK_DIR);
    var _this = this;
    this._dockWatch.on('add', function(filename, stats) {
      //console.log('add:', filename, stats);
      var _filenames = filename.split('.'),
          _desktop = _global.get('desktop'),
          _model = null,
          _id = 'id-' + stats.ino.toString();
      
      if(_filenames[0] == '') {
        return ;//ignore hidden files
      }
      if((!stats.isDirectory()) && _filenames[_filenames.length - 1] == 'desktop') {
        try {
          _model = _desktop.getCOMById('launcher').get(_id);
        } catch(e) {
          /* var linkPath = _this._dockWatch.getBaseDir() + '/' + filename; */
          // _global._fs.readlink(linkPath, function(err_, path_) {
            // if(err_) {
              // _model = AppEntryModel.create(_id
                // , linkPath
                // , _desktop._position);
            // } else {
              // _model = AppEntryModel.create(_id
                // , path_
                // , _desktop._position);
            // }
            // _desktop.getCOMById('launcher').set(_model);
            // _this.add(_model);
          /* }); */
          _model = AppEntryModel.create(_id 
            , _this._dockWatch.getBaseDir() + '/' + filename
            , _this._position);
          _desktop.getCOMById('launcher').set(_model); 
        }
        _this.add(_model);
      }
    });
    this._dockWatch.on('delete', function(filename) {
      //console.log('delete:', filename);
      //find entry object by path
      // var _path = _this._dockWatch.getBaseDir() + '/' + filename;
      var _dockApp = _this.getCOMByAttr('_filename', filename);
      if(_dockApp == null) {
        console.log('Can not find this widget');
        return ;
      }
      _this.remove(_dockApp);
    });
    this._dockWatch.on('rename', function(oldName, newName) {
      console.log('rename:', oldName, '->', newName);
    });
  },

  getIndex: function() {return this._index;},

  setIndex: function(idx_) {
    this._index = idx_;
    this.emit('index', null, this._index);
  }
});

// Base Class for all widget models
//
var WidgetModel = Model.extend({
  init: function(id_, position_) {
    this.callSuper(id_);
    this._position = position_;
  },
  
  getPosition: function() {return  this._position;},

  setPosition: function(position_) {
    this._position = position_;
    this.emit('position', null, this._position);
  },

  getID: function() {return this._id;},

  setID: function(id_) {this._id = id_;},
});

var DPluginModel = WidgetModel.extend({
  init: function(id_, path_, type_, position_) {
    this.callSuper(id_, position_);
    this._path = path_;
    this._type = type_ || 'plugin';
    this._col_num = 0;
    this._row_num = 0;
    this._content = 'Content';
  },

  getPath: function() {return this._path;},

  getType: function() {return this._type;},

  getColNum: function() {return this._col_num;},

  getRowNum: function() {return this._row_num;},

  getSize: function() {return this._size;},

  setSize: function(size_) {
    this._size = size_;
    // TODO: recal col_num and row_num;
    var grid = _global.get('desktop').getGrid();
    if(grid != null) {
      var gridSize = grid.getGridSize();
      this._col_num = parseInt(this._size.width / gridSize.gridWidth - 0.00001) + 1;
      this._row_num = parseInt(this._size.height / gridSize.gridHeight - 0.00001) + 1;
    }
    this.emit('size', null, this._size);
  },

  zoomIn: function() {
    if(this._size.width >= 180) {
      alert('the plugin has been max size!!');
    } else {
      this.setSize({
        'width': _width + 20,
        'height': _width + 20
      });
      var grid = _global.get('desktop').getGrid();
      if(grid != null)
        grid.flagGridOccupy(
            _this._position.x, 
            _this._position.y, 
            _this._col_num, 
            _this._row_num, 
            true);

      if(this._size.width == 180) { 
        desktop._ctxMenu.disableItem('plugin', 'zoom in');
      } else if (this._size.width == 60) {
        desktop._ctxMenu.activeItem('plugin', 'zoom out', function(e) {
          e.preventDefault();
          _this.zoomOut();
        });
      };
    }
  },

  zoomOut: function() {
    if(this._size.width <= 60) {
      alert('the plugin has been min size!!');
    } else {
      var grid = _global.get('desktop').getGrid();
      if(grid != null)
        grid.flagGridOccupy(
            _this._position.x, 
            _this._position.y, 
            _this._col_num, 
            _this._row_num, 
            false);
      this.setSize({
        'width': _width * 1 - 20,
        'height': _width * 1 - 20
      });
      if(grid != null)
        grid.flagGridOccupy(
            _this._position.x, 
            _this._position.y, 
            _this._col_num, 
            _this._row_num, 
            true);

      if(this._size.width - 20 == 60) { 
        desktop._ctxMenu.disableItem('plugin', 'zoom out');
      } else if (this._size.width == 180) {
        desktop._ctxMenu.activeItem('plugin', 'zoom in', function(e) {
          e.preventDefault();
          _this.zoomIn();
        });
      };
    }
  }
});

// var ClockPluginModel = DPluginModel.extend({
  // init: function(id_, position_, path_) {
    // this.callSuper(id_, position_);
    // this._type = 'ClockPlugin';
    // this._path = path_;
    // this._content = 'Content';
  // }
// });

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
    this._filename = path_.match(/[^\/]*$/)[0];
    this._name = id_;
    this._imgPath = '';
    this._tabIdx = 0;
    this._focused = false;
  },

  getFilename: function() {return this._filename;},

  getPath: function() {return this._path;},

  setPath: function(path_) {
    this._path = path_;
    this.emit('path', null, this._path);
  },

  getName: function() {return this._name;},

  setName: function(name_) {
    this._name = name_;
    this.emit('name', null, this._name);
  },

  getImgPath: function() {return this._imgPath;},

  setImgPath: function(imgPath_) {
    this._imgPath = imgPath_;
    this.emit('imgPath', null, this._imgPath);
  },

  getTabIdx: function() {return this._tabIdx;},

  setTabIdx: function(tabIdx_) {
    this._tabIdx = tabIdx_;
    this.emit('tabIdx', null, this._tabIdx);
  },

  getType: function() {return this._type;},

  setType: function(type_) {
    this._type = type_;
    this.emit('type', null, this._type);
  },

  getFocus: function() {return this._focused;},

  focus: function() {
    this._focused = true;
    this.emit('focus', null);
  },

  blur: function() {
    this._focused = false;
    this.emit('blur', null);
  },

  moveTo: function() {},

  copyTo: function() {},

  open: function() {}
});

// The model of App Entry
// callback_: function(err)
// events provided: {'position', 'name', 'path', 'imgPath', 'cmd', 'type', 'index'}
//
var AppEntryModel = EntryModel.extend({
  init: function(id_, path_, position_, callback_) {
    this.callSuper(id_, path_, position_);
    var cb_ = callback_ || function() {};
    this._execCmd = null;
    this._type = 'app';
    this._idx = ((typeof position_ === 'undefined') ? -1 : position_.x);
    this.realInit(cb_);
  },

  realInit: function(callback_) {
    var _this = this,
        utilIns = _global.get('utilIns');
    utilIns.entryUtil.parseDesktopFile(_this._path, function(err_, file_) {
      if(err_) {
        console.log(err_);
        callback_.call(this, err_);
      }
      //get launch commad
      _this.setCmd(file_['Exec'].replace(/%(f|F|u|U|d|D|n|N|i|c|k|v|m)/g, '')
        .replace(/\\\\/g, '\\'));
      //get icon
      // TODO: change to get icon path from cache
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

  getIdx: function() {return this._idx;},

  setIdx: function(idx_) {
    this._idx = idx_;
    this.emit('index', null, this._idx);
  },

  // TODO: open a file by using this app
  copyTo: function() {},

  open: function() {
    _global._exec(this._execCmd, function(err, stdout, stderr) {
      if(err !== null) {
        console.log(err);
      }
    });
  },

  rename: function(name_) {
    if(name_ != this._name) {
      // TODO: rename a app entry
    }
  }
});

var FileEntryModel = EntryModel.extend({
  init: function(id_, path_, position_, callback_) {
    this.callSuper(id_, path_, position_);
    var  match = /^.*[\/]([^\/]*)$/.exec(path_);
    this._name = match[1];
    this._type = 'file';
    match = this._name.match(/[\.][^\.]*$/);
    if(match != null) this._type = match[0].substr(1);
    this.realInit(callback_);
  },

  realInit: function(callback_) {
    var cb_ = callback_ || function() {};
    var _this = this,
        utilIns = _global.get('utilIns');
    utilIns.entryUtil.getMimeType(_this._path, function(err_, mimeType_) {
      // TODO: try to get icon from cache first
      utilIns.entryUtil.getIconPath(mimeType_.replace('/', '-'), 48
        , function(err_, imgPath_) {
          if(err_) {
            utilIns.entryUtil.getDefaultApp(mimeType_, function(err_, appFile_) {
              if(err_) console.log(err_);
              // TODO: try to get icon from cache first
              utilIns.entryUtil.parseDesktopFile(appFile_, function(err_, file_) {
                if(err_) console.log(err_);
                utilIns.entryUtil.getIconPath(file_['Icon'], 48
                  , function(err_, imgPath_) {
                    if(err_) {
                      console.log(err_);
                      cb_(err_);
                    } else {
                      _this.setImgPath(imgPath_[0]);
                      cb_(null);
                    }
                });
              });
            });
          } else {
            _this.setImgPath(imgPath_[0]);
            cb_(null);
          }
        });
    });
    _this.setName(this._name);
  },

  rename: function(name_) {
    if(name_ != this._name) {
      var _match = /(.*[\/])([^\/].*)$/.exec(this._path);
      this._path = _match[1] + name_;
      _match = /(.*)[\.]([^\.].*)$/.exec(name_);
      if(_match != null && _match[2] != this._type) {
        this._type = _match[2];
        // reparse the file type
        this.realInit();
      } else {
        this.setName(name_);
      }
    }
  },

  open: function() {
    _global._exec('xdg-open ' + this._path.replace(/ /g, '\\ ')
        , function(err, stdout, stderr) {
          if(err) console.log(err);
        });
  }
});

var DirEntryModel = FileEntryModel.extend({
  init: function(id_, path_, position_, callback_) {
    this.callSuper(id_, path_, position_);
    this._type = 'dir';
  },

  // TODO: copy file to this dir
  copyTo: function() {},

  // TODO: move file to this dir
  moveTo: function() {},

  rename: function(name_) {
    if(name_ != this._name) {
      this.setName(name_);
      var _match = /(.*[\/])([^\/].*)$/.exec(this._path);
      this._path = _match[1] + this._name;
    }
  }
});

var ThemeEntryModel = EntryModel.extend({
  init: function(id_, path_, iconName_, name_, position_, callback_) {
    this.callSuper(id_, path_, position_, callback_);
    this._iconName = iconName_;
    this._name = name_;
    this._type = 'theme';
    this.realInit(callback_);
  },

  realInit: function(callback_) {
    var cb = callback_ || function() {},
        _this = this;
    _global.get('utilIns').entryUtil.getIconPath(_this._iconName, 48, function(err_, iconPath_) {
      if(err_) {
        console.log(err_);
        cb(err_);
      } else {
        _this.setImgPath(iconPath_[0]);
        cb(null);
      }
    });
  },

  rename: function(name_) {
    this.setName(name_);
  },

  open: function() {
    _global._exec('xdg-open ' + this._path, function(err, stdout, stderr) {
      if(err) {
        console.log(err);
      }
    });
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

  load: function() {},

  get: function(id_) {
    var ret = this._appCache.get(id_);
    if(typeof ret === 'undefined') {
      // catch this exception and get app model from FS
      throw 'Not in cache!';
    }
    return ret;
  },

  set: function(app_) {
    this._appCache.set(app_.getID(), app_);
    this.emit('new', null, app_);
  },

  release: function() {}
});

// The manager of Widgets
//
var WidgetManager = Model.extend({
  init: function() {
    this.callSuper('widgetmanager');
  },

  loadWidgets: function() {
    // TODO: load theme entry
    var _lastSave = [],
        desktop = _global.get('desktop'),
        lines = desktop._USER_CONFIG.split('\n');
    for(var i = 0; i < lines.length; ++i) {
      if(lines[i].match('[\s,\t]*#+') != null) continue;
      if(lines[i] == "") continue;
      var attr = lines[i].split('$');
      if(attr.length != 5) continue;
      var _plugin = null;
      switch(attr[4]) {
        case "ClockPlugin":
        case "ImagePlugin":
          _plugin = DPluginModel.create(attr[0], attr[1], attr[4]
              , {x: attr[2], y: attr[3]});
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
        this.add(_plugin);  
      } 
    }
    //handle destop entries
    _global.get('utilIns').entryUtil.loadEntrys(_lastSave, desktop._desktopWatch.getBaseDir()
        , desktop._desktopWatch, this);
    //handle dock entries
   /*  _desktop.addWidgets(_lastSave,_desktop._dock._dockWatch.getBaseDir() */
        /* ,_desktop._dock._dockWatch); */
  },

  saveWidgets: function() {
    var data = "";
    for(var key in this._c) {
      if(typeof theme._theme[key] !== 'undefined') continue;
      data += key + "$" + this._c[key]._path + "$"
         + this._c[key]._position.x + "$"
         + this._c[key]._position.y + "$"
        + this._c[key]._type + '\n';
    }
    //console.log(data);
    this._fs.writeFile(_global.$xdg_data_home + "/widget.conf"
        , data, function(err) {
      if(err) {
        console.log(err);
      }
    });
  }
});

// The model class of Layout
//
var LayoutModel = WidgetModel.extend({
  init: function(id_) {
    this.callSuper(id_);

    this._wm = WidgetManager.create();
    this._width = $(document).width() * 0.92;
    this._height = $(document).height() * 0.9;
    
    this._col = 80 + 20;
    this._row = 80 + 20;
    this._col_num = Math.floor(this._width / this._col);
    this._row_num = Math.floor(this._height / this._row);
    this._grid = [];
  },

  release: function() {},

  add: function(widget_) {
    this._wm.add(widget_);
  },

  remove: function(widget_) {
    this._wm.remove(widget_);
  },

  getWidgetById: function(id_) {
    return this._wm.getCOMById(id_);
  },

  getWidgetByAttr: function(attr_, value_) {
    return this._wm.getCOMByAttr(attr_, value_);
  },

  on: function() {
    return this._wm.on.apply(this._wm, arguments);
  },

  off: function() {
    return this._wm.off.apply(this._wm, arguments);
  },

  load: function() {
    this._wm.loadWidgets();
  },

  save: function() {
    this._wm.saveWidgets();
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
    //  and then notify to redraw the view of layout
    this.emit('layout_size', {
      'width': this._width,
      'height': this._height
    });
    if(typeof size_.width !== 'undefined' || typeof size_.height !== 'undefined')
      this.cal();
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
    //  and then notify to redraw the view of layout
    this.emit('grid_size', {
      'gridWidth': this._col,
      'gridHeight': this._row
    });
    if(typeof gridSize_.gridWidth !== 'undefined' || typeof gridSize_.gridHeight !== 'undefined')
      this.cal();
  },
  
  getColNum: function() {return this._col_num;},

  getRowNum: function() {return this._row_num;},

  cal: function() {
    var cn = Math.floor(this._width / this._col);
    var rn = Math.floor(this._height / this._row);
    if(cn != this._col_num || rn != this._row_num) {
      this._col_num = cn;
      this._row_num = rn;
      this.emit('col_row', {
        'col': this._col_num,
        'row': this._row_num
      });
    }
  },

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
        else if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};    // top
        else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};    //left-top
        break;
      case 4 :
        if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};        //right
        else if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};    //top
        else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};    //right-top
        break;
      case 2:
        if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};        //left 
        else if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};    //down
        else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};  //left-down
        break;
      case 1:
        if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};        //right
        else if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};    //down
        else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};    //right-down
        break;
      case 3:
        if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};        //down
        else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};  //left-down
        else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};    //right-down
        break;
      case 12:
        if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};        //top
        else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};    //left-top
        else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};    //right-top
        break;
      case 10:
        if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};        //left
        else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};    //left-top
        else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};  //left-down
        break;
      case 5:
        if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};        //right
        else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};    //right-top
        else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};    //right-down
        break;
      case 6:
        if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};    //left-top
        else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};    //right-down
        break;
      case 14:
        if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};    //left-top
        break;
      case 9:
        if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};      //right-top
        else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};  //left-down
        break;
      case 13:
        if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};      //right-top
        break;
      case 7:
        if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};    //right-down
        break;
      case 11:
        if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};    //left-down
        break;
      default:
        return null;                  //no Idle grid;
    }
    return null;                      // can't find grid is Idel
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

var DeviceListModel = Model.extend({
  init: function() {
    this.callSuper('device-list');
  },

  release: function() {
    // TODO: release device monitor server
    _global._device.removeDeviceListener(this.__handler);
    _global._device.entryGroupReset();
  },

  __handler: function(ev_, dev_) {
    if(dev_ == null) return ;
    var _this = _global.get('desktop').getCOMById('device-list'),
        id_ = dev_.address + ':' + dev_.port;
    switch(ev_) {
      case 'ItemNew':
        var device = DeviceEntryModel.create(id_, dev_.name);
        _this.add(device);
        break;
      case 'ItemRemove':
        var device = _this.getCOMById(id_);
        _this.remove(device);
        break;
    }
  },

  start: function() {
    //load devices
    /* _global._device.showDeviceList(function(devs_) {   */
      // for(var addr in devs_) {
        // var id_ = addr + ':' + devs_[addr].port;
        // var device = DeviceEntryModel.create(id_, devs_[addr].name);
        // _this.add(device);
      // }
    /* }); */
    var _this = this;
    _global._device.addDeviceListener(this.__handler);
    _global._device.createServer(function() {
      _global._device.entryGroupCommit('demo-webde', '80', ['demo-webde:', 'hello!']);
    })

    /* this._timer = setInterval(function() { */
      // for(var id in _this._c) {
        // _this._c[id]._offline = true;
      // }
      // // update device list
      // _global._device.showDeviceList(function(devs_) { 
        // for(var addr in devs_) {
          // var id_ = addr + ':' + devs_[addr].port;
          // if(typeof _this._c[id_] === 'undefined') {
            // var device = DeviceEntryModel.create(id_, devs_[addr].name);
            // _this.add(device);
          // } else {
            // _this._c[id_]._offline = false;
          // }
        // }
        // for(var id in _this._c) {
          // if(_this._c[id]._offline) {
            // _this.remove(_this._c[id]);
          // }
        // }
      // }); 
    /* }, 5000); */
  }
});

var DeviceEntryModel = EntryModel.extend({
  // @id_ is address:port
  // @path_ is name
  init: function(id_, path_, position_, callback_) {
    this.callSuper(id_, path_, position_);
    this._name = path_;
    this._offline = false;
    this._type = 'dev';
    this.realInit(callback_);
  },

  realInit: function(cb_) {
    var cb = cb_ || function() {};
    // TODO: get icon from cache or fs, and call cb at last
    cb(null);
  },

  // TODO: show something of this device
  open: function() {},

  // TODO: send a file to this device
  copyTo: function() {}
});

