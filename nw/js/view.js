// This file includes all view classes
//

// The view of Desktop
//
var DesktopView = View.extend({
	init: function(model_) {
		this.callSuper(model_);
		this.controller = DesktopController.create(this);
		this.$view = $('body');
	}/* , */
	
	/* update: function(updatedObj_) {} */
});

// Base class for all widget views 
//
var WidgetView = View.extend({
	init: function(model_) {
		this.callSuper(model_);
	},
	
	// // updatedObj_: {
	// //	key1: newVal1,
	// //	key2: newVal2,
	// //	...
	// // }
	// // Keys in updatedObj_ should be same as keys in ops
	// //
	// update: function(updatedObj_) {
		// for(var key in updatedObj_) {
			// this._ops[key].call(this, updatedObj_[key]);
		// }
	/* }, */

	registObservers: function() {
		this._model.on('position', function(err_, newPos_) {});
	},

	initAction: function($selector) {
		$selector.on('drag', this.drag)
			.on('dragOver', this.dragOver)
			.on('drop', this.drop)
			.on('dragEnter', this.dragEnter)
			.on('dragLeave', this.dragLeave);
	},

	drag: function(ev) {
		console.log("drag start");
		// TODO: change to send this view object
		ev.dataTransfer.setData("ID", ev.currentTarget.id);
		console.log(ev.dataTransfer.getData("ID"));
		ev.stopPropagation();
	},

	dragOver: function(ev) {
		ev.preventDefault();
	},

	// TODO: change to use a Command to modify model
	//	and then will emit view's update
	//
	drop: function(ev) {
		//if(ev.srcElement == ev.toElement) return ;
		ev.preventDefault();
		var desktop = _global.get('desktop');
		var _id = ev.dataTransfer.getData("ID");
		if(ev.target.id == _id) return ;
		//ev.target.appendChild(document.getElementById(_id));
		// TODO: get event source's view object from Desktop by dataTransfer object,
		//	and send request to controller
		$(ev.target).append($('#'+_id));
	
		console.log(_id + " ---> " + ev.target.id);
		var attr = ev.target.id.split('_');
		console.log(desktop._widgets[_id]);
		if (typeof desktop._widgets[_id] !== 'undefined') {
				desktop._widgets[_id].setPosition({x: attr[1], y: attr[2]});
				console.log(attr[1], attr[2]);
			}
	},

	dragEnter: function(ev) {},

	dragLeave: function(ev) {}
}); 

