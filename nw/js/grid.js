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
			'id': this._id,
			'onselectstart': 'return false'
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
				'id': 'col' + i,
				'onselectstart': 'return false'
			});
			$('#grids').append(col_);

			this._grid[i] = new Array();
			for(var j = 0; j < this._row_num; ++j) {
				var row_ = $('<div>', {
					'class': 'grid',
					'id': 'grid_' + i +'_'+ j,
					'draggable':'false',
					'onselectstart': 'return false'
				});
				$('#col' + i).append(row_);

				var target = document.getElementById('grid_' + i+'_'+ j);

				this.bindDrag(target);

				this._grid[i][j] = {};
				this._grid[i][j].use = false;
			}
		}
	},

	findAnIdleGrid: function() {
		for(var i = parseInt(this._col_num-1); i >= 0; --i) {
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
		for(var i =0; i < this._col_num; i=i+col_add) {
			for(var j = 0; j < this._row_num; j=j+row_add) {
				if(this._grid[i][j].use == false) {
					return {x: i, y: j};
				}
			}
		}
		return null;
	},

	//flag grid_x_y is occupied or not 
	// width=col_l height = row_l  
	//occupy_ = true or false(occupy or not) ;  brother_ is nomber of all the brother grids 
	flagGridOccupy : function(x,y,col_l,row_l,occupy_){
		for (var i = x; i >= 0; i--) {
			if (x - i >=  col_l) {break};
			for(var j = y; j< this._row_num ;j++)
			{
				if(j-y >= row_l) break;
				this._grid[i][j].use=occupy_;
			}
		}
	},

	drag: function(ev) {
		console.log("grid is not allowed to drag");
	},

	drop: function(ev) {
		//t_* is target  others is source 
		console.log('drop-grid');
		ev.preventDefault();
		var t_id = ev.target.id;
		var _id = ev.dataTransfer.getData("ID");
		if (_id==null || _id == '') 
			{ 
				ev.stopPropagation();
				return ;
			}
		var className = document.getElementById(_id).className;
		//if drag-obj isn't plugin or entry
		if (className !== 'plugin-div' && className !== 'icon') {
			return ;
		};
		var target = $('#'+t_id);
		//get source occupy number of grids follow x or y 
		var col_num = parseInt($('#' + _id).width()/target.width()-0.00001)+1;
		var row_num =  parseInt($('#' + _id).height()/target.height()-0.00001)+1;
		//get target position
		var t_arr = t_id.split('_');
		var t_col = parseInt(t_arr[1]);
		var t_row = parseInt(t_arr[2]);

		//get Grid obj
		var desktopGrid = desktop.getGrid();

		//get source grid
		var parent_id = $('#'+_id).parent('.grid')[0].id;
		var arr = parent_id.split('_');
		var col = parseInt(arr[1]);
		var row = parseInt(arr[2]);

		//flag grid  isn't occupied
		desktopGrid.flagGridOccupy(col, row, col_num, row_num, false);

		//check grid have been occupied
		for (var i = t_col; i >= 0; i--) {
			if (t_col - i >=  col_num) {break};
			for(var j = t_row;j<=target.siblings().length;j++)
			{
				if(j-t_row >= row_num) break;
				//target grid is occupied 
				if(desktopGrid._grid[i][j].use == true){
				desktopGrid.flagGridOccupy(col, row, col_num, row_num, true);
				console.log(ev.target.id + " is occupied");
				return;
				}
			}
		}

		this.callSuper(ev);
		//flag target grid is occupied
		desktopGrid.flagGridOccupy(t_col, t_row, col_num, row_num, true);
	}
});
