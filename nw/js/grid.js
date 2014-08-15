var Grid = Widget.extend({
	init: function(id_) {
		this.callSuper(id_);
		
		this._col = 80 + 20;
		this._row = 80 + 20;
		this._col_num = undefined;
		this._row_num = undefined;

		this._grid = [];
		this.PATTERN = $('<div>', {
			'class': 'gridcontainer', 
			'id': this._id
		});
	},

	show: function() {
		$('body').append(this.PATTERN);
		
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

			this._grid[i] = new Array();
			for(var j = 0; j < this._row_num; ++j) {
				var row_ = $('<div>', {
					'class': 'grid',
					'id': 'grid' + i + j
				});
				$('#col' + i).append(row_);

				var target = document.getElementById('grid' + i + j);
				this.bindDrag(target);

				this._grid[i][j] = {};
				this._grid[i][j].use = false;
			}
		}
	},

	findAnIdleGrid: function() {
		for(var i = 0; i < this._col_num; ++i) {
			for(var j = 0; j < this._row_num; ++j) {
				if(this._grid[i][j].use == false) {
					return {x: i, y: j};
				}
			}
		}
		return null;
	},

	findAnIdleGridFromRight: function() {
		var col_add = parseInt($('.plugin-div').width()/this._col-0.00001)+1;
		var row_add =  parseInt($('.plugin-div').height()/this._row-0.00001)+1;
		//console.log(col_add+" "+row_add+" "+ this._col + " "+ $('.plugin-div').height());
		for(var i = parseInt(this._col_num-1); i >= 0; i=i-col_add) {
			for(var j = 0; j < this._row_num; j=j+row_add) {
				if(this._grid[i][j].use == false) {
					return {x: i, y: j};
				}
			}
		}
		return null;
	},

	drag: function(ev) {
		console.log("grid is not allowed to drag");
	},

	drop: function(ev) {
		if(ev.target.childNodes.length > 0) return ;
		this.callSuper(ev);
	}
});
