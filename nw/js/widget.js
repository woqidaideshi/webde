var Widget = Class.extend({
	init: function(id_, position_) {
		this._id = id_;
		this._position = position_;
	},
	
	getPosition: function() {return	this._position;},

	setPosition: function(position_) {
		//redraw it with new position
		this._position = position_;
	},

	getID: function() {return this._id;},

	setID: function(id_) {this._id = id_;},//needed?

	drag: function(ev) {
		console.log("drap start");
		ev.dataTransfer.setData("ID", ev.currentTarget.id);
		ev.stopPropagation();
	},

	dragOver: function(ev) {
		ev.preventDefault();
	},

	drop: function(ev) {
		console.log("drap end, drop");
		//if(ev.srcElement == ev.toElement) return ;
		ev.preventDefault();
		var _id = ev.dataTransfer.getData("ID");
		if(ev.target.id == _id) return ;
		ev.target.appendChild(document.getElementById(_id));
	},

	bindDrag: function(target) {
		target.ondragstart = this.drag;
		target.ondragover = this.dragOver;
		target.ondrop = this.drop;
	}
});
