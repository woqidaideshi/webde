var Tab = Class.extend({
  init:function(_id, _tabs, _pos, _size){
    if (!(_id && _tabs)) {
      console.log("id and json can't be null");
      return;
    };
    this._top = '0px';
    this._left = '0px';
    this._width = '100%';
    this._height = '100%';

    if (_pos) {
      this._top = _pos.top;
      this._left = _pos.left; 
    };

    if (_size) {
      this._width = _size._width;
      this._height = _size._height;
    };

    this._tabShow = $("<div>",{
      "class": 'tab-show'
    });

    this._tabDiv = $("<div>",{
      "class": 'tab-div'
    });
    this._tabShow.append(this._tabDiv);

    for (var i = 0; i < _tabs.length; i++) {
      var _id = "tab-"+Math.ceil(Math.random()*100000);
      var _div = $('<div>',{
        'class': 'tab-content',
        'id': _id
      });
      this._tabShow.append(_div);
      _div.hide();
      var _a = "<a href='#"+_id+"'>"+_tabs[i]+"</a>";
      this._tabDiv.append(_a);
    };
    this.bindEvent();
  },

  addDivByTab:function(target_, tab_){
    var _contents = this._tabShow.children('.tab-content');
    var _as = this._tabDiv.children('a');
    for (var i = 0; i < _as.length; i++) {
      if (_as[i].textContent !== tab_) {
        continue;
      };
      var _div = $(_contents[i]);
      _div.append(target_);
    };
  },

  setShowByTab:function(tab_){
    var _contents = this._tabShow.children('.tab-content');
    var _as = this._tabDiv.children('a');
    for (var i = 0; i < _as.length; i++) {
      if (_as[i].textContent !== tab_) {
        $(_contents[i]).hide();
        continue;
      };
      $(_as[i]).addClass("selected");
      $(_contents[i]).show();
    };
  },

  injectParent:function($parent_){
    $parent_.append(this._tabShow);
  },

  bindEvent:function(){
    var _this = this;
    // tabs 
    $(function() {  
      var tabhosts = $(_this._tabDiv.children('a')); 
      tabhosts.each(function() {
        $($(this).attr("href")).slideUp();
        if ($(this).hasClass("selected")) {
          $($(this).attr("href")).slideDown();  
        }    
        $(this).mousedown(function(event) {  
          event.preventDefault();    
          if (!$(this).hasClass("selected")) {  
            tabhosts.each(function() {  
              $(this).removeClass("selected");  
              $($(this).attr("href")).slideUp(500);  
            });  
            $(this).addClass("selected");  
            $($(this).attr("href")).slideDown(500);  
          }  
        });  
      });  
    });  
  }
});