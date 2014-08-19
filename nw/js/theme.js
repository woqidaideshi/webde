var Theme = Class.extend({
	init: function() {
		this._fs = require('fs');
		this._exec = require('child_process').exec;
		this._themePath = "";

		this._theme = [];
		this._keys = [];

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
					theme._keys = attr[0];
					theme._theme[attr[0]] = attr[1];
				}
			}
		});
	},

	saveConfig: function() {
		var data = "";
		for(var i = 0; i < this._keys.length; ++i) {
			data += this._keys[i] + this._theme[this._keys[i]] + '\n';
		}
		this._fs.writeFile(this._themePath, data, 'utf-8', function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log('File saved!!');
			}
		});
	},

	getIconTheme: function() {
		return this._theme['IconTheme'];
	},

	setIconTheme: function(iconTheme_) {
		this._theme['IconTheme'] = iconTheme_;
	}
});

//Should be a singleton!
var theme = Theme.create();
