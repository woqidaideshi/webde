//获取绘图对象
var clockRun = function(id_){
var p_canvas = document.getElementById(id_);
var p_context = p_canvas.getContext('2d');

var width=p_canvas.offsetWidth,height=p_canvas.offsetHeight;
	var img = new Image();
	img.src="img/clock.png";

function Pointer(){
var p_type = [['#000',70,1],['#ccc',60,2],['red',50,3]];
function drwePointer(type,angle){
type = p_type[type];
angle = angle*Math.PI*2 - 90/180*Math.PI; 
var length= type[1]/(200/width);
p_context.beginPath();
p_context.lineWidth = type[2];
p_context.strokeStyle = type[0];
p_context.moveTo(width/2,height/2); 
p_context.lineTo(width/2 + length*Math.cos(angle),height/2 + length*Math.sin(angle)); 
p_context.stroke();
p_context.closePath();

}
setInterval(function (){
p_context.clearRect(0,0,height,width);
p_context.drawImage(img,0,0,width,height);
var time = new Date();
var h = time.getHours();
var m = time.getMinutes();
var s = time.getSeconds(); 
h = h>12?h-12:h;
h = h+m/60; 
h=h/12;
m=m/60;
s=s/60;
drwePointer(0,s);
drwePointer(1,m);
drwePointer(2,h); 
},100);
}
var p = new Pointer();
}