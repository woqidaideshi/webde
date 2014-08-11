//id_: DEntry's Unic ID.
//position_({left, top}): The position of this DEntry.
//path_: file path
//
function DEntry(id_, position_, path_) {
	var id = id_;
	var position = position_;
	var path = path_;
	var name = id_;

	var PATTERN = "<img/>" + "<p>" + name + "</p>"; 
	var dEntry = $('<div>', {
			'class': 'icon',
			'id': id
		});

	return {
		//public functions
		
		show: function() {
			dEntry.html(PATTERN);

			$('body').append(dEntry);
		},

		getPosition: function() {return position;},

		setPosition: function(position_) {
			//redraw it with new position
			position = position_;
		},

		getID: function() {return id;},

		setID: function(id_) {id = id_;},//needed?

		getName: function() {return name;},

		setName: function(name_) {
			//redraw dentry's name
			name = name_;
		}
	};
}
