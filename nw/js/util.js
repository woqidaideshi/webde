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

var Util = Class.extend({
	init: function() {},

	getIconPath: function(iconName_, size_) {
		//get theme config file
		//
		//get the name of current icon-theme
		//
		//1. search $HOME/.icons/icon-theme_name/subdir(get from index.theme)
		//
		//2. if not found, search $XDG_DATA_DIRS/icons/icon-theme_name
		//   /subdir(get from index.theme)
		//
		//3. if not found, search /usr/share/pixmaps/subdir(get from index.theme)
		//
		//4. if not found, change name to current theme's parents' recursively 
		//   and repeat from step 1 to 4
		//
		//5. if not found, return default icon file path(hicolor)
		//
	}
});
