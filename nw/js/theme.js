var Theme = Class.extend({
	init: function() {
		this._fs = require('fs');
		this._exec = require('child_process').exec;
		this._themePath = "";

		this._theme = [];
		// this._keys = [];
		// {
			// 'IconTheme': {
				// 'name': 'Mint-X'
			// },
			// 'Computer': {
				// 'active': 'false'
			// },
			// 'Trash': {
				// 'active': 'false'
			// },
			// 'Network': {
				// 'active': 'false'
			// },
			// 'Document': {
				// 'active': 'false'
			// }
		// }

		var theme = this;
		this._exec("echo $HOME/.local/share/", function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				theme._themePath = stdout.substr(0, stdout.length - 1) + "themeConf";
				theme.getCurThemeConfig();
			}
		});
	},
		
	getCurThemeConfig: function() {
		var theme = this;

		this._fs.readFile(this._themePath, 'utf-8', function(err, data) {
			if(err) {
				console.log(err);
			} else {
				var lines = data.split('\n');
				for(var i = 0; i < lines.length; ++i) {
					if(lines[i] == "") continue;
					var attr = lines[i].split(':');
					// theme._keys = attr[0];
					var attrs = attr[1].split(' ');
					theme._theme[attr[0]] = {
						'name': attrs[0],
						'active': attrs[1],
						'icon': attrs[2],
						'path': attrs[3],
						'id': attrs[4]
					};
				}
			}
		});
	},

	saveConfig: function() {
		var data = "";
		for(var key in this._theme) {
			data += key + ":" + this._theme[key] + '\n';
		}
		// for(var i = 0; i < this._keys.length; ++i) {
			// data += this._keys[i] + this._theme[this._keys[i]] + '\n';
		// }
		this._fs.writeFile(this._themePath, data, 'utf-8', function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log('File saved!!');
			}
		});
	},

	loadThemeEntry: function(desktop_) {},

	getIconTheme: function() {
		return this._theme['IconTheme']['name'];
	},

	setIconTheme: function(iconTheme_) {
		this._theme['IconTheme']['name'] = iconTheme_;
	},

	activeComputer: function() {
		this._theme['Computer']['active'] = 'true';
	},

	deactiveComputer: function() {
		this._theme['Computer']['active'] = 'false';
	},
	
	activeTrash: function() {
		this._theme['Trash']['active'] = 'true';
	},

	deactiveTrash: function() {
		this._theme['Trash']['active'] = 'false';
	},
	
	activeNetwork: function() {
		this._theme['Network']['active'] = 'true';
	},

	deactiveNetwork: function() {
		this._theme['Network']['active'] = 'false';
	},
	
	activeDocument: function() {
		this._theme['Document']['active'] = 'true';
	},

	deactiveDocument: function() {
		this._theme['Document']['active'] = 'false';
	}
});

