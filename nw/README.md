##For web devironment##

Copy files in config into $HOME/.local/share/
then mkdir dock @$HOME/.local/share/
then copy some apps from /usr/share/applications/ to $HOME/.local/share/dock

For support drag chinese from html to desktop, you must install iconv-lite as follow:
	npm install iconv-lite 

You can use commad like:
	cp -r config/* $HOME/.local/share/
	mkdir $HOME/.local/share/dock
	cp /usr/share/applications/firefox.desktop $HOME/.local/share/dock/
	cp /usr/share/applications/gedit.desktop $HOME/.local/share/dock/
	cp /usr/share/applications/gnome-terminal.desktop $HOME/.local/share/dock/
	cp /usr/share/applications/totem.desktop $HOME/.local/share/dock/
	cp /usr/share/applications/cinnamon-settings.desktop $HOME/.local/share/dock/
	chmod +x $HOME/.local/share/dock/*

###运行说明###
	运行前请安装grunt，使用grunt生成运行依赖的ui-lib，
	目前生成的文件包括nw/css/demoUI.css & nw/css/demoUItheme.css，
	以及在nw/dist/lib下的demoUI.js & demoUI.min.js。
 
##环境依赖##
    git
    node(包括npm)
    grunt (npm install -g grunt-cli)

###配置环境###
	1、请安装grunt客户端，使用如下命令进行安装：
	 npm install -g grunt-cli
	2、安装依赖
	  进入nw目录下，执行：
	 npm install （此时该目录下会生成node-modules文件夹）
	3、执行grunt命令：
	 grunt （用于生成dist目录下项目文件）
	
###grunt 自动打包###
	1、代码规范检查（目前尚未完善代码规范）
		grunt jshint
	3、生成UI库文件（js文件和css文件）
		grunt
	4、启动ui-lib代码自动集成（当UI-lib/js/*.js和UI-lib/less/**/*.less文件修改时自动编译生成库文件）
		grunt watch
	5、帮助
		grunt --help
	6、生成ui库的js文件（lib/demoUI.js）
		grunt concat
	7、压缩ui库的js文件（lib/demoUI.min.js）
		grunt uglify
	8、生成ui库的css文件（nw/css/demoUI.css & nw/css/demoUItheme.css）
		grunt less

##关于api##
	请阅读lib/UI-lib/doc/api.md
