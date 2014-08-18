//This class is totally for desktop management
//
var Desktop = Class.extend({
	init: function() {
		this._grid = undefined;
		this._widgets = [];

		this.generateGrid();
		if(isFirefox=navigator.userAgent.indexOf("Firefox")>0){  
        			var gridcol = $('.gridcontainer .gridcol');
        			gridcol[0].style.float = "left";
   		}  
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

	loadWidgets: function() {},

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
		this._grid._grid[pos_.x][pos_.y].use = true;
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
			'title':name_
		});
		//if command_ isn't "null or undefined", then add event function
		if (command_) {
			//add onclick()
			image.click (function(ev){
			var image = $(ev.target);
			image.animate({width:"+=40px",height:"+=40px"},'fast')
					.animate({width:"-=40px",height:"-=40px",border:"outset"},'fast')
			//when don't open the app.
			if ( image.css("border") == "0px none rgb(0, 0, 0)") {
				setTimeout(function(){image.css("border","outset");},300);
				//image.css("border","outset");
				console.log("run"+command_);
          			var exec = require('child_process').exec;
          			var result = exec(command_,function(err, stdout, stderr){
                				console.log('stdout: ' + stdout);
                				console.log('stderr: ' + stderr);
                				setTimeout(function(){image.css("border","none");},250);
            				});
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

