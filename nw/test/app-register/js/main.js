var _app,
    $view;

function register() {
}

function show() {
  var $
  $view.append()
}

function initAction() {
}

function startUp() {
  show();
  initAction();
}

// start point
WCD.requireAPI(['app'], function(app) {
  _app = app;
  $view = $('body');
  startUp();
});
