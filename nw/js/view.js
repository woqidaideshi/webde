// This file includes all view classes
//

// The view of Desktop
//
var DesktopView = View.extend({
  init: function(model_, parent_) {
    this.callSuper('desktop-view', model_, parent_);
    this.controller = DesktopController.create(this);
    this.registObservers();
    this.$view = $('body').append($('<img>', {
      'src': 'img/bgp.jpg'
    }));
    this._c = [];
    this.initCtxMenu();
    this.initAction();
  }, 
  
  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'add': function(err_, component_) {
        var id = component_.getID();
        switch(id) {
          case 'launcher':
            // TODO: create a launcher view(split create and init into two functions, and
            //  here just create a view object)
            _this._c[id] = LauncherView.create(component_, _this);
            _this._c[id].show(_this.$view);
            break;
          case 'layout':
            _this._c['layout'] = FlipperView.create(component_, _this, true);
            _this._c['layout'].show(_this.$view);
            break;
          case 'device-list':
            _this._c['device-list'] = DeviceListView.create(component_, _this);
            _this._c['device-list'].show(_this.$view);
            break;
          case 'dock':
            _this._c[id] = DockView.create(component_, _this);
            _this._c[id].show(_this.$view);
            break;
          default:
            console.log('unknown type of component');
            break;
        }
      },
      'remove': function(err_, component_) {
      },
      'layout': function(err_, viewType_, layoutModel_) {
        // TODO: 
        //  reset desktop layout
        if(_this._c['layout'].getCurView() != -1) {
        }
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initCtxMenu: function() {
    var desktop = this._model,
        ctxMenu = _global.get('ctxMenu'),
        _this = this;
    ctxMenu.addCtxMenu([
      {header: 'desktop'},
      // TODO: comment for temporary
      /* {text: 'create Dir', icon: 'icon-folder-1', action: function(e) { */
        // e.preventDefault();
        // var layout = desktop.getCOMById('layout').getCurLayout();
        // for (var i = 0; ; i++) {
          // [> if(_global._fs.existsSync(desktop._desktopWatch.getBaseDir() + '/newDir' + i)) { <]
            // // continue;
          // // } else {
            // // _global._fs.mkdir(desktop._desktopWatch.getBaseDir() + '/newDir' + i, function() {});
            // // return;
          // [> } <]
          // // replace with logistic directory
          // if(layout.getWidgetByAttr('_name', 'New Folder ' + i) != null) continue;
          // var d = new Date();
          // _this._c['layout'].getCurView()._controller.onAddFolder('/desktop/New Folder ' + i
            // , 'folder' + d.getTime());
          // break; 
        // }
      /* }}, */
      {text: 'create Text', icon: 'icon-doc-text', action: function(e){
        e.preventDefault();
        // change to demo-rio's API
        _global._dataOP.createFileOnDesk(function(err_, ret_) {
          if(err_) return console.log(err_);
          _this._c['layout'].getCurView()._controller.onAddFile(ret_[0], ret_[1]);
        });
      }},
      {text: 'script', subMenu: [
        {header: 'script'}
      ]},
      {divider: true},
      {text: 'terminal', icon: 'icon-terminal', action: function(e) {
        e.preventDefault();
        _global._dataOP.shellExec(function(err, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
        }, "gnome-terminal");
      }},
      {text:'gedit', icon: 'icon-edit', action:function(e){
        e.preventDefault();
        _global._dataOP.shellExec(function(err, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
        }, "gedit");
      }},
      {divider: true},
      {text: 'refresh', icon: 'icon-spin3 animate-spin', action: function(e) {
        // TODO: only reload views
        location.reload();
      }},
      {text: 'refresh (F5)', icon: 'icon-spin3 animate-spin', action: function(e) {
        location.reload(true);
      }},
      {divider: true},
      {text: 'window', action: function() {
        Window.create('newWin','Test Window ', {
          left:200,
          top:100,
          height: 400,
          width: 700,
          fadeSpeed: 500,
          animate: false
        }, function() {
          this.getID = function() {return this._id;};
          _global._openingWindows.add(this);
          var _this = this;
          this.bindCloseButton(function() {
            _global._openingWindows.remove(_this);
          });
        }).onfocus(function() {
          _global._openingWindows.focusOnAWindow(this._id);
        });
      }},
      {text: 'window2', action: function() {
        Window.create('newWin2','Test Window2!', {
          left:400,
          top:300,
          height: 500,
          width: 800,
          fadeSpeed: 500,
          animate: true
        }, function() {
          this.getID = function() {return this._id;};
          _global._openingWindows.add(this);
          var _this = this;
          this.bindCloseButton(function() {
            _global._openingWindows.remove(_this);
          });
        }).onfocus(function() {
          _global._openingWindows.focusOnAWindow(this._id);
        });
      }},
      {text: 'app-plugin', icon: 'icon-plus', subMenu: [
        {header: 'add-plugin'},
        {text: 'clock', icon: 'icon-time', action: function(e) {
          e.preventDefault();
          if (typeof $('#clock')[0] == 'undefined') {
            var layout = desktop.getCOMById('layout').getCurLayout();
            layout.add(DPluginModel.create('clock', layout, 'img/clock.png', 'ClockPlugin'));
            ctxMenu.disableItem('add-plugin', 'clock');
          }
        }}
      ]},
      {text:'messenger set',icon: 'icon-cog', subMenu:[
        {header: 'messenger set'},
        {text:'position',subMenu:[
          {header:'messenger-pos'},
          {text:'left-bottom', action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-left messenger-on-bottom"
            };
          }},
          {text:'left-top', action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-left messenger-on-top"
            };
          }},
          {text:'top', action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-top"
            };
          }},
          {text:'right-top', action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-right messenger-on-top"
            };
          }},
          {text:'right-bottom', action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-right messenger-on-bottom"
            };
          }},
          {text:'bottom', action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-bottom"
            };
          }},

        ]},
        {text:'maxMessages',subMenu:[
          {text:'one',action:function(){
            Messenger.options={
              maxMessages: '1'
            }
          }},
          {text:'three',action:function(){
            Messenger.options={
              maxMessages: '3'
            }
          }},
          {text:'five',action:function(){
            Messenger.options={
              maxMessages: '5'
            }
          }}
        ]}
      ]},
      {text: 'Layout', subMenu: [
        {header: 'switch motion'}
      ]}
    ]);

    var /* layout = desktop.getCOMById('layout').getCurLayout(), */
        _this = this;
    ctxMenu.addCtxMenu([
      {header: 'plugin'},
      {text: 'zoom in', action: function(e) {
        e.preventDefault();
        desktop.getCOMById('layout').getCurLayout().getWidgetById(ctxMenu._rightObjId).zoomIn();
      }},
      {text: 'zoom out', action: function(e) {
        e.preventDefault();
        desktop.getCOMById('layout').getCurLayout().getWidgetById(ctxMenu._rightObjId).zoomOut();
      }},
      {text:'remove', action:function(e) {
        e.preventDefault();
        var layout = desktop.getCOMById('layout').getCurLayout(),
            _widget = layout.getWidgetById(ctxMenu._rightObjId);
        ctxMenu.activeItem('add-plugin', 'clock', function(e_) {
          e_.preventDefault();
          var curLayout = desktop.getCOMById('layout').getCurLayout();
          curLayout.add(DPluginModel.create('clock', curLayout, 'img/clock.png', 'ClockPlugin'));
        });
        layout.remove(_widget);
      }},
      {text: 'show clock', action: function() {
        $('#clock').modalBox({
          iconImg: 'img/close.png',
          iconClose: true,
          keyClose: true,
          bodyClose: true
        });
      }}
    ]);
    ctxMenu.addCtxMenu([
      {header: 'app-entry'},
      {text: 'Open', action: function(e) {
        e.preventDefault();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onDblclick();
      }},
      {text: 'Rename', action: function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onRename();
      }},
      {text: 'delete', icon: 'icon-cancel-circled2', action: function(e) {
        e.preventDefault();
        /* var _path = desktop._widgets[ctxMenu._rightObjId]._path; */
        /* utilIns.entryUtil.removeFile(_path); */
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onEntryDelete();
      }},
      {text:'property', action: function(e) {
        e.preventDefault();
        var layout = _global.get('desktop').getCOMById('layout').getCurLayout();
        PropertyView.create(ctxMenu._rightObjId
          , layout.getWidgetById(ctxMenu._rightObjId)
          , layout).show();
      }}
    ]);
    ctxMenu.addCtxMenu([
      {header: 'file-entry'},
      {text: 'Open', icon: 'icon-folder-open-empty', action: function(e) {
        e.preventDefault();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onDblclick();
      }},
      {text:'Open with...',icon: 'icon-folder-open', subMenu: [
        {header: 'Open with'}]
      },
      {divider: true},
      {text: 'Rename', action: function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onRename();
      }},
      {text:'Move to Trash' ,icon: 'icon-trash', action:function(e){
        e.preventDefault();
        utilIns.trashUtil.moveToTrash(ctxMenu._rightObjId);
      }},
      {text:'Delete' , icon: 'icon-cancel-circled2', action:function(e){
        e.preventDefault();
        var _msg;
        _msg = Messenger().post({
          message: 'If delete it , you can\'t recover it. \n Are you sure delete the file?',
          type: 'info',
          showCloseButton: true,
          actions:{
            sure:{
              label: 'sure delete',
              action:function(){
                var _path = desktop._widgets[ctxMenu._rightObjId]._path;
                utilIns.entryUtil.removeFile(_path);
                _msg.update({
                  message: 'Deleted file!',
                  type: 'success',
                  showCloseButton: true,
                  actions: false
                });
              }
            },
            trash:{
              label:'move to trash',
              action:function(){
                utilIns.trashUtil.moveToTrash(ctxMenu._rightObjId);
                _msg.update({
                  message: 'Moved file into trash!',
                  type: 'success',
                  showCloseButton: true,
                  actions: false
                });
              }
            },
            cancel:{
              label:'cancel',
              action:function(){
                _msg.update({
                  message: 'Cancel delete file!',
                  type: 'error',
                  showCloseButton: true,
                  actions: false
                });
              }
            }
          }
        });
        
      }},
    ]);
    ctxMenu.addCtxMenu([
      {header: 'theme-entry'},
      {text: 'Open', action: function(e) {
        e.preventDefault();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onDblclick();
      }},
      {text: 'Rename', action: function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onRename();
      }}
    ]);
  },

  initAction: function() {
    var _this = this;
    $(window).on('beforeunload', function() {
      _this._model.release();
    });

    var ctxMenu = _global.get('ctxMenu'),
        desktop = this._model,
        utilIns = _global.get('utilIns');
    ctxMenu.attachToMenu('body', ctxMenu.getMenuByHeader('desktop')
        , function() {
          ctxMenu._rightObjId = undefined;
          // if need, change to get from a file
          /* var _DIR = _global.$home + '/.gnome2/nemo-scripts'; */
          // console.log(_DIR);
          // var _menu = ctxMenu.getMenuByHeader('script');
          // if (typeof _menu !== 'undefined') {
            // var _items = _menu.children('li');
            // for (var i = 0; i < _items.length; i++) {
            // if(!$(_items[i]).hasClass('nav-header'))
              // $(_items[i]).remove();
            // };
          // }
          // _global._fs.readdir(_DIR, function(err_, files_) {
            // for(var i = 0; i < files_.length; i++) {
              // var _names = files_[i].split('.');
              // if(_names[_names.length - 1] == 'desktop') {
                // _global.get('utilIns').entryUtil.getItemFromApp(_DIR + '/' + files_[i]
                  // , function(err_, item_) {
                    // ctxMenu.addItem(_menu, item_);
                  // });
              // };
            // };
          /* }); */

          // get layout switch motion
          var motions = _this._c['layout'].getMotions(),
              sMenu = ctxMenu.getMenuByHeader('switch motion');
          for(var key in motions) {
            var item = {
              text: key,
              action: function(e) {
                e.preventDefault();
                _this._c['layout'].setCurSwitchMotion(this.text);
              }
            };
            if(!ctxMenu.hasItem(sMenu, item))
              ctxMenu.addItem(sMenu, item);
          }
        });
  }
});

// Base class for all widget views 
//
var WidgetView = View.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
  },
  
  registObservers: function() {
  },

  initAction: function($selector) {
    var _this = this;
    $selector.on('dragstart', function(ev) {
      _this.drag(ev);
    }).on('dragover', function(ev) {
      _this.dragOver(ev);
    }).on('drop', function(ev) {
      _this.drop(ev);
    }).on('dragenter', function(ev) {
      _this.dragEnter(ev);
    }).on('dragleave', function(ev) {
      _this.dragLeave(ev);
    });
  },

  drag: function(ev) {
    console.log("drag start");
    ev.originalEvent.dataTransfer.setData("ID", ev.originalEvent.currentTarget.id);
    console.log(ev.originalEvent.dataTransfer.getData("ID"));
    ev.stopPropagation();
  },

  dragOver: function(ev) {
    ev.preventDefault();
  },

  // TODO: change to use a Command to modify model
  //  and then will emit view's update
  //
  drop: function(ev) {
    //if(ev.srcElement == ev.toElement) return ;
    ev.preventDefault();
    var desktop = _global.get('desktop'),
        _id = ev.originalEvent.dataTransfer.getData("ID");
    if(ev.originalEvent.target.id == _id) return ;
    //ev.target.appendChild(document.getElementById(_id));
    // TODO: get event source's view object from Desktop by dataTransfer object,
    //  and send request to controller
    $(ev.originalEvent.target).append($('#'+_id));
  
    console.log(_id + " ---> " + ev.originalEvent.target.id);
    var attr = ev.originalEvent.target.id.split('_');
    console.log(desktop._widgets[_id]);
    if (typeof desktop._widgets[_id] !== 'undefined') {
        desktop._widgets[_id].setPosition({x: attr[1], y: attr[2]});
        console.log(attr[1], attr[2]);
      }
  },

  dragEnter: function(ev) {},

  dragLeave: function(ev) {}
}); 

