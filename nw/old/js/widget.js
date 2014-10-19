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
		console.log("drag start");
		ev.dataTransfer.setData("ID", ev.currentTarget.id);
		console.log(ev.dataTransfer.getData("ID"));
		ev.stopPropagation();
	},

	dragOver: function(ev) {
		ev.preventDefault();
	},

	drop: function(ev) {
		//if(ev.srcElement == ev.toElement) return ;
		ev.preventDefault();
		var _id = ev.dataTransfer.getData("ID");
		if(ev.target.id == _id) return ;
		//ev.target.appendChild(document.getElementById(_id));
		$(ev.target).append($('#'+_id));
	
		console.log(_id + " ---> " + ev.target.id);
		var attr = ev.target.id.split('_');
		console.log(desktop._widgets[_id]);
		if (typeof desktop._widgets[_id] !== 'undefined') {
				desktop._widgets[_id].setPosition({x: attr[1], y: attr[2]});
				console.log(attr[1], attr[2]);
			}
	},

	dragEnter: function(ev) {},

	dragLeave: function(ev) {},

	bindDrag: function(target) {
		target.ondragstart = this.drag;
		target.ondragover = this.dragOver;
		target.ondrop = this.drop;
		target.ondragenter = this.dragEnter;
		target.ondragleave = this.dragLeave;
	}
});
