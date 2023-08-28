const gulp = require('gulp');
const plumber = require("gulp-plumber");
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const autoprefixer = require("gulp-autoprefixer");
const postcss = require('gulp-postcss');
const mqpacker = require('css-mqpacker');
const pug = require("gulp-pug");
const notify = require("gulp-notify");
const replace = require('gulp-replace');
const uglify = require('gulp-uglify');
const entityconvert = require('gulp-entity-convert');
const eventstream = require('event-stream');
const paths = {
  root: './src',
  pug: {
    src: [
      './src/pug/**/*.pug',
      '!./src/pug/_**/*.pug',
    ],
  },
  styles: {
    src: [
      './src/sass/**/*.scss',
      '!./src/_**/*.scss'
    ],
  },
  scripts: {
    src: [
      'src/assets/js/**/*.js',
      '!src/assets/js/**/*.min.js',
      '!src/assets/js/library/postal-data/*.js',
    ],
  },
  contentImages: {
    src: 'src/pug/**/*.{jpg,jpeg,png,svg,gif}',
  },
  images: {
    src: [
      'src/assets/img/**/*.{jpg,jpeg,png,svg,gif}',
    ],
  },
}

function images(){
  return gulp.src(paths.images.src,{base: 'src'})
  .pipe(gulp.dest('./docs'))
  .pipe(gulp.dest('./dest'))
}

function contentImages(){
  return gulp.src(paths.contentImages.src,{basedir: './src/pug'})
  .pipe(gulp.dest('./docs'))
  .pipe(gulp.dest('./dest'))
}

function scripts() {
  return gulp.src(paths.scripts.src,{
    since: gulp.lastRun(scripts),
    base: 'src'
  })
  .pipe(plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(gulp.dest('./docs'))
  .pipe(gulp.dest('./dest'))
  .pipe(debug())
  .pipe(notify({
    onLast: true,
    title: 'Task running Gulp',
    message: 'script file compiled.',
    sound: 'Tink',
  }))
}

function styles(){
  return gulp.src(paths.styles.src)
  .pipe(plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(sass({
    outputStyle: 'compressed',
  }))
  .pipe(autoprefixer())
  .pipe(postcss([mqpacker()]))
  .pipe(gulp.dest('./docs/assets/css'))
  .pipe(entityconvert({ type: 'css' }))
  .pipe(gulp.dest('./dest/assets/css'))
  .pipe(debug())
  .pipe(notify({
    onLast: true,
    title: 'Task running Gulp',
    message: 'sass file compiled.',
    sound: 'Tink',
  }))
}

function pugs(){
  return gulp.src(paths.pug.src,{
    since: gulp.lastRun(pugs)
  })
  .pipe(plumber({
    errorHandler: notify.onError("Error: <%= error.message %>")
  }))
  .pipe(pug({
    pretty: '\t',
    basedir: './src/pug'
  }))
  .pipe(gulp.dest('./docs'))
  .pipe(gulp.dest('./dest'))
  .pipe(debug())
  .pipe(notify({
    onLast: true,
    title: 'Task running Gulp',
    message: 'pug file compiled.',
    sound: 'Tink',
  }))
}

function debug() {
  return eventstream.map(function (file, done) {
    console.log(file.path);
    done();
  });
}

const browserSyncOption = {
  server: {
    baseDir: './docs',
    index: 'index.html',
  },
  reloadOnRestart: true,
}

function server(done) {
  isFirstRun = false
  browserSync.init(browserSyncOption)
  done()
}

//
//監視ファイル
//
function browserReload(done) {
  browserSync.reload()
  done()
}

function watchFiles(done) {
  gulp.watch(paths.images.src, gulp.series(images, browserReload))
  gulp.watch(paths.contentImages.src, gulp.series(contentImages, browserReload))
  gulp.watch(paths.scripts.src, gulp.series(scripts, browserReload))
  gulp.watch(paths.styles.src, gulp.series(styles, browserReload))
  gulp.watch(paths.pug.src, gulp.series(pugs, browserReload))
}

const build = gulp.parallel(scripts, images, contentImages, styles, pugs)

exports.images = images
exports.contentImages = contentImages
exports.scripts = scripts
exports.styles = styles
exports.pugs = pugs
exports.default = gulp.series(build, server, watchFiles)
