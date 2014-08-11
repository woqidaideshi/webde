var BASE_APP_PATH = "/usr/share/applications/";
var gedit = undefined;
var terminal = undefined;

function loadDEntries() {
	gedit = new DEntry('gedit');
	terminal = new DEntry('terminal');

	gedit.show();
	terminal.show();
}

$(document).ready(function() {
	loadDEntries();
});