// Grid view for Layout model
//
var GridView = WidgetView.extend({
  init: function(id_, model_, parent_, needSelector_) {
    this.callSuper(id_, model_, parent_);
    this._controller = GridController.create(this);
    this._draw = false;
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'gridcontainer', 
      'id': this._id,
      'onselectstart': 'return false'
    });
    this._c = [];
    this._tabIdx = -1;
    this._needSelector = needSelector_ || false;
    this._dEntrys = OrderedQueue.create(function(entry1_, entry2_) {
      var pos1 = entry1_._model.getPosition(),
          pos2 = entry2_._model.getPosition();
      if(pos1.x > pos2.x) {
        return true;
      } else if(pos1.x == pos2.x) {
        if(pos1.y < pos2.y) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  },

  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'add': function(err_, widget_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        switch(widget_.getType()) {
          case 'ClockPlugin':
            _this.addAnDPlugin(ClockPluginView.create(widget_.getID(), widget_, _this), widget_);
            break;
          case 'ImagePlugin':
            break;
          default:
            _this.addAnDEntry(widget_);
            break;
        }
      },
      'remove': function(err_, widget_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        switch(widget_.getType()) {
          case 'ClockPlugin':
          case 'ImagePlugin':
            _this.deleteADPlugin(widget_)
            break;
          default:
            _this.deleteADEntry(widget_);
            break;
        }
      },
      'layout_size': function(err_, size_) {
        // redraw the layout container's size
        _this.$view.css({
          'width': size_.width,
          'height': size_.height
        });
      },
      'grid_size': function(err_, size_) {
        // TODO: redraw the grid_size
      },
      'col_row': function(err_, col_row_diff_) {
        if(!_this._draw) {
          _this.drawGrids();
        } else {
          // TODO: add or remove colume or row
        }
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  addAnDEntry: function(entry_) {
    var pos_ = entry_.getPosition();
    if(typeof pos_ === 'undefined' || 
      // typeof $('#grid_' + pos_.x + '_' + pos_.y).children('div')[0] != 'undefined') {
      this._model._grid[pos_.x][pos_.y].use) {
      pos_ = this._model.findAnIdleGrid();
      if(pos_ == null) {
        alert("No room");
        this._model.remove(entry_);
        return ;
      }
    }

    this._c[entry_.getID()] = DEntryView.create(entry_.getID(), entry_, this);
    entry_.setPosition(pos_);
    this._dEntrys.push(this._c[entry_.getID()]);
    this.resetDEntryTabIdx(); 
    this._model._grid[pos_.x][pos_.y].use = true;
  },

  deleteADEntry: function(entry_) {
    var _pos = entry_.getPosition(),
        _id = entry_.getID();
    this._model._grid[_pos.x][_pos.y].use = false;
    this._dEntrys.remove(this._c[_id].getTabIndex() - 1);
    this.resetDEntryTabIdx();
    this._c[_id].destroy();
    this._c[_id] = null;
    delete this._c[_id];
  },

  resetDEntryTabIdx: function() {
    for(var i = 0; i < this._dEntrys.length(); ++i) {
      if(this._dEntrys.get(i) != null)
        this._dEntrys.get(i).setTabIndex(i + 1);
    }
  },

  addAnDPlugin: function(pluginView_, plugin_) {
    var pos_ = plugin_.getPosition();
    if(typeof pos_ === 'undefined') {
      pos_ = this._model.findAnIdleGridFromRight();
      if(pos_ == null) {
        alert("No room");
        this._model.remove(plugin_);
        return ;
      }
    }

    plugin_.setPosition(pos_);
    this._c[plugin_.getID()] = pluginView_;
    /* plugin_.show(); */
    /* plugin_.setPanel(path_); */
    //get number of occupy-grid col and row
    this._model.flagGridOccupy(pos_.x, pos_.y, plugin_.getColNum(), plugin_.getRowNum(), true);
  },

  deleteADPlugin: function(entry_) {
    var _pos = entry_.getPosition();
    this._model.flagGridOccupy(_pos.x
        , _pos.y, this._model._col_num, this._model._row_num, false);
    this._c[entry_.getID()].destroy();
    this._c[entry_.getID()] = null;
    delete this._c[entry_.getID()];
  },

  drawGrids: function() {
    this._draw = true;
    for(var i = 0; i < this._model._col_num; ++i) {
      var col = this.drawCol(i);

      this._model._grid[i] = new Array();
      for(var j = 0; j < this._model._row_num; ++j) {
        this.drawGrid(col, i, j);
      }  
    }
    var $grid = $('.grid');
    this._model.setGridSize({
      'gridWidth': $grid.width(),
      'gridHeight': $grid.height()
    })
  },

  drawCol: function(i) {
    var col_ = $('<div>', {
      'class': 'gridcol',
      'id': 'col' + i,
      'onselectstart': 'return false'
    });
    this.$view.append(col_);
    return col_;
  },

  drawGrid: function($col, i, j) {
    var row_ = $('<div>', {
      'class': 'grid',
      'id': 'grid_' + i + '_' + j,
      'draggable':'false',
      'onselectstart': 'return false'
    });
    $col.append(row_);
    this.initAction(row_);

    this._model._grid[i][j] = {};
    this._model._grid[i][j].use = false;
  },

  destroyGrids: function() {
    this.$view.children('.gridcol').empty();
  },

  destroyCol: function($col) {
    $col.remove();
  },

  show: function($parent, init_) {
    $parent.append(this.$view);
    if(init_) this.$view.css('display', 'none');
    var _this = this;
    if(this._needSelector) {
      this._selector = Selector.create(this, '#' + this._id, {
        'enter': function() {
          if(_this._tabIdx != -1 && _this._dEntrys._items[_this._tabIdx] != null)
            _this._dEntrys._items[_this._tabIdx]._controller.onDblclick();
        },
        'up': function() {
          _this._tabIdx += _this._dEntrys.length() - 1;
          _this._tabIdx %= _this._dEntrys.length();
          var _entry = _this._dEntrys._items[_this._tabIdx];
          if(_entry == null) {
            do{
              _this._tabIdx--;
              _entry = _this._dEntrys._items[0];
            } while(_entry == null);
          }
          _entry.focus(); 
        },
        'down': function() {
          _this._tabIdx++; 
          _this._tabIdx %= _this._dEntrys.length();
          var _entry = _this._dEntrys._items[_this._tabIdx];
          if(_entry == null) {
            _this._tabIdx = 0;
            _entry = _this._dEntrys._items[0];
          } 
          _entry.focus(); 
        },
        'clear': function() {
          _this._tabIdx = -1;
        }
      });
    } else {
      this._selector = this._parent._selector;
    }
    _this._model.setSize({
      'width': _this.$view.width(),
      'height': _this.$view.height()
    });
  },

  hide: function() {
    this.$view.remove();
  },

  drag: function(ev) {
    console.log("grid is not allowed to drag");
    ev.stopPropagation();
  },

  dragOver: function(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    ev.originalEvent.dataTransfer.dropEffect = 'copy';
  },

  drop: function(e) {
    //t_* is target  others is source 
    var ev = e.originalEvent;
    console.log('drop-grid');
    ev.stopPropagation();
    ev.preventDefault();
    this.$view.find('#' + ev.currentTarget.id).removeClass('hovering');

    var __id = ev.dataTransfer.getData("ID"),
        _id = /([\w-_\s\.]+)-dock$/.exec(__id);
    if(_id == null) _id = {'1': __id};
    // if(this._id == _id[1]) return ;
    //show insert position picture
    var _source = null,
        desktop = _global.get('desktop'),
        model = this._model,
        s_widget = model.getWidgetById(_id[1]),
        dock = desktop.getCOMById('dock'),
        dockApp = dock.getCOMById(_id[1]); 
    
    var _target_id = ev.target.id;
    // var _id = ev.originalEvent.dataTransfer.getData("ID");
    var _target = this.$view.find('#' + _target_id);

    //get target position
    var _target_arr = _target_id.split('_');
    var _target_col = parseInt(_target_arr[1]);
    var _target_row = parseInt(_target_arr[2]);
    desktop._position = {x: _target_col, y: _target_row};

    // handle event that drag a dockapp to desktop
    //
    if(typeof _id[0] !== 'undefined') {
      if(typeof s_widget !== 'undefined') {
        alert("The app has been registed in desktop");
        return ;
      }
      /* var _name = dockApp.getFilename(), */
          // _src = dock._dockWatch.getBaseDir() + '/' + _name,
          /* _dst = desktop._desktopWatch.getBaseDir() + '/' + _name; */
      dockApp.setPosition({x: _target_col, y: _target_row});
      // change to link and unlink
      this._controller.onDockAppDrop(dockApp);
      // _global._fs.rename(_src, _dst, function() {});
      return ;
    }

    // handle file transfer
    //
    var _files = ev.dataTransfer.files,
        _this = this;
    if(_files.length != 0) {
      for(var i = 0; i < _files.length; ++i) {
        // TODO: remove these code when not needed
        // var dst = desktop._desktopWatch.getBaseDir() + '/' + _files[i].name;
        // if(_files[i].path == dst) continue;
        // _global._fs.rename(_files[i].path, dst, function() {});
        _global._dataOP.moveToDesktopSingle(function(err_, ret_) {
          if(err_) return console.log(err_);
          _this._controller.onAddFile(ret_[0], ret_[1]);
        }, _files[i].path);
      }
      return ;
    }

    //handle item transfer (not support chinese) 
    var _items = ev.dataTransfer.items;
    if (_items.length != 0 && typeof s_widget == 'undefined') {
      _items[0].getAsString(function(data) {
        // using demo-ris's API to create this file
        var _this = this,
            iconv = require('iconv-lite'),
            buf = iconv.encode(data,'ucs2'),
            str = iconv.decode(buf,'ucs2');
        _global._dataOP.createFileOnDesk(function(err_, ret_) {
          if(err_) return console.log(err_);
          _this._controller.onAddFile(ret[0], ret[1]);
        });
        /* for (var i = 0; ; i++) { */
          // if(_global._fs.existsSync(desktop._desktopWatch.getBaseDir()+'/newFile'+i+'.txt')) {
            // continue;
          // } else {
            // var iconv = require('iconv-lite');
            // var buf = iconv.encode(data,'ucs2');
            // var str = iconv.decode(buf,'ucs2');
            // _global._fs.writeFile(desktop._desktopWatch.getBaseDir() + '/newFile' + i + '.txt'
              // , str, {encoding:'utf8'}, function(err) {
                // if (err) throw err;
              // });
            // return ;
          // }
        /* }; */
      });
    };

    if(typeof s_widget == 'undefined') return ;
    
    //get source occupy number of grids follow x or y 
    var col_num = 1;
    var row_num = 1;  
    if (s_widget.getType().match(/\w*Plugin/) != null) {
      col_num = s_widget.getColNum();
      row_num = s_widget.getRowNum();
    };
    //get Grid obj
    // var desktopGrid = desktop.getGrid();

    //handle multi-entries move
    //
    var entries = this._selector.getSelectedItems();
    if(entries.length > 1) { 
      for(var i = 0; i < entries.length; ++i) {
        if(entries[i] == null) continue;
        var _s_id = $('#' + entries[i]._id).parent().attr('id'),
            _coor = /^.*[_]([0-9]+)[_]([0-9]+)$/.exec(_s_id),
            _pos = model.findALegalNearingIdleGrid({
              x: _target_col, 
              y: _target_row
            });
        if(_pos == null) return ;
        console.log(entries[i]._id + " ---> " + _pos.x + '  '  + _pos.y);
        entries[i]._model.setPosition({x: _pos.x, y: _pos.y});
        model.flagGridOccupy(_pos.x, _pos.y, 1, 1, true);
        _target_col = _pos.x;
        _target_row = _pos.y;
      
        model.flagGridOccupy(_coor[1], _coor[2], 1, 1, false);
      }
      this._dEntrys.order();
      this.resetDEntryTabIdx();
      return ;
    } 

    //get source grid
    var parent_id = $('#' + _id[1]).parent('.grid')[0].id;
    var arr = parent_id.split('_');
    var col = parseInt(arr[1]);
    var row = parseInt(arr[2]);

    //flag grid  isn't occupied
    model.flagGridOccupy(col, row, col_num, row_num, false);

    //find Idle grids arround from the target grid
    var pos_ = model.findIdleGrid(_target_col,_target_row,col_num,row_num);
    if (pos_ != null) {
      console.log(_id[1] + " ---> " + pos_.x + '  '  + pos_.y);
      s_widget.setPosition({x: pos_.x, y: pos_.y});
      model.flagGridOccupy(pos_.x, pos_.y, col_num, row_num, true);
      if(s_widget.getType().match(/\w*Plugin/) == null) {
        this._dEntrys.order();
        this.resetDEntryTabIdx();
      }
      return ;
    }

    model.flagGridOccupy(col, row, col_num, row_num, true);
    console.log(_target_id + " is occupied");
  },

  dragEnter: function(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    this.$view.find('#' + ev.currentTarget.id).addClass('hovering');
  },

  dragLeave: function(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    this.$view.find('#' + ev.currentTarget.id).removeClass('hovering');
  },

  getSelectableItems: function() {
    return this._dEntrys._items;
  }
});

var DPluginView = WidgetView.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
    this.registObservers();
    // this._controller = null;
    this.$view = $('<div>', {
      'class': 'plugin-div',
      'id': this._id,
      'draggable': 'true'
    }).html("<canvas id='" + this._id + this._model._content + "'/>");//  width='100%' height='100%'
    this._ctx = this.$view.children('canvas')[0].getContext('2d');
    this.initAction(this.$view);
  },
  
  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'size': function(err_, size_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        _this.$view.width(size_.width).height(size_.height);
        _this._ctx.canvas.width = size_.width;
        _this._ctx.canvas.height = size_.height;
      },
      'position': function(err_, pos_) {
        var layoutType = _global.get('desktop').getLayoutType();
        switch(layoutType) {
          case 'grid':
            _this.show(_this._parent.$view.find('#grid_' + pos_.x + '_' + pos_.y));
            break;
          default:
            break;
        }
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function($selector) {
    this.callSuper($selector);
    $selector.on('mousedown', function(e) {
      e.stopPropagation();
    }).on('mouseup', function(e) {
      // e.stopPropagation();
    });

    var ctxMenu = _global.get('ctxMenu');
    ctxMenu.attachToMenu('#' + this.getID()
        , ctxMenu.getMenuByHeader('plugin')
        , function(id_) {ctxMenu._rightObjId = id_});
  },

  show: function($parent) {
    $parent.append(this.$view);
    this._model.setSize({
      width: this.$view.width(),
      height: this.$view.height()
    });
  },

  hide: function() {
    this.$view.remove();
  },

  dragover: function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  },

  drop: function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
});

var ClockPluginView = DPluginView.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
  },

  show: function($parent) {
    this.callSuper($parent);
    // init context menu
    var ctxMenu = _global.get('ctxMenu'),
        _size = this._model.getSize();
    ctxMenu.disableItem('add-plugin', 'clock');
    if(_size.width == 180) {
      ctxMenu.disableItem('plugin', 'zoom in');
    } else if(_size.width == 90) {
      ctxMenu.disableItem('plugin', 'zoom out');
    }
    // init tooltip
    Tooltip.create(this.$view, 'cursor');
    // draw the clock
    var /* _target = $('#' + this._id + this._model._content), */
        _context = this._ctx/* _target[0].getContext('2d') */,
        _this = this;
        _img = new Image();

    _img.src = this._model._path;
    _img.onload = function() {  
      _context.drawImage(_img, 0, 0, _size.width, _size.height);
    }

    var run = function() {
      var _type = [['#000',70,1], ['#ccc',60,2], ['red',50,3]];
      function drwePointer(type_, angle_) {
        type_ = _type[type_];
        angle_ = angle_ * Math.PI * 2 - 90 / 180 * Math.PI; 
        var _length = type_[1] / (200 / _this._ctx.canvas.width);
        _context.beginPath();
        _context.lineWidth = type_[2];
        _context.strokeStyle = type_[0];
        _context.moveTo(_this._ctx.canvas.width / 2
            , _this._ctx.canvas.height / 2); 
        _context.lineTo(_this._ctx.canvas.width / 2 + _length * Math.cos(angle_)
            , _this._ctx.canvas.height / 2 + _length * Math.sin(angle_)); 
        _context.stroke();
        _context.closePath();
      }
      setInterval(function() {
        _context.clearRect(0, 0, _this._ctx.canvas.width, _this._ctx.canvas.height);
        _context.drawImage(_img, 0, 0, _this._ctx.canvas.width, _this._ctx.canvas.height);
        var _time = new Date();
        var _hour = _time.getHours();
        var _mimute = _time.getMinutes();
        var _second = _time.getSeconds(); 
        _hour = _hour > 12?_hour - 12: _hour;
        _hour = _hour+_mimute/60; 
        _hour = _hour/12;
        _mimute = _mimute/60;
        _second = _second/60;
        drwePointer(0, _second);
        drwePointer(1, _mimute);
        drwePointer(2, _hour); 
      }, 100);
    };
    run();
  }
});

