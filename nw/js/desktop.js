//This class is totally for desktop management
//
var Desktop = Class.extend({
	init: function() {
		this._grid = undefined;
		this._widgets = [];

		this.generateGrid();
	},

	generateGrid: function() {
		this._grid = Grid.create('grids');
		this._grid.show();
	},

	loadEntries: function() {},

	addAnDEntry: function(entry_, pos_) {
		if(typeof pos_ === 'undefined') {
			pos_ = this._grid.findAnIdleGrid();
			if(pos_ == null) {
				alert("No room");
				return ;
			}
		}

		entry_.setPosition(pos_);
		entry_.show();
		this._grid._grid[pos_.x][pos_.y].use = true;
	},

	addAnDPlugin: function(plugin_, pos_) {
		if(typeof pos_ === 'undefined') {
			pos_ = this._grid.findAnIdleGridFromRight();
			if(pos_ == null) {
				alert("No room");
				return ;
			}
		}

		plugin_.setPosition(pos_);
		plugin_.setShowPanel(plugin_.getClock());
		plugin_.show();
		this._grid._grid[pos_.x][pos_.y].use = true;
	}
});

