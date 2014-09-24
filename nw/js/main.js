//This is the main file of this project

var global = null;
$(document).ready(function() {
	global = Global.create();
	global.addGObjects({
		'name': 'theme',
		'class': ThemeModel,
		'serialize': true
	}, {
		'name': 'utilIns',
		'class': Util,
		'serialize': true
	}, {
		'name': 'desktop',
		'class': Desktop,
		'serialize': true
	}, {
		'name': 'theCP',
		'class': CommandProcessor,
		'serialize': false
	});
});