var DEntryView = WidgetView.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
    this.registObservers();
    // this._parent = parent_;
    this._controller = EntryController.create(this);
    this._tabIndex = -1;
    this.$view = $('<div>', {
      'class': 'icon',
      'id': this._id,
      'draggable': 'true'/* ,  */
      /* 'tabindex': this._tabIndex  */
    }).html("<img draggable='false' src='"
      + this._model.getImgPath() + "'/><p>" + this._model.getName() + "</p>");
    this.initAction(this.$view);
  },

  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'position': function(err_, newPos_) {
        _this.show();
      },
      'name': function(err_, newName_) {
        if(err_) {
          console.log(err_);
          return;
        }
        _this.$view.children('p').text(newName_);
      },
      'imgPath': function(err_, imgPath_) {
        if(err_) {
          console.log(err_);
          return;
        }
        _this.$view.children('img').attr('src', imgPath_);
      },
      'tabIdx': function(err_, tabIdx_) {
        if(err_) {
          console.log(err_);
          return;
        }
        $('#' + _this._id).attr('tabindex', tabIdx_);
      },
      'focus': function(err_) {
        if(err_) {
          console.log(err_);
          return;
        }
        _this.$view.addClass('focusing');
        /* if(!desktop._selector._selectedEntries.hasEntry(_this._id)) */
          // desktop._selector._selectedEntries.push(_this);
        /* desktop._tabIndex = _this._tabIndex - 1; */
      },
      'blur': function(err_) {
        if(err_) {
          console.log(err_);
          return;
        }
        _this.$view.removeClass('focusing');
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function($selector) {
    this.callSuper($selector);
    var _entry = this, // ._model
        _this = this,
        desktop = _global.get('desktop');

    $selector.dblclick(function() {
      _this._controller.onDblclick();
    }).mouseenter(function() {
      var $p = _this.$view.children('p');
      _this.pHeight = $p.height();
      $p.css({
        'height': $p[0].scrollHeight,
        'overflow': 'visible'
      });
    }).mouseleave(function() {
      $('#' + _entry.getID() + ' p').css({
        'height': _this.pHeight,
        'overflow': 'hidden'
      });
    }).mousedown(function(e) {
      e.stopPropagation();
    }).mouseup(function(e) { 
      if(!e.ctrlKey) { 
        _this._parent._selector.releaseSelectedEntries();
        _this.focus();
      } else {
        if(_this._focused) {
          for(var i = 0; i < _this._parent._selector._selectedEntries.length; ++i) {
            if(_this._parent._selector._selectedEntries[i] != null
              && _entry._id == _this._parent._selector._selectedEntries[i]._id) {
                _this._parent._selector._selectedEntries[i] = null;
                _this.blur();
                break;
              }
          }
        } else {
          _this.focus();
        }
      } 
    });

    var ctxMenu = _global.get('ctxMenu'),
        type = this._model.getType();
    if(type == 'app' || type == 'theme' || type == 'inside-app'/*  || type == 'dir' */) {
      if(type == 'inside-app') type = 'app';
      ctxMenu.attachToMenu('#' + this.getID()
          , ctxMenu.getMenuByHeader(type + '-entry')
          , function(id_) {ctxMenu._rightObjId = id_;});
    } else {
      ctxMenu.attachToMenu('#' + this.getID()
          , ctxMenu.getMenuByHeader('file-entry')
          , function(id_, $menu_) {
            ctxMenu._rightObjId = id_;
            var _menu = ctxMenu.getMenuByHeader('Open with'),
                layout = desktop.getCOMById('layout').getCurLayout(),
                model = layout.getWidgetById(ctxMenu._rightObjId),
                utilIns = _global.get('utilIns');
            if (typeof _menu !== 'undefined') {
              var _items = _menu.children('li');
              for(var i = 1; i < _items.length; i++) {
                // if(!$(_items[i]).hasClass('nav-header'))
                  $(_items[i]).remove();
              }
            }
            utilIns.entryUtil.getMimeType(model.getPath(), function(err_, mimeType_) {
              if(err_)
                return console.log('getMimeType: ' + err_);
              var type = mimeType_ || 'text/plain';
              if(type == '') type = 'text/plain';
              var types = type.split('/'),
                  apps = desktop._DEFAULT_APP[types[0]][types[1]] || [];
              for(var i = 0; i < apps.length; ++i) {
                var item = utilIns.entryUtil.getItemFromApp(apps[i]);
                if(item != null) ctxMenu.addItem(_menu, item);
              }
            });
          });
    }
  },

  show: function() {
    var pos = this._model.getPosition(),
        layout = _global.get('desktop').getLayoutType();
    switch(layout) {
      case 'grid':
        this._parent.$view.find('#grid_' + pos.x + '_' + pos.y).append(this.$view);
        break;
      default:
        break;
    }
  },

  hide: function() {
    var pos = this._model.getPosition(),
        layout = _global.get('desktop').getLayoutType();
    switch(layout) {
      case 'grid':
        this._parent.$view.find('#grid_' + pos.x + '_' + pos.y).empty();
        break;
      default:
        break;
    };
  },

  drag: function(ev) {
    /* var desktop = _global.get('desktop'); */
    // if(!desktop._selector._selectedEntries.hasEntry(ev.target.id)) {
      // desktop._selector.releaseSelectedEntries();
    /* } */
    this.callSuper(ev);
  },

  drop: function(ev) {
    // TODO: send a command to processer
    this.$view.parent('.grid').removeClass('hovering');
    ev.preventDefault();
    ev.stopPropagation();
    this._controller.onDrop(ev, this._parent._selector.getSelectedItems());
  },

  focus: function() {
    this.$view.addClass('focusing');
    if(!this._parent._selector._selectedEntries.hasEntry(this._id)) 
      this._parent._selector._selectedEntries.push(this);
    this._focused = true;
    this._parent._tabIdx = this._tabIndex - 1; 
  },

  blur: function() {
    this.$view.removeClass('focusing');
    this._focused = false;
    // this._parent._tabIdx = -1; 
  },

  getTabIndex: function() {return this._tabIndex;},

  setTabIndex: function(tabIdx_) {
    this._tabIndex = tabIdx_;
    // $('#' + _this._id).attr('tabindex', tabIdx_);
  }
});

var LauncherView = View.extend({
  init: function(model_, parent_) {
    this.callSuper(model_.getID(), model_, parent_);
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'launcher',
      'id': this._id,
      'onselectstart': 'return false'
    }).append($('<div>', {
      'class': 'subject'
    })).append($('<div>', {
      'class': 'content'
    }).append($('<div>', {
      'class': 'c-search'
    }).append($('<input>', {
      'class': 'c-s-input'
    }).attr({
      'type': 'search',
      'results': 5,
      'placeholder': 'Search...'//,
      // 'autofocus': 'autofocus'
    }))));
    this.initAction();
    this.initCtxMenu();
    this._c = [];
    this._views = [];
  },

  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'add': function(err_, app_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        // new appView and add to launcher
        var id_ = app_.getID() + '-launcher';
        _this._views[id_] = LauncherEntryView.create(id_, app_, _this);
        _this.showInCategory('All', _this._views[id_]);
      },
      'remove': function(err_, app_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        var id_ = app_.getID() + '-launcher',
            cg_ = app_.getCategory();
        if(typeof _this._views[id_] === 'undefined') return ;
        _this._views[id_].hide();
        _this._views[id_] = null;
        delete _this._views[id_];
        _this._c['All'].subject.attr('title', 'All' + '(' + --_this._c['All'].length + ')');
        if(typeof cg_ != 'undefined' && cg_ != 'All')
          _this._c[cg_].subject.attr('title', cg_ + '(' + --_this._c[cg_].length + ')');
      },
      'show': function(err_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        if(!_this._shown) {
          _this.toggle();
        }
      },
      'start-up': function(err_, model_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        if(_global._openingWindows.has(model_.getID() + '-window')) return ;
        Window.create(model_.getID() + '-window', model_.getName(), {
          left: 400,
          top: 300,
          height: 400,
          width: 700,
          fadeSpeed: 500,
          animate: false,
          contentDiv: false,
          iframe: true
        }, function() {
          this.getID = function() {return this._id;};
          _global._openingWindows.add(this);
          this.appendHtml(model_.getPath() + '/index.html');
          var _this = this;
          this.bindCloseButton(function() {
            _global._openingWindows.remove(_this);
          });
          this.onfocus(function() {
            _global._openingWindows.focusOnAWindow(this._id);
          });
        })/* .appendHtml(model_.getPath() + '/index.html') */; 
      },
      'add-login-app': function(err_, model_) {
        var login = LoginView.create(model_.getID(), model_);
      }
    };
    for(var key in _this.__handlers) {
      _this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function() {
    var _this = this;
    _this.$view.on('mousemove', function(e) {
      e.stopPropagation();
    }).on('mousedown', function(e) {
      e.stopPropagation();
    }).on('contextmenu', function(e) {
      e.stopPropagation();
      e.preventDefault();
    });
    $(document).on('keydown', 'html', function(e) {
      switch(e.which) {
        case 27: // esc
          if(_this._shown)
            _this.toggle();
          break;
        case 81: // q/Q
          if(!e.altKey) return;
          _this.toggle();
          break;
        default:
          break;
      }
    });
  },

  initCtxMenu: function() {
    var _this = this,
        ctxMenu = _global.get('ctxMenu');
    ctxMenu.addCtxMenu([
      {header: 'launcher'},
      {text: 'Open', action: function(e) {
        e.preventDefault();
        _this._views[ctxMenu._rightObjId]._controller.onClick();
        _this.toggle();
      }},
      {text: 'Add to Desktop', action: function(e) {
        e.preventDefault();
        _this._views[ctxMenu._rightObjId]._controller.onAddToDesktop();
        _this.toggle();
      }},
      {text: 'Add to Dock', action: function(e) {
        e.preventDefault();
        _this._views[ctxMenu._rightObjId]._controller.onAddToDock();
        _this.toggle();
      }}
    ]);
  },

  show: function($parent) {
    $parent.append(this.$view);
    var $content = this.$view.children('.content'),
        contentW = $content.width(),
        contentH = $content.height(),
        pw = contentW * 0.96,
        ph = contentH * 0.6,
        mt = ph * 0.01, // the margin of top
        mr = pw * 0.01, // the margin of right
        numH = 6; // the number of row
    this._itemH = (ph - mt * numH) / numH;
    // the number of column
    var numW = Math.floor(pw / (this._itemH + mr));
    this._itemW = pw / numW;
    this._imgSize = this._itemH * 0.625;
    this.$view.hide();
    this._shown = false;

    this.showInCategory('All');
    for(var cg in _global._App_Cate) {
      if(cg == 'Audio' || cg == 'Video') continue;
      this.showInCategory(cg);
    }
    this.showInCategory('Other');
  },

  showInCategory: function(category_, entry_) {
    var cg = category_, icon;
    switch(category_) {
      case 'All':
        icon = 'icon-th';
        break;
      case 'AudioVideo':
      case 'Audio':
      case 'Video':
        cg = 'AudioVideo';
        icon = 'icon-video';
        break;
      case 'Development':
        icon = 'icon-wrench-1';
        break;
      case 'Education':
        icon = 'icon-college';
        break;
      case 'Game':
        icon = 'icon-reddit';
        break;
      case 'Graphics':
        icon = 'icon-art-gallery';
        break;
      case 'Network':
        icon = 'icon-globe';
        break;
      case 'Office':
        icon = 'icon-news';
        break;
      case 'Science':
        icon = 'icon-lightbulb';
        break;
      case 'Settings':
        icon = 'icon-cogs';
        break;
      case 'System':
        icon = 'icon-wrench-outline';
        break;
      case 'Utility':
        icon = 'icon-calendar';
        break;
      default:
        cg = 'Other';
        icon = 'icon-briefcase';
        break;
    }
    // add entry_ to category_
    if(typeof this._c[cg] === 'undefined') {
      var _this = this;
      _this._c[cg] = {
        'subject': $('<div>', {
                    'class': icon + ' sub-entry',
                    'title': cg + '(0)'
                  }).on('click', function(e) {
                    e.stopPropagation();
                    _this._c[_this._cur].content.hide();
                    _this._c[_this._cur].subject.removeClass('open');

                    _this._c[cg].content.show();
                    _this._c[cg].subject.addClass('open');
                    _this._cur = cg;
                    _this.$view.find('.c-s-input')[0].focus();
                  }),
        'content': $('<div>', {
                    'class': 'c-items'
                  }),
        'length': 0
      };
      this.$view.children('.subject').append(this._c[cg].subject);
      this.$view.children('.content').append(this._c[cg].content);
    }
    if(typeof entry_ !== 'undefined') {
      entry_.show(this._c[cg].content);
      this._c[cg].subject.attr('title', cg + '(' + ++this._c[cg].length + ')');
    }
  },

  toggle: function() {
    if(this._shown) {
      this.$view.hide().children('canvas').remove();
      this._c[this._cur].content.hide();
      this._c[this._cur].subject.removeClass('open');
      this._shown = false;
    } else {
      var _this = this;
      html2canvas($('body'), {
        onrendered: function(canvas) {
          _this.$view.append(canvas).children('canvas').attr({
            'class': 'blurcanvas',
            'id': 'blurcanvas'
          });
          stackBlurCanvasRGB('blurcanvas', 0, 0, canvas.width, canvas.height, 20);
          _this.$view.show();
          _this._shown = true;
          _this._c['All'].content.show(); 
          _this._c['All'].subject.addClass('open'); 
          _this._cur = 'All';
          _this.$view.find('.c-s-input')[0].focus();
        }
      });
    }
  },
  
  getContents: function() {return this._c;}
});

var LauncherEntryView = View.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'c-item',
      'id': this.getID()
    }).css({
      'width': parent_._itemW,
      'height': parent_._itemH
    }).append($('<img>', {
      'src': this._model.getImgPath()
    }).css({
      'width': parent_._imgSize,
      'height': parent_._imgSize
    })).append($('<p>').text(this._model.getName()));
    this.$view2 = null;
    this.initAction(this.$view);
    this._contents = parent_.getContents();
    this._controller = LauncherEntryController.create(this);
  },

  registObservers: function() {
    var _this = this;
    _this._model.on('category', function(err_, cg_) {
      if(_this.$view2 == null) {
        _this.$view2 = _this.$view.clone();
        _this.initAction(_this.$view2);
      }
      var cg = _global._App_Cate[cg_];
      _this._contents[cg].subject.attr('title', cg + '(' + ++_this._contents[cg].length + ')');
      _this._contents[cg].content.append(_this.$view2);
    }).on('imgPath', function(err_, imgPath_) {
      _this.$view.children('img').attr('src', imgPath_);
      if(_this.$view2 != null) {
        _this.$view2.children('img').attr('src', imgPath_);
      }
    }).on('name', function(err_, name_) {
      _this.$view.children('p').text(name_);
      if(_this.$view2 != null) {
        _this.$view2.children('p').text(name_);
      }
    }).on('noDisplay', function(err_, noDisplay_) {
      if(err_) {
        console.log(err_);
        return ;
      }
      if(noDisplay_) {
        _this.hide();
        _this._parent._c['All'].subject.attr('title'
          , 'All' + '(' + --_this._parent._c['All'].length + ')');
        _this._parent._views[_this._id] = null;
        delete _this._parent._views[_this._id];
      }
    });
  },

  initAction: function($view) {
    var _this = this,
        ctxMenu = _global.get('ctxMenu'),
        $menu_ = ctxMenu.getMenuByHeader('launcher');
    $view.on('click', function(e) {
      _this._controller.onClick();
      _this._parent.toggle();
    }).on('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      ctxMenu._rightObjId = _this.getID();
      var w = $menu_.width(),
          h = $menu_.height(),
          left_ = (document.body.clientWidth < e.clientX + w) 
              ? (e.clientX - w) : e.clientX,
          top_ = ($(document).height()< e.clientY + h + 25) 
              ? (e.clientY - h - 10)  : e.clientY;
      ctxMenu.show($menu_, left_, top_);
    });
  },

  show: function($parent) {
    $parent.append(this.$view);
   
    var cg = this._model.getCategory();
    if(typeof cg !== 'undefined') {
      this.$view2 = this.$view.clone();
      this.initAction(this.$view2);
      this._contents[_global._App_Cate[cg]].content.append(this.$view2);
    }
  },

  hide: function() {
    this.$view.remove();
    if(this.$view2 != null) this.$view2.remove();
  }
});

