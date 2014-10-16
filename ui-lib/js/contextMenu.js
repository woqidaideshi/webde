
var ContextMenu = Class.extend({
  init: function(options_) {
    this._options = {
      fadeSpeed: 100,
      filter: function ($obj) {
        // Modify $obj, Do not return
      },
      above: 'auto',
      preventDoubleContext: true,
      compress: false
    };
    this._menus = [];

    for(var key in options_) {
      this._options[key] = options_[key];
    }

    var _this = this;
    $(document).on('mouseup', 'html', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if(e.which == 1)
        _this.hide();
    });
    if(this._options.preventDoubleContext) {
      $(document).on('contextmenu', '.dropdown-context', function (e) {
        e.preventDefault();
      });
    }
    $(document).on('mouseenter', '.dropdown-submenu', function(){
      var $sub = $(this).find('.dropdown-context-sub:first'),
        subWidth = $sub.width(),
        subLeft = $sub.offset().left,
        collision = (subWidth + subLeft) > window.innerWidth;
      if(collision){
        $sub.addClass('drop-left');
      }
    });
  },

  getMenuByHeader: function(header_) {
    return this._menus['dropdown-' + header_];
  },
  
  addItem: function($menu_, item_, $index_) {
    var linkTarget = '';
    if (typeof item_.divider !== 'undefined') {
      if (typeof $index_ !== 'undefined') 
        $index_.after('<li class="divider"></li>');
      else 
        $menu_.append('<li class="divider"></li>');
    } else if (typeof item_.header !== 'undefined') {//should be added just once!!
      if (typeof $index_ !== 'undefined') 
        $index_.after('<li class="nav-header">' + item_.header + '</li>');
      else 
      $menu_.append('<li class="nav-header">' + item_.header + '</li>');
    } else {
      if (typeof item_.href == 'undefined') {
        item_.href = '#';
      }
      if (typeof item_.target !== 'undefined') {
        linkTarget = ' target="' + item_.target + '"';
      }
      if (typeof item_.subMenu !== 'undefined') {
        if (typeof item_.icon !== 'undefined') {
          $sub = ('<li class="dropdown-submenu active"><a class="width-icon" tabindex="-1" href="' + item_.href + '">' 
            + '<i class= \'' + item_.icon + '\'></i><span>  </span>' + item_.text + '</a></li>');
        }else {
          $sub = ('<li class="dropdown-submenu active"><a class="widthout-icon" tabindex="-1" href="' + item_.href + '">' 
              + item_.text + '</a></li>');
        }
      } else {
        if (typeof item_.icon !== 'undefined') {
          $sub = $('<li class="active"><a class="width-icon" tabindex="-1" href="' + item_.href + '"' + linkTarget + '>' 
              + '<i class= \'' + item_.icon + '\'></i><span>  </span>' + item_.text + '</a></li>');
        } else {
          $sub = $('<li class="active"><a class="widthout-icon" tabindex="-1" href="' + item_.href + '"' + linkTarget + '>' 
              + item_.text + '</a></li>');
        }
      }
      if (typeof item_.action !== 'undefined') {
        var actiond = new Date(),
          actionID = 'event-' + actiond.getTime() * Math.floor(Math.random()*100000),
          eventAction = item_.action;
        $sub.find('a').attr('id', actionID);
        $('#' + actionID).addClass('context-event');
        $(document).on('mousedown', '#' + actionID, function(e) {
          e.preventDefault();
          e.stopPropagation();
        }).on('mouseup', '#' + actionID, eventAction)
        .on('click', '#' + actionID, function(e) {
          e.preventDefault();
          e.stopPropagation();
        });
      }
      if (typeof $index_ !== 'undefined') 
        $index_.after($sub);
      else 
        $menu_.append($sub);
      if (typeof item_.subMenu != 'undefined') {
        var subMenuData = this.addCtxMenu(item_.subMenu, true);
      if (typeof $index_ !== 'undefined') 
        $index_.next().append(subMenuData);
      else 
        $menu_.find('li:last').append(subMenuData);
      }
    }
    if (typeof this._options.filter == 'function') {
      if (typeof $index_ !== 'undefined') 
        this._options.filter($menu_.find('li:last'));
        //this._options.filter($index_.next());
      
    }
  },

  addCtxMenu: function(data, subMenu) {
    var subClass = '';
    var compressed = this._options.compress ? ' compressed-context' : '';
    if(subMenu) {
      subClass = ' dropdown-context-sub';
    } else {
      $('.dropdown-context').fadeOut(this._options.fadeSpeed, function(){
        $('.dropdown-context').css({display:''}).find('.drop-left').removeClass('drop-left');
      });
    }
    var _id = 'dropdown-' + data[0].header;
    var $menu = $('<ul class="dropdown-menu dropdown-context' 
        + subClass + compressed + '" id="' + _id + '"></ul>');
    for(var i = 0; i < data.length; ++i) {
      this.addItem($menu, data[i]);
    }
    $('body').append($menu);
    this._menus[_id] = $menu;
    return $menu;
  },

  removeMenuByHeader: function(header_) {
    this._menus['dropdown-' + header_].remove();
    delete this._menus['dropdown-' + header_];
  },

  getItemByText:function($menu_, text_){
    var _items = $menu_.children('li');
    for (var i = 0; i < _items.length; i++) {
      if(_items[i].textContent.replace('  ','') === text_)
        return $(_items[i]);
    }
    return undefined;
  },

  removeItem:function($item_){
    $item_.remove();
  },

  hasItem:function($menu_, item_){
    var _items = $menu_.children('li');
    for (var i = 0; i < _items.length; i++) {
      if(_items[i].textContent === item_.text)
        return true;
    }
    return false;
  },

  show: function($menu_, left_, top_) {
    $('.dropdown-context:not(.dropdown-context-sub)').hide();
    
    $menu_.css({
      top: top_,
      left: left_
    }).fadeIn(this._options.fadeSpeed);
  },

  hide: function() {
    $('.dropdown-context').fadeOut(this._options.fadeSpeed, function() {
      $('.dropdown-context').css({display:''}).find('.drop-left').removeClass('drop-left');
    });
  },

  attachToMenu: function(selector_, $menu_, function_) {
    var _this = this;
    $(document).on('contextmenu', selector_, function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("selector: " + selector_);
      if (e.target.tagName !== 'HTML') {
        if (typeof function_ == 'function') {
          function_(selector_.replace('#',''), $menu_);
        };
      }
      var w = $menu_.width();
      var h = $menu_.height();
      left_ = (document.body.clientWidth < e.clientX + w) 
              ? (e.clientX - w) : e.clientX;
      top_ = ($(document).height()< e.clientY + h + 25) 
              ? (e.clientY-h-10)  : e.clientY;
      _this.show($menu_, left_, top_);
    });
  },

  detachFromMenu: function(selector_, $menu_) {
    $(document).off('contextmenu', selector_);
  },

  activeItem: function(header_, text_, eventAction_) {
    var _menuli = this.getItemByText(
        this.getMenuByHeader(header_), text_);
    if (typeof _menuli == 'undefined') return ;
    _menuli.removeClass('disabled');
    _menuli.addClass('active');
    var _aId = $(_menuli).children('a')[0].id;
    if ((typeof _aId !== 'undefined' || _aId !== '') && typeof eventAction_ !== 'undefined') {
      $('#' + _aId).addClass('context-event');
      $(document).off('mouseup', '#' + _aId);
      $(document).on('mouseup', '#' + _aId, eventAction_);
    }
    return ;
  },

  disableItem: function(header_, text_) {
    var _menuli = this.getItemByText(
        this.getMenuByHeader(header_), text_);
    if (typeof _menuli == 'undefined') return ;
    _menuli.removeClass('active');
    _menuli.addClass('disabled');
    var _aId = $(_menuli).children('a')[0].id;
    $('#' + _aId).removeClass('context-event');
    $(document).off('mouseup', '#' + _aId);
    $(document).on("mouseup", '#' + _aId, function(e){
      e.preventDefault();
    }) ;
    return ;
  },

  isDisabledItem:function(header_, text_){
    var _menuli = this.getItemByText(
        this.getMenuByHeader(header_), text_);
    if (typeof _menuli == 'undefined') return null;
    return _menuli.hasClass('disabled');
  }
});