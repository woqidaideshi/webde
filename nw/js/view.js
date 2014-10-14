// This file includes all view classes
//

// The view of Desktop
//
var DesktopView = View.extend({
	init: function(model_) {
		this.callSuper('desktop-view', model_);
		this.controller = DesktopController.create(this);
		this.registObservers();
		this.$view = $('body');
		this._c = [];
		this.initAction();
	}, 
	
	registObservers: function() {
		var _this = this;
		this._model.on('add', function(err_, component_) {
			switch(component_.getID()) {
				case 'launcher':
					// TODO: create a launcher view(split create and init into two functions, and
					//	here just create a view object)
					break;
				case 'layout':
					break;
				case 'device-list':
					_this._c['device-list'] = DeviceListView.create(component_);
					_this._c['device-list'].show(_this.$view);
					break;
        case 'dock':
          _this._c[component_.getID()] = DockView.create(component_);
          _this._c[component_.getID()].show(_this.$view);
          break;
				default:
					console.log('unknown type of component');
					break;
			}
		}).on('remove', function(err_, component_) {
		}).on('layout', function(err_, viewType_, layoutModel_) {
			// TODO: 
			//	reset desktop layout
			switch(viewType_) {
				case 'grid':
					_this._c['layout-view'] = GridView.create('grid-view', layoutModel_);
					_this._c['layout-view'].show(_this.$view);
					break;
				default:
					break;
			}
		});
	},

	initAction: function() {
		var _this = this;
		$(window).on('unload', function() {
			_this._model.release();
		});
	}
});

