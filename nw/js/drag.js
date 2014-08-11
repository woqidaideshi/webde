function getElem (id) {  
      return document.getElementById(id);  
    }  

    function trimPX (_px) {  
      if(_px==null || _px=="")  
        return 0;  
      return parseInt(_px.substr(0, _px.lastIndexOf("px")));  
    }  

    function hitInRect (hitX, hitY, rcLeft, rcTop, rcWidth, rcHeight) {  
      return (hitX>=rcLeft && hitX<rcLeft+rcWidth && hitY>=rcTop && hitY<rcTop+rcHeight);  
    }  

    function getdesktop () {  
      return getElem("desktop");  
    }  

    function  getPoint(id){  //返回html控件的坐标
    var htmlObj = document.getElementById(id);
    var  rd  =  {x:0,y:0};
    do{  
        rd.x  +=  htmlObj.offsetLeft;   
        rd.y  +=  htmlObj.offsetTop;
        htmlObj  =  htmlObj.offsetParent;
    }  
    while(htmlObj)
    return  rd;
}

    var dragging = false;  
    var startTop = 0; // top is a Key Word in Chrome and Opera  
    var startLeft = 0;  
    var dragPosY = 0;  
    var dragPosX = 0;  
    var dragdiv = null;

    window.addEventListener("load", initPage, false);

    function initPage () {  
      getdesktop().addEventListener("mousedown", // start moving image  
        function (event) {  
        	if (event.srcElement.id == "p_canvas"  ) {
        		console.log(event.srcElement.id);
        	dragdiv = getElem("clock");
        	var rc = getPoint("p_canvas");
          startTop = rc.y;  
          startLeft =rc.x;  
   	console.log(startTop);
  	console.log(startLeft);
            dragging = true;  
            dragPosX = event.clientX;  
            dragPosY = event.clientY;  
            event.preventDefault(); // disable default behavior of browser  
          }  
        },  
        false  
      );  

getdesktop().addEventListener("mousemove", // moving image  
        function (event) {  
          if (dragging){  
            dragdiv.style.cursor="pointer";  
            dragdiv.style.top = parseInt(startTop)+(event.clientY - dragPosY) + "px";  
            dragdiv.style.left = parseInt(startLeft)+(event.clientX - dragPosX) + "px";  

          }  
          event.preventDefault();  
        },  
        false  
      );  

getdesktop().addEventListener("mouseup", // stop moving image  
        function (event) {  
          dragging = false;  
          if (dragdiv != null) {
          dragdiv.style.cursor="default"; 
          dragdiv = null;
      };
          event.preventDefault();  
        },  
        false  
      );  
    }  