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

		desktop._ctxMenu.attachToMenu('#' + this._id
			, desktop._ctxMenu.getMenuByHeader('dock'));
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
		target.ondragleave = this.dragleave;
	},

	dragOver: function(ev) {
		ev.preventDefault();
		var _id = ev.dataTransfer.getData("ID");
		//show insert position picture
		var _source = null;
		if (desktop._widgets[_id]._type == 'app') {
			if (typeof $('#insert')[0] == 'undefined') {
				_source = $('<img>',{
					'id': 'insert',
					'src': 'img/insert.gif'
				});
			}else _source = $('#insert');
		}
		else if (desktop._widgets[_id]._type == 'dockApp') _source=$('#'+_id);
		else  return ;
		//
		var new_img = null;
		var imgList = $('#dock img');
		for (var i = 0; i < imgList.length+1; i++) {
			if (i == imgList.length) {
				new_img = null;
				break;
			}
			if (imgList[i].id == _source[0].id) continue;
			var img = $(imgList[i]);
			if (ev.clientX < img.position().left + img.width()/2) {
				new_img = img;
				break;
			};
		};
		if (new_img == null ) $('#dock').append(_source);
		else if (null != new_img) new_img.before(_source);
	},

	dragleave:function(ev){
		if (ev.clientY < $('#dock').position().top) 
			{
				if (typeof $('#insert')[0] != 'undefined') 
					$('#insert').remove();
			}
	},

	drop: function(ev) {
		//if(ev.srcElement == ev.toElement) return ;
		ev.preventDefault();
		var _id = ev.dataTransfer.getData("ID");
		var _source = $('#'+_id);
		if(desktop._widgets[_id]._type == 'app'){
			if (typeof $('#'+_id+'-dock')[0] !== 'undefined') {
				$('#insert').remove();
				alert("The App has been registed in dock");
				return ;
			}
			var dentry = desktop._widgets[_id];
			var path = dentry._path;
			var pos = dentry.getPosition();

			desktop._grid._grid[pos.x][pos.y].use = false;
			desktop.unRegistWidget(_id);
			_source.remove();

			var imgList = $('#dock img');
			for (var i = 0; i < imgList.length; i++) {
				if (imgList[i].id == 'insert') {
					$(imgList[i]).remove();

					var dockApp = DockApp.create(_id+'-dock' ,i ,path);
					if(!desktop.registWidget(dockApp)) {
						$('#insert').remove();
						return ;
					}
					dockApp.show();
					return ;
				} 
			}
		}
		else if (desktop._widgets[_id]._type == 'dockApp') {
			var imgList = $('#dock img');
			for (var i = 0; i < imgList.length; i++) {
				desktop._widgets[imgList[i].id]._position.x = i;
			};
		};
	}

});

//dock.js  for dock 
var DockApp = Class.extend({
	init: function(id_, x_, path_){
		if(typeof id_ === "undefined"
			|| typeof x_ === "undefined"
			|| typeof path_ === "undefined") {
			//console.log("not enough params!! init failed!!");
			//return ;
			throw "Dock-APP: Not enough params!! Init failed!!";
		}
		this._id = id_;
 		this._name = id_;
 		this._path = path_;
 		this._type = "dockApp";
 		this._position = {x:x_, y:0};
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
		var _this = this;
		var imgList = $('#dock img');
		if (imgList.length < 1) $('#dock').append(_this._image);
		
		//arreng dock app 
		var insert = false;
		for (var i = 0; i < imgList.length; i++) {
			if (_this._position.x <=  desktop._widgets[imgList[i].id]._position.x && insert == false) {
				$(imgList[i]).before(_this._image);
				insert = true;
			}
			if (desktop._widgets[imgList[i].id]._position.x < i) desktop._widgets[imgList[i].id]._position.x = i;
		}
		if (insert == false)  $('#dock').append(_this._image);
		
		
 		utilIns.entryUtil.parseDesktopFile(_this._path, function(err_, file_) {
			if(err_) console.log(err_);
			//get launch commad
			_this._execCmd = file_['Exec'].replace(/%(f|F|u|U|d|D|n|N|i|c|k|v|m)/g, '')
				.replace(/\\\\/g, '\\');
			//get icon
			utilIns.entryUtil.getIconPath(file_['Icon'], 48, function(err_, imgPath_) {
				if(err_) {
					console.log(err_);
				} else {
					_this._imgPath = imgPath_[0];
					$('#' + _this._id).attr('src', _this._imgPath);
				}
			});
			//get name
			if(typeof file_['Name[zh_CN]'] !== "undefined") {
				_this._name = file_['Name[zh_CN]'];
			} else {
				_this._name = file_['Name'];
			}
			$('#' + _this._id).attr('title', _this._name);
		});

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
		ev.target.title = this._name; 
		$('.tooltip').remove();
		console.log("drag start");
		ev.dataTransfer.setData("ID", ev.currentTarget.id);
		console.log(ev.dataTransfer.getData("ID"));
		ev.stopPropagation();
	},

	dragOver: function(ev) {
		ev.preventDefault();
	},

	mouseOver:function(ev){
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
		if(this.myTitle != null){ 
			this._image[0].title = this._name; 
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
	}

});