// Grid view for Layout model
//
var GridView = WidgetView.extend({
	init: function(model_) {
		this.callSuper(model_);
		this.controller = GridController.create(this);
		this.$view = $('<div>', {
			'class': 'gridcontainer', 
			'id': this._id,
			'onselectstart': 'return false'
		});
	},

	registObservers: function() {},

	show: function() {
		$('body').append(this.$view);

		for(var i = 0; i < this._model._col_num; ++i) {
			var col_ = $('<div>', {
				'class': 'gridcol',
				'id': 'col' + i,
				'onselectstart': 'return false'
			});
			this.$view.append(col_);

			this._model._grid[i] = new Array();
			for(var j = 0; j < this._model._row_num; ++j) {
				var row_ = $('<div>', {
					'class': 'grid',
					'id': 'grid_' + i + '_' + j,
					'draggable':'false',
					'onselectstart': 'return false'
				});
				$('#col' + i).append(row_);

				// var target = document.getElementById('grid_' + i + '_' + j);
				this.initAction($('#grid_' + i + '_' + j));

				this._model._grid[i][j] = {};
				this._model._grid[i][j].use = false;
			}
		}
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
		
		var desktop = _global.get('desktop');
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
			var _dst = desktop._desktopWatch.getBaseDir() + '/' + _name;
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
		if (_items.length != 0 && typeof desktop._widgets[_id] == 'undefined') {
			var _fs = require('fs');
			_items[0].getAsString(function(data){
				for (var i = 0; ; i++) {
					if(_fs.existsSync(desktop._desktopWatch.getBaseDir()+'/newFile'+i+'.txt')) {
						continue;
					} else {
						var iconv = require('iconv-lite');
						var buf = iconv.encode(data,'ucs2');
						var str = iconv.decode(buf,'ucs2');
						_fs.writeFile(desktop._desktopWatch.getBaseDir()+'/newFile'+i+'.txt'
							, str, {encoding:'utf8'}, function(err) {
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

var EntryView = WidgetView.extend({
	init: function(model_) {
		this.callSuper(model_);
		this.registObservers();
		this._controller = EntryController.create(this);
		this.$view = $('<div>', {
			'class': 'icon',
			'id': this._id,
			'draggable': 'true'/* , */
			/* 'tabindex': this._tabIndex */
		}).html("<img draggable='false'/><p>" + this._model.getName() + "</p>");
	},

	registObservers: function() {
		this.callSuper();
		var _this = this;
		this._model.on('name', function(err_, newName_) {
			$('#' + _this._id + ' p').text(newName_);
		}).on('imgPath', function(err_, imgPath_) {
			$('#' + _this._id + ' img').attr('src', imgPath_);
		}).on('tabIdx', function(err_, tabIdx_) {
			$('#' + _this._id).attr('tabindex', tabIdx_);
		});
	},

	initAction: function($selector) {
		this.callSuper();
		var _entry = this._model,
				_this = this,
				desktop = _global.get('desktop');

		$selector.dblclick(function() {
		}).mouseenter(function() {
			$(this).parent().addClass('norhover');
			var $p = $('#' + _entry.getID() + ' p');
			$p.css('height', $p[0].scrollHeight);
		}).mouseleave(function() {
			$(this).parent().removeClass('norhover');
			$('#' + _entry.getID() + ' p').css('height', '32px');
		}).mousedown(function(e) {
			e.stopPropagation();
		}).mouseup(function(e) { 
			/* if(!e.ctrlKey) { */
				// desktop._selector.releaseSelectedEntries();
				// _this.focus();
			// } else {
				// if(_this._focused) {
					// for(var i = 0; i < desktop._selector._selectedEntries.length; ++i) {
						// if(desktop._selector._selectedEntries[i] != null
							// && _entry._id == desktop._selector._selectedEntries[i]._id) {
								// desktop._selector._selectedEntries[i] = null;
								// _this.blur();
								// break;
							// }
					// }
				// } else {
					// _this.focus();
				// }
			/* } */
		});
	},

	focus: function() {
		var desktop = _global.get('desktop');
		this.$view/* .parent() */.addClass('focusing');
		if(!desktop._selector._selectedEntries.hasEntry(this._id))
			desktop._selector._selectedEntries.push(this);
		this._focused = true;
		desktop._tabIndex = this._tabIndex - 1;
	},

	blur: function() {
		this.$view/* .parent() */.removeClass('focusing');
		this._focused = false;
	},

	show: function() {
		var pos = this._model.getPosition(),
				layout = _global.get('desktop').getLayoutType();
		switch(layout) {
			case 'grid':
				$('#grid_' + pos.x + '_' + pos.y).append(this.$view);
				break;
			default:
				break;
		};
	},

	hide: function() {
		var pos = this._model.getPosition(),
				layout = _global.get('desktop').getLayoutType();
		switch(layout) {
			case 'grid':
				$('#grid_' + pos.x + '_' + pos.y).empty();
				break;
			default:
				break;
		};
	},

	drag: function(ev) {
		var desktop = _global.get('desktop');
		if(!desktop._selector._selectedEntries.hasEntry(ev.target.id)) {
			desktop._selector.releaseSelectedEntries();
		}
		this.callSuper(ev);
	},

	drop: function(ev) {
		// TODO: send a command to processer
		// console.log("prevent!!");
		$(this).parent('.grid').removeClass('hovering');
		$(this).parent('.grid').removeClass('norhover');
		ev.preventDefault();
		ev.stopPropagation();
	}
})
