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

// The Controller of Grid
//
var GridController = WidgetController.extend({
  init: function(view_) {
    this.callSuper(view_);
  }
});

// The Controller of Entry
//
var EntryController = WidgetController.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  rename: function() {
    var desktop = _global.get('desktop');
    desktop._ctxMenu.hide();
    var $p = $('#' + this._view._id + ' p');
    desktop._inputer.show({
      'left': $p.parent().parent().offset().left,
      'top': $p.offset().top,
      'height': $p.height(),
      'width': $p.parent().parent().width(),
      'oldtext': $p.text(),
      'callback': function(newtext) {
        // entry's name is not changed
        var _entry = desktop.getAWidgetById(desktop._rightObjId)._model;
        if(_entry.getName() == newtext) return ;
        // entry's name has already existed
        var _entries = desktop._dEntrys._items;
        for(var i = 0; i < _entries.length; ++i) {
          if(_entries[i]._name == newtext) {
            /* var dialog = require('dialog');  */
            /* dialog.warningBox(newtext + ' has already existed');  */
            alert(newtext + ' has already existed');
            return ;
          }
        }
        var cmd = NormalCommand.create(_entry._model
          , _entry._model.getName, _entry._model.setName, newtext);
        _global.get('theCP').perform(cmd);
      }
    });
  },

  onDrop: function(ev) {
    var cmd;
    if(ev.ctrlKey || this._model.getType() == 'dev' || this._model.getType() == 'app') {
      cmd = NoUndoCommand.create(this._model, 'exec', this._model.copyTo, {});
    } else {
      cmd = NoUndoCommand.create(this._model, 'exec', this._model.moveTo, {});
    }
    _global.get('theCP').perform(cmd);
  },

  onDblclick: function() {
    var cmd = NoUndoCommand.create(this._model, 'exec', this._model.open);
    _global.get('theCP').perform(cmd);
  }
});
