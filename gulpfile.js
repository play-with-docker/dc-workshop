/* jshint node:true */
'use strict';

var gulp = require('gulp');
var argv = require('yargs').argv;
var $ = require('gulp-load-plugins')();

gulp.task('styles', function() {
  return gulp.src('app/styles/main.less')
    .pipe($.plumber())
    .pipe($.less())
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function() {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    //.pipe($.jshint.reporter('jshint-stylish'))
    //.pipe($.jshint.reporter('fail'));
});

gulp.task('html', ['styles'], function() {
  var lazypipe = require('lazypipe');
  var cssChannel = lazypipe()
    .pipe($.csso)
    .pipe($.replace, 'bower_components/bootstrap/fonts', 'fonts');

  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/**/*.html')
    .pipe(assets)
    .pipe($.if('**/*.js', $.ngAnnotate()))
    //.pipe($.if('**/*.js', $.uglify()))
    .pipe($.if('**/*.css', cssChannel()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('**/*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('docs'));
});

gulp.task('images', function() {
  return gulp.src('app/images/**/*')
    // .pipe($.cache($.imagemin({
    //   progressive: true,
    //   interlaced: true
    // })))
    .pipe(gulp.dest('docs/images'));
});

gulp.task('fonts', function() {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*')
    .concat('bower_components/font-awesome/fonts/*')
    .concat('bower_components/bootstrap/fonts/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest('docs/fonts'))
    .pipe(gulp.dest('.tmp/fonts'));
});

gulp.task('extras', function() {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    'node_modules/apache-server-configs/docs/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('docs'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'docs/**/*', '!docs/CNAME', '!docs/favicon.ico']));

gulp.task('connect', ['styles'], function() {
  var serveStatic = require('serve-static');
  var app = require('express')()
    .use('/bower_components', serveStatic('bower_components'))
    .use('/', serveStatic(__dirname + '/.tmp', {redirect: false, fallthrough: true}))
    .use('/', serveStatic(__dirname + '/app', {redirect: false, fallthrough: true}))
    .use('/:sessionId', function(req, res) {res.sendFile(__dirname + '/app/index.html')});
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function() {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['wiredep', 'connect', 'fonts', 'watch'], function() {
  if (argv.open) {
    require('opn')('http://localhost:9000');
  }
});


// inject bower components
gulp.task('wiredep', function() {
  var wiredep = require('wiredep').stream;
  var exclude = [
    'es5-shim',
    'json3',
    'angular-scenario'
  ];

  gulp.src('app/styles/*.less')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({exclude: exclude}))
    .pipe(gulp.dest('app'));

  gulp.src('test/*.js')
    .pipe(wiredep({exclude: exclude, devDependencies: true}))
    .pipe(gulp.dest('test'));
});

gulp.task('watch', ['connect'], function() {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/**/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.less', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('builddist', ['jshint', 'html', 'images', 'fonts', 'extras'],
  function() {
  return gulp.src('docs/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build', ['clean'], function() {
  gulp.start('builddist');
});

gulp.task('docs', [], function() {
  return gulp.src('app/scripts/**/**')
    .pipe($.ngdocs.process())
    .pipe(gulp.dest('./docs'));
});
