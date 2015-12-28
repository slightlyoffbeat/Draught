// ----------------------------------------------------------------------------------------
// Plugins
// ----------------------------------------------------------------------------------------

var gulp         = require('gulp');
var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps   = require('gulp-sourcemaps');
var browserSync  = require('browser-sync');
var minifyCss    = require('gulp-minify-css');
var plumber      = require('gulp-plumber');
var rename       = require("gulp-rename");
var clean        = require('gulp-clean');
var gutil        = require('gulp-util');



// ----------------------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------------------


var src = {
  sass: 'app/scss/**/*.scss',
  top: 'app/*',
  html: 'app/*.html',
  img: 'app/img/**/*',
  js: 'app/js/**/*',
  fonts: 'app/fonts/**/*'
};

var dest = {
  css: 'dist/css',
  top: 'dist',
  img: 'dist/img',
  fonts: 'dist/fonts',
  js: 'dist/js',
  html: 'dist'
};

var name = {
  css: 'style.min.css',
}

// ----------------------------------------------------------------------------------------
// Tasks
// ----------------------------------------------------------------------------------------


// Task: Sass
gulp.task('sass', function() {
  return gulp.src(src.sass)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(minifyCss())
    .pipe(sourcemaps.write())
    .pipe(rename(name.css))
    .pipe(gulp.dest(dest.css))
    .pipe(browserSync.reload({stream: true}));
});

// Task: HTML
gulp.task('html', function() {
  //watch HTML files and refresh when something changes
  return gulp.src(src.html)
      .pipe(plumber())
      .pipe(gulp.dest(dest.html))
      .pipe(browserSync.reload({stream: true}))
      //catch errors
      .on('error', gutil.log);
});

// Task: JS
gulp.task('js', function() {
  return gulp.src(src.js)
    .pipe(gulp.dest(dest.js))
    .pipe(browserSync.reload({stream: true}))
    //catch errors
    //.on('error', gutil.log);

});

// Task: Migrate Files
gulp.task('migrate', function() {
  // Grab everything in root (html, robot.txt etc)
  gulp.src(src.top + '.{txt,ico,html}')
    .pipe(plumber())
    .pipe(gulp.dest(dest.top));

  // Grab fonts  
  gulp.src(src.fonts)
      //prevent pipe breaking caused by errors from gulp plugins
      .pipe(plumber())
      .pipe(gulp.dest(dest.fonts));

  // Grab images
  gulp.src(src.img)
    .pipe(plumber())
    .pipe(gulp.dest(dest.img));

  // Grab JS
  gulp.src(src.js)
    .pipe(plumber())
    .pipe(gulp.dest(dest.js));

});

// Task: Watch
gulp.task('watch', ['browserSync', 'sass', 'html'], function() {
  gulp.watch(src.sass, ['sass']);
  gulp.watch(src.html, ['html']);
  gulp.watch(src.js,   ['js']);
});

// Task: Clean
gulp.task('clean', function () {
  return gulp.src(dest.top + '/*', {read: false})
    .pipe(clean());
});

// Task: BrowserSync
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: './dist',
    },
  })
});


// Task: Default (launch server and watch files for changes)
gulp.task('default', ['migrate', 'watch'], function(){});