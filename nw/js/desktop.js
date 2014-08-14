//This class is totally for desktop management
//
var Desktop = Class.extend({
	init: function() {
		this._grid = undefined;
		this._tabIndex = 1;
		this._widgets = [];

		this.generateGrid();
	},
	
	registWidget: function(widget_) {
		if(typeof this._widgets[widget_.getID()] !== "undefined") {
			alert("This widget has been registed!!");
			return false;
		}
		this._widgets[widget_.getID()] = widget_;
		return true;
	},

	unRegistWidget: function(id_) {
		this._widgets[id_] = undefined;
	},

	generateGrid: function() {
		this._grid = Grid.create('grids');
		this._grid.show();
	},

	loadWidgets: function() {
		this.addAnDEntry(AppEntry.create('gedit', this._tabIndex++, "/usr/share/applications/gedit.desktop"));
		//this.addAnDEntry(AppEntry.create('terminal', this._tabIndex++));
	},

	addAnDEntry: function(entry_, pos_) {
		if(!this.registWidget(entry_)) return ;
		if(typeof pos_ === 'undefined') {
			pos_ = this._grid.findAnIdleGrid();
			if(pos_ == null) {
				alert("No room");
				this.unRegistWidget(entry_.getID());
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

