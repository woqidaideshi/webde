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

	// col_l , row_l <= 2
	// power of 2*2 grid as follow :
	//  ------------------
	//  |  1   |   2   |
	//  ------------------
	//   |  4  |   8   |
	//  ------------------
	findIdleGrid: function(col,row,col_l,row_l){
		var sum = 0;
		for (var i = col; i >= 0; i--) {
			if (col - i >=  col_l) {break};
			for(var j = row; j< this._row_num ;j++)
			{
				if(j-row >= row_l) break;
				if(this._grid[i][j].use == true)
				{
					sum += (col-i+1)*(j-row+1)*(j-row+1);
				}
			}
		}
		if (sum == 0) return {x:col,y:row};										//don't move
		else if( sum == 3 && row < this._row_num-1)  return {x: col,y:row +1};  //move to down 
		else if (sum == 5 && col > 0) return {x:col-1,y:row};								// move to reight
		else if ( (sum == 1 || sum == 7) && col >0 &&  row < this._row_num-1) return {x:col-1, y: row+1};		// move to right down
		else if ( sum == 10 && col < this._col_num -1 ) return {x:col+1, y: row};		// move to left
		else if ((sum == 2 || sum == 11) && col < this._col_num -1 &&  row < this._row_num-1) return {x:col+1, y: row+1};		// move to left down
		else if ( sum == 12 && row > 0 ) return {x:col, y:row-1};                               //move to top 		
		else if ((sum ==4  || sum == 13) && col >0 &&  row>0 ) return {x:col-1, y: row-1};		// move to right top
		else if ((sum == 8 || sum == 14) && col < this._col_num -1 &&  row > 0 ) return {x:col+1, y: row-1};		// move to left top
		else return null;											// can't find grid is Idel
	},

	//flag grid_x_y is occupied or not 
	// width=col_l height = row_l  
	//occupy_ = true or false(occupy or not) ;  brother_ is nomber of all the brother grids 
	flagGridOccupy : function(col,row,col_l,row_l,occupy_){
		for (var i = col; i >= 0; i--) {
			if (col - i >=  col_l) {break};
			for(var j = row; j< this._row_num ;j++)
			{
				if(j-row >= row_l) break;
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
		var loopN = 3;
		while(loopN--)
		{
		var pos_ = desktopGrid.findIdleGrid(t_col,t_row,col_num,row_num);
			if (pos_ != null) {
				if (pos_.x == t_col && pos_.y == t_row) {
					//this.callSuper(ev);
					$('#grid_'+pos_.x+'_'+pos_.y).append($('#'+_id));
					console.log(_id + " ---> " + pos_.x + '  '  + pos_.y);
					desktop._widgets[_id].setPosition({x: pos_.x, y: pos_.y});
					desktopGrid.flagGridOccupy(t_col, t_row, col_num, row_num, true);
					return ;
				}else {
					t_col = pos_.x;
					t_row = pos_.y;
				}
			}else{
				break;
			}
		}
		desktopGrid.flagGridOccupy(col, row, col_num, row_num, true);
		console.log(t_id + " is occupied");
	}
});
