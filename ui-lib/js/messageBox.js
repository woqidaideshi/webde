var MessageBox = Class.extend({
  init: function(id_, options_) {
    this._options = {
      width: 400,
      height: 250,
      close: true,
      max: false,
      min: false,
      hide: false,
      resize: false,
      fixed_pos: true,
      z_index: 9999,
      title: 'title'
    };
    //set options
    if (options_) {
      for (var key in options_) {
        this._options[key] = options_[key];
      }
    };
    this._id = id_; // record id

    this._win = Window.create('win' + this._id, this._options['title'], this._options);
    var marginLeft = $('#win' + this._id).outerWidth() / 2;
    var marginTop = $('#win' + this._id).outerHeight() / 2;
    $('#win' + this._id).css({
      top: '50%',
      left: '50%',
      position: 'fixed',
      display: 'block',
      'margin-left': -marginLeft,
      'margin-top': -marginTop,
      'z-index': '99999'
    });

    this._overlay = $('<div>', {
      'id': 'overlay_' + this._id,
      'class': "iw-modalOverlay"
    });
    $('body').append(this._overlay);
    this._overlay.css({
      display: 'block',
      width: '100%',
      height: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      'z-index': '1000'
    });

    this._overlay.bind('mousedown', function(ev) {
      ev.stopPropagation();
      ev.preventDefault();
    });

    if (this._options['close']) {
      var _this = this;
      var $closeBtn = $('#window-win' + this._id + '-close');
      $closeBtn.unbind().bind('click', function() {
        _this.close();
      });
    }
  },

  setButton: function(btns_) {
    if (btns_ === undefined || btns_.length === 0 || btns_.length > 3) {
      console.log('Error: parameters of function setButton are illegal.');
      return;
    }

    if (btns_.length === 1) {
      this._win.append('<div class="messageBox-btn"><button class="btn active" id="' + this._id + '_firstBtn">' + btns_[0].text + '</button></div>');
      $(document).on('click', '#' + this._id + '_firstBtn', btns_[0].clkaction);
    } else if (btns_.length === 2) {
      this._win.append('<div class="messageBox-btn two-btns first"><button class="btn active" id="' + this._id + '_firstBtn">' + btns_[0].text + '</button></div>');
      $(document).on('click', '#' + this._id + '_firstBtn', btns_[0].clkaction);

      this._win.append('<div class="messageBox-btn two-btns second"><button class="btn active" id="' + this._id +
        '_secondBtn">' + btns_[1].text + '</button></div>');
      $(document).on('click', '#' + this._id + '_secondBtn', btns_[1].clkaction);
    } else {
      this._win.append('<div class="messageBox-btn three-btns first"><button class="btn active" id="' + this._id + '_firstBtn">' + btns_[0].text + '</button></div>');
      $(document).on('click', '#' + this._id + '_firstBtn', btns_[0].clkaction);

      this._win.append('<div class="messageBox-btn three-btns second"><button class="btn active" id="' + this._id +
        '_secondBtn">' + btns_[1].text + '</button></div>');
      $(document).on('click', '#' + this._id + '_secondBtn', btns_[1].clkaction);

      this._win.append('<div class="messageBox-btn three-btns third"><button class="btn active" id="' +
        this._id + '_thirdBtn">' + btns_[2].text + '</button></div>');
      $(document).on('click', '#' + this._id + '_thirdBtn', btns_[2].clkaction);
    }
  },

  append: function(content_){
    this._win.append(content_);
  },

  close: function() {
    this._win.close();
    this._overlay.remove();
  }
});