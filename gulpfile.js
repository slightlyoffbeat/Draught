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
var browserify   = require('browserify');
var source       = require('vinyl-source-stream');
var babelify     = require('babelify');
var watchify     = require('watchify');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');
var buffer       = require('vinyl-buffer');


// ----------------------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------------------


var src = {
  sass: 'app/scss/**/*.scss',
  top: 'app/*',
  html: 'app/*.html',
  img: 'app/img/**/*',
  js: 'app/js/**/*',
  fonts: 'app/fonts/**/*',
  appjs: 'app/js/app.js'
};

var dest = {
  css: 'dist/css',
  top: 'dist',
  img: 'dist/img',
  fonts: 'dist/fonts',
  js: 'dist/js',
  html: 'dist',
  appjs: 'dist/js'
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
// gulp.task('js', function() {
//   return gulp.src(src.js)
    //.pipe(gulp.dest(dest.js))
    // .pipe(browserSync.reload({stream: true}))
    //catch errors
    //.on('error', gutil.log);
// });


// Task: Browserify + Watchify
gulp.task('watchify', function () {
  //var args = merge(watchify.args, { debug: true })
  var args = {
    entries: [src.appjs],
    debug: true,
    cache: {},
    packageCache: {},
  };
  var bundler = watchify(browserify(src.appjs, args).transform(babelify, {presets: ["es2015"]}));
  //var bundler = watchify(browserify('./src/js/app.js', args)).transform(babelify, {presets: ["es2015"]})
  bundle_js(bundler)

  bundler.on('update', function () {
    bundle_js(bundler)
  })
})


function bundle_js(bundler) {
  return bundler.bundle()
    .pipe(source(src.appjs))
    .pipe(buffer())
    .pipe(gulp.dest(dest.appjs))
    .pipe(rename('bundle.js'))
    .pipe(sourcemaps.init({ loadMaps: true }))
      // capture sourcemaps from transforms
      .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest.appjs))
    .pipe(browserSync.reload({stream:true}));
}

// Task: Browserify without watchify
gulp.task('browserify', function () {
  var bundler = browserify(src.appjs, { debug: true }).transform(babelify, {presets: ["es2015"]})

  return bundle_js(bundler)
})

// Browserify without sourcemaps (or watchify)
gulp.task('browserify-prod', function () {
  var bundler = browserify(src.appjs).transform(babelify, {presets: ["es2015"]})

  return bundler.bundle()
    .pipe(source(src.appjs))
    .pipe(buffer())
    .pipe(rename('bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dest.appjs))
})

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
  // gulp.src(src.js)
  //   .pipe(plumber())
  //   .pipe(gulp.dest(dest.js));

});

// Task: Watch
gulp.task('watch', ['watchify', 'browserSync', 'sass', 'html',], function() {
  gulp.watch(src.sass, ['sass']);
  gulp.watch(src.html, ['html']);
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