var DeviceListView = View.extend({
  init: function(model_, parent_) {
    this.callSuper('device-list', model_, parent_);
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'device-list',
      'id': this._id
    }).append($('<p>', {
      'class': 'title'
    }).text('Online Users').on('mouseenter', function(e) {
      e.stopPropagation();
    }).on('mouseleave', function(e) {
      e.stopPropagation();
    }));
    this._c = [];
    this.initAction();
    this._shown = false;
  },
  
  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'add': function(err_, dev_) {
        // TODO: create a device entry view with the dev_ model object
        if(err_) {
          console.log(err_);
          return ;
        }
        _this._c[dev_.getID()] = AccountEntryView.create(dev_.getID(), dev_, _this);
        _this._c[dev_.getID()].show(_this.$view);
      },
      'remove': function(err_, dev_){
        // TODO: delete the device entry view associated by dev_
        if(err_) {
          console.log(err_);
          return ;
        }
        _this._c[dev_.getID()].destroy();
        _this._c[dev_.getID()] = null;
        delete _this._c[dev_.getID()];
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function() {
    var _this = this;
    var enter = function() {
      _this.$view.animate({
        'left': '0'
      }, 300);
    };
    var leave = function() {
      _this.$view.animate({
        'left': _this._left
      }, 300);
    }
    var toggle = function(ev) {
      if(_this._shown) {
        if(ev.clientX > _this.$view.width()) {
          leave();
          _this._shown = false;
        }
      } else {
        if(ev.clientX < _this.$view.position().left + _this.$view.width()) {
          enter();
          _this._shown = true;
        }
      }
    }
    $(document).on('mousemove', function(ev) {
      toggle(ev);
    });
    this.$view/* .on('mouseenter', function(e) { */
      // enter();
    // }).on('mouseleave', function(e) {
      // leave();
    /* }) */.on('dragenter', function(e) {
      enter();
    })/* .on('dragleave', function(e) {   */
      // leave();
      // _this._shown = false;
    /* }) */.on('mousewheel', function(e) {
      var _scroll = this;
      if(typeof _this._wheel === 'undefined') {
        $(_scroll).css('overflow', 'auto');
      }
      clearTimeout(_this._wheel);
      _this._wheel = setTimeout(function() {
        $(_scroll).css('overflow', 'hidden');
        _this._wheel = undefined;
      }, 400);
      e.stopPropagation();
    });
  },

  show: function($parent) {
    $parent.append(this.$view);
    this._left = this.$view.position().left;
  }
});

var AccountEntryView = View.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
    this.registObservers();
    this.$view = $('<div>').append($('<div>', {
      'class': 'icon',
      'id': this._id
    }).html(
      "<img draggable='false' src='" + this._model.getImgPath() + "'/>" + 
      "<p>" + this._model.getName() + "</p>"
    ).css({
      'color': '#FFF',
    })).append($('<div>', {
      'class': 'acc-devlist'
    }));
    this.initAction();
    this._controller = EntryController.create(this);
    this._devListShown = false;
    this._c = [];
  },

  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'add': function(err_, dev_) {
        if(err_) return console.log(err_);
        // TODO: add a dev entry under this account
        _this._c[dev_.getID()] = DevEntryView.create(dev_.getID(), dev_, _this);
        _this._c[dev_.getID()].show(_this.$view.find('.acc-devlist'));
      },
      'remove': function(err_, dev_) {
        if(err_) return console.log(err_);
        // TODO: remove a dev entry from this account
        _this._c[dev_.getID()].destroy();
        _this._c[dev_.getID()] = null;
        delete _this._c[dev_.getID()];
      },
      'name': function(err_, name_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        _this.$view.children('p').text(name_);
        // $('#' + _this._id + ' p').text(name_);
      },
      'imgPath': function(err_, imgPath_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        _this.$view.children('img').attr('src', imgPath_);
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function() {
    var _this = this;
    _this.$view.find('#' + _this._id).on('click', function(e) {
      e.stopPropagation();
      _this.toggleDevList();
    }).on('mouseenter', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('mouseleave', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('dragenter', function(e) {
      e.stopPropagation();
      e.preventDefault();
      if(!_this._devListShown) {
        _this.toggleDevList();
      }
    }).on('dragleave', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('dragover', function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      ev.originalEvent.dataTransfer.dropEffect = 'copy';
    }).on('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
      _this._controller.onDrop(e, _this._parent._parent._c['layout']._selector.getSelectedItems());
    }).dblclick(function(e) {
      e.stopPropagation();
      _this._controller.onDblclick();
    });
  },

  show: function($parent) {
    $parent.append(this.$view);
  },

  hide: function() {
    this.$view.remove();
  },

  toggleDevList: function() {
    var _this = this;
    if(!this._devListShown) {
      this.$view.find('.acc-devlist').show('blind', {}, 500, function() {
        _this._devListShown = true;
      });
    } else {
      this.$view.find('.acc-devlist').hide('blind', {}, 500, function() {
        _this._devListShown = false;
      });
    }
  }
});

var DevEntryView = View.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'icon',
      'id': this._id
    }).html("<img draggable='false' src='"
      + this._model.getImgPath() + "'/><p>"
      + this._model.getName()
      + "</p>").css({
      'color': '#FFF',
    });
    this.initAction();
    this._controller = EntryController.create(this);
  },

  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'name': function(err_, name_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        _this.$view.children('p').text(name_);
        // $('#' + _this._id + ' p').text(name_);
      },
      'imgPath': function(err_, imgPath_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        _this.$view.children('img').attr('src', imgPath_);
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function() {
    var _this = this;
    this.$view.on('mouseenter', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('mouseleave', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('dragenter', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('dragleave', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('dragover', function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      ev.originalEvent.dataTransfer.dropEffect = 'copy';
    }).on('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
      _this._controller.onDrop(e
        , _this._parent._parent._parent._c['layout']._selector.getSelectedItems());
    }).dblclick(function(e) {
      e.stopPropagation();
      _this._controller.onDblclick();
    });
  },

  show: function($parent) {
    $parent.append(this.$view);
  },

  hide: function() {
    this.$view.remove();
  }
});

// View of Dock component
//
var DockView = View.extend({
  init: function(model_, parent_) {
    this.callSuper(model_.getID(), model_, parent_);
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'dock',
      'id': this._id,
      'onselectstart': 'return false'
    });
    this.initAction(this.$view);
    this.initCtxMenu();
    this._c = [];
    this._controller = DockController.create(this);
  },

  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'add': function(err_, dockApp_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        var _id = dockApp_.getID() + '-dock';
        _this._c[_id] = DockEntryView.create(_id, dockApp_, _this).show(_this.$view);
      },
      'remove': function(err_, dockApp_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        var _id = dockApp_.getID() + '-dock';
        _this._c[_id].destroy();
        _this._c[_id] = null;
        delete _this._c[_id];
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function($selector) {
    var _this = this,
        dock = $selector,
        IMGART = 50,
        _imgMaxWidth = IMGART * 2,
        _imgMaxHeight = IMGART * 2,
        _distance = IMGART * 3.5;

    $selector.on('drop', function(ev) {
      _this.drop(ev);
    })
    $(document).on('mousemove', function(ev) {
      var ev = ev || window.event,
          divList = dock.children('div'),
          canvasList = $('#dock div canvas');
      // ev.stopPropagation();
      for(var i = 0; i < divList.length; i++) {
        var jqImg = $(divList[i]).children('img'),
            a = ev.clientX - (jqImg.position().left + jqImg.width() / 2),
            b = ev.clientY - (jqImg.position().top + jqImg.height() / 2 + dock.position().top),
            c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)),
            spex = 1 - c / _distance;

        if(spex < 0.5) {
          spex = 0.5;
        }
        if (typeof canvasList[i] !== 'undefined') {
          canvasList[i].style.width = spex * (_imgMaxWidth) + 'px';
        }
        divList[i].style.width = spex * (_imgMaxWidth) + 'px';
        jqImg[0].style.width = spex * (_imgMaxWidth) + 'px';
        jqImg[0].style.height = spex * (_imgMaxHeight) + 'px';
      }
    }).on('dragover', this.dragOver)
    .on('dragleave', this.dragLeave);
  },

  initCtxMenu: function() {
    var _this = this,
        ctxMenu = _global.get('ctxMenu');
    ctxMenu.addCtxMenu([
      {header: 'dock'},
      {text: 'property', action: function(e) {
        e.preventDefault();
        var id_ = /([\w-_\s\.]+)-dock$/.exec(ctxMenu._rightObjId);
        PropertyView.create(id_[0], _this._model.getCOMById(id_[1]), _this._model).show();
      }},
      {text: 'add reflect', action: function() {
        _this.addReflect();
      }},
      {text: 'remove reflect', action: function() {
        _this.removeReflect();
      }},
      {text: 'delete', action: function() {
        _this._c[ctxMenu._rightObjId]._controller.onEntryDelete();
      }}
    ]);
  },

  show: function($parent) {
    $parent.append(this.$view);
  },

  toggle: function(show_) {
    if(!show_) {
      this.$view.hide();
    } else {
      this.$view.show();
    }
  },

  addReflect: function() {
    this.$view.find('img').each(function() {
      Reflection.create(this, {hasParentDiv: true}).add();
    });
    var ctxMenu = _global.get('ctxMenu'),
        _this = this;
    ctxMenu.activeItem('dock', 'remove reflect', function() {
      _this.removeReflect();
    });
    ctxMenu.disableItem('dock', 'add reflect');
  },

  removeReflect: function() {
    this.$view.children('div').each(function() {
      $(this).children('img')[0].style.cssText = '';
      $(this).removeClass('reflect').children('canvas').remove();
    });
    var ctxMenu = _global.get('ctxMenu'),
        _this = this;
    ctxMenu.activeItem('dock', 'add reflect', function() {
      _this.addReflect();
    });
    ctxMenu.disableItem('dock', 'remove reflect');
  },

  dragLeave: function(ev) {
    if(ev.originalEvent.clientY < $('#dock').position().top) {
      if (typeof $('#insert')[0] != 'undefined') 
        $('#insert').remove();
    }
  },

  drop: function(e) {
    var ev = e.originalEvent;
    ev.preventDefault();
    ev.stopPropagation();
    
    var __id = ev.dataTransfer.getData("ID"),
        _id = /([\w-_\s\.]+)-dock$/.exec(__id);
    if(_id == null) _id = {'1': __id};
    var  _source = $('#' + _id[1]),
        desktop = _global.get('desktop'),
        layout = desktop.getCOMById('layout').getCurLayout(),
        widget = layout.getWidgetById(_id[1]),
        dock = desktop.getCOMById('dock'),
        dockApp = dock.getCOMById(_id[1]);

    if(typeof dockApp !== 'undefined') {
      var _divList = $('#dock div');
      for (var i = 0; i < _divList.length; i++) {
        this._c[_divList[i].id]._model.setIdx(i);
      };
    } else {
      var _divList = $('#dock div'),
          idx = 0;
      for (var i = 0; i < _divList.length; i++) {
        if (_divList[i].id == 'insert') {
          $(_divList[i]).remove();
          idx = i;
          break ;
        }
      }
      if(typeof widget !== 'undefined'
          && (widget.getType() == 'app' || widget.getType() == 'inside-app')) {
        /* if(typeof dockApp !== 'undefined') { */
          // alert("The App has been registed in dock");
          // return ;
        /* } */
        
        // var _filename = widget.getFilename();
        widget.setIdx(idx);
        /* _global._fs.rename(desktop._desktopWatch.getBaseDir() + '/' + _filename */
            // , dock._dockWatch.getBaseDir() + '/' + _filename
            /* , function() {}); */
        // change to unlink and link
        this._controller.onAppDrop(widget);
      } else if(ev.dataTransfer.files.length != 0) {
        // TODO: what for?
        /* var _files = ev.dataTransfer.files; */
        // for(var i = 0; i < _files.length; ++i) {
          // var dst = dock._dockWatch.getBaseDir() + '/' + _files[i].name;
          // if(_files[i].path == dst) continue;
          // _global._fs.rename(_files[i].path, dst, function() {});
        // }
        /* return ; */
      }
    }
  }
});

