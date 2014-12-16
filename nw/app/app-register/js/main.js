var _app,
    $tab,
    $view,
    $view1;

function register(id_, path_, callback_) {
  console.log(id_, path_);
  /* setTimeout(function() { */
    // callback_(null);
  /* }, 1000); */
  _app.registerApp(function(err_) {
    if(err_) return callback_(err_);
    callback_(null);
  }, {
    id: id_,
    path: path_,
    local: true
  });
}

function unregister(id_, callback_) {
  console.log(id_);
  /* setTimeout(function() { */
    // callback_('mei zhao dao');
  /* }, 1000); */
  _app.unregisterApp(function(err_) {
    if(err_) return callback_(err_);
    callback_(null);
  }, id_);
}

function addToList(id_) {
  var $t = $('<div>', {
    class: 'content-row border right'
  }).html(
    '<span class="left">' + id_ + '</span>' +
    '<button class="btn active" id="unregister">注销</button>'
  );
  $view1.append($t);
  initAction1($t);
}

function show() {
  $view = $('<div>', {
    class: 'app-container'
  }).html(
    '<div class="content-row center">' +
    '<div>路径</div>：<div class="right-content">' +
    '<input style="display:none" type="file" name="file-selector" nwdirectory>' +
    '<input style="width:81.1%" type="text" name="app-path">' +
    '<button class="btn active" id="choose">选择</button>' +
    '</div>' +
    '</div>' +
    '<div class="content-row center">' +
    '<div>ID</div>：<input class="right-content" type="text" name="app-id">' +
    '</div>' +
    /* '<div class="content-row center">' + */
    // '路径为repo/workspace/app的相对路径(如: demo-rio/datamgr)' +
    /* '</div>' + */
    '<div class="content-row center">' +
    '<button class="btn disable" id="register">注册</button>' +
    '</div>'
  );
  $view1 = $('<div>', {
    class: 'app-container'
  }).html(
    '<div class="content-row msg"></div>'
  );
  _app.getRegisteredApp(function(err_, list_) {
    for(var i = 0; i < list_.length; ++i) {
      addToList(list_[i]);
    }
  });

  $tab = Tab.create('Tab', ['注册', '注销']);
  $tab.addDivByTab($view, '注册');
  $tab.addDivByTab($view1, '注销');
  $tab.injectParent($('body'));
  $tab.setShowByTab('注册');
}

function initAction() {
  var $appID = $view.find('input[name="app-id"]'),
      $fileSelectoer = $view.find('input[name="file-selector"]'),
      $appPath = $view.find('input[name="app-path"]'),
      $btnChoose = $view.find('#choose'),
      $btnRegister = $view.find('#register'),
      onInput = function() {
        if($appID.val() != '' && $appPath.val() != '') {
          $btnRegister.removeClass('disable').addClass('active').children('span').remove();
        } else {
          $btnRegister.removeClass('active').addClass('disable');
        }
      };
  $appID.on('input', onInput);
  $appPath.on('input', onInput);
  $fileSelectoer.on('change', function(v) {
    if(this.value) {
      $appPath.val(this.value);
      $appID.val('app-' + this.value.match(/[^\/]*$/)[0].replace(/[\.:]/g, '-'));
      onInput();
      $appPath.attr('title', this.value);
    }
  });
  $btnChoose.on('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $fileSelectoer[0].click()
  });
  $btnRegister.on('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $btnRegister.removeClass('active').addClass('disable').append($('<span>', {
      class: 'icon-spinner icon-spin'
    }));
    var ___id = $appID.val();
    register($appID.val(), $appPath.val(), function(err_) {
      var $span = $btnRegister.find('span');
      $span.removeClass('icon-spinner icon-spin');
      if(err_) {
        return $span.html('(注册失败:' + err_ + ')');
      }
      $span.html('(注册成功)');
      $appID.val('');
      $appPath.val('');
      addToList(___id);
    });
  });
}

function initAction1($target) {
  var $btnUnregister = $target.find('#unregister'),
      $appID1 = $target.find('span'),
      $msg = $view1.find('.content-row.msg');
  $btnUnregister.on('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $btnUnregister.removeClass('active').addClass('disable').append($('<span>', {
      class: 'icon-spinner icon-spin'
    }));
    unregister($appID1.html(), function(err_) {
      $btnUnregister.removeClass('disable').addClass('active').children('span').remove();
      if(err_) return $msg.html('(注销失败:' + err_ + ')');
      $target.remove();
      $msg.html('');
    })
  });
}

function startUp() {
  show();
  initAction();
}

// start point
$(document).ready(function() {
  WDC.requireAPI(['app'], function(app) {
    _app = app;
    startUp();
  });
});
