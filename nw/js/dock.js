//dock.js  for dock 
 var Dock = Class.extend({
	init: function(position_){
		this._id = "dock";
 		this._position = position_;
 		this._class = "dock";
 		this._name = "dock";

 		this._dock = $('<div>', {
			'class': this._class,
			'id': this._id,
			'onselectstart': 'return false'
		});
	},
 	show: function() {
		//add dock to body
		$('body').append(this._dock);
		this.bindDrag(this._dock[0]);
	},

	getPosition: function() {return	this._position;},

	setPosition: function(position_) {
		//redraw it with new position
		//$('#' + id).attr();
		this._position = position_;
	},

	getID: function() {return this._id;},

	setID: function(id_) {this._id = id_;},//needed?

	getName: function() {return this._name;},

	setName: function(name_) {
		//redraw dentry's name
		this._name = name_;
	},

	bindDrag:function(target){
		target.ondragover = this.dragOver;
		target.ondrop = this.drop;
	},

	dragOver: function(ev) {
		ev.preventDefault();
	},

	drop: function(ev) {
		//if(ev.srcElement == ev.toElement) return ;
		ev.preventDefault();
		var _id = ev.dataTransfer.getData("ID");
		var _target = $(ev.target); 
		var _source = $('#'+_id);
		if(desktop._widgets[_id]._type == 'app'){
			if (typeof $('#'+_id+'-dock')[0] !== 'undefined') {
				alert("The App has been registed in dock");
				return ;
			}
			var dentry = desktop._widgets[_id];
			var path = dentry._path;
			var tabIndex = dentry._tabIndex;
			var pos = dentry.getPosition();
			desktop._grid._grid[pos.x][pos.y].use = false;
			desktop.unRegistWidget(_id);
			_source.remove();
			desktop.addAnAppToDock(DockApp.create(_id+'-dock'
				,tabIndex
				,path));
		}
	}

});

