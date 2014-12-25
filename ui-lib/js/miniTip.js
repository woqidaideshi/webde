var MiniTip = Class.extend({
  init: function(id_, options_) {
    // declare the default option values
    this._options = {
      title: '', // if left blank, no title bar will show
      content: 'blank', // the content of the tooltip
      delay: 300, // how long to wait before showing and hiding the tooltip (ms)
      anchor: 'n', // n (top), s (bottom), e (right), w (left)
      event: 'custom', // can be 'hover' , 'click' or 'custom'
      fadeIn: 200, // speed of fade in animation (ms)
      fadeOut: 200, // speed of fade out animation (ms)
      aHide: true, // set to false to only hide when the mouse moves away from the anchor and tooltip
      maxW: '250px', // max width of tooltip
      offset: 5 // offset in pixels of stem from anchor
    };

    //set options
    if (options_) {
      for (var key in options_) {
        this._options[key] = options_[key];
      }
    };
    
    this._id = id_; // record id
    var $attach = $('#' + this._id);
    $attach.miniTip(this._options);

    if (this._options.event === 'hover') {
      $attach.hover(function() {
        $attach.hello();
      }, function() {
        $attach.bye();
      });
    } else if (this._options.event === 'click') {
      $attach.click(function() {
        $attach.hello();
        var tt_w = $('#miniTip');
        $('html').unbind('click').click(function(e) {
          if (tt_w.css('display') == 'block' && !$(e.target).closest('#miniTip').length) {
            $('html').unbind('click');
            $attach.bye();
          }
        });
      });
    } 
  },

  show: function(options_) {
    var $attach = $('#' + this._id);
    if (options_ !== undefined) {
      $attach.change(options_);
    }
    $attach.hello();
  },

  hide: function() {
    var $attach = $('#' + this._id);
    $attach.bye();
  }
});