var DockEntryView = View.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
    // this._container = container_;
    this._controller = DockEntryController.create(this);
    this.registObservers();
    this.$view = $('<div>', {
      'id': this._id,
      'draggable': 'true',
      'onselectstart': 'return false'
    }).append($('<img>', {
      'id': this._id + '-img',
      'draggable': 'false',
      'src': model_.getImgPath(),
      'title': model_.getName(),
      'onselectstart': 'return false'
    }));
    this.initAction(this.$view);
    return this;
  },

  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'imgPath': function(err_, imgPath_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        _this.$view.children('img').attr('src', imgPath_);
      },
      'name': function(err_, name_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        _this.$view.children('img').attr('title', name_);
      }
    };

    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function($selector) {
    var _this = this;
    $selector.mousedown(function(e) {
      e.stopPropagation();
    }).mouseup(function(e) { 
      e.stopPropagation();
    }).click(function(e) {
      var image = _this.$view.children('img');
      var _canvas = _this.$view.children('canvas');
      if(image[0].style.borderStyle == "" || image[0].style.borderStyle == 'none') {
        image.animate({width:"+=40px",height:"+=40px"}, 'fast')
          .animate({width:"-=40px",height:"-=40px"}, 'fast');
        _this.$view.animate({width:"+=40px"}, 'fast')
          .animate({width:"-=40px"}, 'fast');
        if (_canvas.length != 0) {
        _canvas.animate({width:"+=40px"}, 'fast')
          .animate({width:"-=40px"}, 'fast');
        };
        $('.tooltip').animate({top:"-=40px"}, 'fast')
          .animate({top:"+=40px"}, 'fast')
          .animate({top:"-=40px"}, 'fast')
          .animate({top:"+=40px"}, 'fast')
          .animate({top:"-=40px"}, 'fast')
          .animate({top:"+=40px"}, 'fast');
        image.css("border", "outset");
        _this._controller.onClick();
        image.css("border", "none");
      }
    }).on('mouseover', function(ev) {
      _this.mouseOver(ev);
    }).on('mouseout', function(ev) {
      _this.mouseOut(ev);
    }).on('mousemove', function(ev) {
      _this.mouseMove(ev);
    }).on('dragenter', function(ev) {
      ev.stopPropagation();
    }).on('dragover', function(ev) {
      _this.dragOver(ev);
    }).on('drop', function(ev) {
      _this.drop(ev);
    }).on('dragstart', this.drag);

    var ctxMenu = _global.get('ctxMenu');
    ctxMenu.attachToMenu('#' + this.getID()
        , ctxMenu.getMenuByHeader('dock')
        , function(id_) {ctxMenu._rightObjId = id_});
    ctxMenu.disableItem('dock', 'remove reflect');
  },

  show: function($parent) {
    var divList = $parent.children('div'),
        inserted = false,
        n_idx = this._model.getIdx();

    if(n_idx == -1) {
      $parent.append(this.$view);
      this._model.setIdx(divList.length);
    } else {
      for(var i = 0; i < divList.length; ++i) {
        var model = this._parent._c[divList[i].id]._model,
            o_idx = model.getIdx();
        if(n_idx <= o_idx && !inserted) {
          $(divList[i]).before(this.$view);
          inserted = true;
          if(n_idx < o_idx) break;
        }
        if(inserted) model.setIdx(i + 1);
      }
      if(!inserted) $parent.append(this.$view);
    }
    
    return this;
  },

  hide: function() {
    this.$view.remove();
  },

  drag: function(ev) {
    // $(ev.currentTarget).children('img')[0].title = this._model.getName(); 
    $('.tooltip').remove();
    console.log("drag start");
    ev.originalEvent.dataTransfer.setData("ID", ev.originalEvent.currentTarget.id);
    console.log(ev.originalEvent.dataTransfer.getData("ID"));
    ev.stopPropagation();
  }, 

  dragOver: function(e) {
    var ev = e.originalEvent;
    ev.preventDefault();
    ev.stopPropagation();
    var __id = ev.dataTransfer.getData("ID"),
        _id = /([\w-_\s\.]+)-dock$/.exec(__id);
    if(_id == null) _id = {'1': __id};
    // if(this._id == _id[1]) return ;
    //show insert position picture
    var _source = null,
        desktop = _global.get('desktop'),
        layout = desktop.getCOMById('layout').getCurLayout(),
        widget = layout.getWidgetById(_id[1]),
        dock = desktop.getCOMById('dock'),
        dockApp = dock.getCOMById(_id[1]);

    if(typeof dockApp !== 'undefined') {
      // drag to change a dockApp entry's position in dock
      _source = ((typeof _id[0] === 'undefined') ? $('#' + __id + '-dock') : $('#' + __id));
    } else if((typeof widget != 'undefined'
        && (widget.getType() == 'app' || widget.getType() == 'inside-app'))
        /* || ev.dataTransfer.files.length != 0 */) {
      // drag a desktop entry to dock
      if (typeof $('#insert')[0] == 'undefined') {
        _source = $('<div>', {
          'id': 'insert'
        }).html("<img src='img/insert.gif'/>");
      } else {
         _source = $('#insert');
      }
    } else {
      // TODO: handle launcher app entry!!
      return ;
    }

    if(ev.clientX < this.$view.position().left + this.$view.width() / 2) {
      this.$view.before(_source);
    } else {
      this.$view.after(_source);
    }
  },

  drop: function(ev) {
    ev.preventDefault();
    this._controller.onDrop(ev, this._parent._parent._c['layout']._selector.getSelectedItems());
  },

  mouseOver: function(ev) {
    ev.stopPropagation();
    var _image = this.$view.children('img');
    /* var isTitle = false; */
    // if(this.noTitle) { 
      // isTitle = true;
    // } else { 
      // isTitle = $.trim(this._image[0].title) != '';
    // } 
    /* if(isTitle) {  */
      // this.myTitle = this._image[0].title; 
      // this._image[0].title = ""; 
      var tooltip = "<div class='tooltip'> <div id='title-inner' class='tipsy-inner'>"
        + _image[0].title/* this.myTitle */ + "</div> </div>"; 
      $('body').append(tooltip); 
      $('.tooltip').css({
        "top" : ($(ev.target).offset().top - 25) + "px", 
        "left" : ($(ev.target).offset().left) + "px" 
      }).show('fast');
     // }
  },

  mouseOut: function() {
    // if(this.myTitle != null) { 
    // var _image = this.$view.children('img');
      // _image[0].title = this._model.getName(); 
      $('.tooltip').remove();
    // }
  },

  mouseMove: function(ev) {
    var t_width = $(ev.target).width();
     var _width = $('#title-inner').width();
     var left = $(ev.target).offset().left + (t_width - _width) / 2 - 5;
     $('.tooltip').css({
      "top" : ($(ev.target).offset().top - 25) + "px", 
      "left" : left + "px" 
    });
  }
});

var PropertyView = View.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
    this._id = id_;
    this._isMouseDown = false;    //flag mouse is down or not  
    this._offsetX = 0;            //record mouse-x relate property-div left   
    this._offsetY = 0;            //record mouse-y relate property-div top
    this._imgPath = undefined;

    // main div
    this.$view = $('<div>', {
      'class': 'property',
      'id': id_ + '-property',
      'z-index': '10000'
    });
    
    // title 
    this.$view.append($('<h2>',{
      'id': id_ + '-title',
      'text': this._model.getName() + ' ' + '属性'
    }));

    // content
    this._tab = Tab.create('property-tab',['basic', 'power']);
    this._tab.injectParent(this.$view);

    this._tab.addDivByTab($('<div>', {
      'class': 'iconcontent',
      'id': this._id + '-icon'
    }).append($('<img>',{
      'class':'imgcontent',
      'id':this._id + '-imgproperty'
    })), 'basic');

    this._tab.addDivByTab($('<div>', {
      'class': 'basicinfocontent',
      'id': this._id + '-basicinfo'
    }), 'basic');
    
    // button 
    this.$view.append($('<button>',{
      'class': 'btn',
      'id': this._id + '-close',
      'text': 'CLOSE'
    }).addClass('active'));

    this.registObservers();
    this.initAction();
  },

  registObservers: function() {
    var $bContent = this.$view.find('.basicinfocontent'),
        _this = this;
    _this.__handlers = {
      'imgPath': function(err_, imgPath_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        _this.$view.find('.imgcontent').attr('src', _this._model.getImgPath());
      },
      'name': function(err_, name_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        $bContent.find('#name').html(name_);
      },
      'cmd': function(err_, cmd_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        $bContent.find('#cmd').html(cmd_);
      },
      'comment': function(err_, comment_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        $bContent.find('#comment').html(comment_);
      },
      'genericName': function(err_, genericName_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        $bContent.find('#gname').html(genericName_);
      },
      'path': function(err_, path_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        $bContent.find('#path').html(path_);
      }
    };

    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function() {
    var _this = this;

    //property animate and remove();
    _this.$view.children('button').click(function(e) {
      if (e.target.id.split('-')[0] !== 'event') {
        var _pos = {top: 0, left: 0};
        if (typeof $('#' + _this._id).offset() !== 'undefined') {
          _pos = $('#' + _this._id).offset();
        } else {
          _pos = $('#' + _this._id + '-icon').offset();
        }
        _this.$view.animate({
          top: _pos.top,
          opacity: 'hide',
          width: 0,
          height: 0,
          left: _pos.left
        }, 500, function() {
          _this.destroy();
        });
      }
    });

    //drag function 
    _this.$view.children('h2').mouseover(function(ev) {
      $(this).css('cursor','move');
    }).mousedown(function(ev) {
      ev.stopPropagation();
      _this._isMouseDown = true;
      _this._offsetX = ev.offsetX;
      _this._offsetY = ev.offsetY;
      console.log('x:' +_this._offsetX + '  y: ' + _this._offsetY );
      _this.$view.fadeTo(20, 0.5);
    }).mouseup(function(ev) {
      ev.stopPropagation();
      _this._isMouseDown = false;
      _this.$view.fadeTo(20, 1);
    });

    /* _this.$view.mousedown(function(ev) { */
      // ev.stopPropagation();
    // }).mouseup(function(ev){
      // ev.stopPropagation;
    /* }); */

    $(document).mousemove(function(ev){
      if(!_this._isMouseDown) return ;
      var x = ev.clientX - _this._offsetX; 
      // console.log('ev.x: '+ev.clientX + '   this:x '+_this._offsetX + '  x: ' + x);
      var y = ev.clientY - _this._offsetY; 
      // console.log('ev.y: '+ev.clientY + '   this:y '+_this._offsetY + '  y: ' + y);
      _this.$view.css({
        "left": x,
        "top": y
      }).children('h2').css('cursor', 'move');
    });
  },

  show: function() {
    $('body').append(this.$view);

    if(this.$view.is(":visible") == false) {
      this.$view.css({
        'position': 'absolute',
        'width': '0px',
        'height': '0px'
      });
      var $tarObj = $('#' + this._id),
          left_ = $tarObj.offset().left + $tarObj.width() / 2,
          top_ = $tarObj.offset().top + $tarObj.height() / 2;
      this.$view.css({
        'left': left_ + 'px',
        'top': top_+'px'
      }).show();
      var box_width = $(window).width() / 4,
          box_height = $(".property .tab-show .tab-content").height() * 3 / 2.1,
          top_property = $(window).height() / 2 - box_height / 2,
          left_property = $(window).width() / 2 - box_width / 2,
          _this = this;
      this.$view.animate({
        top: top_property,
        opacity: 'show',
        width: box_width,
        height: box_height,
        left: left_property
      }, 500, function() {
        var type = _this._model.getType();
        if(type == 'app' || type == 'inside-app')
          _this.setAppProperty(type);
        _this.setBasicProperty(type);
        _this._tab.setShowByTab('basic');
      });
    }
  },

  hide: function() {
    this.$view.remove();
  },

  setAppProperty: function(type_) {
    if(type_ == 'inside-app') {
      this.$view.find('.basicinfocontent')
        .append("<p>▪名称:  <span id='name'>" + this._model.getName() + "</span></p>")
        .append("<p>▪类型:  <span id='type'>" + type_ + "</span></p>")
        .append("<p>▪位置:  <span id='path'>" + this._model.getPath() + "</span></p>");
    } else {
      this.$view.find('.basicinfocontent')
        .append("<p>▪名称:  <span id='name'>" + this._model.getName() + "</span></p>")
        .append("<p>▪命令:  <span id='cmd'>" + this._model.getCmd() + "</span></p>")
        .append("<p>▪描述:  <span id='comment'>" + this._model.getComment() + "</span></p>")
        .append("<p>▪备注:  <span id='gname'>" + this._model.getGenericName() + "</span></p>")
        .append("<p>▪位置:  <span id='path'>" + this._model.getPath() + "</span></p>");
    }
    this.$view.find('.imgcontent').attr('src', this._model.getImgPath());
  },

  setBasicProperty: function(type_) {
    if(type_ != 'inside-app') {
      var _this = this;
      //get some basic inform and access inform
      _global.get('utilIns').entryUtil.getProperty(
          _global.$home + '/.resources/desktop/data/applications/' + _this._model.getPath()
          , function(err_, attr_) {
        if(typeof attr_ == 'undefined') {
          console.log('get Property err');
          return ;
        }
        var fileType = null;
        switch(attr_['access'][0]){
          case '-': 
            fileType = '普通文件';
            break ;
          case 'd':
            fileType = '文件夹';
            break ;
          case 'b':
            fileType = '块特殊文件';
            break;
          case 'c':
            fileType = '字符特殊文件';
            break ;
          case 'l':
            fileType = '连接';
            break ;
          case 'p':
            fileType = '命名管道（FIFO）';
            break ;
          default:
            break ;
        }
        _this.$view.find('.basicinfocontent')
          .append("<p><span>▪</span>文件大小:  " + attr_['size'] + "</p>")
          .append("<p><span>▪</span>文件类型:  " + fileType + "</p>")
          .append("<p><span>▪</span>访问时间:  " + attr_['access_time'] + "</p>")
          .append("<p><span>▪</span>修改时间:  " + attr_['modify_time'] + "</p>");
        
        var power = '',
            _access = attr_['access'],
            checkPower = function(power_) {
              power = '';
              if (power_[0] == 'r') {power += '读'}
              if (power_[1] == 'w') {power += '写'};
              if (power_[2] == 'x') {power += '执行'}
              else if (power_[2] == 's') {power += '超级执行'};
              if (power != '') {power += '权限'};
            };
        checkPower(_access.substr(1, 3));
        _this._tab.addDivByTab("<p><span>▪</span>所有者:  " + attr_['uid'] + "</p>", 'power');
        _this._tab.addDivByTab("<p>&nbsp;&nbsp;&nbsp;权限:  " + power + "</p>",'power');
        checkPower(_access.substr(4, 3));
        _this._tab.addDivByTab("<p><span>▪</span>用户组:  " + attr_['gid'] + "</p>", 'power');
        _this._tab.addDivByTab("<p>&nbsp;&nbsp;&nbsp;权限:  " + power + "</p>", 'power');
        checkPower(_access.substr(7, 3));
        _this._tab.addDivByTab("<p><span>▪</span> 其他:  </p>", 'power');
        _this._tab.addDivByTab("<p>&nbsp;&nbsp;&nbsp;权限:  " + power + "</p>", 'power');
      });
    } else {
      this._tab.addDivByTab("<p>&nbsp;&nbsp;&nbsp;权限: 可执行</p>", 'power');
    }
  }
});

