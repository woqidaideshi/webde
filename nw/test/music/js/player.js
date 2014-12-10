var mucicFiles=[
  //{name:'if without you', author:'ilu', url:'/home/fjz/WORK_DIRECOTRY/resources/musics/我很快乐.ogg'},
  //{name:"那些年",author:"孙燕姿",url:"/home/fjz/WORK_DIRECOTRY/resources/musics/那些年.oga"},
  {name:"看月亮爬上来",author:"张杰",url:"http://img3.dangdang.com/newimages/music/online/zj_kylpsl.mp3"}
];

$(function(){
  var $media = $("#musicbox");
  var musicIndex = -1; //当前正在播放的歌曲的索引
  var playingFile = null; //当前正在播放的歌曲
  var playMode = 1; //播放模式

  init = function() {
    if (window != top) {
      try{
        _global = parent._global;
        if (_global) {
          _global._dataOP.getAllMusic(function(err_, musics_){
            if (!err_){
              for (var key in musics_){
                  mucicFiles[mucicFiles.length] = {name:musics_[key].filename,url:musics_[key].path};
              }
              for(var i in mucicFiles){
                $("#musiclist").append("<li>" + mucicFiles[i].name + "</li>");
              }
              registerEvent();
              nextMusic();
            }
          });
        }
      }
      catch(e){
        console.log(e);
      }
    }
  }();

  function getRandomNum(min_, max_){
    var range = max_ - min_;
    var rand = Math.random();
    return(min_ + Math.round(rand * range));
  }
  
  function nextMusic(){
    if (playMode == 1){
      musicIndex += 1;
      if (musicIndex == mucicFiles.length){
        musicIndex = 0;
      }
    }
    if (playMode == 2){
      musicIndex = getRandomNum(1,mucicFiles.length) - 1;
    }
    playMusic(musicIndex);
  }

  function playMusic(index){
    playingFile = mucicFiles[index];
    $media.attr("src", playingFile.url);
    $media[0].play();
    $("#musiclist>li").removeClass("isplay").eq(index).addClass("isplay");
    auto();
  }

  function auto(){
    var allTime = $media[0].duration;
    console.log(allTime);
    var currentTime = $media[0].currentTime;
    var percent = Math.floor(currentTime * 100 / allTime);
    if (isNaN(allTime)) {
      $("#progress div").css({background:"url(images/load.png repeat-x)",width:"100px"});
    }
    else {
      $("#progress div").css("background", "#374D62");
      $("#progress div").css("width", percent + "px");
      $("#time").html(timeformat(currentTime) + " / " + timeformat(allTime));
    }
    setTimeout(auto, 1000);
    if ($media[0].ended == true) {
      nextMusic();
    }
  };

  function timeformat(time) {
    var t = Math.round(time);
    var h = Math.floor(t / 3600);
    var m = Math.floor(t / 60);
    var s = t - h * 3600 - m * 60;
    if(h == 0) {
      str = m>9?m:("0"+m) + ":" + (s>9?s:("0"+s));
    }
    else {
      str = h>9?h:("0"+h) + ":" + (m>9?m:("0"+m)) + ":" + (s>9?s:("0"+s));
    }
    return str;
  }

  function registerEvent(){
    $("#next").bind("click", nextMusic);
  
    // 双击播放列表播放
    $("#musiclist>li").dblclick(function(){
      musicIndex = $("#musiclist>li").index(this);
      $("#play").addClass("playing");
      playMusic(musicIndex);
      if (playMode == 0) {
        $("#musiclist>li").removeClass("disable").not(".isplay").addClass("disable");
      }
    });

    //播放按钮切换
    $("#play").click(function(){
      if ($("#play").is(".playing")) {
        $("#play").removeClass("playing");
        $media[0].pause();
      }
      else {
        $("#play").addClass("playing");
        $media[0].play();
      }
    });
  
    //选择进度
    $("#progress").click(function(e){
      var offset = $("#progress div").offset();
      var width = e.pageX - offset.left;
      var allTime = $media[0].duration;
      $media[0].currentTime = allTime * width / 100;
      $("#progress div").css("width", width + "px");
    });
  
    //音量调整
    var isdown = false;
    $("#volume div").mousedown(function(e){
      var offset = $("#volume").offset();
      var left = e.pageX - offset.left - 8;
      left = left>34? 34 : left;
      left = left<0? 0 : left;
      $("#volume div").css("left", left + "px");
      isdown = true;
    });
  
    $(document).mousemove(function(e){
      if (isdown) {
        var offset = $("#volume").offset();
        var left = e.pageX - offset.left - 8;
        left = left>34? 34 : left;
        left = left<0? 0 : left;
        $("#volume div").css("left", left + "px");
        $media[0].volume = Math.round(left / 34 * 10) / 10;
      }
    });
  
    $(document).mouseup(function(){
      isdown = false;
      //alert(isdown);
    });
  
    $("#volume").click(function(e){
      var offset = $("#volume").offset();
      var left = e.pageX - offset.left - 8;
      left = left>34? 34 : left;
      left = left<0? 0 : left;
      $("#volume div").css("left", left + "px");
      $media[0].volume = Math.round(left / 34 * 10) / 10;
    });
  
    //模式切换
    $("#mode").click(function(){
      /*
      * 0 单首, 1 全部, 2 随机
      */
      if (playMode == 0) {
        $("#mode").html("全部");
        $("#musiclist>li").removeClass("disable");
        playMode = 1;
      } 
      else if (playMode == 1){
        $("#mode").html("随机");
        playMode = 2;
      }
      else{
        $("#mode").html("单首");
        $("#musiclist>li").not(".isplay").addClass("disable");
        playMode = 0;
      }
    });
  }
});
