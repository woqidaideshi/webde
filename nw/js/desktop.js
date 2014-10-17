//This class is totally for desktop management
/**
 * [desktop main of desktop file]
 * @param  {[type]} ) {  } [description]
 * @return {[type]}   [description]
 */
var Desktop = Class.extend({
  init: function() {
    this._grid = undefined;
    this._ctxMenu = null;
    this._inputer = Inputer.create('d-inputer');
    this._selector = DesktopSelector.create();
    this._position = undefined;
    this._tabIndex = -1;
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

    this._ctrlKey = false;
    this._exec = require('child_process').exec;
    this._fs = require('fs');
    this._xdg_data_home = undefined;
    this._home = undefined;
    this._rightMenu = undefined;
    this._rightObjId = undefined;
    this.generateGrid();
    this.initCtxMenu();
    this.initDesktopWatcher();
    this.bindingEvents();
    this._dock = Dock.create();
    
    var _desktop = this;
    this._exec("echo $HOME", function(err, stdout, stderr) {
      if(err) {
        console.log(err);
      } else {
        _desktop._home = stdout.substr(0, stdout.length - 1);
        _desktop._xdg_data_home = _desktop._home+'/.local/share/';
        //add dock div to desktop
        _desktop._dock.bingEvent();
        theme.loadThemeEntry(_desktop);
        _desktop.loadWidgets();
        //_desktop.loadScriptMenu();
      }
    });
  },
  /**
   * [bindingEvents bind Events]
   * @return {[type]} [description]
   */
  bindingEvents: function() {
    var _desktop = this;

    win.once('loading', function() {
      _desktop.refresh();
    });
    _desktop._ctxMenu.attachToMenu('body'
      , _desktop._ctxMenu.getMenuByHeader('desktop')
      ,this.loadScriptMenu);
  
  },

  shutdown: function() {
    this._desktopWatch.close();
    this.saveWidgets();
  },

  refresh: function() {
    //console.log('refresh');
    this._desktopWatch.close();
    this._dock._dockWatch.close();
    theme.saveConfig(this);
    this.saveWidgets();
  },
  /**
   * [initCtxMenu init context menu on desktop rely on ui-lib(contextMenu.js and font-awesome.less)]
   * @return {[type]} [description]
   */
  initCtxMenu: function() {
    this._ctxMenu = ContextMenu.create();

    this._ctxMenu.addCtxMenu([
      {header: 'desktop'},
      {text:'create Dir', icon:'icon-folder-close-alt' ,action:function(e){
        e.preventDefault();
        var _fs = require('fs');
        for (var i = 0; ; i++) {
          if(_fs.existsSync(desktop._desktopWatch.getBaseDir()+'/newDir'+i)) {
            continue;
          } else {
          _fs.mkdir(desktop._desktopWatch.getBaseDir()+'/newDir'+i,function(){
            });
            return;
          }
        }
      }},
      {text:'create Text',icon:'icon-file', action:function(e){
        e.preventDefault();
        var _fs =require('fs');
        for (var i = 0; ; i++) {
          if(_fs.existsSync(desktop._desktopWatch.getBaseDir()+'/newFile'+i+'.txt')) {
            continue;
          } else {
          _fs.writeFile(desktop._desktopWatch.getBaseDir()+'/newFile'+i+'.txt','',{encoding:'utf8'},function(err){
            if (err) throw err;
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
        var exec = require('child_process').exec;
        exec("gnome-terminal", function(err, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        });
      }},
      {text:'gedit', icon: 'icon-edit', action:function(e){
        e.preventDefault();
        var exec = require('child_process').exec;
        exec("gedit",function(err, stdout, stderr){
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
      });
      }},
      {divider: true},
      {text: 'refresh', icon: 'icon-refresh icon-spin', action: function(e) {
        location.reload();
      }},
      {text: 'refresh (F5)', icon: 'icon-refresh icon-spin',  action:function(e){
        location.reload(true);
      }},
      {divider: true},
      {text:'window',action:function(){
        Window.create('newWin','Test Window ', {
          left:200,
          top:100,
          height: 400,
          width: 700,
          fadeSpeed: 500,
          animate: false
        });
      }},
      {text:'window2',action:function(){
        Window.create('newWin','Test Window2!', {
          left:400,
          top:300,
          height: 500,
          width: 800,
          fadeSpeed: 500,
          animate: true
        });
      }},
      {text: 'app-plugin',icon: 'icon-plus', subMenu: [
        {header: 'add-plugin'},
        {text: 'clock',icon: 'icon-time', action: function(e) {
          e.preventDefault();
          if (typeof $('#clock')[0] == 'undefined') {
            desktop.addAnDPlugin(ClockPlugin.create('clock',undefined,'img/clock.png'));
            desktop._ctxMenu.disableItem('add-plugin','clock');
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
    this._ctxMenu.addCtxMenu([
      {header: 'plugin'},
      {text: 'zoom in', action: function(e) {
        e.preventDefault();
        desktop._widgets[desktop._rightObjId].zoomIn();
      }},
      {text: 'zoom out', action: function(e) {
        e.preventDefault();
        desktop._widgets[desktop._rightObjId].zoomOut();
      }},
      {text:'remove', action:function(e) {
        var _widget = desktop._widgets[desktop._rightObjId];
        var _eventAction = function(e_){
          e_.preventDefault();
          desktop.addAnDPlugin(ClockPlugin.create(_widget._id,undefined,_widget._path));
        }
        desktop._ctxMenu.activeItem('add-plugin','clock',_eventAction);
        _widget.remove();
        e.preventDefault();
      }},
      {text:'show clock',action:function(){
        $('#clock').modalBox({
          iconImg:'img/close.png',
          iconClose:true,
          keyClose:true,
          bodyClose:true
        });
      }}
    ]);
    this._ctxMenu.addCtxMenu([
      {header: 'dock'},
      {text: 'property', action:function(e){
        e.preventDefault();
        var _property = Property.create(desktop._rightObjId);
        _property.showAppProperty();
        _property.show();
      }},
      {text:'add reflect',action:function(){
        desktop._dock.addReflect();
      }},
      {text:'remove reflect',action:function(){
        desktop._dock.removeReflect();
      }}
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
      }},
      {text:'delete' , icon: 'icon-remove-circle', action:function(e){
        e.preventDefault();
        var _path = desktop._widgets[desktop._rightObjId]._path;
        utilIns.entryUtil.removeFile(_path);
      }},
      {text:'property',action:function(e){
        e.preventDefault();
        var _property = Property.create(desktop._rightObjId);
        _property.showAppProperty();
        _property.show();
      }}
    ]);
    this._ctxMenu.addCtxMenu([
      {header: 'file-entry'},
      {text: 'Open', icon: 'icon-folder-open-alt', action: function(e) {
        e.preventDefault();
        desktop.getAWidgetById(desktop._rightObjId).open();
      }},
      {text:'Open with...',icon: 'icon-folder-open', subMenu: [
        {header: 'Open with'}]
      },
      {divider: true},
      {text: 'Rename', action: function(e) {
        e.preventDefault();
        e.stopPropagation();
        desktop.getAWidgetById(desktop._rightObjId).rename();
      }},
      {text:'Move to Trash' ,icon: 'icon-trash', action:function(e){
        e.preventDefault();
        utilIns.trashUtil.moveToTrash(desktop._rightObjId);
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
                var _path = desktop._widgets[desktop._rightObjId]._path;
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
                utilIns.trashUtil.moveToTrash(desktop._rightObjId);
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

  /**
   * [loadScriptMenu load desktop file from ~/.gnome2/nemo-scripts to context menu]
   * @return {[type]} [description]
   */
  loadScriptMenu:function(){
    desktop._rightObjId = undefined;
    var _DIR = desktop._home + '/.gnome2/nemo-scripts';
    console.log(_DIR);
    var _menu  = desktop._ctxMenu.getMenuByHeader('script');
    if (typeof _menu !== 'undefined') {
      var _items = _menu.children('li');
      for (var i = 0; i < _items.length; i++) {
      if(!$(_items[i]).hasClass('nav-header'))
        $(_items[i]).remove();
      };
    }
    desktop._fs.readdir(_DIR
        ,function(err_,files_){
      for (var i = 0; i < files_.length; i++) {
        var _names = files_[i].split('.');
        if (_names[_names.length - 1] == 'desktop') {
          utilIns.entryUtil.getItemFromApp(_DIR+'/'+files_[i], function(err_, item_) {
            desktop._ctxMenu.addItem(_menu,item_);
          });
        };
      };
    });
  },
  /**
   * [loadFileMenu load open with menu for filemenu]
   * @param  {[type]} $menu_ [jquery obj of menu]
   * @return {[type]}        [description]
   */
  loadFileMenu:function($menu_){
    var _path = desktop._widgets[desktop._rightObjId]._path;
    utilIns.entryUtil.getMimeType(_path, function(err_ , mimeType_){
      if (err_ != null || typeof mimeType_ == 'undefined' || mimeType_ == '') {
        console.log('getMimeType: '+err_);
        return ;
      } 
      console.log(mimeType_);
      utilIns.entryUtil.isTextFile(_path,function(err_0, isText_){
        if (err_0) {
          console.log('isTextFile: '+err_0);
          return ;
        } 
        var mimetypes_ = [];
        mimetypes_.push(mimeType_);
        if (isText_ && mimeType_ !== 'text/plain') {
          mimetypes_ .push('text/plain');
        }
        insertItemByMimetype(mimetypes_);
      });
    });
    /**
     * [insertItemByMimetype get item of contextmenu  from mimetype of file]
     * @param  {[type]} mimeTypes_ [mimetype of file]
     * @return {[type]}            [description]
     */
    var insertItemByMimetype =function(mimeTypes_){
      utilIns.entryUtil.getRelevantAppName(mimeTypes_, function(err_1, relevantAppNames_){
        if (err_1 != null || typeof relevantAppNames_ == 'undefined' || relevantAppNames_.length == 0) {
          var _item = desktop._ctxMenu.getItemByText($menu_,"Open with...Open with");
          if (typeof _item !== 'undefined') {
            desktop._ctxMenu.removeMenuByHeader('Open with');
            _item.remove();
          }
          console.log('getRelevantAppName:'+err_1);
          return ;
        } 
        for (var i = 0; i < relevantAppNames_.length; i++) {
          console.log(relevantAppNames_[i]);
          utilIns.entryUtil.findDesktopFile(relevantAppNames_[i], function(err_2, path_){
            if (err_2 != null || typeof path_ == 'undefined' || path_ == '') {
              console.log('findDesktopFile:' + err_2);
              return ;
            }
            console.log(path_);
            utilIns.entryUtil.getItemFromApp(path_, function(err_3, item_){
              if (err_3 != null || typeof item_ == 'undefined' || item_ == null) {
                console.log('getItemFromApp:' + err_3)
                return;
              }
              $_menu  = desktop._ctxMenu.getMenuByHeader('Open with');
              if (typeof $_menu == 'undefined' ) {
                $_open = desktop._ctxMenu.getItemByText($menu_,'Open');
                var _subMemu = {text:'Open with...', subMenu: [
                              {header: 'Open with'}]
                              };
                desktop._ctxMenu.addItem($menu_, _subMemu, $_open);
                $_menu  = desktop._ctxMenu.getMenuByHeader('Open with');
              };
              if (!desktop._ctxMenu.hasItem($_menu,item_))
                desktop._ctxMenu.addItem($_menu,item_);
            });
          });
        };
      });
    }
  },

  /**
   * [initDesktopWatcher init desktop watcher]
   * @return {[type]} [description]
   */
  initDesktopWatcher: function() {
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
        , 100 + _desktop._tabIndex++
        , _desktop._desktopWatch.getBaseDir() + '/' + filename
        , _desktop._position
        ), _desktop._position);
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
  },
  /**
   * [registWidget regist widget to desktop]
   * @param  {[type]} widget_ [widget]
   * @return {[type]}         [description]
   */
  registWidget: function(widget_) {
    if(typeof this._widgets[widget_.getID()] !== "undefined") {
      alert("This widget has been registed!!");
      return false;
    }
    this._widgets[widget_.getID()] = widget_;
    return true;
  },
  /**
   * [unRegistWidget unRegist Widget]
   * @param  {[type]} id_ [description]
   * @return {[type]}     [description]
   */
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
  /**
   * [loadWidgets load widget from dentries file and desktop dir and dock dir]
   * @return {[type]} [description]
   */
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
          if(typeof lastSave_[_id] != 'undefined'
            && lastSave_[_id].path.match(/[^\/]*$/) == files[index_]) {
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
            if (_DockApp != null) {
              _desktop.addAnAppToDock(_DockApp.create(_id
              ,lastSave_[_id].x
              ,lastSave_[_id].path));
            } else if (_Entry != null) {
              _desktop.addAnDEntry(_Entry.create(_id
                , 100 + _desktop._tabIndex++
                , lastSave_[_id].path
                , {x: lastSave_[_id].x, y: lastSave_[_id].y}
                ), {x: lastSave_[_id].x, y: lastSave_[_id].y}
              );
            }
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
  /**
   * [saveWidgets write widget config into dentries]
   * @return {[type]} [description]
   */
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
  /**
   * [addAnDEntry add an entry to desktop]
   * @param {[type]} entry_ [description]
   * @param {[type]} pos_   [description]
   */
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
    // this._tabIndex--;
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
  /**
   * [addAnDPlugin add a plugin to desktop]
   * @param {[type]} plugin_ [description]
   * @param {[type]} pos_    [description]
   * @param {[type]} path_   [description]
   */
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

  deleteAnAppFromDock:function(dockApp_) {
    this.unRegistWidget(dockApp_.getID());
    $('#'+dockApp_.getID()).remove();
    dockApp_ = undefined;
  }
});

var DesktopSelector = Class.extend({
  init: function() {
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

    var _this = this;
    $(document).on('mousedown', 'body', function(e) {
      e.preventDefault();
    }).on('mousedown', 'html', function(e) {
      e.stopPropagation();
      if(e.which == 1) {
        if(!e.ctrlKey) {
          desktop._tabIndex = -1;
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
    }).on('mouseup', 'html', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if(e.which == 1) {
        _this._mouseDown = false;
        _this.$view.hide().css({
          'width': '0px',
          'height': '0px'
        });
      }
    }).on('mousemove', 'html', function(e) {
      /* e.preventDefault(); */
      /* e.stopPropagation(); */
      if(!_this._mouseDown) return ;
      var _off = _this.$view.offset();
      if(e.pageX < _this._s_X) 
        _off.left = e.pageX;
      if(e.pageY < _this._s_Y)
        _off.top = e.pageY;
      _this.$view.css({
        'top': _off.top,
        'left': _off.left,
        'width': Math.abs(e.pageX - _this._s_X),
        'height': Math.abs(e.pageY - _this._s_Y)
      });
      if(!e.ctrlKey)
        desktop._selector.releaseSelectedEntries();
      for(var i = 0; i < desktop._dEntrys._items.length; ++i) {
        if(desktop._dEntrys._items[i] != null
          && _this.isOverlap({
            left: _off.left,
            top: _off.top,
            left_e: _off.left + _this.$view.width(),
            top_e: _off.top + _this.$view.height()
          }, desktop._dEntrys._items[i]._dEntry)) {
          desktop._dEntrys._items[i].focus();
        }
      }
    }).on('keydown', 'html', function(e) {
      var upKey = function() {
        desktop._tabIndex += desktop._dEntrys.length() - 1;
        desktop._tabIndex %= desktop._dEntrys.length();
        var _entry = desktop._dEntrys._items[desktop._tabIndex];
        if(_entry == null) {
          do{
            desktop._tabIndex--;
            _entry = desktop._dEntrys._items[0];
          } while(_entry == null);
        }
        _entry.focus();
      };
      var downKey = function() {
        desktop._tabIndex++;
        desktop._tabIndex %= desktop._dEntrys.length();
        var _entry = desktop._dEntrys._items[desktop._tabIndex];
        if(_entry == null) {
          desktop._tabIndex = 0;
          _entry = desktop._dEntrys._items[0];
        } 
        _entry.focus();
      };
      switch(e.which) {
        case 9:    // tab
          if(!e.ctrlKey) {
            _this.releaseSelectedEntries();
          } else {
            console.log('Combination Key: Ctrl + Tab');
          }
          if(e.shiftKey) {
            upKey();
          } else {
            downKey();
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
          if(desktop._tabIndex != -1 
            && desktop._dEntrys._items[desktop._tabIndex] != null)
            desktop._dEntrys._items[desktop._tabIndex].open();
          break;
        case 17:  // ctrl
          desktop._ctrlKey = true;
          break;
        case 37:  // left
          console.log('left');
          break;
        case 38:  // up
          console.log('up');
          if(!e.ctrlKey) 
            _this.releaseSelectedEntries();
          upKey();
          break;
        case 39:  // right
          console.log('right');
          break;
        case 40:  // down
          console.log('down');
          if(!e.ctrlKey) 
            _this.releaseSelectedEntries();
          downKey();
          break;
        case 65:  // a/A
          if(e.ctrlKey) {
            console.log('Combination Key: Ctrl + a/A');
            for(var i = 0; i < desktop._dEntrys._items.length; ++i) {
              if(desktop._dEntrys._items[i] != null)
                desktop._dEntrys._items[i].focus();
            }
          }
          break;
        default:
      }
    }).on('keyup', 'html', function(e) {
      switch(e.which) {
        case 17:  // ctrl
          desktop._ctrlKey = false;
          break;
      }
    });
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
  }
});
