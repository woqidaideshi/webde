//This file includes all model classes used in this project
//

//This class contains all theme relevant data and service.
//TODO: replace the nodejs apis to ourselves.
//
var ThemeModel = Model.extend({
  init: function(callback_) {
    this.callSuper('theme');
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
    for(var key in this._theme) {
      if(key == 'icontheme') continue;
      if(this._theme[key]['active'] == 'false') continue;
      this.addAThemeEntry(key);
    }
  },

  addAThemeEntry: function(key_) {
    var layout = _global.get('desktop').getCOMById('layout'),
        parent = layout.getAllWidgets()[layout.getCur()];
    parent.add(ThemeEntryModel.create(
      this._theme[key_]['id'],
      parent,
      this._theme[key_]['path'],
      this._theme[key_]['icon'],
      this._theme[key_]['name'],
      ((typeof this._theme[key_]['pos'].x === 'undefined' 
        || typeof this._theme[key_]['pos'].y === 'undefined')
        ? undefined : this._theme[key_]['pos'])
    ));
  },

  removeAThemeEntry: function(key_) {
    var layout = _global.get('desktop').getCOMById('layout').getCurLayout(),
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
    // TODO: move to Global
    this._view = DesktopView.create(this);
    // TODO: get user config data, create all components(Launcher, Layout, Dock, DeviceList)
    this.add(FlipperModel.create('layout', this, LayoutManager));
    this.add(DeviceListModel.create(this));
    this.add(DockModel.create(this));
    this.add(LauncherModel.create(this));
    // this.initDesktopWatcher();
    this._inputer = Inputer.create('d-inputer');
    this._DESKTOP_DIR = '/data/desktop';
    var _this = this;
    _global._dataOP.CreateWatcher(function(err_, watcher_) { 
      if(err_) {
        return console.log(err_);
      }
      _this.initDesktopWatcher(watcher_);
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
    }, this._DESKTOP_DIR); 
  },

  // The cb_ should be called at the end of this function
  //
  start: function(cb_) {
    console.log('starting');
    // Load contents to all components EXCEPT Launcher and DeciceList
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
    var _this = this;
    setTimeout(function() {
      _this.getCOMById('launcher').load();
      cb_(null);
    }, 2000);
  },

  initLayout: function() {
    
  },

  getLayoutType: function() {return this._layoutType;},

  setLayoutType: function(layoutType_) {
    if(this._layoutType != layoutType_) {
      this._layoutType = layoutType_;
      this.emit('layout', null, this._layoutType, this.getCOMById('layout'));
    }
  },

  getGrid: function() {
    /* if(this._layoutType == 'grid') { */
      // return this.getCOMById('layout');
    /* } */
    return null;
  },

  initDesktopWatcher: function(watcher_) {
    var _desktop = this;
    // TODO: change to API our own
    // this._DESKTOP_DIR = _global.$xdg_data_home + '/desktop';
    // this._desktopWatch = Watcher.create(this._DESKTOP_DIR);
    this._desktopWatch = watcher_;
    this._desktopWatch.on('add', function(filename, stats) {
      //console.log('add:', filename, stats);
      var _filenames = filename.split('.'),
          _model = null,
          _id = 'id-' + stats.ino.toString(),
          _parent = _desktop.getCOMById('layout').getCurLayout();
      
      if(_filenames[0] == '') {
        return ;//ignore hidden files
      }
      if(stats.isDirectory()) {
        _model = DirEntryModel.create(_id
              , _parent
              , _desktop._desktopWatch.getBaseDir() + '/' + filename
              , _desktop._position);
      } else {
        if(_filenames[_filenames.length - 1] == 'desktop') {
          try {
            _model = _desktop.getCOMById('launcher').get(_id);
          } catch(e) {
            var linkPath = _desktop._desktopWatch.getBaseDir() + '/' + filename;
            /* _model = AppEntryModel.create(_id */
                // , _parent
                // , linkPath
                // , _desktop._position);
            /* _desktop.getCOMById('launcher').set(_model); */
            _model = _desktop.getCOMById('launcher').createAModel({
              '0': _id,
              '1': linkPath,
              '2': -1,
              '3': _desktop._position
            }, 'app');
          } 
        } else {
          _model = FileEntryModel.create(_id
              , _parent
              , _desktop._desktopWatch.getBaseDir() + '/' + filename
              , _desktop._position);
        }
      }

      if(_model != null)
        _parent.add(_model);
    });
    this._desktopWatch.on('delete', function(filename) {
      //console.log('delete:', filename);
      var /* _path = _desktop._desktopWatch.getBaseDir() + '/' + filename, */
          _layout = _desktop.getCOMById('layout').getAllWidgets();
      for(var i = 0; i < _layout.length; ++i) {
        var _entry = _layout[i].getWidgetByAttr('_filename', filename);
        if(_entry == null) {
          console.log('Can not find this widget');
          continue;
        } else {
          _layout[i].remove(_entry);
        }
      }
      /* var _launcher = _desktop.getCOMById('launcher'), */
          // _entry = _launcher.getCOMByAttr('_filename', filename);
      /* if(_entry != null) _launcher.remove(_entry); */
    });
    this._desktopWatch.on('rename', function(oldName, newName) {
      console.log('rename:', oldName, '->', newName);
      var _layout = _desktop.getCOMById('layout').getAllWidgets();
      for(var i = 0; i < _layout.length; ++i) {
        var _entry = _layout[i].getWidgetByAttr('_filename', oldName);
        if(_entry == null) {
          console.log('Can not find this widget');
          continue;
        } else {
          _entry.rename(newName);
        }
      }
    });
  }
});

