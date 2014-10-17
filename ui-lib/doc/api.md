UI-lib-api
==========
UI-lib 是提供相关UI设计的库文件，其中包含样式表以及相关插件调用api使用方法。

本文主要说明ui-lib 提供的api解释说明以及api调用方法说明。

使用UI-lib要载入css和js文件，以及复制font文件，
<pre>
<code>
  link rel="stylesheet" type="text/css" href="css/demoUI.css"
  link rel="stylesheet" type="text/css" href="css/demoUItheme.css"
  link rel="stylesheet" type="text/css" href="css/demoUIFont.css"

  script type="text/javascript" src="lib/jquery-2.1.1.min.js"
  script type="text/javascript" src="lib/UI-lib/dist/js/demoUI.js"
</code>
</pre>

复制font文件夹及内容以及img/close.png
项目目录如下：
<pre>
<code>
./
 |-css-...
 |-js-...
 |-font-...
 |-img
    |-close.png
 |-lib-...
</code>
</pre>

1、tooltip:
========
工具提示用于提示所选元素的title内容，具体使用方法如下：
<strong>A.用法：</strong><br />
  在使用tooltip工具前请确认加载jquery.js和tooltip.js，以及项目中common.js，
然后使用如下方式使用tooltip
  首先：建立一个带有title的元素如图片：
<pre>
<code>
  img title='picture-title' id='test-img' src="/img/clock.png"/
</code>
</pre>
<br />
  然后：向这个图片元素建立一个tooltip
<pre>
<code>	
  Tooltip.create($('#test-img'),"top");
</code>
</pre>

<strong>B.函数及参数说明</strong><br />
  本tooltip显示的是元素的title内容，如果没有title则不显示，
  方法有：
<pre>
<code>
  Tooltip.create($target_, pos_);	//创建tooltip并绑定到$target_上，
  $target_：待绑定tooltip的元素对象，为jquery对象，
  pos_：显示tooltip的位置，此处提供5个位置供选择，
    a."top":显示在元素的正上
    b."bottom":显示在元素的正下方
    c."left":显示在元素的左方
    d."right":显示在元素的右方
    e."cursor":跟随光标移动。
</code>
</pre>

2、messenger：
==========
消息提示工具栏，从hubspot/messenger移植过来，主要完成工作是将sass该写为less语法
<strong>使用方法：</strong><br />
	在坐下方显示一个提示：
<pre>
<code>
	Messenger().post("plugin zoom in");
</code>
</pre>
	设置显示位置：
<pre>
<code>
  Messenger.options = {
    //设置为左上角显示;
    extraClasses: 'messenger-fixed messenger-on-left messenger-on-top';
  }
</code>
</pre>
  更多使用方法参见messenger的官方网站：
