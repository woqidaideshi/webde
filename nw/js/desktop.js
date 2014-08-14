//This class is totally for desktop management
//
var Desktop = Class.extend({
	init: function() {
		this._grid = undefined;
		this._widgets = [];

		this.generateGrid();
	},

	generateGrid: function() {
		this._grid = Grid.create('grids');
		this._grid.show();
	},

	loadEntries: function() {},

	addAnDEntry: function(entry_, pos_) {
		if(typeof pos_ === 'undefined') {
			pos_ = this._grid.findAnIdleGrid();
			if(pos_ == null) {
				alert("No room");
				return ;
			}
		}

		entry_.setPosition(pos_);
		entry_.show();
		this._grid._grid[pos_.x][pos_.y].use = true;
	},

	addAnDPlugin: function(plugin_, pos_) {
		if(typeof pos_ === 'undefined') {
			pos_ = this._grid.findAnIdleGridFromRight();
			if(pos_ == null) {
				alert("No room");
				return ;
			}
		}

		plugin_.setPosition(pos_);
		plugin_.setShowPanel(plugin_.getClock());
		plugin_.show();
		this._grid._grid[pos_.x][pos_.y].use = true;
	},

	addDock:function(position_ ){
		dock = Dock.create(position_);

		dock.setPosition();
		dock.show();
	},

	addAnImgToDock:function(path_, name_, command_){
		var image = document.createElement("img");
		image.src = path_;
		image.title = name_;
		//if command_ isn't "null or undefined", then add event function
		if (command_) {
			image.onclick = function(){
			console.log("run"+command_);
          		var exec = require('child_process').exec;
          		var result = exec(command_,function(err, stdout, stderr){
                			console.log('stdout: ' + stdout);
                			console.log('stderr: ' + stderr);
            			});
			}
		}

		var dock = document.getElementById('dock');
		
		dock.appendChild(image);

		var imgList = dock.getElementsByTagName('img');
		console.log(imgList.length);
		var  jqimgList = $('#dock img');
		console.log(jqimgList.length);

		var _imgMaxWidth = imgList[0].offsetWidth * 2;
		console.log(_imgMaxWidth);
		//console.log(jqimgList[0].width());
            	var _imgMaxHeight = imgList[0].offsetHeight * 2;
            	var _distance = imgList[0].offsetWidth * 3.5;

		document.onmousemove = function (ev) {
            	var ev = ev || window.event;
            	for (var i = 0; i <imgList.length; i++) {
               	 	var a = ev.clientX - (imgList[i].offsetLeft + imgList[i].offsetWidth / 2);
                		var b = ev.clientY - (imgList[i].offsetTop +  imgList[i].offsetHeight / 2 + dock.offsetTop);
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

