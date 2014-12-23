
var ListView = Class.extend({
  init:function(id_, options_){
    this._options = {
      'width': '100%'
    };
    //set options
    if (options_) {
      for(var key in options_) {
        this._options[key] = options_[key];
      }
    };
    this._id = id_;     // record id
    this._listview = $('<ul>',{
      'id': this._id,
      'class': 'listview'
    });
    this._listview.css({
      'width': this._options.width
    });
  },

  addItem : function(data, $ul_){
    var $item = $('<li>');
    if (typeof data.id !== 'undefined'){
      $item.attr('id', data.id);
    }
    if (typeof data.href === 'undefined' || data.href === ''){
      $item.append('<a href="#"></a>');
    }
    else{
      $item.append('<a href="' + data.href + '"></a>');
    }
    if (typeof data.img !== 'undefined' && data.img !== ''){
      $item.find('a').append('<img src="' + data.img + '" />');
    }
    $item.find('a').append(data.text);

    if (typeof data.clkaction !== 'undefined'){
      var actiond = new Date(),
        actionID = 'event' + actiond.getTime() * Math.floor(Math.random() * 100000),
        eventAction = data.clkaction;
        $item.find('a').attr('id', actionID);
        if (typeof data.clkaction_p !== 'undefined'){
          $(document).on('click', '#' + actionID, data.clkaction_p, data.clkaction);
        }
        else{
          $(document).on('click', '#' + actionID, data.clkaction);
        }
    }

    if (typeof data.dblclkaction !== 'undefined'){
      var actiond = new Date(),
        actionID = 'event' + actiond.getTime() * Math.floor(Math.random() * 100000),
        eventAction = data.dblclkaction;
        $item.find('a').attr('id', actionID);
        if (typeof data.dblclkaction_p !== 'undefined'){
          $(document).on('dblclick', '#' + actionID, data.dblclkaction_p, data.dblclkaction);
        }
        else {
          $(document).on('dblclick', '#' + actionID, data.dblclkaction);
        }
    }

    if (typeof $ul_ === 'undefined') {
      this._listview.append($item);
    }
    else{
      $ul_.append($item);
    }
  },

  addSubItems : function(data){
    var $subItems = $('<li>');
    if (typeof data.id !== 'undefined'){
      $subItems.attr('id', data.id);
    }
    $subItems.append('<a href="#" class ="sub" tabindex="1"></a>');
    if (typeof data.img !== 'undefined' && data.img !== ''){
      $subItems.find('a').append('<img src="' + data.img + '" />');
    }
    $subItems.find('a').append(data.text);
    $subItems.append('<img alt="" />');

    if (typeof data.subitems !== 'undefined' && data.subitems.length !== 0){
      var len = data.subitems.length;
      var $ul = $('<ul>').css({
        'width':this._options.width
      });
      for (var i = 0; i !== len; i++){
        this.addItem(data.subitems[i], $ul);
      }
      $subItems.append($ul);
    }
    else{
      $subItems.append($('<ul>'));
    }

    this._listview.append($subItems);
  },

  addItems: function(items){
    var len = items.length;
    for (var i = 0; i < len; i++){
      switch(items[i].type){
        case 'item':
          this.addItem(items[i]);
          break;
        case 'subitems':
          this.addSubItems(items[i]);
          break;
        default:
          console.log('Error: unknown listview type');
          return;
      }
    }
  },

  remove: function(id){
    $('#' + id).remove();
  },

  attach: function(id){
    $('#' + id).append(this._listview);
    this._listview.show();
  },

  isEmptyOfSubItems: function(id){
    var len = $('#' + id).find('ul').find('li').length ;
    return len === 0 ? true : false;
  }
});
