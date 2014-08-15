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
			'draggable': 'true'
		});
	},

	show: function() {
		if(typeof this._position === 'undefined') {
			alert("no position!!");
			return ;
		}

		$('#grid' + this._position.x + this._position.y).append(this._dPlugin);

		var target = document.getElementById(this._id);
		target.ondragstart = this.drag;
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
	}
});

var ClockPlugin = DPlugin.extend({


	init: function(id_, position_) {
		this.callSuper(id_, position_);

	},

	setPanel:function(path_){
		//return "<canvas id=\"clockContent\" width='"+ plugin.offsetWidth+"px' height='"+plugin.offsetHeight+"px'/>";
		var content = "Content";
		this._dPlugin.html("<canvas id=\""+this._id+ content + "\" width='"+ this._dPlugin.width()+"px' height='"+this._dPlugin.height()+"px'/>");

		//var value = document.getElementById(this._id+content);
		var value = $('#'+this._id+content);
		//stop drag
		 value[0].ondragover = function(ev){
		ev.stopPropagation();
		}

		//stop drop
		value[0].ondrop = function(ev){
		ev.stopPropagation();
		}
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
		this._dPlugin.html("<img id='"+this._id+content+"' width='"+this._dPlugin.width()+"'px' height='"+this._dPlugin.height()+"px' src='"+path_+"' draggable='false'>");

		var value = $('#'+this._id+content);

		//stop drag
		 value[0].ondragover = function(ev){
		ev.stopPropagation();
		}
		//stop drop
		value[0].ondrop = function(ev){
		ev.stopPropagation();
		}
	},

	open:function(){

	}
});