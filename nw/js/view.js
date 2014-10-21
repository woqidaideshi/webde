// This file includes all view classes
//

// The view of Desktop
//
var DesktopView = View.extend({
  init: function(model_) {
    this.callSuper('desktop-view', model_);
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
            break;
          case 'device-list':
            _this._c['device-list'] = DeviceListView.create(component_);
            _this._c['device-list'].show(_this.$view);
            break;
          case 'dock':
            _this._c[component_.getID()] = DockView.create(component_);
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
        switch(viewType_) {
          case 'grid':
            _this._c['layout-view'] = GridView.create('grid-view', layoutModel_);
            _this._c['layout-view'].show(_this.$view);
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
            desktop.getCOMById('layout')
              .add(DPluginModel.create('clock', 'img/clock.png', 'ClockPlugin'));
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
    ctxMenu.addCtxMenu([
      {header: 'plugin'},
      {text: 'zoom in', action: function(e) {
        e.preventDefault();
        desktop.getCOMById('layout').getWidgetById(ctxMenu._rightObjId).zoomIn();
      }},
      {text: 'zoom out', action: function(e) {
        e.preventDefault();
        desktop.getCOMById('layout').getWidgetById(ctxMenu._rightObjId).zoomOut();
      }},
      {text:'remove', action:function(e) {
        e.preventDefault();
        var layout = desktop.getCOMById('layout'),
            _widget = layout.getWidgetById(ctxMenu._rightObjId);
        ctxMenu.activeItem('add-plugin', 'clock', function(e_) {
          e_.preventDefault();
          layout.add(DPluginModel.create('clock', 'img/clock.png', 'ClockPlugin'));
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
        desktop.getAWidgetById(ctxMenu._rightObjId).open();
      }},
      {text: 'Rename', action: function(e) {
        e.preventDefault();
        e.stopPropagation();
        desktop.getAWidgetById(ctxMenu._rightObjId).rename();
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
        desktop.getAWidgetById(ctxMenu._rightObjId).open();
      }},
      {text:'Open with...',icon: 'icon-folder-open', subMenu: [
        {header: 'Open with'}]
      },
      {divider: true},
      {text: 'Rename', action: function(e) {
        e.preventDefault();
        e.stopPropagation();
        desktop.getAWidgetById(ctxMenu._rightObjId).rename();
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
        desktop.getAWidgetById(ctxMenu._rightObjId).open();
      }},
      {text: 'Rename', action: function(e) {
        e.preventDefault();
        e.stopPropagation();
        desktop.getAWidgetById(ctxMenu._rightObjId).rename();
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
    ctxMenu.attachToMenu('body'
        , ctxMenu.getMenuByHeader('desktop')
        , function() {
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
            for (var i = 0; i < files_.length; i++) {
              var _names = files_[i].split('.');
              if (_names[_names.length - 1] == 'desktop') {
                utilIns.entryUtil.getItemFromApp(_DIR + '/' + files_[i], function(err_, item_) {
                  desktop._ctxMenu.addItem(_menu,item_);
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
  init: function(id_, model_) {
    this.callSuper(id_, model_);
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
  init: function(id_, model_) {
    this.callSuper(id_, model_);
    this.controller = GridController.create(this);
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'gridcontainer', 
      'id': this._id,
      'onselectstart': 'return false'
    });
    this._c = [];
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
            _this.addAnDPlugin(ClockPluginView.create(widget_.getID(), widget_), widget_);
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
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  addAnDEntry: function(entry_) {
    var pos_ = entry_.getPosition();
    if(typeof pos_ === 'undefined' || 
      typeof $('#grid_' + pos_.x + '_' + pos_.y).children('div')[0] != 'undefined') {
      pos_ = this._model.findAnIdleGrid();
      if(pos_ == null) {
        alert("No room");
        this._model.remove(entry_);
        return ;
      }
    }

    this._c[entry_.getID()] = DEntryView.create(entry_.getID(), entry_);
    entry_.setPosition(pos_);
    // this._c[entry_.getID()].show();
    /* this._dEntrys.push(entry_); */
    /* this.resetDEntryTabIdx(); */
    this._model._grid[pos_.x][pos_.y].use = true;
  },

  deleteADEntry: function(entry_) {
    var _pos = entry_.getPosition();
    this._model._grid[_pos.x][_pos.y].use = false;
    // this._dEntrys.remove(entry_.getTabIdx() - 1);
    // this.resetDEntryTabIdx();
    this._c[entry_.getID()].destroy();
    this._c[entry_.getID()] = null;
    delete this._c[entry_.getID()];
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

  show: function($parent) {
    $parent.append(this.$view);

    for(var i = 0; i < this._model._col_num; ++i) {
      var col_ = $('<div>', {
        'class': 'gridcol',
        'id': 'col' + i,
        'onselectstart': 'return false'
      });
      this.$view.append(col_);

      this._model._grid[i] = new Array();
      for(var j = 0; j < this._model._row_num; ++j) {
        var row_ = $('<div>', {
          'class': 'grid',
          'id': 'grid_' + i + '_' + j,
          'draggable':'false',
          'onselectstart': 'return false'
        });
        $('#col' + i).append(row_);

        // var target = document.getElementById('grid_' + i + '_' + j);
        this.initAction($('#grid_' + i + '_' + j));

        this._model._grid[i][j] = {};
        this._model._grid[i][j].use = false;
      }
    }
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
    $('#' + ev.currentTarget.id).removeClass('hovering');

    var __id = ev.dataTransfer.getData("ID"),
        _id = /([\w-_\s\.]+)-dock$/.exec(__id);
    if(_id == null) _id = {'1': __id};
    // if(this._id == _id[1]) return ;
    //show insert position picture
    var _source = null,
        desktop = _global.get('desktop'),
        model = desktop.getCOMById('layout'),
        s_widget = model.getWidgetById(_id[1]),
        dock = desktop.getCOMById('dock'),
        dockApp = dock.getCOMById(_id[1]); 
    
    var _target_id = ev.target.id;
    // var _id = ev.originalEvent.dataTransfer.getData("ID");
    var _target = $('#' + _target_id);
    $('#' + _id[1]).parent().removeClass('norhover');

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
    /* if(desktop._selector._selectedEntries.length > 1) { */
      // for(var i = 0; i < desktop._selector._selectedEntries.length; ++i) {
        // if(desktop._selector._selectedEntries[i] == null) continue;
        // var _s_id = $('#' + desktop._selector._selectedEntries[i]._id).parent().attr('id');
        // var _coor = /^.*[_]([0-9]+)[_]([0-9]+)$/.exec(_s_id);
        // var _pos = desktopGrid.findALegalNearingIdleGrid({
          // x: _target_col
          // , y: _target_row
        // });
        // if(_pos == null) return ;
        // $('#grid_' + _pos.x + '_' + _pos.y)
          // .append($('#' + desktop._selector._selectedEntries[i]._id));
        // console.log(desktop._selector._selectedEntries[i]._id 
          // + " ---> " + _pos.x + '  '  + _pos.y);
        // desktop._selector._selectedEntries[i].setPosition({x: _pos.x, y: _pos.y});
        // desktopGrid.flagGridOccupy(_pos.x, _pos.y, 1, 1, true);
        // _target_col = _pos.x;
        // _target_row = _pos.y;
      
        // desktopGrid.flagGridOccupy(_coor[1], _coor[2], 1, 1, false);
      // }
      // desktop.reOrderDEntry();
      // desktop.resetDEntryTabIdx();
      // return ;
    /* } */

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
      // $('#grid_'+pos_.x+'_'+pos_.y).append($('#'+_id));
      console.log(_id[1] + " ---> " + pos_.x + '  '  + pos_.y);
      s_widget.setPosition({x: pos_.x, y: pos_.y});
      model.flagGridOccupy(pos_.x, pos_.y, col_num, row_num, true);
      if(s_widget.getType().match(/\w*Plugin/) == null) {
        desktop.reOrderDEntry();
        desktop.resetDEntryTabIdx();
      }
      return ;
    }

    model.flagGridOccupy(col, row, col_num, row_num, true);
    console.log(_target_id + " is occupied");
  },

  dragEnter: function(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    $('#' + ev.currentTarget.id).addClass('hovering');
  },

  dragLeave: function(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    $('#' + ev.currentTarget.id).removeClass('hovering');
  }
});

var DPluginView = WidgetView.extend({
  init: function(id_, model_) {
    this.callSuper(id_, model_);
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
            _this.show($('#grid_' + pos_.x + '_' + pos_.y));
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
      e.stopPropagation();
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
  init: function(id_, model_) {
    this.callSuper(id_, model_);
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
  init: function(id_, model_) {
    this.callSuper(id_, model_);
    this.registObservers();
    this._controller = EntryController.create(this);
    this.$view = $('<div>', {
      'class': 'icon',
      'id': this._id,
      'draggable': 'true'/* , */
      /* 'tabindex': this._tabIndex */
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
        // $('#' + _this._id + ' img').attr('src', imgPath_);
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
        var desktop = _global.get('desktop');
        _this.$view/* .parent() */.addClass('focusing');
        if(!desktop._selector._selectedEntries.hasEntry(_this._id))
          desktop._selector._selectedEntries.push(_this);
        // this._focused = true;
        desktop._tabIndex = _this._tabIndex - 1;
      },
      'blur': function(err_) {
        if(err_) {
          console.log(err_);
          return;
        }
        _this.$view/* .parent() */.removeClass('focusing');
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
      $(this).parent().addClass('norhover');
      var $p = $('#' + _entry.getID() + ' p');
      $p.css('height', $p[0].scrollHeight);
    }).mouseleave(function() {
      $(this).parent().removeClass('norhover');
      $('#' + _entry.getID() + ' p').css('height', '32px');
    }).mousedown(function(e) {
      e.stopPropagation();
    }).mouseup(function(e) { 
      /* if(!e.ctrlKey) { */
        // desktop._selector.releaseSelectedEntries();
        // _this.focus();
      // } else {
        // if(_this._focused) {
          // for(var i = 0; i < desktop._selector._selectedEntries.length; ++i) {
            // if(desktop._selector._selectedEntries[i] != null
              // && _entry._id == desktop._selector._selectedEntries[i]._id) {
                // desktop._selector._selectedEntries[i] = null;
                // _this.blur();
                // break;
              // }
          // }
        // } else {
          // _this.focus();
        // }
      /* } */
    });

    var ctxMenu = _global.get('ctxMenu'),
        type = this._model.getType();
    if(type == 'dir') type = 'file';
    ctxMenu.attachToMenu('#' + this.getID()
        , ctxMenu.getMenuByHeader(type + '-entry')
        , function(id_) {ctxMenu._rightObjId = id_;});
  },

  show: function() {
    var pos = this._model.getPosition(),
        layout = _global.get('desktop').getLayoutType();
    switch(layout) {
      case 'grid':
        $('#grid_' + pos.x + '_' + pos.y).append(this.$view);
        break;
      default:
        break;
    };
  },

  hide: function() {
    var pos = this._model.getPosition(),
        layout = _global.get('desktop').getLayoutType();
    switch(layout) {
      case 'grid':
        $('#grid_' + pos.x + '_' + pos.y).empty();
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
    this.$view.parent('.grid').removeClass('norhover');
    ev.preventDefault();
    ev.stopPropagation();
    this._controller.onDrop(ev);
  }
});

var DeviceListView = View.extend({
  init: function(model_) {
    this.callSuper('device-list', model_);
    this.registObservers();
    this.$view = $('<div>', {
      'id': this._id
    }).css({ 
      'position': 'absolute',
      'left': '0',
      'top': '50%',
      'background-color': '#000',
      'opacity': '0.5',
      'width': '100px',
      'height': '50%',
      'display': '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-box-pack': 'start',
      '-webkit-box-align': 'start',
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      'box-shadow': '0px 0px 10px black'
    }) ;
    this._c = [];
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
        _this._c[dev_.getID()] = DevEntryView.create(dev_.getID(), dev_);
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

  show: function($parent) {
    $parent.append(this.$view);
  }
});

var DevEntryView = View.extend({
  init: function(id_, model_) {
    this.callSuper(id_, model_);
    this.registObservers();
    this.$view = $('<div>', {
      'class': 'icon',
      'id': this._id
    }).html("<img draggable='false'/><p>" + this._model.getName() + "</p>").css({ 
      'color': '#FFF'
    }) ;
    this.initAction();
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
      }
    };
    for(var key in _this.__handlers) {
      this._model.on(key, _this.__handlers[key]);
    }
  },

  show: function($parent) {
    $parent.append(this.$view);
  },

  hide: function() {
    this.$view.remove();
  },

  initAction: function() {},
});

// View of Dock component
//
var DockView = View.extend({
  init: function(model_) {
    this.callSuper(model_.getID(), model_);
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
    }).on('mousemove', function(ev) {
      var ev = ev || window.event,
          divList = dock.children('div');
      ev.stopPropagation();
      for(var i = 0; i < divList.length; i++) {
        var jqImg = $(divList[i]).children('img'),
            a = ev.clientX - (jqImg.position().left + jqImg.width() / 2),
            b = ev.clientY - (jqImg.position().top + jqImg.height() / 2 + dock.position().top),
            c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)),
            spex = 1 - c / _distance;

        if(spex < 0.5) {
          spex = 0.5;
        }
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
        layout = desktop.getCOMById('layout'),
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
  init: function(id_, model_, container_) {
    this.callSuper(id_, model_);
    this._container = container_;
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
      var image = _this.$view.children('img');
      if(image[0].style.borderStyle == "" || image[0].style.borderStyle == 'none') {
        image.animate({width:"+=40px",height:"+=40px"}, 'fast')
          .animate({width:"-=40px",height:"-=40px"}, 'fast');
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
    }).on('dragstart', this.drag)
      /* .on('drop', this.drop) */;

    var ctxMenu = _global.get('ctxMenu');
    ctxMenu.attachToMenu('#' + this.getID()
        , ctxMenu.getMenuByHeader('dock')
        , function(id_) {ctxMenu._rightObjId = id_});
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
      var model = this._container._c[divList[i].id]._model,
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
        layout = desktop.getCOMById('layout'),
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
  init: function(id_, model_) {
    this.callSuper(id_, model_);
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

    _this.$view.mousedown(function(ev){
      ev.stopPropagation();
    }).mouseup(function(ev){
      ev.stopPropagation;
    });

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