var Selector = Class.extend({
  // @container_: which container object's items to be selected
  // @selector_: which component should be response to mouse events and draw the selector
  // @events_: which is an events object to binding to specific key include 'enter', 'up',
  //            'down', 'left', 'right', 'clear'(for clear the state of 'tab-index')
  // Note that: 1. Items of this container should have functions called 'focus', 'blur' and 
  //              'getView' which is for getting the jquery object of item's view.
  //            2. The container object should have a function called 'getSelectableItems'.
  //
  init: function(container_, selector_, events_) {
    this.$view = $('<div>', {
      'id': 'd-selector'
    }).css({
      'z-index': '9999',
      'display': 'none',
      'position': 'absolute',
      'border': '2px solid black',
      'border-radius': '5px',
      'background-color': '#A9A9A9',
      'opacity': '0.5',
      'cursor': 'default'
    });
    $('body').append(this.$view);
    this._c = container_;
    // this._items = container_.getSelectableItems();
    this._selector = selector_ || 'html';
    this._events = events_ || {};
    this._selectedEntries = [];
    this._selectedEntries['hasEntry'] = function(id_) {
      for(var i = 0; i < this.length; ++i) {
        if(this[i] != null && this[i]._id == id_) return true;
      }
      return false;
    };
    this._mouseDown = false;
    this._s_X = 0;
    this._s_Y = 0;

    var _view = container_.getView(),
        _pos = _view.position(),
        _width = _view.width(),
        _height = _view.height();
    this._c_SX = _pos.left;
    this._c_SY = _pos.top;
    this._c_EX = _pos.left + _width;
    this._c_EY = _pos.top + _height;

    var _this = this;
    $(document).on('mousedown', this._selector, function(e) {
      // e.stopPropagation();
      e.preventDefault();
      if(e.which == 1) {
        if(!e.ctrlKey) {
          if(typeof _this._events['clear'] != 'undefined')
              _this._events['clear'].call();
          _this.releaseSelectedEntries();
        }
        _this._mouseDown = true;
        _this._s_X = e.pageX;
        _this._s_Y = e.pageY;
        _this.$view.css({
          'left': e.pageX,
          'top': e.pageY,
        }).show();
      }
    }).on('keydown', 'html', function(e) {
      var _items = container_.getSelectableItems();
      switch(e.which) {
        case 9:    // tab
          if(!e.ctrlKey) {
            _this.releaseSelectedEntries();
          } else {
            console.log('Combination Key: Ctrl + Tab');
          }
          if(e.shiftKey) {
            if(typeof _this._events['up'] != 'undefined')
              _this._events['up'].call();
          } else {
            if(typeof _this._events['down'] != 'undefined')
              _this._events['down'].call();
          }
          /* if(e.shiftKey) { */
            // desktop._tabIndex += desktop._dEntrys.length() - 1;
          // } else {
            // desktop._tabIndex++;
          // }
          // desktop._tabIndex %= desktop._dEntrys.length();
          // var _entry = desktop._dEntrys._items[desktop._tabIndex];
          /* if(_entry != null) _entry.focus(); */
          break;
        case 13:  // enter
          if(typeof _this._events['enter'] != 'undefined')
            _this._events['enter'].call();
          break;
        case 17:  // ctrl
          _this._ctrlKey = true;
          break;
        case 37:  // left
          console.log('left');
          if(typeof _this._events['left'] != 'undefined')
            _this._events['left'].call();
          break;
        case 38:  // up
          console.log('up');
          if(!e.ctrlKey) 
            _this.releaseSelectedEntries();
          if(typeof _this._events['up'] != 'undefined')
            _this._events['up'].call();
          break;
        case 39:  // right
          console.log('right');
          if(typeof _this._events['right'] != 'undefined')
            _this._events['right'].call();
          break;
        case 40:  // down
          console.log('down');
          if(!e.ctrlKey) 
            _this.releaseSelectedEntries();
          if(typeof _this._events['down'] != 'undefined')
            _this._events['down'].call();
          break;
        case 65:  // a/A
          if(e.ctrlKey) {
            console.log('Combination Key: Ctrl + a/A');
            for(var i = 0; i < _items.length; ++i) {
              if(_items[i] != null)
                _items[i].focus();
            }
          }
          break;
        default:
      }
    }).on('keyup', 'html', function(e) {
      switch(e.which) {
        case 17:  // ctrl
          _this._ctrlKey = false;
          break;
      }
    });
    $(window).on('mouseup', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if(e.which == 1) {
        _this._mouseDown = false;
        _this.$view.hide().css({
          'width': '0px',
          'height': '0px'
        });
      }
    }).on('mousemove', function(e) {
      /* e.preventDefault(); */
      /* e.stopPropagation(); */
      if(!_this._mouseDown) return ;
      var x, y, _off = _this.$view.offset(),
          _items = container_.getSelectableItems();
      x = (e.pageX < _this._c_SX) ? _this._c_SX : e.pageX;
      x = (x > _this._c_EX) ? _this._c_EX : x;
      y = (e.pageY < _this._c_SY) ? _this._c_SY : e.pageY;
      y = (y > _this._c_EY) ? _this._c_EY : y;
      if(x < _this._s_X) 
        _off.left = x;
      if(y < _this._s_Y)
        _off.top = y;
      _this.$view.css({
        'top': _off.top,
        'left': _off.left,
        'width': Math.abs(x - _this._s_X),
        'height': Math.abs(y - _this._s_Y)
      });
      if(!e.ctrlKey)
        _this.releaseSelectedEntries();
      for(var i = 0; i < _items.length; ++i) {
        if(_items[i] != null
          && _this.isOverlap({
            left: _off.left,
            top: _off.top,
            left_e: _off.left + _this.$view.width(),
            top_e: _off.top + _this.$view.height()
          }, _items[i].getView())) {
          _items[i].focus();
        }
      }
    })
  },

  isOverlap: function(selector_, $entry_) {
    var _d_off = $entry_.offset(),
        _d_off_e = {
          left: _d_off.left + $entry_.width(),
          top: _d_off.top + $entry_.height()
        };
    var isIn = function(pos) {
      return (selector_.left < pos.left && selector_.top < pos.top
        && selector_.left_e > pos.left && selector_.top_e > pos.top);
    }
    var topLeft = isIn({left: _d_off.left, top: _d_off.top});
    var topRight = isIn({left: _d_off_e.left, top: _d_off.top});
    var bottomLeft = isIn({left: _d_off.left, top: _d_off_e.top});
    var bottomRigth = isIn({left: _d_off_e.left, top: _d_off_e.top});
    return (topLeft || topRight || bottomLeft || bottomRigth);
  },

  releaseSelectedEntries: function() {
    while(this._selectedEntries.length > 0) {
      var _entry = this._selectedEntries.pop();
      if(_entry) _entry.blur();
    }
  },

  getSelectedItems: function() {
    return this._selectedEntries;
  }
});

