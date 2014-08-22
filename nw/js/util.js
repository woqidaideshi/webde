//could be seen as a util-box
//
var Util = Class.extend({
	init: function() {
		this.entryUtil = EntryUtil.create();
	}
});

var EntryUtil = Event.extend({
	init: function() {
		this._fs = require('fs');
		this._exec = require('child_process').exec;

		var $home = undefined;
		var $xdg_data_dirs = undefined;

		var entryUtil = this;
		this._exec('echo $HOME', function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				entryUtil.$home = stdout.substr(0, stdout.length - 1);
			}
		});
		this._exec('echo $XDG_DATA_DIRS', function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				entryUtil.$xdg_data_dirs = stdout.substr(0, stdout.length - 1).split(':');
				for(var i = 0; i < entryUtil.$xdg_data_dirs.length; ++i) {
					var l = entryUtil.$xdg_data_dirs[i].length;
					if(entryUtil.$xdg_data_dirs[i].charAt(l - 1) == '/') {
						entryUtil.$xdg_data_dirs[i] = entryUtil.$xdg_data_dirs[i].substr(0, l - 1);
					}
				}
			}
		});
	},
	
	getIconPath: function(iconName_, size_, callback_) {
		//get theme config file
		//get the name of current icon-theme
		//1. search $HOME/.icons/icon-theme_name/subdir(get from index.theme)
		//2. if not found, search $XDG_DATA_DIRS/icons/icon-theme_name
		//   /subdir(get from index.theme)
		//3. if not found, search /usr/share/pixmaps/subdir(get from index.theme)
		//4. if not found, change name to current theme's parents' recursively 
		//   and repeat from step 1 to 4
		//5. if not found, return default icon file path(hicolor)
		//
		if(typeof callback_ !== "function") {
			console.log("Bad function of callback!!");
			return ;
		}
		this.once(iconName_, callback_);

		var iconTheme = theme.getIconTheme();
		// var iconPath = 
			this.getIconPathWithTheme(iconName_, size_, iconTheme);
		// if(iconPath != null) return iconPath;

		// iconPath = 
			this.getIconPathWithTheme(iconName_, size_, "hicolor");
		// if(iconPath != null) return iconPath;
	},

	getIconPathWithTheme: function(iconName_, size_, themeName_) {
		var iconPath = undefined;
		var themePath = this.$home + "/.local/share/icons/" + themeName_;
		if(this._fs.existsSync(themePath)) {
			// iconPath = 
				this.findIcon(iconName_, size_, themePath);
			// if(iconPath != null) return iconPath;
		}
				
		for(var i = 0; i < this.$xdg_data_dirs.length; ++i) {
			themePath = this.$xdg_data_dirs[i] + "/icons/" + themeName_;
			if(this._fs.existsSync(themePath)) {
				// iconPath = 
					this.findIcon(iconName_, size_, themePath);
				// if(iconPath != null) return iconPath;
			}
		}

		themePath = "/usr/share/pixmaps" + themeName_;
		if(this._fs.existsSync(themePath)) {
			// iconPath = 
				this.findIcon(iconName_, size_, themePath);
			// if(iconPath != null) return iconPath;
		}

		return null;
	},

	findIcon: function(iconName_, size_, themePath_) {
		var util = this;
		var tmp = 'find ' + themePath_ + ' -regextype \"posix-egrep\" -regex \".*' + size_
				+ '.*/' +iconName_ + '\.(svg|png|xpm)$\"';
		console.log(tmp);

		this._exec(tmp
				, function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				if(stdout == "") {
					util._fs.readFile(themePath_ + '/index.theme', 'utf-8', function(err, data) {
						var _parents = [];
						if(err) {
							console.log(err);
						} else {
							var lines = data.split('\n');
							for(var i = 0; i < lines.length; ++i) {
								if(lines[i].substr(0, 7) == "Inherits") {
									attr = lines[i].split('=');
									_parents = attr[1].split(',');
								}
							}
						}
	
						for(var i = 0; i < _parents.length; ++i) {
							var iconPath = this.getIconPathWithTheme(iconName_, size_, _parents[0]);
							// if(iconPath != null) return iconPath;
						}
	
						// return null;
					});
				} else {
					util.emit(iconName_, stdout.split('\n'));//.substr(0, stdout.length - 1)
					// return stdout.substr(0, stdout.length - 1);
				}
			}
		});
		
	}

});
