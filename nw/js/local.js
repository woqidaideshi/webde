// This file includes controller classes used in local end
//

// The controller of Desktop
//
var DesktopController = Controller.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  update: function(updatedObj_) {}
});

// Base class for widget controllers
//
var WidgetController = Controller.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  registObservers: function() {},

  changePos: function(newPos_) {
    var cmd = NormalCommand.create(this._model
      , this._model.getPosition, this._model.setPosition, newPos_);
    _global.get('theCP').perform(cmd);
  }
});

var FlipperController = Controller.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  onAdd: function() {
    var desktop = _global.get('desktop');
    switch(desktop.getLayoutType()) {
      case 'grid':
        this._model.add(GridModel.create('grid-' + this._model.getNum()
            , this._model, WidgetManager));
        break;
      default:
        break;
    }
  }
})

// The Controller of Grid
//
var GridController = WidgetController.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  onAddFile: function(path_, inode_) {
    var desktop = _global.get('desktop'),
        entry = FileEntryModel.create('id-' + inode_, this._model, path_, desktop._position);
    _global.get('theCP').perform(NoUndoCommand.create(this._model, 'exec', this._model.add, entry));
  },

  onAddFolder: function(path_, id_, list_) {
    var desktop = _global.get('desktop'),
        l = list_ || [],
        entry = DirEntryModel.create(id_, this._model, path_, desktop._position, function() {
          this.setList(l);
        });
    _global.get('theCP').perform(NoUndoCommand.create(this._model, 'exec', this._model.add, entry));
  },

  onDockAppDrop: function(widget_) {
    var CP = _global.get('theCP');
    CP.perform(NoUndoCommand.create(widget_, 'exec', widget_.unlinkFromDock));
    CP.perform(NoUndoCommand.create(widget_, 'exec', widget_.linkToDesktop));
  }
});

// The Controller of Entry
//
var EntryController = WidgetController.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  onRename: function() {
    var desktop = _global.get('desktop'),
        layout = this._view._parent,
        _entry = this._model,
        $p = this._view.$view.children('p');
    _global.get('ctxMenu').hide();
    desktop._inputer.show({
      'left': $p.parent().parent().offset().left,
      'top': $p.offset().top,
      'height': $p.height(),
      'width': $p.parent().parent().width(),
      'oldtext': $p.text(),
      'callback': function(newtext) {
        // entry's name is not changed
        if(_entry.getName() == newtext) return ;
        // entry's name has already existed
        var _entries = layout._dEntrys._items;
        for(var i = 0; i < _entries.length; ++i) {
          if(_entries[i] == null) break;
          if(_entries[i]._model.getName() == newtext) {
            Messenger.options = {
              extraClasses: "messenger-fixed messenger-on-top"
            };
            Messenger().post({
              message: '"' + newtext + '"' + ' has already existed',
              type: 'info',
              showCloseButton: true
            });
            return ;
          }
        }
        var cmd = NormalCommand.create(_entry, _entry.getName, _entry.rename, newtext);
        _global.get('theCP').perform(cmd);
      }
    });
  },

  onDrop: function(ev, tArr) {
    var cmd, tarIdArr = [], tarArr = tArr || [];
    for(var i = 0; i < tarArr.length; ++i) {
      if(tarArr[i] != null)
        tarIdArr.push(tarArr[i].getID());
    }
    if(ev.ctrlKey || this._model.getType() == 'dev' || this._model.getType() == 'app'
        || this._model.getType() == 'account') {
      cmd = NoUndoCommand.create(this._model, 'exec', this._model.copyTo
          , ev.originalEvent.dataTransfer, tarIdArr);
    } else {
      cmd = NoUndoCommand.create(this._model, 'exec', this._model.moveTo
          , ev.originalEvent.dataTransfer, tarIdArr);
    }
    _global.get('theCP').perform(cmd);
  },

  onDblclick: function() {
    var cmd = NoUndoCommand.create(this._model, 'exec', this._model.open);
    _global.get('theCP').perform(cmd);
  },

  onEntryDelete: function() {
    _global.get('theCP').perform(NoUndoCommand.create(this._model, 'exec'
          , this._model.unlinkFromDesktop));
  },

  onFileDelete: function() {
  }
});

var LauncherEntryController = EntryController.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  onClick: function() {
    this.onDblclick();
  },

  onAddToDesktop: function() {
    _global.get('theCP').perform(NoUndoCommand.create(this._model
        , 'exec', this._model.linkToDesktop));
  },

  onAddToDock: function() {
    _global.get('theCP').perform(NoUndoCommand.create(this._model
        , 'exec', this._model.linkToDock));
  }
});

var DockEntryController = EntryController.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  onClick: function() {
    this.onDblclick();
  },

  onEntryDelete: function() {
    _global.get('theCP').perform(NoUndoCommand.create(this._model, 'exec'
          , this._model.unlinkFromDock));
  }
});

var DockController = Controller.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  onAppDrop: function(widget_) {
    var CP = _global.get('theCP');
    CP.perform(NoUndoCommand.create(widget_, 'exec', widget_.unlinkFromDesktop));
    CP.perform(NoUndoCommand.create(widget_, 'exec', widget_.linkToDock));
  }
})

var LoginController = Controller.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  onLogin: function(account_, password_) {
    // TODO: show waiting page
    this._view.toggleLogin(true);
    var cmd = NoUndoCommand.create(this._model, 'exec', this._model.doLogin 
          , account_, password_);
    _global.get('theCP').perform(cmd); 
  },

  onCancelLogin: function() {
    this._view.toggleLogin(false);
    var cmd = NoUndoCommand.create(this._model, 'exec', this._model.cancelLogin);
    _global.get('theCP').perform(cmd); 
  },

  onRegist: function(account_, password_) {
    var cmd = NoUndoCommand.create(this._model, 'exec', this._model.doRegist
        , account_, password_);
    _global.get('theCP').perform(cmd); 
  },

  onLogout: function() {
    var cmd = NoUndoCommand.create(this._model, 'exec', this._model.doLogout);
    _global.get('theCP').perform(cmd); 
  }
});

var DevEntryController = EntryController.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  onDrop: function(ev, tArr, cb_) {
    var cmd, tarIdArr = [],
      tarArr = tArr || [];
    for (var i = 0; i < tarArr.length; ++i) {
      if (tarArr[i] != null)
        tarIdArr.push(tarArr[i].getID());
    }
    if (ev.ctrlKey || this._model.getType() == 'dev' || this._model.getType() == 'app' || this._model.getType() == 'account') {
      cmd = NoUndoCommand.create(this._model, 'exec', this._model.copyTo, ev.originalEvent.dataTransfer, tarIdArr, cb_);
    } else {
      cmd = NoUndoCommand.create(this._model, 'exec', this._model.moveTo, ev.originalEvent.dataTransfer, tarIdArr, cb_);
    }
    _global.get('theCP').perform(cmd);
  },

  onDblclick: function(cb_) {
    var cmd = NoUndoCommand.create(this._model, 'exec', this._model.open, cb_);
    _global.get('theCP').perform(cmd);
  },
});
