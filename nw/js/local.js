//This file includes controller classes used in local end
//

// Base class for widget controllers
//
var WidgetController = Controller.extend({
	init: function(view_) {
		this.callSuper(view_);
		this._CP = global.get('theCP');
	},

	update: function(updatedObj_) {},

	changePos: function(newPos_) {
		var cmd = NormalCommand.create(this._model.getPosition, this._model.setPosition, newPos_);
		this._CP.perform(cmd);
	}
});
