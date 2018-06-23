// for refrence goto https://css-tricks.com/gulp-for-beginners/
// we use gulp-uglify-es instead of gulp-uglify
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();
// const useref = require('gulp-useref');
const uglify = require('gulp-uglify-es').default;
const htmlmin = require('gulp-html-minifier');
// const gulpIf = require('gulp-if');
const mergeStream = require('merge-stream');
const del = require('del');

// TODO: since we using gulp-load-plugins
// remove few plugins from up here

// gulp CSS task for build
gulp.task('css-build', function() {
  return gulp.src('app/scss/*.scss')
    .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({outputStyle: 'compressed'}))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('build/css/'))
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true,
    }));
});
// gulp CSS task for development
gulp.task('css-dev', function() {
  return gulp.src('app/scss/*.scss')
    .pipe(plugins.sass.sync().on('error', plugins.sass.logError))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass())
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('app/css/'))
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true,
    }));
});

gulp.task('browserSync', function() {
  browserSync.init({
    port: 8000, // Or whatever port you want for your application
    ui: {
      port: 8001, // Or whatever port you want for browsersync ui
    },
    server: {
      baseDir: './app',
    },
  });
});


/*
  We'll also want to make sure 'CSS' task runs before watch so the CSS will
  already be the latest whenever we run a Gulp command.
*/
gulp.task('watch', ['browserSync', 'css-dev'], function() {
  // gulp.watch([task to run], [action to perform]);
  gulp.watch('app/scss/**/*.scss', ['css-dev']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/**/*.js', browserSync.reload);
});

// TODO: add JS concate, and then remember to remove JS minify task
// also remember to modify copy or html minify task too
// and don't forget about the gulp-build task itself
// gulp.task('useref', function() {
//   return gulp.src('app/*.html')
//     .pipe(useref())
//     // Minifies only if it's a JavaScript file
//     .pipe(gulpIf('*.js', uglify()))
//     .pipe(gulp.dest('build/'));
// });
// TODO make sure to update sw.js file accordingly
// TODO: sourcemaps for JS files

gulp.task('uglifyJS', function() {
    return gulp.src('app/**/*.js')
        .pipe(uglify(/* options */))
        .pipe(gulp.dest('build/'));
});

gulp.task('HTMLminify', function() {
  gulp.src('app/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build/'));
});


// copy stuff from app source to build folder
gulp.task('copy', function() {
  return mergeStream(
    gulp.src('app/data/**/*').pipe(gulp.dest('build/data')),
    gulp.src('app/img/**/*').pipe(gulp.dest('build/img'))
  );
});

gulp.task('clean:build', function() {
  return del.sync('build');
});

// for final build for production
gulp.task('build', function(callback) {
  // runSequence('clean:build', ['css-build', 'useref', 'copy'], callback);
  runSequence('clean:build', ['css-build', 'uglifyJS', 'HTMLminify', 'copy'], callback);
});

// for development
gulp.task('serve', function(callback) {
  runSequence(['css-dev', 'browserSync', 'watch'],
    callback
  );
});
