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
		ev.dataTransfer.setData("ID", ev.target.id);
	},

	dragOver: function(ev) {
		ev.preventDefault();
	},

	
	drop: function(ev) {
		console.log("drap end, drop");
		ev.preventDefault();
		var data = ev.dataTransfer.getData("ID");
		ev.target.appendChild(document.getElementById(data));
	}
});
