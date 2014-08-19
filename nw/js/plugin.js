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
			'width': '200px',
			'height': '200px',
			'draggable': 'true'
		});
	},

	show: function() {
		if(typeof this._position === 'undefined') {
			alert("no position!!");
			return ;
		}

		$('#grid-' + this._position.x + '-' + this._position.y).append(this._dPlugin);

		var target = document.getElementById(this._id);
		target.ondragstart = this.drag;
		target.onclick = function() {alert(id);}
	},

	getPosition: function() {return	this._position;},

	setPosition: function(position_) {
		//redraw it with new position
		//$('#' + id).attr();
		this._position = position_;
	},

	getID: function() {return this._id;},

	setID: function(id_) {this._id = id_;},//needed?

	getName:function() {return this._name;},

	setName: function(name_) {
		//redraw dentry's name
		this._name = name_;
	},

	setShowPanel: function(showPanel_){
		this._dPlugin.html(showPanel_);
	},

	getPluginSize: function(){
		var size = {
			width:0,
			height:0}
		size.height = this._dPlugin.height();
		size.width = this._dPlugin.width();
		return size;
	},

	dragOver: function(ev) {
		
	},

	
	drop: function(ev) {
		console.log("plugin is not allowed to drag drop");
	}
});

var ClockPlugin = DPlugin.extend({


	init: function(id_, position_) {
		this.callSuper(id_, position_);

	},

	getClock:function(){
		var size = this.getPluginSize();
		return "<canvas id=\"clockContent\" width='"+ size.width+"px' height='"+size.height+"px'/>";
	},

	open: function() {
		//launch app
	}
});
