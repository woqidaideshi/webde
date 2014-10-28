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

  onRename: function() {
    var desktop = _global.get('desktop'),
        layout = desktop.getCOMById('layout'),
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
          if(_entries[i]._name == newtext) {
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

  onDrop: function(ev, tarArr) {
    var cmd, tarIdArr = [];
    for(var i = 0; i < tarArr.length; ++i) {
      if(tarArr[i] != null)
        tarIdArr.push(tarArr[i].getID());
    }
    if(ev.ctrlKey || this._model.getType() == 'dev' || this._model.getType() == 'app') {
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
  }
});

var DockEntryController = EntryController.extend({
  init: function(view_) {
    this.callSuper(view_);
  },

  onClick: function() {
    this.onDblclick();
  }
})
