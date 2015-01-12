//This file includes all common help classes.
//

//Ordered Queue Class
//constructor:
//  before -> type: function(item1, item2), ret: {true(if item1 is before item2)|false}
//
var OrderedQueue = Class.extend({
  init: function(before_) {
    if(typeof before_ != 'function') throw 'Bad type of before(should be a function)';
    this._items = [];
    this._before = before_;
  },

  length: function() {
    return this._items.length;
  },
  
  push: function(item_) {
    //check last key to find the idle item
    //no need to aquire memory
    var _idx = this._items.length - 1;
    if(_idx < 0 || this._items[_idx] != null) {
      this._items.push(item_);
    } else {
      this._items[_idx] = item_;
    }
    this.order();
  },

  pop: function() {
    var _item = this.get(0);
    this.remove(0);
    return _item;
  },
  
  get: function(idx_) {
    return this._items[idx_];
  },

  remove: function(idx_) {
    if(idx_ >= this._items.length) return ;
    this._items[idx_] = null;
    this.order();
  },
  
  before: function(item1_, item2_) {
    if(item1_ == null) return false;
    if(item2_ == null) return true;
    return this._before(item1_, item2_);
  },

  order: function() {
    var _this = this;
    var start = function(l_) {return (Math.floor(l_ / 2) - 1);};
    var lParent = function(idx_) {return (idx_ * 2 + 1);};
    var rParent = function(idx_) {return (idx_ * 2 + 2);};
    var swap = function(idx1_, idx2_) {
      var tmp = _this._items[idx1_];
      _this._items[idx1_] = _this._items[idx2_];
      _this._items[idx2_] = tmp;
    };
    var heap = function(s_, l_) {
      var lp, rp;
      for(var i = start(l_); i >= s_; --i) {
        lp = lParent(i);
        rp = rParent(i);
        if(rp < l_ && !_this.before(_this._items[rp], _this._items[lp]))
          swap(lp, rp);
        rp = i;
        while(lp < l_ && !_this.before(_this._items[lp], _this._items[rp])) {
          swap(lp, rp);
          rp = lp;
          lp = lParent(lp);
        }
      }
    };

    for(var x = _this._items.length; x > 0; --x) {
      heap(0, x);
      swap(0, x - 1);
    }
  }

});