var FlipperView = View.extend({
  init: function(model_, parent_, needSelector_) {
    this.callSuper(model_.getID(), model_, parent_);
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'view-flipper',
      'id': this._id,
      'draggable': 'false',
      'onselectstart': 'return false'
    }).append($('<div>', {
      'class': 'view-switch-bar',
      'onselectstart': 'return false'
    }).append($('<div>', {
      'class': 'icon-plus-squared'
    }).css({
      'display': 'inline-block',
      'cursor': 'pointer'
    })));
    this.initAction(this.$view);
    this._c = [];
    this._tabIdx = -1;
    this._needSelector = needSelector_ || false;
    this._controller = FlipperController.create(this);
    this._curMotion = 'fold';
    this._main = 0;
  },

  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'add': function(err_, widget_, init_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        var init = init_ || false;
        switch(widget_.getType()) {
          case 'grid':
            var l = _this._c.push(GridView.create(widget_.getID(), widget_, _this));
            _this._c[l - 1].show(_this.$view, init);
            _this.addASwitcher(_this._c[l - 1].getView(), init);
            break;
          default:
            break;
        }
      },
      'remove': function(err_, widget_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        switch(widget_.getType()) {
          case 'grid':
            var id = widget_.getID();
            for(var i = 0; i < _this._c.length; ++i) {
              if(id == _this._c[i].getID()) {
                _this._c[i].hide();
                _this.removeASwitcher(i);
                _this._c.splice(i, 1);
                break;
              }
            }
            break;
          default:
            break;
        }
      },
      'layout_size': function(err_, size_) {
        // redraw the layout container's size
        _this.$view.css({
          'width': size_.width,
          'height': size_.height
        });
      },
      'cur': function(err_, from_, to_) {
        if(err_ || to_ == -1) {
          console.log(err_);
          return ;
        }
        if(from_ == -1) {
          _this._c[to_].getView().show();
          var ss = _this.$view.find('.view-switcher');
          $(ss[ss.length - 1]).removeClass('showing');
          $(ss[to_]).addClass('showing');
        } else {
          _this._switchMotion[_this._curMotion](_this._c[from_].getView()
              , _this._c[to_].getView()
              , from_ - to_);
        }
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function($selector) {
    // switch motions
    // @$from: the jquary object of view shown now
    // @$to: the jquary object of view to be shown
    // @direction_: < 0 means left to right and > 0 means right to left
    //
    this._switchMotion = {
      'normal': function($from, $to, direction_, effect_) {
        var eff = effect_ || 'slide'
        $from.append($('<div>', {
          'class': 'addon-border'
        })).hide(eff, {}, 1000, function() {
          $from.remove('.addon-border');
          $to.append($('<div>', {
            'class': 'addon-border'
          })).show(eff, {}, 1000, function() {
            $to.children('.addon-border').fadeOut(function() {
              $to.remove('.addon-border');
            });
          });
        });
      },
      'puff': function($from, $to, direction_) {
        this.normal($from, $to, direction_, 'puff');
      },
      'fold': function($from, $to, direction_) {
        this.normal($from, $to, direction_, 'fold');
      },
      'shake': function($from, $to, direction_) {
        this.normal($from, $to, direction_, 'shake');
      },
      'smooth': function($from, $to, direction_, easing_) {
        var ease = easing_ || 'swing';
        $from.append($('<div>', {
          'class': 'addon-border'
        })).animate({
          'left': ((direction_ > 0) ? $from.width() : -$from.width())
        }, 1000, ease, function() {
          $from.removeAttr('style').hide().children('.addon-border').remove();
        });
        $to.append($('<div>', {
          'class': 'addon-border'
        })).css('left', ((direction_ > 0) ? -$to.width() : $from.width())).show().animate({
          'left': '0'
        }, 1000, ease, function() {
          $to.children('.addon-border').fadeOut(function() {
            $to.remove('.addon-border');
          });
        });
      },
      'bounce': function($from, $to, direction_) {
        this.smooth($from, $to, direction_, 'easeOutBounce');
      }
    };

    var _this = this;
    $selector.on('drag', function(e) {
      e.stopPropagation();
    }).find('.icon-plus-squared').on('mousedown', function(e) {
      e.stopPropagation();
      e.preventDefault();
      _this._controller.onAdd();
    });

    $(document).on('keydown', 'html', function(e) {
      var switchTo = function(i) {
        if(i >= _this._c.length) return ;
        var $switchers = _this.$view.find('.view-switcher');
        $($switchers[_this._model.getCur()]).removeClass('showing');
        $($switchers[i]).addClass('showing');
        _this._model.setCur(i);
      };
      switch(e.which) {
        case 37: // left
          if(!e.altKey) return ;
          switchTo((_this._model.getCur() + _this._c.length - 1) % _this._c.length);
          break;
        case 39: // right
          if(!e.altKey) return ;
          switchTo((_this._model.getCur() + _this._c.length + 1) % _this._c.length);
          break;
        case 48: // 0
          if(!e.altKey) return ;
          switchTo(_this._c.length - 1);
          break;
        case 49: // 1
          if(!e.altKey) return ;
          switchTo(0);
          break;
        case 50: // 2
          if(!e.altKey) return ;
          switchTo(1);
          break;
        case 51: // 3
          if(!e.altKey) return ;
          switchTo(2);
          break;
        case 52: // 4
          if(!e.altKey) return ;
          switchTo(3);
          break;
        case 53: // 5
          if(!e.altKey) return ;
          switchTo(4);
          break;
        case 54: // 6
          if(!e.altKey) return ;
          switchTo(5);
          break;
        case 55: // 7
          if(!e.altKey) return ;
          switchTo(6);
          break;
        case 56: // 8
          if(!e.altKey) return ;
          switchTo(7);
          break;
        case 57: // 9
          if(!e.altKey) return ;
          switchTo(8);
          break;
        case 84: // T/t
          if(!e.altKey) return ;
          _this._controller.onAdd();
          break;
        default:
          break;
      }
    });
  },

  show: function($parent) {
    $parent.append(this.$view);
    var _this = this;
    if(this._needSelector) {
      this._selector = Selector.create(this, '#' + this._id, {
        'enter': function() {
          var _items = _this.getSelectableItems();
          if(_this._tabIdx != -1 && _items[_this._tabIdx] != null)
            _items[_this._tabIdx]._controller.onDblclick();
        },
        'up': function() {
          var _items = _this.getSelectableItems();
          _this._tabIdx += _items.length - 1;
          _this._tabIdx %= _items.length;
          var _entry = _items[_this._tabIdx];
          if(_entry == null) {
            do{
              _this._tabIdx--;
              _entry = _items[0];
            } while(_entry == null);
          }
          _entry.focus(); 
        },
        'down': function() {
          var _items = _this.getSelectableItems();
          _this._tabIdx++; 
          _this._tabIdx %= _items.length;
          var _entry = _items[_this._tabIdx];
          if(_entry == null) {
            _this._tabIdx = 0;
            _entry = _items[0];
          } 
          _entry.focus(); 
        },
        'clear': function() {
          _this._tabIdx = -1;
        }
      });
    } else {
      this._selector = this._parent._selector;
    }
  },

  addASwitcher: function($view, init_) {
    var _this = this,
        $switcher = $('<div>', {
          'class': 'view-switcher showing'
        }).on('mousedown', function(e) {
          e.stopPropagation();
          e.preventDefault();
          var ss = _this.$view.find('.view-switcher');
          $(ss[_this._model.getCur()]).removeClass('showing');
          for(var i = 0; i < ss.length; ++i) {
            if(this == ss[i]) {
              $(this).addClass('showing');
              _this._model.setCur(i);
            }
          }
        });
    _this.$view.find('.showing').removeClass('showing');
    _this.$view.find('.icon-plus-squared').before($switcher);
    if(!init_) _this._model.setCur(_this.$view.find('.view-switcher').length - 1);
  },

  removeASwitcher: function(idx_) {
    var $ss = this.$view.find('.view-switcher');
    $($ss[idx_]).remove();
  },

  getMotions: function() {return this._switchMotion;},

  getCurSwitchMotion: function() {return this._curMotion;},

  setCurSwitchMotion: function(motionName_) {
    this._curMotion = motionName_;
  },

  getMainView: function() {return this._main;},

  setMainView: function(main_) {
    this._main = main_;
  },

  getCurView: function() {
    return this._c[this._model.getCur()];
  },

  getSelectableItems: function() {
    return this._c[this._model.getCur()].getSelectableItems();
  }
});
var UEditBox = Class.extend({
  init: function(toAccountInfo_, imChatWinList_) {
    this._fileTransList = {};
    var toAccount = toAccountInfo_.toAccount;
    var toIdentity = toAccount + toAccountInfo_.toUID;
    var toIP;
    var toUID;
    var localAccount;
    var localUID;
    var sendTime;
    var msgtime;
    var _this = this;
    this._imWindow = Window.create('imChat_' + toIdentity, toAccount, {
      height: 600,
      width: 640,
      max:false
    }, function() {
      this.getID = function() {
        return this._id;
      };
      _global._openingWindows.add(this);
      this.onfocus(function() {
        _global._openingWindows.focusOnAWindow(this._id);
      });
      var idstr = '#' + 'window-' +this._id+'-close';
      $(idstr).unbind();
      $(idstr).bind('mousedown',function(ev){
        ev.preventDefault();
        ev.stopPropagation();
      });
      $(idstr).bind('click',function(ev){
        ev.preventDefault();
        ev.stopPropagation();
      });
      $(idstr).bind('mouseup',function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        _this.closeBtnFunc(_this, toAccountInfo_, imChatWinList_);
      });
    });
    this.$view = $('<div class="imChat">').html('<div class="imLeftDiv">\
    <div class ="upLoadFile" ><input type="file" id="file_' + toIdentity + '" style="display:none"/>\
    <input type="image"  src="img/uploadFile.png" width=25px  height=25px id="file_button_' + toIdentity + '" /></div>\
    <div  id="disp_text_' + toIdentity + '" class="imChat_dataDiv"></div>\
    <div class="imChat_ueditorDiv" id="myEditor_' + toIdentity + '" ></div>\
    <div class="imChat_btnDiv"> \
    <button type="button" class="imCloseBtn" id="close_button_' + toIdentity + '">关闭</button> \
    <button type="button" class="imSendBtn" id="send_button_' + toIdentity + '">发送</button></div></div>\
    <div class="imRightDiv">\
    <div class="chatList" id="memList_' + toIdentity + '"  style="display:block">\
                    <div class="chatList_title">\
                        <label class="chatList_mem_t">\
                            成员列表</label>\
                    </div>\
                    <div class="chatList_content" id="memInfoCtn_' + toIdentity + '">\
                    </div>\
                </div>\
             <div class="chatList" id="fileTransShow_' + toIdentity + '"  style="display:none">\
                    <div class="chatList_title">\
                        <label class="chatList_acc_t">\
                            正在传输文件...</label>\
                    </div>\
                    <div class="chatList_content" id="fileTransCtn_' + toIdentity + '">\
                        <ul id="fileTransList_' + toIdentity + '">\
                        </ul>\
                    </div>\
                </div>\
            </div>');
    this._imWindow.append(this.$view);
    var toAccInfo;
/*    for (var i = 0; i < toAccountInfo_.toAccList.length; i++) {
      toAccInfo = toAccountInfo_.toAccList[i];
      $('#memInfoList_' + toIdentity).append('<li>\
                                <label class="online">\
                                </label>\
                                <a href="javascript:;">\
                                    <img src="img/2016.jpg"/></a><a href="javascript:;" class="chatList_name">' + toAccInfo['toAccount'] + '<br/>' + toAccInfo['toUID'] + '<br/>' + toAccInfo['toIP'] + '</a>\
                            </li>');
    }*/
    var deviceItems = [];
    for (var i = 0; i < toAccountInfo_.toAccList.length; i++) {
      toAccInfo = toAccountInfo_.toAccList[i];
      deviceItems[i] = {
        id: 'memItem_' + toAccInfo.toAccount + toAccInfo.toUID,
        type: "item",
        href: "",
        img: "img/2016.jpg",
        text: toAccInfo.toAccount + '<br/>'+ toAccInfo.toUID,
        clkaction: function() {}
      };
    }
    this._memListView = ListView.create('memInfoList_'+toIdentity, {'width':175});
    this._memListView.addItems(deviceItems);
    this._memListView.attach('memInfoCtn_'+toIdentity); 
    this._um = UE.getEditor('myEditor_' + toIdentity, {
      //这里可以选择自己需要的工具按钮名称
      toolbars: [
        ['bold', 'italic', 'underline', 'fontborder', 'strikethrough', '|', 'forecolor', 'backcolor', '|',
          'fontfamily', 'fontsize', '|',
          'emotion'
        ]
      ],
      //    lang:'zh-cn' ,//语言
      //focus时自动清空初始化时的内容
      autoClearinitialContent: true,
      //关闭字数统计
      wordCount: false,
      initialFrameWidth: 450,
      initialFrameHeight: 150,
      //更多其他参数，请参考umeditor.config.js中的配置项
      pasteImageEnabled: true, //ueditor
      emotionLocalization: true,
      //focus: true,
      catchRemoteImageEnable: false, //ueditor
      enableAutoSave: false,
      elementPathEnabled: false
      //autoClearEmptyNode : false
    });
    $('#close_button_' + toIdentity).on('click', function() {
       _this.closeBtnFunc(_this,toAccountInfo_,imChatWinList_);
    });
    $('#file_button_' + toIdentity).on('click', function() {
      var ie = navigator.appName == "Microsoft Internet Explorer" ? true : false;
      if (ie) {
        document.getElementById("file_" + toIdentity).click();
      } else {
        var a = document.createEvent("MouseEvents"); //FF的处理 
        a.initEvent("click", true, false);
        document.getElementById("file_" + toIdentity).dispatchEvent(a);
      }
      $('#file_' + toIdentity).on('change', function() {
        var fileUp = $('#file_' + toIdentity);
        fileUp.after(fileUp.clone().val(''));
        fileUp.remove();
        var val = fileUp.val();
        if (val !== '' && val !== undefined && val !== null) {
          function sendIMFileCb(err, fileTransMsg, val) {
            if (err) {
              Messenger().post('wenjianzainaer?');
            } else {
              var fileMsg = fileTransMsg.Msg;
              _this._fileTransList[fileMsg.key] = {
                'flag': 2,
                'path': val,
                'fileName': fileMsg.fileName,
                'fileSize':fileMsg.fileSize
              };
              fileTransMsg.Msg = JSON.stringify(fileMsg);
              _global._imV.SendAppMsg(function(mmm) {
                $('#memList_' + toIdentity).hide();
                $('#fileTransShow_' + toIdentity).show();
                $('#fileTransList_' + toIdentity).append('<li id="fileTransItem_' + fileMsg.key + '">\
                    <a href="javascript:;">\
                    <img src="img/uploadFile.png"/></a><a href="javascript:;" class="chatList_name">' + fileMsg.fileName + '<br/>大小：' + fileMsg.fileSize + '</a><br/>\
                    <span id="fileRatio_' + fileMsg.key + '"><span><br/><button type="button"  id="cancelFileItem_' + fileMsg.key + '" class="chatList_btn">取消</button>\
                    </li>');
                $('#cancelFileItem_' + fileMsg.key).on('click', function() {
                  _global._imV.transferCancelSender(function(rst) {
                    _this.fileItemTransRemove(_this._fileTransList, fileMsg.key, toIdentity);
                    var ratioLable = '您中止了传输文件："' + fileMsg.fileName + '"(大小：' + fileMsg.fileSize + ')。';
                    var msgtime = new Date();
                    var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
                    $('#disp_text_' + toIdentity).append('<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
                    $('#disp_text_' + toIdentity).scrollTop($('#disp_text_' + toIdentity).height());
                    var sendMsg = {};
                    sendMsg['IP'] = toAccountInfo_.toIP;
                    sendMsg['UID'] = toAccountInfo_.toUID;
                    sendMsg['Account'] = toAccount;
                    sendMsg['Msg'] = JSON.stringify(rst);
                    sendMsg['App'] = 'imChat';
                    _global._imV.SendAppMsg(function(mmm) {}, sendMsg);
                  }, fileMsg);
                });
              }, fileTransMsg);
            }
          }
          if (localAccount === undefined) {
            _global._imV.getLocalData(function(localData) {
              localAccount = localData.account;
              localUID = localData.UID;
            });
          }
          var sendMsg = {};
          sendMsg['IP'] = toAccountInfo_.toIP;
          sendMsg['UID'] = toAccountInfo_.toUID;
          sendMsg['Account'] = toAccount;
          sendMsg['Msg'] = val;
          sendMsg['App'] = 'imChat';
          //_global._imV.sendIMMsg(sendIMFileCb, ipset, toAccount, JSON.stringify(msgJson));
          _global._imV.sendFileTransferRequest(function(err, fileTransMsg) {
            sendIMFileCb(err, fileTransMsg, val);
          }, sendMsg);
        }
      });
    });
    $('#send_button_' + toIdentity).on('click', function() {
      if (_this._um.hasContents()) {
        var msg = _this._um.getContent();
        console.log('--------send_button_----------' + msg)

        function sendIMMsgCb() {
          $('#disp_text_' + toIdentity).append('<span class="accountFont"> ' + localAccount + '&nbsp;&nbsp;&nbsp;</span><span class="timeFont"> ' + sendTime + '  :</span><br/>' + msg);
          $('#disp_text_' + toIdentity).scrollTop($('#disp_text_' + toIdentity).height());
          _this._um.setContent('');
        }
        if (localAccount === undefined) {
          _global._imV.getLocalData(function(localData) {
            localAccount = localData.account;
            localUID = localData.UID;
          });
        }
        msgtime = new Date();
        sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
        //_global._imV.sendIMMsg(sendIMMsgCb, ipset, toAccount, msg);
        var sendMsg = {};
        sendMsg['IP'] = toAccountInfo_.toIP;
        sendMsg['UID'] = toAccountInfo_.toUID;
        sendMsg['Account'] = toAccount;
        sendMsg['Msg'] = msg;
        sendMsg['App'] = 'imChat';
        _global._imV.SendAppMsg(function(mmm) {
          console.log('----------------SendAppMsg');
          sendIMMsgCb();
        }, sendMsg);
      } else {}
    });
    if (toAccountInfo_.msg !== undefined) {
      _this.showRecDetail(toAccountInfo_, _this, false);
    }
  },
  showRec: function(toAccountInfo_, curEditBox_) {
    curEditBox_.showRecDetail(toAccountInfo_, curEditBox_, true);
  },
  showRecDetail: function(toAccountInfo_, curEditBox_, flag_) {
    var msg = toAccountInfo_.msg;
    var toIdentity = toAccountInfo_.toAccount + toAccountInfo_.toUID;
    if (msg.type === undefined) {
      var msgtime = new Date();
      var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
      $('#disp_text_' + toIdentity).append('<span  class="accountFont">' + toAccountInfo_.toAccount + '&nbsp;&nbsp;&nbsp;</span><span class="timeFont"> ' + sendTime + '  :</span><br/>' + msg);
      $('#disp_text_' + toIdentity).scrollTop($('#disp_text_' + toIdentity).height());
    } else {
      var sendMsg = {};
      sendMsg['IP'] = toAccountInfo_.toIP;
      sendMsg['UID'] = toAccountInfo_.toUID;
      sendMsg['Account'] = toAccountInfo_.toAccount;
      sendMsg['App'] = 'imChat';
      if (msg.type === 'file') {
        curEditBox_.showFileRecDetatil(curEditBox_, msg, sendMsg, toIdentity, flag_);
      }
    }
  },
  showFileRecDetatil: function(curEditBox_, msg, sendMsg, toIdentity, flag_) {
    switch (msg.option) {
      case 0x0000:
        { //收到发送端传输文件的请求------------界面显示
          if (msg.state === undefined) {
            if (flag_) {
              curEditBox_._fileTransList[msg.key] = {
                'flag': 0,
                'path': '',
                'fileName':msg.fileName,
                'fileSize':msg.fileSize
              };
              $('#memList_' + toIdentity).hide();
              $('#fileTransShow_' + toIdentity).show();
              $('#fileTransList_' + toIdentity).append('<li id="fileTransItem_' + msg.key + '">\
                  <a href="javascript:;">\
                  <img src="img/uploadFile.png"/></a><a href="javascript:;" class="chatList_name">' + msg.fileName + '<br/>大小：' + msg.fileSize + '</a><br/>\
                  <button type="button"  id="refuseFileItem_' + msg.key + '" class="chatList_btn">拒绝</button>\
                  <button type="button"  id="acceptFileItem_' + msg.key + '" class="chatList_btn">接收</button>\
                  </li>');
              $('#refuseFileItem_' + msg.key).on('click', function() {
                curEditBox_.fileItemTransRemove(curEditBox_._fileTransList, msg.key, toIdentity);
                curEditBox_.refuseFileItemTransfer(msg, sendMsg);
              });
              $('#acceptFileItem_' + msg.key).on('click', function() {
                curEditBox_.acceptFileItemTransfer(curEditBox_, msg, sendMsg, toIdentity, flag_);
              });
            } else {
              curEditBox_.acceptFileItemTransfer(curEditBox_, msg, sendMsg, toIdentity, flag_);
            }
          } else {
            curEditBox_.recieverAcceptOrRefuce(curEditBox_, msg, sendMsg, toIdentity);
          }
        }
        break;
      case 0x0001:
        { //收到发送端可以进行传输文件的响应      
          if (curEditBox_._fileTransList[msg.key] === undefined) {
            return;
          }
          if (msg.state === '0') { //不可以传输了------------界面显示  
            console.log('sender transfer file cancelled');
            curEditBox_.fileItemTransRemove(curEditBox_._fileTransList, msg.key, toIdentity);
            var ratioLable = '传输文件："' + msg.fileName + '"(大小：' + msg.fileSize + ') 失败。';
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            $('#disp_text_' + toIdentity).append('<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
            $('#disp_text_' + toIdentity).scrollTop($('#disp_text_' + toIdentity).height());
          } else {
            curEditBox_.recieverFileTransBegin(curEditBox_, msg, sendMsg, toIdentity, flag_);
          }
        }
        break;
      case 0x0002:
        { //收到接收文件端的传输文件进度      
          curEditBox_.showFileItemRatio(curEditBox_, msg, toIdentity);
        }
        break;
      case 0x0003:
        { //收到发送端取消传输文件的请求   
          console.log('transferCancel ' + JSON.stringify(msg));
          if (curEditBox_._fileTransList[msg.key] === undefined) {
            return;
          }
          _global._imV.transferCancelReciever(function() {
            curEditBox_.fileItemTransRemove(curEditBox_._fileTransList, msg.key, toIdentity);
            var ratioLable = '对方中止了传输文件 ："' + msg.fileName + '"(大小：' + msg.fileSize + ')。';
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            $('#disp_text_' + toIdentity).append('<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
            $('#disp_text_' + toIdentity).scrollTop($('#disp_text_' + toIdentity).height());
          }, msg.key);
        }
        break;
      default:
        {
          console.log('processFileRequest default');
        }
    }
  },
  recieverAcceptOrRefuce: function(curEditBox_, msg, sendMsg, toIdentity) {
    if (curEditBox_._fileTransList[msg.key] === undefined) {
      return;
    }
    if (msg.state === '1') {
      _global._imV.sendFileTransferStart(function(err, fileTransMsg) {
        sendMsg['Msg'] = JSON.stringify(fileTransMsg);
        if (err) {
          _global._imV.SendAppMsg(function(mmm) {
            curEditBox_.fileItemTransRemove(curEditBox_._fileTransList, msg.key, toIdentity);
            var ratioLable = '传输文件："' + msg.fileName + '"(大小：' + msg.fileSize + ') 失败。';
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            $('#disp_text_' + toIdentity).append('<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
            $('#disp_text_' + toIdentity).scrollTop($('#disp_text_' + toIdentity).height());
          }, sendMsg);
        } else {
          _global._imV.SendAppMsg(function(mmm) {}, sendMsg);
        }
      }, msg, curEditBox_._fileTransList[msg.key].path);
    } else {
      curEditBox_.fileItemTransRemove(curEditBox_._fileTransList, msg.key, toIdentity);
      var ratioLable = '对方拒绝接收文件："' + msg.fileName + '"(大小：' + msg.fileSize + ')。';
      var msgtime = new Date();
      var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
      $('#disp_text_' + toIdentity).append('<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
      $('#disp_text_' + toIdentity).scrollTop($('#disp_text_' + toIdentity).height());
    }
  },
  recieverFileTransBegin: function(curEditBox_, msg, sendMsg, toIdentity, flag_) {
    console.log('sender transfer go on');
    var output = '/media/fyf/BACKUP/' + msg.fileName;
    curEditBox_._fileTransList[msg.key] = {
      'flag': 1,
      'path': output,
      'fileName':msg.fileName,
      'fileSize':msg.fileSize
    };
    _global._imV.transferFileProcess(function(err, rst) { //传输文件
      if (curEditBox_._fileTransList[msg.key] === undefined || (curEditBox_._fileTransList[msg.key] !== undefined && curEditBox_._fileTransList[msg.key].flag !== 1)) {
        return;
      }
      if (rst.option === 0x0002) {
        sendMsg['Msg'] = JSON.stringify(rst);
        if (msg.state === 1) {
          console.log('transferProcessing--okkkkkkkkk------' + msg.key + ' ' + ' ' + msg.ratio);
          $('#fileRatio_' + msg.key).text((msg.ratio.toFixed(4) * 100) + '%');
        } else {
          var ratioLabel;
          if (msg.ratio === 1) {
            ratioLable = '您已成功接收文件："' + msg.fileName + '"(大小：' + msg.fileSize + ')。';
          } else {
            if (msg.state === 0) {
              ratioLable = '接收文件："' + msg.fileName + '"(大小：' + msg.fileSize + ') 失败。';
            } else {
              ratioLable = '您取消接收文件："' + msg.fileName + '"(大小：' + msg.fileSize + ')。';
            }
          }
          curEditBox_.fileItemTransRemove(curEditBox_._fileTransList, msg.key, toIdentity);
          console.log('_fileTransList================' + Object.keys(curEditBox_._fileTransList).length);
          var msgtime = new Date();
          var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
          $('#disp_text_' + toIdentity).append('<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
          $('#disp_text_' + toIdentity).scrollTop($('#disp_text_' + toIdentity).height());
        }
        _global._imV.SendAppMsg(function(mmm) {}, sendMsg);
      }
    }, msg, output);
  },
  showFileItemRatio: function(curEditBox_, msg, toIdentity) {
    console.log('ininitransferFileProcessing ' + JSON.stringify(msg));
    if (curEditBox_._fileTransList[msg.key] === undefined || (curEditBox_._fileTransList[msg.key] !== undefined && curEditBox_._fileTransList[msg.key].flag !== 2)) {
      return;
    }
    _global._imV.transferProcessing(function() {
      if (msg.state === 1) {
        console.log('transferProcessing--okkkkkkkkk------' + msg.key + ' ' + ' ' + msg.ratio);
        $('#fileRatio_' + msg.key).text((msg.ratio.toFixed(4) * 100) + '%');
      } else {
        var ratioLabel;
        if (msg.ratio === 1) {
          ratioLable = '对方成功接受文件："' + msg.fileName + '"(大小：' + msg.fileSize + ')。';
        } else {
          if (msg.state === 0) {
            ratioLable = '传输文件："' + msg.fileName + '"(大小：' + msg.fileSize + ') 失败。';
          } else {
            ratioLable = '对方取消接收文件："' + msg.fileName + '"(大小：' + msg.fileSize + ')。';
          }
        }
        curEditBox_.fileItemTransRemove(curEditBox_._fileTransList, msg.key, toIdentity);
        console.log('_fileTransList================' + Object.keys(curEditBox_._fileTransList).length);
        var msgtime = new Date();
        var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
        $('#disp_text_' + toIdentity).append('<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
        $('#disp_text_' + toIdentity).scrollTop($('#disp_text_' + toIdentity).height());
      }
    }, msg);
  },
  refuseFileItemTransfer: function(msg_, sendMsg_) {
    console.log('==============refuseFileItemTransfer');
    var toIdentity = sendMsg_.Account + sendMsg_.UID;
    msg_['state'] = '0'; //state=1：同意接受;state=0 ：不同意接受------------界面显示
    sendMsg_['Msg'] = JSON.stringify(msg_);
    _global._imV.SendAppMsg(function(mmm) {
      console.log('==++++++++++++++++++=======refuseFileItemTransfer');
      var ratioLable = '您拒绝接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
      var msgtime = new Date();
      var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
      $('#disp_text_' + toIdentity).append('<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
      $('#disp_text_' + toIdentity).scrollTop($('#disp_text_' + toIdentity).height());
    }, sendMsg_);
  },
  acceptFileItemTransfer: function(curEditBox_, msg_, sendMsg_, toIdentity, flag_) {
    curEditBox_._fileTransList[msg_.key] = {
      'flag': 1,
      'path': '',
      'fileName':msg_.fileName,
      'fileSize':msg_.fileSize
    };
    if (flag_) {
      $('#fileTransItem_' + msg_.key).remove();
    } else {
      $('#memList_' + toIdentity).hide();
      $('#fileTransShow_' + toIdentity).show();
    }
    $('#fileTransList_' + toIdentity).append('<li id="fileTransItem_' + msg_.key + '">\
                <a href="javascript:;">\
                <img src="img/uploadFile.png"/></a><a href="javascript:;" class="chatList_name">' + msg_.fileName + '<br/>大小：' + msg_.fileSize + '</a><br/>\
                <span id="fileRatio_' + msg_.key + '"></span><br/><button type="button"  id="cancelFileItem_' + msg_.key + '" class="chatList_btn">取消</button>\
                </li>');
    $('#cancelFileItem_' + msg_.key).on('click', function() {
      _global._imV.transferCancelReciever(function() {}, msg_.key);
    });
    msg_['state'] = '1'; //state=1：同意接受;state=0 ：不同意接受------------界面显示
    sendMsg_['Msg'] = JSON.stringify(msg_);
    _global._imV.SendAppMsg(function(mmm) {}, sendMsg_);
  },
  fileItemTransRemove: function(fileTransList_, key, toIdentity) {
    $('#fileTransItem_'+key).remove();
    delete fileTransList_[key];
    if (Object.keys(fileTransList_).length === 0) {
      $('#fileTransShow_' + toIdentity).hide();
      $('#memList_' + toIdentity).show();
    }
  },
  closeBtnFunc: function(curEditBox_, toAccountInfo_, imChatWinList_) {
    var toIdentity = toAccountInfo_.toAccount + toAccountInfo_.toUID;
    if (Object.keys(curEditBox_._fileTransList).length !== 0) {
      Messenger().post({
        message: '如果关闭窗口，将中断与' + toAccountInfo_.toAccount + '之间的文件传输。！是否关闭窗口？',
        type: 'info',
        actions: {
          close: {
            label: '否',
            action: function() {
              Messenger().hideAll();
            }
          },
          open: {
            label: '是',
            action: function() {
              Messenger().hideAll();
              var sendMsg = {};
              sendMsg['IP'] = toAccountInfo_.toIP;
              sendMsg['UID'] = toAccountInfo_.toUID;
              sendMsg['Account'] = toAccountInfo_.toAccount;
              sendMsg['App'] = 'imChat';
              for (var key in curEditBox_._fileTransList) {
                var detail = curEditBox_._fileTransList[key];
                var fileMsgTmp = {
                  'type': 'file',
                  'key': key,
                  'fileName': detail.fileName,
                  'fileSize': detail.fileSize
                };
                switch (detail.flag) {
                  case 0:
                    {
                      curEditBox_.fileItemTransRemove(curEditBox_._fileTransList, key, toIdentity);
                      fileMsgTmp['option'] = 0x0000;
                      fileMsgTmp['state'] = '0'; //state=1：同意接受;state=0 ：不同意接受------------界面显示 
                      sendMsg['Msg'] = JSON.stringify(fileMsgTmp);
                      _global._imV.SendAppMsg(function(mmm) {}, sendMsg);
                    }
                    break;
                  case 1:
                    {
                      _global._imV.transferCancelReciever(function() {}, key);
                    }
                    break;
                  case 2:
                    {
                      _global._imV.transferCancelSender(function(rst) {
                        curEditBox_.fileItemTransRemove(curEditBox_._fileTransList, key, toIdentity);
                        sendMsg['Msg'] = JSON.stringify(rst);
                        _global._imV.SendAppMsg(function(mmm) {}, sendMsg);
                      }, fileMsgTmp);
                    }
                    break;
                  default:
                    {}
                }
              }
              curEditBox_._um.destroy();
              curEditBox_._imWindow.closeWindow(curEditBox_._imWindow);
              delete imChatWinList_['imChatWin_' + toIdentity];
            }
          }
        }
      });
    } else {
      curEditBox_._um.destroy();
      curEditBox_._imWindow.closeWindow(curEditBox_._imWindow);
      delete imChatWinList_['imChatWin_' + toIdentity];
    }
  },
  deviceUpFunc: function(curEditBox_, info_) {
    var memItemId= info_['txt'][1]+ info_['txt'][2];
    var deviceItem = {
        id: 'memItem_' + memItemId,
        type: "item",
        href: "",
        img: "img/2016.jpg",
        text: info_['txt'][1]+ info_['txt'][2],
        clkaction: function() {}
      };
    curEditBox_._memListView.addItem(deviceItem);
  },
  deviceDownFunc: function(curEditBox_,info_) {
    var memItemId= info_['txt'][1]+ info_['txt'][2];
    curEditBox_._memListView.remove('memItem_'+memItemId);
  }
});

var LoginView = View.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
    this.registObservers();
    // view for login
    this.$loginView = $('<div>', {
      'class': 'login'
    }).append($('<div>', {
      'class': 'login-content'
    }).append($('<div>', {
      'class': 'content-row'
    }).html(
      '账户： ' +
      '<input type="text" name="account">'
    )).append($('<div>', {
      'class': 'content-row'
    }).html(
      '密码： ' +
      '<input type="password" name="password">'
    )).append($('<div>', {
      'class': 'content-row',
      'id': 'msg1'
    }))).append($('<div>', {
      'class': 'login-btn-bar'
    }).html(
      '<button class="btn active" id="btn-regist">注册>>></button>' +
      '<button class="btn disable" id="btn-login">登陆</button>' +
      '<button class="btn active hidden" id="btn-cancel">取消</button>'
    )).append($('<div>', {
      'class': 'login-waiting hidden'
    }).html(
      '<div class="loading icon-spin5 animate-spin"></div>' +
      '<p>正在登陆，请稍后...</p>'
    )).append($('<div>', {
      'class': 'login-regist hidden'
    }).html(
      '<div class="content-row">' +
      '<div>账户</div>：<input type="text" name="r-account">' +
      '</div>' +
      '<div class="content-row">' +
      '<div>密码</div>：<input type="password" name="r-password">' +
      '</div>' +
      '<div class="content-row">' +
      '<div>确认密码</div>：<input type="password" name="r-password-c">' +
      '</div>' +
      '<div class="content-row" id="msg"></div>' +
      '<div class="content-row">' +
      '<button class="btn disable" id="btn-commit">提交</button>' +
      '<button class="btn active" id="btn-r-cancel">关闭</button>' +
      '</div>'
    ));
    // view for logout
    this.$logoffView = $('<div>', {
      'class': 'logout'
    }).append($('<div>', {
      'class': 'logout-content'
    }).html(
      '确定登出此账户？'
    )).append($('<div>', {
      'class': 'logout-btn-bar'
    }).html(
      '<button class="btn active" id="btn-sure">确认</button>' +
      '<button class="btn active" id="btn-cancel">取消</button>'
    ));
    this._controller = LoginController.create(this);
    this._r_shown = false;
  },

  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'login': function(err_, state_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        _this.show(state_);
      },
      'login-state': function(err_, last_, state_, msg_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        // _this.toggleLogin(false);
        if(state_) {
          $('#' + _this._id + '-window').remove();
        } else {
          if(last_) {
            $('#' + _this._id + '-window').remove();
          } else {
            _this.toggleLogin(false);
            _this.$loginView.find('#msg1').html('登陆失败：' + msg_);
          }
        }
        // _this._win.closeWindow(_this._win);
      },
      'regist': function(err_, success_, reason_) {
        _this.$loginView.find('span').remove();
        if(success_) {
          _this.$loginView.find('#msg').html('注册成功');
        } else {
          _this.$loginView.find('#msg').html('注册失败：' + reason_);
        }
      }
    };
    for(var key in _this.__handlers) {
      _this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function(which_) {
    if(which_ == 500) {
      var _this = this,
          $account = _this.$loginView.find('input[name="account"]'),
          $password = _this.$loginView.find('input[name="password"]'),
          $login = _this.$loginView.find('#btn-login'),
          onInput = function(e) {
            if($account.val() != '' && $password.val() != '') {
              $login.removeClass('disable').addClass('active');
            } else {
              $login.removeClass('active').addClass('disable');
            }
          };
      $account.on('input', onInput);
      $password.on('input', onInput);
      _this.toggleLogin(false);
      /* $('#' + this._id + '-window').off.on('keydown', function(e) { */
        // e.stopPropagation();
      /* }); */
    } else {
      var _this = this,
          $logout = _this.$logoffView.find('#btn-sure'),
          $cancel2 = _this.$logoffView.find('#btn-cancel');
      $logout.one('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this._controller.onLogout();
      });
      $cancel2.one('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // _this._win.closeWindow(_this._win);
        $('#' + _this._id + '-window').remove();
      });
    }
  },

  show: function(toLogin_) {
    if($('#' + this._id + '-window').length != 0) return ;
    var $view, title, height, width;
    if(toLogin_) {
      $view = this.$loginView;
      title = '登陆';
      height = 300;
      width = 500;
    } else {
      $view = this.$logoffView;
      title = '登出';
      height = 150;
      width = 250;
    }
    Window.create(this._id + '-window', title, {
      left: 400,
      top: 300,
      height: height,
      width: width,
      max: false,
      fadeSpeed: 500,
      animate: false,
      hide: false
    }, function() {
      this.getID = function() {return this._id;};
      _global._openingWindows.add(this);
      this.onfocus(function() {
        _global._openingWindows.focusOnAWindow(this._id);
      });
      var _this = this;
      this.bindCloseButton(function() {
        _global._openingWindows.remove(_this);
      });
    }).append($view);
    $view.parent().css('position', 'initial');
    this.initAction(width);
  },

  toggleLogin: function(loading_) {
    var view = this,
        $content = view.$loginView.find('.login-content'),
        $waiting = view.$loginView.find('.login-waiting'),
        $account = view.$loginView.find('input[name="account"]'),
        $password = view.$loginView.find('input[name="password"]'),
        $msg1 = view.$loginView.find('#msg1'),
        $regist = view.$loginView.find('#btn-regist'),
        $login = view.$loginView.find('#btn-login'),
        $cancel = view.$loginView.find('#btn-cancel');
    if(loading_) {
      $content.fadeOut(function() {
        $waiting.fadeIn();
      });
      $msg1.html('');
      $regist.hide();
      $login.hide(function() {
        $cancel.show().one('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          view._controller.onCancelLogin();
        });
      });
    } else {
      $waiting.fadeOut(function() {
        $password.val('');
        $login.removeClass('active').addClass('disable');
        $content.fadeIn();
      });
      $cancel.hide(function() {
        $regist.show().one('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          view.toggleRegist(true);
        });
        $login.show().one('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if(view._r_shown) view.toggleRegist(false);
          view._controller.onLogin($account.val(), $password.val());
        });
      });
    }
  },

  toggleRegist: function(show_) {
    var view = this,
        $regist = view.$loginView.find('#btn-regist'),
        $registView = view.$loginView.find('.login-regist'),
        $commit = view.$loginView.find('#btn-commit'),
        $cancel = view.$loginView.find('#btn-r-cancel'),
        $account = view.$loginView.find('input[name="r-account"]'),
        $password = view.$loginView.find('input[name="r-password"]'),
        $passwordC = view.$loginView.find('input[name="r-password-c"]'),
        $msg = view.$loginView.find('#msg');
    if(show_) {
      $('#' + view._id + '-window').find('.window-content').animate({
        height: '+=250px'
      }, function() {
        view._r_shown = true;
        $registView.fadeIn();
        var onInput = function() {
          if($account.val() != '' && $password.val() != '' && $passwordC.val() != '') {
            $commit.removeClass('disable').addClass('active');
          } else {
            $commit.removeClass('active').addClass('disable');
          }
        }
        $account.on('input', onInput);
        $password.on('input', onInput);
        $passwordC.on('input', onInput);
        $commit.off().on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var p1 = $password.val(),
              p2 = $passwordC.val();
          if(p1 == p2) {
            $commit.removeClass('active').addClass('disable').append($('<span>', {
              'class': 'icon-spin5 animate-spin'
            }));
            $password.val('');
            $passwordC.val('');
            view._controller.onRegist($account.val(), p1);
          } else {
            // TODO: show warnning
            $msg.html('密码确认有误');
          }
        });
        $cancel.off().on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          $account.val('');
          $password.val('');
          $passwordC.val('');
          $msg.html('');
          view.toggleRegist(false);
        })
      });
    } else {
      $registView.hide(function() {
        view._r_shown = false;
        $('#' + view._id + '-window').find('.window-content').animate({
          height: '-=250px'
        });
        $regist.one('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          view.toggleRegist(true);
        });
      });
    }
  }
});

