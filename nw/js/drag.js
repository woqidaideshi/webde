function getElem (id) {  
      return document.getElementById(id);  
    }   

    function getdesktop () {  
      return getElem("desktop");  
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
          console.log(event.srcElement.id);
        	if (event.srcElement.id == "p_canvas"  || event.srcElement.id=="computer-pic" || event.srcElement.id=="user-home-pic") {
        		console.log(event.srcElement.id);
        		if (event.srcElement.id == "p_canvas") {
        			dragdiv = getElem("clock");
        		}
        		else if(event.srcElement.id == "computer-pic") {
        			dragdiv=getElem("computer");
                        console.log(dragdiv.id);
        		}
            else if(event.srcElement.id == "user-home-pic") {
              dragdiv=getElem("user-home");
            }
            else {
              dragdiv=getElem(event.srcElement.id);
            }
        	console.log(dragdiv.id);
          startLeft = dragdiv.offsetLeft;  
          startTop =dragdiv.offsetTop;  
            dragging = true;  
            dragPosX = event.clientX;  
            dragPosY = event.clientY;  
            event.preventDefault(); // disable default behavior of browser  
          }  
        },  
        true  
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
        true  
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
        true  
      );  
    }  