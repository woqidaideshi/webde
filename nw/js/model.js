//This file includes all model classes used in this project
//

//This class contains all theme relevant data and service.
//TODO: replace the nodejs apis to ourselves.
//
var ThemeModel = Model.extend({
	init: function(callback_) {
		// this.req = undefined;

		this._fs = require('fs');
		this._exec = require('child_process').exec;
		this._themePath = "";

		this._theme = [];
		
		var theme = this;
		this._exec("echo $HOME/.local/share/", function(err, stdout, stderr) {
			if(err) {
				console.log(err);
			} else {
				theme._themePath = stdout.substr(0, stdout.length - 1) + "themeConf";
				theme.getCurThemeConfig(callback_);
			}
		});
	},
		
	getCurThemeConfig: function(callback_) {
		var theme = this;

		this._fs.readFile(this._themePath, 'utf-8', function(err, data) {
			if(err) {
				console.log(err);
				callback_.call(this, err);
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
						'id': attrs[4],
						'pos': {x: attrs[5], y: attrs[6]}
					};
				}
				/* theme.inited = true; */
				/* theme.emit('inited', theme.req); */
				callback_.call(this, null);
			}
		});
	},

	saveConfig: function(desktop_) {
		var data = "";
		for(var key in this._theme) {
			data += key + ":" 
				+ ((this._theme[key]['active'] == 'true') ?
					desktop_._widgets[key]._name : this._theme[key]['name']) + ' '
				+ this._theme[key]['active'] + ' '
				+ this._theme[key]['icon'] + ' '
				+ this._theme[key]['path'] + ' '
				+ this._theme[key]['id'] + ' '
				+ ((this._theme[key]['active'] == 'true') ?
					desktop_._widgets[key]._position.x : this._theme[key]['pos'].x) + ' '
				+ ((this._theme[key]['active'] == 'true') ?
					desktop_._widgets[key]._position.y : this._theme[key]['pos'].y) + '\n';
		}
		// for(var i = 0; i < this._keys.length; ++i) {
			// data += this._keys[i] + this._theme[this._keys[i]] + '\n';
		// }
		this._fs.writeFile(this._themePath, data, 'utf-8', function(err) {
			if(err) {
				console.log(err);
			} 
		});
	},

	loadThemeEntry: function(desktop_) {
		/* if(!this.inited) { */
			// this.req = desktop_;
			// this.once('inited', this.loadThemeEntry);
			// return ;
		/* } */
		for(var key in this._theme) {
			if(key == 'icontheme') continue;
			if(this._theme[key]['active'] == 'false') continue;
			desktop_.addAnDEntry(ThemeEntry.create(
						this._theme[key]['id'],
						desktop_._tabIndex++,
						this._theme[key]['path'],
						this._theme[key]['icon'],
						this._theme[key]['name']
						), ((typeof this._theme[key]['pos'].x === 'undefined' 
									|| typeof this._theme[key]['pos'].y === 'undefined')
									? undefined : this._theme[key]['pos']));
		}
	},

	getIconTheme: function() {
		return this._theme['icontheme']['name'];
	},

	setIconTheme: function(iconTheme_) {
		this._theme['icontheme']['name'] = iconTheme_;
	},

	getComputer: function() {
		this._theme['computer']['active'];
	},

	setComputer: function(active_) {
		this._theme['computer']['active'] = active_;
	},
	
	getTrash: function() {
		this._theme['trash']['active'];
	},

	setTrash: function(active_) {
		this._theme['trash']['active'] = active_;
	},
	
	getNetwork: function() {
		this._theme['network']['active'];
	},

	setNetwork: function(active_) {
		this._theme['network']['active'] = active_;
	},
	
	getDocument: function() {
		this._theme['document']['active'];
	},

	setDocument: function(active_) {
		this._theme['document']['active'] = active_;
	}
});

// Base Class for all widget models
//
var WidgetModel = Model.extend({
	init: function(id_, position_) {
		this.callSuper(id_);
		this._position = position_;
	},
	
	getPosition: function() {return	this._position;},

	setPosition: function(position_) {
		this._position = position_;
		this.notify({'position': this._position});
	},

	getID: function() {return this._id;},

	setID: function(id_) {this._id = id_;}
});
