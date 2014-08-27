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

	//check grid is occupy return true
	// if grid is Idle or null  return false
	isIdleGrid: function(col,row, col_l, row_l){
		if(col >= 0 && col < this._col_num && row >= 0 && row < this._row_num)
		{
			for (var i = col; i >= 0; i--) {
				if (col - i >=  col_l) {break};
				for(var j = row; j< this._row_num ;j++){
						if(j-row >= row_l) break;
						if(this._grid[i][j].use == true) return false;
				}
			}
			return true;
		}
		else return false;
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
		switch(sum){
			case 0:
			return {x:col,y:row};					
			case 8: 
				if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};                 //left
				else if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};		// top
				else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};		//left-top
				break;
			case 4 :
				if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};				//right
				else if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};		//top
				else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};		//right-top
				break;
			case 2:
				if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};				//left 
				else if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};		//down
				else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};	//left-down
				break;
			case 1:
				if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};				//right
				else if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};		//down
				else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};		//right-down
				break;
			case 3:
				if (this.isIdleGrid(col, row+1, col_l,row_l)) return {x:col,y:row+1};				//down
				else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};	//left-down
				else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};		//right-down
				break;
			case 12:
				if (this.isIdleGrid(col, row-1, col_l,row_l)) return {x:col,y:row-1};				//top
				else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};		//left-top
				else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};		//right-top
				break;
			case 10:
				if (this.isIdleGrid(col+1, row, col_l,row_l)) return {x:col+1,y:row};				//left
				else if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};		//left-top
				else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};	//left-down
				break;
			case 5:
				if (this.isIdleGrid(col-1, row, col_l,row_l)) return {x:col-1,y:row};				//right
				else if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};		//right-top
				else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};		//right-down
				break;
			case 6:
				if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};		//left-top
				else if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};		//right-down
				break;
			case 14:
				if (this.isIdleGrid(col+1, row-1, col_l,row_l)) return {x:col+1,y:row-1};		//left-top
				break;
			case 9:
				if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};			//right-top
				else if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};	//left-down
				break;
			case 13:
				if (this.isIdleGrid(col-1, row-1, col_l,row_l)) return {x:col-1,y:row-1};			//right-top
				break;
			case 7:
				if (this.isIdleGrid(col-1, row+1, col_l,row_l)) return {x:col-1,y:row+1};		//right-down
				break;
			case 11:
				if (this.isIdleGrid(col+1, row+1, col_l,row_l)) return {x:col+1,y:row+1};		//left-down
				break;
			default:
				return null;									//no Idle grid;
		}
		return null;											// can't find grid is Idel
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
		var target = $('#'+t_id);

		//get target position
		var t_arr = t_id.split('_');
		var t_col = parseInt(t_arr[1]);
		var t_row = parseInt(t_arr[2]);

		if(desktop._widgets[_id]._type == 'dockApp'){
			var id = _id.split('-')[0];
			if (typeof $('#'+id)[0] !== 'undefined') {
				alert("The app has been registed in desktop");
				return ;
			};
			var tabIndex = desktop._tabIndex++;
			var path = desktop._widgets[_id]._path;
			desktop.unRegistWidget(_id);
			$('#'+_id).remove();
			desktop.addAnDEntry(AppEntry.create(id
				,tabIndex
				,path
				,{x:t_col,y:t_row}
				),{x:t_col,y:t_row});
			return ;
		}

		//get source occupy number of grids follow x or y 
		var col_num = parseInt($('#' + _id).width()/target.width()-0.00001)+1;
		var row_num =  parseInt($('#' + _id).height()/target.height()-0.00001)+1;

		//get Grid obj
		var desktopGrid = desktop.getGrid();

		//get source grid
		var parent_id = $('#'+_id).parent('.grid')[0].id;
		var arr = parent_id.split('_');
		var col = parseInt(arr[1]);
		var row = parseInt(arr[2]);

		//flag grid  isn't occupied
		desktopGrid.flagGridOccupy(col, row, col_num, row_num, false);

		//find Idle grids arround from the target grid
		var pos_ = desktopGrid.findIdleGrid(t_col,t_row,col_num,row_num);
		if (pos_ != null) {
			$('#grid_'+pos_.x+'_'+pos_.y).append($('#'+_id));
			console.log(_id + " ---> " + pos_.x + '  '  + pos_.y);
			desktop._widgets[_id].setPosition({x: pos_.x, y: pos_.y});
			desktopGrid.flagGridOccupy(pos_.x, pos_.y, col_num, row_num, true);
			return ;
		}

		desktopGrid.flagGridOccupy(col, row, col_num, row_num, true);
		console.log(t_id + " is occupied");
	}
});
