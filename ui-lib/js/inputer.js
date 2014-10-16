//Inputer is a textarea for input text
var Inputer = Class.extend({
  /**
   * [init init Inputer: create a textarea and bindevent]
   * @param  {[type]} name_ [textarea's name]
   * @return {[type]}       [description]
   */
  init: function(name_) {
    if(typeof name_ === 'undefined') throw 'Desktop Inputer need a name!!';
    this._options = {
      left: '0',
      top: '0',
      width: '100',
      height: '32'
    };
    this._name = name_;
    _this = this;
    this.$input = $('<textarea>', {
      // 'type': 'text',
      'name': name_,
    }).css({
      'z-index': '9999',
      'display': 'none',
      'position': 'absolute',
      'font-size': 'small',
      'white-space': 'pre',
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      'resize': 'none',
      'overflow-y': 'hidden'
    });
    $('body').append(this.$input);

    _this.bindEvent(_this);
  },

  /**
   * [bindEvent bindEvent about textarea]
   * @param  {[type]} this_ [this obj]
   * @return {[type]}       [description]
   */
  bindEvent:function(this_){
    var _this = this_;
    $(document).on('mousedown', 'html', function(e) {
      _this.hide();
    }).on('contextmenu', 'html', function(e) {
      _this.hide();
    }).on('mousedown', '[name=' + _this._name + ']', function(e) {
      _this.$input[0].focus();
      _this.$input[0].select();
      e.stopPropagation();
    });

    window.addEventListener('blur',function(){
      _this.hide();
    },false);

    _this.$input.keyup(function(e) {
      if(e.which == 13) {//enter
        if(_this.$input.val() == '\n')
          _this.$input.hide();
        else 
          _this.hide();
      }
      if(e.which == 27) {//esc
          _this.$input.hide();
      }
      e.stopPropagation();
    }).keydown(function(e){
      e.stopPropagation();
    });
  },

  /**
   * [show show the Inputer follow options_]
   * @param  {[type]} options_ [options of textarea include: pos, size, oldtext, callback ]
   * @return {[type]}          [description]
   */
  show: function(options_) {
    if(typeof options_.callback !== 'function') {
      throw 'bad type of callback';
    }

    for(var key in options_) {
      this._options[key] = options_[key];
    }
    this.$input.css({
      'left': this._options.left,
      'top': this._options.top,
      'width': this._options.width,
      'height': this._options.height 
    });
    this.$input.val(this._options.oldtext).show();
    this.$input[0].focus();
    this.$input[0].select();
  },
  
  /**
   * [hide call the callback and hide the input]
   * @return {[type]} [description]
   */
  hide: function() {
    if(this._options.callback)
      this._options.callback.call(this, this.$input.val().replace(/\n/g, ''));
      this._options.callback = null;
      this.$input.hide();
  }
});
