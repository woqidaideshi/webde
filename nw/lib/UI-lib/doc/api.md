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
  <img title='picture-title' id='test-img' src="/img/clock.png"/>
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
		[messenger官方网站](http://github.hubspot.com/messenger/)
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
	<i class='icon-user'></i> //其中icon-user是要添加图标的种类。
</code>
</pre>

	详细的使用方法见：
				[font-awesome使用方法](http://www.bootcss.com/p/font-awesome/#icons-new)
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
	更多设置（demo）：[demo](http://ignitersworld.com/lab/modalBox.html#demo)
	github项目网址：[github网址](https://github.com/s-yadav/modalBox.js)
	
