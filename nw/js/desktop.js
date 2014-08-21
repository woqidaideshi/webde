//This class is totally for desktop management
//
var Desktop = Class.extend({
	init: function() {
		this._grid = undefined;
		this._tabIndex = 1;
		this._widgets = [];
		this._exec = require('child_process').exec;
		this._fs = require('fs');
		this._xdg_data_home = undefined;
		
		this.generateGrid();
		this.bindingEvents();
		
		var _desktop = this;
		this._exec("echo $HOME/.local/share/", function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				_desktop._xdg_data_home = stdout.substr(0, stdout.length - 1);
				theme.loadThemeEntry(_desktop);
				_desktop.loadWidgets();
			}
		});
	},

	bindingEvents: function() {
		var _desktop = this;

		win.once('loading', function() {
			_desktop.refresh();
		});
	},

	shutdown: function() {
		this.saveWidgets();
	},

	refresh: function() {
		this.saveWidgets();
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

	getGrid:function(){
		return this._grid;
	},

	loadWidgets: function() {
		var _desktop = this;
		this._fs.readFile(this._xdg_data_home + "dwidgets/dentries"
				, 'utf-8', function(err, data) {
			if(err) {
				console.log(err);
			} else {
				var lines = data.split('\n');
				for(var i = 0; i < lines.length; ++i) {
					if(lines[i].match('[\s,\t]*#+') != null) continue;
					if(lines[i] == "") continue;
					var attr = lines[i].split(' ');
					if(attr.length != 5) continue;
				/*need add a type judge
				*/
					var _Entry;
					if(attr[4] == "app") {
						_Entry = AppEntry;
					} else if(attr[4] == "dir") {
						_Entry = DirEntry;
					} else {
						_Entry = FileEntry;
					}
					_desktop.addAnDEntry(_Entry.create(attr[0]
							, _desktop._tabIndex++
							, attr[1]
							, {x: attr[2], y: attr[3]}
							), {x: attr[2], y: attr[3]});
				}
			}
		});
	},

	saveWidgets: function() {
		var data = "";
		for(var key in this._widgets) {
			if(typeof theme._theme[key] !== 'undefined') continue;
			data += key + " " + this._widgets[key]._path + " "
			 	+ this._widgets[key]._position.x + " "
			 	+ this._widgets[key]._position.y + " "
				+ this._widgets[key]._type + '\n';
		}
		console.log(data);

		this._fs.writeFile(this._xdg_data_home + "dwidgets/dentries"
				, data, function(err) {
			if(err) {
				console.log(err);
			}
		});
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

	addAnDPlugin: function(plugin_, pos_, path_) {
		if(typeof pos_ === 'undefined') {
			pos_ = this._grid.findAnIdleGridFromRight();
			if(pos_ == null) {
				alert("No room");
				return ;
			}
		}

		plugin_.setPosition(pos_);
		plugin_.show();
		//show() must run before setPanel();
		plugin_.setPanel(path_);
		plugin_.open();
		//this._grid._grid[pos_.x][pos_.y].use = true;
		//get number of occupy-grid col and row
		var col_num = parseInt($('.plugin-div').width()/this._grid._col-0.00001)+1;
		var row_num =  parseInt($('.plugin-div').height()/this._grid._row-0.00001)+1;
		this._grid.flagGridOccupy(pos_.x, pos_.y, col_num, row_num, true);
	},

	addDock:function(position_ ){
		dock = Dock.create(position_);
		dock.setPosition();
		dock.show();
	},

	addAnImgToDock:function(path_, name_, command_){
		/*var image = document.createElement("img");
		image.id = name_;
		image.src = path_;
		image.title = name_;*/
		var image = $('<img>',{
			'id':name_,
			'src':path_,
			'title':name_,
			'draggable': 'false',
			'onselectstart': 'return false'
		});
		//if command_ isn't "null or undefined", then add event function
		if (command_) {
			//add onclick()
			image.click (function(ev){
				var image = $(ev.target);
				//when don't open the app.
				console.log("click " + image[0].style.borderStyle);
				if ( image[0].style.borderStyle == "" || image[0].style.borderStyle=='none') {
					image.animate({width:"+=40px",height:"+=40px"},'fast')
						.animate({width:"-=40px",height:"-=40px"},'fast')
					image.css("border","outset");
					//image.css("border","outset");
					//console.log("run "+command_);
					if (typeof require === 'function') {
	        	var exec = require('child_process').exec;
	         	var result = exec(command_,function(err, stdout, stderr){
	         	console.log('stdout: ' + stdout);
	         	console.log('stderr: ' + stderr);
	         	image.css("border","none");
	       		});
					} else {
						console.log('run in browser');
						image.css("border","none");
					}
				}
			});
		}

		var dock = $('#dock');
		dock.append(image);

		var imgList = dock.children('img');
		var imgArt = parseInt($('.dock img').css('width')); 
		var _imgMaxWidth = imgArt * 2;
   	var _imgMaxHeight = imgArt * 2;
   	var _distance = imgArt * 3.5;
   	console.log(imgArt+" " + _imgMaxWidth + " " + _imgMaxHeight + "_distance: " + _distance);
		document.onmousemove = function (ev) {
     	var ev = ev || window.event;
     	for (var i = 0; i <imgList.length; i++) {
     		var jqImg = $(imgList[i]);
     	 	var a = ev.clientX - (jqImg.position().left+ jqImg.width() / 2);
     		var b = ev.clientY - (jqImg.position().top +  jqImg.height() / 2 + dock.position().top);
     		var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
     		var spex = 1 - c / _distance;
     		if (spex < 0.5) {
       		spex = 0.5;
     		}
     		imgList[i].style.width = spex * (_imgMaxWidth) + 'px';
     		imgList[i].style.height = spex * (_imgMaxHeight) + 'px';
   		}
   	}
	}
	
});

