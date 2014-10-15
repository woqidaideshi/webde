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
	运行前请安装grunt，并执行grunt命令，用于将less/*.less编译为css文件。
 
##环境依赖##
    git
    node(包括npm)
    grunt (npm install -g grunt-cli)
    demo-rio(branch data2)
    ui-lib

###配置环境###
	1、请安装grunt客户端，使用如下命令进行安装：
	 npm install -g grunt-cli
	2、安装依赖
	  进入nw目录下，执行：
	 npm install （此时该目录下会生成node-modules文件夹）
	3、执行grunt命令：
	  在nw目录下，执行
	 grunt 
	4、初次配置时，载入ui库
	  进入ui-lib目录，执行
	 npm install （此时该目录下会生成node-modules文件夹）
	 grunt    （用于生成dist目录下项目文件）
	5、当再次打开并要使用最新ui-lib时，执行
	 在ui-lib目录下，执行：
	 grunt webde  或者
	 grunt init

###grunt 自动打包###
	1、代码规范检查（目前尚未完善代码规范）
		grunt jshint
	2、编译less文件为css文件（js文件和css文件）
		grunt 或者
		grunt less
	3、启动desktop代码自动集成（当less/**/*.less文件修改时自动编译生成css文件）
		grunt watch
	4、帮助
		grunt --help

