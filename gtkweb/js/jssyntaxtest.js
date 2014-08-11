Desktop1 = function() {
	var DD = "initial";

	function Desktop1() {
		console.log("Desktop1 Constructor: " + DD);
	}

	return (new Desktop1);
}

Desktop2 = (function(_super) {
	var __super = _super;
	var DD = "initial";

	function Desktop2() {
		console.log("Desktop2 Constructor: " + DD);
	}

	return Desktop2;
})(Desktop1);


function start() {
	var d1 = new Desktop1();
	var d2 = new Desktop2();
}
