//base class for varies dentries
//id_: DEntry's Unic ID.
//position_({left, top}): The position of this DEntry.
//path_: file path
//
function DEntry(id_, position_, path_) {
	var id = id_;
	var position = position_;
	var path = path_;
	var name = id_;

	var PATTERN = "<img draggable='true'/>" + "<p>" + name + "</p>"; 
	var dEntry = $('<div>', {
			'class': 'icon',
			'id': id,
			'draggable': 'true'
		});

	return {
		//public functions
		
		show: function() {
			if(typeof position === 'undefined') {
				alert("no position!!");
				return ;
			}

			dEntry.html(PATTERN);
			$('#grid' + position.x + position.y).append(dEntry);

			var target = document.getElementById(id);
			target.ondragstart = drag;
			target.onclick = function() {alert(id);}
		},

		getPosition: function() {return position;},

		setPosition: function(position_) {
			//redraw it with new position
			//$('#' + id).attr();
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

//Desktop Entry for application files (a.k.a .desktop)
//
function AppEntry(id_, position_, path_) {
	var super_ = new DEntry(id_, position_, path_);

	return {
		//inherit functions
		
		show: function() {
			super_.show();
		},

		getPosition: function() {super_.getPosition;},

		setPosition: function(position_) {
			super_.setPosition(position_);
		},

		getID: function() {super_.getID();},

		setID: function(id_) {super_.setID(id_);},//needed?

		getName: function() {super_.getName();},

		setName: function(name_) {
			super_.setName(name_);
		},

		//self funtions
		open: function() {
			//launch app
		}
	};
}

//Desktop Entry for directories
//
function DirEntry(id_, position_, path_) {
	var super_ = new DEntry(id_, position_, path_);

	return {
		//inherit functions
		
		show: function() {
			super_.show();
		},

		getPosition: function() {super_.getPosition;},

		setPosition: function(position_) {
			super_.setPosition(position_);
		},

		getID: function() {super_.getID();},

		setID: function(id_) {super_.setID(id_);},//needed?

		getName: function() {super_.getName();},

		setName: function(name_) {
			super_.setName(name_);
		},

		//self funtions
		open: function() {
			//open dir
		}
	};
}

//Desktop Entry for normal files
//
function FileEntry(id_, position_, path_) {
	var super_ = new DEntry(id_, position_, path_);
	var type = undefined;
	
	function parseType(path__) {
		//get file type from path__
		console.log("type is " + type);
	}

	//constructor
	(function () {
		type = parseType(path_);
	})();

	return {
		//inherit functions
		
		show: function() {
			super_.show();
		},

		getPosition: function() {super_.getPosition;},

		setPosition: function(position_) {
			super_.setPosition(position_);
		},

		getID: function() {super_.getID();},

		setID: function(id_) {super_.setID(id_);},//needed?

		getName: function() {super_.getName();},

		setName: function(name_) {
			super_.setName(name_);
		},

		//self funtions
		open: function() {
			//open files with specific app
		}
	};
}
