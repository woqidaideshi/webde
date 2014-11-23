var PlayList = Class.extend({
  init:function(list_,options_){
    this._options = {
      search: true,
      title : 'video list:',
      callback_: undefined,
      img : 'img/bulb.png'
    }
    if (options_) {
      for(var key in options_)
        this._options[key] = options_[key]
    };
    this._playList = {};
    if (list_) {
      this._playList = list_;
    }
    this._bkgDiv = $('<div>', {
      'class': "post__toc-trigger"
    });
    this._listviewContent = $('<div>',{
      'class' : 'post__toc'
    });
    this._bkgDiv.append(this._listviewContent);
    if (this._options.search) {
      this.addTitle('Search:');
      this._input = $('<input>',{
        'id' : 'search-play',
        'type' : 'text'
      });
      this.addTitle(this._input);
    };
    if (this._options.title) {
      this.addTitle(this._options.title);
    };
    this._listview = ListView.create('playlist');
    this._listview.attach(this._listviewContent);
    this.setPlayList();
    $('body').append(this._bkgDiv);
  },

  addTitle:function(obj_){
    var _span = $('<span>',{
      'class' : 'post__toc-title'
    });
    this._listviewContent.append(_span);
    if (typeof obj_ === 'string') {
      _span.text(obj_);
    } else {
      _span.append(obj_);
    }
  },

  setPlayList:function(){
    var _this = this;

    var selectItem = function(li_){
      if( li_ == null ) return alert("No match!");
      var _select = li_.selectValue;
      if (_this._playList[_select]) {
        _this._options.callback_(_this._playList[_select]);
      };
    };

    var _playArr = [];
    for(var key in this._playList){
      _playArr.push(key); 
      var _item = [{
        id: key,
        type: 'item',
        text: key,
        img: _this._options.img,
        clkaction: function(){
          _this._options.callback_(_this._playList[this.text]);
        }
      }]
      _this._listview.addItems(_item);
    }
    AutoComplete.create(this._input,_playArr,{
      delay:10,
      minChars:1,
      matchSubset:1,
      onItemSelect: selectItem,
      autoFill:true,
      maxItemsToShow:6,
      selectFirst: true
    });
  },

  getName:function(path_){
    var _Arr = path.split('\\');
    return _Arr[_Arr.length - 1];
  }
});

