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

	update: function(updatedObj_) {},

	changePos: function(newPos_) {
		var cmd = NormalCommand.create(this._model.getPosition, this._model.setPosition, newPos_);
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
