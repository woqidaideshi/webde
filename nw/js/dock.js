//dock.js  for dock 
var Dock = Class.extend({
  init: function(){
    this._id = "dock";
    this._class = "dock";
    this._name = "dock";
    this._index = 0;
    this._reflect = null;
    this._dock = $('<div>', {
      'class': this._class,
      'id': this._id,
    });
    $('body').append(this._dock);

    this._DOCK_DIR = '/.local/share/dock';
    this._dockWatch = Watcher.create(this._DOCK_DIR);
    this._dockWatch.on('add', function(filename, stats) {
      //console.log('add:', filename, stats);
      var _filenames = filename.split('.');
      var _Dock = undefined;
      if(_filenames[0] == '') {
        return ;//ignore hidden files
      }
      if((!stats.isDirectory()) && _filenames[_filenames.length - 1] == 'desktop') {
        _Dock = DockApp;
      }
      if (typeof _Dock != 'undefined') {
        desktop.addAnAppToDock(_Dock.create('id-' + stats.ino.toString()
          , desktop._dock._index
          , desktop._dock._dockWatch.getBaseDir() + '/' + filename
        ));
      }
    });
    this._dockWatch.on('delete', function(filename) {
      //find entry object by path
      var _path = desktop._dock._dockWatch.getBaseDir() + '/' + filename;
      var _dockApp = desktop.getAWidgetByAttr('_path', _path);
      if(_dockApp == null) {
        console.log('Can not find this widget');
        return ;
      }
      desktop.deleteAnAppFromDock(_dockApp);
    });
    this._dockWatch.on('rename', function(oldName, newName) {
      console.log('rename:', oldName, '->', newName);
    });

  },

  bingEvent: function() {
    this.bindDrag(this._dock[0]);
  },

  getID: function() {return this._id;},

  setID: function(id_) {this._id = id_;},//needed?

  getName: function() {return this._name;},

  setName: function(name_) {
    //redraw dentry's name
    this._name = name_;
  },

  /**
   * [addReflect add Reflect]
   */
  addReflect:function(){
    var imgList = $('#dock div img');
    for (var i = imgList.length - 1; i >= 0; i--) {
      var _reflect = Reflection.create(imgList[i], {hasParentDiv: true});
      _reflect.add();
    }
    desktop._ctxMenu.activeItem('dock','remove reflect',function(){
      desktop._dock.removeReflect();
    });
    desktop._ctxMenu.disableItem('dock','add reflect');
  },

  /**
   * [removeReflect remove reflect]
   * @return {[type]} [description]
   */
  removeReflect:function(){
    var _divList = $('#dock div');
    for (var i = _divList.length - 1; i >= 0; i--) {
      $(_divList[i]).children('img')[0].style.cssText = '';
      $(_divList[i]).removeClass('reflect');
      $($(_divList[i]).children('canvas')[0]).remove();
    };
    desktop._ctxMenu.activeItem('dock','add reflect',function(){
      desktop._dock.addReflect();
    });
    desktop._ctxMenu.disableItem('dock','remove reflect');
  },

  bindDrag:function(target){
    target.ondragover = this.dragOver;
    target.ondrop = this.drop;
    target.ondragleave = this.dragleave;
  },

  /**
   * [dragOver mouse over dock when drag]
   * @param  {[type]} ev [mouse event]
   * @return {[type]}    [description]
   */
  dragOver: function(ev) {
    ev.preventDefault();
    ev.stopPropagation()
    var _id = ev.dataTransfer.getData("ID");
    //show insert position picture
    var _source = null;
    if (typeof desktop._widgets[_id] != 'undefined' && 
        desktop._widgets[_id]._type == 'dockApp') 
      _source=$('#'+_id);
    else if ((typeof desktop._widgets[_id] != 'undefined' &&
        desktop._widgets[_id]._type == 'app') || 
        ev.dataTransfer.files.length != 0) {
      if (typeof $('#insert')[0] == 'undefined') {
        _source = $('<div>',{
          'id': 'insert',
        });
        _source.html("<img src='img/insert.gif'/>" );
      }else _source = $('#insert');
    }
    else return;
    // 
    var _new_div = null;
    var _divList = $('#dock div');
    for (var i = 0; i < _divList.length+1; i++) {
      if (i == _divList.length) {
        _new_div = null;
        break;
      }
      if (_divList[i].id == _source[0].id) continue;
      var _div = $(_divList[i]);
      if (ev.clientX < _div.position().left + _div.width()/2) {
        _new_div = _div;
        break;
      };
    };
    if (_new_div == null ) 
      $('#dock').append(_source);
    else if (null != _new_div) 
      _new_div.before(_source);
  },

  dragleave:function(ev){
    if (ev.clientY < $('#dock').position().top) 
      {
        if (typeof $('#insert')[0] != 'undefined') 
          $('#insert').remove();
      }
  },

  drop: function(ev) {
    //if(ev.srcElement == ev.toElement) return ;
    ev.preventDefault();
    ev.stopPropagation();
    var _id = ev.dataTransfer.getData("ID");
    var _source = $('#'+_id);
    if (typeof desktop._widgets[_id] != 'undefined' &&
        desktop._widgets[_id]._type == 'dockApp') {
      var _divList = $('#dock div');
      for (var i = 0; i < _divList.length; i++) {
        desktop._widgets[_divList[i].id]._position.x = i;
      };
    } 
    else {
      var _divList = $('#dock div');
      for (var i = 0; i < _divList.length; i++) {
        if (_divList[i].id == 'insert') {
          $(_divList[i]).remove();
          desktop._dock._index = i;
          break ;
        } 
      }
      if(typeof desktop._widgets[_id] !== 'undefined' && 
      desktop._widgets[_id]._type == 'app' ){
      if (typeof $('#'+_id+'-dock')[0] !== 'undefined') {
        $('#insert').remove();
        alert("The App has been registed in dock");
        return ;
      }
      var _dentry = desktop._widgets[_id];
      var _path = _dentry._path;
      var _names = _path.split('/');
      var _name = _names[_names.length -1];

      var _fs = require('fs');
      _fs.rename(_path, desktop._dock._dockWatch.getBaseDir()+'/'+_name, function() {});
      } 
      else if(ev.dataTransfer.files.length != 0){
        var _files = ev.dataTransfer.files;
        var _fs = require('fs');
        for(var i = 0; i < _files.length; ++i) {
          var dst = desktop._dock._dockWatch.getBaseDir() + '/' + _files[i].name;
          if(_files[i].path == dst) continue;
          _fs.rename(_files[i].path, dst, function() {});
        }
        return ;
      }
    }
  }

});

