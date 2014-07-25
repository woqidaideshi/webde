//Ccore.print("Hello World!!");

function startApp(str) {
	var ret = Ccore.launchApp(str);
	if(!ret) Ccore.show("Launch failed!");
}
