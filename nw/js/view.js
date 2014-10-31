// This file includes all view classes
//

// The view of Desktop
//
var DesktopView = View.extend({
  init: function(model_, parent_) {
    this.callSuper('desktop-view', model_, parent_);
    this.controller = DesktopController.create(this);
    this.registObservers();
    this.$view = $('body')/* .attr({id: this.getID()}) */;
    this._c = [];
    this.initCtxMenu();
    this.initAction();
  }, 
  
  registObservers: function() {
    var _this = this;
    _this.__handlers = {
      'add': function(err_, component_) {
        switch(component_.getID()) {
          case 'launcher':
            // TODO: create a launcher view(split create and init into two functions, and
            //  here just create a view object)
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
            _this._c[component_.getID()] = DockView.create(component_, _this);
            _this._c[component_.getID()].show(_this.$view);
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
        ctxMenu = _global.get('ctxMenu');
    ctxMenu.addCtxMenu([
      {header: 'desktop'},
      {text: 'create Dir', icon: 'icon-folder-close-alt', action: function(e) {
        e.preventDefault();
        for (var i = 0; ; i++) {
          if(_global._fs.existsSync(desktop._desktopWatch.getBaseDir() + '/newDir' + i)) {
            continue;
          } else {
            _global._fs.mkdir(desktop._desktopWatch.getBaseDir() + '/newDir' + i, function() {});
            return;
          }
        }
      }},
      {text: 'create Text', icon: 'icon-file', action: function(e){
        e.preventDefault();
        for (var i = 0; ; i++) {
          if(_global._fs.existsSync(desktop._desktopWatch.getBaseDir() + '/newFile' + i + '.txt')) {
            continue;
          } else {
            _global._fs.writeFile(desktop._desktopWatch.getBaseDir() + '/newFile' + i + '.txt', ''
              , {encoding:'utf8'}, function(err) {
                if (err) console.log(err);
              });
            return;
          }
        }
      }},
      {text: 'script', subMenu: [
        {header: 'script'}
      ]},
      {divider: true},
      {text: 'terminal', icon: 'icon-terminal', action: function(e) {
        e.preventDefault();
        _global._exec("gnome-terminal", function(err, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
        });
      }},
      {text:'gedit', icon: 'icon-edit', action:function(e){
        e.preventDefault();
        _global._exec("gedit", function(err, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
        });
      }},
      {divider: true},
      {text: 'refresh', icon: 'icon-refresh icon-spin', action: function(e) {
        // TODO: only reload views
        location.reload();
      }},
      {text: 'refresh (F5)', icon: 'icon-refresh icon-spin', action: function(e) {
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
        });
      }},
      {text: 'window2', action: function() {
        Window.create('newWin','Test Window2!', {
          left:400,
          top:300,
          height: 500,
          width: 800,
          fadeSpeed: 500,
          animate: true
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
      {text:'delete' , icon: 'icon-remove-circle', action:function(e){
        e.preventDefault();
        var _path = desktop._widgets[ctxMenu._rightObjId]._path;
        utilIns.entryUtil.removeFile(_path);
      }},
      {text:'property',action:function(e){
        e.preventDefault();
        var _property = Property.create(ctxMenu._rightObjId);
        _property.showAppProperty();
        _property.show();
      }}
    ]);
    ctxMenu.addCtxMenu([
      {header: 'file-entry'},
      {text: 'Open', icon: 'icon-folder-open-alt', action: function(e) {
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
      {text:'Delete' , icon: 'icon-remove-circle', action:function(e){
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
    $(window).on('unload', function() {
      _this._model.release();
    });

    var ctxMenu = _global.get('ctxMenu'),
        desktop = this._model,
        utilIns = _global.get('utilIns');
    ctxMenu.attachToMenu('body', ctxMenu.getMenuByHeader('desktop')
        , function() {
          // TODO: change to get from launcher
          ctxMenu._rightObjId = undefined;
          var _DIR = _global.$home + '/.gnome2/nemo-scripts';
          console.log(_DIR);
          var _menu = ctxMenu.getMenuByHeader('script');
          if (typeof _menu !== 'undefined') {
            var _items = _menu.children('li');
            for (var i = 0; i < _items.length; i++) {
            if(!$(_items[i]).hasClass('nav-header'))
              $(_items[i]).remove();
            };
          }
          _global._fs.readdir(_DIR, function(err_, files_) {
            for(var i = 0; i < files_.length; i++) {
              var _names = files_[i].split('.');
              if(_names[_names.length - 1] == 'desktop') {
                _global.get('utilIns').entryUtil.getItemFromApp(_DIR + '/' + files_[i]
                  , function(err_, item_) {
                    ctxMenu.addItem(_menu, item_);
                  });
              };
            };
          });
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

  show: function($parent) {
    $parent.append(this.$view);
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
      var _name = dockApp.getFilename(),
          _src = dock._dockWatch.getBaseDir() + '/' + _name,
          _dst = desktop._desktopWatch.getBaseDir() + '/' + _name;
      dockApp.setPosition({x: _target_col, y: _target_row});
      _global._fs.rename(_src, _dst, function() {});
      return ;
    }

    // handle file transfer
    //
    var _files = ev.dataTransfer.files;
    if(_files.length != 0) {
      for(var i = 0; i < _files.length; ++i) {
        var dst = desktop._desktopWatch.getBaseDir() + '/' + _files[i].name;
        if(_files[i].path == dst) continue;
        _global._fs.rename(_files[i].path, dst, function() {});
      }
      return ;
    }

    //handle item transfer (not support chinese) 
    var _items = ev.dataTransfer.items;
    if (_items.length != 0 && typeof s_widget == 'undefined') {
      var _fs = require('fs');
      _items[0].getAsString(function(data){
        for (var i = 0; ; i++) {
          if(_fs.existsSync(desktop._desktopWatch.getBaseDir()+'/newFile'+i+'.txt')) {
            continue;
          } else {
            var iconv = require('iconv-lite');
            var buf = iconv.encode(data,'ucs2');
            var str = iconv.decode(buf,'ucs2');
            _fs.writeFile(desktop._desktopWatch.getBaseDir() + '/newFile' + i + '.txt'
              , str, {encoding:'utf8'}, function(err) {
                if (err) throw err;
              });
            return ;
          }
        };
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
    if(type != 'app' && type != 'theme') type = 'file';
    ctxMenu.attachToMenu('#' + this.getID()
        , ctxMenu.getMenuByHeader(type + '-entry')
        , function(id_) {ctxMenu._rightObjId = id_;});
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

var DeviceListView = View.extend({
  init: function(model_, parent_) {
    this.callSuper('device-list', model_, parent_);
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'device-list',
      'id': this._id
    }).append($('<p>', {
      'class': 'title'
    }).text('Online Devices'));
    this._c = [];
    this.initAction();
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
        _this._c[dev_.getID()] = DevEntryView.create(dev_.getID(), dev_, _this);
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
    this.$view.on('mouseenter', function(e) {
      enter();
    }).on('mouseleave', function(e) {
      leave();
    }).on('dragenter', function(e) {
      enter();
    }).on('dragleave', function(e) {
      // leave();
    });
  },

  show: function($parent) {
    $parent.append(this.$view);
    this._left = this.$view.position().left;
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
        PropertyView.create(id_[0], _this._model.getCOMById(id_[1])).show();
      }},
      {text: 'add reflect', action: function() {
        _this.addReflect();
      }},
      {text: 'remove reflect', action: function() {
        _this.removeReflect();
      }}
    ]);
  },

  show: function($parent) {
    $parent.append(this.$view);
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
      if(typeof widget !== 'undefined' && widget.getType() == 'app') {
        /* if(typeof dockApp !== 'undefined') { */
          // alert("The App has been registed in dock");
          // return ;
        /* } */
        
        var _filename = widget.getFilename();
        widget.setIdx(idx);
        _global._fs.rename(desktop._desktopWatch.getBaseDir() + '/' + _filename
            , dock._dockWatch.getBaseDir() + '/' + _filename
            , function() {});
      } else if(ev.dataTransfer.files.length != 0) {
        var _files = ev.dataTransfer.files;
        for(var i = 0; i < _files.length; ++i) {
          var dst = dock._dockWatch.getBaseDir() + '/' + _files[i].name;
          if(_files[i].path == dst) continue;
          _global._fs.rename(_files[i].path, dst, function() {});
        }
        return ;
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
    }
    for(var i = 0; i < divList.length; ++i) {
      var model = this._parent._c[divList[i].id]._model,
          o_idx = model.getIdx();
      if(n_idx == o_idx && !inserted) {
        $(divList[i]).before(this.$view);
        inserted = true;
      }
      if(inserted) model.setIdx(i + 1);
    }
    if(!inserted) $parent.append(this.$view);
    
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
    } else if((typeof widget != 'undefined' && widget.getType() == 'app')
        || ev.dataTransfer.files.length != 0) {
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
        if(_this._model.getType() == 'app')
          _this.setAppProperty();
        _this.setBasicProperty();
        _this._tab.setShowByTab('basic');
      });
    }
  },

  hide: function() {
    this.$view.remove();
  },

  setAppProperty: function() {
    this.$view.find('.basicinfocontent')
      .append("<p>▪名称:  <span id='name'>" + this._model.getName() + "</span></p>")
      .append("<p>▪命令:  <span id='cmd'>" + this._model.getCmd() + "</span></p>")
      .append("<p>▪描述:  <span id='comment'>" + this._model.getComment() + "</span></p>")
      .append("<p>▪备注:  <span id='gname'>" + this._model.getGenericName() + "</span></p>")
      .append("<p>▪位置:  <span id='path'>" + this._model.getPath() + "</span></p>");
    this.$view.find('.imgcontent').attr('src', this._model.getImgPath());
  },

  setBasicProperty: function() {
    var _this = this;
    //get some basic inform and access inform
    _global.get('utilIns').entryUtil.getProperty(_this._model.getPath(), function(err_, attr_) {
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
      _this._tab.addDivByTab("<p><span>▪</span>所有者:  " + attr_['uid'] + "</p>",'power');
      _this._tab.addDivByTab("<p>&nbsp;&nbsp;&nbsp;权限:  " +  power + "</p>",'power');
      checkPower(_access.substr(4, 3));
      _this._tab.addDivByTab("<p><span>▪</span>用户组:  " + attr_['gid'] + "</p>",'power');
      _this._tab.addDivByTab("<p>&nbsp;&nbsp;&nbsp;权限:  " +  power + "</p>",'power');
      checkPower(_access.substr(7, 3));
      _this._tab.addDivByTab("<p><span>▪</span> 其他:  </p>", 'power');
      _this._tab.addDivByTab("<p>&nbsp;&nbsp;&nbsp;权限:  " +  power + "</p>", 'power');
    });
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
      'class': 'icon-plus-sign'
    }).css({
      'display': 'inline-block',
      'cursor': 'pointer'
    })));
    this.initAction(this.$view);
    this._c = [];
    this._tabIdx = -1;
    this._needSelector = needSelector_ || false;
    this._controller = FlipperController.create(this);
    this._curMotion = 'normal';
    this._main = 0;
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
          case 'grid':
            var l = _this._c.push(GridView.create('grid-view', widget_, _this));
            _this._c[l - 1].show(_this.$view);
            _this.addASwitcher(_this._c[l - 1].getView());
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
      },
      'layout_size': function(err_, size_) {
        // redraw the layout container's size
        _this.$view.css({
          'width': size_.width,
          'height': size_.height
        });
      },
      'cur': function(err_, from_, to_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        _this._switchMotion[_this._curMotion](_this._c[from_].getView(), _this._c[to_].getView());
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function($selector) {
    this._switchMotion = {
      'normal': function ($from, $to) {
        $from.hide();
        $to.show();
      }
    };
    var _this = this;
    $selector.on('drag', function(e) {
      e.stopPropagation();
    }).find('.icon-plus-sign').on('mousedown', function(e) {
      e.stopPropagation();
      e.preventDefault();
      _this._controller.onAdd();
    });
  },

  show: function($parent) {
    $parent.append(this.$view);
    var _this = this;
    if(this._needSelector) {
      this._selector = Selector.create(this, '#' + this._id, {
        'enter': function() {
          var _items = this.getSelectableItems();
          if(_this._tabIdx != -1 && _items[_this._tabIdx] != null)
            _items[_this._tabIdx]._controller.onDblclick();
        },
        'up': function() {
          var _items = this.getSelectableItems();
          _this._tabIdx += _this._dEntrys.length() - 1;
          _this._tabIdx %= _this._dEntrys.length();
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
          var _items = this.getSelectableItems();
          _this._tabIdx++; 
          _this._tabIdx %= _this._dEntrys.length();
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

  addASwitcher: function($view) {
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
    _this.$view.find('.icon-plus-sign').before($switcher);
    _this._model.setCur(_this.$view.find('.view-switcher').length - 1);
  },

  removeASwitcher: function(idx_) {
  },

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