// Dock component of Desktop
//
var DockModel = Model.extend({
  init: function(parent_) {
    this.callSuper('dock', parent_);
    this._index = 0;
    this._DOCK_DIR = '/data/dock';

    var _this = this;
    _global._dataOP.CreateWatcher(function(err_, watcher_) {
      if(err_) return console.log(err_);
      _this.initWatcher(watcher_);
    }, this._DOCK_DIR);
  },

  load: function() {
    // TODO: load dock apps from configure file
    var _this = this;
    _global._fs.readFile(_global.$xdg_data_home + '/dock/.info', 'utf-8', function(err, data) {
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
        // if(attr.length != 5) continue;
        if(attr[4] == 'inside-app') {
          var model,
              launcher = _global.get('desktop').getCOMById('launcher');
          try {
            model = launcher.get(attr[0]);
          } catch(e) {
            model = launcher.createAModel(attr, 'inside-app');
          }
          _this.add(model);
        } else {
          lastSave[attr[0]] = {
            path: attr[1],
            x: attr[2],
            y: attr[3],
            type: attr[4]
          };
        }
      }
      _global.get('utilIns').entryUtil.loadEntrys(lastSave, _this._dockWatch.getBaseDir()
        , _this._dockWatch, _this);
    });
  },

  release: function() {
    this._dockWatch.close();
  },

  initWatcher: function(watcher_) {
    // this._DOCK_DIR = _global.$xdg_data_home + '/dock';
    // this._dockWatch = Watcher.create(this._DOCK_DIR);
    this._dockWatch = watcher_;
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
          /* _model = AppEntryModel.create(_id */
            // , _this 
            // , _this._dockWatch.getBaseDir() + '/' + filename
            // , _this._position);
          /* _desktop.getCOMById('launcher').set(_model); */
          _model = _desktop.getCOMById('launcher').createAModel({
            '0': _id,
            '1': _this._dockWatch.getBaseDir() + '/' + filename,
            '2': -1
          }, 'app');
        }
        _this.add(_model);
      }
    });
    this._dockWatch.on('delete', function(filename) {
      //console.log('delete:', filename);
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
  init: function(id_, parent_, position_) {
    this.callSuper(id_, parent_);
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
  init: function(id_, parent_, path_, type_, position_) {
    this.callSuper(id_, parent_, position_);
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
    if(this._parent.getType() == 'grid') {
      var gridSize = this._parent.getGridSize();
      this._col_num = parseInt(this._size.width / gridSize.gridWidth - 0.00001) + 1;
      this._row_num = parseInt(this._size.height / gridSize.gridHeight - 0.00001) + 1;
    }
    this.emit('size', null, this._size);
  },

  zoomIn: function() {
    if(this._size.width == 180) {
      alert('the plugin has been max size!!');
    } else {
      this.setSize({
        'width': this._size.width + 15,
        'height': this._size.width + 15
      });

      var _this = this,
          ctxMenu = _global.get('ctxMenu');
      if(_this._parent.getType() == 'grid')
        _this._parent.flagGridOccupy(
            _this._position.x, 
            _this._position.y, 
            _this._col_num, 
            _this._row_num, 
            true);
      if(this._size.width == 180) { 
        ctxMenu.disableItem('plugin', 'zoom in');
      } else if (this._size.width == 105) { 
        ctxMenu.activeItem('plugin', 'zoom out', function(e) {
          e.preventDefault();
          _this.zoomOut();
        });
      }; 
    }
  },

  zoomOut: function() {
    if(this._size.width == 90) {
      alert('the plugin has been min size!!');
    } else {
      var _this = this;
      if(_this._parent.getType() == 'grid')
        _this._parent.flagGridOccupy(
            _this._position.x, 
            _this._position.y, 
            _this._col_num, 
            _this._row_num, 
            false);
      this.setSize({
        'width': this._size.width * 1 - 15,
        'height': this._size.width * 1 - 15
      });

      if(_this._parent.getType() == 'grid')
        _this._parent.flagGridOccupy(
            _this._position.x, 
            _this._position.y, 
            _this._col_num, 
            _this._row_num, 
            true);
      var ctxMenu = _global.get('ctxMenu');
      if(this._size.width == 90) { 
        ctxMenu.disableItem('plugin', 'zoom out');
      } else if (this._size.width == 165) {
        ctxMenu.activeItem('plugin', 'zoom in', function(e) {
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
  init: function(id_, parent_, path_, position_) {
    if(typeof id_ === "undefined"
      || typeof path_ === "undefined") {
      throw "Not enough params!! Init failed!!";
    }
    this.callSuper(id_, parent_, position_);
    this._path = path_;
    this._filename = path_.match(/[^\/]*$/)[0];
    this._name = id_;
    this._imgPath = '';
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

  /* getTabIdx: function() {return this._tabIdx;}, */

  // setTabIdx: function(tabIdx_) {
    // this._tabIdx = tabIdx_;
    // this.emit('tabIdx', null, this._tabIdx);
  /* }, */

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

// The model for inside app
// initialize perameters:
// @id_: id of this model, make sure is unique
// @parent_: parent model of this model
// @path_: the path of app package if has(e.g. the path of data manager) or just a null string
// @iconPath_: the path of icon to show
// @startUpContext_: the context for calling startUp_, default is this
// @startUp_: the start up or show function for this inside app
// @[startUpPera_]: a perameter array for calling startUp_, could be undefined
// @[name_]: name to show on the desktop, default is same as id_
// @[idx_]: index in dock
// @[position_]: where to show on the desktop
// @[callback_]: what to do after initializing
//
var InsideAppEntryModel = EntryModel.extend({
  init: function(id_, parent_, path_, iconPath_, startUpContext_, startUp_
          , startUpPera_, name_, idx_, position_, callback_) {
    if(typeof startUp_ !== 'function') {
      throw 'Bad type of startUp_, should be a function';
    }
    if(typeof startUpPera_ !== 'undefined' && startUpPera_.constructor != Array) {
      throw 'Bad type of startUpPera_, should be undefined or Array';
    }
    this.callSuper(id_, parent_, path_, position_);
    this.setImgPath(iconPath_);
    this._startUpCtx = startUpContext_ || this;
    this._startUp = startUp_;
    this._startUpPera = startUpPera_ || [];
    this._name = name_ || id_;
    this._idx = idx_;
    this._type = 'inside-app';
    this._cb = callback_ || function() {};

    this._cb.call(this);
  },

  open: function() {
    this._startUp.apply(this._startUpCtx, this._startUpPera);
  },

  getCategory: function() {},

  getIdx: function() {return this._idx;},

  setIdx: function(idx_) {
    this._idx = idx_;
    this.emit('idx', null, this._idx);
  }
})

// The model of App Entry
// callback_: function(err)
// events provided: {'position', 'name', 'path', 'imgPath', 'cmd', 'type', 'index'}
//
var AppEntryModel = EntryModel.extend({
  init: function(id_, parent_, path_, idx_, position_, callback_) {
    this.callSuper(id_, parent_, path_, position_);
    var cb_ = callback_ || function() {};
    this._execCmd = null;
    this._type = 'app';
    this._idx = idx_;//((typeof position_ === 'undefined') ? -1 : position_.x);
    this.realInit(cb_);
  },

  realInit: function(callback_) {
    var _this = this,
        utilIns = _global.get('utilIns');
    // utilIns.entryUtil.parseDesktopFile(_this._path, function(err_, file_) {
    _global._dataOP.readDesktopConfig(function(err_, appFile_) {
      if(err_) {
        console.log(err_);
        callback_.call(this, err_);
        return ;
      }
      var file_ = appFile_['[Desktop Entry]'];
      // get launch commad
      _this.setCmd(file_['Exec'].replace(/%(f|F|u|U|d|D|n|N|i|c|k|v|m)/g, '')
        .replace(/\\\\/g, '\\'));
      // get icon
      // TODO: change to get icon path from cache
      utilIns.entryUtil.getIconPath(file_['Icon'], 48, function(err_, imgPath_) {
        if(err_) {
          console.log(err_);
          callback_.call(this, err_);
          return ;
        } else {
          _this.setImgPath(imgPath_[0]);
          callback_.call(this, null);
        }
      });
      // get name
      if(typeof file_['Name[zh_CN]'] !== "undefined") {
        _this.setName(file_['Name[zh_CN]']);
      } else {
        _this.setName(file_['Name']);
      }
      // get comment
      _this._comment = file_['Comment'];
      // get genericName
      if (typeof file_['GenericName[zh_CN]'] != 'undefined') {
        _this._genericName = file_['GenericName[zh_CN]'];
      } else {
        _this._genericName = file_['GenericName'];
      }
      // get category
      if(file_['NoDisplay'] != 'true') {
        var cgs = file_['Categories'].split(';'),
          cg = 'Other';
        for(var i = 0; i < cgs.length; ++i) {
          if(typeof _global._App_Cate[cgs[i]] !== 'undefined') {
            cg = cgs[i];
            break;
          }
        }
        _this.setCategory(cg);
        _this.setNoDisplay(false);
      } else {
        // TODO: should not show this entry
        _this.setNoDisplay(true);
      }
    }, _this._path.match('[^\/]*$')[0]);
  },

  getNoDisplay: function() {return this._noDisplay;},

  setNoDisplay: function(nodisplay_) {
    this._noDisplay = nodisplay_;
    this.emit('noDisplay', null, this._noDisplay);
  },

  getCategory: function() {return this._category;},

  setCategory: function(cg_) {
    this._category = cg_;
    this.emit('category', null, cg_);
  },

  getComment: function() {return this._comment;},

  setComment: function(comment_) {
    this._comment = comment_;
    this.emit('comment', null, this._comment);
  },

  getGenericName: function() {return this._genericName;},

  setGenericName: function(genericName_) {
    this._genericName = genericName_;
    this.emit('genericName', null, this._genericName);
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

  copyTo: function(clip_, entryIds_) {
    if(clip_.files.length != 0) {
      var fList = '';
      for(var i = 0; i < clip_.files.length; ++i) {
        fList += ' ' + clip_.files[i].path;
      }
      this.open(fList);
      return ;
    }

    var paths = '';
    if(entryIds_.length == 0)
      entryIds_.push(clip_.getData('ID'));
    for(var i = 0; i < entryIds_.length; ++i) {
      var desktop = _global.get('desktop'),
          item = desktop.getCOMById('layout').getCurLayout().getWidgetById(entryIds_[i]),
          type = item.getType();
      if(type != 'app' && type.match(/\w*Plugin/) == null)
        paths += item.getPath() + ' ';
    }
    this.open(paths);
  },

  open: function(pera_) {
    var p_ = pera_ || '';
    // TODO: replace by API ourselves
    // _global._exec(this._execCmd + p_, function(err, stdout, stderr) {
    _global._dataOP.shellExec(function(err, stdout, stderr) {
      if(err !== null) {
        console.log(err);
      }
    }, this._execCmd + p_);
  },

  rename: function(name_) {
    if(name_ != this._name) {
      // TODO: rename a app entry
      //    send new name to Data Layer and rename this entry
      this.setName(name_);
    }
  },

  linkToDesktop: function() {
    _global._dataOP.linkAppToDesktop(function() {}, this._filename, 'desktop');
  },

  unlinkFromDesktop: function() {
    _global._dataOP.unlinkApp(function() {}, '/desktop/' + this._filename);
  },

  linkToDock:function() {
    _global._dataOP.linkAppToDesktop(function() {}, this._filename, 'dock');
  },

  unlinkFromDock: function() {
    _global._dataOP.linkAppToDesktop(function() {}, '/desktop/' + this._filename);
  }
});

var FileEntryModel = EntryModel.extend({
  init: function(id_, parent_, path_, position_, callback_) {
    this.callSuper(id_, parent_, path_, position_);
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
              if(err_) {
                console.log(err_);
                return ;
              }
              // TODO: try to get icon from cache first
              // utilIns.entryUtil.parseDesktopFile(appFile_, function(err_, file_) {
              _global._dataOP.readDesktopConfig(function(err_, appFile_) {
                if(err_) {
                  console.log(err_);
                  return ;
                }
                var file_ = appFile_['[Desktop Entry]'];
                utilIns.entryUtil.getIconPath(file_['Icon'], 48
                  , function(err_, imgPath_) {
                    if(err_) {
                      console.log(err_);
                      cb_(err_);
                      return ;
                    } else {
                      _this.setImgPath(imgPath_[0]);
                      cb_(null);
                    }
                });
              }, appFile_.match('[^\/]*$')[0]);
            });
          } else {
            _this.setImgPath(imgPath_[0]);
            cb_(null);
          }
        });
    });
  },

  rename: function(name_) {
    if(name_ != this._name) {
      var _match = /(.*[\/])([^\/].*)$/.exec(this._path),
          oldPath = this._path,
          _this = this;
      this.setPath(_match[1] + name_);
      _match = /(.*)[\.]([^\.].*)$/.exec(name_);
      this._filename = name_;
      _global._fs.rename(oldPath, this._path, function(err) {
        if(err) console.log(err);
        if(_match != null && _match[2] != _this._type) {
          _this._type = _match[2];
          // reparse the file type
          _this.realInit();
        }
        _this.setName(name_);
      });
    }
  },

  open: function() {
    // TODO: replace by API ourselves
    // _global._exec('xdg-open ' + this._path.replace(/ /g, '\\ ')
    _global._dataOP.shellExec(function(err, stdout, stderr) {
      if(err) console.log(err);
    }, 'xdg-open ' + this._path.replace(/ /g, '\\ '));
  }
});

var DirEntryModel = FileEntryModel.extend({
  init: function(id_, parent_, path_, position_, callback_) {
    this.callSuper(id_, parent_, path_, position_);
    this._type = 'dir';
  },

  // TODO: copy file to this dir
  copyTo: function() {},

  // TODO: move file to this dir
  moveTo: function(clip_, entryIds_) {
    // handle file move
    if(clip_.files.length != 0) {
      for(var i = 0; i < clip_.files.length; ++i) {
        if(clip_.files[i].path == this._path) continue;
        var filename = clip_.files[i].path.match(/[^\/]*$/)[0];
        // TODO: replace this API
        _global._fs.rename(clip_.files[i].path, this._path + '/' + filename, function(err) {
          if(err) {
            console.log(err);
          }
        });
      }
      return ;
    }
    // handle entry move
    if(entryIds_.length == 0)
      entryIds_.push(clip_.getData('ID'));
    for(var i = 0; i < entryIds_.length; ++i) {
      var desktop = _global.get('desktop'),
          item = desktop.getCOMById('layout').getCurLayout().getWidgetById(entryIds_[i]),
          type = item.getType(),
          srcP = null;
      if(entryIds_[i] == this._id/*  || typeof item === 'undefined' */) return ;
      if(item.getType() == 'app') {
        srcP = desktop._desktopWatch.getBaseDir() + '/' + item.getFilename();
      } else {
        srcP = item.getPath();
      }
      // TODO: replace this API
      _global._fs.rename(srcP, this._path + '/' + item.getFilename(), function(err) {
        if(err) {
          console.log(err);
        }
      });
    }
  },

  rename: function(name_) {
    if(name_ != this._name) {
      this.setName(name_);
      var _match = /(.*[\/])([^\/].*)$/.exec(this._path),
          oldPath = this._path;
      this.setPath(_match[1] + this._name);
      this._filename = name_;
      _global._fs.rename(oldPath, this._path, function(err) {
        if(err) console.log(err);
      });
    }
  }
});

var ThemeEntryModel = EntryModel.extend({
  init: function(id_, parent_, path_, iconName_, name_, position_, callback_) {
    this.callSuper(id_, parent_, path_, position_, callback_);
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
        return ;
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
    // _global._exec('xdg-open ' + this._path, function(err, stdout, stderr) {
    _global._dataOP.shellExec(function(err, stdout, stderr) {
      if(err) {
        console.log(err);
      }
    }, 'xdg-open ' + this._path);
  }
});

// The model class of Launcher
// Use lazy stratagy
//
var LauncherModel = Model.extend({
  init: function(parent_) {
    this.callSuper('launcher', parent_);
    // this._appCache = Cache.create(); // caches app models
  },

  load: function() {
    var _this = this;
    _global._dataOP.getAllDesktopFile(function(err_, files_) {
      if(err_) return console.log(err_);
      for(var key in files_) {
        var id = 'id-' + files_[key];
        try {
          _this.get(id);
        } catch(e) {
          _this.createAModel({
            '0': id,
            '1': key
          }, 'app');
        }
      }
    });
  },

  get: function(id_) {
    // var ret = this._appCache.get(id_);
    var ret = this.getCOMById(id_);
    if(typeof ret === 'undefined') {
      // catch this exception and get app model from FS
      throw 'Not in cache!';
    }
    return ret;
  },

  set: function(app_) {
    /* this._appCache.set(app_.getID(), app_); */
    /* this.emit('new', null, app_); */
    this.add(app_);
  },

  release: function() {
    // TODO: release all child conponts
  },

  show: function() {
    this.emit('show', null);
  },

  createAModel: function(attr_, type_) {
    var model = null;
    if(type_ == 'app') {
      // attr_:
      // 0 -> id
      // 1 -> path
      // 2 -> index in dock(if have)
      // 3 -> position in desktop(if have)
      model = AppEntryModel.create(attr_[0], this, attr_[1], attr_[2], attr_[3], attr_[4]);
      this.set(model);
    } else if(type_ == 'inside-app') {
      // attr_:
      // 0 -> id
      // 1 -> path of app package
      // 2 -> iconpath
      // 3 -> name of app
      // 4 -> type
      // 5 -> index in dock(if have)
      // 6 -> position in desktop(if have)
      switch(attr_[0]) {
        case 'launcher-app':
          // var launcher = _global.get('desktop').getCOMById('launcher');
          model = InsideAppEntryModel.create(attr_[0], this, attr_[1], attr_[2],
              this, this.show, [], attr_[3], attr_[5], attr_[6]);
          break;
        case 'login-app': 
          var login = LoginModel.create();
          this.emit('add-login-app', null, login);
          var _this = this;
          login.on('login-state', function(err_, state_) {
            if(err_) {
              console.log(err_);
              return ;
            }
            var loginM = _this.getCOMById('login-app');
            if(state_) {
              loginM.setImgPath('img/Logout-icon.png');
              loginM.setName('Logout');
            } else {
              loginM.setImgPath('img/Login-icon.png');
              loginM.setName('Login');
            }
          });
          model = InsideAppEntryModel.create(attr_[0], this, attr_[1], attr_[2],
              login, login.login, [], attr_[3], attr_[5], attr_[6]);
          break; 
        default:
          // new a InsideAppEntryModel for data manager or other inside app which launched by
          //   using window with a iframe.
          model = InsideAppEntryModel.create(attr_[0], this, attr_[1], attr_[2],
              this, this.startUp, [attr_[0]], attr_[3], attr_[5], attr_[6]);
          break;
      }
      this.set(model);
    } else {
      console.log('unknown type');
    }
    return model;
  },

  startUp: function(id_) {
    this.emit('start-up', null, this.getCOMById(id_));
  }
});

var DeviceListModel = Model.extend({
  init: function(parent_) {
    this.callSuper('device-list', parent_);
    this._imChatWinList = {}; 
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
        var device = DeviceEntryModel.create(id_, _this, dev_.host, dev_);
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
    });
    // TODO: for IM, emit 'message' event when recive a message
    _global._imV.startIMChatServer(function(msgobj) {
      var toAccount = msgobj.MsgObj.from;
      var curEditBox = _this._imChatWinList['imChatWin_'+toAccount];
      if(curEditBox===undefined){
        Messenger().post({
          message: toAccount + '给你发新消息啦！',
          type: 'info',
          actions: {
            close: {
              label: '取消闪烁',
              action: function() {
                Messenger().hideAll()
              }
            },
            open: {
              label: '查看',
              action: function() {
                Messenger().hideAll();
                var toAccountInfo = {};
                toAccountInfo['toAccount'] = toAccount;
                toAccountInfo['toIP'] = msgobj.IP;
                toAccountInfo['toUID'] = msgobj.MsgObj.uuid;
                toAccountInfo['msg'] = msgobj.MsgObj.message;
                curEditBox = EditBox.create(toAccountInfo,_this._imChatWinList);
                _this._imChatWinList['imChatWin_'+toAccount] = curEditBox;
              }
            }
          }
        });
      } else {
        curEditBox.showRec(toAccount,msgobj.MsgObj.message);
      }
    });
  }
});

var DeviceEntryModel = EntryModel.extend({
  // @id_ is address:port
  // @path_ is name
  // @position_ is whole info object
  init: function(id_, parent_, path_, position_, callback_) {
    this.callSuper(id_, parent_, path_, position_);
    this._name = path_;
    this._offline = false;
    this._type = 'dev';
    this._imgPath = 'img/pc.svg';
    this.realInit(callback_);
  },

  realInit: function(cb_) {
    var cb = cb_ || function() {};
    // TODO: get icon from cache or fs, and call cb at last
    cb(null);
  },

  // TODO: show something about this device
  open: function() {
    var toAccount = this._position['txt'][5];
    var toAccountInfo = {};
    toAccountInfo['toAccount'] = this._position['txt'][5];;
    toAccountInfo['toIP'] = this._position['txt'][4];
    toAccountInfo['toUID'] = this._position['txt'][1];
    var curEditBox = EditBox.create( toAccountInfo,this._parent._imChatWinList);
    this._parent._imChatWinList['imChatWin_'+toAccount] = curEditBox;
  },

  // send a file to remote device
  copyTo: function(dataTransfer, entryIds_) {
    if(dataTransfer.files.length != 0) {
      for(var i = 0; i < dataTransfer.files.length; ++i) {
        Messenger().post(dataTransfer.files[i].path);
        // TODO: use api from lower layer
      }
      return ;
    }
   
    if(entryIds_.length == 0) 
      entryIds_.push(dataTransfer.getData('ID'));
    for(var i = 0; i < entryIds_.length; ++i) {
      var desktop = _global.get('desktop'),
          item = desktop.getCOMById('layout').getCurLayout().getWidgetById(entryIds_[i]);
      Messenger().post(item.getPath());
      // TODO: use api from lower layer
    }
  }
});

// The model class of Layout
//
var LayoutModel = WidgetModel.extend({
  init: function(id_, parent_, Manager_, type_) {
    this.callSuper(id_, parent_);

    this._wm = Manager_.create(this);
    this._type = type_;
    // TODO: move to view
    this._width = 0;//$(document).width();
    this._height = 0;//$(document).height() * 0.9;
  },

  release: function() {},

  getType: function() {return this._type;},

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

  getAllWidgets: function() {
    return this._wm.getAllCOMs();
  },

  on: function() {
    return this._wm.on.apply(this._wm, arguments);
  },

  off: function() {
    return this._wm.off.apply(this._wm, arguments);
  },

  emit: function() {
    return this._wm.emit.apply(this._wm, arguments);
  },

  // load widgets from saved data
  load: function() {
    this._wm.load();
  },

  // load widgets from an array in which widgets have been created.
  // @widgetArr_: [{id1: widget1}, {id2: widget2}, ...]
  loadEntities: function(widgetArr_) {
    for(var key in widgetArr_) {
      this.add(widgetArr_[key]);
    }
  },

  save: function() {
    this._wm.save();
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
    this.emit('layout_size', null, {
      'width': this._width,
      'height': this._height
    });
  },

  // TODO: implement a funtion for PlaneView to judge whether two entries are overlap.
  //        should be implemented in View
  isOverlap: function(entry1_, entry2_) {}
});

// The manager of Widgets
//
var WidgetManager = Model.extend({
  init: function(parent_) {
    this.callSuper('widgetmanager', parent_);
  },

  load: function() {
    // load theme entry
    _global.get('theme').loadThemeEntry(this);
   
    // load inside app entry, just a temporary solution.
    // should load all user config data on desktop._USER_CONFIG
    // and get data by key-value style.
    var _this = this;
    _global._fs.readFile(_global.$xdg_data_home + "/inside-app.conf"
      , 'utf-8', function(err, data) {
        if(err) {
          console.log(err);
        } else {
          var model,
              launcher = _global.get('desktop').getCOMById('launcher'),
              apps = data.split('\n');
          for(var i = 0; i < apps.length; ++i) {
            if(apps[i].match('[\s,\t]*#+') != null || apps[i] == "") continue;
            var pera = apps[i].split('$');
            try {
              model = launcher.get(pera[0]);
            } catch(e) {
              model = launcher.createAModel(pera, 'inside-app');
            }
            _this.add(model);
            // change the way to create a inside app model
            /* switch(pera[0]) { */
              // case 'launcher-app':
                // var launcher = _global.get('desktop').getCOMById('launcher');
                // _this.add(InsideAppEntryModel.create(pera[0], _this._parent, pera[1], pera[2],
                    // launcher, launcher.show, [], pera[3], pera[4]));
                // break;
              // case 'datamgr-app':
                // // TODO: new a InsideAppEntryModel for data manager
                // break;
              // default:
                // break;
            /* } */
          }
        }
      });
    
    // load desktop entry
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
          _plugin = DPluginModel.create(attr[0], this._parent, attr[1], attr[4]
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
        , desktop._desktopWatch, this._parent);   
  },

  save: function() {
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

var GridModel = LayoutModel.extend({
  init: function(id_, parent_, Manager_) {
    this.callSuper(id_, parent_, Manager_, 'grid');

    // TODO: get initialize data from saved data
    this._col = 80 + 20;
    this._row = 80 + 20;

    // remain
    this._col_num = 0; //Math.floor(this._width / this._col);
    this._row_num = 0; //Math.floor(this._height / this._row);
    this._grid = [];
  },

  release: function() {},

  setSize: function(size_) {
    this.callSuper(size_);
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
    this.emit('grid_size', null, {
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
      var _col_diff = cn - this._col_num,
          _row_diff = rn - this._row_num;
      this._col_num = cn;
      this._row_num = rn;
      this.emit('col_row', {
        'col_diff': _col_diff,
        'row_diff': _row_diff
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
        if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};        //left
        else if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};    // top
        else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};  //left-top
        break;
      case 4 :
        if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};        //right
        else if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};    //top
        else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1}; //right-top
        break;
      case 2:
        if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};        //left 
        else if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};    //down
        else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};  //left-down
        break;
      case 1:
        if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};        //right
        else if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};    //down
        else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1}; //right-down
        break;
      case 3:
        if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};        //down
        else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1}; //left-down
        else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1}; //right-down
        break;
      case 12:
        if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};        //top
        else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};  //left-top
        else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};  //right-top
        break;
      case 10:
        if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};        //left
        else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};  //left-top
        else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};  //left-down
        break;
      case 5:
        if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};        //right
        else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};  //right-top
        else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};  //right-down
        break;
      case 6:
        if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};    //left-top
        else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};  //right-down
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
  }
});

