//This class is totally for desktop management
//
function Desktop() {
	var col = 80 + 20;
	var row = 80 + 10;
	var col_num = undefined;
	var row_num = undefined;

	var entries = [];
	var grid = $('<div>', {
		'class': 'gridcontainer', 
		'id': 'grids'
	});

	var generateGrid = function () {
		$('body').append(grid);
		
		var w = $(document).width();
		var h = $(document).height();
		console.log(w + "  " + h);
		col_num = Math.floor(w * 0.92 / col);
		row_num = Math.floor(h * 0.9 / row);
		console.log(col_num + " " + row_num);

		for(var i = 0; i < col_num; ++i) {
			var col_ = $('<div>', {
				'class': 'gridcol',
				'id': 'col' + i
			});
			$('#grids').append(col_);

			entries[i] = new Array();
			for(var j = 0; j < row_num; ++j) {
				var row_ = $('<div>', {
					'class': 'grid',
					'id': 'grid' + i + j
				});
				$('#col' + i).append(row_);

				$('grid' + i + j).bind("drop", function(ev)  {
					drop(ev);
				});

				$('grid' + i + j).bind("dragover", function(ev) {
					allowDrop(ev);
				});

				entries[i][j] = {};
				entries[i][j].use = false;
			}
		}
	};

	var findAnIdleGrid = function() {
		for(var i = 0; i < col_num; ++i) {
			for(var j = 0; j < row_num; ++j) {
				if(entries[i][j].use == false) {
					return {x: i, y: j};
				}
			}
		}
		return null;
	};

	//constructor
	(function () {
		generateGrid();
		console.log("generate!!");
	})();

	return {
		loadEntries: function() {},

		addAnDEntry: function(entry_, pos_) {
			if(typeof pos_ === 'undefined') {
				pos_ = findAnIdleGrid();
				if(pos_ == null) {
					alert("No room");
					return ;
				}
			}

			entry_.setPosition(pos_);
			entry_.show();
			entries[pos_.x][pos_.y].use = true;
		}
	};
}
