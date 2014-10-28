/*global module:false*/
module.exports = function(grunt) {
// Project configuration.
grunt.initConfig({
  // Metadata.
  uiname: 'demoUI',
  cssPath: 'dist/css/',
  jsPath: 'dist/js/',
  webdePath: '../nw/',
  docPath: 'doc/assets/',
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
      src: ['js/**/*.js'],  // all children and subdir children
      dest: '<%= jsPath %><%= uiname %>.js'  
    }
  },

  uglify: {
    options: {
    banner: '<%= banner %>'
    },
    dist: {
      src: '<%= concat.dist.dest %>',
      dest: '<%= jsPath %><%= uiname %>.min.js'
    }
  },
  less: {
    compileCore: {
      options: {
      strictMath: false,
      sourceMap: false,
      outputSourceFiles: false,
      sourceMapURL: '<%= uiname %>.css.map',
      sourceMapFilename: '<%= cssPath %><%= uiname %>.css.map'
      },
      files: {
        '<%= cssPath %><%= uiname %>.css': 'less/main.less',
        '<%= cssPath %><%= uiname %>theme.css': 'less/messenger-theme.less'
      }
    },
    compileFont:{
      options: {
      strictMath: false
      },
      files:{
        '<%= cssPath %><%= uiname %>Font.css':'less/main-font.less'
      }
    }
  },

  cssmin:{
    options: {
      banner: '<%= banner %>'
    },
    combine:{
      files:{
        '<%= cssPath %><%= uiname %>.min.css':['<%= cssPath %><%= uiname %>.css'
           , '<%= cssPath %><%= uiname %>theme.css', '<%= cssPath %><%= uiname %>Font.css']
      }
    }
  },

  watch: {
    lib_js: {
      files: '<%= concat.dist.src %>',
      tasks: ['concat:dist', 'uglify:dist', 'copy:jsFileToWebde', 'copy:jsFileToDoc']
    },
    lib_css:{
      files: 'less/**/*.less',
      tasks: ['less:compileCore', 'less:compileFont', 'copy:cssFileToWebde', 'copy:cssFileToDoc']
    }
  },
  
  jshint:{
    options:{
      eqeqeq: false,    // 使用===&!== 不使用==和！=    
      noarg: true,    //禁用arguments.caller and argument.callee
      boss: true,        //查找类似if(a=0)的代码
      jquery: true
    },
    src:{
      src: ['js/*.js']
    }
  },

  copy: {
    jsFileToWebde: {
      expand: true,
      cwd: 'dist/js',
      src: '<%= uiname %>.js',
      dest: '<%= webdePath %>lib'
    },
    jsFileToDoc:{
      expand: true,
      cwd: 'dist/js',
      src: '<%= uiname %>.js',
      dest: '<%= docPath %>js'
    },
    cssFileToWebde: {
      expand: true,
      cwd: 'dist/css',
      src: '<%= uiname %>*',
      dest: '<%= webdePath %>css'
    },
    cssFileToDoc:{
      expand: true,
      cwd: 'dist/css',
      src: '<%= uiname %>*',
      dest: '<%= docPath %>css'
    },
    fontFile:{
      expand: true,
      cwd: 'font',
      src: '*',
      dest: 'dist/font'
    },
    fontFileToWebde:{
      expand: true,
      cwd: 'dist/font',
      src: '*',
      dest: '<%= webdePath %>font'
    },
    fontFileToDoc:{
      expand: true,
      cwd: 'dist/font',
      src: '*',
      dest: '<%= docPath %>font'
    },
    imgFile:{
      expand:true,
      cwd: 'img',
      src: '*',
      dest: 'dist/img'
    },
    imgFileToWebde:{
      expand:true,
      cwd: 'dist/img',
      src: '*',
      dest: '<%= webdePath %>img'
    },
    imgFileToDoc:{
      expand:true,
      cwd: 'dist/img',
      src: '*',
      dest: '<%= docPath %>img'
    }
  }
});

// These plugins provide necessary tasks.
require('load-grunt-tasks')(grunt);
// Default task.
grunt.registerTask('default', ['concat', 'uglify', 'less', 'copy:fontFile', 'copy:imgFile', 'doc']);
grunt.registerTask('webde', ['copy:jsFileToWebde', 'copy:cssFileToWebde', 'copy:fontFileToWebde', 'copy:imgFileToWebde']);
grunt.registerTask('webde-new', ['copy:jsFileToWebde', 'copy:cssFileToWebde']);
grunt.registerTask('doc',['copy:jsFileToDoc', 'copy:cssFileToDoc', 'copy:fontFileToDoc', 'copy:imgFileToDoc']);
grunt.registerTask('copyCss', ['copy:cssFile']);
grunt.registerTask('copyFont', ['copy:fontFile']);
};
