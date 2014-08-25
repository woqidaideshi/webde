var gui = require('nw.gui');
var win = gui.Window.get();
// win.enterFullscreen();

// var BASE_APP_PATH = "/usr/share/applications/";
var desktop = undefined;
// var gedit = undefined;
// var terminal = undefined;

//Should be a singleton!
var theme = Theme.create();
var	utilIns = Util.create();

/* function loadDEntries() { */
	// gedit = new AppEntry('gedit');
	// terminal = new AppEntry('terminal');
	// var file = new FileEntry('file');

	// gedit.show();
	// terminal.show();
// }

$(document).ready(function() {
	desktop =  Desktop.create();
	/*desktop.addAnDPlugin(ClockPlugin.create('clock'));
	desktop.addAnDPlugin(PicPlugin.create('cat'),undefined,'img/cat.jpg');
	desktop.addAnDPlugin(PicPlugin.create('book'),undefined,'img/book.jpg');
	desktop.addAnDPlugin(PicPlugin.create('boat'),undefined,'img/boat.jpg');
	desktop.addAnDPlugin(PicPlugin.create('book1'),undefined,'img/book.jpg');
	*/
	//show dock
	/*desktop.addDock();
	desktop.addAnImgToDock("img/terminal.png", "terminal", "x-terminal-emulator &");
	desktop.addAnImgToDock("img/gedit.png", "gedit", "gedit &");
	desktop.addAnImgToDock("img/picture.png", "picture", "gthumb &");
	desktop.addAnImgToDock("img/chromium.png", "chromium", "chromium-browser &");
	desktop.addAnImgToDock("img/moive.png", "moive", "svlc &");
	desktop.addAnImgToDock("img/music.png", "music", "banshee &");*/
	//loadDEntries();
});
