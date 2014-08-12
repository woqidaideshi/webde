function util() {
    this.distance = 175;//鼠标到圆心距离
    this.imgMaxWidth = 100;
    this.imgMaxHeight = 100;
    this.init();
}
util.prototype = {
    init: function () {
        var boxObj = document.getElementById('dock');
        var imgList = boxObj.getElementsByTagName('img');
        var _this = this;
        
        document.onmousemove = function (ev) {
            var ev = ev || window.event;
            for (var i = 0; i < imgList.length; i++) {
                var a = ev.clientX - (imgList[i].offsetLeft + imgList[i].offsetWidth / 2);
                var b = ev.clientY - (imgList[i].offsetTop + imgList[i].offsetHeight / 2 + boxObj.offsetTop);
                var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
                var spex = 1 - c / _this.distance;
                if (spex < 0.5) {
                    spex = 0.5;
                }
                imgList[i].style.width = spex * (_this.imgMaxWidth) + 'px';
                imgList[i].style.height = spex * (_this.imgMaxHeight) + 'px';
            }
        }
    }
}