//dock.js  for dock 
var DockApp = Class.extend({
	init: function(id_, tabIndex_, path_){
		if(typeof id_ === "undefined"
			|| typeof tabIndex_ === "undefined"
			|| typeof path_ === "undefined") {
			//console.log("not enough params!! init failed!!");
			//return ;
			throw "Dock-APP: Not enough params!! Init failed!!";
		}
		this._id = id_;
 		this._name = id_;
 		this._path = path_;
 		this._tabIndex = tabIndex_;
 		this._type = "dockApp";
 		this._position = {x:0,y:0};
 		this.noTitle = false;
 		this.myTitle = false;

 		this._execCmd = undefined;
 		this._imgPath = undefined;
 		this._exec = require('child_process').exec;

 		this. _image = $('<img>',{
			'id':this._id,
			'draggable': 'true',
			'onselectstart': 'return false'
		});
	},

 	show: function() {
		//add dock to body
		$('#dock').append(this._image);
		this.parseDockApp();

		this.bindEvents();
	},

	openApp: function(){
		var image = $('#'+this._id);

			//when don't open the app.
		console.log("click " + image[0].style.borderStyle);
		if ( image[0].style.borderStyle == "" || image[0].style.borderStyle=='none') {
			image.animate({width:"+=40px",height:"+=40px"},'fast')
					.animate({width:"-=40px",height:"-=40px"},'fast')
			$('.tooltip').animate({top:"-=40px"},'fast')
 								.animate({top:"+=40px"},'fast')
 								.animate({top:"-=40px"},'fast')
 								.animate({top:"+=40px"},'fast')
 								.animate({top:"-=40px"},'fast')
 								.animate({top:"+=40px"},'fast')
			image.css("border","outset");
			if (typeof require === 'function') {
          		console.log("run " + this._execCmd);
          		var result = this._exec(this._execCmd,function(err, stdout, stderr){
                			console.log('stdout: ' + stdout);
                			console.log('stderr: ' + stderr);
                			image.css("border","none");
            		});
			}	
			else{
				console.log('run in browser');
				image.css("border","none");
			}
		}
	},

	bindEvents: function() {
		var img = $('#'+this._id);
		var target_ = this;
		  	//add onclick()
		img.click (function(ev){
			target_.openApp();
		});


		var dock = $('#dock');
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

   		this.bingTitle(img);
   		this.bindDrag(img[0]);
	},

	bindDrag:function(target){
		target.ondragstart = this.drag;
	},

	bingTitle:function(target){
		var target_ = this;
		target.mouseover(function(ev){
   			target_.mouseOver(ev);
   		}); 
   		target.mouseout(function(){
   			target_.mouseOut();
   		}); 
   		target.mousemove(function(ev){
   			target_.mouseMove(ev);
   		}); 
	},

	drag: function(ev) {
		ev.target.title = this.myTitle; 
		$('.tooltip').remove();
		console.log("drag start");
		ev.dataTransfer.setData("ID", ev.currentTarget.id);
		console.log(ev.dataTransfer.getData("ID"));
		ev.stopPropagation();
	},

	mouseOver:function(ev){
		console.log('mouse over!');
		var isTitle = false;
		if(this.noTitle){ isTitle = true;
		}
		else{ 
			isTitle = $.trim(this._image[0].title) != '';
		} 
		if(isTitle){ 
			this.myTitle = this._image[0].title; 
			this._image[0].title = ""; 
			var tooltip = "<div class='tooltip'><div id='title-inner' class='tipsy-inner'>"+this.myTitle+"</div></div>"; 
			$('body').append(tooltip); 
			$('.tooltip').css({"top" :( $(ev.target).offset().top-25)+"px", "left" :( $(ev.target).offset().left)+"px" }).show('fast');
 		}
	},

	mouseOut:function(){
		console.log('mouse out!');
		if(this.myTitle != null){ 
			this._image[0].title = this.myTitle; 
			$('.tooltip').remove();
		}
	},

	mouseMove:function(ev){
		var t_width = $(ev.target).width();
 		var _width = $('#title-inner').width();
 		var left =  $(ev.target).offset().left + (t_width - _width) / 2 - 5;
 		$('.tooltip').css({ "top" :( $(ev.target).offset().top-25)+"px", "left" :left+"px" });
	},

	getID: function() {return this._id;},

	setID: function(id_) {this._id = id_;},//needed?

	getName: function() {return this._name;},

	setName: function(name_) {
		//redraw dentry's name
		this._name = name_;
	},

	getPath: function() {return this._path;},

	setPath: function(path_) {
		//redraw dentry's name
		this._path = path_;
	},

	parseDockApp: function() {
		var _dockApp = this;

		var getExecCmd = function(attr_) {
			_dockApp._execCmd = attr_['Exec'].split(' ')[0];
		};
		var getImgPath = function(attr_) {
			utilIns.entryUtil.getIconPath(attr_['Icon'], 48, function(err_, imgPath_) {
				_dockApp._imgPath = imgPath_[0];
				console.log(_dockApp._imgPath);
				$('#' + _dockApp._id).attr('src', _dockApp._imgPath);
			});
		};
		var getEntryName = function(attr_) {
			if(typeof attr_['Name[zh_CN]'] !== "undefined") {
				_dockApp._name = attr_['Name[zh_CN]'];
			} else {
				_dockApp._name = attr_['Name'];
			}

			$('#' + _dockApp._id).attr('title', _dockApp._name);
		};
		var fs = require('fs');

		fs.readFile(this._path, 'utf-8', function(err, data) {
			if(err) {
				console.log(err);
			} else {
				var lines = data.split('\n');
				var attr = [];
				for(var i = 1; i < lines.length - 1; ++i) {
					var tmp = lines[i].split('=');
					if (typeof attr[tmp[0]] == "undefined") {
					attr[tmp[0]] = tmp[1];
					}	
				}
				//console.log("Get dockApp file successfully");

				getExecCmd(attr);
				getImgPath(attr);
				getEntryName(attr);
			}
		});
	}
});

