// This file includes all view classes
//

// Base class for all widget views 
//
var WidgetView = View.extend({
	init: function(model_) {
		this.callSuper(model_);
		initAction();
	},
	
	update: function(updatedObj_) {},

	initAction: function() {
		var selector = '#' + this._id;
		this.$view.on('drag', selector, drag)
			.on('dragOver', selector, dragOver)
			.on('drop', selector, drop)
			.on('dragEnter', selector, dragEnter)
			.on('dragLeave', selector, dragLeave);
	},

	drag: function(ev) {
		console.log("drag start");
		ev.dataTransfer.setData("ID", ev.currentTarget.id);
		console.log(ev.dataTransfer.getData("ID"));
		ev.stopPropagation();
	},

	dragOver: function(ev) {
		ev.preventDefault();
	},

	// TODO: change to use a Command to modify model
	//	and then will emit view's update
	//
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

	dragLeave: function(ev) {}
}); 
