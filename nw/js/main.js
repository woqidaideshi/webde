var BASE_APP_PATH = "/usr/share/applications/";
var desktop = undefined;
var gedit = undefined;
var terminal = undefined;

function loadDEntries() {
	gedit = new AppEntry('gedit');
	terminal = new AppEntry('terminal');
	var file = new FileEntry('file');

	gedit.show();
	terminal.show();
}

$(document).ready(function() {
        //var gui = require('nw.gui');
        //var win = gui.Window.get();
       // win.enterFullscreen();

	desktop =  Desktop.create();
	desktop.addAnDEntry(AppEntry.create('gedit'));
	desktop.addAnDEntry(AppEntry.create('terminal'));
	desktop.addAnDPlugin(ClockPlugin.create('clockPlugin'));
	// draw clock;
	clockRun("clockContent");
	//show dock
	desktop.addDock();
	desktop.addAnImgToDock("img/terminal.ico", "terminal", "x-terminal-emulator &");
	desktop.addAnImgToDock("img/gedit.ico", "gedit", "gedit &");
	desktop.addAnImgToDock("img/picture.ico", "picture", "gthumb &");
	desktop.addAnImgToDock("img/chromium.ico", "chromium", "chromium-browser &");
	desktop.addAnImgToDock("img/moive.ico", "moive", "svlc &");
	desktop.addAnImgToDock("img/music.ico", "music", "banshee &");
	//loadDEntries();


});
