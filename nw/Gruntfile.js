/*global module:false*/
module.exports = function(grunt) {
// Project configuration.
grunt.initConfig({
	// Metadata.
	uiname: 'demoUI',
	pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> */\n',
	// Task configuration.
	concat: {
		options: {
		banner: '<%= banner %>',
		stripBanners: true
		},
		dist: {
			src: ['lib/UI-lib/js/**/*.js'],  // all children and subdir children
			dest: 'lib/<%= uiname %>.js'	
		}
	},

	uglify: {
		options: {
		banner: '<%= banner %>'
		},
		dist: {
			src: '<%= concat.dist.dest %>',
			dest: 'lib/<%= uiname %>.min.js'
		}
	},
	less: {
		compileCore: {
			options: {
			strictMath: false,
			sourceMap: true,
			outputSourceFiles: true,
			sourceMapURL: '<%= uiname %>.css.map',
			sourceMapFilename: 'css/<%= uiname %>.css.map'
			},
			files: {
				'css/<%= uiname %>.css': 'lib/UI-lib/less/main.less',
				'css/<%= uiname %>theme.css': 'lib/UI-lib/less/messenger-theme.less'
			}
		}
	},
	
	watch: {
		lib_js: {
			files: '<%= concat.dist.src %>',
			tasks: ['concat:dist', 'uglify:dist']
		},
		lib_css:{
			files: 'lib/UI-lib/less/**/*.less',
			tasks: ['less:compileCore']
		}
	},
	
	jshint:{
		options:{
			eqeqeq: true,		// 使用===&!== 不使用==和！=		
			noarg: true,		//禁用arguments.caller and argument.callee
			boss: true,				//查找类似if(a=0)的代码
			jquery: true,
			eqeqeq: false 
		},
		src:{
			src: ['js/*.js']
		}
	}
});

// These plugins provide necessary tasks.
require('load-grunt-tasks')(grunt);
// Default task.
grunt.registerTask('default', ['concat', 'uglify', 'less']);
};