//dock.js  for dock 
var DockApp = Class.extend({
  init: function(id_, x_, path_){
    if(typeof id_ === "undefined"
      || typeof x_ === "undefined"
      || typeof path_ === "undefined") {
      throw "Dock-APP: Not enough params!! Init failed!!";
    }
    this._id = id_+'-dock';
    this._name = id_ + '-dock';
    this._path = path_;
    this._type = "dockApp";
    this._position = {x:x_, y:0};

    this._execCmd = undefined;
    this._imgPath = undefined;
    this._exec = require('child_process').exec;

    this. _image = $('<img>',{
      'id':this._id+'-img',
      'draggable': 'false',
      'onselectstart': 'return false'
    });

    this._dockdiv = $('<div>',{
      'id':this._id,
      'draggable': 'true',
      'onselectstart': 'return false'
    });
    this._dockdiv.append(this._image);
  },

  /**
   * [show show app]
   * @return {[type]} [description]
   */
  show: function() {
    var _this = this;
    var divList = $('#dock div');
    if (divList.length < 1) $('#dock').append(_this._dockdiv);
    
    //arrange dock app 
    var insert = false;
    for (var i = 0; i < divList.length; i++) {
      if (_this._position.x <=  desktop._widgets[divList[i].id]._position.x && insert == false) {
        $(divList[i]).before(_this._dockdiv);
        insert = true;
      }
      if (desktop._widgets[divList[i].id]._position.x < i) desktop._widgets[divList[i].id]._position.x = i;
    }
    if (insert == false)  $('#dock').append(_this._dockdiv);
    
    utilIns.entryUtil.parseDesktopFile(_this._path, function(err_, file_) {
      if(err_){ 
        console.log(err_);
        return ;
      }
      //get launch commad
      _this._execCmd = file_['Exec'].replace(/%(f|F|u|U|d|D|n|N|i|c|k|v|m)/g, '')
        .replace(/\\\\/g, '\\');
      //get icon
      utilIns.entryUtil.getIconPath(file_['Icon'], 48, function(err_, imgPath_) {
        if(err_) {
          console.log(err_);
        } else {
          _this._imgPath = imgPath_[0];
          $('#' + _this._id+'-img').attr('src', _this._imgPath);
        }
      });
      //get name
      if(typeof file_['Name[zh_CN]'] !== "undefined") {
        _this._name = file_['Name[zh_CN]'];
      } else {
        _this._name = file_['Name'];
      }
      $('#' + _this._id+"-img").attr('title', _this._name);
    });
    // init Tooltip
    Tooltip.create($('#' + _this._id),"top");
    this.bindEvents();
    this._index = 0;
  },

  /**
   * [openApp run app]
   * @return {[type]} [description]
   */
  openApp: function(){
    var image = $('#'+this._id+'-img');

      //when don't open the app.
    console.log("click " + image[0].style.borderStyle);
    if ( image[0].style.borderStyle == "" || image[0].style.borderStyle=='none') {
      image.animate({width:"+=40px",height:"+=40px"},'fast')
          .animate({width:"-=40px",height:"-=40px"},'fast')
      $('.tooltip').animate({top:"-=40px"},'fast')
                 .animate({top:"+=40px"},'fast')
                 .animate({top:"-=40px"},'fast')
                 .animate({top:"+=40px"},'fast')
                 .animate({top:"-=40px"},'fast')
                 .animate({top:"+=40px"},'fast')
      image.css("border","outset");
      if (typeof require === 'function') {
              console.log("run " + this._execCmd);
              var result = this._exec(this._execCmd,function(err, stdout, stderr){
                      console.log('stdout: ' + stdout);
                      console.log('stderr: ' + stderr);
                      image.css("border","none");
                });
      }  
      else{
        console.log('run in browser');
        image.css("border","none");
      }
    }
  },

  bindEvents: function() {
    var img = $('#'+this._id+'-img');
    var target_ = this;
     //add onclick()
    img.click (function(ev){
      target_.openApp();
    });
    //forbid html mousedown and mouse up 
    $('#'+this._id).mousedown(function(e) {
      e.stopPropagation();
    }).mouseup(function(e) { 
      e.stopPropagation();
    }).mouseover(function(e){
      e.stopPropagation();
    });

    var dock = $('#dock');
    var imgList = $('#dock div img');
    var IMGART = 50; 
    var _imgMaxWidth = IMGART * 2;
    var _imgMaxHeight = IMGART * 2;
    var _distance = IMGART * 3.5;
    document.onmousemove = function (ev) {
      var ev = ev || window.event;
      var canvasList = $('#dock div canvas');
      var _divList = $('#dock div');
      for (var i = 0; i <imgList.length; i++) {
      var jqImg = $(imgList[i]);
      var a = ev.clientX - (jqImg.position().left+ jqImg.width() / 2);
      var b = ev.clientY - (jqImg.position().top +  jqImg.height() / 2 + dock.position().top);
      var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
      var spex = 1 - c / _distance;
      if (spex < 0.5) {
      spex = 0.5;
      }
      if (typeof canvasList[i] !== 'undefined') {
        canvasList[i].style.width = spex * (_imgMaxWidth) + 'px';
      }
      _divList[i].style.width = spex * (_imgMaxWidth) + 'px';
      imgList[i].style.width = spex * (_imgMaxWidth) + 'px';
      imgList[i].style.height = spex * (_imgMaxHeight) + 'px';
      }
    }

    desktop._ctxMenu.attachToMenu('#' + this._id
      , desktop._ctxMenu.getMenuByHeader('dock')
      ,function(id_){ desktop._rightObjId = id_});
    desktop._ctxMenu.disableItem('dock','remove reflect');
    this.bindDrag($('#'+this._id)[0]);
  },

  bindDrag:function(target){
    target.ondragstart = this.drag;
    target.ondragover = this.dragOver;
    target.ondrop = this.drop;
  },

  drag: function(ev) {
    $(ev.currentTarget)[0].title = this._name; 
    $('.tooltip').remove();
    console.log("drag start");
    ev.dataTransfer.setData("ID", ev.currentTarget.id);
    console.log(ev.dataTransfer.getData("ID"));
    ev.stopPropagation();
  },

  dragOver: function(ev) {
    ev.preventDefault();
  },

  drop:function(ev){
    ev.preventDefault();
  },



  getID: function() {return this._id;},

  setID: function(id_) {this._id = id_ + '-dock';},//needed?

  getName: function() {return this._name;},

  setName: function(name_) {
    //redraw dentry's name
    this._name = name_;
  },

  getPath: function() {return this._path;},

  setPath: function(path_) {
    //redraw dentry's name
    this._path = path_;
  }

});

