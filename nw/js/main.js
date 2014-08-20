var gui = require('nw.gui');
var win = gui.Window.get();
win.enterFullscreen();

// var BASE_APP_PATH = "/usr/share/applications/";
var desktop = undefined;
// var gedit = undefined;
// var terminal = undefined;
//
//Should be a singleton!
var theme = Theme.create();
var	utilIns = Util.create();

// function loadDEntries() {
	// gedit = new AppEntry('gedit');
	// terminal = new AppEntry('terminal');
	// var file = new FileEntry('file');

	// gedit.show();
	// terminal.show();
// }

$(document).ready(function() {
	desktop = Desktop.create();
	desktop.addAnDPlugin(ClockPlugin.create('clockPlugin'));
	// draw clock;
	clockRun("clockContent");
	//loadDEntries();
});