[messenger官方网站] (http://github.hubspot.com/messenger)
  github网址：
[github网址](https://github.com/HubSpot/messenger)

3、contextMenu：
============
右键菜单，可以在任意元素上设置右键菜单，设置方法是：
<pre>
<code>
  //新建一个对象
  this._ctxMenu = ContextMenu.create();
  //增加一个菜单项
 this._ctxMenu.addCtxMenu([
    {header: 'desktop'},	                                                                                                         //头标题
    {text:'create Dir', icon:'icon-folder-close-alt' ,action:function(e){   //菜单一个条目，text 显示的文字， icon：图标，action::点击响应函数
      ....
    }},
    {text:'messenger set',icon: 'icon-cog', subMenu:[    //子菜单，鼠标放上显示的菜单，与主菜单定义方法相同。
    {header: 'messenger set'},
      {...}...
    }
  ]);
</code>
</pre>

  定义好菜单之后在绑定菜单项与元素：
<pre>
<code>
  desktop._ctxMenu.attachToMenu('#' + this._id     //this._id，绑定元素的id
    , desktop._ctxMenu.getMenuByHeader('plugin')   //通过contextMenu提供的方法getMenuByHeader('plugin')获取相应的菜单
    ,function(id_){ desktop._rightObjId = id_});   //右键点击元素时，响应函数
</code>
</pre>

<pre>
<code>
  contextMenu的api接口：
    getMenuByHeader('header')                      //通过菜单的头标题获取菜单
    addItem($menu_, item_, $index_)                //向菜单$menu_, 添加item_， 位置在$index_后边，没有$index_（为item对象）则添加到最后
    addCtxMenu(data,subMenu)                       //向菜单subMenu添加数据data是上边定义的数组
    removeMenuByHeader(header)                     //通过头文件删除菜单。
    getItemByText($menu_, text_)                   //在$menu_中获取text_的item
    hasItem($item_)                                //判断是否有这个item
    attachToMenu(selector_, $menu_, function_)     //向元素selector_中注册右键菜单，菜单弹出时的响应函数为function_
    activeItem(header_, text_，eventAction_)       //设置菜单header_的text_ item可点击 ，响应函数为eventAction_
    disableItem(header_, text_)                    //设置菜单header_的text_ item不可点击
    isDisabledItem(header_, text_)                 //判断菜单header_的text_ item是否不可点击，不可点击true，可点击false，没有这个item返回null;
</code>
</pre>

4、font-awesome图标库
==========
  本UI库的图标使用的是font-awesome的图标库，其特点是将图标打包成字体文件，通过读取字体文件来载入各个图标。
  使用方法：
  在需要添加图标的位置写入
<pre>
<code>
  a href='http://www.bootcss.com/p/font-awesome/#icons-new'>i class='icon-user'>i> /a> //其中icon-user是要添加图标的种类。
</code>
</pre>

  详细的使用方法见：
[font-awesome使用方法] (http://www.bootcss.com/p/font-awesome/#icons-new)
  具体图标对应的class类可以查阅：
[图标对应编码查询](http://www.bootcss.com/p/font-awesome/design.html)

5、modalBox-jquery插件
===========
  modalBox是jquery的插件，用于生成模态对话框。使用方法如下：
<strong>生成modalBox模态对话框</strong><br />
<pre>
<code>
  $('.modalBox').modalBox({
    iconImg:'images/x.png',
        iconClose:true,
        keyClose:true,
        bodyClose:true
  });
</code>
</pre>
  更多设置（demo）：
[demo] (http://ignitersworld.com/lab/modalBox.html#demo)
  github项目网址：
[github网址] (https://github.com/s-yadav/modalBox.js)

6、tab库
=========
  tab库提供简单的建立tab的方法，使用方法如下：
  1、首先创建一个tab对象：
<pre>
<code>
  var tab = Tab.create('id',['tab1','tab2',...]，pos，size); 
  //'id'为自己定义的tab的窗口的id，不可为空。
  //tab1和tab2是tab标签的标签名。用于显示标签名，不可为空。
  //pos位置选项，要有pos.left和pos.top项。可为空
  //size大小选项，要有size.width和size.height选项，可为空
  如：
    _tab = Tab.create('property-tab',['basic', 'power']);
</code>
</pre> <br />
  2、向tab对象中添加要显示的内容
<pre>
<code>
  _tab.addaddDivByTab($div_,'tab1');
  //$div_ 是一个jquery元素对象用于append（$div_）
  //tab1是一个tab的标签名
</code>
</pre> <br />
  3、将tab对象加入到父元素内
<pre>
<code>
  _tab.injectParent($parent_);
  //$parent_是父元素的jquery对象。
</code>
</pre> <br />
  4、设置最初显示的tab。
<pre>
<code>
  _tab.setShowByTab('tab1');
  //tab1为初始显示tab1指向的div的内容，如果tab1不存在初始不显示任何内容。
</code>
</pre> <br />
    <strong>注：可以自定义设置css，具体设置方法可以参看property.less内容。</strong>

7、window库
=========
  用于快速建立窗口的插件，使用方法为：
<code>
<pre>
  Window.create('newWin','Test Window ', {
    left:200,
    top:100,
    height: 300,
    width: 800
  });
</pre>
</code>

  目前可设置的选项有：
<code>
<pre> <br />
  close: true，            //右上角关闭按钮，可点击
  max: true,               //右上角最大化按钮，可点击
  min: false,                 //右上角最小化按钮，可点击
  hide: true,                 //右上角隐藏内容按钮，可点击
  fadeSpeed: 100,         //打开窗口速度
  hideWindow: false, //是否直接显示窗口
  width: 600,                  //宽
  height: 600,                //高
  left: 0,                        //位置x坐标
  top: 0,                          //位置y坐标
  contentDiv: true,   //是否新建div窗口
  resize: false,          //设置是否可重新调整窗口的大小
  minWidth: 200,           //设置窗口的最小宽度
  minHeight:200,          //设置窗口的最小高度
  animate: true,          //动画效果
  contentDiv: true    //包含放置内容的div
</code>
</pre> <br />

8、Inputer库
=========
  Inputer库用于桌面上右键-->rename显示的文本输入框，用于文件的重命名。
  使用方法如下：
<code>
<pre>
  var _inputer = Inputer.create('name');
  _options = {
  'left': 100,
  'top' : 100,
  'width': 100,
  'height': 100,
  'oldtext': 'text',                 //用于初始显示时，显示在输入框的文字。
  'callback': function('newtext'){   //newtext输入框输入的文字，返回的文字。
          ....
    }
  }
  _inputer.show(_options);
</pre>
</code> <br />

9、reflect图片倒影库
=========
  reflect可以在图片的下面产生一个图片倒影，用于提升界面效果，其原理是新建一个div代替原有的div，并在新的div中加入源图片和倒影canvas（在ie浏览器是一个倒影图片）。
  使用方法如下：
<code>
<pre>
  var _reflect = Reflection.create(<img>,options); //新建一个reflection对象，并传入图片对象，<img>为js对象，options为设置项。
    _reflect.add();   //根据上边传入的图片和设置项，添加图片倒影
    _reflect.remove(); //删除图片倒影
</pre>
</code> <br />
  也可以自己实现删除倒影，其过程主要包含如下步骤：
<code>
<pre>
  <img>.style.cssText = ''; //img csstext 重置
  $(<div>).removeClass('reflect'); //图片的父div删除reflect class
  $($(<div>).children('canvas')[0]).remove(); //删除倒影
</pre>
</code> <br />
  上面的options只有<strong>三个</strong>设置项，分别为：
<code>
<pre>
   this._options = {
      height : 0.5,    //倒影的高度比率
      opacity : 0.5，   //倒影的透明度渐变比率
      hasParentDiv： false //是否使用图片的父div作为div容器，如果false则建立一个新的div代替原有的img。
    };
</pre>
</code> <br />