// Base class for all widget views 
//
var WidgetView = View.extend({
	init: function(id_, model_) {
		this.callSuper(id_, model_);
	},
	
	registObservers: function() {
		var _this = this;
		this._model.on('position', function(err_, newPos_) {
			_this.show();
		});
	},

	initAction: function($selector) {
		$selector.on('dragstart', this.drag)
			.on('dragover', this.dragOver)
			.on('drop', this.drop)
			.on('dragenter', this.dragEnter)
			.on('dragleave', this.dragLeave);
	},

	drag: function(ev) {
		console.log("drag start");
		// TODO: change to send this view object as the transfer data
		ev.originalEvent.dataTransfer.setData("ID", ev.originalEvent.currentTarget.id);
		console.log(ev.originalEvent.dataTransfer.getData("ID"));
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
		var desktop = _global.get('desktop'),
				_id = ev.originalEvent.dataTransfer.getData("ID");
		if(ev.originalEvent.target.id == _id) return ;
		//ev.target.appendChild(document.getElementById(_id));
		// TODO: get event source's view object from Desktop by dataTransfer object,
		//	and send request to controller
		$(ev.originalEvent.target).append($('#'+_id));
	
		console.log(_id + " ---> " + ev.originalEvent.target.id);
		var attr = ev.originalEvent.target.id.split('_');
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
	init: function(id_, model_) {
		this.callSuper(id_, model_);
		this.controller = GridController.create(this);
		this.registObservers();
		this.$view = $('<div>', {
			'class': 'gridcontainer', 
			'id': this._id,
			'onselectstart': 'return false'
		});
		this._c = [];
	},

	registObservers: function() {
		var _this = this;
		this._model.on('add', function(err_, widget_) {
			if(err_) {
				console.log(err_);
				return ;
			}
			switch(widget_.getType()) {
				case 'ClockPlugin':
          _this.addAnDPlugin(ClockPluginView.create(widget_.getID(), widget_), widget_);
					break;
				case 'ImagePlugin':
					break;
				default:
					_this.addAnDEntry(widget_);
					break;
			}
		}).on('remove', function(err_, widget_) {
			if(err_) {
				console.log(err_);
				return ;
			}
			switch(widget_.getType()) {
				case 'ClockPlugin':
					break;
				case 'ImagePlugin':
					break;
				default:
					_this.deleteAnDEntry(widget_);
					break;
			}
		});
	},

	addAnDEntry: function(entry_) {
		var pos_ = entry_.getPosition();
		if(typeof pos_ === 'undefined' || 
			typeof $('#grid_' + pos_.x + '_' + pos_.y).children('div')[0] != 'undefined') {
			pos_ = this._model.findAnIdleGrid();
			if(pos_ == null) {
				alert("No room");
				this._model.remove(entry_);
				return ;
			}
		}

		this._c[entry_.getID()] = DEntryView.create(entry_.getID(), entry_);
		entry_.setPosition(pos_);
		// this._c[entry_.getID()].show();
		/* this._dEntrys.push(entry_); */
		/* this.resetDEntryTabIdx(); */
		this._model._grid[pos_.x][pos_.y].use = true;
	},

	deleteADEntry: function(entry_) {
		var _pos = entry_.getPosition();
		this._layoutModel._grid[_pos.x][_pos.y].use = false;
		// this._dEntrys.remove(entry_.getTabIdx() - 1);
		// this.resetDEntryTabIdx();
		this._c[entry_.getID()].hide();
		this._c[entry_.getID()] = null;
		delete this._c[entry_.getID()];
	},

  addAnDPlugin: function(pluginView_, plugin_) {
		var pos_ = plugin_.getPosition();
		if(typeof pos_ === 'undefined') {
			pos_ = this._model.findAnIdleGridFromRight();
			if(pos_ == null) {
				alert("No room");
				this._model.remove(plugin_);
				return ;
			}
		}

		plugin_.setPosition(pos_);
		/* plugin_.show(); */
		/* plugin_.setPanel(path_); */
		//get number of occupy-grid col and row
		this._model.flagGridOccupy(pos_.x, pos_.y, plugin_.getColNum(), plugin_.getRowNum(), true);
	},

	show: function($parent) {
		$parent.append(this.$view);

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
		ev.stopPropagation();
	},

	dragOver: function(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		ev.originalEvent.dataTransfer.dropEffect = 'copy';
	},

	drop: function(ev) {
		//t_* is target  others is source 
		console.log('drop-grid');
		ev.stopPropagation();
		ev.preventDefault();
		$(this).removeClass('hovering');
		
		var _target_id = ev.target.id;
		var _id = ev.originalEvent.dataTransfer.getData("ID");
		var _target = $('#'+_target_id);
		var desktop = _global.get('desktop'),
				model = desktop.getCOMById('layout'),
				s_widget = model.getWidgetById(_id);
		$('#' + _id).parent().removeClass('norhover');

		//get target position
		var _target_arr = _target_id.split('_');
		var _target_col = parseInt(_target_arr[1]);
		var _target_row = parseInt(_target_arr[2]);
		desktop._position = {x:_target_col,y:_target_row};

		if(typeof s_widget !== 'undefined' &&
				s_widget.getType() == 'dockApp'){
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
		var _files = ev.originalEvent.dataTransfer.files;
		if(_files.length != 0) {
			for(var i = 0; i < _files.length; ++i) {
				var dst = desktop._desktopWatch.getBaseDir() + '/' + _files[i].name;
				if(_files[i].path == dst) continue;
				_global._fs.rename(_files[i].path, dst, function() {});
			}
			return ;
		}

		//handle item transfer (not support chinese) 
		var _items = ev.originalEvent.dataTransfer.items;
		if (_items.length != 0 && typeof s_widget == 'undefined') {
			var _fs = require('fs');
			_items[0].getAsString(function(data){
				for (var i = 0; ; i++) {
					if(_fs.existsSync(desktop._desktopWatch.getBaseDir()+'/newFile'+i+'.txt')) {
						continue;
					} else {
						var iconv = require('iconv-lite');
						var buf = iconv.encode(data,'ucs2');
						var str = iconv.decode(buf,'ucs2');
						_fs.writeFile(desktop._desktopWatch.getBaseDir() + '/newFile' + i + '.txt'
							, str, {encoding:'utf8'}, function(err) {
								if (err) throw err;
							});
						return ;
					}
				};
			});
		};

		if(typeof s_widget == 'undefined') return ;
		
		//get source occupy number of grids follow x or y 
		var col_num = 1;
		var row_num = 1;	
		if (s_widget.getType().match(/\w*Plugin/) != null) {
			col_num = s_widget.getColNum();
			row_num = s_widget.getRowNum();
		};
		//get Grid obj
		// var desktopGrid = desktop.getGrid();

		//handle multi-entries move
		//
		/* if(desktop._selector._selectedEntries.length > 1) { */
			// for(var i = 0; i < desktop._selector._selectedEntries.length; ++i) {
				// if(desktop._selector._selectedEntries[i] == null) continue;
				// var _s_id = $('#' + desktop._selector._selectedEntries[i]._id).parent().attr('id');
				// var _coor = /^.*[_]([0-9]+)[_]([0-9]+)$/.exec(_s_id);
				// var _pos = desktopGrid.findALegalNearingIdleGrid({
					// x: _target_col
					// , y: _target_row
				// });
				// if(_pos == null) return ;
				// $('#grid_' + _pos.x + '_' + _pos.y)
					// .append($('#' + desktop._selector._selectedEntries[i]._id));
				// console.log(desktop._selector._selectedEntries[i]._id 
					// + " ---> " + _pos.x + '  '  + _pos.y);
				// desktop._selector._selectedEntries[i].setPosition({x: _pos.x, y: _pos.y});
				// desktopGrid.flagGridOccupy(_pos.x, _pos.y, 1, 1, true);
				// _target_col = _pos.x;
				// _target_row = _pos.y;
			
				// desktopGrid.flagGridOccupy(_coor[1], _coor[2], 1, 1, false);
			// }
			// desktop.reOrderDEntry();
			// desktop.resetDEntryTabIdx();
			// return ;
		/* } */

		//get source grid
		var parent_id = $('#'+_id).parent('.grid')[0].id;
		var arr = parent_id.split('_');
		var col = parseInt(arr[1]);
		var row = parseInt(arr[2]);

		//flag grid  isn't occupied
		model.flagGridOccupy(col, row, col_num, row_num, false);

		//find Idle grids arround from the target grid
		var pos_ = model.findIdleGrid(_target_col,_target_row,col_num,row_num);
		if (pos_ != null) {
			// $('#grid_'+pos_.x+'_'+pos_.y).append($('#'+_id));
			console.log(_id + " ---> " + pos_.x + '  '  + pos_.y);
			s_widget.setPosition({x: pos_.x, y: pos_.y});
			model.flagGridOccupy(pos_.x, pos_.y, col_num, row_num, true);
			if(s_widget.getType().match(/\w*Plugin/) == null) {
				desktop.reOrderDEntry();
				desktop.resetDEntryTabIdx();
			}
			return ;
		}

		model.flagGridOccupy(col, row, col_num, row_num, true);
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

var DPluginView = WidgetView.extend({
  init: function(id_, model_) {
    this.callSuper(id_, model_);
    this.registObservers();
    // this._controller = null;
    this.$view = $('<div>', {
			'class': 'plugin-div',
			'id': this._id,
			'draggable': 'true'
		}).html("<canvas id='" + this._id + this._model._content + "'/>");//  width='100%' height='100%'
    this._ctx = this.$view.children('canvas')[0].getContext('2d');
    this.initAction(this.$view);
  },
	
	registObservers: function() {
		var _this = this;
		this._model.on('size', function(err_, size_) {
      if(err_) {
        console.log(err_);
        return ;
      }
      _this.$view.width(size_.width).height(size_.height);/* .children('canvas').css({ */
        // 'width': size_.width,
        // 'height': size_.height
      /* }) */;
      _this._ctx.canvas.width = size_.width;
      _this._ctx.canvas.height = size_.height;
		}).on('position', function(err_, pos_) {
      var layoutType = _global.get('desktop').getLayoutType();
      switch(layoutType) {
        case 'grid':
          _this.show($('#grid_' + pos_.x + '_' + pos_.y));
          break;
        default:
          break;
      }
    });
	},

	initAction: function($selector) {
    this.callSuper($selector);
		$selector.on('mousedown', function(e) {
      e.stopPropagation();
    }).on('mouseup', function(e) {
      e.stopPropagation();
    });
	},

  show: function($parent) {
    $parent.append(this.$view);
    this._model.setSize({
      width: this.$view.width(),
      height: this.$view.height()
    });
  },

  hide: function() {
    this.$view.remove();
  },

  dragover: function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  },

  drop: function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
});

var ClockPluginView = DPluginView.extend({
  init: function(id_, model_) {
    this.callSuper(id_, model_);
  },

  show: function($parent) {
    this.callSuper($parent);
    var /* _target = $('#' + this._id + this._model._content), */
        _context = this._ctx/* _target[0].getContext('2d') */,
        _size = this._model.getSize(),
        _img = new Image();

    _img.src = this._model._path;
		_img.onload = function() {  
		  _context.drawImage(_img, 0, 0, _size.width, _size.height);
		}

    var run = function() {
			var _type = [['#000',70,1],['#ccc',60,2],['red',50,3]];
			function drwePointer(type_, angle_){
				type_ = _type[type_];
				angle_ = angle_*Math.PI*2 - 90/180*Math.PI; 
				var _length = type_[1] / (200 / _size.width);
				_context.beginPath();
				_context.lineWidth = type_[2];
				_context.strokeStyle = type_[0];
				_context.moveTo( _size.width / 2, _size.height / 2); 
				_context.lineTo( _size.width / 2 + _length*Math.cos(angle_), _size.height/2 
            + _length*Math.sin(angle_)); 
				_context.stroke();
				_context.closePath();
			}
			setInterval(function (){
				_context.clearRect(0,0, _size.height, _size.width);
				_context.drawImage(_img,0,0, _size.width, _size.height);
				var _time = new Date();
				var _hour = _time.getHours();
				var _mimute = _time.getMinutes();
				var _second = _time.getSeconds(); 
				_hour = _hour > 12?_hour - 12: _hour;
				_hour = _hour+_mimute/60; 
				_hour=_hour/12;
				_mimute=_mimute/60;
				_second=_second/60;
				drwePointer(0,_second);
				drwePointer(1,_mimute);
				drwePointer(2,_hour); 
			}, 100);
		};
    run();
  }
});

var DEntryView = WidgetView.extend({
	init: function(id_, model_) {
		this.callSuper(id_, model_);
		this.registObservers();
		this._controller = EntryController.create(this);
		this.$view = $('<div>', {
			'class': 'icon',
			'id': this._id,
			'draggable': 'true'/* , */
			/* 'tabindex': this._tabIndex */
		}).html("<img draggable='false'/><p>" + this._model.getName() + "</p>");
		this.initAction(this.$view);
	},

	registObservers: function() {
		this.callSuper();
		var _this = this;
		this._model.on('name', function(err_, newName_) {
			if(err_) {
				console.log(err_);
				return;
			}
      _this.$view.children('p').text(newName_);
		}).on('imgPath', function(err_, imgPath_) {
			if(err_) {
				console.log(err_);
				return;
			}
      _this.$view.children('img').attr('src', imgPath_);
			// $('#' + _this._id + ' img').attr('src', imgPath_);
		}).on('tabIdx', function(err_, tabIdx_) {
			if(err_) {
				console.log(err_);
				return;
			}
			$('#' + _this._id).attr('tabindex', tabIdx_);
		}).on('focus', function(err_) {
			if(err_) {
				console.log(err_);
				return;
			}
			var desktop = _global.get('desktop');
			_this.$view/* .parent() */.addClass('focusing');
			if(!desktop._selector._selectedEntries.hasEntry(_this._id))
				desktop._selector._selectedEntries.push(_this);
			// this._focused = true;
			desktop._tabIndex = _this._tabIndex - 1;
		}).on('blur', function(err_) {
			if(err_) {
				console.log(err_);
				return;
			}
			_this.$view/* .parent() */.removeClass('focusing');
		});
	},

	initAction: function($selector) {
		this.callSuper($selector);
		var _entry = this, // ._model
				_this = this,
				desktop = _global.get('desktop');

		$selector.dblclick(function() {
			_this._controller.onDblclick();
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
		/* var desktop = _global.get('desktop'); */
		// if(!desktop._selector._selectedEntries.hasEntry(ev.target.id)) {
			// desktop._selector.releaseSelectedEntries();
		/* } */
		this.callSuper(ev);
	},

	drop: function(ev) {
		// TODO: send a command to processer
		$(this).parent('.grid').removeClass('hovering');
		$(this).parent('.grid').removeClass('norhover');
		ev.preventDefault();
		ev.stopPropagation();
		this._controller.onDrop(ev);
	}
});

var DeviceListView = View.extend({
	init: function(model_) {
		this.callSuper('device-list', model_);
		this.registObservers();
		this.$view = $('<div>', {
			'id': this._id
		}).css({ 
			'position': 'absolute',
			'left': '0',
			'top': '50%',
			'background-color': '#000',
      'opacity': '0.5',
			'width': '100px',
			'height': '50%',
			'display': '-webkit-box',
			'-webkit-box-orient': 'vertical',
			'-webkit-box-pack': 'start',
			'-webkit-box-align': 'start',
			'-webkit-user-select': 'none',
			'-moz-user-select': 'none',
      'box-shadow': '0px 0px 10px black'
		}) ;
		this._c = [];
	},
	
	registObservers: function() {
		var _this = this;
		this._model.on('add', function(err_, dev_) {
			// TODO: create a device entry view with the dev_ model object
			if(err_) {
				console.log(err_);
				return ;
			}
			_this._c[dev_.getID()] = DevEntryView.create(dev_.getID(), dev_);
			_this._c[dev_.getID()].show(_this.$view);
		}).on('remove', function(err_, dev_){
			// TODO: delete the device entry view associated by dev_
			if(err_) {
				console.log(err_);
				return ;
			}
			_this._c[dev_.getID()].hide();
			_this._c[dev_.getID()] = null;
			delete _this._c[dev_.getID()];
		});
	},

	show: function($parent) {
		$parent.append(this.$view);
	}
});

var DevEntryView = View.extend({
	init: function(id_, model_) {
		this.callSuper(id_, model_);
		this.registObservers();
		this.$view = $('<div>', {
      'class': 'icon',
			'id': this._id
    }).html("<img draggable='false'/><p>" + this._model.getName() + "</p>").css({ 
      'color': '#FFF'
    }) ;
		this.initAction();
	},

	registObservers: function() {
    var _this = this;
    _this._model.on('name', function(err_, name_) {
      if(err_) {
        console.log(err_);
        return ;
      }
      _this.$view.children('p').text(name_);
			// $('#' + _this._id + ' p').text(name_);
    })
  },

	show: function($parent) {
		$parent.append(this.$view);
	},

	hide: function() {
		this.$view.remove();
	},

	initAction: function() {},
});

// View of Dock component
//
var DockView = View.extend({
  init: function(model_) {
    this.callSuper(model_.getID(), model_);
    this.registObservers();
    this.$view = $('<div>', {
			'class': 'dock',
			'id': this._id,
			'onselectstart': 'return false'
		});
    this.initAction(this.$view);
  },

  registObservers: function() {
    this._model.on('add', function(err_, dockApp_) {
    }).on('remove', function(err_, dockApp_) {
    });
  },

  initAction: function($selector) {
    $selector.on('dragover', this.dragOver)
			.on('drop', this.drop)
			.on('dragleave', this.dragLeave);

		var dock = $selector,
        imgList = $selector.children('div img'),
        IMGART = 50,
        _imgMaxWidth = IMGART * 2,
        _imgMaxHeight = IMGART * 2,
        _distance = IMGART * 3.5;
    console.log(IMGART+" " + _imgMaxWidth + " " + _imgMaxHeight + "_distance: " + _distance);
		document.onmousemove = function(ev) {
   		var ev = ev || window.event;
   		for(var i = 0; i < imgList.length; i++) {
    		var jqImg = $(imgList[i]);
     	 	var a = ev.clientX - (jqImg.position().left + jqImg.width() / 2);
     		var b = ev.clientY - (jqImg.position().top + jqImg.height() / 2 + dock.position().top);
     		var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
     		var spex = 1 - c / _distance;
     		if (spex < 0.5) {
       		spex = 0.5;
     		}
     		imgList[i].style.width = spex * (_imgMaxWidth) + 'px';
     		imgList[i].style.height = spex * (_imgMaxHeight) + 'px';
 			}
 		}
  },

  show: function($parent) {
    $parent.append(this.$view);
  },

	dragOver: function(ev) {
		ev.preventDefault();
		ev.stopPropagation()
		var _id = ev.dataTransfer.getData("ID");
		//show insert position picture
		var _source = null,
        desktop = _global.get('desktop'),
        layout = desktop.getCOMById('layout'),
        widget = layout.getWidgetById(_id);
		if(typeof widget !== 'undefined' && widget.getType() == 'dockApp') {
			_source = $('#' + _id);
    } else if((typeof widget != 'undefined' && widgets.getType() == 'app')
        || ev.dataTransfer.files.length != 0) {
			if (typeof $('#insert')[0] == 'undefined') {
				_source = $('<div>',{
					'id': 'insert',
				}).html("<img src='img/insert.gif'/>");
			} else {
         _source = $('#insert');
      }
		} else {
      return ;
    }
		// 
		var _new_div = null,
		    _divList = $('#dock div');
		for(var i = 0; i < _divList.length + 1; i++) {
			if(i == _divList.length) {
				_new_div = null;
				break;
			}
			if(_divList[i].id == _source[0].id) continue;
			var _div = $(_divList[i]);
			if(ev.clientX < _div.position().left + _div.width() / 2) {
				_new_div = _div;
				break;
			};
		};
		if(_new_div == null) 
			$('#dock').append(_source);
		else if(null != _new_div) 
			_new_div.before(_source);
	},

	dragleave: function(ev) {
		if(ev.clientY < $('#dock').position().top) {
			if (typeof $('#insert')[0] != 'undefined') 
				$('#insert').remove();
		}
	},

	drop: function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		var _id = ev.dataTransfer.getData("ID"),
		    _source = $('#'+_id),
        desktop = _global.get('desktop'),
        layout = desktop.getCOMById('layout'),
        dock = desktop.getCOMById('dock'),
        widget = layout.getWidgetById(_id);
		if(typeof widget != 'undefined' && widget.getType == 'dockApp') {
			var _divList = $('#dock div');
			for (var i = 0; i < _divList.length; i++) {
				dock.getCOMById(_divList[i]._id).setPosition({'x': i, 'y': 0});
			};
		} else {
			var _divList = $('#dock div');
			for (var i = 0; i < _divList.length; i++) {
				if (_divList[i]._id == 'insert') {
					$(_divList[i]).remove();
					dock._index = i;
					break ;
				} 
			}
			if(typeof widget !== 'undefined' && widget.getType() == 'app' ){
			if (typeof $('#'+_id + '-dock')[0] !== 'undefined') {
				$('#insert').remove();
				alert("The App has been registed in dock");
				return ;
			}
			var _dentry = desktop._widgets[_id];
			var _path = _dentry._path;
			var _names = _path.split('/');
			var _name = _names[_names.length -1];

			var _fs = require('fs');
			_fs.rename(_path, desktop._dock._dockWatch.getBaseDir()+'/'+_name, function() {});
			} 
			else if(ev.dataTransfer.files.length != 0){
				var _files = ev.dataTransfer.files;
				var _fs = require('fs');
				for(var i = 0; i < _files.length; ++i) {
					var dst = desktop._dock._dockWatch.getBaseDir() + '/' + _files[i].name;
					if(_files[i].path == dst) continue;
					_fs.rename(_files[i].path, dst, function() {});
				}
				return ;
			}
		}
	}
});

var DockEntryView = View.extend({
  init: function(model_, container_) {
    this.callSuper(model_.getID(), model_);
    this._container = container_;
    this.registObservers();
    this.$view = $('<div>', {
      'id': this._id,
			'draggable': 'true',
			'onselectstart': 'return false'
    }).append($('<img>', {
      'id': this._id + '-img',
			'draggable': 'false',
			'onselectstart': 'return false'
    }));
    this.initAction(this.$view);
  },

  registObservers: function() {
    var _this = this;
    _this._model.on('imgPath', function(err_, imgPath_) {
      if(err_) {
        console.log(err_);
        return ;
      }
      _this.$view.children('img').attr('src', imgPath_);
    });
  },

  initAction: function($selector) {
    var _this = this;
    $selector.mousedown(function(e) {
			e.stopPropagation();
		}).mouseup(function(e) { 
			e.stopPropagation();
      var image = this.children('img');
      if(image[0].style.borderStyle == "" || image[0].style.borderStyle == 'none') {
        image.animate({width:"+=40px",height:"+=40px"}, 'fast')
					.animate({width:"-=40px",height:"-=40px"}, 'fast')
			  $('.tooltip').animate({top:"-=40px"}, 'fast')
 								.animate({top:"+=40px"}, 'fast')
 								.animate({top:"-=40px"}, 'fast')
 								.animate({top:"+=40px"}, 'fast')
 								.animate({top:"-=40px"}, 'fast')
 								.animate({top:"+=40px"}, 'fast')
			  image.css("border", "outset");
        // TODO: implement by using command
        //
				/* if(typeof require === 'function') { */
          // console.log("run " + this._execCmd);
          // var result = this._exec(this._execCmd,function(err, stdout, stderr) {
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            // image.css("border","none");
          // });
				// }	else {
					// console.log('run in browser');
					// 
				/* } */
        image.css("border", "none");
		  }
		}).on('mouseover', this.mouseOver)
    .on('mouseout', this.mouseOut)
    .on('mousemove', this.mouseMove)
    .on('dragstart', this.drag)
		.on('dragover', this.dragOver)
		.on('drop', this.drop)
		.on('dragenter', this.dragEnter)
		.on('dragleave', this.dragLeave);
  },

  show: function($parent) {
    var divList = $parent.children('div'),
        inserted = false,
        n_idx = this._model.getIdx();
    for(var i = 0; i < divList.length; ++i) {
      var model = this._container._c[divList[i].id]._model,
          o_idx = model.getIdx();
      if(n_idx.x <= o_idx.x && inserted == false) {
        $(divList[i]).before(this.$view);
        inserted = true;
      }
      if(o_idx.x < i) model.setIdx(i);
    }
    if(inserted == false) $parent.append(this.$view);
  },

	drag: function(ev) {
		$(ev.currentTarget).children('img')[0].title = this._name; 
		$('.tooltip').remove();
		console.log("drag start");
		ev.dataTransfer.setData("ID", ev.currentTarget.id);
		console.log(ev.dataTransfer.getData("ID"));
		ev.stopPropagation();
	},

	dragOver: function(ev) {
		ev.preventDefault();
	},

	drop: function(ev){
		ev.preventDefault();
	},

	mouseOver: function(ev){
		ev.stopPropagation();
		var isTitle = false;
		if(this.noTitle) { 
      isTitle = true;
		} else { 
			isTitle = $.trim(this._image[0].title) != '';
		} 
		if(isTitle) { 
			this.myTitle = this._image[0].title; 
			this._image[0].title = ""; 
			var tooltip = "<div class='tooltip'> <div id='title-inner' class='tipsy-inner'>"
        + this.myTitle + "</div> </div>"; 
			$('body').append(tooltip); 
			$('.tooltip').css({
        "top" : ($(ev.target).offset().top-25) + "px", 
        "left" : ($(ev.target).offset().left) + "px" 
      }).show('fast');
 		}
	},

	mouseOut: function() {
		if(this.myTitle != null) { 
			this._image[0].title = this._name; 
			$('.tooltip').remove();
		}
	},

	mouseMove: function(ev) {
		var t_width = $(ev.target).width();
 		var _width = $('#title-inner').width();
 		var left = $(ev.target).offset().left + (t_width - _width) / 2 - 5;
 		$('.tooltip').css({
      "top" : ($(ev.target).offset().top - 25) + "px", 
      "left" : left + "px" 
    });
	}
});
