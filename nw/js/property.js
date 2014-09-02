var Property = Class.extend({
	init: function(id_){
		this._id = id_;
		this._isMouseDown = false;
		this._offsetX = 0;
		this._offsetY = 0;
		var _property = $('<div>', {
			'class': 'property',
			'id': id_+'-property'
		});
		var _property_title = $('<h2>',{
			'id': id_+ '-title',
			'text': desktop._widgets[id_]._name + ' ' + 'property'
		});

		_property.append(_property_title);
		var _property_show = $('<div>', {
			'class': 'property-show'
		});

		_property.append(_property_show);
		var _property_tabs  = "<div id='" +this._id+"-tabs' class='property-tabs'><a href='#"+ this._id +"-basic'>basic</a><a href='#"+this._id+"-power'>power</a></div>";
		_property_show.html(_property_tabs);

		var _property_tab1 =  $('<div>', {
			'class': 'tabcontent',
			'id': this._id+'-basic'
		});
		_property_show.append(_property_tab1);
		var _property_tab2 =  $('<div>', {
			'class': 'tabcontent',
			'id': this._id+'-power'
		});
		_property_show.append(_property_tab2);
		var _property_close = $('<button>',{
			'class': 'property-close',
			'id': this._id+'-close',
			'text': 'CLOSE'
		});
		_property.append(_property_close);

		$('body').append(_property);
		this.showAppProperty();

		this.bindEvents();
	},

	bindEvents:function(){
		var _this = this;
		// tabs 
		$(function() {  
        	//var tabhosts = $(".property-tabs a");  
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
                    		console.log(this.text);
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

		$('#'+_this._id + '-title').mousemove(function(ev){
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
	}

});