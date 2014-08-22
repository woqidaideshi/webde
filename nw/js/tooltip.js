//this is function that define title attr show 
var sweetTitles = { 
	x : 10, 
	y : 20, 
	tipElements : "img ", 
	noTitle : false, 
	init : function() { 
		var noTitle = this.noTitle; 
		$(this.tipElements).each(function(){ 
			$(this).mouseover(function(e){ 
				if(noTitle){ isTitle = true;
					 }
				else{ 
					isTitle = $.trim(this.title) != '';
				} 
				if(isTitle){ 
					this.myTitle = this.title; 
					this.title = ""; 
					var tooltip = "<div class='tooltip'><div id='title-inner' class='tipsy-inner'>"+this.myTitle+"</div><div class='tipsy-arrow'><img src='img/tip.png'></div></div>"; 
					$('body').append(tooltip); 
					$('.tooltip').css({"top" :( $(e.target).offset().top-33)+"px", "left" :( $(e.target).offset().left)+"px" }).show('fast');
 					}
 			})
			.mouseout(function(){ 
				if(this.myTitle != null){ 
					this.title = this.myTitle; 
					$('.tooltip').remove();
				}
 			})
 			.mousemove(function(e){ 
 				var word_w = this.myTitle.length;
 				var t_width = $(e.target).width();
 				var _width = $('#title-inner').width();
 				var left =  $(e.target).offset().left + (t_width - _width) / 2 - word_w;
 				$('.tooltip').css({ "top" :( $(e.target).offset().top-43)+"px", "left" :left+"px" });
 			})
 			.click(function(e){
 				$('.tooltip').animate({top:"-=40px"},'fast')
 								.animate({top:"+=40px"},'fast')	
 			})
 		});
 	}
}; 

