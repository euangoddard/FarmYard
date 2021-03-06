// Regular NPM dependencies
var argv = require('minimist')(process.argv.slice(2));
var del = require('del');
var fs = require('fs');
var glob = require('glob').sync;
var path = require('path');

// Gulp dependencies
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var favicons = require('favicons');
var ghPages = require('gh-pages');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var inject = require('gulp-inject');
var insert = require('gulp-insert');
var ngAnnotate = require('gulp-ng-annotate');
var sass = require('gulp-sass');
var swPrecache = require('sw-precache');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');


var CONFIG = {
	intro:
		'(function (angular, _) {\n' +
		'    "use strict";\n',
	outro: '\n}(window.angular, window._));\n',
  is_release: !!argv.release
};


gulp.task('clean', function() {
  del.sync(['./dist', './tmp']);
});


gulp.task('copy-js-libs', function () {
	return gulp.src('./lib/**/*.js')
		.pipe(gulp.dest('./dist/js/lib'));
});


gulp.task('copy-images', function () {
  return gulp.src('./src/img/**/*.svg')
    .pipe(gulp.dest('./dist/img'));
});


gulp.task('copy-sounds', function () {
  return gulp.src(['./src/sounds/**/*.ogg', './src/sounds/**/*.m4a'])
    .pipe(gulp.dest('./dist/sounds'));
});


gulp.task('favicons', ['build-html'], function (done) {
  favicons({
    files: {
      src: 'src/img/leopard.png',
      dest: 'dist',
      html: './dist/index.html'
    },
    icons: {
      android: true,
      apple: true,
      appleStartup: false,
      coast: false,
      favicons: true,
      firefox: false,
      opengraph: true,
      windows: false,
      yandex: false
    },
    settings: {
      background: '#cccccc',
      appName: 'Menagerie',
      appDescription: 'An animal sounds game for young children',
      developer: 'Euan Goddard',
      index: 'index.html',
      url: 'https://menagerie.euans.space'
    }
  }, done);
});


gulp.task('copy-partials', function () {
  return gulp.src('./src/partials/**/*.html')
    .pipe(gulp.dest('./dist/partials'));
});


gulp.task('build-js', ['constants'], function () {
    return gulp.src(['./tmp/constants.js', './src/js/**/*.js'])
        .pipe(insert.prepend(CONFIG.intro))
        .pipe(insert.append(CONFIG.outro))
        .pipe(ngAnnotate())
        .pipe(concat('app.js'))
        .pipe(gulpif(CONFIG.is_release, uglify()))
        .pipe(gulp.dest('./dist/js'));
});


gulp.task('sass', ['constants'], function () {
  var output_style = CONFIG.is_release ? 'compressed' : 'expanded';

  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass({
      outputStyle: output_style,
      includePaths: [get_tmp_dir()],
      imagePath: '/img'
    }))
    .pipe(autoprefixer({browsers: [
    	'last 2 versions'
    ]}))
    .pipe(gulp.dest('./dist/css'));
});


gulp.task('constants', function (done) {
  var image_path = glob('./src/img/**/*.svg');
  var image_names = image_path.map(function (image_path) {
    return path.basename(image_path, '.svg');
  });
  var tmp_dir = get_tmp_dir();
  try {
    fs.mkdirSync(tmp_dir);
  }
  catch (e) {}

  var sass = '$animal-names: ' + image_names.join(', ') + ';';
  fs.writeFileSync(path.join(tmp_dir, '_constants.scss'), sass);

  var js = 'angular.module("menagerie.constants", []).constant("ANIMALS", ' + JSON.stringify(image_names) + ');';
  fs.writeFileSync(path.join(tmp_dir, 'constants.js'), js);
  done();
});

var get_tmp_dir = function () {
  return path.join(__dirname, 'tmp');
};


gulp.task('build-html', ['build-js', 'copy-js-libs', 'copy-partials', 'copy-sounds', 'sass'], function () {
  var target = gulp.src('./src/index.html');
  var sources = gulp.src([
    './dist/js/lib/angular.min.js',
    './dist/js/lib/**/*.js',
    './dist/js/**/*.js',
    './dist/css/**/*.css'
  ], {read: false});

  return target.pipe(inject(sources, {ignorePath: '/dist/'}))
    .pipe(gulp.dest('./dist'));
});


gulp.task('serve', function () {
  return gulp.src('./dist')
    .pipe(webserver({
      host: '0.0.0.0',
      livereload: true,
      port: 8000,
      directoryListing: false
    }));
});


gulp.task('generate-service-worker', ['build'], function (callback) {
  var fs = require('fs');
  var path = require('path');
  var swPrecache = require('sw-precache');
  var rootDir = 'dist';

  swPrecache({
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,svg,ogg}'],
    stripPrefix: rootDir
  }, function(error, swFileContents) {
    if (error) {
      return callback(error);
    }
    fs.writeFile(path.join(rootDir, 'service-worker.js'), swFileContents, callback);
  });
});

gulp.task('gh-pages', ['generate-service-worker', 'build', 'favicons'], function (callback) {
  fs.writeFileSync(path.join(__dirname, 'dist', 'CNAME'), 'menagerie.euans.space');
  ghPages.publish(path.join(__dirname, 'dist'), callback);
});


gulp.task('build', ['build-html', 'copy-images']);


gulp.task('watch', ['build'], function () {
    gulp.watch('./src/**/*', ['build']);
});


gulp.task('default', ['build']);
