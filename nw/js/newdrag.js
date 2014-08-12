function allowDrop(ev)
{
	console.log("drap over");
ev.preventDefault();
}

function drag(ev)
{
	console.log("drap start");
ev.dataTransfer.setData("Text",ev.target.id);
}

function drop(ev)
{
	console.log("draping");
ev.preventDefault();
var data=ev.dataTransfer.getData("Text");
ev.target.appendChild(document.getElementById(data));
}

