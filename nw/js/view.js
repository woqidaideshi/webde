// This file includes all view classes
//

// The view of Desktop
//
var DesktopView = View.extend({
  init: function(model_, parent_) {
    this.callSuper('desktop-view', model_, parent_);
    this.controller = DesktopController.create(this);
    this.registObservers();
    var $body = $('body').attr('onselectstart', 'return false');
    this._height = $body.height();
    this._width = $body.width();
    this.$view = $('<div>', {
      'class': 'dbg',
      'width': this._width,
      'height': this._height
    }).append($('<img>', {
      'src': 'img/bgp.jpg'
    }));
    $body.append(this.$view);
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
            // create a launcher view(split create and init into two functions, and
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
        lang = _global._locale.langObj,
        _this = this;
    ctxMenu.addCtxMenu([
      {header: 'desktop'},
      // TODO: comment for temporary
      /* {text: 'create Dir', icon: 'icon-folder-1', action: function(e) { */
        // e.preventDefault();
        // var layout = desktop.getCOMById('layout').getCurLayout();
        // for (var i = 0; ; i++) {
          // // replace with logistic directory
          // if(layout.getWidgetByAttr('_name', 'New Folder ' + i) != null) continue;
          // var d = new Date();
          // _this._c['layout'].getCurView()._controller.onAddFolder('/desktop/New Folder ' + i
            // , 'folder' + d.getTime());
          // break; 
        // }
      /* }}, */
      {text: lang['c_txt'], icon: 'icon-doc-text', action: function(e){
        e.preventDefault();
        // change to demo-rio's API
        _global._dataOP.createFileOnDesk(function(err_, ret_) {
          if(err_) return console.log(err_);
          _this._c['layout'].getCurView()._controller.onAddFile(ret_[0], ret_[1]);
        });
      }},
      {text: lang['script'], subMenu: [
        {header: 'script'}
      ]},
      {divider: true},
      {text: lang['terminal'], icon: 'icon-terminal', action: function(e) {
        e.preventDefault();
        _global._dataOP.shellExec(function(err, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
        }, "gnome-terminal");
      }},
      {text: lang['gedit'], icon: 'icon-edit', action:function(e){
        e.preventDefault();
        _global._dataOP.shellExec(function(err, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
        }, "gedit");
      }},
      {divider: true},
      {text: lang['resize'], action: function(e) {
        e.preventDefault();
        _this.__resize();
      }},
      {text: lang['refresh'], icon: 'icon-spin3 animate-spin', action: function(e) {
        // TODO: only reload views
        location.reload();
      }},
      {text: lang['refresh'] + ' (F5)', icon: 'icon-spin3 animate-spin', action: function(e) {
        location.reload(true);
      }},
      {divider: true},
      {text: lang['window'], action: function() {
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
      {text: lang['window'] + '2', action: function() {
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
      {text: lang['add-plugin'], icon: 'icon-plus', subMenu: [
        {header: 'add-plugin'},
        {text: lang['clock'], icon: 'icon-time', action: function(e) {
          e.preventDefault();
          if (typeof $('#clock')[0] == 'undefined') {
            var layout = desktop.getCOMById('layout').getCurLayout();
            layout.add(DPluginModel.create('clock', layout, 'img/clock.png', 'ClockPlugin'));
            ctxMenu.disableItem('add-plugin', 'clock');
          }
        }}
      ]},
      {text: lang['messenger_set'], icon: 'icon-cog', subMenu:[
        {header: 'messenger set'},
        {text: lang['position'], subMenu:[
          {header: 'messenger-pos'},
          {text: lang['left-bottom'], action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-left messenger-on-bottom"
            };
          }},
          {text: lang['left-top'], action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-left messenger-on-top"
            };
          }},
          {text: lang['top'], action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-top"
            };
          }},
          {text: lang['right-top'], action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-right messenger-on-top"
            };
          }},
          {text: lang['right-bottom'], action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-right messenger-on-bottom"
            };
          }},
          {text: lang['bottom'], action:function(e){
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-bottom"
            };
          }},

        ]},
        {text: lang['max_messages'], subMenu:[
          {text: '1', action:function(){
            Messenger.options={
              maxMessages: '1'
            }
          }},
          {text: '3', action:function(){
            Messenger.options={
              maxMessages: '3'
            }
          }},
          {text: '5', action:function(){
            Messenger.options={
              maxMessages: '5'
            }
          }}
        ]}
      ]},
      {text: lang['switch_motion'], subMenu: [
        {header: 'switch motion'}
      ]}
    ]);

    var /* layout = desktop.getCOMById('layout').getCurLayout(), */
        _this = this;
    ctxMenu.addCtxMenu([
      {header: 'plugin'},
      {text: lang['zoom_in'], action: function(e) {
        e.preventDefault();
        desktop.getCOMById('layout').getCurLayout().getWidgetById(ctxMenu._rightObjId).zoomIn();
      }},
      {text: lang['zoom_out'], action: function(e) {
        e.preventDefault();
        desktop.getCOMById('layout').getCurLayout().getWidgetById(ctxMenu._rightObjId).zoomOut();
      }},
      {text: lang['remove'], action:function(e) {
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
      {text: lang['show_clock'], action: function() {
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
      {text: lang['run'], action: function(e) {
        e.preventDefault();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onDblclick();
      }},
      {text: lang['rename'], action: function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onRename();
      }},
      {text: lang['delete'], icon: 'icon-cancel-circled2', action: function(e) {
        e.preventDefault();
        /* var _path = desktop._widgets[ctxMenu._rightObjId]._path; */
        /* utilIns.entryUtil.removeFile(_path); */
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onEntryDelete();
      }},
      {text: lang['property'], action: function(e) {
        e.preventDefault();
        var layout = _global.get('desktop').getCOMById('layout').getCurLayout();
        PropertyView.create(ctxMenu._rightObjId
          , layout.getWidgetById(ctxMenu._rightObjId)
          , layout).show();
      }}
    ]);
    ctxMenu.addCtxMenu([
      {header: 'file-entry'},
      {text: lang['open'], icon: 'icon-folder-open-empty', action: function(e) {
        e.preventDefault();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onDblclick();
      }},
      {text: lang['open_with'], icon: 'icon-folder-open', subMenu: [
        {header: 'Open with'}]
      },
      {divider: true},
      {text: lang['rename'], action: function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onRename();
      }},
      {text: lang['move2trash'], icon: 'icon-trash', action:function(e){
        e.preventDefault();
        utilIns.trashUtil.moveToTrash(ctxMenu._rightObjId);
      }},
      {text: lang['delete'], icon: 'icon-cancel-circled2', action:function(e){
        e.preventDefault();
        var _msg;
        _msg = Messenger().post({
          message: lang['delete_warnning'],
          type: 'info',
          showCloseButton: true,
          actions:{
            sure:{
              label: lang['sure'],
              action:function(){
                var _path = desktop._widgets[ctxMenu._rightObjId]._path;
                utilIns.entryUtil.removeFile(_path);
                _msg.update({
                  message: lang['delete'] + lang['space'] + lang['success'],
                  type: 'success',
                  showCloseButton: true,
                  actions: false
                });
              }
            },
            trash:{
              label: lang['move2trash'],
              action:function(){
                utilIns.trashUtil.moveToTrash(ctxMenu._rightObjId);
                _msg.update({
                  message: lang['move2trash'] + lang['space'] + lang['success'],
                  type: 'success',
                  showCloseButton: true,
                  actions: false
                });
              }
            },
            cancel:{
              label: lang['cancel'],
              action:function(){
                _msg.update({
                  message: lang['cancel'] + lang['space'] + lang['delete'],
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
      {text: lang['open'], action: function(e) {
        e.preventDefault();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onDblclick();
      }},
      {text: lang['rename'], action: function(e) {
        e.preventDefault();
        e.stopPropagation();
        _this._c['layout'].getCurView()._c[ctxMenu._rightObjId]._controller.onRename();
      }}
    ]);
  },

  __resize: function() {
    $('body').css('overflow', 'hidden');
    var w = $('body').width(),
        h = $('body').height(),
        size = {
          'width': w < 800 ? 800 : w,
          'height': h < 600 ? 600 : h
        };
    this._width = size.width;
    this._height = size.height;
    this.$view.css(size);
    this.getModel().setSize(size);
  },

  initAction: function() {
    var _this = this;
    $(window).on('beforeunload', function() {
      _this._model.release();
    }).resize(function() {
      console.log('resize:', this.innerWidth, this.innerHeight);
      _this.__resize();
      // change the property of overflow
      if(_this._width > this.innerWidth) {
        $('body').css('overflow-x', 'auto');
      } else {
        $('body').css('overflow-x', 'hidden');
      }
      if(_this._height > this.innerHeight) {
        $('body').css('overflow-y', 'auto');
      } else {
        $('body').css('overflow-y', 'hidden');
      }
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
      /* 'layout_size': function(err_, size_) { */
        // // TODO: maybe no need to redraw the layout container's size manually
        // _this.$view.css({ 
          // 'width': size_.width,
          // 'height': size_.height
        // }); 
      /* }, */
      'grid_size': function(err_, size_) {
        // TODO: redraw the grid_size
        if(err_) return console.log(err_);
        console.log(size_);
      },
      'col_row': function(err_, col_row_diff_) {
        if(err_) return console.log(err_);
        if(!_this._draw) {
          _this.drawGrids(0, _this._model.getColNum(), 0, _this._model.getRowNum());
        } else {
          // TODO: add or remove colume or row
          console.log(col_row_diff_);
          var colNum = _this._model.getColNum(),
              rowNum = _this._model.getRowNum();
          if(col_row_diff_.col_diff < 0) {
            // remove columes
            for(var i = col_row_diff_.col_diff, cols = _this.$view.children('.gridcol');
                i < 0; ++i) {
              var idx = colNum - i - 1;
              _this.destroyCol($(cols[idx]), idx);
            }
            if(col_row_diff_.row_diff < 0) { // des col & des row
              // remove grids
              for(var cols = _this.$view.children('.gridcol'), i = cols.length - 1; i >= 0; --i) {
                for(var j = rowNum - col_row_diff_.row_diff - 1; j >= rowNum; --j) {
                  _this.destroyGrid($(cols[i]), i, j);
                }
              }
            } else { // des col & ins row
              // add grids
              for(var cols = _this.$view.children('.gridcol'), i = cols.length - 1; i >= 0; --i) {
                for(var j = rowNum - col_row_diff_.row_diff; j < rowNum; ++j) {
                  _this.drawGrid($(cols[i]), i, j);
                }
              }
            }
          } else {
            // add columes
            _this.drawGrids(colNum - col_row_diff_.col_diff, colNum, 0, rowNum);
            // for(var i = 0, colNum = _this._model.getColNum(); i < col_row_diff_.col_diff; ++i) {
              // _this.drawCol(colNum++);
            // }
            if(col_row_diff_.row_diff < 0) { // ins col & des row
              // remove grids
              for(var cols = _this.$view.children('.gridcol')
                  , i = colNum - col_row_diff_.col_diff - 1;
                  i >= 0; --i) {
                for(var j = rowNum - col_row_diff_.row_diff - 1; j >= rowNum; --j) {
                  _this.destroyGrid($(cols[i]), i, j);
                }
              }
            } else { // ins col & ins row
              // add grids
              for(var cols = _this.$view.children('.gridcol')
                  , i = colNum - col_row_diff_.col_diff - 1;
                  i >= 0; --i) {
                for(var j = rowNum - col_row_diff_.row_diff; j < rowNum; ++j) {
                  _this.drawGrid($(cols[i]), i, j);
                }
              }
            }
          }
        }
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
    // handle parent's resize event
    _this.__handlers['resize'] = function(err_, size_) {
      _this._model.setSize(size_);
      // modify selector's size
      if(_this._needSelector) _this._selector.__getArea();
    };
    _this._parent._model.on('resize', _this.__handlers['resize']);
  },

  addAnDEntry: function(entry_) {
    var pos_ = entry_.getPosition();
    if(typeof pos_ === 'undefined' || 
      // typeof $('#grid_' + pos_.x + '_' + pos_.y).children('div')[0] != 'undefined') {
      this._model._grid[pos_.x][pos_.y].use) {
      pos_ = this._model.findAnIdleGrid();
      if(pos_ == null) {
        alert("No room");
        // TODO: find from another page. If all full, add a new page
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

  drawGrids: function(startCol_, endCol_, startRow_, endRow_) {
    this._draw = true;
    for(var i = startCol_; i < endCol_; ++i) {
      var col = this.drawCol(i);

      this._model._grid[i] = new Array();
      for(var j = startRow_; j < endRow_; ++j) {
        this.drawGrid(col, i, j);
      }  
    }
    // var $grid = $('.grid');
    // this._model.setGridSize({
      // 'gridWidth': $grid.width(),
      // 'gridHeight': $grid.height()
    // });
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

  destroyCol: function($col, i) {
    this._model._grid[i] = null;
    delete this._model._grid[i];
    $col.remove();
  },

  destroyGrid: function($col, i, j) {
    var $grids = $col.children();
    this._model._grid[i][j] = null;
    delete this._model._grid[i][j];
    $($grids[j]).remove();
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
    this._parent._model.off('resize', this.__handlers['resize']);
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
        if(data.match(/^http:\/\/.*/) != null) {
          _global._app.generateAppByURL(function(err_, appID_) {
            if(err_) return console.log(err_);
          }, data, {
            desktop: true,
            pos: {x: _target_col, y: _target_row}
          });
        } else {
          if(data.match(/^https:\/\/.*/) != null)
            alert('目前不支持http协议以外的协议，尽情期待..');
          // TODO: using demo-ris's API to create this file
          /*var _this = this,
              iconv = require('iconv-lite'),
              buf = iconv.encode(data,'ucs2'),
              str = iconv.decode(buf,'ucs2');*/
          // TODO: extract text from html code
          _global._dataOP.createFileOnDesk(function(err_, ret_) {
            if(err_) return console.log(err_);
            _this._controller.onAddFile(ret_[0], ret_[1]);
          }, data);
        }
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
      'placeholder': _global._locale.langObj['search'] + '...'//,
      // 'autofocus': 'autofocus'
    }))));
    this.initAction();
    this.initCtxMenu();
    this._c = [];
    this._views = [];
    this._cur_views = [];
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
            cg_ = app_.getCategory(),
            lang = _global._locale.langObj;
        if(typeof _this._views[id_] === 'undefined') return ;
        _this._views[id_].hide();
        _this._views[id_] = null;
        delete _this._views[id_];
        _this._c['All'].subject.attr('title', lang['All'] + '(' + --_this._c['All'].length + ')');
        if(typeof cg_ != 'undefined' && cg_ != 'All')
          _this._c[cg_].subject.attr('title', lang[cg_] + '(' + --_this._c[cg_].length + ')');
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
    var _this = this,
        c_input = this.$view.find('.c-s-input');
    _this.$view.on('mousemove', function(e) {
      e.stopPropagation();
    }).on('mousedown', function(e) {
      e.stopPropagation();
    }).on('click', function(e) {
      e.stopPropagation();
      _this.toggle();
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
    c_input.on('input', function() {
      for(var i = 0; i < _this._cur_views.length; ++i)
        _this._cur_views[i].view.toShow(_this._cur);
      var inName = c_input.val();
      if(inName == '') return ;
      var regName = new RegExp('.*' + inName + '.*', 'i');
      for(var i = 0; i < _this._cur_views.length; ++i) {
        if(_this._cur_views[i].name.match(regName) == null)
          _this._cur_views[i].view.toHide(_this._cur);
      }
    }).on('click', function(e) {
      e.stopPropagation();
    });
  },

  initCtxMenu: function() {
    var _this = this,
        ctxMenu = _global.get('ctxMenu'),
        lang = _global._locale.langObj;
    ctxMenu.addCtxMenu([
      {header: 'launcher'},
      {text: lang['run'], action: function(e) {
        e.preventDefault();
        _this._views[ctxMenu._rightObjId]._controller.onClick();
        _this.toggle();
      }},
      {text: lang['add2desktop'], action: function(e) {
        e.preventDefault();
        _this._views[ctxMenu._rightObjId]._controller.onAddToDesktop();
        _this.toggle();
      }},
      {text: lang['add2dock'], action: function(e) {
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
    var title = _global._locale.langObj[cg];
    if(typeof this._c[cg] === 'undefined') {
      var _this = this;
      _this._c[cg] = {
        'subject': $('<div>', {
                    'class': icon + ' sub-entry',
                    'title': title + '(0)'
                  }).on('click', function(e) {
                    e.stopPropagation();
                    _this._c[_this._cur].content.hide();
                    _this._c[_this._cur].subject.removeClass('open');

                    _this._c[cg].content.show();
                    _this._c[cg].subject.addClass('open');
                    _this._last = _this._cur;
                    _this._cur = cg;
                    _this.__initSearchBar();
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
      this._c[cg].subject.attr('title', title + '(' + ++this._c[cg].length + ')');
    }
  },

  toggle: function() {
    if(this._shown) {
      this.$view.hide().children('canvas').remove();
      this._c[this._cur].content.hide();
      this._c[this._cur].subject.removeClass('open');
      this._shown = false;
      this.$view.find('.c-s-input').val('');
    } else {
      var _this = this;
      html2canvas($('.dbg'), {
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
          _this.__initSearchBar();
        }
      });
    }
  },

  __initSearchBar: function() {
    for(var i = 0; i < this._cur_views.length; ++i)
      this._cur_views[i].view.toShow(this._last);
    var s_input = this.$view.find('.c-s-input')[0],
        kids = this._c[this._cur].content.children(),
        entrys = [];
    s_input.focus();
    for(var i = 0; i < kids.length; ++i) {
      entrys.push({
        view: this._views[kids[i].id],
        name: this._views[kids[i].id].getModel().getName()
      });
    }
    this._cur_views = entrys;
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
    _this.__handlers = {
      'category': function(err_, cg_) {
        if(_this.$view2 == null) {
          _this.$view2 = _this.$view.clone();
          _this.initAction(_this.$view2);
        }
        var cg = _global._App_Cate[cg_],
            title = _global._locale.langObj[cg];
        _this._contents[cg].subject.attr('title', title + '(' + ++_this._contents[cg].length + ')');
        _this._contents[cg].content.append(_this.$view2);
      },
      'imgPath': function(err_, imgPath_) {
        _this.$view.children('img').attr('src', imgPath_);
        if(_this.$view2 != null) {
          _this.$view2.children('img').attr('src', imgPath_);
        }
      },
      'name': function(err_, name_) {
        _this.$view.children('p').text(name_);
        if(_this.$view2 != null) {
          _this.$view2.children('p').text(name_);
        }
      },
      'noDisplay': function(err_, noDisplay_) {
        if(err_) {
          console.log(err_);
          return ;
        }
        if(noDisplay_) {
          _this.hide();
          _this._parent._c['All'].subject.attr('title'
            , _global._locale.langObj['All'] + '(' + --_this._parent._c['All'].length + ')');
          _this._parent._views[_this._id] = null;
          delete _this._parent._views[_this._id];
        }
      }
    };
    for(var key in _this.__handlers) {
      _this._model.on(key, _this.__handlers[key]);
    }
  },

  initAction: function($view) {
    var _this = this,
        ctxMenu = _global.get('ctxMenu'),
        $menu_ = ctxMenu.getMenuByHeader('launcher');
    $view.on('click', function(e) {
      e.stopPropagation();
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
  },

  toShow: function(cg) {
    if(cg == 'All') this.$view.show();
    else this.$view2.show();
  },

  toHide: function(cg) {
    if(cg == 'All') this.$view.hide();
    else this.$view2.hide();
  }
});

var DeviceListView = View.extend({
  init: function(model_, parent_) {
    this.callSuper('device-list', model_, parent_);
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'device-list',
      'id': this._id,
      'onselectstart': 'return false'
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
    this._imChatWinList = {}; 
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
      },
      'imMsg': function(toAccountInfo_) {
        var curEditBox;
        var editBoxID;
        if(toAccountInfo_.group=== ''){//设备对设备通信
          editBoxID = toAccountInfo_.toUID;
        }else{//群组通信
          if(toAccountInfo_.group=== toAccountInfo_.toAccount){//本地设备对应用户群组
            editBoxID = toAccountInfo_.group;
          }else{//设备对应用户群组通信
            editBoxID = toAccountInfo_.group[0]===toAccountInfo_.toAccount?toAccountInfo_.group[1][0]+'-'+toAccountInfo_.group[1][1]+'---'+toAccountInfo_.group[0]:toAccountInfo_.group[0]+'---'+toAccountInfo_.group[1][0]+'-'+toAccountInfo_.group[1][1];
          }
        }
        toAccountInfo_['identity']=editBoxID;
        curEditBox = _this._imChatWinList[editBoxID];
        var msg = toAccountInfo_['msg'];
        var fileMsg = msg.msg;
        if (curEditBox === undefined) {
          _this._model.getToAccountInfo(toAccountInfo_,function(toAccInfoTmp){
            toAccountInfo_=toAccInfoTmp;
            _global._imV.getLocalData(function(localData) {
	      if (fileMsg.type === undefined) {//聊天信息
		var fromAcc;
		if (localData.UID === toAccountInfo_.fromUID) {
		  fromAcc='您的远端';
		}else{
		  fromAcc=toAccountInfo_.group === toAccountInfo_.toAccount ?toAccountInfo_.fromAccount : toAccountInfo_.fromAccount+'('+toAccountInfo_.fromUID+')';
		}
		Messenger().post({
		  message: '有来自'+fromAcc+'的新消息！',
		  type: 'info',
		  actions: {
		    close: {
		      label: '取消闪烁',
		      action: function() {
			Messenger().hideAll();
		      }
		    },
		    open: {
		      label: '查看',
		      action: function() {
			Messenger().hideAll();
			curEditBox = UEditBox.create(toAccountInfo_, _this._imChatWinList, _this._parent._c['layout']._selector);
			_this._imChatWinList[ editBoxID] = curEditBox;
		      }
		    }
		  }
		});
	      }else{
		if (fileMsg.type === 'file') {//文件传输相关信息
		  if (localData.UID === toAccountInfo_.fromUID) {//自身设备的其他访问终端，如本地设备的浏览器端 或者 相对于浏览器的本地设备
		    _this.imFileMsgShow(toAccountInfo_, function(abandon, labelTip, fileInfo) {
		      if (abandon)
			return;
		      toAccountInfo_['msgTip'] = labelTip;
		      toAccountInfo_['fileInfo'] = fileInfo;
		      Messenger().post({
			message: labelTip,
			type: 'info',
			actions: {
			  close: {
			    label: '取消闪烁',
			    action: function() {
			      Messenger().hideAll();
			    }
			  },
			  open: {
			    label: '查看',
			    action: function() {
			      Messenger().hideAll();
			      curEditBox = UEditBox.create(toAccountInfo_, _this._imChatWinList, _this._parent._c['layout']._selector);
			      _this._imChatWinList[editBoxID] = curEditBox;
			    }
			  }
			}
		      });
		    });
		  } else {//其他设备发来的文件传输信息
		    if (fileMsg.option === 0x0000 && fileMsg.state === undefined) {//文件传输请求，请求设备接收文件
		      var sendMsg = {};
		      sendMsg['IP'] = toAccountInfo_.toIP;
		      sendMsg['UID'] = toAccountInfo_.toUID;
		      sendMsg['Account'] = toAccountInfo_.toAccount;
		      sendMsg['App'] = 'imChat';
		      Messenger().post({
			message: toAccountInfo_.fromAccount + '(' + toAccountInfo_.fromUID + ')给你发文件\n' + fileMsg.fileName + '\n大小：' + fileMsg.fileSize,
			type: 'info',
			actions: {
			  close: {
			    label: '拒绝',
			    action: function() {
			      Messenger().hideAll();
			      fileMsg['state'] = '0'; //state=1：同意接受;state=0 ：不同意接受------------界面显示 
			      sendMsg['Msg'] = JSON.stringify(msg);
			      _global._imV.sendAppMsgByDevice(function(mmm) {}, sendMsg, _global.get('ws').getSessionID(), true);
			    }
			  },
			  open: {
			    label: '接收',
			    action: function() {
			      Messenger().hideAll();
			      fileMsg['state'] = '1'; //state=1：同意接受;state=0 ：不同意接受------------界面显示
			      sendMsg['Msg'] = JSON.stringify(msg);
			      _global._imV.sendAppMsgByDevice(function(mmm) {
				delete fileMsg['state'];
				curEditBox = UEditBox.create(toAccountInfo_, _this._imChatWinList, _this._parent._c['layout']._selector);
				_this._imChatWinList[editBoxID] = curEditBox;
			      }, sendMsg, _global.get('ws').getSessionID(), true);
			    }
			  }
			}
		      });
		    }
		  }
		}
	      }     
	    });
          });       
        } else {
          _global._openingWindows.focusOnAWindow(curEditBox._imWindow._id);
          curEditBox.showRec(toAccountInfo_, curEditBox);
        }
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
      if (_this._shown) {
        if (ev.clientX > _this.$view.width()) {
          leave();
          _this._shown = false;
        }
      } else {
        if (ev.clientX < _this.$view.position().left + _this.$view.width()) {
          enter();
          _this._shown = true;
        }
      }
    }
    $(document).on('mousemove', function(ev) {
      toggle(ev);
    });
    this.$view /* .on('mouseenter', function(e) { */
    // enter();
    // }).on('mouseleave', function(e) {
    // leave();
    /* }) */
    .on('dragenter', function(e) {
      enter();
    }) /* .on('dragleave', function(e) {   */
    // leave();
    // _this._shown = false;
    /* }) */
    .on('mousewheel', function(e) {
      var _scroll = this;
      if (typeof _this._wheel === 'undefined') {
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
  },
  imFileMsgShow: function(toAccountInfo_, cb_) {
    var abandon = true;
    var fileMsg = toAccountInfo_['msg'].msg;
    var labelTip;
    var fileInfo;
    switch (fileMsg.option) {
      case 0x0000://传输文件请求 / 接收文件响应 / 拒绝接收文件响应
        {
          abandon = false;
          switch (fileMsg.state) {
            case undefined://传输文件请求
              {
                var toAcc = toAccountInfo_.group === '' ? toAccountInfo_.toAccount + '(' + toAccountInfo_.toUID + ')':toAccountInfo_.identity;
                labelTip = '您的远端正在给' +toAcc+ '传输文件\n' + fileMsg.fileName + '\n大小：' + fileMsg.fileSize;
                fileInfo = {
                  'flag': 5, //远端正在给其他设备传输文件
                  'key': fileMsg.key,
                  'fileName': fileMsg.fileName,
                  'fileSize': fileMsg.fileSize
                };
              }
              break;
            case '0': // 拒绝接收文件响应
              {
                labelTip = '您的远端拒绝接收' + toAccountInfo_.toAccount + '(' + toAccountInfo_.toUID + ')传输的文件\n' + fileMsg.fileName + '\n大小：' + fileMsg.fileSize;
              }
              break;
            case '1'://接收文件响应
              {
                labelTip = '您的远端正在接收' + toAccountInfo_.toAccount + '(' + toAccountInfo_.toUID + ')传输的文件\n' + fileMsg.fileName + '\n大小：' + fileMsg.fileSize;
                fileInfo = {
                  'flag': 3, //远端正在接收其他设备传输的文件
                  'key': fileMsg.key,
                  'fileName': fileMsg.fileName,
                  'fileSize': fileMsg.fileSize
                };
              }
              break;
            default:
              ;
          }
        }
        break;
      case 0x0001://发送文件初始化失败  传输文件失败
        {
          if(fileMsg.state === '0'){
            abandon = false;
            labelTip =  '您的远端传输文件：' + fileMsg.fileName + '(大小：' + fileMsg.fileSize + ') 失败。';
          }else
          abandon = true;
        }
        break;
      case 0x0002://文件传输进度
        {
          if (fileMsg.state !== 1) {
            abandon = false;
            var ratioLabel;
            if (fileMsg.ratio === 1) {
              labelTip =  '您的远端成功接收文件：' + fileMsg.fileName + '(大小：' + fileMsg.fileSize + ')。';
            } else {
              if (fileMsg.state === 0) {
                labelTip = '您的远端接收文件：' + fileMsg.fileName + '(大小：' + fileMsg.fileSize + ') 失败。';
              } else {
                labelTip = '您的远端取消接收文件：' + fileMsg.fileName + '(大小：' + fileMsg.fileSize + ')。';
              }
            }
          }
        }
        break;
      case 0x0003://取消传输
        {
          abandon = false;
          labelTip = '您的远端中断传输文件：' + fileMsg.fileName + '(大小：' + fileMsg.fileSize + ')。';
        }
        break;
      default:
        abandon = true;
    }
    cb_(abandon, labelTip, fileInfo);
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
    this._controller = DevEntryController.create(this);
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
        var curDevEditBox = _this._parent._imChatWinList[dev_._position['txt'][1]];
        if (curDevEditBox !== undefined)
          curDevEditBox.deviceUpFunc(curDevEditBox, dev_._position,_this._parent._imChatWinList);
        curDevEditBox = _this._parent._imChatWinList[dev_._position['txt'][2]];
        if (curDevEditBox !== undefined)
          curDevEditBox.deviceUpFunc(curDevEditBox, dev_._position,_this._parent._imChatWinList);
        for(var key in _this._parent._imChatWinList) {
          var curWin = _this._parent._imChatWinList[key];
          if((key.indexOf('---')>-1)&&(curWin._group[0]===dev_._position['txt'][1]||dev_._position['txt'][2]===curWin._group[1][1]))
            curWin.deviceUpFunc(curWin, dev_._position,_this._parent._imChatWinList);
        }
      },
      'remove': function(err_, dev_) {
        if(err_) return console.log(err_);
        // TODO: remove a dev entry from this account
        _this._c[dev_.getID()].destroy();
        _this._c[dev_.getID()] = null;
        delete _this._c[dev_.getID()];
        var curDevEditBox = _this._parent._imChatWinList[dev_._position['txt'][1]];
        if (curDevEditBox !== undefined)
          curDevEditBox.deviceDownFunc(curDevEditBox, dev_._position);
        curDevEditBox = _this._parent._imChatWinList[dev_._position['txt'][2]];
        if (curDevEditBox !== undefined)
          curDevEditBox.deviceDownFunc(curDevEditBox, dev_._position);
        for(var key in _this._parent._imChatWinList) {
          var curWin = _this._parent._imChatWinList[key];
          if((key.indexOf('---')>-1)&&(curWin._group[0]===dev_._position['txt'][1]||dev_._position['txt'][2]===curWin._group[1][1]))
            curWin.deviceDownFunc(curWin, dev_._position);
        }
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
      },
      'openImChat':function(toAccountInfo_,cb_){
        var curEditBox = UEditBox.create(toAccountInfo_, _this._parent._imChatWinList,_this._parent._parent._c['layout']._selector);
        _this._parent._imChatWinList[toAccountInfo_.identity] = curEditBox;
        cb_(curEditBox);
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
      _global._imV.getLocalData(function(localData){
        var curEditBox;
        var identity;
        if(localData.account===_this._model._position['txt'][1]){
          identity=_this._model._position['txt'][1];
          curEditBox = _this._parent._imChatWinList[identity];
        }else{
          identity=localData.account+'-'+localData.UID+'---'+ _this._model._position['txt'][1];
          curEditBox = _this._parent._imChatWinList[identity];
        }
        if (curEditBox === undefined) {
          localData['identity']=identity;
          _this._controller.onDblclick(function(curEditBoxTmp){
            curEditBox=curEditBoxTmp;
          },localData);
        }else{
          _global._openingWindows.focusOnAWindow(curEditBox._imWindow._id);
        }
        _this._controller.onDrop(function(filePaths){
          for (var i = 0; i < filePaths.length; ++i) {
            curEditBox.fileUpload(curEditBox,filePaths[i]);
          }
        },e, _this._parent._parent._c['layout']._selector.getSelectedItems());
      });
    }).dblclick(function(e) {
      e.stopPropagation();
      _global._imV.getLocalData(function(localData){
        var curEditBox;
        var identity;
        if(localData.account===_this._model._position['txt'][1]){
          identity= _this._model._position['txt'][1];
          curEditBox = _this._parent._imChatWinList[identity];
        }else{
          identity=localData.account+'-'+localData.UID+'---'+ _this._model._position['txt'][1];
          curEditBox = _this._parent._imChatWinList[identity];
        }
        if (curEditBox === undefined) {
          localData['identity']=identity;
          _this._controller.onDblclick(function(curEditBox){
          },localData);
        }else{
          _global._openingWindows.focusOnAWindow(curEditBox._imWindow._id);
        }
      });
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
    this._controller = DevEntryController.create(this);
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
      },
      'openImChat': function(toAccountInfo_, cb_) {
        var curEditBox = UEditBox.create(toAccountInfo_, _this._parent._parent._imChatWinList, _this._parent._parent._parent._c['layout']._selector);
        _this._parent._parent._imChatWinList[ toAccountInfo_.identity] = curEditBox;
        cb_(curEditBox);
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
      _global._imV.getLocalData(function(localInfo){
        if(localInfo.UID!== _this._model._position['txt'][2]){
          var curEditBox = _this._parent._parent._imChatWinList[ _this._model._position['txt'][2]];
          if (curEditBox === undefined) {
            _this._controller.onDblclick(function(curEditBoxTmp) {
              curEditBox = curEditBoxTmp;
            });
          }else{
            _global._openingWindows.focusOnAWindow(curEditBox._imWindow._id);
          }
          _this._controller.onDrop( function(filePaths) {
            for (var i = 0; i < filePaths.length; ++i) {
              curEditBox.fileUpload(curEditBox, filePaths[i]);
            }
          },e, _this._parent._parent._parent._c['layout']._selector.getSelectedItems());
        }
      });   
    }).dblclick(function(e) {
      e.stopPropagation();
      _global._imV.getLocalData(function(localInfo){
        if(localInfo.UID!== _this._model._position['txt'][2]){
          var curEditBox = _this._parent._parent._imChatWinList[_this._model._position['txt'][2]];
          if (curEditBox === undefined) {
            _this._controller.onDblclick(function(curEditBox) {});
          }else{
            _global._openingWindows.focusOnAWindow(curEditBox._imWindow._id);
          }
        }
      });
      
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
            a = ev.clientX - (jqImg.offset().left + jqImg.width() / 2),
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
        ctxMenu = _global.get('ctxMenu'),
        lang = _global._locale.langObj;
    ctxMenu.addCtxMenu([
      {header: 'dock'},
      {text: lang['property'], action: function(e) {
        e.preventDefault();
        var id_ = /([\w-_\s\.]+)-dock$/.exec(ctxMenu._rightObjId);
        PropertyView.create(id_[0], _this._model.getCOMById(id_[1]), _this._model).show();
      }},
      {text: lang['add_reflect'], action: function() {
        _this.addReflect();
      }},
      {text: lang['remove_reflect'], action: function() {
        _this.removeReflect();
      }},
      {text: lang['delete'], action: function() {
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

    var lang = _global._locale.langObj;
    // main div
    this.$view = $('<div>', {
      'class': 'property',
      'id': id_ + '-property',
      'z-index': '10000'
    });
    
    // title 
    this.$view.append($('<h2>',{
      'id': id_ + '-title',
      'text': this._model.getName() + ' ' + lang['property']
    }));

    // content
    this._tab = Tab.create('property-tab', ['basic', 'power']);
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
      'text': lang['close']
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
    this.__getArea(); 

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
          // TODO: may hasn't focus function!!
          _items[i].focus();
        }
      }
    }).resize(function() {
      _this.__getArea();
    });
  },

  __getArea: function() {
    var _view = this._c.getView(),
        _pos = _view.position(),
        _width = _view.width(),
        _height = _view.height();
    // _c_SX => _container_StartX
    // _c_SY => _container_StartY
    // _c_SX => _container_EndX
    // _c_SY => _container_EndY
    this._c_SX = _pos.left;
    this._c_SY = _pos.top;
    this._c_EX = _pos.left + _width;
    this._c_EY = _pos.top + _height;
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
    _this.__handlers['resize'] = function(err_, size_) {
      _this._model.setSize(size_);
      // modify selector's size
      if(_this._needSelector) _this._selector.__getArea();
    };
    _this._parent._model.on('resize', _this.__handlers['resize']);
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

  hide: function() {
    this._parent._model.off('resize', this.__handlers['resize']);
    this.$view.remove();
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
  init: function(toAccountInfo_, imChatWinList_, selector_) {
    this._selector = selector_;
    this._fileTransList = {};
    this._toIdentity=toAccountInfo_.identity;
    this._title;
    this._onLineCount = 0;
    this._group = toAccountInfo_.group;
    if (toAccountInfo_.group === '') {
      this._title = toAccountInfo_.toAccount + '-' + toAccountInfo_.toUID;
    } else {
      this._title = toAccountInfo_.identity;
    }
    this._localAccount;
    this._localUID;
    this._toAccountInfo = toAccountInfo_;
    var sendTime;
    var msgtime;
    var _this = this;
    _global._imV.getLocalData(function(localData) {
      _this._localAccount = localData.account;
      _this._localUID = localData.UID;
    });
    this._imWindow = Window.create('imChat_' + _this._toIdentity, _this._title, {
      height: 600,
      width: 640,
      max: false,
      resize: false
    }, function() {
      this.getID = function() {
        return this._id;
      };
      _global._openingWindows.add(this);
      this.onfocus(function() {
        _global._openingWindows.focusOnAWindow(this._id);
      });
      var idstr = '#' + 'window-' + this._id + '-close';
      $(idstr).unbind();
      $(idstr).bind('mousedown', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
      });
      $(idstr).bind('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
      });
      $(idstr).bind('mouseup', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        _this.closeBtnFunc(_this, imChatWinList_);
      });
    });
    this.$view = $('<div class="imChat">').html('<div class="imLeftDiv">\
    <div class ="upLoadFile" >\
    <input type="file" id="file_' + _this._toIdentity + '" style="display:none"/>\
    <img id="file_button_' + _this._toIdentity + '"  src="img/uploadFile.png"  width=25px  height=25px title="发送文件" />\
    </div>\
    <div  id="disp_text_' + _this._toIdentity + '" class="imChat_dataDiv"></div>\
    <div class="imChat_ueditorDiv" id="myEditor_' + _this._toIdentity + '" ></div>\
    <div class="imChat_btnDiv"> \
    <button type="button" class="imCloseBtn" id="close_button_' + _this._toIdentity + '">关闭</button> \
    <button type="button" class="imSendBtn" id="send_button_' + _this._toIdentity + '" title="按ctrl+enter键发送消息">发送</button></div></div>\
    <div class="imRightDiv">\
    <div class="chatList" id="memList_' + _this._toIdentity + '"  style="display:block">\
                    <div class="chatList_title">\
                        <label class="chatList_mem_t">\
                            成员列表</label>\
                    </div>\
                    <div class="chatListMem_content" id="memInfoCtn_' + _this._toIdentity + '">\
                    </div>\
                </div>\
             <div class="chatList" id="fileTransShow_' + _this._toIdentity + '"  style="display:none">\
                    <div class="chatList_title">\
                        <label class="chatList_acc_t">\
                            正在传输文件...</label>\
                    </div>\
                    <div class="chatListFile_content" id="fileTransCtn_' + _this._toIdentity + '">\
                        <ul id="fileTransList_' + _this._toIdentity + '">\
                        </ul>\
                    </div>\
                </div>\
            </div>');
    this._imWindow.append(this.$view);
    _global._openingWindows.focusOnAWindow(_this._imWindow._id);
    _this.$view.on('dragenter', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('dragover', function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
    }).on('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('dragleave', function(e) {
      e.stopPropagation();
      e.preventDefault();
    });
    /*    for (var i = 0; i < toAccountInfo_.toAccList.length; i++) {
      toAccInfo = toAccountInfo_.toAccList[i];
      $('#memInfoList_' + toIdentity).append('<li>\
                                <label class="online">\
                                </label>\
                                <a href="javascript:;">\
                                    <img src="img/device.png"/></a><a href="javascript:;" class="chatList_name">' + toAccInfo['toAccount'] + '<br/>' + toAccInfo['toUID'] + '<br/>' + toAccInfo['toIP'] + '</a>\
                            </li>');
    }*/
    var deviceItems = [];
    var i = 0;
    for (var toAccListKey in toAccountInfo_.toAccList) {
      var toAccInfo = toAccountInfo_.toAccList[toAccListKey];
      _this._onLineCount += toAccInfo.onLineFlag;
      deviceItems[i] = {
        id: 'memItem_' + toAccInfo.toUID,
        type: "item",
        img: "img/device.png",
        text: toAccInfo.toAccount + '<br/>UID:' + toAccInfo.toUID.substr(0, 20),
        dblclkaction_p: {
          'accInfo': toAccInfo
        },
        dblclkaction: function(ev) {
          if (ev.data.accInfo.toUID === _this._localUID) {
            return;
          } else {
            var devEditBoxItem = imChatWinList_[ev.data.accInfo.toUID];
            if (devEditBoxItem === undefined) {
              var toAccountInfoItem = {};
              toAccountInfoItem['toAccount'] = ev.data.accInfo.toAccount;
              toAccountInfoItem['toIP'] = ev.data.accInfo.toIP;
              toAccountInfoItem['toUID'] = ev.data.accInfo.toUID;
              toAccountInfoItem['identity'] = ev.data.accInfo.toUID;
              toAccountInfoItem['group'] = '';
              var toAccounts = {};
              var toAccListItem = {};
              toAccListItem['toAccount'] = ev.data.accInfo.toAccount;
              toAccListItem['toIP'] = ev.data.accInfo.toIP;
              toAccListItem['toUID'] = ev.data.accInfo.toUID;
              toAccListItem['onLineFlag'] = ev.data.accInfo.onLineFlag;
              toAccounts[ev.data.accInfo.toUID] = toAccListItem;
              toAccountInfoItem['toAccList'] = toAccounts;
              devEditBoxItem = UEditBox.create(toAccountInfoItem, imChatWinList_, _this._selector);
              imChatWinList_[ev.data.accInfo.toUID] = devEditBoxItem;
            } else {
              _global._openingWindows.focusOnAWindow(devEditBoxItem._imWindow._id);
            }
          }
        }
      };
      i++;
    }
    this._memListView = ListView.create('memInfoList_' + _this._toIdentity, {
      'width': 175
    });
    this._memListView.addItems(deviceItems);
    this._memListView.attach('memInfoCtn_' + _this._toIdentity);
    this._um = UE.getEditor('myEditor_' + _this._toIdentity, {
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
      elementPathEnabled: false,
      tableDragable: false,
      autoHeightEnabled:false
      //autoClearEmptyNode : false
    });
    var iframeBody = _this.$view.find('iframe').contents().find('body');
    iframeBody.on('dragleave', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('dragover', function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
      ev.originalEvent.dataTransfer.dropEffect = 'copy';
    }).on('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
      _this.onDropFile(_this, e, _this._selector.getSelectedItems());
    }).on('dragleave', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }).on('click', function(ev) {
      _global._openingWindows.focusOnAWindow(_this._imWindow._id);
    });
    iframeBody.on('keyup',function(e){
      if(e.ctrlKey&&e.keyCode===13){
        _this.sendMsg(_this,toAccountInfo_);
      }
    });
    this._contentTip = MiniTip.create('send_button_' + _this._toIdentity, {
      event: 'custom',
      anchor: 'n'
    });
    this._fileTip = MiniTip.create('file_button_' + _this._toIdentity, {
      event: 'custom',
      anchor: 's'
    });
    $('#close_button_' + _this._toIdentity).on('click', function() {
      _this.closeBtnFunc(_this, imChatWinList_);
    });
    $('#file_button_' + _this._toIdentity).on('click', function() {
      if (!(_global.get('ws').isLocal())) {
        _this._fileTip.show({
          content: '暂不支持远程浏览器传输文件!'
        });
        setTimeout(function() {
          _this._fileTip.hide();
        }, 3000);
        return;
      }
      var ie = navigator.appName == "Microsoft Internet Explorer" ? true : false;
      if (ie) {
        document.getElementById("file_" + _this._toIdentity).click();
      } else {
        var a = document.createEvent("MouseEvents"); //FF的处理 
        a.initEvent("click", true, false);
        document.getElementById("file_" + _this._toIdentity).dispatchEvent(a);
      }
      $('#file_' + _this._toIdentity).on('change', function() {
        var fileUp = $('#file_' + _this._toIdentity);
        fileUp.after(fileUp.clone().val(''));
        fileUp.remove();
        var val = fileUp.val();
        if (val !== '' && val !== undefined && val !== null) {
          if (_this._onLineCount === 0) {
            Messenger().post('当前没有设备在线，您将不能发送文件！');
            return;
          }
          _this.fileUpload(_this, val);
        }
      });
    });
    $('#send_button_' + _this._toIdentity).on('click', function() {
      _this.sendMsg(_this,toAccountInfo_);
    });
    if (toAccountInfo_.msg !== undefined) {
      _this.showRecDetail(toAccountInfo_, _this, false);
    }
  },

  sendMsg:function(curEditBox_,toAccountInfo_){
    if (curEditBox_._onLineCount === 0) {
        Messenger().post('当前没有设备在线，您将不能发送信息！');
        return;
      }
      if (curEditBox_._um.hasContents()) {
        var msg = curEditBox_._um.getContent();

        function sendIMMsgCb() {
          curEditBox_.divAppendContent($('#disp_text_' + curEditBox_._toIdentity),'<span class="accountFont"> 您&nbsp;&nbsp;&nbsp;</span><span class="timeFont"> ' + sendTime + '  :</span><br/>' + msg);
          curEditBox_._um.setContent('');
        }
        msgtime = new Date();
        sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
        var sendMsg = {};
        sendMsg['IP'] = toAccountInfo_.toIP;
        sendMsg['UID'] = toAccountInfo_.toUID;
        sendMsg['toAccList'] = toAccountInfo_.toAccList;
        sendMsg['Account'] = toAccountInfo_.toAccount;
        sendMsg['localUID'] = curEditBox_._localUID;
        sendMsg['group'] = curEditBox_._group;
        sendMsg['Msg'] = JSON.stringify({
          'group': curEditBox_._group,
          'msg': msg
        });
        sendMsg['App'] = 'imChat';
        _global._imV.sendIMMsg(function(mmm) {
          sendIMMsgCb();
        }, sendMsg, _global.get('ws').getSessionID(), true);
      } else {
        curEditBox_._contentTip.show({
          content: '发送内容不能为空！'
        });
        setTimeout(function() {
          curEditBox_._contentTip.hide();
        }, 3000);
      }
  },

  showRec: function(toAccountInfo_, curEditBox_) {
    curEditBox_.showRecDetail(toAccountInfo_, curEditBox_, true);
  },

  showRecDetail: function(toAccountInfo_, curEditBox_, flag_) {
    var msg = toAccountInfo_.msg.msg;
    var toIdentity = curEditBox_._toIdentity;
    var msgtime = new Date();
    var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
    if (msg.type === undefined || toAccountInfo_.msgTip !== undefined) {
      if (toAccountInfo_.msgTip === undefined) {
        if(curEditBox_._localUID===undefined){
          _global._imV.getLocalData(function(localData) {
            var fromAcc=toAccountInfo_.fromUID===localData.UID?'您的远端':toAccountInfo_.fromAccount+'('+toAccountInfo_.fromUID+')';
            var txtShow = '<span  class="accountFont">' +  fromAcc+ '&nbsp;&nbsp;&nbsp;</span><span class="timeFont"> ' + sendTime + '  :</span><br/>' + msg;
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity),txtShow);
          });
        }else{
          var fromAcc=toAccountInfo_.fromUID===curEditBox_._localUID?'您的远端':toAccountInfo_.fromAccount+'('+toAccountInfo_.fromUID+')';
          var txtShow = '<span  class="accountFont">' +  fromAcc+ '&nbsp;&nbsp;&nbsp;</span><span class="timeFont"> ' + sendTime + '  :</span><br/>' + msg;
          curEditBox_.divAppendContent($('#disp_text_' + toIdentity),txtShow);
        }   
      } else {
        var txtShow = '<span class="timeFont"> ' + sendTime + '  :</span><br/>' + toAccountInfo_.msgTip + '<br/>';
        curEditBox_.divAppendContent($('#disp_text_' + toIdentity),txtShow);
        if (toAccountInfo_.fileInfo !== undefined) {
          curEditBox_._fileTransList[toAccountInfo_.fileInfo.key] = toAccountInfo_.fileInfo;
        }
      }
    } else {
      var sendMsg = {};
      sendMsg['IP'] = toAccountInfo_.toIP;
      sendMsg['UID'] = toAccountInfo_.toUID;
      sendMsg['toAccList'] = curEditBox_._toAccountInfo.toAccList;
      sendMsg['Account'] = toAccountInfo_.toAccount;
      sendMsg['localUID'] = curEditBox_._localUID;
      sendMsg['fromAccount'] = toAccountInfo_.fromAccount;
      sendMsg['fromUID'] = toAccountInfo_.fromUID;
      sendMsg['group'] = curEditBox_._group;
      sendMsg['App'] = 'imChat';
      if (msg.type === 'file') {
        curEditBox_.showFileRecDetatil(curEditBox_, msg, sendMsg, flag_);
      }
    }
  },

  showFileRecDetatil: function(curEditBox_, msg_, sendMsg_, flag_) {
    var toIdentity = curEditBox_._toIdentity;
    switch (msg_.option) {
      case 0x0000:
        { //收到发送端传输文件的请求------------界面显示
          if (curEditBox_._localUID === sendMsg_.fromUID && msg_.state === undefined) {
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            var sendAcc=sendMsg_.group===''?sendMsg_.Account + '(' + sendMsg_.UID + ')':curEditBox_._toIdentity;
            var labelTip = '您的远端正在给' + sendAcc+'传输文件\n' + msg_.fileName + '\n大小：' + msg_.fileSize;
            var fileInfo = {
              'flag': 5, //远端正在给其他设备传输文件
              'fileName': msg_.fileName,
              'fileSize': msg_.fileSize
            };
            curEditBox_._fileTransList[msg_.key] = fileInfo;
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>' + labelTip + '<br/>');
          } else {
            if (msg_.state === undefined) {
              if (flag_) {
                curEditBox_._fileTransList[msg_.key] = {
                  'flag': 0,
                  'path': '',
                  'fileName': msg_.fileName,
                  'fileSize': msg_.fileSize
                };
                $('#memList_' + toIdentity).hide();
                $('#fileTransShow_' + toIdentity).show();
                var txt= '<li id="fileTransItem_' + msg_.key + '">\
                    <div><img src="img/uploadFile.png"/><span title="' + msg_.fileName + '" class="chatList_name">' + msg_.fileName.substr(0, 8) + '...<br/>大小：' + msg_.fileSize + '</span><br/><br/></div>\
                    <div><button type="button"  id="refuseFileItem_' + msg_.key + '" class="chatList_btn">拒绝</button>\
                    <button type="button"  id="acceptFileItem_' + msg_.key + '" class="chatList_btn">接收</button></div>\
                    </li>';
                $('#fileTransList_' + toIdentity).append(txt);
                var fileTransCtn=$('#fileTransCtn_'+toIdentity)[0];
                fileTransCtn.scrollTop=fileTransCtn.scrollHeight;
                $('#refuseFileItem_' + msg_.key).on('click', function() {
                  curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
                  curEditBox_.refuseFileItemTransfer(curEditBox_, msg_, sendMsg_);
                });
                $('#acceptFileItem_' + msg_.key).on('click', function() {
                  curEditBox_.acceptFileItemTransfer(curEditBox_, msg_, sendMsg_, flag_);
                });
              } else {
                curEditBox_.acceptFileItemTransfer(curEditBox_, msg_, sendMsg_, flag_);
              }
            } else {
              curEditBox_.recieverAcceptOrRefuce(curEditBox_, msg_, sendMsg_);
            }
          }
        }
        break;
      case 0x0001:
        { //收到发送端可以进行传输文件的响应      
          if (curEditBox_._fileTransList[msg_.key] === undefined) {
            return;
          }
          if (msg_.state === '0') { //不可以传输了------------界面显示 
            curEditBox_.fileItemTransRemove(curEditBox_, msg._key, true);
            var ratioLable = '传输文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ') 失败。';
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
          } else {
            curEditBox_.recieverFileTransBegin(curEditBox_, msg_, sendMsg_, flag_);
          }
        }
        break;
      case 0x0002:
        { //收到接收文件端的传输文件进度      
          curEditBox_.showFileItemRatio(curEditBox_, msg_, sendMsg_);
        }
        break;
      case 0x0003:
        { //收到发送端取消传输文件的请求 
          if (curEditBox_._fileTransList[msg_.key] === undefined) {
            return;
          }
          _global._imV.transferCancelReciever(function() {
            var fromAcc;
            var ratioLable;
            switch (msg_.state) {
              case 0:
                {
                  curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
                  if(sendMsg_.fromUID===curEditBox_._localUID){
                    fromAcc='您的远端';
                  }else{
                    fromAcc = curEditBox_._group === '' ? '对方' : sendMsg_.fromAccount + '(' + sendMsg_.fromUID + ')';
                  }
                  ratioLable = fromAcc + '中止了传输文件 ："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
                }
                break;
              case 1:
                {
                  curEditBox_._fileTransList[msg_.key].flag = 4;
                  curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, false);
                  ratioLable = msg_.Account + '(' + msg_.UID + ')正在接收文件 ："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
                }
                break;
              case 2:
                {
                  curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
                  ratioLable = msg_.Account + '(' + msg_.UID + ')拒绝接收文件 ："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
                }
                break;
              default:
                console.log('transferCancelReciever  undefined');
            }
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
          }, msg_.key);
        }
        break;
      case 0x0004:
        {
          if(curEditBox_._fileTransList[msg_.key]!== undefined){
            curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>您的传输请求已过期。<br/>');
          }
        }
        break;
      default:
        {
          console.log('processFileRequest default');
        }
    }
  },

  fileUpload: function(curEditBox_, filePath_) {
    if (!(_global.get('ws').isLocal())) {
      curEditBox_._contentTip.show({
        content: '暂不支持远程浏览器传输文件!'
      });
      setTimeout(function() {
        curEditBox_._contentTip.hide();
      }, 3000);
      return;
    }
    var toIdentity = curEditBox_._toIdentity;
    var toAccountInfo = curEditBox_._toAccountInfo;

    function sendIMFileCb(err, fileTransMsg, val) {
      if (err) {
        if (fileTransMsg === 0) {
          curEditBox_._fileTip.show({
            content: '待发送的文件大小为0，不能发送！'
          });
          setTimeout(function() {
            curEditBox_._fileTip.hide();
          }, 3000);
        } else {
          Messenger().post('找不到该文件！');
        }
      } else {
        var fileMsg = fileTransMsg.Msg;
        if (curEditBox_._fileTransList[fileMsg.key] !== undefined) {
          Messenge.create().post({
            message: '文件暂' + fileMsg.fileName + '不能发送！',
            type: 'error',
            showCloseButton: true,
            actions: {
              sure: {
                label: '确定',
                action: function() {
                  Messenge.create().hideAll()
                }
              }
            }
          });
          return;
        }
        var curFile = curEditBox_._fileTransList[fileMsg.key] = {
          'flag': 2,
          'path': val,
          'fileName': fileMsg.fileName,
          'fileSize': fileMsg.fileSize
        };
        if (curEditBox_._group !== '') {
          var memList = {};
          for (var toAccListKey in toAccountInfo.toAccList) {
            memList[toAccListKey] = 0;
          }
          curFile['memList'] = memList;
        }
        fileTransMsg.Msg = JSON.stringify({
          'group': curEditBox_._group,
          'msg': fileMsg
        });
        _global._imV.sendIMMsg(function(mmm) {
          $('#memList_' + toIdentity).hide();
          $('#fileTransShow_' + toIdentity).show();
          var txt = '<li id="fileTransItem_' + fileMsg.key + '">\
                    <div><img src="img/uploadFile.png"/><span  title="' + fileMsg.fileName + '" class="chatList_name">' + fileMsg.fileName.substr(0, 8) + '...<br/>大小：' + fileMsg.fileSize + '</span></div>\
                    <div><span id="fileRatio_' + fileMsg.key + '"></span><br/><div id= "fileGaugeDiv_' + fileMsg.key + '"></div></div>\
                    <div><button type="button"  id="cancelFileItem_' + fileMsg.key + '" class="chatList_btn">取消</button></div>\
                    </li>';
          $('#fileTransList_' + toIdentity).append(txt);
          var fileTransCtn = $('#fileTransCtn_' + toIdentity)[0];
          fileTransCtn.scrollTop = fileTransCtn.scrollHeight;
          $('#fileRatio_' + fileMsg.key).text('0%');
          var _gauge = Gauge.create();
          _gauge.add($("#fileGaugeDiv_" + fileMsg.key), {
            width: 148,
            height: 1,
            name: 'fileGauge_' + fileMsg.key,
            limit: true,
            gradient: true,
            scale: 10,
            colors: ['#ff0000', '#00ff00'],
            values: [0, 1]
          });
          $('#cancelFileItem_' + fileMsg.key).on('click', function() {
            var sendMsg = {};
            sendMsg['IP'] = toAccountInfo.toIP;
            sendMsg['UID'] = toAccountInfo.toUID;
            sendMsg['Account'] = toAccountInfo.toAccount;
            sendMsg['group'] = curEditBox_._group;
            sendMsg['localUID'] = curEditBox_._localUID;
            sendMsg['App'] = 'imChat';
            curEditBox_.transferCancelSender(fileMsg, true, 0, curEditBox_, sendMsg, curFile, undefined, function() {
              curEditBox_.fileItemTransRemove(curEditBox_, fileMsg.key, true);
              var ratioLable = '您中止了传输文件："' + fileMsg.fileName + '"(大小：' + fileMsg.fileSize + ')。';
              var msgtime = new Date();
              var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
              curEditBox_.divAppendContent($('#disp_text_' + toIdentity), '<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
            });
          });
        }, fileTransMsg, _global.get('ws').getSessionID(), true);
      }
    }
    var sendMsg = {};
    sendMsg['IP'] = toAccountInfo.toIP;
    sendMsg['UID'] = toAccountInfo.toUID;
    sendMsg['toAccList'] = toAccountInfo.toAccList;
    sendMsg['Account'] = toAccountInfo.toAccount;
    sendMsg['group'] = curEditBox_._group;
    sendMsg['localUID'] = curEditBox_._localUID;
    sendMsg['Msg'] = filePath_;
    sendMsg['App'] = 'imChat';
    _global._imV.sendFileTransferRequest(function(err, fileTransMsg) {
      sendIMFileCb(err, fileTransMsg, filePath_);
    }, sendMsg);
  },

  recieverAcceptOrRefuce: function(curEditBox_, msg_, sendMsg_) {
    var curFile = curEditBox_._fileTransList[msg_.key];
    if (curFile === undefined) {
      _global._imV.transferFileOutOfDate(function(rstMsg) {
        sendMsg_['Msg'] = JSON.stringify({
          'group': curEditBox_._group,
          'msg': rstMsg
        });
        _global._imV.sendAppMsgByDevice(function(mmm) {}, sendMsg_, _global.get('ws').getSessionID(), false);
      }, msg_);
      return;
    }
    var toIdentity = curEditBox_._toIdentity;
    if (msg_.state === '1') {
      switch (curFile.flag) {
        case 2:
          {
            curFile.flag = 6;
            if (curEditBox_._group !== '') {
              curEditBox_.transferCancelSender(msg_, false, 1, curEditBox_, sendMsg_, curFile, sendMsg_.UID, function() {});
            }
            _global._imV.sendFileTransferStart(function(err, fileTransMsg) {
              sendMsg_['Msg'] = JSON.stringify({
                'group': curEditBox_._group,
                'msg': fileTransMsg
              });
              if (err) {
                _global._imV.sendAppMsgByDevice(function(mmm) {
                  curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
                  var ratioLable = '传输文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ') 失败。';
                  var msgtime = new Date();
                  var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
                  curEditBox_.divAppendContent($('#disp_text_' + toIdentity), '<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
                }, sendMsg_, _global.get('ws').getSessionID(), true);
              } else {
                _global._imV.sendAppMsgByDevice(function(mmm) {}, sendMsg_, _global.get('ws').getSessionID(), true);
              }
            }, msg_, curEditBox_._fileTransList[msg_.key].path);
          }
          break;
        case 0:
          {
            curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, false);
            curFile.flag = 3;
            var ratioLable = '您的远端正在接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ') 。';
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity), '<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
            return;
          }
          break;
        case 5:
          {
            return;
          }
          break;
        case 6:
          {
            _global._imV.transferFileOutOfDate(function(rstMsg) {
              sendMsg_['Msg'] = JSON.stringify({
                'group': curEditBox_._group,
                'msg': rstMsg
              });
              _global._imV.sendAppMsgByDevice(function(mmm) {}, sendMsg_, _global.get('ws').getSessionID(), false);
            }, msg_);
          }
          break;
        default:
          ;
      }
    } else {
      switch (curFile.flag) {
        case 0:
          {
            curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
            var ratioLable = '您的远端拒绝接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ') 。';
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity), '<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
            return;
          }
          break;
        case 2:
          {
            if (curEditBox_._group !== '') {
              curEditBox_.transferCancelSender(msg_, true, 2, curEditBox_, sendMsg_, curFile, sendMsg_.UID, function() {});
            }
            var fromAcc = curEditBox_._group === '' ? '对方' : sendMsg_.fromAccount + '(' + sendMsg_.fromUID + ')';
            curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
            var ratioLable = fromAcc + '拒绝接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity), '<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
          }
          break;
        case 6:
          {
            _global._imV.transferFileOutOfDate(function(rstMsg) {
              sendMsg_['Msg'] = JSON.stringify({
                'group': curEditBox_._group,
                'msg': rstMsg
              });
              _global._imV.sendAppMsgByDevice(function(mmm) {}, sendMsg_, _global.get('ws').getSessionID(), false);
            }, msg_);
          }
          break;
        case 5:
          {
            var fromAcc = curEditBox_._group === '' ? '对方' : sendMsg_.fromAccount + '(' + sendMsg_.fromUID + ')';
            var ratioLable = fromAcc + '拒绝接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity), '<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
          }
          break;
        default:
          ;
      }
    }
  },

  recieverFileTransBegin: function(curEditBox_, msg_, sendMsg_, flag_) {
    if (curEditBox_._fileTransList[msg_.key] === undefined || (curEditBox_._fileTransList[msg_.key] !== undefined && curEditBox_._fileTransList[msg_.key].flag !== 1)) {
      return;
    }
    var toIdentity = curEditBox_._toIdentity;
    _global._imV.transferFileProcess(function(err, rst) { //传输文件
      if (curEditBox_._fileTransList[msg_.key] === undefined || (curEditBox_._fileTransList[msg_.key] !== undefined && curEditBox_._fileTransList[msg_.key].flag !== 1)) {
        return;
      }
      if (rst.initFile === 1) {
        curEditBox_._fileTransList[msg_.key] = {
          'flag': 1,
          'path': rst.filePath,
          'fileName': msg_.fileName,
          'fileNameLocal': rst.fileNameLocal,
          'fileSize': msg_.fileSize
        };
      } else {
        if (rst.option === 0x0002) {
          sendMsg_['Msg'] = JSON.stringify({
            'group': curEditBox_._group,
            'msg': rst
          });
          if (msg_.state === 1) {
            $('#fileRatio_' + msg_.key).text((msg_.ratio.toFixed(4) * 100) + '%');
            var _gauge = Gauge.create();
            _gauge.modify($('#fileGauge_' + msg_.key)[0], {
              values: [msg_.ratio.toFixed(4), 1]
            });
          } else {
            var ratioLabel;
            var filePath = curEditBox_._fileTransList[msg_.key].path;
            if (msg_.ratio === 1) {
              ratioLable = '您已成功接收文件："' + curEditBox_._fileTransList[msg_.key].fileNameLocal + '"(大小：' + msg_.fileSize + ')。';
            } else {
              if (msg_.state === 0) {
                ratioLable = '接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ') 失败。';
              } else {
                ratioLable = '您取消接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
              }
            }
            _global._dataOP.loadFile(function(err, result) {
              if (err) {
                //Messenger().post('err' + result);
              } else {
                _global._imV.deleteTmpFile(function(err, deleteRst) {}, filePath);
              }
            }, filePath);
            curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
          }
          _global._imV.sendIMMsg(function(mmm) {}, sendMsg_, _global.get('ws').getSessionID(), true);
        }
      }
    }, msg_, sendMsg_, _global.get('ws').isLocal());
  },

  showFileItemRatio: function(curEditBox_, msg_, sendMsg_) {
    var toIdentity = curEditBox_._toIdentity;
    if (curEditBox_._fileTransList[msg_.key] === undefined) {
      return;
    }
    switch (curEditBox_._fileTransList[msg_.key].flag) {
      case 6: //发送端显示接收进度
        {
          var fromAcc = curEditBox_._group === '' ? '对方' : sendMsg_.fromAccount + '(' + sendMsg_.fromUID + ')';
          _global._imV.transferProcessing(function() {
            if (msg_.state === 1) {
              $('#fileRatio_' + msg_.key).text((msg_.ratio.toFixed(4) * 100) + '%');
              var _gauge = Gauge.create();
              _gauge.modify($('#fileGauge_' + msg_.key)[0], {
                values: [msg_.ratio.toFixed(4), 1]
              });
            } else {
              var ratioLabel;
              if (msg_.ratio === 1) {
                ratioLable = fromAcc + '成功接受文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
              } else {
                if (msg_.state === 0) {
                  ratioLable = '传输文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ') 失败。';
                } else {
                  ratioLable = fromAcc + '取消接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
                }
              }
              curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
              var msgtime = new Date();
              var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
              curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
            }
          }, msg_);
        }
        break;
      case 1: //浏览器正在接收文件后显示接收进度
        {
          if (msg_.initFile === 1) {
            curEditBox_._fileTransList[msg_.key] = {
              'flag': 1,
              'path': msg_.filePath,
              'fileNameLocal': msg_.fileNameLocal,
            };
          } else {
            if (msg_.state === 1) {
              $('#fileRatio_' + msg_.key).text((msg_.ratio.toFixed(4) * 100) + '%');
              var _gauge = Gauge.create();
              _gauge.modify($('#fileGauge_' + msg_.key)[0], {
                values: [msg_.ratio.toFixed(4), 1]
              });
            } else {
              var ratioLabel;
              var filePath = curEditBox_._fileTransList[msg_.key].path;
              if (msg_.ratio === 1) {
                ratioLable = '您已成功接收文件："' + curEditBox_._fileTransList[msg_.key].fileNameLocal + '"(大小：' + msg_.fileSize + ')。';
              } else {
                if (msg_.state === 0) {
                  ratioLable = '接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ') 失败。';
                } else {
                  ratioLable = '您取消接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
                }
              }
              _global._dataOP.loadFile(function(err, result) {
                if (err) {
                  //Messenger().post('err' + result);
                } else {
                  _global._imV.deleteTmpFile(function(err, deleteRst) {}, filePath);
                }
              }, filePath);
              setTimeout(curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true), 1000);
              var msgtime = new Date();
              var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
              curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
            }
            sendMsg_['Msg'] = JSON.stringify({
              'group': curEditBox_._group,
              'msg': msg_
            });
            _global._imV.sendIMMsg(function(mmm) {}, sendMsg_, _global.get('ws').getSessionID(), false);
          }     
        }
        break;
      case 3: //远端正在接收文件后显示接收进度
        {
          if (msg_.initFile===undefined&&msg_.state !== 1) {
            var ratioLabel;
            if (msg_.ratio === 1) {
              ratioLable = '您的远端成功接受文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
            } else {
              if (msg_.state === 0) {
                ratioLable = '传输文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ') 失败。';
              } else {
                ratioLable =  '您的远端取消接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
              }
            }
            curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
          }
        }
        break;
      case 4: //其他设备正在接收文件后显示接收进度
        {
          if (msg_.state !== 1) {
            var ratioLabel;
            var filePath = curEditBox_._fileTransList[msg_.key].path;
            if (msg_.ratio === 1) {
              ratioLable = sendMsg_.fromAccount + '(' + sendMsg_.fromUID + ')已成功接收文件："' + curEditBox_._fileTransList[msg_.key].fileName + '"(大小：' + msg_.fileSize + ')。';
            } else {
              if (msg_.state === 0) {
                ratioLable = sendMsg_.fromAccount + '(' + sendMsg_.fromUID + ')接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ') 失败。';
              } else {
                ratioLable = sendMsg_.fromAccount + '(' + sendMsg_.fromUID + ')取消接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
              }
            }
            curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
          }
        }
        break;
      case 5:
        {
          if (msg_.state !== 1) {
            var ratioLabel;
            var filePath = curEditBox_._fileTransList[msg_.key].path;
            var fromAcc = curEditBox_._group === '' ? '对方' : sendMsg_.fromAccount + '(' + sendMsg_.fromUID + ')';
            if (msg_.ratio === 1) {
              ratioLable = fromAcc+ '已成功接收文件："' + curEditBox_._fileTransList[msg_.key].fileName + '"(大小：' + msg_.fileSize + ')。';
            } else {
              if (msg_.state === 0) {
                ratioLable = fromAcc + '接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ') 失败。';
              } else {
                ratioLable = fromAcc + '取消接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
              }
            }
            curEditBox_.fileItemTransRemove(curEditBox_, msg_.key, true);
            var msgtime = new Date();
            var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
            curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
          }
        }
        break;
      default:
        console.log('error show ratio');
    }
  },

  refuseFileItemTransfer: function(curEditBox_, msg_, sendMsg_) {
    var toIdentity = curEditBox_._toIdentity;
    msg_['state'] = '0'; //state=1：同意接受;state=0 ：不同意接受------------界面显示
    sendMsg_['Msg'] = JSON.stringify({
      'group': curEditBox_._group,
      'msg': msg_
    });
    _global._imV.sendAppMsgByDevice(function(mmm) {
      var ratioLable = '您拒绝接收文件："' + msg_.fileName + '"(大小：' + msg_.fileSize + ')。';
      var msgtime = new Date();
      var sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
      curEditBox_.divAppendContent($('#disp_text_' + toIdentity),'<span class="timeFont"> ' + sendTime + '  :</span><br/>' + ratioLable + '<br/>');
    }, sendMsg_, _global.get('ws').getSessionID(), true);
  },

  acceptFileItemTransfer: function(curEditBox_, msg_, sendMsg_, flag_) {
    var toIdentity = curEditBox_._toIdentity;
    curEditBox_._fileTransList[msg_.key] = {
      'flag': 1,
      'path': '',
      'fileName': msg_.fileName,
      'fileSize': msg_.fileSize
    };
    if (flag_) {
      $('#fileTransItem_' + msg_.key).remove();
      msg_['state'] = '1'; //state=1：同意接受;state=0 ：不同意接受------------界面显示
      sendMsg_['Msg'] = JSON.stringify({
        'group': curEditBox_._group,
        'msg': msg_
      });
      _global._imV.sendAppMsgByDevice(function(mmm) {
      }, sendMsg_, _global.get('ws').getSessionID(), true);
    } else {
      $('#memList_' + toIdentity).hide();
      $('#fileTransShow_' + toIdentity).show();
    }
    var txt= '<li id="fileTransItem_' + msg_.key + '">\
                <div><img src="img/uploadFile.png"/><span title="' + msg_.fileName + '" class="chatList_name">' + msg_.fileName.substr(0, 8) + '...<br/>大小：' + msg_.fileSize + '</span></div>\
                <div><span id="fileRatio_' + msg_.key + '"></span><br/><div id= "fileGaugeDiv_' + msg_.key + '"></div></div>\
                <div><button type="button"  id="cancelFileItem_' + msg_.key + '" class="chatList_btn">取消</button></div>\
                </li>';
    curEditBox_.divAppendContent($('#fileTransList_' + toIdentity),txt);
    $('#cancelFileItem_' + msg_.key).on('click', function() {
      _global._imV.transferCancelReciever(function() {}, msg_.key);
    });
    $('#fileRatio_' + msg_.key).text('0%');
    var _gauge = Gauge.create();
    _gauge.add($("#fileGaugeDiv_" + msg_.key), {
      width: 148,
      height: 1,
      name: 'fileGauge_' + msg_.key,
      limit: true,
      gradient: true,
      scale: 10,
      colors: ['#ff0000', '#00ff00'],
      values: [0, 1]
    });
  },

  transferCancelSender: function(msg_, flag_, state_, curEditBox_, sendMsg_, curFile_, exceptUID_, cb_) {
    msg_['Account'] = sendMsg_.Account;
    msg_['UID'] = sendMsg_.UID;
    _global._imV.transferCancelSender(function(rst) {
      sendMsg_['Msg'] = JSON.stringify({
        'group': curEditBox_._group,
        'msg': rst
      });
      if (curEditBox_._group === '') {
        _global._imV.sendAppMsgByDevice(function(mmm) {
          cb_();
        }, sendMsg_, _global.get('ws').getSessionID(), true);
      } else {
        var toAccList = {};
        for (var toAccListKey in curFile_['memList']) {
          if (exceptUID_ === undefined || toAccListKey !== exceptUID_) {
            toAccList[toAccListKey] = curEditBox_._toAccountInfo.toAccList[toAccListKey];
          }
        }
        if (Object.keys(toAccList).length !== 0) {
          sendMsg_['toAccList'] = toAccList;
          _global._imV.sendAppMsgByAccount(function(mmm) {
            if (!flag_) {
              for (var toAccListKey in curFile_['memList']) {
                if ((state_ !== 1) && (exceptUID_ === undefined || toAccListKey !== exceptUID_)) {
                  delete curFile_['memList'][toAccListKey];
                }
              }
            }
            cb_();
          }, sendMsg_, _global.get('ws').getSessionID(), true);
        } else {
          cb_();
        }
      }
    }, msg_, flag_, state_);
  },

  fileItemTransRemove: function(curEditBox_, key_, flag_) {
    $('#fileTransItem_' + key_).remove();
    var i = 1;
    if (flag_) {
      delete curEditBox_._fileTransList[key_];
      i = 0;
    }
    if ((Object.keys(curEditBox_._fileTransList).length - i) === 0) {
      $('#fileTransShow_' + curEditBox_._toIdentity).hide();
      $('#memList_' + curEditBox_._toIdentity).show();
    }
  },

  closeBtnFunc: function(curEditBox_, imChatWinList_) {
    var toIdentity = curEditBox_._toIdentity;
    var uidDetail = curEditBox_._toAccountInfo.toUID === '' ? '' : '(' + curEditBox_._toAccountInfo.toUID + ')';
    curEditBox_.fileTransferSize(curEditBox_._fileTransList, function(size) {
      if (size === 0) {
        curEditBox_._fileTip.hide();
        curEditBox_._contentTip.hide();
        curEditBox_._um.setContent('');
        curEditBox_._um.destroy();
        curEditBox_._imWindow.closeWindow(curEditBox_._imWindow);
        delete imChatWinList_[toIdentity];
      } else {
        Messenger().post({
          message: '如果关闭窗口，将中断与' + curEditBox_._toAccountInfo.toAccount + uidDetail + '之间的文件传输。！是否关闭窗口？',
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
                sendMsg['IP'] = curEditBox_._toAccountInfo.toIP;
                sendMsg['UID'] = curEditBox_._toAccountInfo.toUID;
                sendMsg['Account'] = curEditBox_._toAccountInfo.toAccount;
                sendMsg['localUID'] = curEditBox_._localUID;
                sendMsg['toAccList'] = curEditBox_._toAccountInfo.toAccList;
                sendMsg['group'] = curEditBox_._group;
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
                    case 0: //refuse
                      {
                        curEditBox_.fileItemTransRemove(curEditBox_, key, true);
                        fileMsgTmp['option'] = 0x0000;
                        fileMsgTmp['state'] = '0';
                        sendMsg['Msg'] = JSON.stringify({
                          'group': curEditBox_._group,
                          'msg': fileMsgTmp
                        });
                        _global._imV.sendAppMsgByDevice(function(mmm) {}, sendMsg, _global.get('ws').getSessionID(), true);
                      }
                      break;
                    case 1: //cancel receive
                      {
                        _global._imV.transferCancelReciever(function() {}, key);
                      }
                      break;
                    case 2: //cancel send
                      {
                        curEditBox_.transferCancelSender(fileMsgTmp, true, 0, curEditBox_, sendMsg, detail, undefined, function() {
                          curEditBox_.fileItemTransRemove(curEditBox_, key, true);
                        });
                      }
                      break;
                    case 6:{
                      curEditBox_.transferCancelSender(fileMsgTmp, true, 0, curEditBox_, sendMsg, detail, undefined, function() {
                        curEditBox_.fileItemTransRemove(curEditBox_, key, true);
                      });
                    }
                      break;
                    default:;
                  }
                }
                curEditBox_._fileTip.hide();
                curEditBox_._contentTip.hide();
                curEditBox_._um.setContent('');
                curEditBox_._um.destroy();
                curEditBox_._imWindow.closeWindow(curEditBox_._imWindow);
                delete imChatWinList_[toIdentity];
              }
            }
          }
        });
      }
    });
  },

  fileTransferSize: function(fileTransList_, cb_) {
    if (Object.keys(fileTransList_).length === 0) {
      cb_(0);
    } else {
      var size = 0;
      for (var key in fileTransList_) {
        var flag = fileTransList_[key].flag;
        if (flag === 0 || flag === 1 || flag === 2|| flag === 6)
          size++;
      }
      cb_(size);
    }
  },

  deviceUpFunc: function(curEditBox_, info_, imChatWinList_) {
    var memItemId = info_['txt'][2];
    var curAcc = curEditBox_._toAccountInfo.toAccList[memItemId];
    if (curAcc === undefined) {
      var toAccInfo = {};
      toAccInfo['toAccount'] = info_.txt[1];
      toAccInfo['toUID'] = info_.txt[2];
      toAccInfo['toIP'] = info_.address;
      toAccInfo['onLineFlag'] = 1;
      curEditBox_._toAccountInfo.toAccList[memItemId] = toAccInfo;
      var deviceItem = {
        id: 'memItem_' + memItemId,
        type: "item",
        href: "",
        img: "img/device.png",
        text: info_['txt'][1] + '<br/>UID:' + info_['txt'][2].substr(0, 20),
        clkaction: function() {
          if (info_['txt'][2] === curEditBox_._localUID) {
            return;
          }
          var devEditBoxItem = imChatWinList_[info_['txt'][2]];
          if (devEditBoxItem === undefined) {
            var toAccountInfoItem = {};
            toAccountInfoItem['toAccount'] = info_['txt'][1];
            toAccountInfoItem['toIP'] = info_.address;
            toAccountInfoItem['toUID'] = info_['txt'][2];
            toAccountInfoItem['identity'] = info_['txt'][2];
            toAccountInfoItem['group'] = '';
            var toAccounts = {};
            var toAccListItem = {};
            toAccListItem['toAccount'] = info_['txt'][1];
            toAccListItem['toIP'] = info_.address;
            toAccListItem['toUID'] = info_['txt'][2];
            toAccListItem['onLineFlag'] = 1;
            toAccounts[info_['txt'][2]] = toAccListItem;
            toAccountInfoItem['toAccList'] = toAccounts;
            devEditBoxItem = UEditBox.create(toAccountInfoItem, imChatWinList_, curEditBox_._selector);
            imChatWinList_[ info_['txt'][2]] = devEditBoxItem;
          } else {
            _global._openingWindows.focusOnAWindow(devEditBoxItem._imWindow._id);
          }
        }
      };
      curEditBox_._memListView.addItem(deviceItem);
      curEditBox_._onLineCount += 1;
    }   
  },

  deviceDownFunc: function(curEditBox_, info_) {
    var memItemId = info_['txt'][2];
    var curAcc = curEditBox_._toAccountInfo.toAccList[memItemId];
    if (curAcc !== undefined) {
      //curEditBox_._toAccountInfo.toAccList[memItemId].onLineFlag = 0;
      delete curEditBox_._toAccountInfo.toAccList[memItemId];
      curEditBox_._onLineCount -= 1;
      curEditBox_._memListView.remove('memItem_' + memItemId);
    }
  },

  onDropFile: function(curEditBox_, ev_, tArr_) {
    if (curEditBox_._onLineCount === 0) {
      Messenger().post('当前没有设备在线，您将不能发送文件！');
      return;
    }
    var filePaths = [];
    var dataTransfer = ev_.originalEvent.dataTransfer;
    if (dataTransfer.files.length != 0) {
      for (var i = 0; i < dataTransfer.files.length; ++i) {
        curEditBox_.fileUpload(curEditBox_, dataTransfer.files[i].path);
      }
      return;
    }
    var tarIdArr = [],
      tarArr = tArr_ || [];
    for (var i = 0; i < tarArr.length; ++i) {
      if (tarArr[i] != null)
        tarIdArr.push(tarArr[i].getID());
    }
    if (tarIdArr.length == 0)
      tarIdArr.push(dataTransfer.getData('ID'));
    for (var i = 0; i < tarIdArr.length; ++i) {
      var desktop = _global.get('desktop'),
        item = desktop.getCOMById('layout').getCurLayout().getWidgetById(tarIdArr[i]);
      curEditBox_.fileUpload(curEditBox_, item.getPath());
    }
  },

  divAppendContent:function(div,text){
    div.append(text);
    div[0].scrollTop=div[0].scrollHeight;
  }
});

