/*global module:false*/
module.exports = function(grunt) {
// Project configuration.
grunt.initConfig({
	// Metadata.
	pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> */\n',
	less: {
		options: {
		banner: '<%= banner %>'
		},
		compileCore: {
			options: {
			strictMath: false,
			sourceMap: false,
			outputSourceFiles: false
			},
			files: {
				'css/desktop.css': 'less/main.less',
			}
		},
	},
	
	watch: {
		lib_css:{
			files: 'less/**/*.less',
			tasks: ['less:compileCore']
		}
	},
	
	jshint:{
		options:{
			eqeqeq: false,		// 使用===&!== 不使用==和！=		
			noarg: true,		//禁用arguments.caller and argument.callee
			boss: true,				//查找类似if(a=0)的代码
			jquery: true
		},
		src:{
			src: ['js/*.js']
		}
	}
});

// These plugins provide necessary tasks.
require('load-grunt-tasks')(grunt);
// Default task.
grunt.registerTask('default', ['less']);
};
