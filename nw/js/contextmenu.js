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
		{text:'set'}
	]

	context.attach('html',htmlMenu);
	context.attach('.icon', appMenu);
	context.attach('.plugin-div',pluginMenu);
	context.attach('#dock img',dockMenu) 
	

		$(document).on('mouseover', '.me-codesta', function(){
		$('.finale h1:first').css({opacity:0});
		$('.finale h1:last').css({opacity:1});
	});
	
	$(document).on('mouseout', '.me-codesta', function(){
		$('.finale h1:last').css({opacity:0});
		$('.finale h1:first').css({opacity:1});
	});
}