(function($) {
  $.fn.miniTip = function(o) {
    this.data('o', o);

    // declare the delay variable and make sure it is global
    window.delay = false;

    // add the tip elements to the DOM
    if (!$('#miniTip')[0]) {
      $('body').append('<div id="miniTip"><div id="miniTip_t"></div><div id="miniTip_c"></div><div id="miniTip_a"></div></div>');
    }
  }

  $.fn.hello = function() {
    var o = this.data('o');
    var el = $(this);

    var tt_w = $('#miniTip');
    var tt_t = $('#miniTip_t');
    var tt_c = $('#miniTip_c');
    var tt_a = $('#miniTip_a');

    // add in the content
    tt_c.html(o.content);

    // insert the title (or hide if none is set)
    if (o.title != '')
      tt_t.html(o.title).show();
    else
      tt_t.hide();

    // reset arrow position
    tt_a.removeAttr('class');

    // make sure the tooltip is the right width even if the anchor is flush to the right of the screen
    // set the max width
    tt_w.hide().width('').width(tt_w.width()).css('max-width', o.maxW);

    // add support for image maps
    var isArea = el.is('area');
    if (isArea) {
      // declare variables to determine coordinates
      var i,
        x = [],
        y = [],
        c = el.attr('coords').split(',');

      // sortin funciton for coordinates
      function num(a, b) {
        return a - b;
      }

      // loop through the coordinates and populate x & y arrays
      for (i = 0; i < c.length; i++) {
        x.push(c[i++]);
        y.push(c[i]);
      }

      // get the center coordinates of the area
      var mapImg = el.parent().attr('name'),
        mapOff = $('img[usemap=\\#' + mapImg + ']').offset(),
        left = parseInt(mapOff.left, 10) + parseInt((parseInt(x.sort(num)[0], 10) + parseInt(x.sort(num)[x.length - 1], 10)) / 2, 10),
        top = parseInt(mapOff.top, 10) + parseInt((parseInt(y.sort(num)[0], 10) + parseInt(y.sort(num)[y.length - 1], 10)) / 2, 10);
    } else {
      // get the coordinates of the element
      var top = parseInt(el.offset().top, 10),
        left = parseInt(el.offset().left, 10);
    }

    // get width and height of the anchor element
    var elW = isArea ? 0 : parseInt(el.outerWidth(), 10),
      elH = isArea ? 0 : parseInt(el.outerHeight(), 10),

      // get width and height of the tooltip
      tipW = tt_w.outerWidth(),
      tipH = tt_w.outerHeight(),

      // calculate position for tooltip
      mLeft = Math.round(left + Math.round((elW - tipW) / 2)),
      mTop = Math.round(top + elH + o.offset + 8),

      // position of the arrow
      aLeft = (Math.round(tipW - 16) / 2) - parseInt(tt_w.css('borderLeftWidth'), 10),
      aTop = 0,

      // figure out if the tooltip will go off of the screen
      eOut = (left + elW + tipW + o.offset + 8) > parseInt($(window).width(), 10),
      wOut = (tipW + o.offset + 8) > left,
      nOut = (tipH + o.offset + 8) > top - $(window).scrollTop(),
      sOut = (top + elH + tipH + o.offset + 8) > parseInt($(window).height() + $(window).scrollTop(), 10),

      // default anchor position
      elPos = o.anchor;

    // calculate where the anchor should be (east & west)
    if (wOut || o.anchor == 'e' && !eOut) {
      if (o.anchor == 'w' || o.anchor == 'e') {
        elPos = 'e';
        aTop = Math.round((tipH / 2) - 8 - parseInt(tt_w.css('borderRightWidth'), 10));
        aLeft = -8 - parseInt(tt_w.css('borderRightWidth'), 10);
        mLeft = left + elW + o.offset + 8;
        mTop = Math.round((top + elH / 2) - (tipH / 2));
      }
    } else if (eOut || o.anchor == 'w' && !wOut) {
      if (o.anchor == 'w' || o.anchor == 'e') {
        elPos = 'w';
        aTop = Math.round((tipH / 2) - 8 - parseInt(tt_w.css('borderLeftWidth'), 10));
        aLeft = tipW - parseInt(tt_w.css('borderLeftWidth'), 10);
        mLeft = left - tipW - o.offset - 8;
        mTop = Math.round((top + elH / 2) - (tipH / 2));
      }
    }

    // calculate where the anchor should be (north & south)
    if (sOut || o.anchor == 'n' && !nOut) {
      if (o.anchor == 'n' || o.anchor == 's') {
        elPos = 'n';
        aTop = tipH - parseInt(tt_w.css('borderTopWidth'), 10);
        mTop = top - (tipH + o.offset + 8);
      }
    } else if (nOut || o.anchor == 's' && !sOut) {
      if (o.anchor == 'n' || o.anchor == 's') {
        elPos = 's';
        aTop = -8 - parseInt(tt_w.css('borderBottomWidth'), 10);
        mTop = top + elH + o.offset + 8;
      }
    }

    // if it is going to go off on the sides, use corner
    if (o.anchor == 'n' || o.anchor == 's') {
      if ((tipW / 2) > left) {
        mLeft = mLeft < 0 ? aLeft + mLeft : aLeft;
        aLeft = 0;
      } else if ((left + tipW / 2) > parseInt($(window).width(), 10)) {
        mLeft -= aLeft;
        aLeft *= 2;
      }
    } else {
      if (nOut) {
        mTop = mTop + aTop
        aTop = 0;
      } else if (sOut) {
        mTop -= aTop;
        aTop *= 2;
      }
    }

    // position the arrow
    tt_a.css({
      'margin-left': aLeft + 'px',
      'margin-top': aTop + 'px'
    }).attr('class', elPos);

    // clear delay timer if exists
    if (delay) clearTimeout(delay);

    // position the tooltip and show it
    delay = setTimeout(function() {
      tt_w.css({
        "margin-left": mLeft + "px",
        "margin-top": mTop + 'px'
      }).stop(true, true).fadeIn(o.fadeIn);
    }, o.delay);

  }

  $.fn.bye = function() {
    var o = this.data('o');
    var tt_w = $('#miniTip');
    tt_w.stop(true, true).fadeOut(o.fadeOut);
  }

  $.fn.change = function(o) {
    for (var key in o) {
      this.data('o')[key] = o[key];
    }
  }
})(jQuery);