//about plugin 
//base class for varies plugin
//id_: plugins Unic ID.
//position_({left, top}): The position of this plugin.
var DPlugin = Widget.extend({
	init: function(id_, position_) {
		this.callSuper(id_, position_);
		this._name = id_;
		this._type = 'plugin'
		this._col_num = 0;
		this._row_num = 0;
		this._dPlugin = $('<div>', {
			'class': 'plugin-div',
			'id': this._id,
			'draggable': 'true'
		});

	},

	//add plugin div to grid-- and bind Drag and Menu
	show: function() {
		if(typeof this._position === 'undefined') {
			alert("no position!!");
			return ;
		}

		$('#grid_' + this._position.x +'_'+ this._position.y).append(this._dPlugin);

		var _target = document.getElementById(this._id);

		this.bindDrag(_target);
		this.setColRowNum();

		desktop._ctxMenu.attachToMenu('#' + this._id
			, desktop._ctxMenu.getMenuByHeader('plugin'));
	},

	getPosition: function() {return	this._position;},

	setPosition: function(position_) {
		this._position = position_;
	},

	getID: function() {return this._id;},

	setID: function(id_) {his._id = id_;},//needed?

	getName:function() {return this._name;},

	setName: function(name_) {
		//redraw dentry's name
		this._name = name_;
	},

	getColNum:function(){return this._col_num;},

	getRowNum:function(){return this._row_num;},

	//set col_num of grid and row_num of grid;
	setColRowNum: function(){
		this._col_num = parseInt($(this._dPlugin).width()/desktop._grid._col-0.00001)+1;
		this._row_num = parseInt($(this._dPlugin).height()/desktop._grid._row-0.00001)+1;
	},

	dragover: function(ev){
	ev.preventDefault();
	ev.stopPropagation();
	},

	drop: function(ev){
	ev.preventDefault();
	ev.stopPropagation();
	},

	resize: function(width_, height_){
		this._dPlugin.children('#'+this._id+this.content).remove();
		this._dPlugin.width(width_);
		this._dPlugin.height(height_);
		this.setColRowNum();
		this.setPanel();
	},

	zoomIn: function(){
		var  _this= desktop._widgets[desktop._rightObjId];
		var _width = $(_this._dPlugin).width();
		if(_width >= 180) {
			alert('the plugin has been max size!!');
		} else {
			_this.resize(_width + 20,_width + 20);
			desktop._grid.flagGridOccupy(_this._position.x, _this._position.y, _this._col_num, _this._row_num, true);
			if(_width+20 == 180){ 
				desktop._ctxMenu.disableItem('plugin','zoom in');
			}else if (_width == 60) {
				desktop._ctxMenu.activeItem('plugin', 'zoom out', function(e){
					e.preventDefault();
					_this.zoomOut();
				});
			};
		}
	},

	zoomOut:function(){
		var  _this= desktop._widgets[desktop._rightObjId];
		var _width = $(_this._dPlugin).width();
		if (_width<=60) {
			alert('the plugin has been min size!!');
		} else {
			_this.resize(_width * 1 - 20, _width*1 - 20);
			var col_num_old = parseInt(_width/desktop._grid._col-0.00001)+1;
			var row_num_old =  parseInt(_width/desktop._grid._row-0.00001)+1;
			desktop._grid.flagGridOccupy(_this._position.x, _this._position.y, col_num_old, row_num_old, false);
			desktop._grid.flagGridOccupy(_this._position.x, _this._position.y, _this._col_num, _this._row_num, true);
			if(_width-20 == 60){ 
				desktop._ctxMenu.disableItem('plugin','zoom out');
			}else if (_width == 180) {
				desktop._ctxMenu.activeItem('plugin', 'zoom in', function(e){
					e.preventDefault();
					_this.zoomIn();
				});
			};
		}
	},

	remove:function(){
		var _this = this;
		desktop.unRegistWidget(desktop._rightObjId);
		desktop._grid.flagGridOccupy(_this._position.x, _this._position.y, _this._col_num, _this._row_num, false);
		$('#'+desktop._rightObjId).remove();
	}
});

