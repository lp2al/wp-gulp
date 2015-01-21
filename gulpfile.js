var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

//require browserSync 
var browserSync = require('browser-sync');
var reload      = browserSync.reload;

var sassSources = ['src/sass/style.scss'];

// var handleErrors = function () {
//   // Send error to notification center with gulp-notify
//   $.notify.onError({
//     title: "Compile Error",
//     message: "<%= error.message %>"
//   }).apply(this, arguments);
//   // Keep gulp from hanging on this task
//   this.emit('end');
// };

//define source files
var srcFiles = {
  img: 'src/images/**/*.{png,jpg,jpeg,gif,svg}',
  css: 'src/scss/**/*.scss',
  jsMain: 'src/js/main.js',
  jsVendor: 'src/js/vendor/**/*.js',
  fonts: 'src/fonts/**/*',
  php: '**/*.php'
};

//define destination paths
var destPaths = {
  img: 'assets/images',
  svg: 'assets/images',
  css: 'assets/css',
  jsVendor: 'assets/js/vendor',
  js: 'assets/js',
  fonts: 'assets/fonts'
};

//sass style
var sassStyle = "expanded"; 

//local URL
var localURL = 'http://localhost/tax';

//pass fonts - don't do anything, just save them
gulp.task('fonts', function () {
  return gulp.src(srcFiles.fonts)
  .pipe(gulp.dest(destPaths.fonts));
});

//compass
gulp.task('compass', function() {
  return gulp.src(sassSources)
    .pipe($.compass({
      sass: 'src/sass',
      css: 'assets/css',
      image: destPaths.img,
      style: sassStyle,
      comments: false,
      require: ['susy', 'breakpoint']
    })
    .on('error', $.util.log))
    //.pipe(gulp.dest(destPaths.css))
    // send changes to Browser-sync
    .pipe(reload({
      stream: true
    }));
});

gulp.task('images', function () {
  return gulp.src(srcFiles.img)
  // use cache to only target new/changed files
  // then optimize the images
  .pipe($.cache($.imagemin({
    progressive: true,
    interlaced: true
  })))
  // save optimized image files
  .pipe(gulp.dest(destPaths.img))
  // send changes to Browser-sync
  .pipe(reload({
    stream: true
  }));
});

// don't do anything to vendor scripts, just save them
// we will enqueue with WordPress
gulp.task('vendorScripts', function () {
  return gulp.src(srcFiles.jsVendor)
    .pipe(gulp.dest(destPaths.jsVendor));
});

gulp.task('mainScript', function () {
  return gulp.src(srcFiles.jsMain)
  // minify
  .pipe($.uglify())
  // rename to "-min"
  .pipe($.rename({
    suffix: "-min"
  }))
  // save
  .pipe(gulp.dest(destPaths.js))
  // send changes to Browser-sync
  .pipe(reload({
    stream: true
  }));
});

gulp.task('assets', [
  'fonts',
  'images',
  'vendorScripts',
  'mainScript',
  'compass'
]);

//watch
gulp.task('watch', function () {
  // Watch main JS file and run mainScript task
  gulp.watch(srcFiles.jsMain, ['mainScript']);
  // Watch .scss files and run sass task
  gulp.watch(['src/sass/*.scss', 'src/sass/*/*.scss'], ['compass']);
  // Watch image files and run image task
  gulp.watch(srcFiles.img, ['images']);
});

//livereload
gulp.task('browserSync', ['assets'], function () {
  // Files to watch with Browser-sync
  // Typically files you aren't modifying with gulp
  var watchFiles = [
    srcFiles.php
  ];
  // initialize browsersync
  browserSync.init(watchFiles, {
    // config options, such as port, go here
    // see http://www.browsersync.io/docs/gulp/
     proxy: localURL
  });
});

//clean assets
gulp.task('clean', function (cb) {
  del(['./assets'], cb);
});

//rebuild assets
gulp.task('build', function (cb) {
  $.runSequence(
    'clean',
    'assets',
  cb);
});

gulp.task('default', ['watch', 'browserSync']);