//TODO: change to nodejs independent
//watch  dir :Default is desktop
//dir_: dir is watched 
// ignoreInitial_:
var Watcher = Event.extend({
  init: function(dir_, ignore_) {
    this.callSuper();
    this._watchDir = dir_ || _global.$xdg_data_home;
    this._prev = 0;
    this._oldName = null;
    this._watcher = null;
    this._evQueue = [];
    this._timer = null;
    this._ignore = ignore_ || /^\./;

    var _this = this;
    _global._fs.readdir(_this._watchDir, function(err, files) {
      for(var i = 0; i < files.length; ++i) {
        _this._prev++;
      }

      var evHandler = function() {
        var filename = _this._evQueue.shift();
        _global._fs.readdir(_this._watchDir, function(err, files) {
          var cur = 0;
          for(var i = 0; i < files.length; ++i) {
            cur++;
          }

          if(_this._prev < cur) {
            _global._fs.stat(_this._watchDir + '/' + filename
              , function(err, stats) {
                if(!err)
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
            if(_this._oldName == filename) {
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
          evHandler();
        }
      }, 200);

      _this._watcher = _global._fs.watch(_this._watchDir
        , function(event, filename) {
          if(event == 'change' || filename.match(_this._ignore) != null) return ;
          _this._evQueue.push(filename);
        });
    });
  },

  //get dir 
  getBaseDir: function() {
    return this._watchDir;
  },

  //close watch()
  close: function() {
    if(this._watcher) {
      this._watcher.close();
      this._watcher = null;
    }
    clearInterval(this._timer);
  }
});

// This class is used for serialize tasks running
//
var Serialize = Class.extend({
  init: function() {},

  // fnArr_: [
  //  {
  //    fn: function(pera_, callback_) (type: Funciton, callback_ -> function(err_, ret_))
  //    pera: {} (type: Object)
  //  },
  //  ...
  // ],
  // callback_: function(err_, rets_) (rets_ -> [ret1, ret2, ...])
  //
  // example:
  //  Serialize.series([
  //    {
  //      fn: function(pera_, callback_) {
  //        // do something
  //        callback_(null, ret); // should be the last sentence
  //      },
  //      pera: {}
  //    },
  //    {
  //      fn: function(pera_, callback_) {
  //        // do something
  //        callback_(null, ret); // should be the last sentence
  //      }
  //    },
  //    ...
  //  ], function(err_, rets_) {
  //    //rets_[i] = fnArr_[i]'s ret
  //  });
  //
  series: function(fnArr_, callback_) {
    if(!Array.isArray(fnArr_)) {
      console.log('bad type for series, should be an array');
      return ;
    }
    var cb = callback_ || function() {};
    var complete = 0, rets = [];
    var doSeries = function(iterator_) {
      var iterate = function() {
        iterator_(fnArr_[complete], function(err_) {
          if(err_) {
            callback_(err_);
          } else {
            complete += 1;
            if(complete >= fnArr_.length) {
              cb(null, rets);
            } else {
              iterate();
            }
          }
        });
      };
      iterate();
    };
    doSeries(function(fn_, callback_) {
      fn_.fn(fn_.pera, function(err_, ret_) {
        rets[complete] = ret_;
        callback_(err_, ret_);
      });
    });
  },

  // peraArr_: [
  //  {
  //    arg1: value,
  //    arg2: value,
  //    ...
  //  },
  //  ...
  // ],
  // fn_: function(pera_, callback_) (type: Funciton, callback_ -> function(err_, ret_))
  // callback_: function(err_, rets_) (rets_ -> [ret1, ret2, ...])
  //
  // example:
  //  Serialize.series1([
  //    {
  //      arg1: value,
  //      arg2: value,
  //      ...
  //    },
  //    ...
  //  ], function(pera_, callback_) {
  //    // do something
  //    callback_(null, ret); // should be the last sentence
  //  }, function(err_, rets_) {
  //    //rets_[i] = fnArr_[i]'s ret
  //  });
  //
  series1: function(peraArr_, fn_, callback_) {
    var fnArr = [];
    for(var i = 0; i < peraArr_.length; ++i) {
      fnArr[i] = {
        'fn': fn_,
        'pera': peraArr_[i]
      };
    }
    this.series(fnArr, callback_);
  },

  parallel: function(fnArr_, callback_) {
    if(!Array.isArray(fnArr_)) {
      console.log('bad type for series, should be an array');
      return ;
    }
    var cb_ = callback_ || function() {},
        toComplete = fnArr_.length,
        rets = [];
    var doParallel = function(parallellor_) {
      for(var i = 0; i < fnArr_.length; ++i) {
        parallellor_(fnArr_[i], i, function(err_) {
          if(err_) {
            callback_(err_);
          } else {
            toComplete--;
            if(toComplete == 0) {
              cb_(null, rets);
            }
          }
        });
      }
    };
    doParallel(function(fn_, num_, callback_) {
      fn_.fn(fn_.pera, function(err_, ret_) {
        rets[num_] = ret_;
        callback_(err_, ret_);
      });
    });
  },

  parallel1: function(peraArr_, fn_, callback_) {
    var fnArr = [];
    for(var i = 0; i < peraArr_.length; ++i) {
      fnArr[i] = {
        'fn': fn_,
        'pera': peraArr_[i]
      };
    }
    this.parallel(fnArr, callback_);
  },
});

// This class includes all global objects used in this project
//
var Global = Class.extend({
  // g_objects: [
  //  {
  //    name: obj_name(String),
  //    class: class_name(Object),
  //    args: init_args(Array),
  //    serialize: (Bool) // should be inited serialized?
  //  },
  //  {...}
  // ]
  init: function(callback_) {
    this.Series = Serialize.prototype;
    this.$home = undefined;
    this.$xdg_data_dirs = undefined;
    this.$xdg_data_home = undefined;
    this._App_Cate = {
      'AudioVideo': 'AudioVideo',
      'Audio': 'AudioVideo',
      'Video': 'AudioVideo',
      'Development': 'Development',
      'Education': 'Education',
      'Game': 'Game',
      'Graphics': 'Graphics',
      'Network': 'Network',
      'Office': 'Office',
      'Science': 'Science',
      'Settings': 'Settings',
      'System': 'System',
      'Utility': 'Utility',
      'Other': 'Other'
    };
    // manage opened inside-app windows
    this._openingWindows = WindowManager.create();
    this._login = LoginModel.create();
    this.objects = [];
    
    var _this = this;
    this.Series.series([
      {
        fn: function(pera_, cb_) {
          // change the nodejs'API to ourselves
          /* _this._fs = require('fs'); */
          /* _this._exec = require('child_process').exec; */
          WDC.requireAPI(['device_service', 'IM', 'data', 'app', 'lang'/* , 'account' */]
            , function(dev, imV, data, app, lang/* , acc */) {
              _this._device = dev;
              _this._imV = imV;
              _this._dataOP = data;
              _this._app = app;
              _this._lang = lang;
              // _this._account = acc;

              _this.Series.parallel([
                {
                  fn: function(pera_, cb__) {
                    data.initDesktop(cb__);
                  }
                },
                {
                  fn: function(pera_, cb__) {
                    app.getBasePath(function(err_, basePath_) {
                      _this._appBase = basePath_;
                      cb__(null);
                    });
                  }
                },
                {
                  fn: function(pera_, cb__) {
                    lang.getInitInfo(function(err_, info_) {
                      _this._locale = {
                        locale: info_[0],
                        langList: info_[1],
                        langObj: info_[2]
                      }
                      cb__(null);
                    }, 'desktop');
                  }
                }
              ], function(err_, rets_) {
                if(err_) return console.log(err_);
                cb_(null);
              });
            });
        }
      },
      {
        fn: function(pera_, cb_) {
          // _this._exec('echo $HOME', function(err, stdout, stderr) {
          _this._dataOP.shellExec(function(err, stdout, stderr) {
            if(err) {
              console.log(err);
              callback_(err);
            } else {
              var tmp = stdout.substr(0, stdout.length - 1).split(' ');
              _this.$home = tmp[0];
              _this.$xdg_current_desktop = tmp[1]; 
              _this.$xdg_data_home = _this.$home + '/.resources/desktop/data';
              // _this._exec('echo $XDG_DATA_DIRS', function(err, stdout, stderr) {
              _this._dataOP.shellExec(function(err, stdout, stderr) {
                if(err) {
                  console.log(err);
                  callback_(err);
                } else {
                  _this.$xdg_data_dirs = stdout.substr(0, stdout.length - 1).split(':');
                  for(var i = 0; i < _this.$xdg_data_dirs.length; ++i) {
                    _this.$xdg_data_dirs[i] 
                      = _this.$xdg_data_dirs[i].replace(/[\/]$/, '');
                  }
                  cb_(null);
                }
              }, 'echo $XDG_DATA_DIRS');
            }
          }, 'echo $HOME $XDG_CURRENT_DESKTOP');
        }
      }
    ], function(err_, rets_) {
      if(err_)
        callback_(err_);
      else
        callback_(null);
    });
    
  },

  addGObjects: function() {
    var tasks = [];
    var cb = arguments[arguments.length - 1];
    for(var i = 0; i < arguments.length; ++i) {
      var isSerialize = arguments[i].serialize || false;
      var args = arguments[i].args || [];
      if(isSerialize) {
        tasks.push({
          'name': arguments[i].name,
          'class': arguments[i].class,
          'args': args
        });
      } else {
        this.objects[arguments[i].name] = arguments[i].class.create.apply(arguments[i].class, args);
      }
    }
    var _this = this;
    this.Series.series1(tasks, function(pera_, callback_) {
      pera_.args.push(function(err_) {
        callback_(err_);
      });
      _this.objects[pera_.name] = pera_.class.create.apply(pera_.class, pera_.args);
    });
  },

  removeAGObject: function(objName_) {
    delete this.objects[objName_];
  },

  get: function(objName_) {
    return this.objects[objName_];
  }
});

// Could be seen as a util-box
//
var Util = Class.extend({
  init: function(callback_) {
    this.entryUtil = EntryUtil.create(callback_);
  }
});

// TODO: replace nodejs' apis to ourselvs.
//
var EntryUtil = Event.extend({
  init: function(callback_) {
    var cb = callback_ || function() {};
    this._iconSearchPath = [];
    this._iconSearchPath.push(_global.$home + "/.local/share/icons/");
    for(var i = 0; i < _global.$xdg_data_dirs.length; ++i) {
      this._iconSearchPath.push(_global.$xdg_data_dirs[i] + "/icons/");
    }
    this._iconSearchPath.push("/usr/share/pixmaps");
    
    cb.call(this, null);
  },

  //load entries by argv
  // lastSave_: saved config argv, from <dentries> file
  // dir_: full dir for watch ,such as: /home/user/桌面
  // watch_: watch_ is _desktopWatch or _dockWatch
  // container_: entrys to be loaded belongs to
  //
  loadEntrys: function(lastSave_, dir_, watch_, container_) {
    var _this = this,
        desktop = _global.get('desktop'),
        _newEntry = [];
    _global._fs.readdir(dir_, function(err, files) {
      if(err || files.length == 0) return ;
      _global.Series.series1(files, function(file_, cb_) {
        _global._fs.stat(dir_ + '/' + file_, function(err, stats) {
          if(!err) {
            var _id = 'id-' + stats.ino.toString();
            if(typeof lastSave_[_id] != 'undefined'
              && lastSave_[_id].path.match(/[^\/]*$/) == file_) {
              // var _EntryView = null;
              var _DockAppView = false;
              var _model = null;
              switch(lastSave_[_id].type) {
                /* case "dockApp": */
                  /* _DockAppView = true; */
                  // _DockApp = DockApp;
                case "app":
                  try {
                    _model = desktop.getCOMById('launcher').get(_id);
                  } catch(e) {
                    _model = AppEntryModel.create(_id
                      , container_
                      , lastSave_[_id].path
                      , lastSave_[_id].idx
                      , {x: lastSave_[_id].x, y: lastSave_[_id].y});
                    desktop.getCOMById('launcher').set(_model);
                  }
                  break;
                case "inside-app":
                  // _Entry = DirEntry;
                  break;
                default:
                  // _Entry = FileEntry;
              }
              if(_model != null)
                container_.add(_model);
            } else {
              _newEntry[_id] = {
                'filename': file_,
                'stats': stats
              };
            }
          }
          cb_(null);
        });
      }, function(err_, rets_) {
        if(err_) {
          console.log(err_);
        } else {
          for(var key in _newEntry) {
            watch_.emit('add'
              , _newEntry[key].filename
              , _newEntry[key].stats);
          }
        }
      });
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
    var iconTheme = _global.get('theme').getIconTheme();
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
      _global._fs.exists(_path, function(exists_) {
        if(exists_) {
          var tmp = 'find ' + _path
            + ' -regextype \"posix-egrep\" -regex \".*'
             + ((index_ < _this._iconSearchPath.length - 1)
            ? size_ : '') + '.*/' +iconName_ + '\.(svg|png|xpm)$\"';
          _global._dataOP.shellExec(function(err, stdout, stderr) {
            if(stdout == '') {
              _global._fs.readFile(_path + '/index.theme'
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
          }, tmp);
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
    _global._fs.writeFile(path_, _data, function(err) {
      if(err) throw err;
      _cb.call(this);
    });
  },

  getMimeType: function(path_, callback_) {
    if(typeof callback_ !== 'function')
      throw 'Bad type of callback!!';
    var _this = this;
    // _global._exec('xdg-mime query filetype ' + path_.replace(/ /g, '\\ ')
    _global._dataOP.shellExec(function(err, stdout, stderr) {
      if(err) {
        console.log(err);
        callback_.call(this, 'Unknown mime-type!');
      } else {
        callback_.call(this, null, stdout.replace('\n', ''));
      }
    }, 'xdg-mime query filetype ' + path_.replace(/ /g, '\\ '));
  },

  getDefaultApp: function(mimeType_, callback_) {
    if(typeof callback_ !== 'function')
      throw 'Bad type for callback!!';
    var _this = this;
    // _global._exec('xdg-mime query default ' + mimeType_
    _global._dataOP.shellExec(function(err, stdout, stderr) {
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
    }, 'xdg-mime query default ' + mimeType_);
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
      // _global._exec('find ' + _this.$xdg_data_dirs[index_] + ' -name ' + fileName_
      _global._dataOP.shellExec(function(err, stdout, stderr) {
        if(stdout == '') {//err || 
          tryInThisPath(index_ + 1);
        } else {
          _this.emit('findDFile', null, stdout.replace('\n', ''));
          callback_.call(this, null, stdout.replace('\n', ''));
        }
      }, 'find ' + _this.$xdg_data_dirs[index_] + ' -name ' + fileName_);
    };
    tryInThisPath(0);
  },

  //get property information of filename_
  //filename_: full file path;
  //callback_: callback function;
  getProperty: function(filename_, callback_){
    var _this = this;
    if(typeof callback_ !== 'function')
      throw 'Bad type for callback';
    // _global._exec('stat ' + filename_, function(err, stdout, stderr){
    _global._dataOP.shellExec(function(err, stdout, stderr){
        if(stdout == '') {//err 
          throw 'Bad filename_';
        } else {
          var attr = [],
              attrs = stdout.split('\n');

          attr['size'] = /\d+/.exec(attrs[1])[0];
          // get uid/gid
          // var attr_ = /([-,a-z]+)\D*([0-9]+)\D*([0-9]+)/.exec(attrs[3]);
          // get name corrisponding to the uid/gid
          var attr_ = /([-,a-z]+).*\/\s*([^\/,\)]+).*\/\s*([^\/,\)]+)/.exec(attrs[3]);
          attr['access'] = attr_[1];
          attr['uid'] = attr_[2];
          attr['gid'] = attr_[3];
          attr['access_time'] = /(\D*)([^\.]+)/.exec(attrs[4])[2];
          attr['modify_time'] = /(\D*)([^\.]+)/.exec(attrs[5])[2];

          callback_.call(this, null ,attr);
        }
    }, 'stat ' + filename_);
  },

  // copy file ;
  // from : fromPath_,
  // to : outPath_.
  copyFile:function(fromPath_, outPath_){
    // var _fs = require('fs');
    _global._fs.readFile(fromPath_, function(err, data){
      _global._fs.writeFile(outPath_, data, function(err){
        if (err) {
          console.log(err);
        }
      });
    });
  },
  //rm file 
  //path_: file Path_
  removeFile:function(path_){
    // _global._exec(function(err, out ,stderr) {
    _global._dataOP.shellExec(function(err, out ,stderr) {
      if(err) throw 'util.js-rmFile: bad path';
    }, 'rm '+path_);
  },
  /**
   * [getRelevantAppName : get relevant app's name ]
   * @param  {string} mimeTypes_: xdg type
   * @param  {function} callback_(err, name);
   * @return {callbask_}
   */
  getRelevantAppName: function(mimeTypes_, callback_) {
    var _path = '/usr/share/applications/';
    this.parseDesktopFile(_path + 'mimeinfo.cache', function(err_, file_) {
      if(err_) { 
        console.log(err_);
        return ;
      }
      var _relevantAppNames = [];
      for(var i = 0; i < mimeTypes_.length; i++) {
        if(typeof file_[mimeTypes_[i]] !== 'undefined') {
          var _appNames = file_[mimeTypes_[i]].split(';');
          $.merge(_relevantAppNames, _appNames);
        }
      };
      $.unique(_relevantAppNames);
      if(_relevantAppNames.length == 0) 
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
    // this._exec('file '+ path_ + " | grep -E 'text|empty'", function(err_, out_ ,stderr_) {
    _global._dataOP.shellExec(function(err_, out_ ,stderr_) {
      if (out_ !== '' ) {
        return callback_.call(this, null , true);
      }else {
        return callback_.call(this,null, false);
      }
    }, 'file '+ path_ + " | grep -E 'text|empty'");
  },
/**
 * [getItemFromApp : read .desktop then  get name and exec to build Item]
 * @param  {string} filename_
 * @param  {function} callback_(err, Item);
 * @return {callback_}
 */
	getItemFromApp: function(filename_, callback_) {
    var launcher = _global.get('desktop').getCOMById('launcher'),
        model = launcher.getCOMByAttr('_filename', filename_);
    if(model) {
      return {
        text: model.getName(),
        action: function(e) {
          e.preventDefault();
          _global._dataOP.shellExec(function(err) {
            console.log(err);
          }, model.getCmd());
        }
      };
    } else {
      return null;
    }
		/* this.parseDesktopFile(path_, function(err_, file_){ */
			// if(err_) throw err_;
			// //get launch commad
			// var _execCmd = undefined,
          // layout = _global.get('desktop').getCOMById('layout'),
          // ctxMenu = _global.get('ctxMenu');
			// if (typeof layout.getWidgetById(ctxMenu._rightObjId) !== 'undefined') {
				// _execCmd = file_['Exec']
					// .replace(/%(f|F|u|U|d|D|n|N|i|c|k|v|m)/g
						// , '\''+layout.getWidgetById(ctxMenu._rightObjId).getPath()+'\'')
					// .replace(/\\\\/g, '\\');
			// }else{
				// _execCmd = file_['Exec']
					// .replace(/%(f|F|u|U|d|D|n|N|i|c|k|v|m)/g, '')
					// .replace(/\\\\/g, '\\');
			// }
			// var _name = undefined; 
			// if(typeof file_['Name[zh_CN]'] !== "undefined") {
				// _name = file_['Name[zh_CN]'];
			// } else {
				// _name = file_['Name'];
			// }
			// if (typeof _name == 'undefined' || typeof _execCmd == 'undefined') {
				// return callback_.call(this, 'Unknown name or cmd!');
			// };
						
			// var _item = {
        // text: _name,
        // action: function(e) {
          // e.preventDefault();
          // // _global._exec(_execCmd ,function(err){
          // _global._dataOP.shellExec(function(err) {
            // console.log(err);
          // }, _execCmd);
				// }
      // };
			// return callback_.call(this, null, _item);
		/* }); */
	}
});

// The base class for all command classes
//
var Command = Class.extend({
  doIt: function() {},
  undo: function() {}
});

// NormalCommand which is allowed to undo should be inited with two
// handlers, get_ and set_.
//
var NormalCommand = Command.extend({
  init: function(ctx_, get_, set_, newVal_) {
    this._cType = 0;
    this._ctx = ctx_;
    this._get = get_;
    this._set = set_;
    this._newVal = newVal_;
  },

  doIt: function() {
    this._oldVal = this._get.call(this._ctx);
    this._set.call(this._ctx, this._newVal);
  },

  undo: function() {
    this._set.call(this._ctx, this._oldVal);
  }
});

// NoUndoCommand which is not allowed to undo should be inited with only one handler
//
var NoUndoCommand = Command.extend({
  init: function(ctx_, cType_, handler_/* [, args_] */) {
    this._ctx = ctx_;
    this._cType = cType_;
    this._handler = handler_;
    this._args = [];
    for(var i = 3; i < arguments.length; ++i)
      this._args.push(arguments[i]);
  },

  doIt: function() {
    this._handler.apply(this._ctx, this._args);
  }
})

// The center processor of command
//
var CommandProcessor = Class.extend({
  init: function() {
    this._size = 20;
    this._cmdList = new Array(this._size);
    this._idx = -1;
  },
    
  perform: function(cmd_) {
    if(cmd_._cType == 0) {
      if(this._idx == this._size - 1) {
        this._cmdList.shift();
      } else {
        this._idx++;
      }
      this._cmdList[this._idx] = cmd_;
    }
    cmd_.doIt();
  },

  undo: function() {
    if(this._idx < 0) return ;
    this._cmdList[this._idx--].undo();
  },

  redo: function() {
    if(this._idx == this._cmdList.length - 1) return ;
    this._cmdList[++this._idx].doIt();
  }
});

// The base Class for Cache classes
//
var Cache = Class.extend({
  // The unit of timeout_ is second
  // 0 means no timeout
  //
  init: function(timeout_) {
    this.to = timeout_ || 0;
    this._cacheList = [];

    if(this.to != 0) {
      this._t = new Array(this.to);
      for(var i = 0; i < this._t.length; ++i) this._t = [];
      this._ti = 0;
      var _this = this;
      this._timer = setInterval(function() {
        var tmp;
        while(typeof (tmp = _this._t[_this._ti].pop()) !== 'undefined') {
          delete _this._cacheList[tmp];
        }
        _this._ti = (_this._ti + 1) % this.to;
      }, 1000);
    }
  },

  destroy: function() {
    clearInterval(this._timer);
  },

  // If the return is 'undefined', some functions should be implemented
  // in client classes to handle this situation.
  get: function(key_) {
    return this._cacheList[key_];
  },
  
  set: function(key_, val_) {
    this._cacheList[key_] = val_;

    if(this.to != 0) {
      var idx = (this._ti + this.to - 1) % this.to;
      this._t[idx].push(key_);
    }
  }
});

var WindowManager = Model.extend({
  init: function() {
    this.callSuper('window-manager');
    this._s = [];
  },

  add: function(window_) {
    if(this.callSuper(window_)) {
      this._s.push(window_);
    }
  },

  remove: function(window_) {
    if(this.callSuper(window_)) {
      for(var i = 0; i < this._s.length; ++i) {
        if(this._s[i] == window_) {
          this._s.splice(i, 1);
        }
      }
    }
  },

  focusOnAWindow: function(wID_) {
    for(var key in this._c) {
      if(wID_ == key) {
        this._c[key].focus();
        // TODO: change the sequence of windows in _s
      } else {
        this._c[key].blur();
      }
    }
  }
});

// A remote observer based on web socket
//
var RemoteObserver = Model.extend({
  // param:
  //  [address_]: websocket server's address 
  //  callback_: callback function
  //
  init: function() {
    this.callSuper('ws');
    var addr = '',
        cb_ = arguments[arguments.length - 1] || function() {};
    if(typeof cb_ !== 'function') cb_ = function() {};
    if(location.host == '') {
      this._local = true;
      addr = ((arguments.length <= 1) ? ('ws://127.0.0.1:8888/ws') : arguments[0]);
    } else {
      this._local = false;
      addr = ((arguments.length <= 1) ? ('ws://' + location.host + '/ws') : arguments[0]);
    }
    try {
      this._ws = new WebSocket(addr);
      this._ws.onopen = function() {
        console.log('WebSocket established successfully.');
        cb_(null);
      };
      this._ws.onclose = function() {
        console.log('The WebSocket connection has been closed.');
      };
      var _this = this;
      this._ws.onmessage = function(ev) {
        console.log(ev.data);
        try {
          _this.__dispacher(JSON.parse(ev.data));
        } catch(e) {
          return console.log(e);
        }
      };
      this._ws.onerror = function(e) {
        console.log('Error: ', e);
      };
    } catch(e) {
      console.log(e);
      cb_(e);
    }
    /* if(typeof arguments[arguments.length - 1] === 'function') */
      /* arguments[arguments.length - 1].call(this, null); */
  },

  getConnection: function() {return this._ws;},

  // msg is a JSON object
  send: function(msg) {
    try {
      this._ws.send(JSON.stringify(msg));
    } catch(e) {
      console.log('Send WebSocket Message Error:', e);
    }
    return this;
  },

  __dispacher: function(msg) {
    if(typeof msg.sessionID !== 'undefined') {
      this._sessionID = msg.sessionID;
      return ;
    }
    if(msg.Status == 'error') return console.log(msg.Data);
    this.emit(msg.Event, msg.Data);
  },

  getSessionID: function() {return this._sessionID;},

  isLocal: function() {return this._local;},

  close: function() {
    try {
      this._ws.close();
    } catch(e) {
      console.log(e);
    }
    return this;
  }
});
