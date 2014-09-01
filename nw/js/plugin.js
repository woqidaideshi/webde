//base class for varies plugin
//id_: plugins Unic ID.
//position_({left, top}): The position of this plugin.

var DPlugin = Widget.extend({
	init: function(id_, position_) {
		this.callSuper(id_, position_);
		this._name = id_;
		this._type = 'plugin'
		this._dPlugin = $('<div>', {
			'class': 'plugin-div',
			'id': this._id,
			'draggable': 'true'
		});
	},

	show: function() {
		if(typeof this._position === 'undefined') {
			alert("no position!!");
			return ;
		}

		$('#grid_' + this._position.x +'_'+ this._position.y).append(this._dPlugin);

		var target = document.getElementById(this._id);
		this.bindDrag(target);

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
		this.setPanel();
	}
});

var ClockPlugin = DPlugin.extend({
	init: function(id_, position_, path_) {
		this.callSuper(id_, position_);
		this._type = 'ClockPlugin';
		this._path = path_;
		this.content = 'Content';
	},

	setPanel:function(path_){
		//return "<canvas id=\"clockContent\" width='"+ plugin.offsetWidth+"px' height='"+plugin.offsetHeight+"px'/>";
		this._dPlugin.html("<canvas id=\""+this._id+ this.content + "\" width='"+ this._dPlugin.width()+"px' height='"+this._dPlugin.height()+
							"px' />");
		//var value = document.getElementById(this._id+content);
		
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
		$('#'+this._id).click(function(ev){
			ev.target.focus();
			alert(ev.target.id + '\n' + document.activeElement.id);
		});
		this.open();
	},

	open: function() {
		//launch app
		clockRun(this._id+this.content);
	}
});

var PicPlugin = DPlugin.extend({
	init:function(id_, position_, path_){
		this.callSuper(id_, position_);
		this._type = 'ImagePlugin';
		this._path = path_;
		this.content = 'Content';
	},
	
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
