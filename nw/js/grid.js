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

	setDesktop: function(desktop_) {
		this._desktop = desktop_;
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
	//  |  4   |   8   |
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

	findALegalNearingIdleGrid: function(t_pos_) {
		for(var i = t_pos_.x, firstX = true
			; i != t_pos_.x || firstX
			; i = (i + this._col_num - 1) % this._col_num) {
			firstX = false;
			for(var j = t_pos_.y, firstY = true
				; j != t_pos_.y || firstY
				; j = (j + 1) % this._row_num) {
				firstY = false;
				if(this._grid[i][j].use == false) {
					return {x: i, y: j};
				}
			}
			t_pos_.y = 0;
		}
		return null;
	},

	drag: function(ev) {
		console.log("grid is not allowed to drag");
	},

	dragOver: function(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		ev.dataTransfer.dropEffect = 'copy';
	},

	drop: function(ev) {
		//t_* is target  others is source 
		console.log('drop-grid');
		ev.stopPropagation();
		ev.preventDefault();
		$(this).removeClass('hovering');
		
		var _target_id = ev.target.id;
		var _id = ev.dataTransfer.getData("ID");
		var _target = $('#'+_target_id);
		$('#' + _id).parent().removeClass('norhover');

		//get target position
		var _target_arr = _target_id.split('_');
		var _target_col = parseInt(_target_arr[1]);
		var _target_row = parseInt(_target_arr[2]);
		desktop._position = {x:_target_col,y:_target_row};

		if(typeof desktop._widgets[_id] !== 'undefined' &&
				desktop._widgets[_id]._type == 'dockApp'){
			var id = _id.split('-')[0];
			if (typeof $('#'+id)[0] !== 'undefined') {
				alert("The app has been registed in desktop");
				return ;
			};
			var _tabIndex = desktop._tabIndex++;
			var _path = desktop._widgets[_id]._path;
			var _tmp = _path.split('/');
			var _name = _tmp[_tmp.length -1];
			var _dst = desktop._desktopWatch.getBaseDir()+'/' + _name;
			var _fs = require('fs');
			_fs.rename(_path, _dst, function() {});
			return ;
		}

		//handle file transfer
		var _files = ev.dataTransfer.files;
		if(_files.length != 0) {
			var _fs = require('fs');
			for(var i = 0; i < _files.length; ++i) {
				var dst = desktop._desktopWatch.getBaseDir() + '/' + _files[i].name;
				if(_files[i].path == dst) continue;
				_fs.rename(_files[i].path, dst, function() {});
			}
			return ;
		}

		//handle item transfer (not support chinese) 
		var _items = ev.dataTransfer.items;
		if (_items.length != 0 && typeof desktop._widgets[_id] == 'undefined' && _items[1].type === 'text/uri-list' ) {
			_items[1].getAsString(function(uri){
				var _chp = require('child_process').exec;
				_chp('wget -P ' + desktop._desktopWatch.getBaseDir() +' '+ uri,function(out,err){
					if (out) {console.log(out)};
				});
			});
		}else if (_items.length != 0 && typeof desktop._widgets[_id] == 'undefined') {
			var _fs = require('fs');
			_items[0].getAsString(function(data){
				for (var i = 0; ; i++) {
					if(_fs.existsSync(desktop._desktopWatch.getBaseDir()+'/newFile'+i+'.txt')) {
						continue;
					} else {
						var iconv = require('iconv-lite');
						var buf = iconv.encode(data,'ucs2');
						var str = iconv.decode(buf,'ucs2');
						_fs.writeFile(desktop._desktopWatch.getBaseDir()+'/newFile'+i+'.txt', str,{encoding:'utf8'},function(err) {
							if (err) throw err;
						});
						return ;
					}
				};
			});
		};

		if(typeof desktop._widgets[_id] == 'undefined') return ;
		
		//get source occupy number of grids follow x or y 
		var col_num = 1;
		var row_num = 1;	
		if (desktop._widgets[_id]._type.match(/\w*Plugin/) != null) {
			col_num = desktop._widgets[_id].getColNum();
			row_num = desktop._widgets[_id].getRowNum();
		};
		//get Grid obj
		var desktopGrid = desktop.getGrid();

		//handle multi-entries move
		if(desktop._selector._selectedEntries.length > 1) {
			for(var i = 0; i < desktop._selector._selectedEntries.length; ++i) {
				if(desktop._selector._selectedEntries[i] == null) continue;
				var _s_id = $('#' + desktop._selector._selectedEntries[i]._id).parent().attr('id');
				var _coor = /^.*[_]([0-9]+)[_]([0-9]+)$/.exec(_s_id);
				var _pos = desktopGrid.findALegalNearingIdleGrid({
					x: _target_col
					, y: _target_row
				});
				if(_pos == null) return ;
				$('#grid_' + _pos.x + '_' + _pos.y)
					.append($('#' + desktop._selector._selectedEntries[i]._id));
				console.log(desktop._selector._selectedEntries[i]._id 
					+ " ---> " + _pos.x + '  '  + _pos.y);
				desktop._selector._selectedEntries[i].setPosition({x: _pos.x, y: _pos.y});
				desktopGrid.flagGridOccupy(_pos.x, _pos.y, 1, 1, true);
				_target_col = _pos.x;
				_target_row = _pos.y;
			
				desktopGrid.flagGridOccupy(_coor[1], _coor[2], 1, 1, false);
			}
			desktop.reOrderDEntry();
			desktop.resetDEntryTabIdx();
			return ;
		}

		//get source grid
		var parent_id = $('#'+_id).parent('.grid')[0].id;
		var arr = parent_id.split('_');
		var col = parseInt(arr[1]);
		var row = parseInt(arr[2]);

		//flag grid  isn't occupied
		desktopGrid.flagGridOccupy(col, row, col_num, row_num, false);

		//find Idle grids arround from the target grid
		var pos_ = desktopGrid.findIdleGrid(_target_col,_target_row,col_num,row_num);
		if (pos_ != null) {
			$('#grid_'+pos_.x+'_'+pos_.y).append($('#'+_id));
			console.log(_id + " ---> " + pos_.x + '  '  + pos_.y);
			desktop._widgets[_id].setPosition({x: pos_.x, y: pos_.y});
			desktopGrid.flagGridOccupy(pos_.x, pos_.y, col_num, row_num, true);
			if(desktop._widgets[_id]._type.match(/\w*Plugin/) == null) {
				desktop.reOrderDEntry();
				desktop.resetDEntryTabIdx();
			}
			return ;
		}

		desktopGrid.flagGridOccupy(col, row, col_num, row_num, true);
		console.log(_target_id + " is occupied");
	},

	dragEnter: function(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		$(this).addClass('hovering');
	},

	dragLeave: function(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		$(this).removeClass('hovering');
	}
});