var LoginView = View.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_, model_, parent_);
    this.registObservers();
    // view for login
    var lang = _global._locale.langObj;
    this.$loginView = $('<div>', {
      'class': 'login'
    }).append($('<div>', {
      'class': 'login-content'
    }).append($('<div>', {
      'class': 'content-row'
    }).html(
      '<div>' + lang['account'] + '</div>：' +
      '<input type="text" name="account">'
    )).append($('<div>', {
      'class': 'content-row'
    }).html(
      '<div>' + lang['passwd'] + '</div>：' +
      '<input type="password" name="password">'
    )).append($('<div>', {
      'class': 'content-row',
      'id': 'msg1'
    }))).append($('<div>', {
      'class': 'login-btn-bar'
    }).html(
      '<button class="btn active" id="btn-regist">' + lang['register'] + '>>></button>' +
      '<button class="btn disable" id="btn-login">' + lang['login'] + '</button>' +
      '<button class="btn active hidden" id="btn-cancel">'+ lang['cancel'] + '</button>'
    )).append($('<div>', {
      'class': 'login-waiting hidden'
    }).html(
      '<div class="loading icon-spin5 animate-spin"></div>' +
      '<p>'+ lang['logging'] + '</p>'
    )).append($('<div>', {
      'class': 'login-regist hidden'
    }).html(
      '<div class="content-row">' +
      '<div>' + lang['account'] + '</div>：<input type="text" name="r-account">' +
      '</div>' +
      '<div class="content-row">' +
      '<div>' + lang['passwd'] + '</div>：<input type="password" name="r-password">' +
      '</div>' +
      '<div class="content-row">' +
      '<div>' + lang['sure_passwd'] + '</div>：<input type="password" name="r-password-c">' +
      '</div>' +
      '<div class="content-row" id="msg"></div>' +
      '<div class="content-row">' +
      '<button class="btn disable" id="btn-commit">' + lang['commit'] + '</button>' +
      '<button class="btn active" id="btn-r-cancel">' + lang['close'] + '</button>' +
      '</div>'
    ));
    // view for logout
    this.$logoffView = $('<div>', {
      'class': 'logout'
    }).append($('<div>', {
      'class': 'logout-content'
    }).html(
      lang['logout_warnning']
    )).append($('<div>', {
      'class': 'logout-btn-bar'
    }).html(
      '<button class="btn active" id="btn-sure">' + lang['sure'] + '</button>' +
      '<button class="btn active" id="btn-cancel">' + lang['cancel'] + '</button>'
    ));
    this._controller = LoginController.create(this);
    this._r_shown = false;
  },

  registObservers: function() {
    var _this = this,
        lang = _global._locale.langObj;
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
            _this.$loginView.find('#msg1').html(lang['login'] + lang['space'] + lang['fail']
                + ': ' + msg_);
          }
        }
        // _this._win.closeWindow(_this._win);
      },
      'regist': function(err_, success_, reason_) {
        _this.$loginView.find('span').remove();
        if(success_) {
          _this.$loginView.find('#msg').html(lang['register'] + lang['space'] + lang['success']);
        } else {
          _this.$loginView.find('#msg').html(lang['register'] + lang['space'] + lang['fail']
              + '：' + reason_);
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
    var $view, title, height, width,
        lang = _global._locale.langObj;
    if(toLogin_) {
      $view = this.$loginView;
      title = lang['login'];
      height = 300;
      width = 500;
    } else {
      $view = this.$logoffView;
      title = lang['logout'];
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
            $msg.html(lang['sure_passwd'] + lang['space'] + lang['fail']);
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
