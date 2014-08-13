//This class is totally for desktop management
//
var Desktop = Class.extend({
	init: function() {
		this._col = 80 + 20;
		this._row = 80 + 20;
		this._col_num = undefined;
		this._row_num = undefined;

		this._entries = [];
		this._grid = $('<div>', {
			'class': 'gridcontainer', 
			'id': 'grids'
		});

		this.generateGrid();
	},

	generateGrid: function() {
		$('body').append(this._grid);
		
		var w = $(document).width();
		var h = $(document).height();
		console.log(w + "  " + h);
		this._col_num = Math.floor(w * 0.92 / this._col);
		this._row_num = Math.floor(h * 0.9 / this._row);
		console.log(this._col_num + " " + this._row_num);

		for(var i = 0; i < this._col_num; ++i) {
			var col_ = $('<div>', {
				'class': 'gridcol',
				'id': 'col' + i
			});
			$('#grids').append(col_);

			this._entries[i] = new Array();
			for(var j = 0; j < this._row_num; ++j) {
				var row_ = $('<div>', {
					'class': 'grid',
					'id': 'grid' + i + j
				});
				$('#col' + i).append(row_);

				var target = document.getElementById('grid' + i + j);
				target.ondrop = drop;
				target.ondragover = allowDrop;

				this._entries[i][j] = {};
				this._entries[i][j].use = false;
			}
		}
	},

	findAnIdleGrid: function() {
		for(var i = 0; i < this._col_num; ++i) {
			for(var j = 0; j < this._row_num; ++j) {
				if(this._entries[i][j].use == false) {
					return {x: i, y: j};
				}
			}
		}
		return null;
	},

	loadEntries: function() {},

	addAnDEntry: function(entry_, pos_) {
		if(typeof pos_ === 'undefined') {
			pos_ = this.findAnIdleGrid();
			if(pos_ == null) {
				alert("No room");
				return ;
			}
		}

		entry_.setPosition(pos_);
		entry_.show();
		this._entries[pos_.x][pos_.y].use = true;
	}
});