// it is clock plugin class extend DPlugin
var ClockPlugin = DPlugin.extend({
	//init clock plugin by id position and path
	// id_: clock-div's id;
	// position_: position of plugin, position is coordinate of grids
	//path_: path of image;
	init: function(id_, position_, path_) {
		this.callSuper(id_, position_);
		this._type = 'ClockPlugin';
		this._path = path_;
		this._content = 'Content';
	},

	// set canvas and show 
	// path_: path of image;
	setPanel:function(path_){
		//return "<canvas id=\"clockContent\" width='"+ plugin.offsetWidth+"px' height='"+plugin.offsetHeight+"px'/>";
		this._dPlugin.html("<canvas id=\""+this._id+ this._content + "\" width='"+ this._dPlugin.width()+"px' height='"+this._dPlugin.height()+
							"px' />");
		//var value = document.getElementById(this._id+content);
		var target = $('#'+this._id+this._content);
		//forbid html mousedown and mouseup
		target.mousedown(function(e) {
			e.stopPropagation();
		}).mouseup(function(e) { 
			e.stopPropagation();
		});

		this.bindDrag(target[0]);
		//set context menu add clock disabled
		desktop._ctxMenu.disableItem('add-plugin','clock');
		//set context menu add zoomIn or zoomOut disable
		var _width = $(this._dPlugin).width();
		if(_width == 180){ 
			desktop._ctxMenu.disableItem('plugin','zoom in');
		}else if (_width == 60) {
			desktop._ctxMenu.disableItem('plugin','zoom out');
		};
		
		this.clockRun(path_);
	},

	open: function() {

	},

	//clock function
	//id_: id of canvas where clock will be painting 
	clockRun:function( path_){
		var _target = $('#'+this._id+ this._content);
		var _context = _target[0].getContext('2d');
		var _width=_target.width();
		var _height=_target.height();

		var _img = new Image();
		if (typeof path_  !== 'undefined') {
			_img.src=path_;
		}else _img.src = this._path;
		_img.onload = function() {  
		_context.drawImage(_img, 0, 0, _width, _height);
		}

		//run immediately
		var paintClock = function(){
			var _type = [['#000',70,1],['#ccc',60,2],['red',50,3]];
			function drwePointer(type_,angle_){
				type_ = _type[type_];
				angle_ = angle_*Math.PI*2 - 90/180*Math.PI; 
				var _length= type_[1] / (200/ _width);
				_context.beginPath();
				_context.lineWidth = type_[2];
				_context.strokeStyle = type_[0];
				_context.moveTo( _width/2, _height/2); 
				_context.lineTo( _width/2 + _length*Math.cos(angle_), _height/2 + _length*Math.sin(angle_)); 
				_context.stroke();
				_context.closePath();
			}
			setInterval(function (){
				_context.clearRect(0,0, _height, _width);
				_context.drawImage(_img,0,0, _width, _height);
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
			},100);
		};
		var _paint = paintClock();
	}

});

//picture plugin class extend DPlugin
var PicPlugin = DPlugin.extend({
	//init picture plugin by id position and path
	// id_: picture-div's id;
	// position_: position of plugin, position is coordinate of grids
	//path_: path of image;
	init:function(id_, position_, path_){
		this.callSuper(id_, position_);
		this._type = 'ImagePlugin';
		this._path = path_;
		this.content = 'Content';
	},
	// set canvas to show picture
	// path_: path of image 
	setPanel:function(path_){
		this._dPlugin.html("<canvas id='"+this._id+this.content+"' width='"+this._dPlugin.width()+"px' height='"+this._dPlugin.height()+"px'>");
		//this._dPlugin.html("<img id='"+this._id+content+"' width='200px' height='"+this._dPlugin.height()+"px' src='"+path_+"' draggable='false'>");

		var target = $('#'+this._id+this.content);
		this.bindDrag(target[0]);

		var img = new Image();
		if (typeof path_  !== 'undefined') {
			img.src=path_;
		}else img.src = this._path;
		var imgContent = target[0].getContext('2d');
		img.onload = function() {  
		imgContent.drawImage(img,0,0,target.width(),target.height());
		}

	},

	open:function(){

	}
});
