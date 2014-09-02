/* this file is used to show Property windows 
// and drag property window.
// author:wangtan
*/

// Property @extend Class
var Property = Class.extend({
	// init Property : include title, button ,and tags;
	// id_: id of object used to get property information of app file or dir
	init: function(id_){
		this._id = id_;
		this._isMouseDown = false;  	//flag mouse is down or not  
		this._offsetX = 0;						//record mouse-x relate property-div left 	
		this._offsetY = 0;						//record mouse-y relate property-div top
		//main div
		var _property = $('<div>', {
			'class': 'property',
			'id': id_+'-property'
		});
		
		//title 
		var _property_title = $('<h2>',{
			'id': id_+ '-title',
			'text': desktop._widgets[id_]._name + ' ' + '属性'
		});
		_property.append(_property_title);

		//show information of property
		var _property_show = $('<div>', {
			'class': 'property-show'
		});
		_property.append(_property_show);

		//tabs of different type of information
		var _property_tabs  = "<div id='" +this._id
				+"-tabs' class='property-tabs'><a href='#"
				+this._id +"-basic'>基本</a><a href='#"
				+this._id+"-power'>权限</a></div>";
		_property_show.html(_property_tabs);

		//2 tab of basic information
		var _property_basic =  $('<div>', {
			'class': 'tabcontent',
			'id': this._id+'-basic'
		});
		_property_show.append(_property_basic);
		var _property_power =  $('<div>', {
			'class': 'tabcontent',
			'id': this._id+'-power'
		});
		_property_show.append(_property_power);
		
		//button 
		var _property_close = $('<button>',{
			'class': 'property-close',
			'id': this._id+'-close',
			'text': 'CLOSE'
		});
		_property.append(_property_close);

		$('body').append(_property);
		//binding events to the div 
		this.bindEvents();
	},

	//bind events to div: include drag, tabs and close
	bindEvents:function(){
		var _this = this;
		// tabs 
		$(function() {  
        	var tabhosts = $($('#'+_this._id+'-tabs').children('a')); 
          	tabhosts.each(function() {
            	$($(this).attr("href")).hide();
            	if ($(this).hasClass("selected")) {
            	    $($(this).attr("href")).show();  
            	}    
            	$(this).click(function(event) {  
                	event.preventDefault();    
                	if (!$(this).hasClass("selected")) {  
                    	tabhosts.each(function() {  
                        	$(this).removeClass("selected");  
                        	$($(this).attr("href")).hide();  
                    	});  
                    	$(this).addClass("selected");  
                    	$($(this).attr("href")).show();  
                	}  
            	});  
        	});  
    	});  

		//property animate and remove();
		$('#' +_this._id+ '-close').click(function(e){
			if (e.target.id.split('-')[0] !== 'event') {
				$('#'+_this._id+'-property').animate({top:top_,opacity:'hide',width:0,height:0,left:left_},500,function(){
					$(this).remove();
				});
			}
		});

		//drag function 
		$('#'+_this._id + '-title').mouseover(function(ev){
			$('#'+_this._id+'-title').css('cursor','move');
		});

		$('#'+_this._id + '-title').mousedown(function(ev){
			_this._isMouseDown = true;
			_this._offsetX = ev.offsetX;
			_this._offsetY = ev.offsetY;
			console.log('x:' +_this._offsetX + '  y: ' + _this._offsetY );
			$('#'+_this._id+'-property').fadeTo(20, 0.5);
		}).mouseup(function(ev){
			_this._isMouseDown = false;
			$('#'+_this._id+'-property').fadeTo(20, 1);
		});

		$(document).mousemove(function(ev){
		if(!_this._isMouseDown) return ;
		var x = ev.clientX - _this._offsetX; 
		console.log('ev.x: '+ev.clientX + '   this:x '+_this._offsetX + '  x: ' + x);
		var y = ev.clientY - _this._offsetY; 
		console.log('ev.y: '+ev.clientY + '   this:y '+_this._offsetY + '  y: ' + y);
		$('#'+_this._id+'-property').css("left", x);
		$('#'+_this._id+'-property').css("top", y-10);
		$('#'+_this._id+'-title').css('cursor','move');
		});
	},

	//show property inform into tab-basic and tab-power
	showAppProperty:function(){
		var path_ = desktop._widgets[this._id]._path;
		var _this = this;
		//create a div for show the msg
		
		utilIns.entryUtil.parseDesktopFile(path_, function(err_, file_) {
			if(err_) { 
				console.log(err_);
				return ;
			}
			var comment = file_['Comment'];
			var genericName = undefined;
			if (typeof file_['GenericName[zh_CN]'] != 'undefined') 
				genericName = file_['GenericName[zh_CN]'];
			else genericName = file_['GenericName'];
			$('#'+_this._id+'-basic').append("<p>    <span>▪</span>名称:          " + desktop._widgets[_this._id]._name + "</p>");
			$('#'+_this._id+'-basic').append("<p>    <span>▪</span>命令:          " + desktop._widgets[_this._id]._execCmd + "</p>");
			$('#'+_this._id+'-basic').append("<p>    <span>▪</span>描述:  " + comment + "</p>");
			$('#'+_this._id+'-basic').append("<p>    <span>▪</span>备注:  " + genericName + "</p>");
			$('#'+_this._id+'-basic').append("<p>    <span>▪</span>位置:  " + path_ + "</p>");
			//get launch commad
			var tabhosts = $($('#'+_this._id+'-tabs').children('a')); 
			$(tabhosts[0]).addClass("selected");  
            $($(tabhosts[0]).attr("href")).show(); 
		});

		utilIns.entryUtil.getProperty(path_, function(err_,attr_) {
			if (typeof attr_ == 'undefined') {
				console.log('get Property err');
				return ;
			}
			$('#'+_this._id+'-basic').append("<p>    <span>▪</span>文件大小:  " + attr_['size'] + "</p>");
			var fileType = null;
			switch(attr_['access'][0]){
				case '-': 
					fileType = '普通文件';
					break ;
				case 'd':
					fileType = '文件夹';
					break ;
				case 'b':
					fileType = '块特殊文件';
					break;
				case 'c':
					fileType='字符特殊文件';
					break ;
				case 'l':
					fileType='连接';
					break ;
				case 'p':
					fileType='命名管道（FIFO）';
					break ;
				default:
					break ;
			}
			$('#'+_this._id+'-basic').append("<p>    <span>▪</span>文件类型:  " + fileType + "</p>");
			$('#'+_this._id+'-basic').append("<p>    <span>▪</span>访问时间:  " + attr_['access_time']+ "</p>");
			$('#'+_this._id+'-basic').append("<p>    <span>▪</span>修改时间:  " + attr_['modify_time']+ "</p>");


			var power = '';
			var checkPower = function(power_){
				power = '';
				if (power_[0] == 'r') {power += '读'}
				if (power_[1] == 'w') {power += '写'};
				if (power_[2] == 'x') {power += '执行'}
				else if (power_[2] == 's') {power += '超级执行'};
				if (power != '') {power += '权限'};
			}
			var access_ = attr_['access'];
			checkPower(access_.substr(1,3));
			$('#'+_this._id+'-power').append("<p>    <span>▪</span>所有者:  " + attr_['uid'] + "</p>");
			$('#'+_this._id+'-power').append("<p> &nbsp;&nbsp;&nbsp;权限:  " +  power + "</p>");
			checkPower(access_.substr(4,3));
			$('#'+_this._id+'-power').append("<p>    <span>▪</span>用户组:  " + attr_['gid'] + "</p>");
			$('#'+_this._id+'-power').append("<p> &nbsp;&nbsp;&nbsp;权限:  " +  power + "</p>");
			checkPower(access_.substr(7,3));
			$('#'+_this._id+'-power').append("<p>    <span>▪</span> 其他:  </p>");
			$('#'+_this._id+'-power').append("<p> &nbsp;&nbsp;&nbsp;权限:  " +  power + "</p>");
		});
	},

	//show main div of property
	show:function(){
		if (typeof $('#' +desktop._rightObjId+ '-property')[0] == 'undefined') {
				Property.create(desktop._rightObjId);
			};
			var showDiv = $('#' +desktop._rightObjId+ '-property');
			showDiv.width(0);
			showDiv.height(0);
			showDiv.css('position','absolute');
			var left_ = $('#'+desktop._rightObjId).position().left + $('#'+desktop._rightObjId).width()/2;
			var top_ = $('#dock').position().top;
			showDiv.css('left',left_+'px');
			showDiv.css('top',top_+'px');
			showDiv.show();
			var box_width =$(window).width()/4;
			var box_height = $(window).height()/2;
			var th= $(window).height()/2-box_height/2;
			var h =document.body.clientHeight;
			var lw =$(window).width()/2-box_width/2;
			$('#' +desktop._rightObjId+ '-property').animate({top:th,opacity:'show',width:box_width,height:box_height,left:lw},500);
		}
});