var LayoutManager = Model.extend({
  init: function(parent_) {
    this.callSuper('layout-manager', parent_);
  },

  load: function() {
    // TODO: check config of layout
    _global.get('desktop').setLayoutType('grid');
    var grid = GridModel.create('grid', this._parent, WidgetManager);
    this.add(grid);
    grid.load();
  },

  save: function() {},

  add: function(layout_) {
    this._c.push(layout_);
    this.emit('add', null, layout_);
  },

  remove: function(idx_) {
    this._c.splice(idx_, 1);
  }
});

var FlipperModel = LayoutModel.extend({
  init: function(id_, parent_, Manager_) {
    this.callSuper(id_, parent_, Manager_, 'flipper');
    this._cur = -1;
  },

  getCur: function() {return this._cur;},

  setCur: function(cur_) {
    if(cur_ >= this._wm._c.length || cur_ == this._cur) return ;
    if(this._cur != -1 && this._cur != cur_)
      this.emit('cur', null, this._cur, cur_);
    this._cur = cur_;
  },

  getCurLayout: function() {
    return this._wm._c[this._cur];
  },

  getIndex: function(layout_) {
    var layouts = this.getAllWidgets();
    for(var i = 0; i < layouts.length; ++i) {
      if(layouts[i] == layout_)
        return i;
    }
  }
});

var LoginModel = Model.extend({
  init: function() {
    this.callSuper('login');
    this._login = false;
  },

  login: function() {
    // call the handler to get account and password
    this.emit('login', null, !this._login);
  },

  doLogin: function(account_, password_) {
    // TODO: call API to login
    console.log(account_, password_);
    var _this = this;
    _this._to = setTimeout(function() {
      _this.setCurState(true);
    }, 3000);
  },

  cancelLogin: function() {
    // TODO: call API to cancel login
    clearTimeout(this._to);
  },

  doLogout: function() {
    // TODO: call API to logout
    this.setCurState(false);
  },

  doRegist: function(account_, password_) {
    console.log(account_, password_);
    // TODO: call API to regist
    var _this = this;
    _this._to = setTimeout(function() {
      _this.emit('regist', null, false, '重复的用户名');
    }, 3000);
  },

  getCurState: function() {return this._login;},

  setCurState: function(state_) {
    this._login = state_;
    this.emit('login-state', null, this._login);
  }
});

