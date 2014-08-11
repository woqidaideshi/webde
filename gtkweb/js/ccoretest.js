//Ccore.print("Hello World!!");
var BASE_APP_PATH = "/usr/share/applications/";

function startApp(str) {
	var ret = Ccore.launchApp(str);
	if(!ret) Ccore.show("Launch failed!");
}

function showMenu(e) {
	var left, top;
	var w = $('.menu').width();
	var h = $('.menu').height();
	left = (document.body.clientWidth < e.clientX + w) ? (e.clientX - w) : e.clientX;
	top = (document.body.clientHeight < e.clientY + h) ? (e.clientY - h) : e.clientY;
	
	$('#menu').css({
		"left": left,
		"top": top
	});
	$('#menu').show();
}

function handleMouseDown(e) {
	//$('.menu li').

	switch(e.button) {
		case 2://right
			showMenu(e);
			break;
		case 0://left
		case 1://middle
		default:
			$('#menu').hide();
	}
}

$(document).ready(function() {
	document.onmousedown = handleMouseDown;
	$('#gedit').click(function() {startApp(BASE_APP_PATH + 'gedit.desktop')});
	$('#terminal').click(function () {startApp(BASE_APP_PATH + 'gnome-terminal.desktop')});
});
