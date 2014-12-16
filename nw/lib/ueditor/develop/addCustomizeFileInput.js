UE.registerUI('button',function(editor,uiName){
    //注册按钮执行时的command命令，使用命令默认就会带有回退操作
   /* editor.registerCommand(uiName,{
        execCommand:function(){
            alert('execCommand:' + uiName)
        }
    });*/

    //创建一个button
    var btn = new UE.ui.Button({
        //按钮的名字
        name:uiName,
        //提示
        title:"传送文件",
        id:"fileUpload",
        //需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules :' background-image:url(http://mimg.163.com/netfolder/images/all_toolbar.gif);',
        //点击时执行的命令
    onclick: function() {
        //这里可以不用执行命令,做你自己的操作也可
        //editor.execCommand(uiName);
        alert('execCommand:' + uiName)
       /* var file = document.createElement("input");
        file.type = "file";
        file.id = "fileUpload";
        file.name = "fileUpload";
        file.hideFocus = true;
        file.style.cssText = "cursor:pointer; width:1px; border:none; height:32px; padding:0px; margin:0px;position:absolute; opacity:0;filter:alpha(opacity=0);font-size:20px;";
        file.onchange = function() {
           // $("#s" + TotalFiles.toString()).innerHTML = $("f" + TotalFiles.toString()).value.substring($("f" + TotalFiles.toString()).value.lastIndexOf("\\") + 1, $("f" + TotalFiles.toString()).value.length) + "    <span onclick=\"DelFile('" + TotalFiles.toString() + "')\" style=\"cursor:pointer;color:red\">X</span>";
            this.style.display = "none";
            //AddFiles();
        };
        $("#UpFilePanelHidden").append(file);*/
        document.execCommand('SaveAs');
    }
});

    //当点到编辑内容上时，按钮要做的状态反射
    editor.addListener('selectionchange', function () {
        var state = editor.queryCommandState(uiName);
        if (state == -1) {
            btn.setDisabled(true);
            btn.setChecked(false);
        } else {
            btn.setDisabled(false);
            btn.setChecked(state);
        }
    });

    //因为你是添加button,所以需要返回这个button
    return btn;
}/*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/);

//自定义引用样式例子
/*
UE.registerUI('myblockquote',function(editor,uiName){
    editor.registerCommand(uiName,{
        execCommand:function(){
            this.execCommand('blockquote',{
                "style":"border-left: 3px solid #E5E6E1; margin-left: 0px; padding-left: 5px; line-height:36px;"
            });
        }
    });

    var btn = new UE.ui.Button({
        name:uiName,
        title:'自定义引用',
        cssRules :"background-position: -220px 0;",
        onclick:function () {
           editor.execCommand(uiName);
        }
    });

    editor.addListener('selectionchange', function () {
        console.log(this);
        var state = editor.queryCommandState('blockquote');
        if (state == -1) {
            btn.setDisabled(true);
            btn.setChecked(false);
        } else {
            btn.setDisabled(false);
            btn.setChecked(state);
        }
    });

    return btn;
});*/