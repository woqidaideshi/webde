###运行说明###
	运行前请安装grunt，使用grunt生成ui-lib的输出文件，
	目前生成的文件包括在dist/目录下
 
##环境依赖##
    git
    node(包括npm)
    grunt (npm install -g grunt-cli)

###配置环境###
	1、请安装grunt客户端，使用如下命令进行安装：
	 npm install -g grunt-cli
	2、安装依赖
	  进入ui-lib目录下，执行：
	 npm install （此时该目录下会生成node-modules文件夹）
	3、执行grunt命令：
	 grunt （用于生成dist目录下文件）

###使用库文件####
	当执行完上面的配置文件后，会在dist目录下生成js，css，font，img四个文件夹，
	其中font和img要拷贝到应用项目的根目录下才能生效。
	
###grunt 自动打包###
	1、代码规范检查（目前尚未完善代码规范）
		grunt jshint
	2、将库文件复制到nw项目中的相应位置，以供nw运行（dist目录下js，css，font，img四个文件夹及相应文件都复制）。
		grunt init	
	3、生成UI库文件（会在dist目录下生成js，css，font，img四个文件夹及相应文件）
		grunt
	4、启动ui-lib代码自动集成（当js/*.js和less/**/*.less文件修改时自动编译生成库文件）
		grunt watch
	5、帮助
		grunt --help
	6、生成ui库的js文件（dist/lib/demoUI.js）
		grunt concat
	7、压缩ui库的js文件（dist/lib/demoUI.min.js）
		grunt uglify
	8、生成ui库的css文件（dist/css/demoUI.css & dist/css/demoUItheme.css & dist/css/demoUIfont.css）
		grunt less
	9、将库文件复制到nw项目中的相应位置，以供nw运行（dist目录下只复制js，css两个文件夹及相应文件）。
		grunt webde	
	10、生成css压缩文件（对css文件进行压缩，将8中生成的三个文件压缩成一个压缩文件：dist/css/demoUI.min.css）
		grunt cssmin

##关于api##
	请阅读doc/api.md
