//Tooltip libary 
var Tooltip = Class.extend({
  /**
   * [init Tooltip]
   * @param  {[jquery]} $target_ [used bind Event]
   * @param  {[string]} pos_    [flag postion: include top, bottom, left, right and cursor]
   * @return {[type]}          [tooltip obj]
   */
  init:function($target_, pos_){
    if (typeof $target_ === 'undefined') {
      console.log("argument err!!");
      return ;
    }
    this._title = "";
    this._tooltip = null;
    if (typeof pos_ === 'undefined')
      this._pos = 'cursor'; // pos include "top, bottom, left ,right and cursor";
    else this._pos = pos_;
    this._top = null;
    this._left = null;
    this._target = undefined;
    this.bindTarget($target_);
  },
/**
 * [setPosition set postion]
 * @param {[event]} ev [event]
 */
  calPosition:function(ev){
    var _this = this;
    var _targetWidth = $(ev.target).width();
    var _targetHeight = $(ev.target).height();
    var _width = $('#title-inner').width();
    var _height = $('#title-inner').height();
    //target position
    var _targetLeft = $(ev.target).offset().left;
    var _targetTop = $(ev.target).offset().top;
    switch(_this._pos){
      case "top":
        _this._top = _targetTop - _height - 5;
        _this._left = _targetLeft + (_targetWidth - _width)/2 -5;
        break;
      case "bottom":
        _this._top = _targetTop + _targetHeight -5 ;
        _this._left = _targetLeft + (_targetWidth - _width)/2 - 5;
        break;
      case "left":
        _this._top = _targetTop + (_targetHeight - _height)/2 - 5;
        _this._left = _targetLeft - _width -5 ;
        break;
      case "right":
        _this._top  = _targetTop + (_targetHeight - _height)/2 - 5;
        _this._left = _targetLeft + _targetWidth -5;
        break;
      default:
        _this._top = _targetTop + ev.offsetY + 10;
        _this._left = _targetLeft + ev.offsetX + 10;
        break;
    }
    $(".tooltip").css({"top" :(_this._top)+"px", "left" :(_this._left)+"px"});
  },

  setPosition:function(pos_){
    this._pos = pos_;
  },

  getTitle:function(){
    return this._title;
  },

  mouseOver:function(ev){
    if(ev.target.title !== ''){
      this._title = ev.target.title;
      this._target = ev.target;
      ev.target.title = '';
      this._tooltip = "<div class='tooltip'><div id='title-inner' class='tipsy-inner'>"+this._title+"</div></div>";
      $('body').append(this._tooltip);
      this.calPosition(ev);
      $(".tooltip").show('fast');
    }
  },

  mouseOut:function(){
    if (this._title === '') return ;
    if(typeof this._target !== "undefined"){
      this._target.title = this._title;
      this._title = '';
    }
    $(".tooltip").remove();
    this._target = undefined;
  },

  mouseMove:function(ev){
    this.calPosition(ev);
  }, 
/**
 * [bindTarget bind event to target]
 * @param  {[jquery]} $target_ [target]
 * @return {[null]} 
 */
  bindTarget:function($target_){
    var _this = this;
    $target_.mouseover(function(ev){
      _this.mouseOver(ev);
    }); 
    $target_.mouseout(function(){
      _this.mouseOut();
    }); 
    $target_.mousemove(function(ev){
      _this.mouseMove(ev);
    }); 
  }
});