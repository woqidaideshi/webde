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
	desktop = new Desktop();
	desktop.addAnDEntry(new AppEntry('gedit'));
	desktop.addAnDEntry(new AppEntry('terminal'));
	//loadDEntries();
});
