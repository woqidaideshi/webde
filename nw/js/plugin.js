//base class for varies plugin
//id_: plugins Unic ID.
//position_({left, top}): The position of this plugin.
//

var DPlugin = Widget.extend({
	init: function(id_, position_) {
		this.callSuper(id_, position_);
		this._name = id_;

		this._dPlugin = $('<div>', {
			'class': 'plugin-div',
			'id': this._id,
			'draggable': 'true',
			'onselectstart': 'return false'
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
		//target.onclick = function() {alert(id);}
	},

	getPosition: function() {return	this._position;},

	setPosition: function(position_) {
		//redraw it with new position
		//$('#' + id).attr();
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
	ev.stopPropagation();
	},

	drop: function(ev){
	ev.stopPropagation();
	}

});

var ClockPlugin = DPlugin.extend({


	init: function(id_, position_) {
		this.callSuper(id_, position_);

	},

	setPanel:function(path_){
		//return "<canvas id=\"clockContent\" width='"+ plugin.offsetWidth+"px' height='"+plugin.offsetHeight+"px'/>";
		var content = "Content";
		this._dPlugin.html("<canvas id=\""+this._id+ content + "\" width='"+ this._dPlugin.width()+"px' height='"+this._dPlugin.height()+"px'  onselectstart='return false'/>");

		//var value = document.getElementById(this._id+content);
		var target = $('#'+this._id+content);
		this.bindDrag(target[0]);

	},

	open: function() {
		//launch app
		clockRun(this._id+"Content");
	}
});

var PicPlugin = DPlugin.extend({

	init:function(id_, position_){
		this.callSuper(id_, position_);
	},
	
	setPanel:function(path_){
		var content = "Content";
		this._dPlugin.html("<canvas id='"+this._id+content+"' width='"+this._dPlugin.width()+"px' height='"+this._dPlugin.height()+"px' onselectstart='return false'>");
		//this._dPlugin.html("<img id='"+this._id+content+"' width='200px' height='"+this._dPlugin.height()+"px' src='"+path_+"' draggable='false'>");

		var value = $('#'+this._id+content);
		this.bindDrag(value[0]);

		var img = new Image();
		img.src=path_;
		var imgContent = value[0].getContext('2d');
		img.onload = function() {  
		imgContent.drawImage(img,0,0,value.width(),value.height());
		}


	},

	open:function(){

	}
});