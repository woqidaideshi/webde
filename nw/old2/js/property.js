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
		this._objId = desktop._rightObjId;
		this._imgPath = undefined;
		//main div
		var _property = $('<div>', {
			'class': 'property',
			'id': id_+'-property',
			'z-index': '10000'
		});
		
		//title 
		var _property_title = $('<h2>',{
			'id': id_+ '-title',
			'text': desktop._widgets[id_]._name + ' ' + '属性'
		});
		_property.append(_property_title);

		this._tab = Tab.create('property-tab',['basic', 'power']);

		//_property.append(this._tab._tabShow);
		this._tab.injectParent(_property);

		var _property_icon = $('<div>', {
			'class': 'iconcontent',
			'id': this._id+'-icon'
		});
		this._tab.addDivByTab(_property_icon,'basic');

		var _property_img = $('<img>',{
			'class':'imgcontent',
			'id':this._id+'-imgproperty'
		});
		_property_icon.append(_property_img);

		var _property_basic_info = $('<div>', {
			'class': 'basicinfocontent',
			'id': this._id+'-basicinfo'
		});
		this._tab.addDivByTab(_property_basic_info,'basic');
		//button 
		var _property_close = $('<button>',{
			'class': 'btn',
			'id': this._id+'-close',
			'text': 'CLOSE'
		});
		_property_close.addClass('active');
		_property.append(_property_close);

		$('body').append(_property);
		//binding events to the div 
		this.bindEvents();
	},

	//bind events to div: include drag, tabs and close
	bindEvents:function(){
		var _this = this;

		//property animate and remove();
		$('#' +_this._id+ '-close').click(function(e){
			if (e.target.id.split('-')[0] !== 'event') {
				var _pos = {top:0,
					left:0};
				if (typeof $('#' + _this._objId).offset() !== 'undefined') {
					_pos = $('#' + _this._objId).offset();
				}else {
					_pos = $('#' + _this._id + '-icon').offset();
				}
				$('#'+_this._id+'-property').animate({top:_pos.top,opacity:'hide',width:0,height:0,left:_pos.left},500,function(){
					$(this).remove();
				});
			}
		});

		//drag function 
		$('#'+_this._id + '-title').mouseover(function(ev){
			$('#'+_this._id+'-title').css('cursor','move');
		});

		$('#'+_this._id + '-title').mousedown(function(ev){
			ev.stopPropagation();
			_this._isMouseDown = true;
			_this._offsetX = ev.offsetX;
			_this._offsetY = ev.offsetY;
			console.log('x:' +_this._offsetX + '  y: ' + _this._offsetY );
			$('#'+_this._id+'-property').fadeTo(20, 0.5);
		}).mouseup(function(ev){
			ev.stopPropagation();
			_this._isMouseDown = false;
			$('#'+_this._id+'-property').fadeTo(20, 1);
		});

		$('#' +this._id+'-property').mousedown(function(ev){
			ev.stopPropagation();
		}).mouseup(function(ev){
			ev.stopPropagation;
		});

		$(document).mousemove(function(ev){
		if(!_this._isMouseDown) return ;
		var x = ev.clientX - _this._offsetX; 
		console.log('ev.x: '+ev.clientX + '   this:x '+_this._offsetX + '  x: ' + x);
		var y = ev.clientY - _this._offsetY; 
		console.log('ev.y: '+ev.clientY + '   this:y '+_this._offsetY + '  y: ' + y);
		$('#'+_this._id+'-property').css("left", x);
		$('#'+_this._id+'-property').css("top", y);
		$('#'+_this._id+'-title').css('cursor','move');
		});
	},

	//show property inform into tab-basic and tab-power
	showAppProperty:function(){
		var _path = desktop._widgets[this._id]._path;
		var _this = this;
		if ($('#'+_this._id + '-basicinfo').children('p').length != 0) return ;
		//get some basic inform and write to tabbasic 
		utilIns.entryUtil.parseDesktopFile(_path, function(err_, file_) {
			if(err_) { 
				console.log(err_);
				return ;
			}
			var _comment = file_['Comment'];
			var _genericName = undefined;
			if (typeof file_['GenericName[zh_CN]'] != 'undefined') 
				genericName = file_['GenericName[zh_CN]'];
			else genericName = file_['GenericName'];
			_this._imgPath = file_['icon'];
			$('#'+_this._id+'-basicinfo').append("<p>    <span>▪</span>名称:          " + desktop._widgets[_this._id]._name + "</p>");
			$('#'+_this._id+'-basicinfo').append("<p>    <span>▪</span>命令:          " + desktop._widgets[_this._id]._execCmd + "</p>");
			$('#'+_this._id+'-basicinfo').append("<p>    <span>▪</span>描述:  " + _comment + "</p>");
			$('#'+_this._id+'-basicinfo').append("<p>    <span>▪</span>备注:  " + _genericName + "</p>");
			$('#'+_this._id+'-basicinfo').append("<p>    <span>▪</span>位置:  " + _path + "</p>");
			_this.showIcon(desktop._widgets[_this._id]._imgPath);
			_this.showBasicProperty();
			//get launch commad
			_this._tab.setShowByTab('basic');
		});
	},

	showBasicProperty:function(){
		var _path = desktop._widgets[this._id]._path;
		var _this = this;
		//get some basic inform and access inform
		utilIns.entryUtil.getProperty(_path, function(err_,attr_) {
			if (typeof attr_ == 'undefined') {
				console.log('get Property err');
				return ;
			}
			$('#'+_this._id+'-basicinfo').append("<p>    <span>▪</span>文件大小:  " + attr_['size'] + "</p>");
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
			$('#'+_this._id+'-basicinfo').append("<p>    <span>▪</span>文件类型:  " + fileType + "</p>");
			$('#'+_this._id+'-basicinfo').append("<p>    <span>▪</span>访问时间:  " + attr_['access_time']+ "</p>");
			$('#'+_this._id+'-basicinfo').append("<p>    <span>▪</span>修改时间:  " + attr_['modify_time']+ "</p>");


			var power = '';
			var checkPower = function(power_){
				power = '';
				if (power_[0] == 'r') {power += '读'}
				if (power_[1] == 'w') {power += '写'};
				if (power_[2] == 'x') {power += '执行'}
				else if (power_[2] == 's') {power += '超级执行'};
				if (power != '') {power += '权限'};
			}
			var _access = attr_['access'];
			checkPower(_access.substr(1,3));
			_this._tab.addDivByTab("<p>    <span>▪</span>所有者:  " + attr_['uid'] + "</p>",'power');
			_this._tab.addDivByTab("<p> &nbsp;&nbsp;&nbsp;权限:  " +  power + "</p>",'power');
			checkPower(_access.substr(4,3));
			_this._tab.addDivByTab("<p>    <span>▪</span>用户组:  " + attr_['gid'] + "</p>",'power');
			_this._tab.addDivByTab("<p> &nbsp;&nbsp;&nbsp;权限:  " +  power + "</p>",'power');
			checkPower(_access.substr(7,3));
			_this._tab.addDivByTab("<p>    <span>▪</span> 其他:  </p>", 'power');
			_this._tab.addDivByTab("<p> &nbsp;&nbsp;&nbsp;权限:  " +  power + "</p>", 'power');
		});
	},

	showIcon:function(path_){
		$('#' + this._id+'-imgproperty').attr('src', path_);
	},

	//show main div of property
	show:function(){
		if ($('#' +desktop._rightObjId+ '-property').is(":visible") == false) {
			var showDiv = $('#' +desktop._rightObjId+ '-property');
			showDiv.width(0);
			showDiv.height(0);
			showDiv.css('position','absolute');
			var left_ = $('#'+desktop._rightObjId).offset().left + $('#'+desktop._rightObjId).width()/2;
			var top_ = $('#'+desktop._rightObjId).offset().top + $('#'+desktop._rightObjId).height()/2;
			showDiv.css('left',left_+'px');
			showDiv.css('top',top_+'px');
			showDiv.show();
			var box_width =$(window).width()/4;
			var box_height = $(".property .tab-show .tab-content").height()*3/2.1;
			var top_property= $(window).height()/2-box_height/2;
			var left_property =$(window).width()/2-box_width/2;
			$('#' +desktop._rightObjId+ '-property').animate({top:top_property,opacity:'show',width:box_width,height:box_height,left:left_property},500);
		}
	}
});