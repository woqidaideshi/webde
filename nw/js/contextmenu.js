//context menu when click right butten 
var RightMenu = function(){
	context.init({preventDoubleContext: false});

	var pluginMenu = [
		{header: 'plugin'},
		{text:'zoom in' , action:function(e){
			e.preventDefault();
			var w = $('#'+desktop._rightObjId).width();
			if (w >= 180) {
				alert('the plugin has been max size!!');
			}else {
				desktop._widgets[desktop._rightObjId].resize(w+20,w+20);
				var col_num = parseInt($('#'+desktop._rightObjId).width()/desktop._grid._col-0.00001)+1;
				var row_num =  parseInt($('#'+desktop._rightObjId).height()/desktop._grid._row-0.00001)+1;
				var parent_id = $('#'+ desktop._rightObjId).parent('.grid')[0].id;
				var arr = parent_id.split('_');
				var col = parseInt(arr[1]);
				var row = parseInt(arr[2]);
				desktop._grid.flagGridOccupy(col, row, col_num, row_num, true);
			}
		}},
		{text:'zoom out' , action:function(e){
			e.preventDefault();
			var w = $('#'+desktop._rightObjId).width();
			if (w<=60) {
				alert('the plugin has been min size!!');
			}else {
				desktop._widgets[desktop._rightObjId].resize(w-20,w-20);
				var col_num_old = parseInt(w/desktop._grid._col-0.00001)+1;
				var row_num_old =  parseInt(w/desktop._grid._row-0.00001)+1;
				var col_num = parseInt($('#'+desktop._rightObjId).width()/desktop._grid._col-0.00001)+1;
				var row_num =  parseInt($('#'+desktop._rightObjId).height()/desktop._grid._row-0.00001)+1;
				var parent_id = $('#'+ desktop._rightObjId).parent('.grid')[0].id;
				var arr = parent_id.split('_');
				var col = parseInt(arr[1]);
				var row = parseInt(arr[2]);
				desktop._grid.flagGridOccupy(col, row, col_num_old, row_num_old, false);
				desktop._grid.flagGridOccupy(col, row, col_num, row_num, true);
			}
		}},
		{text:'remove' , action:function(e){
			desktop.unRegistWidget(desktop._rightObjId);
			var col_num = parseInt($('#'+desktop._rightObjId).width()/desktop._grid._col-0.00001)+1;
			var row_num =  parseInt($('#'+desktop._rightObjId).height()/desktop._grid._row-0.00001)+1;
			var parent_id = $('#'+ desktop._rightObjId).parent('.grid')[0].id;
			var arr = parent_id.split('_');
			var col = parseInt(arr[1]);
			var row = parseInt(arr[2]);
			desktop._grid.flagGridOccupy(col, row, col_num, row_num, false);
			$('#'+desktop._rightObjId).remove();
			e.preventDefault();
		}}
	];

	var htmlMenu = [
		{header: 'desktop'},
		{text:'terminal',action:function(e){
			e.preventDefault();
			var exec = require('child_process').exec;
			exec("gnome-terminal",function(err, stdout, stderr){
                			console.log('stdout: ' + stdout);
                			console.log('stderr: ' + stderr);
                });
		}},
		{text:'gedit',action:function(e){
			e.preventDefault();
			var exec = require('child_process').exec;
			exec("gedit",function(err, stdout, stderr){
                			console.log('stdout: ' + stdout);
                			console.log('stderr: ' + stderr);
                });
		}},
		{divider: true},
		{text:'refresh',action:function(e){
			location.reload();
		}},
		{text:'refresh (F5)',action:function(e){
			location.reload(true);
		}},
		{divider: true},
		{text:'app plugin',subMenu:[{header:'plugin'},
					{text:'clock',action:function(e){
						if (typeof $('#clock')[0] == 'undefined') 
							desktop.addAnDPlugin(ClockPlugin.create('clock',undefined,'img/clock.png'));
					}}
		]}
	];

	var appMenu = [
		{header: 'file'},
		{text:'open',action:function(e){
			var exec = require('child_process').exec;
			var id = desktop._rightObjId;
			var Excmd = desktop._widgets[id]._execCmd;
			exec(Excmd,function(err, stdout, stderr){
                			console.log('stdout: ' + stdout);
                			console.log('stderr: ' + stderr);
                });
		}}
	]

	var dockMenu = [
		{header:'dock'},
		{text:'property',action:function(e){
			if (typeof $('#' +desktop._rightObjId+ '-property')[0] == 'undefined') {
				Property.create(desktop._rightObjId);
			};
			var showDiv = $('#' +desktop._rightObjId+ '-property');
			showDiv.css('position','absolute');
			var left_ = $('#'+desktop._rightObjId).position().left + $('#'+desktop._rightObjId).width()/2;
			var top_ = $('#dock').position().top;
			showDiv.css('left',left_+'px');
			showDiv.css('top',top_+'px');
			showDiv.show();
			var box_width =$(window).width()/4;
			var box_height = $(window).height()/2;
			var th= $(window).height()/2-box_height/2;
			var h =document.body.clientHeight;
			var lw =$(window).width()/2-box_width/2;
			$('#' +desktop._rightObjId+ '-property').animate({top:th,opacity:'show',width:box_width,height:box_height,left:lw},500);
		}}
	]

	context.attach('html',htmlMenu);
	context.attach('.icon', appMenu);
	context.attach('.plugin-div',pluginMenu);
	context.attach('#dock img',dockMenu) 
	
}